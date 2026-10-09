import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { siteConfig } from '@/lib/site-config';
import { classFormat, groupKey, isGroup } from '@/lib/catalog';
import { getProducts, getStoreSettings, getSubject, getSubjects, getTeachers } from '@/lib/server-data';
import { SubjectHero } from '@/components/languages/subject-hero';
import { ClassSection } from '@/components/languages/class-section';
import { TeachersStrip } from '@/components/home/teachers-strip';

type Params = Promise<{ slug: string }>;

export async function generateStaticParams() {
	const subjects = await getSubjects();
	return subjects.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
	const { slug } = await params;
	const subject = await getSubject(slug);
	if (!subject) return {};
	return {
		title: `${subject.title} classes in New York & online`,
		description: subject.description || `${subject.title} group and private lessons at ${siteConfig.name}.`,
		alternates: { canonical: `/languages/${slug}` },
	};
}

export default async function LanguagePage({ params }: { params: Params }) {
	const { slug } = await params;
	const [subject, products, teachers, settings] = await Promise.all([getSubject(slug), getProducts(), getTeachers(), getStoreSettings()]);
	if (!subject) notFound();

	const classes = products.filter((p) => subject.groupKeys.includes(groupKey(p)));
	const groups = classes.filter(isGroup);
	const privates = classes.filter((p) => !isGroup(p) && classFormat(p) !== 'trial');
	const trials = classes.filter((p) => classFormat(p) === 'trial');
	const subjectTeachers = teachers.filter((t) => t.subjects.some((s) => s.slug === slug));
	const currency = settings?.currency ?? siteConfig.currency;
	const subjectFor = () => subject;

	return (
		<>
			<SubjectHero subject={subject} classCount={classes.length} teacherCount={subjectTeachers.length} />
			<div id="classes" className="mx-auto max-w-[1320px] scroll-mt-28 space-y-16 px-6 py-20 lg:px-10">
				<ClassSection
					title="Group classes"
					intro="Pick your level. Each card shows the group size, the place and the price per lesson."
					products={groups}
					subjectFor={subjectFor}
					currency={currency}
				/>
				<ClassSection
					title="Private lessons"
					intro="One-to-one with a teacher, at a campus or online."
					products={privates}
					subjectFor={subjectFor}
					currency={currency}
				/>
				<ClassSection title="Try it first" products={trials} subjectFor={subjectFor} currency={currency} />
			</div>
			<TeachersStrip teachers={subjectTeachers} limit={8} />
		</>
	);
}
