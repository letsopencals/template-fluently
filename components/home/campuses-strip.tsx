import type { LocationDetailResponse } from '@opencals/storefront-sdk';
import { siteConfig } from '@/lib/site-config';
import { Reveal } from '@/components/motion/reveal';
import { SectionHeading } from './section-heading';

const COLORS = ['var(--color-coral)', 'var(--color-sky)', 'var(--color-mint)', 'var(--color-bubblegum)'];

function addressLines(l: LocationDetailResponse): string[] {
	if (l.displayAddress) return l.displayAddress.split('\n');
	const cityLine = [l.city, [l.state, l.postalCode].filter(Boolean).join(' ')].filter(Boolean).join(', ');
	return [l.addressLine1, l.addressLine2, cityLine].filter((x): x is string => !!x);
}

function mapHref(l: LocationDetailResponse): string {
	return `https://maps.google.com/?q=${encodeURIComponent(addressLines(l).join(', '))}`;
}

/** Campuses (physical locations) plus the online classroom, from the API. */
export function CampusesStrip({ locations }: { locations: LocationDetailResponse[] }) {
	const campuses = locations.filter((l) => l.type === siteConfig.locationTypes.physical);
	const online = locations.find((l) => l.type === siteConfig.locationTypes.online);
	if (campuses.length === 0 && !online) return null;

	return (
		<section className="mx-auto max-w-[1320px] px-6 py-24 lg:px-10 lg:py-28">
			<SectionHeading eyebrow="Where we teach" title="Two front doors and a laptop" align="center" />
			<ul className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
				{campuses.map((l, i) => (
					<Reveal as="li" key={l.id} delay={i * 0.06}>
						<a
							href={mapHref(l)}
							target="_blank"
							rel="noopener noreferrer"
							className="sticker group flex h-full flex-col rounded-[28px] p-7 transition-transform hover:-translate-y-1"
							style={{ backgroundColor: COLORS[i % COLORS.length] }}
						>
							<span className="text-3xl" aria-hidden>🏫</span>
							<h3 className="heading-display mt-4 text-2xl text-[var(--color-ink)]">{l.title}</h3>
							<p className="mt-2 text-sm font-medium leading-relaxed text-[var(--color-ink)]/80">
								{addressLines(l).map((line) => (
									<span key={line} className="block">{line}</span>
								))}
							</p>
							<span className="mt-auto pt-6 text-sm font-bold text-[var(--color-ink)] group-hover:underline">Get directions →</span>
						</a>
					</Reveal>
				))}
				{online ? (
					<Reveal as="li" delay={campuses.length * 0.06}>
						<div className="sticker dots flex h-full flex-col rounded-[28px] bg-[var(--color-primary)] p-7 text-white">
							<span className="text-3xl" aria-hidden>💻</span>
							<h3 className="heading-display mt-4 text-2xl">{online.title}</h3>
							<p className="mt-2 text-sm font-medium leading-relaxed text-white/85">
								Live lessons in your browser. Your link and a Join button appear in your account before every lesson.
							</p>
						</div>
					</Reveal>
				) : null}
			</ul>
		</section>
	);
}
