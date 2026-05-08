import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { actions } from 'astro:actions';

import {
    contactSchema,
    type ContactFormValues,
    CONTACT_SUBJECT_OPTIONS,
} from './contact-schema';
import ContactSuccess from './ContactSuccess';

type SubmitState =
    | { kind: 'idle' }
    | { kind: 'submitting' }
    | { kind: 'submitted'; email: string; subject: string }
    | { kind: 'error'; message: string };

export default function ContactForm() {
    const [submitState, setSubmitState] = useState<SubmitState>({
        kind: 'idle',
    });

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<ContactFormValues>({
        resolver: zodResolver(contactSchema),
        mode: 'onTouched',
    });

    const onSubmit: SubmitHandler<ContactFormValues> = async (values) => {
        setSubmitState({ kind: 'submitting' });
        try {
            const { data, error } = await actions.contact(values);

            if (error) {
                setSubmitState({
                    kind: 'error',
                    message:
                        error.message ??
                        'Something went wrong. Please try again.',
                });
                return;
            }

            if (data?.ok) {
                setSubmitState({
                    kind: 'submitted',
                    email: values.email,
                    subject: values.subject,
                });
                return;
            }

            setSubmitState({
                kind: 'error',
                message: 'Unexpected response. Please try again.',
            });
        } catch (err) {
            setSubmitState({
                kind: 'error',
                message:
                    err instanceof Error
                        ? err.message
                        : 'Network error. Please check your connection and try again.',
            });
        }
    };

    if (submitState.kind === 'submitted') {
        return (
            <ContactSuccess
                email={submitState.email}
                subject={submitState.subject}
            />
        );
    }

    const inputClasses = (hasError: boolean) =>
        [
            'w-full rounded-lg border bg-paper px-4 py-3',
            'font-body text-[15px] text-ink placeholder:text-ink-muted',
            'transition-colors duration-150',
            'focus:outline-none focus:ring-2 focus:ring-[hsl(var(--travelity-teal)/0.4)] focus:border-travelity-teal',
            hasError
                ? 'border-[hsl(var(--destructive)/0.6)]'
                : 'border-line hover:border-ink-soft',
        ].join(' ');

    const labelClasses =
        'block font-mono text-[10.5px] font-semibold uppercase tracking-[0.10em] text-ink-muted mb-1.5';
    const errorClasses =
        'mt-1.5 font-body text-[12.5px] text-[hsl(var(--destructive))] leading-[1.4]';

    return (
        <form
            onSubmit={handleSubmit(onSubmit)}
            noValidate
            className="rounded-xl border border-line bg-paper p-7 md:p-9 flex flex-col gap-5"
        >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                    <label htmlFor="ct-name" className={labelClasses}>
                        Your name
                    </label>
                    <input
                        id="ct-name"
                        type="text"
                        autoComplete="name"
                        placeholder="Avetis Mkrtchyan"
                        className={inputClasses(!!errors.name)}
                        aria-invalid={!!errors.name}
                        aria-describedby={
                            errors.name ? 'ct-name-error' : undefined
                        }
                        {...register('name')}
                    />
                    {errors.name && (
                        <p id="ct-name-error" className={errorClasses}>
                            {errors.name.message}
                        </p>
                    )}
                </div>

                <div>
                    <label htmlFor="ct-email" className={labelClasses}>
                        Email
                    </label>
                    <input
                        id="ct-email"
                        type="email"
                        autoComplete="email"
                        placeholder="you@yourbusiness.com"
                        className={inputClasses(!!errors.email)}
                        aria-invalid={!!errors.email}
                        aria-describedby={
                            errors.email ? 'ct-email-error' : undefined
                        }
                        {...register('email')}
                    />
                    {errors.email && (
                        <p id="ct-email-error" className={errorClasses}>
                            {errors.email.message}
                        </p>
                    )}
                </div>
            </div>

            <div>
                <label htmlFor="ct-subject" className={labelClasses}>
                    What's this about?
                </label>
                <select
                    id="ct-subject"
                    className={inputClasses(!!errors.subject)}
                    aria-invalid={!!errors.subject}
                    aria-describedby={
                        errors.subject ? 'ct-subject-error' : undefined
                    }
                    defaultValue=""
                    {...register('subject')}
                >
                    <option value="" disabled>
                        Select a topic…
                    </option>
                    {CONTACT_SUBJECT_OPTIONS.map((option) => (
                        <option key={option} value={option}>
                            {option}
                        </option>
                    ))}
                </select>
                {errors.subject && (
                    <p id="ct-subject-error" className={errorClasses}>
                        {errors.subject.message}
                    </p>
                )}
            </div>

            <div>
                <label htmlFor="ct-message" className={labelClasses}>
                    Message
                </label>
                <textarea
                    id="ct-message"
                    rows={6}
                    placeholder="Tell us what's going on, what you're trying to do, what you've tried so far…"
                    className={`${inputClasses(!!errors.message)} resize-y min-h-[140px]`}
                    aria-invalid={!!errors.message}
                    aria-describedby={
                        errors.message ? 'ct-message-error' : undefined
                    }
                    {...register('message')}
                />
                {errors.message && (
                    <p id="ct-message-error" className={errorClasses}>
                        {errors.message.message}
                    </p>
                )}
            </div>

            {submitState.kind === 'error' && (
                <div
                    role="alert"
                    className="rounded-lg border border-[hsl(var(--destructive)/0.4)] bg-[hsl(var(--destructive)/0.06)] px-4 py-3 font-body text-[13.5px] text-[hsl(var(--destructive))]"
                >
                    {submitState.message}
                </div>
            )}

            <button
                type="submit"
                disabled={isSubmitting || submitState.kind === 'submitting'}
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-lg bg-travelity-teal text-white font-display text-[15px] font-semibold tracking-[-0.01em] transition-colors hover:bg-[hsl(194_56%_47%)] disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[hsl(var(--travelity-teal)/0.4)] focus:ring-offset-2"
            >
                {submitState.kind === 'submitting' || isSubmitting
                    ? 'Sending…'
                    : 'Send message'}
            </button>

            <p className="font-mono text-[11px] text-ink-soft text-center mt-1">
                We'll never share your details. By submitting, you agree to our{' '}
                <a href="/legal/privacy" className="underline hover:text-ink">
                    privacy policy
                </a>
                .
            </p>
        </form>
    );
}
