'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { clsx } from 'clsx';

const LINKS = [
	{ href: '/account', label: 'Overview' },
	{ href: '/account/appointments', label: 'My lessons' },
	{ href: '/account/orders', label: 'Receipts' },
	{ href: '/account/settings', label: 'Settings' },
] as const;

function isActive(pathname: string, href: string): boolean {
	return href === '/account' ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
}

/** Account sidebar: student name, section pills, sign out. */
export function AccountNav() {
	const pathname = usePathname();
	const { data: session } = useSession();
	const customerName = [session?.customer?.firstName, session?.customer?.lastName].filter(Boolean).join(' ');
	const initial = (session?.customer?.firstName ?? customerName ?? '?').charAt(0).toUpperCase() || '?';

	return (
		<nav aria-label="Account" className="lg:sticky lg:top-32">
			<div className="flex items-center gap-3 rounded-[24px] border-2 border-[var(--color-ink)] bg-[var(--color-sun)] p-4">
				<span
					aria-hidden
					className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 border-[var(--color-ink)] bg-white font-[family-name:var(--font-display)] text-lg font-semibold"
				>
					{initial}
				</span>
				<div className="min-w-0">
					<p className="truncate font-semibold text-[var(--color-ink)]">{customerName || 'My account'}</p>
					{session?.customer?.email ? (
						<p className="truncate text-xs text-[var(--color-ink)]/70">{session.customer.email}</p>
					) : null}
				</div>
			</div>

			<ul className="no-scrollbar -mx-6 flex gap-2 overflow-x-auto px-6 py-4 lg:mx-0 lg:block lg:space-y-1.5 lg:overflow-visible lg:px-0 lg:py-5">
				{LINKS.map((link) => {
					const active = isActive(pathname, link.href);
					return (
						<li key={link.href} className="shrink-0">
							<Link
								href={link.href}
								aria-current={active ? 'page' : undefined}
								className={clsx(
									'flex items-center rounded-full px-5 py-2.5 text-sm font-semibold transition-colors',
									active
										? 'bg-[var(--color-ink)] text-white'
										: 'text-[var(--color-ink-muted)] hover:bg-[var(--color-tint)] hover:text-[var(--color-ink)]',
								)}
							>
								{link.label}
							</Link>
						</li>
					);
				})}
			</ul>

			<div className="hidden lg:block">
				<button
					type="button"
					onClick={() => signOut({ callbackUrl: '/' })}
					className="px-5 text-sm font-medium text-[var(--color-ink-muted)] transition-colors hover:text-red-600"
				>
					Sign out
				</button>
			</div>
		</nav>
	);
}

/** Mobile-only sign out (the sidebar one is hidden below lg). */
export function MobileSignOut() {
	return (
		<button
			type="button"
			onClick={() => signOut({ callbackUrl: '/' })}
			className="mt-14 w-full border-t-2 border-dashed border-[var(--color-line-strong)] pt-6 text-center text-sm font-medium text-[var(--color-ink-muted)] transition-colors hover:text-red-600 lg:hidden"
		>
			Sign out
		</button>
	);
}
