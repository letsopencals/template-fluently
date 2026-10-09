'use client';

import Link from 'next/link';
import { useLocation } from '@/contexts/location-context';
import { useTimezone } from '@/contexts/timezone-context';
import { useSettings } from '@/contexts/settings-context';
import { siteConfig } from '@/lib/site-config';
import { storeContact } from '@/lib/contact';

function FooterSettings() {
	const { locations, selectedLocationId, setSelectedLocationId } = useLocation();
	const { timezone, setTimezone } = useTimezone();

	// Online locations are never globally selectable — they only apply inside the
	// booking flow of the services they’re attached to.
	const selectableLocations = locations.filter((l) => l.type !== 'online');
	const hasLocations = selectableLocations.length > 1;

	return (
		<div className="flex flex-wrap items-center gap-6">
			{hasLocations && (
				<div className="flex items-center gap-2">
					<svg className="h-3.5 w-3.5 text-white/50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
						<path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
						<path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
					</svg>
					<select
						value={selectedLocationId ?? ''}
						onChange={(e) => setSelectedLocationId(e.target.value || null)}
						className="border-none bg-transparent text-xs text-white/70 outline-none hover:text-white focus:text-white"
					>
						<option value="" className="bg-[var(--color-bg-deep)] text-[var(--color-ink)]">All Locations</option>
						{selectableLocations.map((l) => (
							<option key={l.id} value={l.id} className="bg-[var(--color-bg-deep)] text-[var(--color-ink)]">
								{l.title ?? 'Location'}
							</option>
						))}
					</select>
				</div>
			)}
			<div className="flex items-center gap-2">
				<svg className="h-3.5 w-3.5 text-white/50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
					<path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
				</svg>
				<select
					value={timezone}
					onChange={(e) => setTimezone(e.target.value)}
					className="max-w-[200px] border-none bg-transparent text-xs text-white/70 outline-none hover:text-white focus:text-white"
				>
					{Intl.supportedValuesOf('timeZone').map((tz) => (
						<option key={tz} value={tz} className="bg-[var(--color-bg-deep)] text-[var(--color-ink)]">
							{tz.replace(/_/g, ' ')}
						</option>
					))}
				</select>
			</div>
		</div>
	);
}

export function Footer() {
	const { settings } = useSettings();
	const { email, phone } = storeContact(settings);

	return (
		<footer className="px-3 pb-3 lg:px-6 lg:pb-6">
			<div className="dots relative mx-auto max-w-[1320px] overflow-hidden rounded-[36px] border-2 border-[var(--color-ink)] bg-[var(--color-ink)] text-white">
				<div className="grid gap-12 px-8 py-16 md:grid-cols-2 lg:grid-cols-12 lg:px-14">
					<div className="lg:col-span-5">
						<Link href="/" className="inline-flex items-center gap-2.5">
							{/* eslint-disable-next-line @next/next/no-img-element */}
							<img src={settings?.storefrontSettings?.logoImage?.url ?? '/logo.svg'} alt="" className="h-12 w-12 rounded-2xl border-2 border-white object-cover" />
							<span className="heading-display text-3xl">
								{siteConfig.logo.text}
								<span className="text-[var(--color-sun)]">{siteConfig.logo.accent}</span>
							</span>
						</Link>
						<p className="mt-6 max-w-sm text-[0.95rem] leading-relaxed text-white/70">{siteConfig.footer.description}</p>
						<div className="mt-8 flex flex-wrap gap-2">
							{siteConfig.footer.socials.map((social) => (
								<a
									key={social.label}
									href={social.href}
									target="_blank"
									rel="noopener noreferrer"
									className="rounded-full border-2 border-white/25 px-4 py-1.5 text-sm font-semibold transition-colors hover:border-[var(--color-sun)] hover:text-[var(--color-sun)]"
								>
									{social.label}
								</a>
							))}
						</div>
					</div>

					<FooterColumn title="Explore" links={siteConfig.footer.exploreLinks} />
					<FooterColumn title="School" links={siteConfig.footer.companyLinks} />

					<div className="lg:col-span-3">
						<h4 className="heading-display text-lg text-[var(--color-sun)]">Say hello</h4>
						<ul className="mt-5 space-y-3 text-[0.95rem] text-white/80">
							<li>
								<a href={`mailto:${email}`} className="hover:text-white">{email}</a>
							</li>
							<li>
								<a href={`tel:${phone.replace(/[^+\d]/g, '')}`} className="hover:text-white">{phone}</a>
							</li>
							<li>{siteConfig.contact.hours}</li>
						</ul>
					</div>
				</div>

				<div className="flex flex-col items-center justify-between gap-4 border-t border-white/15 px-8 py-6 md:flex-row lg:px-14">
					<FooterSettings />
					<p className="text-xs text-white/50">
						&copy; {new Date().getFullYear()} {siteConfig.name}. Powered by{' '}
						<a href="https://opencals.com" target="_blank" rel="noopener noreferrer" className="text-white/80 hover:text-[var(--color-sun)]">
							Opencals
						</a>
					</p>
				</div>
			</div>
		</footer>
	);
}

function FooterColumn({ title, links }: { title: string; links: ReadonlyArray<{ label: string; href: string }> }) {
	return (
		<div className="lg:col-span-2">
			<h4 className="heading-display text-lg text-[var(--color-sun)]">{title}</h4>
			<ul className="mt-5 space-y-3">
				{links.map((link) => (
					<li key={link.href}>
						<Link href={link.href} className="text-[0.95rem] text-white/80 transition-colors hover:text-white">
							{link.label}
						</Link>
					</li>
				))}
			</ul>
		</div>
	);
}
