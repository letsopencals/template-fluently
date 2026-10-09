import type { Metadata } from 'next';
import { siteConfig } from '@/lib/site-config';

export const metadata: Metadata = {
	title: 'About',
	description: `The story, the teachers and the campuses behind ${siteConfig.name}.`,
	alternates: { canonical: '/about' },
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
	return children;
}
