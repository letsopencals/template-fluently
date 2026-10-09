'use client';

import { useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { clsx } from 'clsx';
import { siteConfig } from '@/lib/site-config';
import { buttonClasses } from '@/components/ui/button';
import { SafeImage } from '@/components/ui/safe-image';

const STEP_MOTION = {
	initial: { opacity: 0, x: 24 },
	animate: { opacity: 1, x: 0 },
	exit: { opacity: 0, x: -24 },
	transition: { duration: 0.25, ease: [0.22, 1, 0.36, 1] },
} as const;

const OPTION_COLORS = ['var(--color-coral)', 'var(--color-sun)', 'var(--color-mint)'];

/**
 * Five-question self-assessment (client only, nothing is sent anywhere).
 * Each answer scores 0–2; the total maps to a level band in siteConfig.quiz.
 */
export function LevelQuiz({ trialHref }: { trialHref: string }) {
	const quiz = siteConfig.quiz;
	const [answers, setAnswers] = useState<number[]>([]);
	const step = answers.length;
	const done = step >= quiz.questions.length;
	const question = quiz.questions[step];
	const score = answers.reduce((a, b) => a + b, 0);
	const level = quiz.levels.find((l) => score <= l.max) ?? quiz.levels[quiz.levels.length - 1]!;

	return (
		<section className="px-3 py-24 lg:px-6 lg:py-32">
			<div className="sticker dots relative mx-auto grid max-w-[1320px] items-center gap-10 overflow-hidden rounded-[36px] bg-[var(--color-sun)] p-8 lg:grid-cols-[1fr_1.2fr] lg:p-14">
				<div>
					<span className="sticker-sm inline-block -rotate-2 rounded-full bg-white px-3.5 py-1 text-xs font-bold">{quiz.eyebrow}</span>
					<h2 className="heading-display mt-4 text-[clamp(2rem,4.5vw,3.5rem)] text-[var(--color-ink)]">{quiz.title}</h2>
					<p className="mt-4 text-lg text-[var(--color-ink)]/80">{quiz.subtitle}</p>
					<div className="relative mx-auto mt-8 hidden aspect-square w-56 lg:block">
						<SafeImage src="/images/mascot-thinking.png" alt="" fill sizes="224px" className="object-contain" />
					</div>
				</div>

				<div className="relative min-h-[360px] rounded-[28px] border-2 border-[var(--color-ink)] bg-white p-6 sm:p-8">
					<div className="mb-6 flex gap-1.5" aria-hidden>
						{quiz.questions.map((q, i) => (
							<span key={q.q} className={clsx('h-2 flex-1 rounded-full', i < step ? 'bg-[var(--color-primary)]' : 'bg-[var(--color-line)]')} />
						))}
					</div>
					<AnimatePresence mode="wait" initial={false}>
						{done ? (
							<motion.div key="result" {...STEP_MOTION} aria-live="polite">
								<p className="text-sm font-semibold text-[var(--color-ink-muted)]">Your starting point</p>
								<p className="heading-display mt-2 text-5xl text-[var(--color-primary)]">{level.label}</p>
								<p className="mt-4 text-lg text-[var(--color-ink-muted)]">{level.note}</p>
								<div className="mt-8 flex flex-wrap gap-3">
									<Link href={`/classes?level=${level.code}`} className={buttonClasses('primary', 'md')}>
										See {level.code} classes →
									</Link>
									<Link href={trialHref} className={buttonClasses('outline', 'md')}>
										Check with a teacher (free)
									</Link>
								</div>
								<button
									type="button"
									onClick={() => setAnswers([])}
									className="mt-6 text-sm font-semibold text-[var(--color-ink-muted)] underline-offset-4 hover:underline"
								>
									Start again
								</button>
							</motion.div>
						) : question ? (
							<motion.div key={step} {...STEP_MOTION}>
								<p className="text-sm font-semibold text-[var(--color-ink-muted)]">
									Question {step + 1} of {quiz.questions.length}
								</p>
								<p className="mt-2 font-[family-name:var(--font-display)] text-2xl font-semibold leading-snug text-[var(--color-ink)] sm:text-3xl">
									{question.q}
								</p>
								<div className="mt-8 grid gap-3">
									{question.options.map((opt, i) => (
										<button
											key={opt}
											type="button"
											onClick={() => setAnswers((a) => [...a, i])}
											className="group flex items-center gap-4 rounded-2xl border-2 border-[var(--color-ink)] bg-white px-5 py-4 text-left font-semibold transition-all hover:-translate-y-0.5 hover:shadow-[0_4px_0_0_var(--color-ink)]"
										>
											<span
												className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-[var(--color-ink)] text-sm font-bold"
												style={{ backgroundColor: OPTION_COLORS[i % OPTION_COLORS.length] }}
											>
												{String.fromCharCode(65 + i)}
											</span>
											{opt}
										</button>
									))}
								</div>
								{step > 0 ? (
									<button
										type="button"
										onClick={() => setAnswers((a) => a.slice(0, -1))}
										className="mt-6 text-sm font-semibold text-[var(--color-ink-muted)] underline-offset-4 hover:underline"
									>
										← Back
									</button>
								) : null}
							</motion.div>
						) : null}
					</AnimatePresence>
				</div>
			</div>
		</section>
	);
}
