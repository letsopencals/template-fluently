import Link from 'next/link';
import type { Teacher } from '@/lib/catalog';
import { swatchFor } from '@/lib/subject-color';
import { SafeImage } from '@/components/ui/safe-image';
import { Reveal } from '@/components/motion/reveal';

/** Portrait + name, subjects and where they teach. */
export function TeacherProfile({ teacher: t, classCount }: { teacher: Teacher; classCount: number }) {
	const swatch = swatchFor(t.subjects[0]?.color);
	return (
		<section className="mx-auto grid max-w-[1320px] items-center gap-10 px-6 pt-32 pb-12 md:grid-cols-[minmax(0,420px)_1fr] lg:px-10 lg:pt-40">
			<Reveal>
				<div className="sticker relative aspect-[4/5] -rotate-2 overflow-hidden rounded-[32px]" style={{ backgroundColor: swatch.bg }}>
					<div className="dots absolute inset-0 opacity-40" />
					<SafeImage src={t.image} alt={t.name} fill priority sizes="420px" className="object-cover" />
					{t.image ? null : (
						<span className="heading-display absolute inset-0 flex items-center justify-center text-9xl" style={{ color: swatch.ink }}>
							{t.firstName.charAt(0)}
						</span>
					)}
				</div>
			</Reveal>
			<Reveal delay={0.08}>
				<Link href="/teachers" className="text-sm font-semibold text-[var(--color-ink-muted)] hover:text-[var(--color-primary)]">
					← All teachers
				</Link>
				<p className="bubble mt-6 inline-block bg-[var(--color-sun)] px-4 py-2 font-[family-name:var(--font-display)] text-xl font-semibold">
					Hi, I’m {t.firstName}!
				</p>
				<h1 className="heading-display mt-6 text-[clamp(2.6rem,6vw,5rem)] text-[var(--color-ink)]">{t.name}</h1>
				<div className="mt-6 flex flex-wrap gap-2">
					{t.subjects.map((s) => {
						const sw = swatchFor(s.color);
						return (
							<Link
								key={s.slug}
								href={`/languages/${s.slug}`}
								className="rounded-full border-2 border-[var(--color-ink)] px-3.5 py-1 text-sm font-bold transition-transform hover:-translate-y-0.5"
								style={{ backgroundColor: sw.bg, color: sw.ink }}
							>
								{s.title}
							</Link>
						);
					})}
				</div>
				<dl className="mt-8 grid max-w-md grid-cols-2 gap-3">
					<div className="rounded-2xl bg-[var(--color-bg-deep)] px-4 py-3">
						<dt className="text-xs font-semibold text-[var(--color-ink-muted)]">Teaches at</dt>
						<dd className="mt-0.5 font-semibold">{[...t.campuses, t.online ? 'Online' : null].filter(Boolean).join(', ') || '—'}</dd>
					</div>
					<div className="rounded-2xl bg-[var(--color-bg-deep)] px-4 py-3">
						<dt className="text-xs font-semibold text-[var(--color-ink-muted)]">Classes</dt>
						<dd className="tabular mt-0.5 font-semibold">{classCount}</dd>
					</div>
				</dl>
			</Reveal>
		</section>
	);
}
