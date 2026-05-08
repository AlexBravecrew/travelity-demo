import { defineAction } from 'astro:actions';
import { bookDemoSchema } from '@/components/forms/book-demo/book-demo-schema';

export const server = {
    bookDemo: defineAction({
        accept: 'json',
        input: bookDemoSchema,
        handler: async (input) => {
            // For now: log to server console. Real implementation will:
            // - Send email to sales@travelity.app via Resend / SendGrid / Postmark
            // - Or push to a CRM (HubSpot, Salesforce)
            // - Or insert into a `demo_requests` DB table
            //
            // Phase 7 ships the wired-up form; the email/CRM destination is a
            // follow-up that doesn't require structural changes here.

            console.log('[bookDemo action] received:', input);

            // Simulate latency so the UI's loading state is observable in dev.
            await new Promise((resolve) => setTimeout(resolve, 600));

            // To test the error path during development, uncomment:
            // throw new ActionError({
            //     code: 'INTERNAL_SERVER_ERROR',
            //     message: 'Something went wrong on our end.',
            // });

            return {
                ok: true as const,
                receivedAt: new Date().toISOString(),
            };
        },
    }),
};
