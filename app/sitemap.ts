import type { MetadataRoute } from 'next';
import { siteConfig } from '@/lib/site-config';
import { getProducts, getSubjects, getTeachers } from '@/lib/server-data';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
	const base = siteConfig.url;
	const now = new Date();
	const entry = (path: string, priority: number, changeFrequency: 'weekly' | 'monthly' = 'weekly') => ({
		url: `${base}${path}`,
		lastModified: now,
		changeFrequency,
		priority,
	});

	const [products, subjects, teachers] = await Promise.all([getProducts(), getSubjects(), getTeachers()]);

	return [
		entry('', 1),
		entry('/classes', 0.9),
		entry('/teachers', 0.8),
		entry('/about', 0.6, 'monthly'),
		entry('/contact', 0.6, 'monthly'),
		...subjects.map((s) => entry(`/languages/${s.slug}`, 0.9)),
		...teachers.map((t) => entry(`/teachers/${t.slug}`, 0.7)),
		...products.flatMap((p) => (p.variants?.length ? p.variants.map((v) => v.slug) : [p.slug])).map((slug) => entry(`/booking/${slug}`, 0.6)),
	];
}
