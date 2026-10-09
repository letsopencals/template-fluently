'use client';

import { useMemo, useState, useRef, useEffect } from 'react';

interface HorizontalDayStripProps {
	selectedDate: string | null;
	onDateSelect: (date: string) => void;
	/** Days with an open start; null while loading (every day stays selectable). */
	availableDates?: Set<string> | null;
}

const WEEKDAYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function formatDateStr(d: Date): string {
	return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

const DAY_MS = 86_400_000;

function daysFrom(today: Date, dateStr: string): number {
	const [y, m, d] = dateStr.split('-').map(Number);
	return Math.round((new Date(y!, m! - 1, d!).getTime() - today.getTime()) / DAY_MS);
}

export function HorizontalDayStrip({ selectedDate, onDateSelect, availableDates }: HorizontalDayStripProps) {
	const today = useMemo(() => {
		const d = new Date();
		d.setHours(0, 0, 0, 0);
		return d;
	}, []);

	const [extraDays, setExtraDays] = useState(0);

	// The last open day bounds "Show more"; the strip always reaches the selected day
	// (the flow may jump weeks ahead to the first open one).
	const lastOpen = useMemo(() => {
		if (!availableDates || availableDates.size === 0) return null;
		return daysFrom(today, [...availableDates].sort().at(-1)!);
	}, [availableDates, today]);
	const selectedOffset = selectedDate ? daysFrom(today, selectedDate) : 0;
	const windowSize = Math.max(21 + extraDays, selectedOffset + 7);
	const canShowMore = lastOpen === null ? true : windowSize <= lastOpen;
	const scrollRef = useRef<HTMLDivElement>(null);

	const days = useMemo(() => {
		const arr: Date[] = [];
		for (let i = 0; i < windowSize; i++) {
			const d = new Date(today);
			d.setDate(today.getDate() + i);
			arr.push(d);
		}
		return arr;
	}, [today, windowSize]);

	// Scroll selected card into view when it changes
	useEffect(() => {
		if (!selectedDate || !scrollRef.current) return;
		const el = scrollRef.current.querySelector(`[data-date="${selectedDate}"]`);
		el?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
	}, [selectedDate]);

	const firstDay = days[0];
	const lastDay = days[days.length - 1];
	const monthHeader = (() => {
		if (!firstDay) return '';
		const startMonth = MONTHS_SHORT[firstDay.getMonth()];
		const endMonth = lastDay ? MONTHS_SHORT[lastDay.getMonth()] : startMonth;
		if (startMonth === endMonth) return `${startMonth} ${firstDay.getFullYear()}`;
		return `${startMonth} – ${endMonth} ${lastDay?.getFullYear() ?? firstDay.getFullYear()}`;
	})();

	return (
		<div>
			<div className="mb-4 flex items-baseline justify-between">
				<p className="text-base font-semibold text-[var(--color-ink)]">{monthHeader}</p>
				{canShowMore ? (
					<button
						type="button"
						onClick={() => setExtraDays(windowSize - 21 + 14)}
						className="text-sm font-semibold text-[var(--color-primary)] transition-colors hover:text-[var(--color-primary-bright)]"
					>
						Show more →
					</button>
				) : null}
			</div>

			<div
				ref={scrollRef}
				className="no-scrollbar -mx-2 flex snap-x snap-mandatory gap-2 overflow-x-auto px-2 pb-1"
			>
				{days.map((d, i) => {
					const dateStr = formatDateStr(d);
					const weekdayIdx = d.getDay();
					const weekdayLabel = WEEKDAYS[weekdayIdx] ?? '';
					const isSelected = dateStr === selectedDate;
					const isToday = i === 0;
					const isOpen = availableDates ? availableDates.has(dateStr) : true;

					return (
						<button
							key={dateStr}
							type="button"
							data-date={dateStr}
							onClick={() => onDateSelect(dateStr)}
							disabled={!isOpen && !isSelected}
							aria-label={`${d.toDateString()}${isOpen ? '' : ', no open times'}`}
							className={`group flex shrink-0 snap-start flex-col items-center rounded-2xl border px-3 py-3 transition-all sm:px-4 sm:py-3.5 ${
								isSelected
									? 'border-[var(--color-primary)] bg-[var(--color-primary)] text-white'
									: isOpen
										? 'border-[var(--color-line-strong)] bg-[var(--color-surface)] text-[var(--color-ink)] hover:border-[var(--color-primary)]/60'
										: 'cursor-not-allowed border-dashed border-[var(--color-line-strong)] bg-transparent text-[var(--color-ink-dim)] opacity-50'
							}`}
							style={{ minWidth: '64px' }}
						>
							<span
								className={`text-[0.6rem] font-semibold uppercase tracking-[0.16em] ${
									isSelected ? 'text-white/70' : 'text-[var(--color-ink-dim)]'
								}`}
							>
								{weekdayLabel}
							</span>
							<span className="heading-display mt-1 text-2xl leading-none">
								{d.getDate()}
							</span>
							<span
								className={`mt-1.5 h-1.5 w-1.5 rounded-full ${
									isSelected
										? isToday || (availableDates && isOpen)
											? 'bg-white'
											: 'bg-transparent'
										: availableDates && isOpen
											? 'bg-[var(--color-mint)]'
											: isToday
												? 'bg-[var(--color-primary)]'
												: 'bg-transparent'
								}`}
								aria-hidden
							/>
						</button>
					);
				})}
			</div>
		</div>
	);
}
