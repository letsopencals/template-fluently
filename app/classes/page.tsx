import type { Metadata } from 'next';
import { siteConfig } from '@/lib/site-config';
import { getProducts, getStoreSettings, getSubjects } from '@/lib/server-data';
import { PageHeading } from '@/components/ui/page-heading';
import { ClassCatalog } from '@/components/classes/class-catalog';

export const metadata: Metadata = {
	title: 'Classes',
	description: `Group, online and private language classes at ${siteConfig.name}. Filter by language, format and level.`,
	alternates: { canonical: '/classes' },
};

type Search = Record<string, string | string[] | undefined>;
const str = (v: string | string[] | undefined) => (typeof v === 'string' ? v : '');

export default async function ClassesPage({ searchParams }: { searchParams: Promise<Search> }) {
	const [sp, products, subjects, settings] = await Promise.all([searchParams, getProducts(), getSubjects(), getStoreSettings()]);

	return (
		<>
			<PageHeading eyebrow="All classes" title="Find your class" intro="Every class shows its group size, format and price. Pick a level to book." />
			<div className="mx-auto max-w-[1320px] px-6 pb-28 lg:px-10">
				<ClassCatalog
					products={products}
					subjects={subjects}
					currency={settings?.currency ?? siteConfig.currency}
					initialFilters={{ language: str(sp.language), format: str(sp.format), level: str(sp.level) }}
				/>
			</div>
		</>
	);
}
