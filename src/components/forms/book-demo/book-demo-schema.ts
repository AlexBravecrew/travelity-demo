import { z } from 'zod';

export const TEAM_SIZE_OPTIONS = [
    'Just me',
    '2–5',
    '6–20',
    '21–100',
    '100+',
] as const;

export const BUSINESS_TYPE_OPTIONS = [
    'Tour operator',
    'Transfer provider',
    'Accommodation host',
    'Independent guide',
    'Other',
] as const;

export const bookDemoSchema = z.object({
    name: z
        .string()
        .trim()
        .min(2, 'Please enter your full name.')
        .max(100, "That's too long for a name."),
    email: z.email('Please enter a valid email address.').trim(),
    company: z
        .string()
        .trim()
        .min(2, 'What should we call your business?')
        .max(120, 'A bit too long — abbreviate?'),
    businessType: z.enum(BUSINESS_TYPE_OPTIONS, {
        message: 'Pick the closest match.',
    }),
    teamSize: z.enum(TEAM_SIZE_OPTIONS, {
        message: 'Pick a team size.',
    }),
    message: z
        .string()
        .trim()
        .max(2000, "That's a long message — trim it down?")
        .optional(),
});

export type BookDemoFormValues = z.infer<typeof bookDemoSchema>;
