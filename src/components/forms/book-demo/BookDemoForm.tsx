import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { actions } from 'astro:actions';

import {
    bookDemoSchema,
    type BookDemoFormValues,
    TEAM_SIZE_OPTIONS,
    BUSINESS_TYPE_OPTIONS,
} from './book-demo-schema';
import BookDemoSuccess from './BookDemoSuccess';

type SubmitState =
    | { kind: 'idle' }
    | { kind: 'submitting' }
    | { kind: 'submitted'; email: string }
    | { kind: 'error'; message: string };

export default function BookDemoForm() {
    const [submitState, setSubmitState] = useState<SubmitState>({
        kind: 'idle',
    });

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<BookDemoFormValues>({
        resolver: zodResolver(bookDemoSchema),
        mode: 'onTouched',
    });

    const onSubmit: SubmitHandler<BookDemoFormValues> = async (values) => {
        setSubmitState({ kind: 'submitting' });
        try {
            const { data, error } = await actions.bookDemo(values);

            if (error) {
                setSubmitState({
                    kind: 'error',
                    message:
                        error.message ?? 'Something went wrong. Please try again.',
                });
                return;
            }

            if (data?.ok) {
                setSubmitState({ kind: 'submitted', email: values.email });
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
        return <BookDemoSuccess email={submitState.email} />;
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
            <div>
                <label htmlFor="bd-name" className={labelClasses}>
                    Your name
                </label>
                <input
                    id="bd-name"
                    type="text"
                    autoComplete="name"
                    placeholder="Avetis Mkrtchyan"
                    className={inputClasses(!!errors.name)}
                    aria-invalid={!!errors.name}
                    aria-describedby={errors.name ? 'bd-name-error' : undefined}
                    {...register('name')}
                />
                {errors.name && (
                    <p id="bd-name-error" className={errorClasses}>
                        {errors.name.message}
                    </p>
                )}
            </div>

            <div>
                <label htmlFor="bd-email" className={labelClasses}>
                    Work email
                </label>
                <input
                    id="bd-email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@yourbusiness.com"
                    className={inputClasses(!!errors.email)}
                    aria-invalid={!!errors.email}
                    aria-describedby={errors.email ? 'bd-email-error' : undefined}
                    {...register('email')}
                />
                {errors.email && (
                    <p id="bd-email-error" className={errorClasses}>
                        {errors.email.message}
                    </p>
                )}
            </div>

            <div>
                <label htmlFor="bd-company" className={labelClasses}>
                    Company
                </label>
                <input
                    id="bd-company"
                    type="text"
                    autoComplete="organization"
                    placeholder="Your business name"
                    className={inputClasses(!!errors.company)}
                    aria-invalid={!!errors.company}
                    aria-describedby={
                        errors.company ? 'bd-company-error' : undefined
                    }
                    {...register('company')}
                />
                {errors.company && (
                    <p id="bd-company-error" className={errorClasses}>
                        {errors.company.message}
                    </p>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                    <label htmlFor="bd-business-type" className={labelClasses}>
                        Business type
                    </label>
                    <select
                        id="bd-business-type"
                        className={inputClasses(!!errors.businessType)}
                        aria-invalid={!!errors.businessType}
                        aria-describedby={
                            errors.businessType
                                ? 'bd-business-type-error'
                                : undefined
                        }
                        defaultValue=""
                        {...register('businessType')}
                    >
                        <option value="" disabled>
                            Select…
                        </option>
                        {BUSINESS_TYPE_OPTIONS.map((option) => (
                            <option key={option} value={option}>
                                {option}
                            </option>
                        ))}
                    </select>
                    {errors.businessType && (
                        <p id="bd-business-type-error" className={errorClasses}>
                            {errors.businessType.message}
                        </p>
                    )}
                </div>

                <div>
                    <label htmlFor="bd-team-size" className={labelClasses}>
                        Team size
                    </label>
                    <select
                        id="bd-team-size"
                        className={inputClasses(!!errors.teamSize)}
                        aria-invalid={!!errors.teamSize}
                        aria-describedby={
                            errors.teamSize ? 'bd-team-size-error' : undefined
                        }
                        defaultValue=""
                        {...register('teamSize')}
                    >
                        <option value="" disabled>
                            Select…
                        </option>
                        {TEAM_SIZE_OPTIONS.map((option) => (
                            <option key={option} value={option}>
                                {option}
                            </option>
                        ))}
                    </select>
                    {errors.teamSize && (
                        <p id="bd-team-size-error" className={errorClasses}>
                            {errors.teamSize.message}
                        </p>
                    )}
                </div>
            </div>

            <div>
                <label htmlFor="bd-message" className={labelClasses}>
                    Anything you'd like us to know{' '}
                    <span className="font-body font-normal lowercase tracking-normal text-ink-soft">
                        (optional)
                    </span>
                </label>
                <textarea
                    id="bd-message"
                    rows={4}
                    placeholder="What you sell, channels you use, current setup…"
                    className={`${inputClasses(!!errors.message)} resize-y min-h-[96px]`}
                    aria-invalid={!!errors.message}
                    aria-describedby={
                        errors.message ? 'bd-message-error' : undefined
                    }
                    {...register('message')}
                />
                {errors.message && (
                    <p id="bd-message-error" className={errorClasses}>
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
                    : 'Book my demo'}
            </button>

            <p className="font-mono text-[11px] text-ink-soft text-center mt-1">
                We'll never share your details. By submitting, you agree to our{' '}
                <a href="/privacy" className="underline hover:text-ink">
                    privacy policy
                </a>
                .
            </p>
        </form>
    );
}
