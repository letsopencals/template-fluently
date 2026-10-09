import { siteConfig } from '@/lib/site-config';

/**
 * Roadmap teaser for class materials and chat. Deliberately shows no fake
 * data: it's a labelled "coming soon" card until those features exist.
 */
export function ComingSoonCard() {
	const { title, body } = siteConfig.comingSoon;
	return (
		<section className="dots relative overflow-hidden rounded-[28px] border-2 border-[var(--color-ink)] bg-[var(--color-tint)] p-6 lg:p-7">
			<span className="sticker-sm inline-block -rotate-2 rounded-full bg-[var(--color-bubblegum)] px-3 py-1 text-xs font-bold text-[var(--color-ink)]">
				Coming soon
			</span>
			<h2 className="mt-4 font-[family-name:var(--font-display)] text-xl font-semibold text-[var(--color-ink)]">{title}</h2>
			<p className="mt-2 text-sm leading-relaxed text-[var(--color-ink-muted)]">{body}</p>
			<div aria-hidden className="mt-5 flex gap-2">
				<span className="bubble bg-white px-3 py-1.5 text-sm">📎 Slides</span>
				<span className="bubble bg-white px-3 py-1.5 text-sm">💬 Chat</span>
			</div>
		</section>
	);
}
