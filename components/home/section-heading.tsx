import { clsx } from 'clsx';
import { Reveal } from '@/components/motion/reveal';

export interface SectionHeadingProps {
	eyebrow?: string;
	title: string;
	intro?: string;
	align?: 'left' | 'center';
	className?: string;
	/** Rendered on the right on wide screens (e.g. a "See all" link). */
	action?: React.ReactNode;
}

/** Eyebrow sticker + display heading used by every home section. */
export function SectionHeading({ eyebrow, title, intro, align = 'left', className, action }: SectionHeadingProps) {
	const centered = align === 'center';
	return (
		<div
			className={clsx(
				'flex flex-col gap-6',
				centered ? 'items-center text-center' : 'lg:flex-row lg:items-end lg:justify-between',
				className,
			)}
		>
			<Reveal className={centered ? 'max-w-2xl' : 'max-w-2xl'}>
				{eyebrow ? (
					<span className="sticker-sm inline-block -rotate-2 rounded-full bg-[var(--color-sun)] px-3.5 py-1 text-xs font-bold text-[var(--color-ink)]">
						{eyebrow}
					</span>
				) : null}
				<h2 className="heading-display mt-4 text-[clamp(2rem,4.5vw,3.5rem)] text-[var(--color-ink)]">{title}</h2>
				{intro ? <p className="mt-4 text-lg leading-relaxed text-[var(--color-ink-muted)]">{intro}</p> : null}
			</Reveal>
			{action ? <Reveal delay={0.1}>{action}</Reveal> : null}
		</div>
	);
}
