'use client';

import Link from 'next/link';
import type { AppointmentDetailResponse } from '@opencals/storefront-sdk';
import { useDateFormatter } from '@/hooks/use-date-formatter';
import { formatDuration } from '@/lib/format';
import { swatchFor } from '@/lib/subject-color';
import { SafeImage } from '@/components/ui/safe-image';
import { DetailRow, Panel } from '@/components/account/account-ui';
import type { BookingMeta } from '@/components/account/booking-meta';
import { JoinLessonButton } from '@/components/account/join-lesson-button';

const ACTIVE = new Set(['scheduled', 'confirmed', 'pending']);

/** When, who and where: the date card, teacher, campus or online classroom. */
export function SessionSummary({ appointment, meta }: { appointment: AppointmentDetailResponse; meta: BookingMeta }) {
	const { formatCustom, formatTime, timezone } = useDateFormatter();
	const seconds = Math.max(0, Math.round((new Date(appointment.to).getTime() - new Date(appointment.from).getTime()) / 1000));
	const swatch = swatchFor(meta.color);
	const canJoin = meta.joinUrl && ACTIVE.has(appointment.status);

	return (
		<Panel title="Your lesson">
			<div
				className="rounded-[22px] border-2 border-[var(--color-ink)] p-5 sm:p-6"
				style={{ backgroundColor: swatch.bg, color: swatch.ink }}
			>
				<p className="text-sm font-semibold opacity-80">{formatCustom(appointment.from, 'dddd')}</p>
				<p className="heading-display mt-1 text-3xl sm:text-4xl">{formatCustom(appointment.from, 'MMMM D, YYYY')}</p>
				<p className="tabular mt-2 text-sm font-medium opacity-90">
					{formatTime(appointment.from)} – {formatTime(appointment.to)}
					{seconds > 0 ? ` · ${formatDuration(seconds)}` : ''} · {timezone.replace('_', ' ')}
				</p>
				{canJoin ? (
					<div className="mt-5">
						<JoinLessonButton joinUrl={meta.joinUrl!} from={appointment.from} to={appointment.to} />
					</div>
				) : null}
			</div>

			<dl className="mt-3 divide-y divide-[var(--color-line)]">
				<DetailRow label="Type">
					{meta.kindLabel}
					{meta.variant ? <span className="text-[var(--color-ink-muted)]"> · {meta.variant}</span> : null}
				</DetailRow>
				{meta.teacher ? (
					<DetailRow label="Teacher">
						<span className="inline-flex items-center gap-2">
							<span className="image-placeholder relative h-7 w-7 overflow-hidden rounded-full border border-[var(--color-ink)]">
								<SafeImage src={meta.teacherImage} alt="" fill sizes="28px" className="object-cover" />
							</span>
							{meta.teacherSlug ? (
								<Link href={`/teachers/${meta.teacherSlug}`} className="hover:text-[var(--color-primary)]">
									{meta.teacher}
								</Link>
							) : (
								meta.teacher
							)}
						</span>
					</DetailRow>
				) : null}
				<DetailRow label="Where">
					{meta.isOnline ? (
						<span>Online classroom</span>
					) : (
						<>
							<span className="block">{meta.locationTitle}</span>
							{meta.address ? (
								<span className="mt-1 block font-normal text-[var(--color-ink-muted)]">{meta.address}</span>
							) : null}
						</>
					)}
				</DetailRow>
				{appointment.numberOfAttendees > 1 ? (
					<DetailRow label="Seats">
						<span className="tabular">{appointment.numberOfAttendees}</span>
					</DetailRow>
				) : null}
			</dl>

			{meta.isOnline && !meta.joinUrl ? (
				<p className="mt-4 text-xs leading-relaxed text-[var(--color-ink-dim)]">
					Your teacher will send the classroom link before the lesson.
				</p>
			) : null}
		</Panel>
	);
}
