import '@/lib/opencals';
import {
	AppointmentService,
	CartService,
	type AppointmentDateRangeSlot,
	type CheckoutQuestionAnswer,
	type CreateAppointment,
	type CreateAppointmentAddOn,
	type ExistingOrderCustomer,
	type NewOrderCustomer,
} from '@opencals/storefront-sdk';
import { getAccessToken } from '@/lib/api-auth';
import { NextRequest, NextResponse } from 'next/server';
import { handleApiError } from '@/lib/api-error-handler';
import { publicPayload } from '@/lib/public-payload';

/** The booking form sends the checkout customer shape (`kind` picks it); appointments take it without `kind`. */
function toAppointmentCustomer(customer: ExistingOrderCustomer | NewOrderCustomer): CreateAppointment['customer'] {
	if (customer.kind === 'existing' && customer.customerId) return { customerId: customer.customerId };
	const email = 'email' in customer ? customer.email : '';
	return { externalId: email ?? '', email: email ?? '', firstName: customer.firstName, lastName: customer.lastName };
}

export async function POST(request: NextRequest) {
	const cartIdHeader = request.headers.get('X-Cart-Id') ?? '';

	try {
		const body = await request.json();
		const { slot, numberOfAttendees, addOns, customer, checkoutQuestionAnswers } = body as {
			slot: AppointmentDateRangeSlot;
			numberOfAttendees?: number;
			addOns?: CreateAppointmentAddOn[];
			customer?: ExistingOrderCustomer | NewOrderCustomer;
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
