import Link from 'next/link';
import type { ProductListItemResponse } from '@opencals/storefront-sdk';
import { FORMAT_LABELS, classFormat, fromPrice, hasCampus, hasOnline, isGroup, levelCode, type Subject } from '@/lib/catalog';
import { formatDuration, formatWholePrice, getListItemGallery } from '@/lib/format';
import { swatchFor } from '@/lib/subject-color';
import { SafeImage } from '@/components/ui/safe-image';

export interface ClassCardProps {
	product: ProductListItemResponse;
	subject: Subject | null;
	currency: string;
	/** Highlight the variant whose level code matches (e.g. "A2"). */
	level?: string | null;
	/** Preselect this teacher in booking (`?staff=`). */
	staffId?: string | null;
}

/** Booking slug: the variant's when it has variants, else the product's. */
export function bookingHref(product: ProductListItemResponse, variantSlug?: string, staffId?: string | null): string {
	const base = `/booking/${variantSlug ?? product.variants?.[0]?.slug ?? product.slug}`;
	return staffId ? `${base}?staff=${encodeURIComponent(staffId)}` : base;
}

/**
 * QSchool-style colored card: 3D prop image on the class color, format and
 * place badges, level / length chips that deep-link to booking, and the price.
 */
export function ClassCard({ product: p, subject, currency, level, staffId }: ClassCardProps) {
	const swatch = swatchFor(p.color ?? subject?.color);
	const format = classFormat(p);
	const image = getListItemGallery(p)[0] ?? null;
	const variants = p.variants ?? [];
	const price = fromPrice(p);
	const seats = p.maxAttendees ?? 1;
	const durations = [...new Set(variants.map((v) => v.duration).filter(Boolean))];
	const duration = durations.length === 1 ? durations[0] : p.duration;
	const highlighted = level ? variants.find((v) => levelCode(v.variantTitle) === level) : undefined;

	return (
		<article className="sticker group flex h-full flex-col overflow-hidden rounded-[28px] bg-white transition-transform duration-300 hover:-translate-y-1">
			<Link href={bookingHref(p, highlighted?.slug, staffId)} className="relative block aspect-[4/3] overflow-hidden" style={{ backgroundColor: swatch.bg }}>
				<div className="dots absolute inset-0 opacity-40" />
				<SafeImage src={image} alt={p.title} fill sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 90vw" className="object-cover transition-transform duration-500 group-hover:scale-105" />
				<div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
					<span className="rounded-full border-2 border-[var(--color-ink)] bg-white px-2.5 py-0.5 text-xs font-bold">{FORMAT_LABELS[format]}</span>
					{subject ? (
						<span className="rounded-full border-2 border-[var(--color-ink)] bg-[var(--color-sun)] px-2.5 py-0.5 text-xs font-bold">{subject.title}</span>
					) : null}
				</div>
			</Link>

			<div className="flex flex-1 flex-col p-5">
				<h3 className="font-[family-name:var(--font-display)] text-xl font-semibold leading-tight text-[var(--color-ink)]">
					<Link href={bookingHref(p, highlighted?.slug, staffId)} className="hover:text-[var(--color-primary)]">
						{p.title}
					</Link>
				</h3>
				<p className="mt-1.5 text-sm text-[var(--color-ink-muted)]">
					{[
						isGroup(p) ? `Up to ${seats} students` : '1:1',
						duration ? formatDuration(duration) : null,
						[hasCampus(p) ? 'Campus' : null, hasOnline(p) ? 'Online' : null].filter(Boolean).join(' or '),
					]
						.filter(Boolean)
						.join(' · ')}
				</p>

				{variants.length > 1 ? (
					<ul className="mt-4 flex flex-wrap gap-1.5">
						{variants.map((v) => {
							const on = highlighted?.id === v.id;
							return (
								<li key={v.id}>
									<Link
										href={bookingHref(p, v.slug, staffId)}
										className="inline-block rounded-full border-2 px-2.5 py-1 text-xs font-semibold transition-colors"
										style={
											on
												? { backgroundColor: swatch.bg, color: swatch.ink, borderColor: 'var(--color-ink)' }
												: { backgroundColor: swatch.soft, borderColor: 'transparent' }
										}
									>
										{v.variantTitle ?? v.title}
									</Link>
								</li>
							);
						})}
					</ul>
				) : null}

				<div className="mt-auto flex items-end justify-between gap-3 pt-5">
					<p className="text-sm text-[var(--color-ink-muted)]">
						{price === 0 ? null : variants.length > 1 ? 'from ' : null}
						<span className="heading-display text-2xl text-[var(--color-ink)]">{formatWholePrice(price, currency)}</span>
					</p>
					<Link
						href={bookingHref(p, highlighted?.slug, staffId)}
						className="rounded-full border-2 border-[var(--color-ink)] bg-[var(--color-sun)] px-4 py-2 text-sm font-bold transition-transform hover:-translate-y-0.5"
					>
						{format === 'trial' ? 'Book free' : 'Book'}
					</Link>
				</div>
			</div>
		</article>
	);
}
