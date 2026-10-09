import type { AppointmentAddOn } from '@opencals/storefront-sdk';
import { formatPrice } from '@/lib/format';
import { Panel } from '@/components/account/account-ui';

/**
 * Extras on the lesson. Duration-multiplied extras are priced per booked unit
 * of the lesson's base length.
 */
export function AddOnsPanel({
	addOns,
	units,
	currency,
}: {
	addOns: AppointmentAddOn[];
	units: number;
	currency: string;
}) {
	if (!addOns.length) return null;
	return (
		<Panel title="Extras">
			<ul className="divide-y divide-[var(--color-line)]">
				{addOns.map((a, idx) => {
					const qty = a.quantity ?? 1;
					const perDay = Boolean(a.addOn?.durationMultiplied);
					const total = (a.addOn?.price ?? 0) * qty * (perDay ? units : 1);
					return (
						<li key={a.id ?? `${a.addOnId}-${idx}`} className="flex items-baseline py-3 text-sm">
							<span className="text-[var(--color-ink)]">
								{a.addOn?.title ?? 'Extra'}
								{qty > 1 ? <span className="tabular text-[var(--color-ink-muted)]"> × {qty}</span> : null}
								{perDay && units > 1 ? (
									<span className="ml-2 text-xs text-[var(--color-ink-dim)]">
										× {units}
									</span>
								) : null}
							</span>
							<span className="leader-line" />
							{a.addOn?.price != null ? (
								<span className="tabular text-[var(--color-ink-muted)]">{formatPrice(total, currency)}</span>
							) : null}
						</li>
					);
				})}
			</ul>
		</Panel>
	);
}
