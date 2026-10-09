import type { Metadata, Viewport } from 'next';
import { Fredoka, DM_Sans } from 'next/font/google';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Providers } from '@/components/providers';
import { siteConfig } from '@/lib/site-config';
import { storeContact } from '@/lib/contact';
import { getLocations, getStoreSettings, storeImages } from '@/lib/server-data';
import './globals.css';

const fredoka = Fredoka({
	subsets: ['latin'],
	weight: ['400', '500', '600', '700'],
	variable: '--font-fredoka',
	display: 'swap',
});
const dmSans = DM_Sans({
	subsets: ['latin'],
	variable: '--font-dm-sans',
	display: 'swap',
});

const title = `${siteConfig.name} | ${siteConfig.tagline}`;

export const metadata: Metadata = {
	title: {
		default: title,
		template: `%s | ${siteConfig.name}`,
	},
	description: siteConfig.description,
	metadataBase: new URL(siteConfig.url),
	applicationName: siteConfig.name,
	keywords: ['language school New York', 'Spanish classes NYC', 'French lessons online', 'Japanese classes', 'private language tutor'],
	openGraph: {
		title,
		description: siteConfig.description,
		siteName: siteConfig.name,
		locale: siteConfig.locale,
		type: 'website',
	},
	twitter: {
		card: 'summary_large_image',
		title,
		description: siteConfig.description,
	},
	robots: { index: true, follow: true },
};

export const viewport: Viewport = {
	themeColor: '#FBF8F3',
	colorScheme: 'light',
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
	const [initialSettings, locations] = await Promise.all([getStoreSettings(), getLocations()]);
	const { logo, banner } = storeImages(initialSettings);
	const { email, phone } = storeContact(initialSettings);
	const campuses = locations.filter((l) => l.type === siteConfig.locationTypes.physical);

	return (
		<html lang="en" className={`${fredoka.variable} ${dmSans.variable}`}>
			<body>
				{/* Allow parent frames to control scrolling via postMessage */}
				<script
					dangerouslySetInnerHTML={{
						__html: `window.addEventListener("message",function(e){if(e.data&&e.data.type==="scrollTo"&&e.data.id){var el=document.getElementById(e.data.id);if(el){var top=el.getBoundingClientRect().top+window.scrollY;window.scrollTo({top:top,behavior:"smooth"})}}if(e.data&&e.data.type==="scrollTop"){window.scrollTo({top:0,behavior:"smooth"})}});`,
					}}
				/>
				<Providers initialSettings={initialSettings}>
					<Header />
					<main>{children}</main>
					<Footer />
				</Providers>
				<script
					type="application/ld+json"
					dangerouslySetInnerHTML={{
						__html: JSON.stringify({
							'@context': 'https://schema.org',
							'@type': 'LanguageSchool',
							name: initialSettings?.name || siteConfig.name,
							description: siteConfig.description,
							url: siteConfig.url,
							...(logo ? { logo } : {}),
							...(banner ? { image: banner } : {}),
							telephone: phone,
							email,
							location: campuses.map((c) => ({
								'@type': 'Place',
								name: c.title,
								address: {
									'@type': 'PostalAddress',
									streetAddress: [c.addressLine1, c.addressLine2].filter(Boolean).join(', '),
									addressLocality: c.city,
									addressRegion: c.state,
									postalCode: c.postalCode,
									addressCountry: c.country,
								},
							})),
						}),
					}}
				/>
			</body>
		</html>
	);
}
