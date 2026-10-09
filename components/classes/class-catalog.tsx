'use client';

import { useCallback, useMemo, useState } from 'react';
import { usePathname } from 'next/navigation';
import { clsx } from 'clsx';
import type { ProductListItemResponse } from '@opencals/storefront-sdk';
import { FORMAT_LABELS, classFormat, levelCode, subjectOf, type ClassFormat, type Subject } from '@/lib/catalog';
import { Reveal } from '@/components/motion/reveal';
import { ClassCard } from './class-card';

const ALL = '';
const FORMATS: ClassFormat[] = ['campus', 'online', 'private', 'trial'];

export interface CatalogFilters {
	language: string;
	format: string;
	level: string;
}

function levelsOf(p: ProductListItemResponse): string[] {
	return (p.variants ?? []).map((v) => levelCode(v.variantTitle)).filter((c): c is string => !!c);
}

function ChipGroup({
	label,
	options,
	value,
	onChange,
}: {
	label: string;
	options: Array<{ value: string; label: string; count: number }>;
	value: string;
	onChange: (v: string) => void;
}) {
	return (
		<div role="group" aria-label={label} className="flex flex-wrap items-center gap-2">
			<span className="mr-1 w-20 text-xs font-bold uppercase tracking-wide text-[var(--color-ink-muted)]">{label}</span>
			{options.map((o) => {
				const on = o.value === value;
				return (
					<button
						key={o.value || 'all'}
						type="button"
						aria-pressed={on}
						disabled={o.count === 0 && !on}
						onClick={() => onChange(o.value)}
						className={clsx(
							'rounded-full border-2 px-4 py-1.5 text-sm font-semibold transition-colors disabled:opacity-40',
							on
								? 'border-[var(--color-ink)] bg-[var(--color-ink)] text-white'
								: 'border-[var(--color-line-strong)] bg-white text-[var(--color-ink)] hover:border-[var(--color-ink)]',
						)}
					>
						{o.label}
						<span className={clsx('ml-1.5 text-xs', on ? 'text-white/70' : 'text-[var(--color-ink-dim)]')}>{o.count}</span>
					</button>
				);
			})}
		</div>
	);
}

/**
 * Filterable class grid. Filters start from the URL (`?language=&format=&level=`,
 * read on the server) and are written back with history.replaceState so links
 * stay shareable without a server round trip.
 */
export function ClassCatalog({
	products,
	subjects,
	currency,
	initialFilters,
}: {
	products: ProductListItemResponse[];
	subjects: Subject[];
	currency: string;
	initialFilters: CatalogFilters;
}) {
	const pathname = usePathname();
	const [filters, setFilters] = useState<CatalogFilters>(initialFilters);

	const update = useCallback(
		(patch: Partial<CatalogFilters>) => {
			setFilters((prev) => {
				const next = { ...prev, ...patch };
				const qs = new URLSearchParams();
				for (const [k, v] of Object.entries(next)) if (v) qs.set(k, v);
				const q = qs.toString();
				window.history.replaceState(null, '', q ? `${pathname}?${q}` : pathname);
				return next;
			});
		},
		[pathname],
	);

	const rows = useMemo(
		() =>
			products.map((p) => ({
				p,
				subject: subjectOf(p, subjects),
				format: classFormat(p),
				levels: levelsOf(p),
			})),
		[products, subjects],
	);

	const matches = useCallback(
		(r: (typeof rows)[number], f: CatalogFilters) =>
			(!f.language || r.subject?.slug === f.language) &&
			(!f.format || r.format === f.format) &&
			(!f.level || r.levels.includes(f.level)),
		[],
	);

	const visible = rows.filter((r) => matches(r, filters));
	const countWith = (patch: Partial<CatalogFilters>) => rows.filter((r) => matches(r, { ...filters, ...patch })).length;

	const levels = useMemo(() => [...new Set(rows.flatMap((r) => r.levels))].sort(), [rows]);

	return (
		<div>
			<div className="space-y-3 rounded-[28px] border-2 border-[var(--color-ink)] bg-white p-5 lg:p-6">
				<ChipGroup
					label="Language"
					value={filters.language}
					onChange={(language) => update({ language })}
					options={[
						{ value: ALL, label: 'All', count: countWith({ language: ALL }) },
						...subjects.map((s) => ({ value: s.slug, label: s.title, count: countWith({ language: s.slug }) })),
					]}
				/>
				<ChipGroup
					label="Format"
					value={filters.format}
					onChange={(format) => update({ format })}
					options={[
						{ value: ALL, label: 'Any', count: countWith({ format: ALL }) },
						...FORMATS.map((f) => ({ value: f, label: FORMAT_LABELS[f], count: countWith({ format: f }) })),
					]}
				/>
				{levels.length > 0 ? (
					<ChipGroup
						label="Level"
						value={filters.level}
						onChange={(level) => update({ level })}
						options={[
							{ value: ALL, label: 'Any', count: countWith({ level: ALL }) },
							...levels.map((l) => ({ value: l, label: l, count: countWith({ level: l }) })),
						]}
					/>
				) : null}
			</div>

			<p className="mt-8 text-sm font-semibold text-[var(--color-ink-muted)]" aria-live="polite">
				{visible.length} {visible.length === 1 ? 'class' : 'classes'}
			</p>

			{visible.length > 0 ? (
				<ul className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
					{visible.map((r, i) => (
						<Reveal as="li" key={r.p.id} delay={(i % 3) * 0.05}>
							<ClassCard product={r.p} subject={r.subject} currency={currency} level={filters.level || null} />
						</Reveal>
					))}
				</ul>
			) : (
				<div className="mt-4 rounded-[28px] border-2 border-dashed border-[var(--color-line-strong)] px-6 py-16 text-center">
					<p className="font-[family-name:var(--font-display)] text-2xl font-semibold">¡Ay! Nothing matches.</p>
					<button
						type="button"
						onClick={() => update({ language: ALL, format: ALL, level: ALL })}
						className="mt-4 font-semibold text-[var(--color-primary)] underline-offset-4 hover:underline"
					>
						Clear filters
					</button>
				</div>
			)}
		</div>
	);
}
