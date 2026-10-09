import { getTeachers, getTimetable } from '@/lib/server-data';
import { SectionHeading } from '@/components/home/section-heading';
import { TimetableBoard, type TimetableTeacher } from './timetable-board';

/**
 * "This week" board of upcoming group sessions with live seats left. Async, so
 * the page streams it inside <Suspense> while the availability fan-out runs.
 */
export async function TimetableSection() {
	const [sessions, teachers] = await Promise.all([getTimetable(), getTeachers()]);
	if (sessions.length === 0) return null;
	const teacherMap: Record<string, TimetableTeacher> = {};
	for (const t of teachers) teacherMap[t.id] = { name: t.name, firstName: t.firstName, image: t.image };

	return (
		<TimetableShell>
			<TimetableBoard sessions={sessions} teachers={teacherMap} />
		</TimetableShell>
	);
}

/** Heading + band shared by the section and its loading fallback. */
export function TimetableShell({ children }: { children: React.ReactNode }) {
	return (
		<section id="timetable" className="scroll-mt-28 bg-[var(--color-bg-deep)] py-24 lg:py-32">
			<div className="mx-auto max-w-[1320px] px-6 lg:px-10">
				<SectionHeading
					eyebrow="Live timetable"
					title="This week at Fluently"
					intro="Group classes for the next seven days, with the seats still free. Tap one to book it."
				/>
				<div className="mt-12">{children}</div>
			</div>
		</section>
	);
}

/** Streaming placeholder: day tabs and rows as soft blocks. */
export function TimetableSkeleton() {
	return (
		<TimetableShell>
			<div aria-hidden className="animate-pulse">
				<div className="flex gap-3 overflow-hidden">
					{Array.from({ length: 7 }, (_, i) => (
						<div key={i} className="h-20 w-24 shrink-0 rounded-2xl bg-white/70" />
					))}
				</div>
				<div className="mt-8 space-y-3">
					{Array.from({ length: 4 }, (_, i) => (
						<div key={i} className="h-20 rounded-[22px] bg-white/70" />
					))}
				</div>
			</div>
		</TimetableShell>
	);
}
