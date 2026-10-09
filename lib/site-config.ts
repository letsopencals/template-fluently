/**
 * Fluently — editorial copy and brand settings for the template.
 *
 * Business data (classes, levels, prices, teachers, campuses, the online
 * classroom link, logo and banner) is NOT here: it loads from the Opencals
 * storefront API. This file only holds words and decorative choices that a
 * school would rewrite when it forks the template.
 *
 * Every number shown on the site (languages, teachers, campuses, seats left)
 * is computed from the API. Don't add made-up stats here.
 */

export const siteConfig = {
	name: 'Fluently',
	tagline: 'Language school in New York & online',
	description:
		'Small-group and private language classes in Spanish, French, German, Italian, Japanese and Mandarin. At our New York campuses or live online. Book a free trial lesson.',
	url: process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com',
	locale: 'en_US',
	country: 'US',
	/** Fallbacks only; the store's settings win when they load. */
	currency: 'USD',
	timezone: 'America/New_York',

	logo: { text: 'Fluent', accent: 'ly', descriptor: 'Language school' },

	/**
	 * Collection slugs with a special meaning. Every OTHER visible collection is a
	 * "subject" (a language here; an instrument or a course for other schools).
	 */
	collections: {
		/** Products for newcomers (trial lesson, conversation club). */
		starter: 'start-here',
	},

	/** Location `type` values from the API. */
	locationTypes: {
		online: 'online',
		physical: 'physical',
		delivery: 'delivery',
	},

	/** Appointment custom-attribute keys this template reads (none are written yet). */
	customAttributeKeys: {} as Record<string, string>,

	/** Minutes before a lesson starts that the "Join lesson" button turns on. */
	joinWindowMinutes: 15,

	hero: {
		eyebrow: 'New York · Online · All levels',
		titleBefore: 'Speak a new language',
		titleHighlight: 'by summer',
		subtitle:
			'Tiny groups, real conversation and teachers who make you laugh. Pick a class at our campus or join live from your couch.',
		primaryCta: 'Book a free trial',
		secondaryCta: 'Find your class',
		/** Greetings floating around the mascot. Purely decorative. */
		bubbles: ['¡Hola!', 'Bonjour !', 'Ciao!', 'Hallo!', 'こんにちは', '你好'],
		teachersNote: 'Meet our native-speaker teachers',
	},

	formats: [
		{
			id: 'campus',
			label: 'In person',
			title: 'Small groups on campus',
			body: 'Ninety minutes around one table, a native-speaker teacher and coffee on the house.',
			image: '/images/mascot-teacher.png',
		},
		{
			id: 'online',
			label: 'Live online',
			title: 'Live online groups',
			body: 'Cameras on, breakout rooms and a teacher who knows your name. From anywhere.',
			image: '/images/mascot-laptop.png',
		},
		{
			id: 'private',
			label: 'Private 1:1',
			title: 'Private lessons',
			body: 'Your goals, your pace: exams, a move abroad, a big presentation. At a campus or online.',
			image: '/images/mascot-calendar.png',
		},
	],

	process: {
		eyebrow: 'How it works',
		title: 'From “hola” to holding a conversation',
		steps: [
			{
				title: 'Pick your language',
				body: 'Take the 1-minute level check or book a free trial with a teacher.',
				image: '/images/step-pick.png',
			},
			{
				title: 'Book a class',
				body: 'Choose a group or a private lesson, on campus or online. See the seats left in real time.',
				image: '/images/step-book.png',
			},
			{
				title: 'Start speaking',
				body: 'Turn up, join the call and talk from minute one. Reschedule from your account if life happens.',
				image: '/images/step-speak.png',
			},
		],
	},

	quiz: {
		eyebrow: 'Level check',
		title: 'Not sure where to start?',
		subtitle: 'Five quick questions. No grammar test, promise.',
		questions: [
			{
				q: 'Can you introduce yourself and say where you are from?',
				options: ['Not yet', 'With a phrasebook', 'Easily'],
			},
			{
				q: 'Could you order food and ask for the bill?',
				options: ['Not yet', 'With some pointing', 'Sure'],
			},
			{
				q: 'Can you talk about what you did last weekend?',
				options: ['Not yet', 'In the present tense', 'Yes, in the past tense'],
			},
			{
				q: 'Could you follow a slow podcast or a kids’ show?',
				options: ['Not really', 'The gist', 'Most of it'],
			},
			{
				q: 'Could you explain your job or studies?',
				options: ['No', 'Simply', 'In detail'],
			},
		],
		/** Score bands → level labels. Variant titles in the seed contain "A1", "A2", "B1". */
		levels: [
			{ max: 2, code: 'A1', label: 'Beginner · A1', note: 'Start from the very first word, with zero pressure.' },
			{ max: 6, code: 'A2', label: 'Elementary · A2', note: 'You know the basics. Time to connect the dots.' },
			{ max: 10, code: 'B1', label: 'Intermediate · B1', note: 'You can get by. Now let’s make it flow.' },
		],
	},

	testimonials: [
		{
			quote: 'I went from menu-pointing to arguing about football with my Madrid in-laws in eight months.',
			name: 'Priya S.',
			detail: 'Spanish · Online group',
		},
		{
			quote: 'The class size is tiny, so you talk the whole ninety minutes. My French finally stopped being theoretical.',
			name: 'Marcus L.',
			detail: 'French · SoHo campus',
		},
		{
			quote: 'Private lessons squeezed into lunch breaks got me through my JLPT N4. My teacher was a cheerleader.',
			name: 'Dana K.',
			detail: 'Japanese · Private 1:1',
		},
	],

	faqs: [
		{
			question: 'What happens in the free trial lesson?',
			answer:
				'Twenty minutes online with a teacher. You chat a little, they find your level and suggest the right class. No payment details needed.',
		},
		{
			question: 'How big are the group classes?',
			answer:
				'Small. Every class shows its maximum and the seats still free, so you always know before you book.',
		},
		{
			question: 'How do online lessons work?',
			answer:
				'You get a link with your confirmation and a “Join lesson” button in your account that switches on shortly before the lesson starts.',
		},
		{
			question: 'Can I reschedule or cancel?',
			answer:
				'Yes. Sign in to your account to move or cancel a booking within the school’s policy shown on each lesson.',
		},
		{
			question: 'Do I need to buy books?',
			answer: 'No. A workbook is an optional extra at checkout, and every class works without it.',
		},
	],

	cta: {
		title: 'Your first lesson is on us',
		body: 'Twenty minutes with a teacher, a level check and a plan. Online, free, no strings.',
		button: 'Book a free trial',
	},

	comingSoon: {
		title: 'Materials & class chat',
		body: 'Homework, slides and a chat with your teacher and classmates are on the way. For now your teacher shares materials in the lesson.',
	},

	about: {
		eyebrow: 'About us',
		title: 'A school that sounds like a party',
		storyParagraphs: [
			'Fluently started as a Tuesday-night conversation table in a SoHo café. Students kept coming back, so we found a classroom, then another one in Williamsburg, and then the internet.',
			'We still teach the same way: tiny groups, lots of talking and teachers who are native speakers and trained educators. Grammar shows up when you need it, not before.',
		],
		values: [
			{ title: 'Talk first', body: 'Every class is at least two-thirds speaking time.' },
			{ title: 'Small on purpose', body: 'Groups are capped so nobody hides at the back.' },
			{ title: 'Real teachers', body: 'Native speakers with teaching experience, not chatbots.' },
			{ title: 'Your schedule', body: 'Mornings, lunch breaks, evenings and weekends, on campus or online.' },
		],
		gallery: [
			{ src: '/images/gallery-classroom.jpg', alt: 'A bright classroom at the campus' },
			{ src: '/images/gallery-group-class.jpg', alt: 'Students laughing in a group class' },
			{ src: '/images/gallery-online-lesson.jpg', alt: 'A student in a live online lesson on a laptop' },
			{ src: '/images/gallery-conversation-club.jpg', alt: 'The conversation club at the café' },
			{ src: '/images/gallery-private-lesson.jpg', alt: 'A private lesson with a teacher' },
			{ src: '/images/gallery-campus-brooklyn.jpg', alt: 'The Williamsburg campus' },
		],
	},

	videoBand: {
		title: 'Learning should feel like this',
		body: 'Laughing, getting it wrong, trying again. That’s how languages stick.',
		src: '/videos/hero.mp4',
		poster: '/images/gallery-group-class.jpg',
	},

	contact: {
		/** Fallbacks; the store's public settings override phone and email when set. */
		phone: '+1 (212) 555-0147',
		email: 'hello@fluently.school',
		address: '412 Broadway\nNew York, NY 10013',
		addressShort: 'SoHo, New York',
		mapHref: 'https://maps.google.com/?q=412+Broadway+New+York+NY+10013',
		whatsappHref: 'https://wa.me/12125550147',
		hours: 'Mon–Sat, 8am–8pm',
	},

	footer: {
		description: 'Small-group and private language lessons in New York and live online.',
		exploreLinks: [
			{ label: 'All classes', href: '/classes' },
			{ label: 'Teachers', href: '/teachers' },
			{ label: 'Free trial', href: '/classes?format=trial' },
			{ label: 'About', href: '/about' },
		],
		companyLinks: [
			{ label: 'Contact', href: '/contact' },
			{ label: 'My lessons', href: '/account' },
			{ label: 'Sign in', href: '/auth/sign-in' },
		],
		socials: [
			{ label: 'Instagram', href: 'https://instagram.com' },
			{ label: 'TikTok', href: 'https://tiktok.com' },
			{ label: 'YouTube', href: 'https://youtube.com' },
		],
	},
} as const;

export type SiteConfig = typeof siteConfig;
