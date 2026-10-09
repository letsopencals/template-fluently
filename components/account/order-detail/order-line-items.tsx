import type { OrderDetailLineItem } from '@opencals/storefront-sdk';
import { formatPrice } from '@/lib/format';
import { Panel } from '@/components/account/account-ui';

/** Booked lessons with their extras and level. */
export function OrderLineItems({ lineItems, currency }: { lineItems: OrderDetailLineItem[]; currency: string }) {
	if (!lineItems.length) return null;
	return (
		<Panel title="Items">
			<ul className="divide-y divide-[var(--color-line)]">
				{lineItems.map((item, i) => {
					const addOnLineItems = item.addOnLineItems ?? [];
					return (
						<li key={i} className="py-4 first:pt-0 last:pb-0">
							<div className="flex items-baseline text-sm">
								<span className="text-[var(--color-ink)]">
									{item.appointment?.product?.title ?? 'Lesson'}
									{item.appointment?.product?.variantTitle ? (
										<span className="ml-2 text-xs text-[var(--color-ink-muted)]">{item.appointment.product.variantTitle}</span>
									) : null}
									{item.quantity > 1 ? (
										<span className="tabular ml-2 text-xs text-[var(--color-ink-muted)]">× {item.quantity}</span>
									) : null}
								</span>
								<span className="leader-line" />
								<span className="text-right">
									{item.discountedUnitPrice < item.originalUnitPrice ? (
										<span className="tabular mr-2 text-xs text-[var(--color-ink-dim)] line-through">
											{formatPrice(item.originalUnitPrice, currency)}
										</span>
									) : null}
									<span className="tabular text-[var(--color-ink)]">{formatPrice(item.discountedTotal, currency)}</span>
								</span>
							</div>
							{addOnLineItems.length > 0 ? (
								<ul className="mt-2 space-y-1.5 border-l-2 border-[var(--color-tint-strong)] pl-4">
									{addOnLineItems.map((aoli, j) => (
										<li key={j} className="flex items-baseline text-xs text-[var(--color-ink-muted)]">
											<span>
												{aoli.addOn?.title ?? 'Extra'} × {aoli.quantity}
											</span>
											<span className="leader-line" />
											<span className="tabular">{formatPrice(aoli.discountedSubtotal, currency)}</span>
										</li>
									))}
								</ul>
							) : null}
						</li>
					);
				})}
			</ul>
		</Panel>
	);
}
