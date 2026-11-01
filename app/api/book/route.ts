import '@/lib/opencals';
import {
	AppointmentService,
	CartService,
	type AppointmentDateRangeSlot,
	type CheckoutQuestionAnswer,
	type CreateAppointment,
	type CreateAppointmentAddOn,
	type ExistingAppointmentCustomer,
	type NewAppointmentCustomer,
} from '@opencals/storefront-sdk';
import { getAccessToken } from '@/lib/api-auth';
import { NextRequest, NextResponse } from 'next/server';
import { handleApiError } from '@/lib/api-error-handler';
import { publicPayload } from '@/lib/public-payload';

/** Rebuilds the customer from the fields the API takes (`kind` picks the shape; the body is client input). */
function toAppointmentCustomer(customer: ExistingAppointmentCustomer | NewAppointmentCustomer): CreateAppointment['customer'] {
	if (customer.kind === 'existing' && customer.customerId) return { customerId: customer.customerId };
	const fresh: Partial<NewAppointmentCustomer> = 'email' in customer ? customer : {};
	const email = fresh.email ?? '';
	return { externalId: email, email, firstName: fresh.firstName, lastName: fresh.lastName };
}

export async function POST(request: NextRequest) {
	const cartIdHeader = request.headers.get('X-Cart-Id') ?? '';

	try {
		const body = await request.json();
		const { slot, numberOfAttendees, addOns, customer, checkoutQuestionAnswers } = body as {
			slot: AppointmentDateRangeSlot;
			numberOfAttendees?: number;
			addOns?: CreateAppointmentAddOn[];
			customer?: ExistingAppointmentCustomer | NewAppointmentCustomer;
			checkoutQuestionAnswers?: CheckoutQuestionAnswer[];
		};

		if (!slot?.productId || !slot?.fromDate || !slot?.fromTime || !slot?.toDate || !slot?.toTime) {
			return NextResponse.json({ error: 'Invalid slot data' }, { status: 400 });
		}

		const token = await getAccessToken();
		const authHeaders = { Authorization: `Bearer ${token ?? ''}` };

		const { data: cart } = await CartService.createOrGet({
			headers: { ...authHeaders, 'X-Cart-Id': cartIdHeader },
			throwOnError: true,
		});

		const { data: appointment } = await AppointmentService.create({
			body: {
				slot: {
					productId: slot.productId,
					fromDate: slot.fromDate,
					fromTime: slot.fromTime,
					toDate: slot.toDate,
					toTime: slot.toTime,
					staffMemberId: slot.staffMemberId ?? null,
					locationId: slot.locationId ?? null,
				},
				numberOfAttendees: numberOfAttendees ?? 1,
				cartId: cart.id,
				addOns: (addOns ?? [])
					.filter((a) => a?.addOnId)
					.map((a) => ({
						addOnId: a.addOnId,
						...(typeof a.quantity === 'number' ? { quantity: a.quantity } : {}),
					})),
				...(customer ? { customer: toAppointmentCustomer(customer) } : {}),
				...(checkoutQuestionAnswers && checkoutQuestionAnswers.length > 0
					? { checkoutQuestionAnswers }
					: {}),
			},
			headers: authHeaders,
			throwOnError: true,
		});

		const { data: finalCart } = await CartService.get({
			headers: { ...authHeaders, 'X-Cart-Id': cart.id },
			throwOnError: true,
		});

		return NextResponse.json(publicPayload({ appointment, cart: finalCart }));
	} catch (err) {
		return handleApiError(err);
	}
}
