import { siteConfig } from '@/lib/site-config';
import { storeContact } from '@/lib/contact';
import { getLocations, getStoreSettings } from '@/lib/server-data';
import { PageHeading } from '@/components/ui/page-heading';
import { ContactCards, type ContactCard } from '@/components/about/contact-cards';
import { CampusesStrip } from '@/components/home/campuses-strip';

export default async function ContactPage() {
	const [settings, locations] = await Promise.all([getStoreSettings(), getLocations()]);
	const { email, phone } = storeContact(settings);
	const c = siteConfig.contact;

	const cards: ContactCard[] = [
		{ label: 'WhatsApp', value: 'Message us', href: c.whatsappHref, emoji: '💬', color: 'var(--color-mint)' },
		{ label: 'Email', value: email, href: `mailto:${email}`, emoji: '✉️', color: 'var(--color-sky)' },
		{ label: 'Phone', value: phone, href: `tel:${phone.replace(/[^+\d]/g, '')}`, emoji: '📞', color: 'var(--color-sun)' },
		{ label: 'Front desk hours', value: c.hours, href: '#campuses', emoji: '🕘', color: 'var(--color-bubblegum)' },
	];

	return (
		<>
			<PageHeading
				eyebrow="Say hello"
				title="Let’s talk (obviously)"
				intro="Questions about levels, schedules or private lessons? A real person replies, usually within a few hours."
			/>
			<div className="mx-auto max-w-[1320px] px-6 lg:px-10">
				<ContactCards cards={cards} />
			</div>
			<div id="campuses" className="scroll-mt-24">
				<CampusesStrip locations={locations} />
			</div>
		</>
	);
}
