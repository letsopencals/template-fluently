'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { clsx } from 'clsx';
import { useSession, signOut } from 'next-auth/react';
import { useCart } from '@/contexts/cart-context';
import { CartDrawer } from '@/components/cart/cart-drawer';
import { Wordmark } from '@/components/layout/wordmark';
import { buttonClasses } from '@/components/ui/button';

const NAV_LINKS = [
	{ href: '/classes', label: 'Classes' },
	{ href: '/teachers', label: 'Teachers' },
	{ href: '/#timetable', label: 'Timetable' },
	{ href: '/about', label: 'About' },
	{ href: '/contact', label: 'Contact' },
] as const;

const MENU_FADE = { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } };

export function Header() {
	const { data: session, status } = useSession();
	const { cart } = useCart();
	const pathname = usePathname();
	const [scrolled, setScrolled] = useState(false);
	const [menuOpen, setMenuOpen] = useState(false);
	const [cartOpen, setCartOpen] = useState(false);
	const cartCount = cart?.items?.length ?? 0;

	useEffect(() => {
		const onScroll = () => setScrolled(window.scrollY > 16);
		onScroll();
		window.addEventListener('scroll', onScroll, { passive: true });
		return () => window.removeEventListener('scroll', onScroll);
	}, []);

	useEffect(() => {
		document.body.style.overflow = menuOpen ? 'hidden' : '';
		return () => {
			document.body.style.overflow = '';
		};
	}, [menuOpen]);

	useEffect(() => setMenuOpen(false), [pathname]);

	return (
		<>
			<header className="fixed inset-x-0 top-0 z-50 px-3 pt-3 lg:px-6 lg:pt-4">
				<div
					className={clsx(
						'mx-auto max-w-[1320px] rounded-full transition-[background-color,box-shadow,border-color] duration-300',
						scrolled ? 'glass-nav shadow-[0_4px_0_0_var(--color-ink)]' : 'border-2 border-transparent',
					)}
				>
					<div className="flex h-16 items-center justify-between pl-4 pr-3 lg:pl-5">
						<Link href="/" aria-label="Home">
							<Wordmark />
						</Link>

						<nav aria-label="Main" className="hidden items-center gap-1 lg:flex">
							{NAV_LINKS.map((link) => {
								const active = link.href !== '/#timetable' && pathname.startsWith(link.href);
								return (
									<Link
										key={link.href}
										href={link.href}
										className={clsx(
											'rounded-full px-4 py-2 text-[0.95rem] font-semibold transition-colors',
											active
												? 'bg-[var(--color-ink)] text-white'
												: 'text-[var(--color-ink)] hover:bg-[var(--color-tint)]',
										)}
									>
										{link.label}
									</Link>
								);
							})}
						</nav>

						<div className="flex items-center gap-2">
							<CartButton count={cartCount} onClick={() => setCartOpen(true)} />
							<Link
								href={status === 'authenticated' ? '/account' : '/auth/sign-in'}
								className="hidden rounded-full px-4 py-2 text-[0.95rem] font-semibold text-[var(--color-ink)] transition-colors hover:bg-[var(--color-tint)] lg:block"
							>
								{status === 'authenticated' ? session.customer?.firstName || 'My lessons' : 'Sign in'}
							</Link>
							<Link href="/classes" className={buttonClasses('primary', 'sm', { className: 'hidden sm:inline-flex' })}>
								Book a class
							</Link>
							<button
								type="button"
								onClick={() => setMenuOpen((o) => !o)}
								className="relative z-50 flex h-11 w-11 flex-col items-center justify-center gap-1.5 rounded-full border-2 border-[var(--color-ink)] bg-[var(--color-sun)] lg:hidden"
								aria-label="Toggle menu"
								aria-expanded={menuOpen}
							>
								<motion.span animate={menuOpen ? { rotate: 45, y: 4 } : { rotate: 0, y: 0 }} className="block h-[2.5px] w-5 rounded bg-[var(--color-ink)]" />
								<motion.span animate={menuOpen ? { rotate: -45, y: -4 } : { rotate: 0, y: 0 }} className="block h-[2.5px] w-5 rounded bg-[var(--color-ink)]" />
							</button>
						</div>
					</div>
				</div>
			</header>

			<CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />

			<AnimatePresence>
				{menuOpen ? (
					<motion.div {...MENU_FADE} className="dots fixed inset-0 z-40 bg-[var(--color-sun)] lg:hidden">
						<div className="flex h-full flex-col justify-center gap-3 px-8">
							{NAV_LINKS.map((link, i) => (
								<motion.div
									key={link.href}
									initial={{ opacity: 0, x: -20 }}
									animate={{ opacity: 1, x: 0 }}
									transition={{ delay: 0.06 * i + 0.1 }}
								>
									<Link href={link.href} className="heading-display text-5xl text-[var(--color-ink)]">
										{link.label}
									</Link>
								</motion.div>
							))}
							<div className="mt-8 flex flex-col items-start gap-4">
								<Link href="/classes" className={buttonClasses('primary', 'lg')}>
									Book a class
								</Link>
								{status === 'authenticated' ? (
									<div className="flex gap-6 text-base font-semibold">
										<Link href="/account">My lessons</Link>
										<button type="button" onClick={() => signOut({ callbackUrl: '/' })}>
											Sign out
										</button>
									</div>
								) : (
									<Link href="/auth/sign-in" className="text-base font-semibold">
										Sign in
									</Link>
								)}
							</div>
						</div>
					</motion.div>
				) : null}
			</AnimatePresence>
		</>
	);
}

function CartButton({ count, onClick }: { count: number; onClick: () => void }) {
	return (
		<button
			type="button"
			onClick={onClick}
			className="relative flex h-11 w-11 items-center justify-center rounded-full text-[var(--color-ink)] transition-colors hover:bg-[var(--color-tint)]"
			aria-label={`Cart (${count} items)`}
		>
			<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
				<path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
			</svg>
			{count > 0 ? (
				<span className="absolute right-0.5 top-0.5 flex h-5 w-5 items-center justify-center rounded-full border-2 border-[var(--color-ink)] bg-[var(--color-coral)] text-[10px] font-bold text-white">
					{count}
				</span>
			) : null}
		</button>
	);
}
