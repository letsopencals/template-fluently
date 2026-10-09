import type { ProductListItemResponse } from '@opencals/storefront-sdk';
import type { Subject } from '@/lib/catalog';
import { Reveal } from '@/components/motion/reveal';
import { ClassCard } from '@/components/classes/class-card';

/** A titled grid of class cards (used on subject and teacher pages). */
export function ClassSection({
	title,
	intro,
	products,
	subjectFor = () => null,
	currency,
	staffId,
}: {
	title: string;
	intro?: string;
	products: ProductListItemResponse[];
	subjectFor?: (p: ProductListItemResponse) => Subject | null;
	currency: string;
	staffId?: string | null;
}) {
	if (products.length === 0) return null;
	return (
		<div>
			<h2 className="heading-display text-3xl text-[var(--color-ink)]">{title}</h2>
			{intro ? <p className="mt-2 max-w-2xl text-[var(--color-ink-muted)]">{intro}</p> : null}
			<ul className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
				{products.map((p, i) => (
					<Reveal as="li" key={p.id} delay={(i % 3) * 0.05}>
						<ClassCard product={p} subject={subjectFor(p)} currency={currency} staffId={staffId} />
					</Reveal>
				))}
			</ul>
		</div>
	);
}
