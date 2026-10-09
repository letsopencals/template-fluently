import { siteConfig } from '@/lib/site-config';
import type { ConfirmedBooking } from './confirmed-booking';

interface IcsEvent {
	uid: string;
	title: string;
	start: number;
	end: number;
	location: string;
	description: string;
}

function stamp(ms: number): string {
	return new Date(ms).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
}

function esc(text: string): string {
	return text.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n');
}

function vevent(e: IcsEvent, now: number): string[] {
	return [
		'BEGIN:VEVENT',
		`UID:${e.uid}`,
		`DTSTAMP:${stamp(now)}`,
		`DTSTART:${stamp(e.start)}`,
		`DTEND:${stamp(e.end)}`,
		`SUMMARY:${esc(e.title)}`,
		`LOCATION:${esc(e.location)}`,
		`DESCRIPTION:${esc(e.description)}`,
		'END:VEVENT',
	];
}

/** One calendar event per lesson, with the classroom link or campus address. */
function eventFor(b: ConfirmedBooking, orderName: string): IcsEvent {
	const ref = orderName ? `Booking #${orderName}. ` : '';
	const who = b.teacher ? `Teacher: ${b.teacher}. ` : '';
	const join = b.joinUrl ? `Join: ${b.joinUrl}` : '';
	return {
		uid: `${b.id}@${siteConfig.name.toLowerCase().replace(/\s+/g, '-')}`,
		title: `${siteConfig.name}: ${b.title}${b.variant ? ` (${b.variant})` : ''}`,
		start: Date.parse(b.from),
		end: Date.parse(b.to),
		location: b.isOnline ? (b.joinUrl ?? 'Online') : [b.locationTitle, b.address].filter(Boolean).join(', '),
		description: `${ref}${who}${join}`.trim(),
	};
}

/** `data:` URL for an .ics file covering every lesson in the order. */
export function icsHref(bookings: readonly ConfirmedBooking[], orderName: string): string {
	const now = Date.now();
	const lines = [
		'BEGIN:VCALENDAR',
		'VERSION:2.0',
		`PRODID:-//${siteConfig.name}//Lessons//EN`,
		'CALSCALE:GREGORIAN',
		'METHOD:PUBLISH',
		...bookings.flatMap((b) => vevent(eventFor(b, orderName), now)),
		'END:VCALENDAR',
	];
	return `data:text/calendar;charset=utf-8,${encodeURIComponent(lines.join('\r\n'))}`;
}
