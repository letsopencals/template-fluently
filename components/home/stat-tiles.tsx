import { CountUp } from '@/components/motion/count-up';
import { Reveal } from '@/components/motion/reveal';

export interface Stat {
	value: number;
	label: string;
	prefix?: string;
}

const TONES = ['var(--color-sun)', 'var(--color-mint)', 'var(--color-sky)', 'var(--color-bubblegum)'];
const TILTS = ['-rotate-2', 'rotate-1', '-rotate-1', 'rotate-2'];

/** Outlined sticker tiles. Every value is computed from the API by the page. */
export function StatTiles({ stats }: { stats: Stat[] }) {
	if (stats.length === 0) return null;
	return (
		<section className="mx-auto max-w-[1320px] px-6 lg:px-10">
			<ul className="grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-6">
				{stats.map((s, i) => (
					<Reveal as="li" key={s.label} delay={i * 0.06}>
						<div
							className={`sticker rounded-[28px] px-6 py-7 transition-transform hover:rotate-0 ${TILTS[i % TILTS.length]}`}
							style={{ backgroundColor: TONES[i % TONES.length] }}
						>
							<p className="heading-display text-5xl text-[var(--color-ink)] lg:text-6xl">
								<CountUp value={s.value} prefix={s.prefix} />
							</p>
							<p className="mt-2 text-sm font-semibold text-[var(--color-ink)]/80">{s.label}</p>
						</div>
					</Reveal>
				))}
			</ul>
		</section>
	);
}
