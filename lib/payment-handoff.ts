import type { PaymentInstructions } from '@opencals/storefront-sdk';

/**
 * What checkout knows about paying that the order itself doesn't: the method the student picked and, for bank
 * transfer or "pay by invoice", the instructions only `checkout/submit` returns. Kept in sessionStorage per order so
 * /thank-you can show them (and still show them after a reload in the same tab). Another device gets the email.
 */
export interface PaymentHandoff {
	provider: string | null;
	/** Order number, for the bank transfer reference. */
	orderName?: string | null;
	instructions: PaymentInstructions | null;
}

const key = (orderId: string) => `fluently:payment:${orderId}`;

export function saveHandoff(orderId: string, handoff: PaymentHandoff): void {
	try {
		sessionStorage.setItem(key(orderId), JSON.stringify(handoff));
	} catch {
		// Storage blocked or full: the thank-you page falls back to "check your email".
	}
}

export function readHandoff(orderId: string | null): PaymentHandoff | null {
	if (!orderId) return null;
	try {
		const raw = sessionStorage.getItem(key(orderId));
		return raw ? (JSON.parse(raw) as PaymentHandoff) : null;
	} catch {
		return null;
	}
}
