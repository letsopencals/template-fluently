'use client';

import { memo, useMemo, useState } from 'react';
import Link from 'next/link';
import moment from 'moment-timezone';
import { clsx } from 'clsx';
import type { TimetableSession } from '@/lib/server-data';
import { siteConfig } from '@/lib/site-config';
import { swatchFor } from '@/lib/subject-color';
import { useTimezone } from '@/contexts/timezone-context';
import { useHydrated } from '@/hooks/use-hydrated';
import { SafeImage } from '@/components/ui/safe-image';

export interface TimetableTeacher {
	name: string;
	firstName: string;
	image: string | null;
}

interface Day {
	key: string;
	weekday: string;
	date: string;
	isToday: boolean;
	count: number;
}

const ALL = '__all__';
const PAGE = 8;

function seatsLabel(s: TimetableSession): string {
	if (s.spotsLeft === 0) return 'Full';
	if (s.spotsLeft === 1) return '1 seat left';
	return `${s.spotsLeft} seats left`;
}

const SessionRow = memo(function SessionRow({
	session: s,
	timezone,
	dayKey,
	teacher,
}: {
	session: TimetableSession;
	timezone: string;
	dayKey: string;
	teacher: TimetableTeacher | null;
}) {
	const swatch = swatchFor(s.color);
	const start = moment.utc(s.start).tz(timezone);
	const end = moment.utc(s.end).tz(timezone);
	const full = s.spotsLeft === 0;
	const params = new URLSearchParams({ date: dayKey });
	const onlyTeacher = s.teacherIds.length === 1 ? s.teacherIds[0] : undefined;
	if (onlyTeacher) params.set('staff', onlyTeacher);
	const taken = Math.max(0, s.maxAttendees - s.spotsLeft);

	const body = (
		<>
			<div className="flex w-20 shrink-0 flex-col items-center justify-center rounded-2xl py-3 sm:w-24" style={{ backgroundColor: swatch.bg, color: swatch.ink }}>
				<span className="heading-display tabular text-xl sm:text-2xl">{start.format('h:mm')}</span>
				<span className="text-xs font-bold uppercase">{start.format('A')}</span>
			</div>
			<div className="min-w-0 flex-1">
				<div className="flex flex-wrap items-center gap-2">
					<p className="truncate font-[family-name:var(--font-display)] text-lg font-semibold text-[var(--color-ink)]">
						{s.subjectTitle ?? s.title}
					</p>
					{s.level ? (
						<span className="rounded-full px-2.5 py-0.5 text-xs font-bold" style={{ backgroundColor: swatch.soft }}>
							{s.level}
						</span>
					) : null}
				</div>
				<p className="mt-1 truncate text-sm text-[var(--color-ink-muted)]">
					{s.format === 'online' ? '💻 Live online' : '🏫 On campus'} · {start.format('h:mm')}–{end.format('h:mm A')}
					{teacher ? ` · with ${teacher.firstName}` : ''}
				</p>
			</div>
			{teacher ? (
				<span className="image-placeholder relative hidden h-11 w-11 shrink-0 overflow-hidden rounded-full border-2 border-[var(--color-ink)] sm:block">
					<SafeImage src={teacher.image} alt="" fill sizes="44px" className="object-cover" />
				</span>
			) : null}
			<div className="hidden w-36 shrink-0 md:block">
				<div className="flex gap-1" aria-hidden>
					{Array.from({ length: Math.min(s.maxAttendees, 12) }, (_, i) => (
						<span
							key={i}
							className={clsx('h-2.5 flex-1 rounded-full', i < taken ? 'bg-[var(--color-ink)]/80' : 'bg-[var(--color-ink)]/10')}
						/>
					))}
				</div>
				<p className={clsx('mt-1.5 text-xs font-bold', full ? 'text-[var(--color-ink-dim)]' : s.spotsLeft <= 2 ? 'text-[var(--color-coral)]' : 'text-[var(--color-ink)]')}>
					{seatsLabel(s)}
				</p>
			</div>
			<span
				className={clsx(
					'shrink-0 rounded-full border-2 border-[var(--color-ink)] px-4 py-2 text-sm font-bold',
					full ? 'bg-[var(--color-bg-deep)] text-[var(--color-ink-dim)]' : 'bg-[var(--color-sun)] text-[var(--color-ink)] transition-transform group-hover:-translate-y-0.5',
				)}
			>
				{full ? 'Full' : <><span className="md:hidden">{s.spotsLeft} left · </span>Book</>}
			</span>
		</>
	);

	const className = 'group flex items-center gap-4 rounded-[22px] border-2 border-[var(--color-ink)] bg-white p-3 pr-4 sm:gap-5';
	if (full) {
		return <div className={clsx(className, 'opacity-60')}>{body}</div>;
	}
	return (
		<Link href={`/booking/${s.variantSlug}?${params.toString()}`} className={clsx(className, 'transition-shadow hover:shadow-[0_5px_0_0_var(--color-ink)]')}>
			{body}
		</Link>
	);
});

/**
 * Day tabs + subject chips + session rows. Groups by day in the visitor's
 * timezone once hydrated (the school's timezone during SSR, so markup matches).
 */
export function TimetableBoard({
	sessions,
	teachers,
}: {
	sessions: TimetableSession[];
	teachers: Record<string, TimetableTeacher>;
}) {
	const hydrated = useHydrated();
	const { timezone: visitorTz } = useTimezone();
	const timezone = hydrated ? visitorTz : siteConfig.timezone;

	const [subject, setSubject] = useState<string>(ALL);
	const [pickedDay, setPickedDay] = useState<string | null>(null);
	const [expanded, setExpanded] = useState(false);

	const subjects = useMemo(
		() => [...new Set(sessions.map((s) => s.subjectTitle).filter((t): t is string => !!t))],
		[sessions],
	);

	const filtered = useMemo(
		() => (subject === ALL ? sessions : sessions.filter((s) => s.subjectTitle === subject)),
		[sessions, subject],
	);

	const byDay = useMemo(() => {
		const map = new Map<string, TimetableSession[]>();
		for (const s of filtered) {
			const key = moment.utc(s.start).tz(timezone).format('YYYY-MM-DD');
			const list = map.get(key);
			if (list) list.push(s);
			else map.set(key, [s]);
		}
		return map;
	}, [filtered, timezone]);

	const days = useMemo<Day[]>(() => {
		const today = moment.tz(timezone).startOf('day');
		return Array.from({ length: 7 }, (_, i) => {
			const d = today.clone().add(i, 'day');
			const key = d.format('YYYY-MM-DD');
			return {
				key,
				weekday: i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : d.format('ddd'),
				date: d.format('MMM D'),
				isToday: i === 0,
				count: byDay.get(key)?.length ?? 0,
			};
		});
	}, [timezone, byDay]);

	const firstWithSessions = days.find((d) => d.count > 0)?.key ?? days[0]?.key ?? '';
	const activeDay = pickedDay && days.some((d) => d.key === pickedDay) ? pickedDay : firstWithSessions;
	const daySessions = byDay.get(activeDay) ?? [];
	const shown = expanded ? daySessions : daySessions.slice(0, PAGE);

	return (
		<div>
			<div className="no-scrollbar -mx-6 flex gap-3 overflow-x-auto px-6 pb-2 lg:mx-0 lg:px-0">
				{days.map((d) => {
					const selected = d.key === activeDay;
					return (
						<button
							key={d.key}
							type="button"
							onClick={() => {
								setPickedDay(d.key);
								setExpanded(false);
							}}
							disabled={d.count === 0}
							aria-pressed={selected}
							className={clsx(
								'flex w-24 shrink-0 flex-col items-center rounded-2xl border-2 border-[var(--color-ink)] px-3 py-3 transition-all disabled:cursor-not-allowed disabled:opacity-40',
								selected
									? 'bg-[var(--color-primary)] text-white shadow-[0_4px_0_0_var(--color-ink)]'
									: 'bg-white text-[var(--color-ink)] hover:-translate-y-0.5',
							)}
						>
							<span className="text-xs font-bold uppercase tracking-wide">{d.weekday}</span>
							<span className="font-[family-name:var(--font-display)] text-lg font-semibold">{d.date}</span>
							<span className={clsx('mt-1 text-[11px] font-semibold', selected ? 'text-white/80' : 'text-[var(--color-ink-muted)]')}>
								{d.count} {d.count === 1 ? 'class' : 'classes'}
							</span>
						</button>
					);
				})}
			</div>

			{subjects.length > 1 ? (
				<div className="mt-6 flex flex-wrap gap-2" role="group" aria-label="Filter by language">
					{[ALL, ...subjects].map((s) => {
						const selected = s === subject;
						return (
							<button
								key={s}
								type="button"
								onClick={() => {
									setSubject(s);
									setExpanded(false);
								}}
								aria-pressed={selected}
								className={clsx(
									'rounded-full border-2 px-4 py-1.5 text-sm font-semibold transition-colors',
									selected
										? 'border-[var(--color-ink)] bg-[var(--color-ink)] text-white'
										: 'border-[var(--color-line-strong)] bg-white text-[var(--color-ink)] hover:border-[var(--color-ink)]',
								)}
							>
								{s === ALL ? 'All languages' : s}
							</button>
						);
					})}
				</div>
			) : null}

			<div className="mt-8 space-y-3">
				{shown.length > 0 ? (
					shown.map((s) => (
						<SessionRow
							key={s.key}
							session={s}
							timezone={timezone}
							dayKey={activeDay}
							teacher={s.teacherIds.length === 1 ? (teachers[s.teacherIds[0] ?? ''] ?? null) : null}
						/>
					))
				) : (
					<p className="rounded-[22px] border-2 border-dashed border-[var(--color-line-strong)] bg-white/60 px-6 py-10 text-center text-[var(--color-ink-muted)]">
						No group classes this week for that language yet. Try a private lesson instead.
					</p>
				)}
			</div>

			<div className="mt-6 flex flex-wrap items-center justify-between gap-4">
				<p className="text-xs text-[var(--color-ink-dim)]">Times in {timezone.replace(/_/g, ' ')}.</p>
				{daySessions.length > PAGE ? (
					<button
						type="button"
						onClick={() => setExpanded((v) => !v)}
						className="link-underline text-sm font-semibold text-[var(--color-primary)]"
					>
						{expanded ? 'Show fewer' : `Show all ${daySessions.length} classes`}
					</button>
				) : null}
			</div>
		</div>
	);
}
