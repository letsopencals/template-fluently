'use client';

import { memo } from 'react';
import { SafeImage } from '@/components/ui/safe-image';
import { Reveal } from '@/components/motion/reveal';
import { useDateFormatter } from '@/hooks/use-date-formatter';
import { swatchFor } from '@/lib/subject-color';
import { JoinLessonButton } from '@/components/account/join-lesson-button';
import type { ConfirmedBooking } from './confirmed-booking';

interface Step {
	label: string;
	detail: string;
}

function stepsFor(b: ConfirmedBooking): Step[] {
	const teacher = b.teacherFirstName ?? 'your teacher';
	return [
		{ label: 'You’re in!', detail: 'Your confirmation is on its way by email.' },
		b.isOnline
			? {
					label: 'Join from anywhere',
					detail: b.joinUrl
						? 'The Join button in your account switches on 15 minutes before the start. Headphones help.'
						: `${teacher} sends the classroom link before the lesson.`,
				}
			: {
					label: 'Come to campus',
					detail: `${[b.locationTitle, b.address].filter(Boolean).join(', ')}. Arrive five minutes early and say hi at the front desk.`,
				},
		{ label: 'Start talking', detail: `${teacher} will get you speaking from minute one.` },
	];
}

/** Class image, date, teacher and a three-step "what happens next" for one lesson. */
export const BookingCard = memo(function BookingCard({ booking: b }: { booking: ConfirmedBooking }) {
	const { formatCustom, formatTime, timezone } = useDateFormatter();
	const swatch = swatchFor(b.color);
	const steps = stepsFor(b);

	return (
		<article className="overflow-hidden rounded-[28px] border-2 border-[var(--color-ink)] bg-[var(--color-surface)] shadow-[0_6px_0_0_var(--color-ink)]">
			<div className="relative aspect-[16/8] overflow-hidden" style={{ backgroundColor: swatch.bg }}>
				<SafeImage src={b.image} alt={b.title} fill sizes="(min-width: 1024px) 60vw, 100vw" className="object-cover" priority />
				<div className="absolute bottom-4 left-4 flex flex-wrap gap-2">
					<span className="sticker-sm rounded-full bg-white px-3 py-1 text-xs font-bold">{b.kindLabel}</span>
					<span className="sticker-sm rounded-full bg-[var(--color-sun)] px-3 py-1 text-xs font-bold">
						{b.isOnline ? 'Online' : 'On campus'}
					</span>
				</div>
			</div>

			<div className="px-6 pt-6">
				<h2 className="heading-display text-2xl text-[var(--color-ink)] sm:text-3xl">{b.title}</h2>
				{b.variant ? <p className="mt-1 text-sm font-medium text-[var(--color-ink-muted)]">{b.variant}</p> : null}
			</div>

			<div className="mx-6 mt-5 grid grid-cols-2 gap-3">
				<div className="rounded-2xl px-4 py-3" style={{ backgroundColor: swatch.soft }}>
					<p className="text-xs font-semibold text-[var(--color-ink-muted)]">Date</p>
					<p className="tabular mt-0.5 font-semibold">{formatCustom(b.from, 'ddd, MMM D')}</p>
				</div>
				<div className="rounded-2xl px-4 py-3" style={{ backgroundColor: swatch.soft }}>
					<p className="text-xs font-semibold text-[var(--color-ink-muted)]">Time · {timezone.split('/').pop()?.replace('_', ' ')}</p>
					<p className="tabular mt-0.5 font-semibold">
						{formatTime(b.from)}–{formatTime(b.to)}
					</p>
				</div>
			</div>

			{b.teacher ? (
				<div className="mx-6 mt-3 flex items-center gap-3 rounded-2xl bg-[var(--color-bg-deep)] px-4 py-3">
					<span className="image-placeholder relative h-10 w-10 overflow-hidden rounded-full border-2 border-[var(--color-ink)]">
						<SafeImage src={b.teacherImage} alt="" fill sizes="40px" className="object-cover" />
					</span>
					<div>
						<p className="text-xs font-semibold text-[var(--color-ink-muted)]">Your teacher</p>
						<p className="font-semibold">{b.teacher}</p>
					</div>
				</div>
			) : null}

			<ol className="px-6 py-6">
				{steps.map((s, i) => (
					<Reveal key={s.label} as="li" delay={0.1 + i * 0.08}>
						<div className={i < steps.length - 1 ? 'relative flex gap-4 pb-5' : 'relative flex gap-4'}>
							<div className="flex flex-col items-center">
								<span
									className={
										i === 0
											? 'tabular flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-[var(--color-ink)] bg-[var(--color-mint)] text-sm font-bold'
											: 'tabular flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-[var(--color-ink)] bg-white text-sm font-bold'
									}
								>
									{i + 1}
								</span>
								{i < steps.length - 1 ? (
									<span aria-hidden className="mt-1 w-0 flex-1 border-l-2 border-dashed border-[var(--color-line-strong)]" />
								) : null}
							</div>
							<div className="min-w-0 pb-1 pt-1">
								<p className="font-semibold text-[var(--color-ink)]">{s.label}</p>
								<p className="mt-1 text-sm leading-relaxed text-[var(--color-ink-muted)]">{s.detail}</p>
							</div>
						</div>
					</Reveal>
				))}
			</ol>

			{b.joinUrl ? (
				<div className="border-t-2 border-dashed border-[var(--color-line)] px-6 py-4">
					<JoinLessonButton joinUrl={b.joinUrl} from={b.from} to={b.to} fullWidth />
				</div>
			) : null}
		</article>
	);
});
