import { defineAction } from 'astro:actions';
import { contactSchema } from '@/components/forms/contact/contact-schema';

export const server = {
    contact: defineAction({
        accept: 'json',
        input: contactSchema,
        handler: async (input) => {
            // Same TODO pattern as the (removed) bookDemo action: real
            // implementation will route by subject (Sales → sales@, Support
            // → support@, Partnership → partnerships@, Other → hello@) via
            // Resend/SendGrid/Postmark or push to a CRM/ticketing system.
            console.log('[contact action] received:', input);

            await new Promise((resolve) => setTimeout(resolve, 600));

            return {
                ok: true as const,
                receivedAt: new Date().toISOString(),
            };
        },
    }),
};
