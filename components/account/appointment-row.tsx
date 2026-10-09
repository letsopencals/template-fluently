'use client';

import { memo } from 'react';
import Link from 'next/link';
import { clsx } from 'clsx';
import type { AppointmentListItemResponse } from '@opencals/storefront-sdk';
import { useDateFormatter } from '@/hooks/use-date-formatter';
import { formatDuration } from '@/lib/format';
import { swatchFor } from '@/lib/subject-color';
import { SafeImage } from '@/components/ui/safe-image';
import { StatusBadge } from './status-badge';
import { getBookingMeta } from './booking-meta';
import { JoinLessonButton } from './join-lesson-button';

export interface AppointmentRowProps {
	appointment: Pick<
		AppointmentListItemResponse,
		'id' | 'from' | 'to' | 'status' | 'numberOfAttendees' | 'staffMember' | 'product' | 'location'
	>;
	/** Tighter row for the overview page. */
	compact?: boolean;
}

const ACTIVE = new Set(['scheduled', 'confirmed', 'pending']);

/**
 * One lesson in a list: a colored date plate, the class and level, the
 * teacher's avatar, and a "Join lesson" button for upcoming online lessons.
 */
export const AppointmentRow = memo(function AppointmentRow({ appointment: appt, compact }: AppointmentRowProps) {
	const { formatCustom, formatTime } = useDateFormatter();
	const meta = getBookingMeta(appt);
	const swatch = swatchFor(meta.color);
	const lengthSeconds = Math.round((Date.parse(appt.to) - Date.parse(appt.from)) / 1000);
	const canJoin = meta.joinUrl && ACTIVE.has(appt.status);

	return (
		<div
			className={clsx(
				'grid grid-cols-[auto_1fr] items-center gap-4 sm:grid-cols-[auto_1fr_auto]',
				compact ? 'py-4' : 'px-5 py-5 sm:px-6',
			)}
		>
			{/* Date plate */}
			<div
				className="flex w-16 flex-col items-center rounded-2xl border-2 border-[var(--color-ink)] py-2"
				style={{ backgroundColor: swatch.bg, color: swatch.ink }}
			>
				<span className="text-xs font-semibold uppercase">{formatCustom(appt.from, 'MMM')}</span>
				<span className="tabular font-[family-name:var(--font-display)] text-2xl font-semibold leading-none">
					{formatCustom(appt.from, 'D')}
				</span>
			</div>

			<Link href={`/account/appointments/${appt.id}`} className="group min-w-0">
				<div className="flex flex-wrap items-center gap-x-2 gap-y-1">
					<p className="truncate font-semibold text-[var(--color-ink)] group-hover:text-[var(--color-primary)]">
						{meta.title}
					</p>
					{meta.variant ? (
						<span className="rounded-full px-2 py-0.5 text-xs font-semibold" style={{ backgroundColor: swatch.soft }}>
							{meta.variant}
						</span>
					) : null}
				</div>
				<p className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-[var(--color-ink-muted)]">
					<span className="tabular">
						{formatCustom(appt.from, 'ddd D MMM')} · {formatTime(appt.from)}
					</span>
					{lengthSeconds > 0 ? <span className="tabular">{formatDuration(lengthSeconds)}</span> : null}
					<span>{meta.isOnline ? 'Online' : meta.locationTitle}</span>
					{meta.teacher ? (
						<span className="inline-flex items-center gap-1.5">
							<span className="image-placeholder relative h-6 w-6 overflow-hidden rounded-full border border-[var(--color-ink)]">
								<SafeImage src={meta.teacherImage} alt="" fill sizes="24px" className="object-cover" />
							</span>
							{meta.teacher}
						</span>
					) : null}
				</p>
			</Link>

			<div className="col-span-2 flex items-center gap-3 sm:col-span-1 sm:flex-col sm:items-end">
				<StatusBadge kind="appointment" status={appt.status} />
				{canJoin ? <JoinLessonButton joinUrl={meta.joinUrl!} from={appt.from} to={appt.to} size="sm" /> : null}
			</div>
		</div>
	);
});
