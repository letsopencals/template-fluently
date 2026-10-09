import '@/lib/opencals';
import { cache } from 'react';
import { unstable_cache } from 'next/cache';
import {
	StoreService,
	ProductService,
	ProductCollectionService,
	StaffMemberService,
	LocationService,
	type StorePublicSettings,
	type ProductListItemResponse,
	type ProductCollectionResponse,
	type StaffMemberListItemResponse,
	type LocationDetailResponse,
	type CurrentAvailabilitySlot,
} from '@opencals/storefront-sdk';
import { publicPayload } from '@/lib/public-payload';
import { siteConfig } from '@/lib/site-config';
import {
	classFormat,
	isGroup,
	subjectOf,
	toSubjects,
	toTeachers,
	type ClassFormat,
	type Subject,
	type Teacher,
} from '@/lib/catalog';

/**
 * Server-only data readers. Each is wrapped in React.cache() so repeated calls
 * within a single request are deduped. RSCs call these directly instead of
 * going through the template's own /api/* routes. Never import this module from
 * a 'use client' file — the /api/* routes remain the client/SWR data source.
 * Catalog reads pass through `publicPayload`, so staff contact fields never reach
 * RSC props.
 */

export const getStoreSettings = cache(async (): Promise<StorePublicSettings | null> => {
	try {
		const { data } = await StoreService.getStorePublicSettings();
		return data ?? null;
	} catch {
		return null;
	}
});

/**
 * The store's logo and banner (cover), as set under Storefront customisation in
 * the dashboard. Null when not set or the settings can't be loaded.
 */
export function storeImages(settings: StorePublicSettings | null): { logo: string | null; banner: string | null } {
	const s = settings?.storefrontSettings;
	return { logo: s?.logoImage?.url ?? null, banner: s?.bannerImage?.url ?? null };
}

/** Every class (product group with its variants). Empty on failure. */
export const getProducts = cache(async (locationId?: string): Promise<ProductListItemResponse[]> => {
	try {
		const { data } = await ProductService.list({ query: { take: 100, locationId } });
		return publicPayload(data?.data ?? []);
	} catch {
		return [];
	}
});

/**
 * The booking flow needs each variant's `staffMembers` (with their `locations`)
 * and `locations` — that richer shape lives on the list response, not the
 * leaner `getBySlug` detail. So we take the catalog and return the group that
 * owns the requested slug (the group's own slug or one of its variant slugs).
 * Mirrors `app/api/products/[slug]/route.ts`.
 */
export const getProduct = cache(async (slug: string): Promise<ProductListItemResponse | null> => {
	const items = await getProducts();
	return items.find((item) => item.slug === slug || item.variants?.some((v) => v.slug === slug)) ?? null;
});

/** All visible collections (with their product references). Empty on failure. */
export const getCollections = cache(async (): Promise<ProductCollectionResponse[]> => {
	try {
		const { data } = await ProductCollectionService.list({ query: { take: 50 } });
		return publicPayload(data?.data ?? []);
	} catch {
		return [];
	}
});

export const getStaff = cache(async (): Promise<StaffMemberListItemResponse[]> => {
	try {
		const { data } = await StaffMemberService.list({ query: { take: 50 } });
		return publicPayload(data?.data ?? []);
	} catch {
		return [];
	}
});

export const getLocations = cache(async (): Promise<LocationDetailResponse[]> => {
	try {
		const { data } = await LocationService.list({ query: { take: 50 } });
		return publicPayload(data?.data ?? []);
	} catch {
		return [];
	}
});

/** Subjects (languages) from collections, in collection order. */
export const getSubjects = cache(async (): Promise<Subject[]> => {
	const [collections, products] = await Promise.all([getCollections(), getProducts()]);
	return toSubjects(collections, products);
});

/** One subject by collection slug, or null. */
export const getSubject = cache(async (slug: string): Promise<Subject | null> => {
	const subjects = await getSubjects();
	return subjects.find((s) => s.slug === slug) ?? null;
});

/** Teachers (staff) with the subjects they teach, sorted by first name. */
export const getTeachers = cache(async (): Promise<Teacher[]> => {
	const [staff, subjects] = await Promise.all([getStaff(), getSubjects()]);
	return toTeachers(staff, subjects).sort((a, b) => a.name.localeCompare(b.name));
});

export const getTeacher = cache(async (slug: string): Promise<Teacher | null> => {
	const teachers = await getTeachers();
	return teachers.find((t) => t.slug === slug) ?? null;
});

/** The "start here" classes (trial, conversation club), in collection order. */
export const getStarterClasses = cache(async (): Promise<ProductListItemResponse[]> => {
	const [collections, products] = await Promise.all([getCollections(), getProducts()]);
	const starter = collections.find((c) => c.slug === siteConfig.collections.starter);
	const keys = (starter?.products ?? []).map((p) => p.productId || p.id);
	return products.filter((p) => keys.includes(p.productId || p.id));
});

/* ---------------------------------------------------------------- Timetable */

/** One scheduled group session, ready to render. Dates are UTC ISO strings. */
export interface TimetableSession {
	key: string;
	variantSlug: string;
	title: string;
	level: string;
	format: ClassFormat;
	subjectTitle: string | null;
	color: string | null;
	start: string;
	end: string;
	spotsLeft: number;
	maxAttendees: number;
	teacherIds: string[];
}

const TIMETABLE_DAYS = 7;
/** Parallel availability calls. The storefront API allows 20 requests per second per key + IP. */
const CONCURRENCY = 6;

async function mapLimit<T, R>(items: T[], limit: number, fn: (item: T) => Promise<R>): Promise<R[]> {
	const out: R[] = new Array(items.length);
	let next = 0;
	async function worker() {
		while (next < items.length) {
			const i = next++;
			out[i] = await fn(items[i] as T);
		}
	}
	await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
	return out;
}

function toUtc(date: string, time: string): number {
	return Date.parse(`${date}T${time}Z`);
}

async function loadTimetable(): Promise<TimetableSession[]> {
	const [products, subjects] = await Promise.all([getProducts(), getSubjects()]);
	const variants = products
		.filter(isGroup)
		.flatMap((group) =>
			(group.variants ?? []).filter(isGroup).map((variant) => ({ group, variant })),
		);

	const now = Date.now();
	const horizon = now + TIMETABLE_DAYS * 86_400_000;

	const perVariant = await mapLimit(variants, CONCURRENCY, async ({ group, variant }) => {
		try {
			// One call returns the whole booking horizon, so a week costs one request per level.
			const { data } = await ProductService.getCurrentAvailabilitiesMerged({ path: { productId: variant.id } });
			const slots: CurrentAvailabilitySlot[] = Array.isArray(data) ? data : [];
			const subject = subjectOf(group, subjects);
			// Two teachers can each run the same class at the same time; show one
			// pill per start time with the most seats still free.
			const byStart = new Map<number, TimetableSession>();
			for (const slot of slots) {
				const start = toUtc(slot.fromDate, slot.fromTime);
				if (start < now || start > horizon) continue;
				const max = slot.maxAttendees ?? variant.maxAttendees ?? 1;
				const spotsLeft = Math.max(0, max - (slot.attendees ?? 0));
				const prev = byStart.get(start);
				if (prev && prev.spotsLeft >= spotsLeft) continue;
				byStart.set(start, {
					key: `${variant.id}-${start}`,
					variantSlug: variant.slug,
					title: group.title,
					level: variant.variantTitle ?? '',
					format: classFormat(group),
					subjectTitle: subject?.title ?? null,
					color: variant.color ?? group.color ?? subject?.color ?? null,
					start: new Date(start).toISOString(),
					end: new Date(toUtc(slot.toDate, slot.toTime)).toISOString(),
					spotsLeft,
					maxAttendees: max,
					teacherIds: slot.staffMemberIds ?? [],
				});
			}
			return [...byStart.values()];
		} catch {
			return [];
		}
	});

	return perVariant.flat().sort((a, b) => a.start.localeCompare(b.start));
}

/**
 * Upcoming group sessions for the next 7 days, across every group class.
 * Cached for 5 minutes across requests (one fan-out serves every visitor),
 * because it costs one availability request per class level.
 */
export const getTimetable = cache(
	unstable_cache(loadTimetable, ['fluently-timetable'], { revalidate: 300 }),
);
