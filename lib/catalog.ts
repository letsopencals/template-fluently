import type {
	ProductCollectionResponse,
	ProductListItemResponse,
	StaffMemberListItemResponse,
} from '@opencals/storefront-sdk';
import { siteConfig } from '@/lib/site-config';
import { getListItemGallery } from '@/lib/format';

/**
 * The school's catalog model, derived from storefront API data. Pure functions
 * (no fetching), so both RSCs and client components can use them.
 *
 * - A **subject** is a visible product collection (a language here), except
 *   the special `siteConfig.collections.starter` collection.
 * - A **class** is a product group; its variants are levels (group classes) or
 *   lengths (private lessons).
 * - The **format** comes from the data, not from slugs: a class with
 *   `maxAttendees > 1` is a group (online when every location is online,
 *   otherwise on campus); a 1-seat class is private, or a free trial when it
 *   costs nothing.
 */

export type ClassFormat = 'campus' | 'online' | 'private' | 'trial';

export const FORMAT_LABELS: Record<ClassFormat, string> = {
	campus: 'In-person group',
	online: 'Live online group',
	private: 'Private 1:1',
	trial: 'Free trial',
};

type ProductLike = Pick<ProductListItemResponse, 'maxAttendees' | 'price'> & {
	locations?: Array<{ type?: string | null }> | null;
	variants?: Array<{ locations?: Array<{ type?: string | null }> | null }> | null;
};

/** Every location the class (any variant) can be booked at. */
function locationTypes(p: ProductLike): string[] {
	const all = [...(p.locations ?? []), ...(p.variants ?? []).flatMap((v) => v.locations ?? [])];
	return [...new Set(all.map((l) => l.type ?? ''))].filter(Boolean);
}

export function isGroup(p: Pick<ProductListItemResponse, 'maxAttendees'>): boolean {
	return (p.maxAttendees ?? 1) > 1;
}

export function classFormat(p: ProductLike): ClassFormat {
	if (isGroup(p)) {
		const types = locationTypes(p);
		return types.length > 0 && types.every((t) => t === siteConfig.locationTypes.online) ? 'online' : 'campus';
	}
	return (p.price ?? 0) === 0 ? 'trial' : 'private';
}

/** True when the class can be taken online (any online location). */
export function hasOnline(p: ProductLike): boolean {
	return locationTypes(p).includes(siteConfig.locationTypes.online);
}

/** True when the class can be taken on campus (any physical location). */
export function hasCampus(p: ProductLike): boolean {
	return locationTypes(p).includes(siteConfig.locationTypes.physical);
}

export interface Subject {
	slug: string;
	title: string;
	description: string;
	/** Dashboard color of the subject's first class (drives the swatch). */
	color: string | null;
	/** A class image to represent the subject, or null. */
	image: string | null;
	/** Product group keys (`productId`) in this subject. */
	groupKeys: string[];
}

/** The product group key shared by a group and its variants. */
export function groupKey(p: { productId?: string | null; id: string }): string {
	return p.productId || p.id;
}

/**
 * Collections → subjects, in collection order. `products` is the catalog list,
 * used to pick a representative image (a campus group class first).
 */
export function toSubjects(
	collections: ProductCollectionResponse[],
	products: ProductListItemResponse[],
): Subject[] {
	return collections
		.filter((c) => c.isVisible !== false && c.slug !== siteConfig.collections.starter)
		.map((c) => {
			const keys = [...new Set((c.products ?? []).map((p) => groupKey(p)))];
			const groups = products.filter((p) => keys.includes(groupKey(p)));
			const order: ClassFormat[] = ['campus', 'online', 'private', 'trial'];
			const pick = [...groups].sort((a, b) => order.indexOf(classFormat(a)) - order.indexOf(classFormat(b)))[0];
			return {
				slug: c.slug,
				title: c.title,
				description: c.description ?? '',
				color: (c.products ?? [])[0]?.color ?? pick?.color ?? null,
				image: pick ? (getListItemGallery(pick)[0] ?? null) : null,
				groupKeys: keys,
			};
		})
		.filter((s) => s.groupKeys.length > 0);
}

export function subjectOf(product: { productId?: string | null; id: string }, subjects: Subject[]): Subject | null {
	const key = groupKey(product);
	return subjects.find((s) => s.groupKeys.includes(key)) ?? null;
}

export interface Teacher {
	id: string;
	slug: string;
	name: string;
	firstName: string;
	image: string | null;
	/** Subjects the teacher teaches (via the classes they are assigned to). */
	subjects: Subject[];
	online: boolean;
	/** Campus titles (physical locations). */
	campuses: string[];
	/** Product group keys the teacher teaches. */
	groupKeys: string[];
}

export function toTeachers(staff: StaffMemberListItemResponse[], subjects: Subject[]): Teacher[] {
	return staff.map((s) => {
		const keys = [...new Set((s.products ?? []).map((p) => groupKey(p)))];
		const teaches = subjects.filter((sub) => sub.groupKeys.some((k) => keys.includes(k)));
		const locations = s.locations ?? [];
		return {
			id: s.id,
			slug: s.slug,
			name: [s.firstName, s.lastName].filter(Boolean).join(' '),
			firstName: s.firstName,
			image: s.image?.url ?? null,
			subjects: teaches,
			online: locations.some((l) => l.type === siteConfig.locationTypes.online),
			campuses: locations
				.filter((l) => l.type === siteConfig.locationTypes.physical)
				.map((l) => l.title ?? '')
				.filter(Boolean),
			groupKeys: keys,
		};
	});
}

/**
 * Pulls a CEFR-like level code ("A1", "B2") out of a variant title such as
 * "Beginner · A1". Null when the title has none (e.g. private lesson lengths).
 */
export function levelCode(title: string | null | undefined): string | null {
	const m = title?.match(/\b([ABC][12])\b/);
	return m?.[1] ?? null;
}

/** Lowest variant price of a class (its "from" price). */
export function fromPrice(p: ProductListItemResponse): number {
	const prices = (p.variants ?? []).map((v) => v.price).filter((n): n is number => typeof n === 'number');
	return prices.length ? Math.min(...prices) : p.price;
}
