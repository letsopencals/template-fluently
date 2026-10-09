import type { OrderDetailAppointment } from '@opencals/storefront-sdk';
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
}

export function toConfirmedBooking(a: OrderDetailAppointment): ConfirmedBooking {
	return {
		...getBookingMeta(a),
		id: a.id,
		image: getProductImage(a.product),
		from: a.from,
		to: a.to,
		status: (a.status ?? '').toLowerCase(),
	};
}
