import { Paths } from '@/lib/utils/paths';

export interface NavSubItemData {
    label: string;
    description: string;
    href: string;
}

export interface NavLinkData {
    label: string;
    /** If `href` is set and `items` is omitted, this is a flat link. */
    href?: string;
    /** If `items` is set, this is a dropdown trigger. */
    items?: NavSubItemData[];
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
        label: 'Features',
        href: Paths.FEATURES,
    },
    {
        label: 'Pricing',
        href: Paths.PRICING,
    },
];
