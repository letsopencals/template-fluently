import { memo } from 'react';
import { clsx } from 'clsx';

type Tone = 'accent' | 'positive' | 'neutral' | 'warning' | 'negative';

const TONE: Record<Tone, string> = {
	accent: 'bg-[var(--color-tint)] text-[var(--color-primary-dark)]',
	positive: 'bg-[var(--color-sage-soft)] text-[var(--color-leaf-deep)]',
	neutral: 'bg-[var(--color-bg-deep)] text-[var(--color-ink-muted)]',
	warning: 'bg-[var(--color-brass-soft)] text-amber-800',
	negative: 'bg-red-100 text-red-700',
};

const APPOINTMENT: Record<string, { label: string; tone: Tone }> = {
	scheduled: { label: 'Booked', tone: 'accent' },
	confirmed: { label: 'Confirmed', tone: 'positive' },
	completed: { label: 'Completed', tone: 'neutral' },
	canceled: { label: 'Cancelled', tone: 'negative' },
	pending: { label: 'Pending', tone: 'warning' },
};

const PAYMENT: Record<string, { label: string; tone: Tone }> = {
	paid: { label: 'Paid', tone: 'positive' },
	unpaid: { label: 'Unpaid', tone: 'warning' },
	'partially-paid': { label: 'Part paid', tone: 'warning' },
	voided: { label: 'Cancelled — not charged', tone: 'neutral' },
};

/** Why a pending lesson waits. A pending lesson with no reason is being confirmed right now: show it as booked. */
const AWAITING: Record<string, { label: string; tone: Tone }> = {
	awaiting_payment: { label: 'Awaiting payment', tone: 'warning' },
	awaiting_approval: { label: 'Awaiting confirmation', tone: 'warning' },
};

/** "partially-refunded" → "Partially refunded", for a status this map doesn't know yet. */
function humanize(status: string): string {
	const text = status.replace(/[-_]+/g, ' ').trim();
	return text ? text[0]!.toUpperCase() + text.slice(1) : 'Unknown';
}

const FULFILLMENT: Record<string, { label: string; tone: Tone }> = {
	fulfilled: { label: 'Fulfilled', tone: 'positive' },
	unfulfilled: { label: 'Unfulfilled', tone: 'neutral' },
	'partially-fulfilled': { label: 'Part fulfilled', tone: 'warning' },
};

const REFUND: Record<string, { label: string; tone: Tone }> = {
	'refund-owed': { label: 'Refund owed', tone: 'negative' },
	'partially-refunded': { label: 'Part refunded', tone: 'warning' },
	'fully-refunded': { label: 'Refunded', tone: 'negative' },
	unrefunded: { label: 'Not refunded', tone: 'neutral' },
};

const MAPS = { appointment: APPOINTMENT, payment: PAYMENT, fulfillment: FULFILLMENT, refund: REFUND } as const;

/** Soft pill with the status label. */
export const StatusBadge = memo(function StatusBadge({
	kind,
	status,
	pendingReason,
	className,
}: {
	kind: keyof typeof MAPS;
	status: string;
	/** Appointments only: `pendingReason` from the API. */
	pendingReason?: string | null;
	className?: string;
}) {
	const pending = kind === 'appointment' && status === 'pending';
	const c =
		(pending ? (pendingReason ? AWAITING[pendingReason] : APPOINTMENT.scheduled) : MAPS[kind][status]) ??
		{ label: humanize(status), tone: 'neutral' as Tone };
	return (
		<span
			className={clsx(
				'inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold whitespace-nowrap',
				TONE[c.tone],
				className,
			)}
		>
			{c.label}
		</span>
	);
});
