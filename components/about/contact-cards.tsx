import { Reveal } from '@/components/motion/reveal';

export interface ContactCard {
	label: string;
	value: string;
	href: string;
	emoji: string;
	color: string;
}

/** Big tappable cards for each way to reach the school. */
export function ContactCards({ cards }: { cards: ContactCard[] }) {
	return (
		<ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
			{cards.map((c, i) => (
				<Reveal as="li" key={c.label} delay={i * 0.06}>
					<a
						href={c.href}
						target={c.href.startsWith('http') ? '_blank' : undefined}
						rel={c.href.startsWith('http') ? 'noopener noreferrer' : undefined}
						className="sticker group flex h-full flex-col rounded-[28px] p-6 transition-transform hover:-translate-y-1"
						style={{ backgroundColor: c.color }}
					>
						<span aria-hidden className="text-3xl">{c.emoji}</span>
						<span className="mt-5 text-sm font-bold text-[var(--color-ink)]/70">{c.label}</span>
						<span className="mt-1 whitespace-pre-line break-words font-[family-name:var(--font-display)] text-xl font-semibold text-[var(--color-ink)] group-hover:underline">
							{c.value}
						</span>
					</a>
				</Reveal>
			))}
		</ul>
	);
}
