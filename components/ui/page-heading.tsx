import { clsx } from 'clsx';
import { Reveal } from '@/components/motion/reveal';

export interface PageHeadingProps {
	eyebrow?: string;
	title: string;
	intro?: string;
	className?: string;
	children?: React.ReactNode;
}

/** Standard top-of-page heading block (clears the fixed header). */
export function PageHeading({ eyebrow, title, intro, className, children }: PageHeadingProps) {
	return (
		<header className={clsx('mx-auto max-w-[1320px] px-6 pt-32 pb-12 lg:px-10 lg:pt-40', className)}>
			<Reveal>
				{eyebrow ? (
					<span className="sticker-sm inline-block -rotate-2 rounded-full bg-[var(--color-sun)] px-3.5 py-1 text-xs font-bold text-[var(--color-ink)]">
						{eyebrow}
					</span>
				) : null}
				<h1 className="heading-display mt-5 text-[clamp(2.6rem,6vw,5rem)] text-[var(--color-ink)]">{title}</h1>
				{intro ? <p className="mt-5 max-w-2xl text-lg leading-relaxed text-[var(--color-ink-muted)]">{intro}</p> : null}
			</Reveal>
			{children}
		</header>
	);
}
