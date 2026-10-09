import { siteConfig } from '@/lib/site-config';
import { SafeImage } from '@/components/ui/safe-image';
import { Reveal } from '@/components/motion/reveal';
import { SectionHeading } from './section-heading';

const COLORS = ['var(--color-sky)', 'var(--color-bubblegum)', 'var(--color-mint)'];

/** Three numbered steps with 3D props. */
export function HowItWorks() {
	const p = siteConfig.process;
	return (
		<section className="mx-auto max-w-[1320px] px-6 py-24 lg:px-10 lg:py-32">
			<SectionHeading eyebrow={p.eyebrow} title={p.title} align="center" />
			<ol className="mt-14 grid gap-6 md:grid-cols-3">
				{p.steps.map((s, i) => (
					<Reveal as="li" key={s.title} delay={i * 0.08}>
						<div className="relative h-full rounded-[28px] border-2 border-[var(--color-ink)] bg-white p-7">
							<span className="sticker-sm heading-display absolute -top-5 left-7 flex h-11 w-11 items-center justify-center rounded-full bg-[var(--color-sun)] text-xl">
								{i + 1}
							</span>
							<div className="dots relative mt-4 aspect-[4/3] overflow-hidden rounded-[20px]" style={{ backgroundColor: COLORS[i % COLORS.length] }}>
								<SafeImage src={s.image} alt="" fill sizes="(min-width: 768px) 30vw, 90vw" className="object-contain p-4" />
							</div>
							<h3 className="heading-display mt-6 text-2xl text-[var(--color-ink)]">{s.title}</h3>
							<p className="mt-2 leading-relaxed text-[var(--color-ink-muted)]">{s.body}</p>
						</div>
					</Reveal>
				))}
			</ol>
		</section>
	);
}
