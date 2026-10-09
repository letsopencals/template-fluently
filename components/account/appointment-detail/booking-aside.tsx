import Link from 'next/link';
import type { AppointmentDetailResponse } from '@opencals/storefront-sdk';
import { formatPrice } from '@/lib/format';
import { siteConfig } from '@/lib/site-config';
import { buttonClasses } from '@/components/ui/button';
import { Panel } from '@/components/account/account-ui';
import type { BookingMeta } from '@/components/account/booking-meta';

/** Right rail: the class booked, its price, the receipt and "book again". */
export function BookingAside({ appointment, meta }: { appointment: AppointmentDetailResponse; meta: BookingMeta }) {
	const product = appointment.product;
	const currency = appointment.order?.paymentCurrencyCode ?? siteConfig.currency;

	return (
		<div className="space-y-5">
			{product ? (
				<Panel title="Class">
					<p className="font-semibold text-[var(--color-ink)]">{product.title}</p>
					{meta.variant ? <p className="mt-1 text-sm text-[var(--color-ink-muted)]">{meta.variant}</p> : null}
					{product.price != null ? (
						<p className="mt-4 flex items-baseline text-sm">
							<span className="text-[var(--color-ink-muted)]">Price</span>
							<span className="leader-line" />
							<span className="tabular font-semibold text-[var(--color-ink)]">{formatPrice(product.price, currency)}</span>
						</p>
					) : null}
				</Panel>
			) : null}

			{appointment.order?.id ? (
				<Link
					href={`/account/orders/${appointment.order.id}`}
					className={buttonClasses('outline', 'md', { fullWidth: true })}
				>
					View receipt
				</Link>
			) : null}

			{meta.bookAgainHref ? (
				<Link href={meta.bookAgainHref} className={buttonClasses('primary', 'md', { fullWidth: true })}>
					Book again
				</Link>
			) : null}
		</div>
	);
}
