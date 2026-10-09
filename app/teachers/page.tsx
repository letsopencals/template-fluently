import type { Metadata } from 'next';
import { siteConfig } from '@/lib/site-config';
import { getTeachers } from '@/lib/server-data';
import { PageHeading } from '@/components/ui/page-heading';
import { Reveal } from '@/components/motion/reveal';
import { TeacherCard } from '@/components/home/teachers-strip';

export const metadata: Metadata = {
	title: 'Teachers',
	description: `Meet the native-speaker teachers at ${siteConfig.name} and book straight into their classes.`,
	alternates: { canonical: '/teachers' },
};

export default async function TeachersPage() {
	const teachers = await getTeachers();
	return (
		<>
			<PageHeading eyebrow="Our teachers" title="Say hi to your teachers" intro="Native speakers and trained educators. Pick someone you like and book their classes." />
			<ul className="mx-auto grid max-w-[1320px] grid-cols-2 gap-x-5 gap-y-12 px-6 pb-28 lg:grid-cols-4 lg:gap-x-8 lg:px-10">
				{teachers.map((t, i) => (
					<Reveal as="li" key={t.id} delay={(i % 4) * 0.05}>
						<TeacherCard teacher={t} index={i} />
					</Reveal>
				))}
			</ul>
		</>
	);
}
