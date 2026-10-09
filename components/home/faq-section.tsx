import { siteConfig } from '@/lib/site-config';
import { FaqAccordion } from '@/components/ui/faq-accordion';
import { SectionHeading } from './section-heading';

/** FAQ from siteConfig.faqs (also emitted as FAQPage JSON-LD by the page). */
export function FaqSection() {
	return (
		<section className="mx-auto grid max-w-[1320px] gap-12 px-6 py-24 lg:grid-cols-[1fr_1.4fr] lg:px-10 lg:py-32">
			<SectionHeading eyebrow="FAQ" title="Questions, answered" intro="Anything else? Message us and a human replies." />
			<FaqAccordion items={siteConfig.faqs.map((f) => ({ q: f.question, a: f.answer }))} />
		</section>
	);
}
