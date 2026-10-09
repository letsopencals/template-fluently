import { siteConfig } from '@/lib/site-config';
import { getLocations, getStarterClasses, getTeachers } from '@/lib/server-data';
import { classFormat } from '@/lib/catalog';
import { PageHeading } from '@/components/ui/page-heading';
import { Reveal } from '@/components/motion/reveal';
import { PhotoGallery } from '@/components/about/photo-gallery';
import { ValuesGrid } from '@/components/about/values-grid';
import { CampusesStrip } from '@/components/home/campuses-strip';
import { TeachersStrip } from '@/components/home/teachers-strip';
import { CtaBand } from '@/components/home/cta-band';

export default async function AboutPage() {
	const a = siteConfig.about;
	const [locations, teachers, starter] = await Promise.all([getLocations(), getTeachers(), getStarterClasses()]);
	const trial = starter.find((p) => classFormat(p) === 'trial');
	const trialHref = trial ? `/booking/${trial.variants?.[0]?.slug ?? trial.slug}` : '/classes';

	return (
		<>
			<PageHeading eyebrow={a.eyebrow} title={a.title} />
			<div className="mx-auto max-w-[1320px] px-6 lg:px-10">
				<PhotoGallery photos={a.gallery} />
				<Reveal className="mx-auto mt-20 max-w-3xl space-y-5 text-xl leading-relaxed text-[var(--color-ink-muted)]">
					{a.storyParagraphs.map((p) => (
						<p key={p.slice(0, 24)}>{p}</p>
					))}
				</Reveal>
				<div className="mt-20">
					<ValuesGrid values={a.values} />
				</div>
			</div>
			<CampusesStrip locations={locations} />
			<TeachersStrip teachers={teachers} />
			<CtaBand href={trialHref} />
		</>
	);
}
