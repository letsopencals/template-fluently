'use client';

import { memo, useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { buttonClasses } from '@/components/ui/button';
import { SafeImage } from '@/components/ui/safe-image';
import { formatWholePrice } from '@/lib/format';

export interface FormatItem {
	id: string;
	label: string;
	title: string;
	body: string;
	image: string;
	/** Classes in this format (from the API). */
	count: number;
	/** Cheapest variant in this format, or null when none. */
	fromPrice: number | null;
}

const PANEL_COLORS = ['var(--color-sky)', 'var(--color-mint)', 'var(--color-bubblegum)', 'var(--color-sun)'];
const PANEL_MOTION = {
	initial: { opacity: 0, y: 16 },
	animate: { opacity: 1, y: 0 },
	exit: { opacity: 0, y: -10 },
	transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] },
} as const;

/** Tabs for campus / online / private with live class counts and from-prices. */
export const FormatSwitcher = memo(function FormatSwitcher({ items, currency }: { items: FormatItem[]; currency: string }) {
	const visible = items.filter((i) => i.count > 0);
	const [activeId, setActiveId] = useState(visible[0]?.id ?? '');
	const index = Math.max(0, visible.findIndex((i) => i.id === activeId));
	const active = visible[index];
	if (!active) return null;
	const color = PANEL_COLORS[index % PANEL_COLORS.length];

	return (
		<div>
			<div role="tablist" aria-label="Class format" className="flex flex-wrap gap-3">
				{visible.map((item) => {
					const selected = item.id === active.id;
					return (
						<button
							key={item.id}
							type="button"
							role="tab"
							aria-selected={selected}
							onClick={() => setActiveId(item.id)}
							className={
								selected
									? 'sticker-sm rounded-full bg-[var(--color-ink)] px-5 py-2.5 font-semibold text-white'
									: 'rounded-full border-2 border-[var(--color-ink)] bg-white px-5 py-2.5 font-semibold text-[var(--color-ink)] transition-colors hover:bg-[var(--color-tint)]'
							}
						>
							{item.label}
						</button>
					);
				})}
			</div>

			<div className="sticker relative mt-8 overflow-hidden rounded-[32px]" style={{ backgroundColor: color }}>
				<div className="dots pointer-events-none absolute inset-0 opacity-50" />
				<AnimatePresence mode="wait" initial={false}>
					<motion.div key={active.id} {...PANEL_MOTION} className="relative grid items-center gap-8 p-8 md:grid-cols-[1.2fr_1fr] lg:p-12">
						<div>
							<p className="text-sm font-bold uppercase tracking-wide text-[var(--color-ink)]/70">
								{active.count} {active.count === 1 ? 'class' : 'classes'}
								{active.fromPrice != null
									? ` · ${active.fromPrice === 0 ? 'Free' : `from ${formatWholePrice(active.fromPrice, currency)}`}`
									: ''}
							</p>
							<h3 className="heading-display mt-3 text-4xl text-[var(--color-ink)] lg:text-5xl">{active.title}</h3>
							<p className="mt-4 max-w-lg text-lg leading-relaxed text-[var(--color-ink)]/80">{active.body}</p>
							<Link href={`/classes?format=${active.id}`} className={buttonClasses('outline', 'md', { className: 'mt-8' })}>
								Browse {active.label.toLowerCase()} classes →
							</Link>
						</div>
						<div className="relative mx-auto aspect-square w-full max-w-[320px]">
							<div className="absolute inset-[10%] rounded-full bg-white/50" />
							<SafeImage src={active.image} alt="" fill sizes="320px" className="object-contain" />
						</div>
					</motion.div>
				</AnimatePresence>
			</div>
		</div>
	);
});
