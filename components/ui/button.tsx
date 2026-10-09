import { forwardRef, type ButtonHTMLAttributes } from 'react';
import clsx from 'clsx';

export type ButtonVariant = 'primary' | 'accent' | 'outline' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
	variant?: ButtonVariant;
	size?: ButtonSize;
	fullWidth?: boolean;
	/** Accepted for API parity with the other templates; Fluently buttons are sentence case. */
	caps?: boolean;
}

/**
 * Fluently buttons are chunky pills with an ink outline and a hard "sticker"
 * drop shadow that presses in on click. `primary` is grape, `accent` is
 * sunflower (use it for the one playful CTA on a colored band).
 */
const BASE =
	'inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-[transform,box-shadow,background-color,color] duration-200 ease-out focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-primary)] disabled:cursor-not-allowed disabled:opacity-50';

const STICKER =
	'border-2 border-[var(--color-ink)] shadow-[0_4px_0_0_var(--color-ink)] hover:-translate-y-0.5 hover:shadow-[0_6px_0_0_var(--color-ink)] active:translate-y-1 active:shadow-[0_0_0_0_var(--color-ink)] disabled:translate-y-0 disabled:shadow-[0_4px_0_0_var(--color-ink)]';

const VARIANTS: Record<ButtonVariant, string> = {
	primary: clsx(STICKER, 'bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-bright)]'),
	accent: clsx(STICKER, 'bg-[var(--color-sun)] text-[var(--color-ink)] hover:bg-[var(--color-sun-bright)]'),
	outline: clsx(STICKER, 'bg-[var(--color-surface)] text-[var(--color-ink)] hover:bg-[var(--color-tint)]'),
	ghost: 'text-[var(--color-ink)] hover:text-[var(--color-primary)]',
};

const SIZES: Record<ButtonSize, string> = {
	sm: 'h-10 px-5 text-sm',
	md: 'h-12 px-6 text-[0.95rem]',
	lg: 'h-14 px-8 text-base',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
	{ variant = 'primary', size = 'md', fullWidth, caps: _caps, className, type = 'button', ...props },
	ref,
) {
	return (
		<button
			ref={ref}
			type={type}
			className={clsx(BASE, VARIANTS[variant], SIZES[size], fullWidth && 'w-full', className)}
			{...props}
		/>
	);
});

/**
 * Class string for `next/link` anchors that should look like a Button (Button
 * renders a <button> and has no anchor mode). Usage:
 * `<Link href="/classes" className={buttonClasses('primary', 'lg')}>Find a class</Link>`
 */
export function buttonClasses(
	variant: ButtonVariant = 'primary',
	size: ButtonSize = 'md',
	opts: { caps?: boolean; fullWidth?: boolean; className?: string } = {},
): string {
	const { fullWidth, className } = opts;
	return clsx(BASE, VARIANTS[variant], SIZES[size], fullWidth && 'w-full', className);
}
