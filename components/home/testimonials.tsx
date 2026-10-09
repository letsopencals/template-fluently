import { siteConfig } from '@/lib/site-config';
import { Reveal } from '@/components/motion/reveal';
import { SectionHeading } from './section-heading';

const COLORS = ['var(--color-tint)', 'var(--color-sage-soft)', 'var(--color-brass-soft)'];
const TILTS = ['-rotate-1', 'rotate-1', '-rotate-[0.5deg]'];

/** Student quotes as speech bubbles. Copy lives in siteConfig.testimonials. */
export function Testimonials() {
	return (
		<section className="bg-[var(--color-bg-deep)] py-24 lg:py-32">
			<div className="mx-auto max-w-[1320px] px-6 lg:px-10">
				<SectionHeading eyebrow="Students say" title="Real people, real conversations" align="center" />
				<ul className="mt-14 grid gap-8 md:grid-cols-3">
					{siteConfig.testimonials.map((t, i) => (
						<Reveal as="li" key={t.name} delay={i * 0.08}>
							<figure className={TILTS[i % TILTS.length]}>
								<blockquote
									className="bubble p-7 text-lg leading-relaxed text-[var(--color-ink)] shadow-[0_5px_0_0_var(--color-ink)]"
									style={{ backgroundColor: COLORS[i % COLORS.length] }}
								>
									“{t.quote}”
								</blockquote>
								<figcaption className="mt-7 pl-4">
									<p className="font-[family-name:var(--font-display)] text-lg font-semibold">{t.name}</p>
									<p className="text-sm text-[var(--color-ink-muted)]">{t.detail}</p>
								</figcaption>
							</figure>
						</Reveal>
					))}
				</ul>
			</div>
		</section>
	);
}
