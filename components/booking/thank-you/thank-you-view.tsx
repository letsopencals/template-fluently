'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import useSWR from 'swr';
import { useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import { useReducedMotion } from '@/components/motion/use-reduced-motion';
import type { OrderDetailAppointment, OrderDetailResponse } from '@opencals/storefront-sdk';
import { fetcher } from '@/lib/fetcher';
import { formatPrice } from '@/lib/format';
import { siteConfig } from '@/lib/site-config';
import { DURATION, EASE_OUT } from '@/components/motion/easing';
import { Reveal } from '@/components/motion/reveal';
import { buttonClasses } from '@/components/ui/button';
import { BookingCard } from './booking-card';
import { toConfirmedBooking } from './confirmed-booking';
import { icsHref } from './ics';

const CHECK_INITIAL = { pathLength: 0 };
const CHECK_ANIMATE = { pathLength: 1 };
const CHECK_TRANSITION = { duration: DURATION.slow, ease: EASE_OUT, delay: 0.2 };
const SWR_OPTS = { revalidateOnFocus: false, errorRetryCount: 3 };

function Check() {
	const reduce = useReducedMotion();
	return (
		<span className="sticker flex h-16 w-16 -rotate-6 items-center justify-center rounded-full bg-[var(--color-mint)] text-[var(--color-ink)]">
			<svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.6} aria-hidden>
				<motion.path d="M4 12.5l5 5L20 6.5" strokeLinecap="round" strokeLinejoin="round" initial={reduce ? false : CHECK_INITIAL} animate={CHECK_ANIMATE} transition={CHECK_TRANSITION} />
			</svg>
		</span>
	);
}

function Row({ label, value, accent = false }: { label: string; value: string; accent?: boolean }) {
	return (
		<div className="flex items-baseline justify-between gap-4 py-2.5 text-sm">
			<span className="text-[var(--color-ink-muted)]">{label}</span>
			<span className={accent ? 'tabular text-lg font-bold text-[var(--color-primary)]' : 'tabular font-medium text-[var(--color-ink)]'}>{value}</span>
		</div>
	);
}

function OrderSkeleton() {
	return (
		<div className="mt-12 grid gap-6 lg:grid-cols-[1fr_340px]" aria-busy>
			<div className="aspect-[16/11] animate-pulse rounded-[28px] bg-[var(--color-surface-2)]" />
			<div className="h-64 animate-pulse rounded-[28px] bg-[var(--color-surface-2)]" />
		</div>
	);
}

/** Reads ?orderId, loads the order (the checkout signs the guest in) and renders the confirmation. */
export function ThankYouView() {
	const orderId = useSearchParams().get('orderId');
	const { status } = useSession();
	const key = orderId && status === 'authenticated' ? `/api/account/orders/${encodeURIComponent(orderId)}` : null;
	const { data: order, isLoading } = useSWR<OrderDetailResponse>(key, fetcher, SWR_OPTS);
	const loading = status === 'loading' || isLoading;

	const bookings = useMemo(
		() =>
			(order?.lineItems ?? [])
				.map((li) => li.appointment)
				.filter((a): a is OrderDetailAppointment => a != null)
				.map(toConfirmedBooking),
		[order],
	);
	const currency = order?.paymentCurrencyCode ?? siteConfig.currency;
	const calendar = useMemo(() => (bookings.length > 0 ? icsHref(bookings, order?.name ?? '') : null), [bookings, order?.name]);
	const email = order?.customerEmail ?? order?.customer?.email ?? null;

	return (
		<section className="pt-32 pb-20 lg:pt-40 lg:pb-28">
			<div className="mx-auto max-w-[1200px] px-6 lg:px-10">
				<Reveal>
					<Check />
				</Reveal>
				<Reveal delay={0.08}>
					<p className="eyebrow mt-8">{order?.name ? `Booking #${order.name}` : 'Booking received'}</p>
				</Reveal>
				<Reveal delay={0.14}>
					<h1 className="heading-display mt-4 text-5xl text-[var(--color-ink)] sm:text-7xl">
						<span className="marker">¡Genial!</span> You&rsquo;re booked.
					</h1>
				</Reveal>
				<Reveal delay={0.2}>
					<p className="mt-6 max-w-xl text-base leading-relaxed text-[var(--color-ink-muted)]">
						{email ? (
							<>
								A confirmation is on its way to <span className="font-semibold text-[var(--color-ink)]">{email}</span>.
							</>
						) : (
							'A confirmation is on its way by email.'
						)}
					</p>
				</Reveal>

				{loading ? (
					<OrderSkeleton />
				) : (
					<div className="mt-12 grid gap-6 lg:grid-cols-[1fr_340px]">
						<div className="space-y-6">
							{bookings.length > 0 ? (
								bookings.map((b) => <BookingCard key={b.id} booking={b} />)
							) : (
								<div className="rounded-[28px] border-2 border-[var(--color-ink)] bg-[var(--color-surface)] px-6 py-10">
									<p className="text-sm text-[var(--color-ink-muted)]">
										{status === 'authenticated' ? 'We could not load the booking details here.' : 'Sign in to see your booking details here.'} The confirmation email has everything you need.
									</p>
								</div>
							)}
						</div>

						<aside className="space-y-4 lg:sticky lg:top-28 lg:self-start">
							{order ? (
								<div className="rounded-[28px] border-2 border-[var(--color-ink)] bg-[var(--color-surface)] px-6 py-5">
									<p className="font-[family-name:var(--font-display)] text-lg font-semibold">Payment</p>
									<div className="mt-3 divide-y divide-[var(--color-line)]">
										<Row label="Subtotal" value={formatPrice(order.subtotal ?? 0, currency)} />
										{(order.totalTax ?? 0) > 0 ? <Row label={order.taxesIncluded ? 'Tax (included)' : 'Tax'} value={formatPrice(order.totalTax, currency)} /> : null}
										<Row label="Total" value={formatPrice(order.total ?? 0, currency)} accent />
										<Row label="Status" value={order.isFullyPaid ? 'Paid' : order.paymentStatus === 'partially-paid' ? 'Part paid' : 'Pay later'} />
									</div>
								</div>
							) : null}

							{calendar ? (
								<a href={calendar} download={`${siteConfig.name.toLowerCase().replace(/\s+/g, '-')}-${order?.name ?? 'lesson'}.ics`} className={buttonClasses('primary', 'md', { fullWidth: true })}>
									Add to calendar
								</a>
							) : null}
							<a href={siteConfig.contact.whatsappHref} target="_blank" rel="noopener noreferrer" className={buttonClasses('outline', 'md', { fullWidth: true })}>
								Questions? WhatsApp us
							</a>
							{status === 'authenticated' ? (
								<Link href="/account/appointments" className={buttonClasses('ghost', 'md', { fullWidth: true })}>
									See my lessons
								</Link>
							) : null}
							<Link href="/classes" className="link-underline block pt-2 text-center text-sm font-semibold text-[var(--color-ink-muted)]">
								Book another class
							</Link>
						</aside>
					</div>
				)}
			</div>
		</section>
	);
}
