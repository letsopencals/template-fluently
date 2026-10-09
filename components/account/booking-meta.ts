import { siteConfig } from '@/lib/site-config';

/**
 * Turns an appointment (list, detail or order-embedded) into the facts the
 * account pages show for a lesson: who teaches it, whether it's online (and
 * the classroom link), the campus address, and where "Book again" goes.
 *
 * Online vs campus comes from the booked location's `type`; the join link is
 * that location's `link`, so a school sets it once on its Online location in
 * the dashboard.
 */

interface AddressFields {
	addressLine1?: string | null;
	addressLine2?: string | null;
	city?: string | null;
	state?: string | null;
	postalCode?: string | null;
	country?: string | null;
	displayAddress?: string | null;
}

/** Structural subset shared by the SDK's appointment list, detail and order shapes. */
export interface AppointmentLike {
	from: string;
	to: string;
	numberOfAttendees?: number | null;
	staffMember?: {
		firstName?: string | null;
		lastName?: string | null;
		slug?: string | null;
		image?: { url?: string | null } | null;
	} | null;
	product?: {
		title?: string | null;
		variantTitle?: string | null;
		slug?: string | null;
		color?: string | null;
		maxAttendees?: number | null;
		price?: number | null;
	} | null;
	location?: (AddressFields & {
		title?: string | null;
		type?: string | null;
		link?: string | null;
		address?: string | null;
	}) | null;
}

export interface BookingMeta {
	title: string;
	/** Level or length variant, e.g. "Beginner · A1" or "45 min · 1:1". */
	variant: string | null;
	/** "Group class" | "Private lesson" | "Free trial". */
	kindLabel: string;
	teacher: string | null;
	teacherFirstName: string | null;
	teacherImage: string | null;
	teacherSlug: string | null;
	isOnline: boolean;
	/** Online classroom link, when the location has one. */
	joinUrl: string | null;
	locationTitle: string | null;
	address: string | null;
	color: string | null;
	/** Where "Book again" should go. */
	bookAgainHref: string | null;
}

function joinAddress(a: AddressFields | null | undefined): string | null {
	if (!a) return null;
	if (a.displayAddress) return a.displayAddress;
	const parts = [a.addressLine1, a.addressLine2, a.city, a.state, a.postalCode].filter(Boolean);
	return parts.length ? parts.join(', ') : null;
}

function lessonKind(product: AppointmentLike['product']): string {
	if ((product?.maxAttendees ?? 1) > 1) return 'Group class';
	if ((product?.price ?? 0) === 0) return 'Free trial';
	return 'Private lesson';
}

export function getBookingMeta(appt: AppointmentLike): BookingMeta {
	const staff = appt.staffMember;
	const teacher = staff ? [staff.firstName, staff.lastName].filter(Boolean).join(' ') || null : null;
	const isOnline = appt.location?.type === siteConfig.locationTypes.online;
	const slug = appt.product?.slug ?? null;

	return {
		title: appt.product?.title ?? 'Lesson',
		variant: appt.product?.variantTitle || null,
		kindLabel: lessonKind(appt.product),
		teacher,
		teacherFirstName: staff?.firstName ?? null,
		teacherImage: staff?.image?.url ?? null,
		teacherSlug: staff?.slug ?? null,
		isOnline,
		joinUrl: isOnline ? appt.location?.link || null : null,
		locationTitle: appt.location?.title ?? null,
		address: isOnline ? null : joinAddress(appt.location) ?? appt.location?.address ?? null,
		color: appt.product?.color ?? null,
		bookAgainHref: slug ? `/booking/${encodeURIComponent(slug)}` : null,
	};
}

export type JoinState = 'early' | 'open' | 'ended';

/**
 * Whether the "Join lesson" button is live: from `joinWindowMinutes` before the
 * start until the lesson ends.
 */
export function getJoinState(from: string, to: string, now: number = Date.now()): JoinState {
	const opensAt = Date.parse(from) - siteConfig.joinWindowMinutes * 60_000;
	if (now < opensAt) return 'early';
	if (now > Date.parse(to)) return 'ended';
	return 'open';
}
