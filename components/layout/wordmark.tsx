'use client';

import { useSettings } from '@/contexts/settings-context';
import { siteConfig } from '@/lib/site-config';

/**
 * Logo + wordmark. Uses the store's logo from the dashboard when set, else the
 * bundled `/logo.svg` speech bubble.
 */
export function Wordmark({ size = 'md' }: { size?: 'md' | 'lg' }) {
	const { settings } = useSettings();
	const logoUrl = settings?.storefrontSettings?.logoImage?.url ?? '/logo.svg';
	const box = size === 'lg' ? 'h-12 w-12 rounded-2xl' : 'h-10 w-10 rounded-xl';
	const text = size === 'lg' ? 'text-3xl' : 'text-2xl';
	return (
		<span className="flex items-center gap-2.5">
			{/* eslint-disable-next-line @next/next/no-img-element */}
			<img src={logoUrl} alt="" className={`${box} border-2 border-[var(--color-ink)] object-cover`} />
			<span className="flex flex-col">
				<span className={`heading-display ${text} leading-none text-[var(--color-ink)]`}>
					{siteConfig.logo.text}
					<span className="text-[var(--color-primary)]">{siteConfig.logo.accent}</span>
				</span>
				<span className="mt-1 text-[11px] font-semibold uppercase leading-none tracking-[0.14em] text-[var(--color-ink-muted)]">
					{siteConfig.logo.descriptor}
				</span>
			</span>
		</span>
	);
}
