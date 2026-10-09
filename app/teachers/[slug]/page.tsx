import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { siteConfig } from '@/lib/site-config';
import { groupKey, isGroup, subjectOf } from '@/lib/catalog';
import { getProducts, getStoreSettings, getSubjects, getTeacher, getTeachers } from '@/lib/server-data';
import { TeacherProfile } from '@/components/teachers/teacher-profile';
import { ClassSection } from '@/components/languages/class-section';

type Params = Promise<{ slug: string }>;

export async function generateStaticParams() {
	const teachers = await getTeachers();
	return teachers.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
	const { slug } = await params;
	const t = await getTeacher(slug);
	if (!t) return {};
	const langs = t.subjects.map((s) => s.title).join(' & ');
	return {
		title: `${t.name}${langs ? `, ${langs} teacher` : ''}`,
		description: `Book ${langs || 'language'} lessons with ${t.firstName} at ${siteConfig.name}.`,
		alternates: { canonical: `/teachers/${slug}` },
	};
}

export default async function TeacherPage({ params }: { params: Params }) {
	const { slug } = await params;
	const [teacher, products, subjects, settings] = await Promise.all([getTeacher(slug), getProducts(), getSubjects(), getStoreSettings()]);
	if (!teacher) notFound();

	const classes = products.filter((p) => teacher.groupKeys.includes(groupKey(p)));
	const currency = settings?.currency ?? siteConfig.currency;
	const subjectFor = (p: (typeof products)[number]) => subjectOf(p, subjects);

	return (
		<>
			<TeacherProfile teacher={teacher} classCount={classes.length} />
			<div className="mx-auto max-w-[1320px] space-y-16 px-6 pb-28 lg:px-10">
				<ClassSection
					title={`Book with ${teacher.firstName}`}
					intro={`Group classes ${teacher.firstName} teaches. Booking opens with ${teacher.firstName} already picked.`}
					products={classes.filter(isGroup)}
					subjectFor={subjectFor}
					currency={currency}
					staffId={teacher.id}
				/>
				<ClassSection
					title="Private lessons"
					products={classes.filter((p) => !isGroup(p))}
					subjectFor={subjectFor}
					currency={currency}
					staffId={teacher.id}
				/>
			</div>
		</>
	);
}
