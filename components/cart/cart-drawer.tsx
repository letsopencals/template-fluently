'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { buttonClasses } from '@/components/ui/button';
import { useCart } from '@/contexts/cart-context';
import { formatPrice, formatDuration } from '@/lib/format';
import { useDateFormatter } from '@/hooks/use-date-formatter';

interface CartDrawerProps {
	open: boolean;
	onClose: () => void;
}

export function CartDrawer({ open, onClose }: CartDrawerProps) {
	const { cart, removeItem, updateAddOnQuantity, removeAddOnItem, timeRemaining } = useCart();
	const { formatCustom } = useDateFormatter();

	const items = cart?.items ?? [];
	const isExpired = timeRemaining !== null && timeRemaining <= 0;
	const minutes = timeRemaining !== null ? Math.floor(timeRemaining / 60) : null;
	const seconds = timeRemaining !== null ? timeRemaining % 60 : null;

	return (
		<AnimatePresence>
			{open && (
				<>
					{/* Backdrop */}
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						transition={{ duration: 0.2 }}
						className="fixed inset-0 z-50 bg-[var(--color-charcoal)]/40 backdrop-blur-sm"
						onClick={onClose}
					/>

					{/* Drawer */}
					<motion.div
						initial={{ x: '100%' }}
						animate={{ x: 0 }}
						exit={{ x: '100%' }}
						transition={{ type: 'spring', damping: 30, stiffness: 300 }}
						className="fixed top-0 right-0 z-50 flex h-full w-full max-w-md flex-col border-l-2 border-[var(--color-ink)] bg-[var(--color-bg)] shadow-2xl"
					>
						{/* Header */}
						<div className="flex items-center justify-between border-b-2 border-[var(--color-ink)] bg-[var(--color-sun)] px-6 py-5">
							<h2 className="heading-display text-2xl text-[var(--color-ink)]">
								Your lessons ({items.length})
							</h2>
							<button
								onClick={onClose}
								className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-[var(--color-ink)] bg-white text-[var(--color-ink)] transition-transform hover:rotate-90"
								aria-label="Close cart"
							>
								<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
									<path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
								</svg>
							</button>
						</div>

						{/* Timer */}
						{timeRemaining !== null && !isExpired && (
							<div
								className={`px-6 py-2 text-center text-xs ${
									timeRemaining <= 60
										? 'bg-red-100 text-red-700'
										: timeRemaining <= 120
											? 'bg-amber-100 text-amber-800'
											: 'bg-[var(--color-tint)] text-[var(--color-primary-dark)]'
								}`}
							>
								Expires in{' '}
								<span className="font-semibold">
									{minutes}:{String(seconds).padStart(2, '0')}
								</span>
							</div>
						)}

						{isExpired && (
							<div className="bg-amber-100 px-6 py-2 text-center text-xs text-amber-800">
								Cart expired. Please book again.
							</div>
						)}

						{/* Items */}
						<div className="flex-1 overflow-y-auto px-6 py-4">
							{items.length === 0 ? (
								<div className="flex h-full flex-col items-center justify-center text-center">
									<span className="bubble bg-[var(--color-tint)] px-4 py-2 font-[family-name:var(--font-display)] text-lg font-semibold">¿Y ahora?</span>
									<p className="mt-6 text-sm text-[var(--color-ink-muted)]">No lessons in your cart yet.</p>
									<Link
										href="/classes"
										onClick={onClose}
										className="mt-4 text-sm font-semibold text-[var(--color-primary)] hover:underline"
									>
										Browse classes
									</Link>
								</div>
							) : (
								<div className="divide-y divide-[var(--color-line)]">
									{items.map((item) => {
										const addOnItems = item.addOnItems ?? [];
										return (
											<div key={item.id} className="py-4 first:pt-0 last:pb-0">
												<div className="flex items-start justify-between gap-3">
													<div className="flex-1">
														<p className="text-sm font-medium text-[var(--color-ink)]">
															{item.appointment?.product?.title ?? 'Lesson'}
														</p>
														{item.appointment?.from && (
															<p className="mt-1 text-xs text-[var(--color-ink-muted)]">
																{formatCustom(item.appointment.from, 'ddd, MMM D')}
																{' at '}
																{formatCustom(item.appointment.from, 'h:mm A')}
															</p>
														)}
														{item.appointment?.product?.duration && (
															<p className="mt-0.5 text-xs text-[var(--color-ink-dim)]">
																{formatDuration(item.appointment.product.duration)}
															</p>
														)}
													</div>
													<div className="flex items-start gap-2">
														<span className="text-sm font-semibold text-[var(--color-primary)]">
															{formatPrice(item.originalUnitPrice ?? 0, cart?.paymentCurrencyCode)}
														</span>
														<button
															onClick={() => removeItem(item.id)}
															className="flex h-6 w-6 items-center justify-center text-[var(--color-ink-dim)] transition-colors hover:text-red-400"
															aria-label="Remove item"
														>
															<svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
																<path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
															</svg>
														</button>
													</div>
												</div>

												{/* Nested add-on items */}
												{addOnItems.length > 0 && (
													<div className="mt-3 space-y-2 border-l-2 border-[var(--color-line-strong)] pl-3">
														{addOnItems.map((aoi) => {
															const isDuration = aoi.addOn?.durationMultiplied ?? false;
															const atMax =
																!isDuration &&
																aoi.addOn?.maxQuantity != null &&
																aoi.quantity >= aoi.addOn.maxQuantity;
															return (
																<div key={aoi.id} className="flex items-center justify-between gap-2">
																	<div className="min-w-0 flex-1">
																		<p className="truncate text-xs font-medium text-[var(--color-ink)]">
																			{aoi.addOn?.title ?? 'Add-on'}
																		</p>
																	</div>
																	<div className="flex items-center gap-1">
																		{!isDuration && (
																			<>
																				<button
																					onClick={() => updateAddOnQuantity(aoi.id, aoi.quantity - 1)}
																					className="flex h-6 w-6 items-center justify-center rounded-full border border-[var(--color-line-strong)] text-[var(--color-ink)] transition-colors hover:border-[var(--color-primary)]"
																					aria-label="Decrease add-on quantity"
																				>
																					<svg className="h-2.5 w-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
																						<path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" />
																					</svg>
																				</button>
																				<span className="w-5 text-center text-xs font-semibold text-[var(--color-ink)]">
																					{aoi.quantity}
																				</span>
																				<button
																					disabled={atMax}
																					onClick={() => updateAddOnQuantity(aoi.id, aoi.quantity + 1)}
																					className="flex h-6 w-6 items-center justify-center rounded-full border border-[var(--color-line-strong)] text-[var(--color-ink)] transition-colors hover:border-[var(--color-primary)] disabled:opacity-30"
																					aria-label="Increase add-on quantity"
																				>
																					<svg className="h-2.5 w-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
																						<path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
																					</svg>
																				</button>
																			</>
																		)}
																		<span className="ml-1 whitespace-nowrap text-xs font-semibold text-[var(--color-primary)]">
																			{formatPrice(aoi.discountedSubtotal, cart?.paymentCurrencyCode)}
																		</span>
																		<button
																			onClick={() => removeAddOnItem(aoi.id)}
																			className="flex h-6 w-6 items-center justify-center text-[var(--color-ink-dim)] transition-colors hover:text-red-400"
																			aria-label="Remove add-on"
																		>
																			<svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
																				<path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
																			</svg>
																		</button>
																	</div>
																</div>
															);
														})}
													</div>
												)}
											</div>
										);
									})}
								</div>
							)}
						</div>

						{/* Footer */}
						{items.length > 0 && (
							<div className="border-t-2 border-[var(--color-ink)] px-6 py-5">
								<div className="mb-4 flex justify-between">
									<span className="text-sm font-semibold text-[var(--color-ink)]">Total</span>
									<span className="text-xl font-bold text-[var(--color-primary)]">
										{formatPrice(cart?.total ?? cart?.subtotal ?? 0, cart?.paymentCurrencyCode)}
									</span>
								</div>
								<Link
									href="/classes"
									onClick={onClose}
									className={buttonClasses('outline', 'md', { fullWidth: true })}
								>
									Add another class
								</Link>
								<p className="mt-3 text-center text-xs text-[var(--color-ink-dim)]">
									Complete payment on the booking page
								</p>
							</div>
						)}
					</motion.div>
				</>
			)}
		</AnimatePresence>
	);
}
