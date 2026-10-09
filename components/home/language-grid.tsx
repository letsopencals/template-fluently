import Link from 'next/link';
import type { Subject } from '@/lib/catalog';
import { swatchFor } from '@/lib/subject-color';
import { SafeImage } from '@/components/ui/safe-image';
import { Reveal } from '@/components/motion/reveal';
import { SectionHeading } from './section-heading';

export interface LanguageGridProps {
	subjects: Subject[];
	/** Number of classes per subject slug. */
	classCounts: Record<string, number>;
}

/** One colorful tile per subject (collection), linking to its page. */
export function LanguageGrid({ subjects, classCounts }: LanguageGridProps) {
	if (subjects.length === 0) return null;
	return (
		<section className="mx-auto max-w-[1320px] px-6 py-24 lg:px-10 lg:py-32">
			<SectionHeading
				eyebrow="Pick your language"
				title="What do you want to speak?"
				intro="Every language has campus groups, live online groups and private lessons with native speakers."
				action={
					<Link href="/classes" className="link-underline font-semibold text-[var(--color-primary)]">
						See every class →
					</Link>
				}
			/>
			<ul className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
				{subjects.map((s, i) => {
					const swatch = swatchFor(s.color);
					const count = classCounts[s.slug] ?? 0;
					return (
						<Reveal as="li" key={s.slug} delay={(i % 3) * 0.06}>
							<Link
								href={`/languages/${s.slug}`}
								className="sticker group relative flex h-full min-h-[260px] flex-col overflow-hidden rounded-[28px] p-6 transition-transform duration-300 hover:-translate-y-1.5 hover:-rotate-1"
								style={{ backgroundColor: swatch.bg, color: swatch.ink }}
							>
								<div className="dots pointer-events-none absolute inset-0 opacity-40" />
								<div className="pointer-events-none absolute -bottom-6 -right-6 h-48 w-48 transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-6 sm:h-56 sm:w-56">
									<SafeImage src={s.image} alt="" fill sizes="240px" className="object-contain" />
								</div>
								<span className="relative w-fit rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-[var(--color-ink)]">
									{count} {count === 1 ? 'class' : 'classes'}
								</span>
								<h3 className="heading-display relative mt-auto text-4xl">{s.title}</h3>
								{s.description ? (
									<p className="relative mt-2 line-clamp-2 max-w-[70%] text-sm font-medium opacity-90">{s.description}</p>
								) : null}
								<span
									aria-hidden
									className="relative mt-4 flex h-10 w-10 items-center justify-center rounded-full border-2 border-[var(--color-ink)] bg-white text-[var(--color-ink)] transition-transform group-hover:translate-x-1"
								>
									→
								</span>
							</Link>
						</Reveal>
					);
				})}
			</ul>
		</section>
	);
}
