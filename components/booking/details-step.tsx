'use client';

import { useEffect, useId } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { DetailsField } from '@/hooks/use-booking-flow';

interface DetailsStepProps {
	email: string;
	firstName: string;
	lastName: string;
	customerId: string | null;
	onChangeEmail: (v: string) => void;
	onChangeFirstName: (v: string) => void;
	onChangeLastName: (v: string) => void;
	fieldErrors: Partial<Record<DetailsField, string>>;
	submitting: boolean;
	canSubmit: boolean;
	onSubmit: () => void;
}

export function DetailsStep({
	email,
	firstName,
	lastName,
	customerId,
	onChangeEmail,
	onChangeFirstName,
	onChangeLastName,
	fieldErrors,
	submitting,
	canSubmit,
	onSubmit,
}: DetailsStepProps) {
	const id = useId();
	const fieldId = (field: DetailsField) => `${id}-${field}`;
	const aria = (field: DetailsField) =>
		fieldErrors[field] ? { 'aria-invalid': true, 'aria-describedby': `${fieldId(field)}-error` } : {};

	// Take the student to the first field the API rejected.
	useEffect(() => {
		const first = (['email', 'firstName', 'lastName'] as const).find((f) => fieldErrors[f]);
		if (first) document.getElementById(fieldId(first))?.focus();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [fieldErrors]);

	return (
		<form
			onSubmit={(e) => {
				e.preventDefault();
				onSubmit();
			}}
			className="space-y-6"
		>
			<div className="overflow-hidden rounded-3xl border border-[var(--color-line)] bg-[var(--color-surface)] card-shadow">
				<div className="border-b border-[var(--color-line)] px-6 py-5">
					<p className="text-base font-semibold text-[var(--color-ink)]">Your details</p>
					<p className="mt-1 text-sm text-[var(--color-ink-dim)]">
						{customerId
							? 'Signed in — confirm your details below.'
							: 'We use this to confirm your lesson and send reminders.'}
					</p>
				</div>
				<div className="space-y-4 px-6 py-6">
					<Field label="Email" required id={fieldId('email')} error={fieldErrors.email}>
						<Input
							id={fieldId('email')}
							{...aria('email')}
							type="email"
							required
							value={email}
							onChange={(e) => onChangeEmail(e.target.value)}
							placeholder="your@email.com"
						/>
					</Field>
					<div className="grid gap-4 sm:grid-cols-2">
						<Field label="First Name" id={fieldId('firstName')} error={fieldErrors.firstName}>
							<Input
								id={fieldId('firstName')}
								{...aria('firstName')}
								type="text"
								value={firstName}
								onChange={(e) => onChangeFirstName(e.target.value)}
								placeholder="Jane"
							/>
						</Field>
						<Field label="Last Name" id={fieldId('lastName')} error={fieldErrors.lastName}>
							<Input
								id={fieldId('lastName')}
								{...aria('lastName')}
								type="text"
								value={lastName}
								onChange={(e) => onChangeLastName(e.target.value)}
								placeholder="Smith"
							/>
						</Field>
					</div>
				</div>
			</div>

			<Button type="submit" variant="primary" size="lg" fullWidth disabled={submitting || !canSubmit}>
				{submitting ? 'Reserving…' : 'Continue to payment'}
				{!submitting && (
					<svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
						<path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
					</svg>
				)}
			</Button>
		</form>
	);
}

function Field({
	label,
	id,
	required,
	error,
	children,
}: {
	label: string;
	/** The control's id: labels it, and `<id>-error` is the error's id for `aria-describedby`. */
	id: string;
	required?: boolean;
	error?: string;
	children: React.ReactNode;
}) {
	return (
		<div>
			<label htmlFor={id} className="mb-1 block text-sm font-semibold text-[var(--color-ink)]">
				{label}
				{required && <span className="ml-1 text-[var(--color-primary)]">*</span>}
			</label>
			{children}
			{error ? (
				<p id={`${id}-error`} className="mt-1 text-xs text-red-600">
					{error}
				</p>
			) : null}
		</div>
	);
}
