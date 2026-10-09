import { clsx } from 'clsx';
import Link from 'next/link';

/** Top-of-page heading inside the account area. */
export function AccountHeading({
	eyebrow,
	title,
	intro,
	action,
}: {
	eyebrow?: string;
	title: string;
	intro?: React.ReactNode;
	action?: React.ReactNode;
}) {
	return (
		<div className="flex flex-wrap items-end justify-between gap-6">
			<div>
				{eyebrow ? <p className="eyebrow mb-3">{eyebrow}</p> : null}
				<h1 className="heading-display text-[clamp(2rem,4vw,3.2rem)] text-[var(--color-ink)]">{title}</h1>
				{intro ? <div className="mt-3 max-w-xl text-[0.95rem] text-[var(--color-ink-muted)]">{intro}</div> : null}
			</div>
			{action ? <div className="shrink-0">{action}</div> : null}
		</div>
	);
}

/** Rounded white card with an optional title row. */
export function Panel({
	title,
	action,
	children,
	className,
}: {
	title?: React.ReactNode;
	action?: React.ReactNode;
	children: React.ReactNode;
	className?: string;
}) {
	return (
		<section className={clsx('rounded-[28px] border-2 border-[var(--color-ink)] bg-[var(--color-surface)] p-6 lg:p-7', className)}>
			{title || action ? (
				<div className="mb-5 flex items-center justify-between gap-4">
					{title ? (
						<h2 className="font-[family-name:var(--font-display)] text-xl font-semibold text-[var(--color-ink)]">{title}</h2>
					) : (
						<span />
					)}
					{action}
				</div>
			) : null}
			{children}
		</section>
	);
}

/** Small grape text link ("View all"). */
export function PanelLink({ href, children }: { href: string; children: React.ReactNode }) {
	return (
		<Link
			href={href}
			className="text-sm font-semibold text-[var(--color-primary)] transition-colors hover:text-[var(--color-primary-dark)]"
		>
			{children}
		</Link>
	);
}

/** Label / value row ("Teacher ........ Lucía"). */
export function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
	return (
		<div className="flex items-baseline justify-between gap-6 py-3 text-sm">
			<dt className="shrink-0 text-[var(--color-ink-muted)]">{label}</dt>
			<dd className="text-right font-medium text-[var(--color-ink)]">{children}</dd>
		</div>
	);
}

export function SkeletonBlock({ className }: { className?: string }) {
	return <div className={clsx('animate-pulse rounded-[24px] bg-[var(--color-surface-2)]', className)} />;
}

/** Empty state with an optional call to action. */
export function EmptyState({ message, action }: { message: string; action?: React.ReactNode }) {
	return (
		<div className="rounded-[24px] border-2 border-dashed border-[var(--color-line-strong)] px-6 py-12 text-center">
			<p className="text-[0.95rem] text-[var(--color-ink-muted)]">{message}</p>
			{action ? <div className="mt-6">{action}</div> : null}
		</div>
	);
}

/** Learnify-style outlined stat tile. */
export function StatTile({
	label,
	value,
	tone,
}: {
	label: string;
	value: React.ReactNode;
	tone: 'sun' | 'mint' | 'sky' | 'tint';
}) {
	const bg = {
		sun: 'bg-[var(--color-sun)]',
		mint: 'bg-[var(--color-mint)]',
		sky: 'bg-[var(--color-sky)]',
		tint: 'bg-[var(--color-tint-strong)]',
	}[tone];
	return (
		<div className={clsx('sticker rounded-[24px] px-5 py-4', bg)}>
			<p className="tabular font-[family-name:var(--font-display)] text-4xl font-semibold text-[var(--color-ink)]">{value}</p>
			<p className="mt-1 text-sm font-medium text-[var(--color-ink)]/75">{label}</p>
		</div>
	);
}

export function Pagination({
	page,
	pageCount,
	onChange,
}: {
	page: number;
	pageCount: number;
	onChange: (page: number) => void;
}) {
	if (pageCount <= 1) return null;
	const btn =
		'h-10 rounded-full border-2 border-[var(--color-ink)] bg-white px-5 text-sm font-semibold text-[var(--color-ink)] transition-colors hover:bg-[var(--color-tint)] disabled:opacity-30 disabled:hover:bg-white';
	return (
		<div className="mt-8 flex items-center justify-center gap-4">
			<button type="button" onClick={() => onChange(Math.max(1, page - 1))} disabled={page <= 1} className={btn}>
				Previous
			</button>
			<span className="tabular text-sm text-[var(--color-ink-muted)]">
				{page} / {pageCount}
			</span>
			<button
				type="button"
				onClick={() => onChange(Math.min(pageCount, page + 1))}
				disabled={page >= pageCount}
				className={btn}
			>
				Next
			</button>
		</div>
	);
}
