'use client';

import type { PaymentInstructions } from '@opencals/storefront-sdk';
import { useDateFormatter } from '@/hooks/use-date-formatter';
import { formatPrice } from '@/lib/format';
import { buttonClasses } from '@/components/ui/button';

interface HowToPayProps {
	/** Method picked at checkout, when this tab knows it. */
	provider: string | null;
	instructions: PaymentInstructions | null;
	/** Still to pay, major units; null when the order couldn't be read (the student isn't signed in). */
	due: number | null;
	currency: string;
	orderName: string;
	/** Pay-by deadline when the instructions are gone (from the order). */
	dueAt: string | null;
}

function Line({ label, value }: { label: string; value: string }) {
	return (
		<div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-0.5 py-2.5 text-sm">
			<span className="text-[var(--color-ink-muted)]">{label}</span>
			<span className="tabular break-all font-semibold text-[var(--color-ink)]">{value}</span>
		</div>
	);
}

/**
 * How to pay a lesson booked with bank transfer or "pay by invoice": the account to pay into or the invoice link,
 * and the deadline. Cash needs nothing here (the payment card says "pay at the school"). Without the details (a
 * reload elsewhere) it points to the email, which has them.
 */
export function HowToPay({ provider, instructions, due, currency, orderName, dueAt }: HowToPayProps) {
	const { formatCustom } = useDateFormatter();
	const method = instructions?.provider ?? provider;
	if ((due !== null && due <= 0) || method === 'cash' || method === 'stripe' || method === 'no_payment_required') return null;

	const bank = instructions?.bankDetails ?? null;
	const invoice = instructions?.hostedInvoiceUrl?.startsWith('https://') ? instructions.hostedInvoiceUrl : null;
	const deadline = instructions?.dueAt ?? dueAt;
	const payBy = deadline ? formatCustom(deadline, 'ddd, MMM D [at] h:mm A') : null;

	return (
		<div className="rounded-[28px] border-2 border-[var(--color-ink)] bg-[var(--color-surface)] px-6 py-5">
			<span className="sticker-sm inline-block -rotate-2 rounded-full bg-[var(--color-sun)] px-3 py-1 text-xs font-bold">
				{payBy ? `Pay by ${payBy}` : 'Still to pay'}
			</span>
			<p className="mt-3 font-[family-name:var(--font-display)] text-lg font-semibold">
				{method === 'stripe_invoice' ? 'Pay your invoice' : method === 'bank_transfer' ? 'Pay by bank transfer' : 'How to pay'}
			</p>

			{bank ? (
				<div className="mt-2 divide-y divide-[var(--color-line)]">
					{due !== null ? <Line label="Amount" value={formatPrice(due, currency)} /> : null}
					{bank.accountName ? <Line label="Account name" value={bank.accountName} /> : null}
					{bank.bankName ? <Line label="Bank" value={bank.bankName} /> : null}
					{bank.iban ? <Line label="IBAN / account" value={bank.iban} /> : null}
					{bank.swift ? <Line label="SWIFT / BIC" value={bank.swift} /> : null}
					{orderName ? <Line label="Reference" value={`#${orderName}`} /> : null}
				</div>
			) : null}

			{invoice ? (
				<a href={invoice} target="_blank" rel="noopener noreferrer" className={buttonClasses('accent', 'md', { fullWidth: true, className: 'mt-4' })}>
					Pay invoice
				</a>
			) : null}

			<p className="mt-3 text-sm leading-relaxed text-[var(--color-ink-muted)]">
				{bank || invoice
					? 'We email these details to you too. Unpaid bookings are released after the deadline.'
					: method === 'stripe_invoice'
						? 'Your invoice is on its way by email. Pay it from the link there to keep your spot.'
						: 'Check your email for the payment details. Unpaid bookings are released after the deadline.'}
			</p>
		</div>
	);
}
