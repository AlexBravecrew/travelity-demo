import { Paths } from '@/lib/utils/paths';

export interface NavDropdownItemData {
    label: string;
    description: string;
    href: string;
}

export interface NavLinkData {
    label: string;
    /** If `href` is set and `items` is omitted, this is a flat link. */
    href?: string;
    /** If `items` is set, this is a dropdown trigger. */
    items?: NavDropdownItemData[];
}

export const navLinks: NavLinkData[] = [
    {
        label: 'Solutions',
        items: [
            {
                label: 'Booking Engine',
                description: 'Catalog, scheduling, pricing, orders.',
                href: Paths.SOLUTIONS_BOOKING_ENGINE,
            },
            {
                label: 'Booking Widget',
                description: 'Embed Travelity in your own site.',
                href: Paths.SOLUTIONS_WIDGET,
            },
            {
                label: 'OTA Integrations',
                description: 'GetYourGuide, Viator, Klook.',
                href: Paths.SOLUTIONS_INTEGRATIONS,
            },
            {
                label: 'Proposals',
                description: 'Custom quotes that close themselves.',
                href: Paths.SOLUTIONS_PROPOSALS,
            },
            {
                label: 'Reporting & BI',
                description: 'Seven reports, plus your BI tools.',
                href: Paths.SOLUTIONS_REPORTING,
            },
            {
                label: 'Security',
                description: 'Built for businesses with IT teams.',
                href: Paths.SOLUTIONS_SECURITY,
            },
        ],
    },
    {
        label: 'Pricing',
        href: Paths.PRICING,
    },
    {
        label: 'Resources',
        items: [
            {
                label: 'Guides',
                description: 'How-tos for setting up and growing.',
                href: Paths.GUIDES,
            },
            {
                label: 'FAQ',
                description: 'Answers to common questions.',
                href: Paths.FAQ,
            },
            {
                label: 'Help Center',
                description: 'Product documentation.',
                href: Paths.HELP_CENTER,
            },
            {
                label: 'Our Story',
                description: 'Why we built Travelity.',
                href: Paths.OUR_STORY,
            },
        ],
    },
];
