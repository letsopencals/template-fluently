import type { OrderDetailAppointment, StorefrontAppointmentPendingReason } from '@opencals/storefront-sdk';
import { getProductImage } from '@/lib/format';
import { getBookingMeta, type BookingMeta } from '@/components/account/booking-meta';

/** Display model for one confirmed lesson on /thank-you. */
export interface ConfirmedBooking extends BookingMeta {
	id: string;
	image: string | null;
	/** UTC ISO instants of the slot. */
	from: string;
	to: string;
	status: string;
	/** Why it waits ('awaiting_payment' / 'awaiting_approval'), or null when it's confirmed. */
	awaiting: StorefrontAppointmentPendingReason | null;
}

/**
 * Only a pending lesson WITH a reason waits. Right after checkout a lesson at a school that confirms everything is
 * briefly pending with no reason while a background job confirms it: that one counts as booked.
 */
export function awaitingOf(a: Pick<OrderDetailAppointment, 'status' | 'pendingReason'>): StorefrontAppointmentPendingReason | null {
	if ((a.status ?? '').toLowerCase() !== 'pending') return null;
	return a.pendingReason === 'awaiting_payment' || a.pendingReason === 'awaiting_approval' ? a.pendingReason : null;
}

export function toConfirmedBooking(a: OrderDetailAppointment): ConfirmedBooking {
	return {
		...getBookingMeta(a),
		id: a.id,
		image: getProductImage(a.product),
		from: a.from,
		to: a.to,
		status: (a.status ?? '').toLowerCase(),
		awaiting: awaitingOf(a),
	};
}
