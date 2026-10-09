import { getProduct } from '@/lib/server-data';
import { BookingView } from '@/components/booking/booking-view';

type Search = Record<string, string | string[] | undefined>;

function one(v: string | string[] | undefined): string | null {
	return typeof v === 'string' && v ? v : null;
}

// Server Component: fetch the product on the server and seed the client booking
// flow so it renders immediately (no loading flash). The booking flow keeps
// revalidating via SWR against /api/products/[slug].
// `?date=YYYY-MM-DD&staff=<id>&location=<id>` preselect the day, teacher and place
// (used by the home timetable and the "Book with …" links on teacher pages).
export default async function BookingPage({
	params,
	searchParams,
}: {
	params: Promise<{ slug: string }>;
	searchParams: Promise<Search>;
}) {
	const [{ slug }, sp] = await Promise.all([params, searchParams]);
	const initialProduct = await getProduct(slug);

	return (
		<BookingView
			slug={slug}
			initialProduct={initialProduct}
			preselect={{ date: one(sp.date), staffId: one(sp.staff), locationId: one(sp.location) }}
		/>
	);
}
