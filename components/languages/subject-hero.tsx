import Link from 'next/link';
import type { Subject } from '@/lib/catalog';
import { swatchFor } from '@/lib/subject-color';
import { buttonClasses } from '@/components/ui/button';
import { SafeImage } from '@/components/ui/safe-image';
import { Reveal } from '@/components/motion/reveal';

/** Big colored band for one subject (language), in its dashboard color. */
export function SubjectHero({ subject, classCount, teacherCount }: { subject: Subject; classCount: number; teacherCount: number }) {
	const swatch = swatchFor(subject.color);
	return (
		<section className="px-3 pt-24 lg:px-6 lg:pt-28">
			<div
				className="sticker relative mx-auto grid max-w-[1400px] items-center gap-8 overflow-hidden rounded-[36px] p-8 md:grid-cols-[1.3fr_1fr] lg:p-14"
				style={{ backgroundColor: swatch.bg, color: swatch.ink }}
			>
				<div className="dots pointer-events-none absolute inset-0 opacity-40" />
				<Reveal className="relative">
					<Link href="/classes" className="text-sm font-semibold opacity-80 hover:opacity-100">
						← All classes
					</Link>
					<h1 className="heading-display mt-4 text-[clamp(3rem,8vw,6.5rem)] leading-none">{subject.title}</h1>
					{subject.description ? <p className="mt-5 max-w-xl text-lg font-medium opacity-90">{subject.description}</p> : null}
					<div className="mt-6 flex flex-wrap gap-2 text-sm font-bold text-[var(--color-ink)]">
						<span className="rounded-full border-2 border-[var(--color-ink)] bg-white px-3 py-1">
							{classCount} {classCount === 1 ? 'class' : 'classes'}
						</span>
						{teacherCount > 0 ? (
							<span className="rounded-full border-2 border-[var(--color-ink)] bg-[var(--color-sun)] px-3 py-1">
								{teacherCount} {teacherCount === 1 ? 'teacher' : 'teachers'}
							</span>
						) : null}
					</div>
					<a href="#classes" className={buttonClasses('outline', 'lg', { className: 'mt-8' })}>
						See the classes ↓
					</a>
				</Reveal>
				<div className="relative mx-auto aspect-square w-full max-w-[380px]">
					<div className="absolute inset-[8%] rounded-full bg-white/40" />
					<SafeImage src={subject.image} alt="" fill priority sizes="380px" className="object-contain" />
				</div>
			</div>
		</section>
	);
}
