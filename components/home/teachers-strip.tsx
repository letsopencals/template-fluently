import Link from 'next/link';
import type { Teacher } from '@/lib/catalog';
import { swatchFor } from '@/lib/subject-color';
import { SafeImage } from '@/components/ui/safe-image';
import { Reveal } from '@/components/motion/reveal';
import { SectionHeading } from './section-heading';

const TILTS = ['-rotate-2', 'rotate-1', '-rotate-1', 'rotate-2'];

/** Teacher card: portrait on the color of their first subject. Shared with /teachers. */
export function TeacherCard({ teacher: t, index = 0 }: { teacher: Teacher; index?: number }) {
	const swatch = swatchFor(t.subjects[0]?.color);
	return (
		<Link href={`/teachers/${t.slug}`} className="group block">
			<div
				className={`sticker relative aspect-[4/5] overflow-hidden rounded-[28px] transition-transform duration-300 group-hover:rotate-0 group-hover:-translate-y-1 ${TILTS[index % TILTS.length]}`}
				style={{ backgroundColor: swatch.bg }}
			>
				<div className="dots absolute inset-0 opacity-40" />
				<SafeImage src={t.image} alt={t.name} fill sizes="(min-width: 1024px) 22vw, 45vw" className="object-cover transition-transform duration-500 group-hover:scale-105" />
				{t.image ? null : (
					<span className="heading-display absolute inset-0 flex items-center justify-center text-7xl" style={{ color: swatch.ink }}>
						{t.firstName.charAt(0)}
					</span>
				)}
				<div className="absolute bottom-3 left-3 flex flex-wrap gap-1.5">
					{t.subjects.map((s) => (
						<span key={s.slug} className="rounded-full border-2 border-[var(--color-ink)] bg-white px-2.5 py-0.5 text-xs font-bold">
							{s.title}
						</span>
					))}
				</div>
			</div>
			<p className="mt-4 font-[family-name:var(--font-display)] text-xl font-semibold text-[var(--color-ink)] group-hover:text-[var(--color-primary)]">
				{t.name}
			</p>
			<p className="mt-0.5 text-sm text-[var(--color-ink-muted)]">
				{[t.campuses.join(' & '), t.online ? 'Online' : null].filter(Boolean).join(' · ')}
			</p>
		</Link>
	);
}

/** A row of teacher cards with a link to the full list. */
export function TeachersStrip({ teachers, limit = 4 }: { teachers: Teacher[]; limit?: number }) {
	if (teachers.length === 0) return null;
	const shown = teachers.slice(0, limit);
	return (
		<section className="mx-auto max-w-[1320px] px-6 py-24 lg:px-10 lg:py-32">
			<SectionHeading
				eyebrow="Our teachers"
				title="Native speakers who love to chat"
				intro="Pick a teacher you like and book straight into their classes."
				action={
					<Link href="/teachers" className="link-underline font-semibold text-[var(--color-primary)]">
						All {teachers.length} teachers →
					</Link>
				}
			/>
			<ul className="mt-12 grid grid-cols-2 gap-x-5 gap-y-10 lg:grid-cols-4 lg:gap-x-8">
				{shown.map((t, i) => (
					<Reveal as="li" key={t.id} delay={i * 0.06}>
						<TeacherCard teacher={t} index={i} />
					</Reveal>
				))}
			</ul>
		</section>
	);
}
