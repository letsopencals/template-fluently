import { Suspense } from 'react';
import { siteConfig } from '@/lib/site-config';
import { classFormat, fromPrice, isGroup, type ClassFormat } from '@/lib/catalog';
import {
	getLocations,
	getProducts,
	getStarterClasses,
	getStoreSettings,
	getSubjects,
	getTeachers,
} from '@/lib/server-data';
import { Hero } from '@/components/home/hero';
import { StatTiles, type Stat } from '@/components/home/stat-tiles';
import { LanguageGrid } from '@/components/home/language-grid';
import { FormatSwitcher, type FormatItem } from '@/components/home/format-switcher';
import { SectionHeading } from '@/components/home/section-heading';
import { TimetableSection, TimetableSkeleton } from '@/components/home/timetable/timetable-section';
import { TeachersStrip } from '@/components/home/teachers-strip';
import { VideoBand } from '@/components/home/video-band';
import { LevelQuiz } from '@/components/home/level-quiz';
import { HowItWorks } from '@/components/home/how-it-works';
import { CampusesStrip } from '@/components/home/campuses-strip';
import { Testimonials } from '@/components/home/testimonials';
import { FaqSection } from '@/components/home/faq-section';
import { CtaBand } from '@/components/home/cta-band';

const FAQ_JSON_LD = {
	'@context': 'https://schema.org',
	'@type': 'FAQPage',
	mainEntity: siteConfig.faqs.map((f) => ({
		'@type': 'Question',
		name: f.question,
		acceptedAnswer: { '@type': 'Answer', text: f.answer },
	})),
};

export default async function HomePage() {
	const [products, subjects, teachers, locations, starter, settings] = await Promise.all([
		getProducts(),
		getSubjects(),
		getTeachers(),
		getLocations(),
		getStarterClasses(),
		getStoreSettings(),
	]);

	const trial = starter.find((p) => classFormat(p) === 'trial');
	const trialHref = trial ? `/booking/${trial.variants?.[0]?.slug ?? trial.slug}` : '/classes';

	const campusCount = locations.filter((l) => l.type === siteConfig.locationTypes.physical).length;
	const maxGroup = Math.max(0, ...products.filter(isGroup).map((p) => p.maxAttendees ?? 0));
	const stats: Stat[] = [
		{ value: subjects.length, label: subjects.length === 1 ? 'Language' : 'Languages' },
		{ value: teachers.length, label: 'Native-speaker teachers' },
		{ value: campusCount, label: campusCount === 1 ? 'NYC campus + online' : 'NYC campuses + online' },
		{ value: maxGroup, label: 'Students max per group' },
	].filter((s) => s.value > 0);

	const classCounts = Object.fromEntries(subjects.map((s) => [s.slug, s.groupKeys.length]));

	const formats: FormatItem[] = siteConfig.formats.map((f) => {
		const matching = products.filter((p) => classFormat(p) === (f.id as ClassFormat));
		return {
			...f,
			count: matching.length,
			fromPrice: matching.length ? Math.min(...matching.map(fromPrice)) : null,
		};
	});

	return (
		<>
			<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(FAQ_JSON_LD) }} />
			<Hero teachers={teachers} primaryHref={trialHref} />
			<StatTiles stats={stats} />
			<LanguageGrid subjects={subjects} classCounts={classCounts} />
			<section className="mx-auto max-w-[1320px] px-6 pb-24 lg:px-10 lg:pb-32">
				<SectionHeading eyebrow="Your way" title="Group, online or one-to-one" className="mb-10" />
				<FormatSwitcher items={formats} currency={settings?.currency ?? siteConfig.currency} />
			</section>
			<Suspense fallback={<TimetableSkeleton />}>
				<TimetableSection />
			</Suspense>
			<TeachersStrip teachers={teachers} />
			<VideoBand />
			<LevelQuiz trialHref={trialHref} />
			<HowItWorks />
			<CampusesStrip locations={locations} />
			<Testimonials />
			<FaqSection />
			<CtaBand href={trialHref} />
		</>
	);
}
