import { CheckCircle2, Mail } from 'lucide-react';

export interface BookDemoSuccessProps {
    /** The email address that was submitted (so we can confirm it). */
    email: string;
}

export default function BookDemoSuccess({ email }: BookDemoSuccessProps) {
    return (
        <div className="rounded-xl border border-line bg-paper p-8 md:p-10 text-center">
            <div className="inline-flex w-12 h-12 rounded-full bg-[hsl(var(--success)/0.12)] text-[hsl(var(--success))] items-center justify-center mb-5">
                <CheckCircle2 className="w-6 h-6" strokeWidth={2} />
            </div>

            <h3 className="font-display text-[22px] font-semibold text-ink leading-[1.25] tracking-[-0.02em] mb-2">
                Thanks — we got it.
            </h3>

            <p className="font-body text-[15px] text-ink-muted leading-[1.55] max-w-[42ch] mx-auto mb-6">
                We'll reply within one business day with a few times that work
                for both of us.
            </p>

            <div className="inline-flex items-center gap-2 font-mono text-[12px] text-ink-muted bg-surface-alt border border-line rounded-md px-3 py-2">
                <Mail className="w-3.5 h-3.5" strokeWidth={1.75} aria-hidden="true" />
                {email}
            </div>
        </div>
    );
}
