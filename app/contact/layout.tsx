import type { Metadata } from 'next';
import { siteConfig } from '@/lib/site-config';

export const metadata: Metadata = {
	title: 'Contact',
	description: `Message, call or visit ${siteConfig.name}. Campus addresses and opening hours.`,
	alternates: { canonical: '/contact' },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
	return children;
}
