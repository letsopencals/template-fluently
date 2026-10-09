import { memo } from 'react';
import type { ProductListItemResponse, ProductListVariant } from '@opencals/storefront-sdk';
import { FORMAT_LABELS, classFormat, isGroup } from '@/lib/catalog';
import { formatDuration, getListItemGallery } from '@/lib/format';
import { swatchFor } from '@/lib/subject-color';
import { SafeImage } from '@/components/ui/safe-image';

/** Colored class card at the top of booking: image, title, level, size and length. */
export const ClassHeader = memo(function ClassHeader({
	product,
	variant,
}: {
	product: ProductListItemResponse;
	variant: ProductListVariant | null;
}) {
	const swatch = swatchFor(variant?.color ?? product.color);
	const image = getListItemGallery(product)[0] ?? null;
	const seats = variant?.maxAttendees ?? product.maxAttendees ?? 1;
	const duration = variant?.duration ?? product.duration;
	const group = isGroup({ maxAttendees: seats });

	return (
		<div className="sticker relative flex items-center gap-5 overflow-hidden rounded-[28px] p-4 pr-6 sm:p-5" style={{ backgroundColor: swatch.bg, color: swatch.ink }}>
			<div className="dots pointer-events-none absolute inset-0 opacity-40" />
			<div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl border-2 border-[var(--color-ink)] bg-white/40 sm:h-24 sm:w-24">
				<SafeImage src={image} alt="" fill sizes="96px" className="object-cover" />
			</div>
			<div className="relative min-w-0">
				<p className="text-xs font-bold uppercase tracking-wide opacity-80">{FORMAT_LABELS[classFormat(product)]}</p>
				<h1 className="heading-display mt-1 truncate text-2xl sm:text-3xl">{product.title}</h1>
				<div className="mt-2 flex flex-wrap gap-1.5 text-xs font-bold text-[var(--color-ink)]">
					{variant?.variantTitle ? <span className="rounded-full bg-white px-2.5 py-0.5">{variant.variantTitle}</span> : null}
					<span className="rounded-full bg-white/80 px-2.5 py-0.5">{group ? `Up to ${seats} students` : '1:1'}</span>
					{duration ? <span className="rounded-full bg-white/80 px-2.5 py-0.5">{formatDuration(duration)}</span> : null}
				</div>
			</div>
		</div>
	);
});
