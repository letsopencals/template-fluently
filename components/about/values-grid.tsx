import { Reveal } from '@/components/motion/reveal';

const COLORS = ['var(--color-sun)', 'var(--color-mint)', 'var(--color-sky)', 'var(--color-bubblegum)'];
const TILTS = ['-rotate-1', 'rotate-1', 'rotate-[-0.5deg]', 'rotate-[0.75deg]'];

export function ValuesGrid({ values }: { values: ReadonlyArray<{ title: string; body: string }> }) {
	return (
		<ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
			{values.map((v, i) => (
				<Reveal as="li" key={v.title} delay={i * 0.06}>
					<div className={`sticker h-full rounded-[28px] p-6 ${TILTS[i % TILTS.length]}`} style={{ backgroundColor: COLORS[i % COLORS.length] }}>
						<h3 className="heading-display text-2xl text-[var(--color-ink)]">{v.title}</h3>
						<p className="mt-2 text-[var(--color-ink)]/80">{v.body}</p>
					</div>
				</Reveal>
			))}
		</ul>
	);
}
