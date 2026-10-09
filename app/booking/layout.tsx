import type { Metadata } from 'next';
export const metadata: Metadata = {
	title: 'Book a lesson',
	description: 'Pick a day, a time and a teacher, then confirm. Done in under a minute.',
};

export default function BookingLayout({ children }: { children: React.ReactNode }) {
	return children;
}
