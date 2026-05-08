import { z } from 'zod';

export const CONTACT_SUBJECT_OPTIONS = [
    'Sales',
    'Support',
    'Partnership',
    'Other',
] as const;

export const contactSchema = z.object({
    name: z
        .string()
        .trim()
        .min(2, 'Please enter your full name.')
        .max(100, "That's too long for a name."),
    email: z.email('Please enter a valid email address.').trim(),
    subject: z.enum(CONTACT_SUBJECT_OPTIONS, {
        message: 'Pick the closest match.',
    }),
    message: z
        .string()
        .trim()
        .min(10, 'A bit more detail helps us help you.')
        .max(4000, "That's a long message — trim it down?"),
});

export type ContactFormValues = z.infer<typeof contactSchema>;
