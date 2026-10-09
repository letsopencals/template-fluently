import { siteConfig } from '@/lib/site-config';
import { Reveal } from '@/components/motion/reveal';

/**
 * Looping, muted brand clip. The poster (and the colored band behind it) show
 * when the video is missing or motion is reduced (autoplay is a no-op there in
 * most browsers; the clip has no essential content).
 */
export function VideoBand() {
	const v = siteConfig.videoBand;
	return (
		<section className="px-3 lg:px-6">
			<div className="sticker relative mx-auto max-w-[1400px] overflow-hidden rounded-[36px] bg-[var(--color-primary)]">
				<div className="dots absolute inset-0 opacity-30" />
				<video
					className="relative aspect-[16/9] w-full object-cover sm:aspect-[21/9] motion-reduce:hidden"
					src={v.src}
					poster={v.poster}
					autoPlay
					muted
					loop
					playsInline
					preload="metadata"
					aria-hidden
				/>
				<div
					aria-hidden
					className="relative hidden aspect-[16/9] w-full bg-cover bg-center sm:aspect-[21/9] motion-reduce:block"
					style={{ backgroundImage: `url(${v.poster})` }}
				/>
				<div className="absolute inset-0 bg-gradient-to-t from-[var(--color-ink)]/70 via-transparent to-transparent" />
				<Reveal className="absolute inset-x-0 bottom-0 p-6 sm:p-10 lg:p-14">
					<h2 className="heading-display max-w-2xl text-[clamp(1.8rem,4.5vw,3.8rem)] text-white">{v.title}</h2>
					<p className="mt-3 max-w-xl text-base text-white/85 sm:text-lg">{v.body}</p>
				</Reveal>
			</div>
		</section>
	);
}
