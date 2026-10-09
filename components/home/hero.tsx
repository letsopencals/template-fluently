import Link from 'next/link';
import { siteConfig } from '@/lib/site-config';
import type { Teacher } from '@/lib/catalog';
import { buttonClasses } from '@/components/ui/button';
import { SafeImage } from '@/components/ui/safe-image';
import { Reveal } from '@/components/motion/reveal';

/** Bubble placement around the mascot (percentages of the art box) and color. */
const BUBBLE_SPOTS = [
	{ className: 'left-[2%] top-[10%]', bg: 'var(--color-coral)', ink: '#fff', r: '-6deg', delay: '0s' },
	{ className: 'right-[4%] top-[4%]', bg: 'var(--color-sky)', ink: 'var(--color-ink)', r: '5deg', delay: '-1.5s' },
	{ className: 'left-[-2%] top-[52%]', bg: 'var(--color-mint)', ink: 'var(--color-ink)', r: '4deg', delay: '-3s' },
	{ className: 'right-[-1%] top-[44%]', bg: 'var(--color-bubblegum)', ink: 'var(--color-ink)', r: '-4deg', delay: '-2s' },
	{ className: 'left-[14%] bottom-[4%]', bg: 'var(--color-sun)', ink: 'var(--color-ink)', r: '-3deg', delay: '-4s' },
	{ className: 'right-[12%] bottom-[8%]', bg: '#fff', ink: 'var(--color-ink)', r: '6deg', delay: '-0.8s' },
] as const;

export interface HeroProps {
	teachers: Teacher[];
	/** Booking link of the free trial when the store has one, else the catalog. */
	primaryHref: string;
}

/** Headline, CTAs, teacher avatar stack and the mascot in a cloud of greetings. */
export function Hero({ teachers, primaryHref }: HeroProps) {
	const h = siteConfig.hero;
	const faces = teachers.filter((t) => t.image).slice(0, 5);

	return (
		<section className="relative overflow-hidden pt-28 pb-16 lg:pt-36 lg:pb-24">
			<div aria-hidden className="pointer-events-none absolute -left-24 top-24 h-72 w-72 rounded-full bg-[var(--color-tint)] blur-3xl" />
			<div aria-hidden className="pointer-events-none absolute -right-20 bottom-0 h-80 w-80 rounded-full bg-[var(--color-sun)]/30 blur-3xl" />

			<div className="relative mx-auto grid max-w-[1320px] items-center gap-14 px-6 lg:grid-cols-[1.05fr_1fr] lg:px-10">
				<div>
					<Reveal>
						<span className="sticker-sm inline-flex items-center gap-2 rounded-full bg-white px-4 py-1.5 text-sm font-semibold">
							<span className="h-2 w-2 rounded-full bg-[var(--color-mint)]" />
							{h.eyebrow}
						</span>
					</Reveal>
					<Reveal delay={0.05}>
						<h1 className="heading-display mt-6 text-[clamp(2.8rem,7vw,5.6rem)] leading-[0.98] text-[var(--color-ink)]">
							{h.titleBefore} <span className="marker">{h.titleHighlight}</span>
						</h1>
					</Reveal>
					<Reveal delay={0.12}>
						<p className="mt-6 max-w-xl text-lg leading-relaxed text-[var(--color-ink-muted)] sm:text-xl">{h.subtitle}</p>
					</Reveal>
					<Reveal delay={0.18} className="mt-9 flex flex-wrap gap-4">
						<Link href={primaryHref} className={buttonClasses('primary', 'lg')}>
							{h.primaryCta}
							<span aria-hidden>→</span>
						</Link>
						<Link href="/classes" className={buttonClasses('outline', 'lg')}>
							{h.secondaryCta}
						</Link>
					</Reveal>

					{faces.length > 0 ? (
						<Reveal delay={0.26} className="mt-10 flex items-center gap-4">
							<Link href="/teachers" className="flex -space-x-3" aria-label={h.teachersNote}>
								{faces.map((t, i) => (
									<span
										key={t.id}
										className="image-placeholder relative h-12 w-12 overflow-hidden rounded-full border-2 border-[var(--color-ink)] transition-transform hover:-translate-y-1"
										style={{ zIndex: faces.length - i }}
									>
										<SafeImage src={t.image} alt={t.name} fill sizes="48px" className="object-cover" />
									</span>
								))}
							</Link>
							<svg aria-hidden viewBox="0 0 60 40" className="h-8 w-12 -scale-x-100 text-[var(--color-ink)]" fill="none">
								<path d="M4 30 C 18 6, 40 4, 54 18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
								<path d="M46 12 L 55 19 L 45 23" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
							</svg>
							<p className="max-w-[12rem] font-[family-name:var(--font-display)] text-base font-medium leading-snug">
								{h.teachersNote}
							</p>
						</Reveal>
					) : null}
				</div>

				<div className="relative mx-auto aspect-square w-full max-w-[560px]">
					<div className="dots absolute inset-[8%] rounded-[44%_56%_52%_48%/48%_44%_56%_52%] border-2 border-[var(--color-ink)] bg-[var(--color-primary)] shadow-[0_8px_0_0_var(--color-ink)]" />
					<div className="absolute inset-[14%] rounded-full bg-[var(--color-primary-bright)]/60 blur-2xl" />
					<div className="absolute inset-[6%]">
						<SafeImage src="/images/mascot-hero.png" alt="" fill priority sizes="(min-width: 1024px) 40vw, 90vw" className="object-contain drop-shadow-[0_18px_24px_rgba(22,19,31,0.25)]" />
					</div>
					{h.bubbles.map((text, i) => {
						const spot = BUBBLE_SPOTS[i % BUBBLE_SPOTS.length]!;
						return (
							<span
								key={text}
								aria-hidden
								className={`bubble animate-float absolute whitespace-nowrap px-4 py-2 font-[family-name:var(--font-display)] text-lg font-semibold shadow-[0_4px_0_0_var(--color-ink)] sm:text-xl ${spot.className}`}
								style={
									{
										backgroundColor: spot.bg,
										color: spot.ink,
										'--r': spot.r,
										animationDelay: spot.delay,
									} as React.CSSProperties
								}
							>
								{text}
							</span>
						);
					})}
				</div>
			</div>
		</section>
	);
}
