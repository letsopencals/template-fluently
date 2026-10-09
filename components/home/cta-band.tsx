import Link from 'next/link';
import { siteConfig } from '@/lib/site-config';
import { buttonClasses } from '@/components/ui/button';
import { SafeImage } from '@/components/ui/safe-image';
import { Reveal } from '@/components/motion/reveal';

/** Closing call to action on a grape band with the mascot. */
export function CtaBand({ href }: { href: string }) {
	const c = siteConfig.cta;
	return (
		<section className="px-3 pb-24 lg:px-6 lg:pb-32">
			<div className="sticker dots relative mx-auto grid max-w-[1320px] items-center gap-8 overflow-hidden rounded-[36px] bg-[var(--color-primary)] p-8 text-white md:grid-cols-[1.4fr_1fr] lg:p-14">
				<Reveal>
					<h2 className="heading-display text-[clamp(2.2rem,5vw,4rem)]">{c.title}</h2>
					<p className="mt-4 max-w-lg text-lg text-white/85">{c.body}</p>
					<Link href={href} className={buttonClasses('accent', 'lg', { className: 'mt-8' })}>
						{c.button} →
					</Link>
				</Reveal>
				<div className="relative mx-auto aspect-square w-full max-w-[300px]">
					<SafeImage src="/images/mascot-wave.png" alt="" fill sizes="300px" className="object-contain" />
				</div>
			</div>
		</section>
	);
}
