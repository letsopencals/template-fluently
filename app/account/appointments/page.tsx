'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import type { AppointmentListItemResponse, CollectionMeta } from '@opencals/storefront-sdk';
import { buttonClasses } from '@/components/ui/button';
import { AccountHeading, EmptyState, Pagination, SkeletonBlock } from '@/components/account/account-ui';
import { AppointmentRow } from '@/components/account/appointment-row';

export default function AppointmentsPage() {
	const [appointments, setAppointments] = useState<AppointmentListItemResponse[]>([]);
	const [meta, setMeta] = useState<CollectionMeta | null>(null);
	const [loading, setLoading] = useState(true);
	const [page, setPage] = useState(1);

	const fetchAppointments = useCallback(async (p: number) => {
		setLoading(true);
		try {
			const res = await fetch(`/api/account/appointments?take=10&page=${p}`);
			if (res.ok) {
				const data: { data: AppointmentListItemResponse[]; meta: CollectionMeta } = await res.json();
				setAppointments(data.data ?? []);
				setMeta(data.meta ?? null);
			}
		} catch {
			// silently fail
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		fetchAppointments(page);
	}, [page, fetchAppointments]);

	return (
		<div>
			<AccountHeading
				eyebrow="My lessons"
				title="Every lesson"
				intro="Open a lesson to reschedule, cancel or add it to your calendar. Online lessons get a Join button 15 minutes before they start."
				action={
					<Link href="/classes" className={buttonClasses('primary', 'md', { className: 'max-sm:hidden' })}>
						Book a class
					</Link>
				}
			/>

			{loading ? (
				<div className="mt-10 space-y-3">
					{[0, 1, 2, 3].map((i) => (
						<SkeletonBlock key={i} className="h-24" />
					))}
				</div>
			) : appointments.length === 0 ? (
				<div className="mt-10">
					<EmptyState
						message="No lessons yet."
						action={
							<Link href="/classes" className={buttonClasses('outline', 'sm')}>
								Find a class
							</Link>
						}
					/>
				</div>
			) : (
				<>
					<div className="mt-10 divide-y-2 divide-dashed divide-[var(--color-line)] overflow-hidden rounded-[28px] border-2 border-[var(--color-ink)] bg-[var(--color-surface)]">
						{appointments.map((appt) => (
							<AppointmentRow key={appt.id} appointment={appt} />
						))}
					</div>
					{meta ? <Pagination page={meta.page} pageCount={meta.pageCount} onChange={setPage} /> : null}
				</>
			)}
		</div>
	);
}
