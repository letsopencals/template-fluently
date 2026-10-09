import { SafeImage } from '@/components/ui/safe-image';
import { Reveal } from '@/components/motion/reveal';

const SPANS = [
	'col-span-2 row-span-2',
	'col-span-1 row-span-1',
	'col-span-1 row-span-1',
	'col-span-1 row-span-1',
	'col-span-1 row-span-1',
	'col-span-2 row-span-1',
];
const COLORS = ['var(--color-sky)', 'var(--color-bubblegum)', 'var(--color-mint)', 'var(--color-sun)', 'var(--color-coral)', 'var(--color-tint)'];

/** Bento grid of real school photos (decorative files in public/images). */
export function PhotoGallery({ photos }: { photos: ReadonlyArray<{ src: string; alt: string }> }) {
	return (
		<ul className="grid auto-rows-[160px] grid-cols-2 gap-4 sm:auto-rows-[200px] md:grid-cols-4">
			{photos.map((p, i) => (
				<Reveal as="li" key={p.src} delay={i * 0.04} className={SPANS[i % SPANS.length]}>
					<div className="dots relative h-full overflow-hidden rounded-[24px] border-2 border-[var(--color-ink)]" style={{ backgroundColor: COLORS[i % COLORS.length] }}>
						<SafeImage src={p.src} alt={p.alt} fill sizes="(min-width: 768px) 40vw, 90vw" className="object-cover" />
					</div>
				</Reveal>
			))}
		</ul>
	);
}
