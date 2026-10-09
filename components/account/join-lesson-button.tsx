'use client';

import { memo, useEffect, useState } from 'react';
import { buttonClasses } from '@/components/ui/button';
import { siteConfig } from '@/lib/site-config';
import { getJoinState, type JoinState } from './booking-meta';

const TICK_MS = 30_000;

/**
 * "Join lesson" for an online booking. Live from `joinWindowMinutes` before the
 * start until the end; before that it shows when it opens. Re-checks every 30s
 * so it switches on without a reload. Renders nothing once the lesson is over.
 */
export const JoinLessonButton = memo(function JoinLessonButton({
	joinUrl,
	from,
	to,
	size = 'md',
	fullWidth,
}: {
	joinUrl: string;
	from: string;
	to: string;
	size?: 'sm' | 'md' | 'lg';
	fullWidth?: boolean;
}) {
	// Start as 'early' so server and client render the same markup; the effect
	// computes the real state after hydration.
	const [state, setState] = useState<JoinState>('early');

	useEffect(() => {
		const update = () => setState(getJoinState(from, to));
		update();
		const id = window.setInterval(update, TICK_MS);
		return () => window.clearInterval(id);
	}, [from, to]);

	if (state === 'ended') return null;

	if (state === 'early') {
		return (
			<span
				className={buttonClasses('outline', size, {
					fullWidth,
					className: 'pointer-events-none opacity-60 shadow-none',
				})}
				aria-disabled="true"
				title={`Opens ${siteConfig.joinWindowMinutes} minutes before the lesson`}
			>
				<VideoIcon />
				Join opens {siteConfig.joinWindowMinutes} min before
			</span>
		);
	}

	return (
		<a
			href={joinUrl}
			target="_blank"
			rel="noopener noreferrer"
			className={buttonClasses('accent', size, { fullWidth, className: 'animate-pulse-primary' })}
		>
			<VideoIcon />
			Join lesson
		</a>
	);
});

function VideoIcon() {
	return (
		<svg aria-hidden className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
			<path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.55-2.28A1 1 0 0121 8.62v6.76a1 1 0 01-1.45.9L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
		</svg>
	);
}
