'use client';

import { useMemo } from 'react';
import useSWR from 'swr';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import type { AppointmentListItemResponse, OrderListItemResponse, CollectionMeta } from '@opencals/storefront-sdk';
import { fetcher } from '@/lib/fetcher';
import { formatPrice } from '@/lib/format';
import { useDateFormatter } from '@/hooks/use-date-formatter';
import { buttonClasses } from '@/components/ui/button';
import { AccountHeading, EmptyState, Panel, PanelLink, SkeletonBlock, StatTile } from '@/components/account/account-ui';
import { AppointmentRow } from '@/components/account/appointment-row';
import { StatusBadge } from '@/components/account/status-badge';
import { ComingSoonCard } from '@/components/account/coming-soon-card';

type OrderWithId = OrderListItemResponse & { id: string };
type Page<T> = { data: T[]; meta: CollectionMeta };

const SWR_OPTS = { revalidateOnFocus: false } as const;
const UPCOMING_URL = '/api/account/appointments?take=100&status=scheduled&status=pending&orderBy=from&order=ASC';

export default function AccountDashboard() {
	const { data: session } = useSession();
	const { formatDate } = useDateFormatter();

	// Counts come from `meta.itemCount` of 1-item pages; the upcoming list is
	// filtered to lessons that haven't ended yet.
	const { data: all } = useSWR<Page<AppointmentListItemResponse>>('/api/account/appointments?take=1', fetcher, SWR_OPTS);
	const { data: done } = useSWR<Page<AppointmentListItemResponse>>(
		'/api/account/appointments?take=1&status=completed',
		fetcher,
		SWR_OPTS,
	);
	const { data: booked, isLoading } = useSWR<Page<AppointmentListItemResponse>>(UPCOMING_URL, fetcher, SWR_OPTS);
	const { data: orders } = useSWR<Page<OrderWithId>>('/api/account/orders?take=3', fetcher, SWR_OPTS);

	const upcoming = useMemo(() => {
		const now = Date.now();
		return (booked?.data ?? []).filter((a) => Date.parse(a.to) >= now);
	}, [booked]);

	const firstName = session?.customer?.firstName;

	return (
		<div>
			<AccountHeading
				eyebrow="Overview"
				title={firstName ? `Hi, ${firstName}!` : 'Your lessons'}
				intro="Your next lessons, join links and receipts in one place."
				action={
					<Link href="/classes" className={buttonClasses('primary', 'md')}>
						Book a class
					</Link>
				}
			/>

			<div className="mt-8 grid grid-cols-3 gap-3 sm:gap-4">
				<StatTile tone="sun" label="Lessons booked" value={all ? all.meta.itemCount : '–'} />
				<StatTile tone="mint" label="Completed" value={done ? done.meta.itemCount : '–'} />
				<StatTile tone="sky" label="Coming up" value={booked ? upcoming.length : '–'} />
			</div>

			<div className="mt-8 space-y-6">
				<Panel title="My next lessons" action={<PanelLink href="/account/appointments">View all</PanelLink>}>
					{isLoading ? (
						<div className="space-y-3">
							<SkeletonBlock className="h-20" />
							<SkeletonBlock className="h-20" />
						</div>
					) : upcoming.length === 0 ? (
						<EmptyState
							message="Nothing booked yet. Your first lesson could be free."
							action={
								<Link href="/classes?format=trial" className={buttonClasses('accent', 'sm')}>
									Book a free trial
								</Link>
							}
						/>
					) : (
						<div className="divide-y-2 divide-dashed divide-[var(--color-line)]">
							{upcoming.slice(0, 4).map((appt) => (
								<AppointmentRow key={appt.id} appointment={appt} compact />
							))}
						</div>
					)}
				</Panel>

				<div className="grid gap-6 md:grid-cols-2">
					<Panel title="Receipts" action={<PanelLink href="/account/orders">View all</PanelLink>}>
						{!orders ? (
							<SkeletonBlock className="h-24" />
						) : orders.data.length === 0 ? (
							<p className="text-sm text-[var(--color-ink-muted)]">No receipts yet.</p>
						) : (
							<div className="divide-y divide-[var(--color-line)]">
								{orders.data.map((order) => (
									<Link
										key={order.id}
										href={`/account/orders/${order.id}`}
										className="flex items-center justify-between gap-4 py-3 transition-colors hover:text-[var(--color-primary)]"
									>
										<div>
											<p className="tabular text-sm font-semibold">Order {order.name}</p>
											<p className="mt-0.5 text-xs text-[var(--color-ink-muted)]">{formatDate(order.createdAt)}</p>
										</div>
										<div className="flex flex-col items-end gap-1.5">
											<p className="tabular text-sm font-semibold">{formatPrice(order.total, order.paymentCurrencyCode)}</p>
											<StatusBadge kind="payment" status={order.paymentStatus} />
										</div>
									</Link>
								))}
							</div>
						)}
					</Panel>
					<ComingSoonCard />
				</div>
			</div>
		</div>
	);
}
