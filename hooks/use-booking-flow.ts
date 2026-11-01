'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { useSession } from 'next-auth/react';
import type {
	CheckoutErrorCode,
	CheckoutResponse,
	CheckoutStartResponse,
	CurrentAvailabilitySlot,
	CustomerProviderCatalogItem,
	ExistingAppointmentCustomer,
	NewAppointmentCustomer,
	ProductListItemResponse,
	StartCheckout,
	SubmitCheckout,
} from '@opencals/storefront-sdk';
import type { CheckoutApiErrorBody } from '@/lib/api-error-handler';
import { saveHandoff } from '@/lib/payment-handoff';
import type { BookingStep } from '@/lib/booking-constants';
import { useCart } from '@/contexts/cart-context';
import { useLocation } from '@/contexts/location-context';
import { useDateFormatter } from '@/hooks/use-date-formatter';
import { useProductData } from '@/hooks/use-product-data';
import { useAvailability } from '@/hooks/use-availability';
import { useBookingAddOns } from '@/hooks/use-booking-add-ons';
import { useCheckoutQuestions } from '@/hooks/use-checkout-questions';
import { usePaymentProviders } from '@/hooks/use-payment-providers';

/**
 * Optional deep-link preselection (`/booking/<slug>?date=&staff=&location=`),
 * applied once on landing. Values that don't fit the class are ignored.
 */
export interface BookingPreselect {
	/** YYYY-MM-DD in the visitor's timezone. */
	date?: string | null;
	staffId?: string | null;
	locationId?: string | null;
}

/** A failed checkout call, with the API's machine-readable `code` (and `orderId` for an already placed cart). */
class CheckoutError extends Error {
	constructor(
		message: string,
		readonly code?: CheckoutErrorCode,
		readonly orderId?: string,
	) {
		super(message);
	}
}

const CHECKOUT_MESSAGES: Partial<Record<CheckoutErrorCode, string>> = {
	CART_EXPIRED: 'Your hold on that time ran out and someone else took the spot. Pick another time and you’re back in.',
	CHECKOUT_IN_PROGRESS: 'We’re still confirming your booking. Give it a moment, then try again.',
	PAYMENT_NOT_AUTHORIZED: 'Your card wasn’t authorised, so nothing was booked or charged. Check the details or try another card.',
};

async function checkoutError(res: Response, fallback: string): Promise<CheckoutError> {
	const data = (await res.json().catch(() => null)) as CheckoutApiErrorBody | null;
	const code = data?.code;
	return new CheckoutError((code && CHECKOUT_MESSAGES[code]) || data?.error || fallback, code, data?.orderId);
}

/** POST to /api/checkout/*. A 409 CHECKOUT_IN_PROGRESS (double click, second tab) is retried a few times. */
async function postCheckout<T>(url: string, headers: Record<string, string>, body: unknown, fallback: string): Promise<T> {
	for (let attempt = 0; ; attempt++) {
		const res = await fetch(url, { method: 'POST', headers, body: JSON.stringify(body) });
		if (res.ok) return (await res.json()) as T;
		const err = await checkoutError(res, fallback);
		if (err.code !== 'CHECKOUT_IN_PROGRESS' || attempt >= 3) throw err;
		await new Promise((r) => setTimeout(r, 1500 * (attempt + 1)));
	}
}

export function useBookingFlow(
	slug: string,
	initialProduct: ProductListItemResponse | null = null,
	preselect: BookingPreselect = {},
) {
	const router = useRouter();
	const { data: session } = useSession();
	const { cartId, setCart, clearCart, timeRemaining } = useCart();
	const { selectedLocationId: globalLocationId } = useLocation();
	const { formatCustom, formatTimeRange, timezone } = useDateFormatter();

	const productData = useProductData(slug, initialProduct);
	const { product, activeVariant, variants, hasVariants, selectedVariantId, setSelectedVariantId } = productData;

	// Selection
	const [selectedStaffId, setSelectedStaffId] = useState<string | null>(null);
	const [confirmedStaffId, setConfirmedStaffId] = useState<string | null>(null);
	const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null);
	const [attendees, setAttendees] = useState(1);

	// Customer
	const [customerId, setCustomerId] = useState<string | null>(null);
	const [email, setEmail] = useState('');
	const [firstName, setFirstName] = useState('');
	const [lastName, setLastName] = useState('');
	const prefilledRef = useRef(false);
	const preselectRef = useRef<BookingPreselect | null>(preselect);

	// Questions
	const [answers, setAnswers] = useState<Record<string, string>>({});

	// Payment
	const [provider, setProvider] = useState<CustomerProviderCatalogItem['name'] | null>(null);
	const [paymentData, setPaymentData] = useState<CheckoutStartResponse | null>(null);

	// Flow
	const [step, setStep] = useState<BookingStep>('when');
	const [committed, setCommitted] = useState(false);
	const [committedCartId, setCommittedCartId] = useState<string | null>(null);
	const [submitting, setSubmitting] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

	const finalStaffId = selectedStaffId ?? confirmedStaffId;
	const isExpired = timeRemaining !== null && timeRemaining <= 0;

	// Pre-fill customer from session
	useEffect(() => {
		if (session?.customer && !prefilledRef.current) {
			if (session.customer.id) setCustomerId(session.customer.id);
			if (session.customer.email) setEmail(session.customer.email);
			if (session.customer.firstName) setFirstName(session.customer.firstName);
			if (session.customer.lastName) setLastName(session.customer.lastName);
			prefilledRef.current = true;
		}
	}, [session]);

	// Payment providers (cart-aware) and checkout questions load in parallel via
	// SWR — no sequential fetch waterfall, and both dedupe across re-renders.
	const providers = usePaymentProviders(committedCartId ?? cartId);
	const questions = useCheckoutQuestions(slug || null);

	const staffForLocation = useMemo(() => {
		return (activeVariant?.staffMembers ?? []).filter((staff) => {
			if (!selectedLocationId) return true;
			const staffLocations = staff.locations;
			if (!staffLocations) return true;
			return staffLocations.some((l) => l.id === selectedLocationId);
		});
	}, [activeVariant?.staffMembers, selectedLocationId]);

	const availability = useAvailability({
		activeVariant,
		timezone,
		staffMemberId: selectedStaffId,
		locationId: selectedLocationId,
	});

	const slotStaff = useMemo(() => {
		if (!availability.selectedSlot) return [] as typeof staffForLocation;
		return staffForLocation.filter((s) => availability.selectedSlot!.staffMemberIds?.includes(s.id));
	}, [availability.selectedSlot, staffForLocation]);

	const whoSkipped = selectedStaffId !== null || slotStaff.length <= 1;

	const bookedDurationUnits = useMemo(() => {
		const baseDuration = activeVariant?.duration ?? product?.duration;
		if (!baseDuration || !availability.selectedSlot) return 1;
		const slot = availability.selectedSlot;
		const from = new Date(`${slot.fromDate}T${slot.fromTime}Z`);
		const to = new Date(`${slot.toDate}T${slot.toTime}Z`);
		const durationSeconds = (to.getTime() - from.getTime()) / 1000;
		return Math.max(1, Math.ceil(durationSeconds / baseDuration));
	}, [activeVariant?.duration, product?.duration, availability.selectedSlot]);

	const addOns = useBookingAddOns({
		activeVariant,
		locationId: selectedLocationId,
		staffMemberId: finalStaffId,
		bookedDurationUnits,
	});

	const cartHeaders = useCallback(
		(id?: string | null): Record<string, string> => {
			const h: Record<string, string> = { 'Content-Type': 'application/json' };
			const useId = id ?? committedCartId ?? cartId;
			if (useId) h['X-Cart-Id'] = useId;
			return h;
		},
		[cartId, committedCartId],
	);

	// Reset on variant switch. The first run applies the deep-link preselection.
	useEffect(() => {
		const pre = preselectRef.current ?? {};
		preselectRef.current = null;
		const variantStaff = activeVariant?.staffMembers ?? [];
		const preStaff = pre.staffId && variantStaff.some((s) => s.id === pre.staffId) ? pre.staffId : null;
		const preDate = pre.date && /^\d{4}-\d{2}-\d{2}$/.test(pre.date) ? pre.date : null;
		setSelectedStaffId(preStaff);
		setConfirmedStaffId(null);
		availability.setSelectedDate(preDate);
		setCommitted(false);
		setCommittedCartId(null);
		setProvider(null);
		setPaymentData(null);
		setStep('when');
		addOns.resetSelection();
		setAnswers({});

		const variantLocations = activeVariant?.locations ?? [];
		const preMatch = pre.locationId ? variantLocations.find((l) => l.id === pre.locationId) : undefined;
		const contextMatch = variantLocations.find((l) => l.id === globalLocationId);
		setSelectedLocationId(preMatch?.id ?? contextMatch?.id ?? variantLocations[0]?.id ?? null);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [selectedVariantId, globalLocationId]);

	// True while the selected date is the automatic "today" pick (see below).
	const autoDateRef = useRef(false);

	// Preselect today's date on landing (and after a variant/location reset) so the
	// slots load automatically without the student having to click a date. Uses the
	// same local-date string the day strip renders for its "today" card, so the
	// selection lines up with the highlighted first day.
	useEffect(() => {
		if (!activeVariant || availability.selectedDate) return;
		const d = new Date();
		const todayStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
		availability.setSelectedDate(todayStr);
		autoDateRef.current = true;
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [activeVariant, availability.selectedDate]);

	// Once the open days are known, move an auto-picked date that has nothing
	// open to the first day that does. A date the student (or a deep link) chose
	// is left alone.
	useEffect(() => {
		const dates = availability.availableDates;
		if (!dates || !autoDateRef.current) return;
		autoDateRef.current = false;
		const current = availability.selectedDate;
		if (current && dates.has(current)) return;
		const first = [...dates].sort().find((x) => !current || x >= current);
		if (first) availability.setSelectedDate(first);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [availability.availableDates, availability.selectedDate]);

	const handleDateSelect = useCallback(
		(date: string | null) => {
			availability.setSelectedDate(date);
			addOns.resetSelection();
		},
		[availability, addOns],
	);

	const handlePreSelectStaff = useCallback(
		(staffId: string | null) => {
			setSelectedStaffId(staffId);
			setConfirmedStaffId(null);
			availability.resetSlot();
			addOns.resetSelection();
		},
		[availability, addOns],
	);

	const handleSlotSelect = useCallback(
		(slot: CurrentAvailabilitySlot) => {
			availability.selectSlot(slot);
			setConfirmedStaffId(null);
			addOns.resetSelection();
			const eligibleStaff = staffForLocation.filter((s) => slot.staffMemberIds?.includes(s.id));
			const skipsWho = selectedStaffId !== null || eligibleStaff.length <= 1;
			setStep(skipsWho ? 'extras' : 'who');
		},
		[availability, addOns, staffForLocation, selectedStaffId],
	);

	const handleStaffConfirm = useCallback((staffId: string | null) => {
		setConfirmedStaffId(staffId);
		setStep('extras');
	}, []);

	// The extras step is skipped entirely when the service offers no add-ons.
	// Add-ons load asynchronously (they depend on the chosen slot/staff/location),
	// so we treat the step as skipped until a non-empty list has actually loaded.
	const extrasSkipped = !addOns.addOnsLoading && addOns.availableAddOns.length === 0;
	const stepAfterExtras: BookingStep = questions.length > 0 ? 'questions' : 'details';

	const handleContinueFromExtras = useCallback(() => {
		setStep(stepAfterExtras);
	}, [stepAfterExtras]);

	// Auto-advance past the extras step once we know the service has no add-ons,
	// so students never land on an empty "Add-ons" screen.
	useEffect(() => {
		if (step === 'extras' && extrasSkipped) {
			setStep(stepAfterExtras);
		}
	}, [step, extrasSkipped, stepAfterExtras]);

	const handleContinueFromQuestions = useCallback(() => {
		setStep('details');
	}, []);

	const customerPayload = useMemo((): ExistingAppointmentCustomer | NewAppointmentCustomer => {
		if (customerId) {
			return { kind: 'existing', customerId };
		}
		return {
			kind: 'new',
			email,
			firstName: firstName || undefined,
			lastName: lastName || undefined,
		};
	}, [customerId, email, firstName, lastName]);

	const handleSubmitDetails = useCallback(async () => {
		if (!activeVariant || !availability.selectedSlot) return;
		setSubmitting(true);
		setError(null);
		setFieldErrors({});

		try {
			const slot = availability.selectedSlot;
			const answerArray = Object.entries(answers)
				.filter(([, value]) => value != null && value !== '')
				.map(([questionId, value]) => {
					const q = questions.find((x) => x.id === questionId);
					const title = q?.translations?.[0]?.title ?? q?.internalName ?? '';
					return { questionId, question: title, answer: value };
				});

			const res = await fetch('/api/book', {
				method: 'POST',
				headers: cartHeaders(),
				body: JSON.stringify({
					slot: {
						productId: activeVariant.id,
						fromDate: slot.fromDate,
						fromTime: slot.fromTime,
						toDate: slot.toDate,
						toTime: slot.toTime,
						staffMemberId: finalStaffId ?? slot.staffMemberIds?.[0] ?? null,
						locationId: selectedLocationId ?? slot.locationIds?.[0] ?? null,
					},
					numberOfAttendees: attendees,
					addOns: Array.from(addOns.selectedAddOns.entries()).map(([addOnId, quantity]) => {
						const addOn = addOns.availableAddOns.find((a) => a.id === addOnId);
						return addOn?.durationMultiplied ? { addOnId } : { addOnId, quantity };
					}),
					customer: customerPayload,
					checkoutQuestionAnswers: answerArray,
				}),
			});

			if (!res.ok) {
				const data = await res.json().catch(() => null);
				if (data?.errors) setFieldErrors(data.errors);
				throw new Error(data?.error || 'Could not save your details');
			}

			const data = await res.json();
			if (data.cart) {
				setCart(data.cart);
				setCommittedCartId(data.cart.id ?? null);
			}
			setCommitted(true);
			setStep('payment');
		} catch (err: unknown) {
			setError(err instanceof Error ? err.message : 'Could not save your details');
		} finally {
			setSubmitting(false);
		}
	}, [
		activeVariant,
		availability.selectedSlot,
		attendees,
		cartHeaders,
		finalStaffId,
		selectedLocationId,
		addOns,
		answers,
		customerPayload,
		setCart,
	]);

	// The hold ran out and a time was taken: start over from the time picker with a fresh cart.
	const restartAfterExpiry = useCallback(() => {
		clearCart();
		setCommitted(false);
		setCommittedCartId(null);
		setProvider(null);
		setPaymentData(null);
		availability.resetSlot();
		setStep('when');
	}, [clearCart, availability]);

	const handleSubmitCheckout = useCallback(
		async (stripePaymentIntentId?: string, providerName?: CustomerProviderCatalogItem['name']): Promise<boolean> => {
			setSubmitting(true);
			setError(null);
			try {
				const submitPayload: SubmitCheckout = {
					appointmentsSettings: { markAsScheduled: true },
					...(stripePaymentIntentId ? { stripePaymentIntentId } : {}),
				};
				const data = await postCheckout<CheckoutResponse>(
					'/api/checkout/submit',
					cartHeaders(),
					submitPayload,
					'Checkout failed',
				);
				if (data.order?.id) {
					saveHandoff(data.order.id, {
						provider: data.paymentInstructions?.provider ?? providerName ?? provider,
						orderName: data.order.name ?? null,
						instructions: data.paymentInstructions ?? null,
					});
				}
				if (data.auth?.accessToken) {
					await signIn('checkout-token', {
						accessToken: data.auth.accessToken,
						refreshToken: data.auth.refreshToken,
						redirect: false,
					});
				}
				clearCart();
				router.push(`/thank-you?orderId=${data.order?.id ?? ''}`);
				return true;
			} catch (err: unknown) {
				if (err instanceof CheckoutError && err.code === 'CART_EXPIRED') restartAfterExpiry();
				// PAYMENT_NOT_AUTHORIZED leaves the card form up, so the student can pay again.
				setError(err instanceof Error ? err.message : 'Checkout failed');
				setSubmitting(false);
				return false;
			}
		},
		[cartHeaders, clearCart, router, provider, restartAfterExpiry],
	);

	const handleSelectProvider = useCallback(
		async (providerName: CustomerProviderCatalogItem['name']) => {
			setProvider(providerName);
			setError(null);
			setSubmitting(true);
			try {
				const startPayload: StartCheckout = { provider: providerName };
				if (customerId) {
					startPayload.customer = { kind: 'existing', customerId };
				}
				const data = await postCheckout<CheckoutStartResponse>('/api/checkout/start', cartHeaders(), startPayload, 'Could not start checkout');
				setPaymentData(data);

				// Route on the method's checkout mode, not its name: `internal` shows the card form, `redirect` leaves
				// for the provider, `manual` (cash, bank transfer, invoice) and `none` (nothing to pay) confirm right away.
				const mode: CustomerProviderCatalogItem['checkoutMode'] =
					data.provider === 'no_payment_required'
						? 'none'
						: (providers.find((p) => p.name === providerName)?.checkoutMode ?? (data.clientSecret ? 'internal' : 'manual'));
				if (mode === 'manual' || mode === 'none') {
					await handleSubmitCheckout(undefined, providerName);
					return;
				}
				if (mode === 'redirect') {
					if (!data.redirectUrl) throw new Error('We couldn’t reach the payment page. Try again, or pick another way to pay.');
					window.location.href = data.redirectUrl;
					return;
				}
				if (!data.clientSecret) throw new Error('The card form didn’t load. Try again, or pick another way to pay.');
				setSubmitting(false);
			} catch (err: unknown) {
				if (err instanceof CheckoutError && err.code === 'CART_ALREADY_CHECKED_OUT') {
					// This cart is already a booking: submitting again returns it (and signs the student in). If that
					// fails too, open the booking's confirmation directly.
					if (!(await handleSubmitCheckout(undefined, providerName)) && err.orderId) {
						clearCart();
						router.push(`/thank-you?orderId=${encodeURIComponent(err.orderId)}`);
					}
					return;
				}
				if (err instanceof CheckoutError && err.code === 'CART_EXPIRED') restartAfterExpiry();
				setError(err instanceof Error ? err.message : 'Could not start checkout');
				setProvider(null);
				setSubmitting(false);
			}
		},
		[cartHeaders, customerId, handleSubmitCheckout, providers, restartAfterExpiry, clearCart, router],
	);

	const goToStep = useCallback((target: BookingStep) => {
		setStep(target);
	}, []);

	const questionsSkipped = questions.length === 0;

	const canEnter = useCallback(
		(target: BookingStep): boolean => {
			if (target === 'when') return true;
			if (target === 'who') return !!availability.selectedSlot && !whoSkipped;
			const slotAndStaffReady = !!availability.selectedSlot && (whoSkipped || !!confirmedStaffId);
			if (target === 'extras') return slotAndStaffReady;
			if (target === 'questions') return slotAndStaffReady && !questionsSkipped;
			if (target === 'details') return slotAndStaffReady;
			if (target === 'payment') return slotAndStaffReady && committed;
			return false;
		},
		[availability.selectedSlot, whoSkipped, confirmedStaffId, committed, questionsSkipped],
	);

	const stepCompleted = useMemo<Record<BookingStep, boolean>>(
		() => ({
			when: !!availability.selectedSlot,
			who: whoSkipped || !!confirmedStaffId,
			extras: extrasSkipped || (step !== 'when' && step !== 'who' && step !== 'extras'),
			questions: questionsSkipped || step === 'details' || step === 'payment',
			details: committed,
			payment: false,
		}),
		[availability.selectedSlot, whoSkipped, confirmedStaffId, step, committed, questionsSkipped, extrasSkipped],
	);

	const questionsValid = questions.every((q) => {
		if (!q.required) return true;
		const v = answers[q.id];
		if (q.type === 'checkbox') return v === 'true';
		return v != null && v.trim().length > 0;
	});

	const detailsValid = email.trim().length > 0;

	return {
		// Product
		product,
		activeVariant,
		variants,
		hasVariants,
		selectedVariantId,
		setSelectedVariantId,
		loading: productData.loading,
		error: error ?? productData.error,
		setError,
		fieldErrors,

		// Staff & location
		selectedStaffId,
		setSelectedStaffId: handlePreSelectStaff,
		confirmedStaffId,
		setConfirmedStaffId: handleStaffConfirm,
		selectedLocationId,
		setSelectedLocationId,
		finalStaffId,
		staffForLocation,
		slotStaff,
		whoSkipped,

		// Availability
		selectedDate: availability.selectedDate,
		setSelectedDate: handleDateSelect,
		slots: availability.slots,
		slotsLoading: availability.slotsLoading,
		availableDates: availability.availableDates,
		selectedSlot: availability.selectedSlot,
		handleSlotSelect,

		// Attendees
		attendees,
		setAttendees,

		// Add-ons
		availableAddOns: addOns.availableAddOns,
		addOnsLoading: addOns.addOnsLoading,
		selectedAddOns: addOns.selectedAddOns,
		addOnsTotal: addOns.addOnsTotal,
		updateAddOnQuantity: addOns.updateQuantity,
		bookedDurationUnits,
		extrasSkipped,
		handleContinueFromExtras,

		// Customer
		email,
		setEmail,
		firstName,
		setFirstName,
		lastName,
		setLastName,
		customerId,

		// Questions
		questions,
		questionsSkipped,
		questionsValid,
		answers,
		setAnswers,
		handleContinueFromQuestions,

		// Details submit
		detailsValid,
		handleSubmitDetails,

		// Payment
		providers,
		provider,
		paymentData,
		handleSelectProvider,
		handleSubmitCheckout,

		// Flow
		step,
		setStep,
		goToStep,
		canEnter,
		stepCompleted,
		committed,
		submitting,
		isExpired,

		// Formatting
		formatCustom,
		formatTimeRange,
		timezone,
	};
}
