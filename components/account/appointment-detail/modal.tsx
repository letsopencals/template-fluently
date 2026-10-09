'use client';

import { useEffect, useId } from 'react';

/** Centered dialog over a soft ink scrim, above the floating header. */
export function Modal({
	title,
	eyebrow,
	onClose,
	children,
	wide,
}: {
	title: string;
	eyebrow?: string;
	onClose: () => void;
	children: React.ReactNode;
	wide?: boolean;
}) {
	const titleId = useId();

	useEffect(() => {
		function onKey(e: KeyboardEvent) {
			if (e.key === 'Escape') onClose();
		}
		window.addEventListener('keydown', onKey);
		return () => window.removeEventListener('keydown', onKey);
	}, [onClose]);

	return (
		<div
			className="fixed inset-0 z-[75] flex items-center justify-center bg-[var(--color-charcoal)]/50 p-4 backdrop-blur-sm"
			onClick={onClose}
		>
			<div
				role="dialog"
				aria-modal="true"
				aria-labelledby={titleId}
				className={`max-h-[90vh] w-full overflow-y-auto rounded-[28px] border-2 border-[var(--color-ink)] bg-[var(--color-bg)] p-7 shadow-[0_8px_0_0_var(--color-ink)] sm:p-9 ${wide ? 'max-w-2xl' : 'max-w-md'}`}
				onClick={(e) => e.stopPropagation()}
			>
				<div className="flex items-start justify-between gap-6">
					<div>
						{eyebrow ? <p className="eyebrow mb-3">{eyebrow}</p> : null}
						<h3 id={titleId} className="heading-display text-xl text-[var(--color-ink)] sm:text-2xl">
							{title}
						</h3>
					</div>
					<button
						type="button"
						onClick={onClose}
						aria-label="Close"
						className="-mr-2 -mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 border-[var(--color-ink)] bg-white text-[var(--color-ink)] transition-transform hover:rotate-90"
					>
						<svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
							<path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
						</svg>
					</button>
				</div>
				{children}
			</div>
		</div>
	);
}

/** Destructive pill (Button has no destructive variant by design). */
export const DESTRUCTIVE_BUTTON =
	'inline-flex h-12 items-center justify-center gap-2 rounded-full border-2 border-red-600 bg-white px-6 text-[0.95rem] font-semibold text-red-600 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40';

/** Selectable chip (date / time pickers inside the modals). */
export function chipClass(selected: boolean, disabled = false): string {
	if (disabled) {
		return 'rounded-full border-2 border-[var(--color-line)] text-[var(--color-ink-dim)] line-through decoration-[var(--color-ink-dim)] cursor-not-allowed';
	}
	return selected
		? 'rounded-full border-2 border-[var(--color-ink)] bg-[var(--color-primary)] font-semibold text-white'
		: 'rounded-full border-2 border-[var(--color-line-strong)] bg-white text-[var(--color-ink)] hover:border-[var(--color-primary)]';
}

/** Reads `{ error }` from a failed template API response. */
export async function readError(res: Response, fallback: string): Promise<string> {
	try {
		const data = await res.json();
		return typeof data?.error === 'string' ? data.error : typeof data?.message === 'string' ? data.message : fallback;
	} catch {
		return fallback;
	}
}
