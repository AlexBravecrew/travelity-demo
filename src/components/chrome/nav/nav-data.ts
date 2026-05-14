import { Paths } from '@/lib/utils/paths';

export interface NavSubItemData {
    label: string;
    description: string;
    href: string;
}

export interface NavLinkData {
    label: string;
    /**
     * Top-level destination.
     * - Flat link (no `items`): clicking navigates.
     * - Dropdown-only (no `href`, has `items`): trigger is a no-op `<button>`;
     *   hover opens the sub-row.
     * - Hybrid (`href` AND `items`, Phase 24): clicking navigates AND
     *   hovering opens the sub-row. Used for Features so users can either
     *   go to /features for the full page or jump straight to a section
     *   via the sub-row.
     */
    href?: string;
    /** If `items` is set, this is a dropdown trigger. */
    items?: NavSubItemData[];
}

// Feature sub-item slugs MUST match the section ids in src/pages/features.astro
// and the home FeaturesSection card hrefs — anchor scroll relies on it.
export const navLinks: NavLinkData[] = [
    {
        label: 'Solutions',
        href: Paths.SOLUTIONS,
    },
    {
        label: 'Features',
        href: Paths.FEATURES,
        items: [
            {
                label: 'Channel Manager',
                description: 'Channel manager — direct, OTAs, partners.',
                href: `${Paths.FEATURES}#channel-manager`,
            },
            {
                label: 'Widget',
                description: 'Embed Travelity on any site.',
                href: `${Paths.FEATURES}#booking-widget`,
            },
            {
                label: 'Availability',
                description: 'Real-time inventory across channels.',
                href: `${Paths.FEATURES}#real-time-availability`,
            },
            {
                label: 'Proposals',
                description: 'Trip proposals customers sign online.',
                href: `${Paths.FEATURES}#trip-proposal-builder`,
            },
            {
                label: 'Payments',
                description: 'Payment gateway integrations.',
                href: `${Paths.FEATURES}#payment-gateways`,
            },
            {
                label: 'Bookings',
                description: 'One queue for every order.',
                href: `${Paths.FEATURES}#booking-management`,
            },
            {
                label: 'Operations',
                description: "Today's departures + ops dashboard.",
                href: `${Paths.FEATURES}#daily-operations`,
            },
            {
                label: 'CRM',
                description: 'Customer records from every booking.',
                href: `${Paths.FEATURES}#crm`,
            },
            {
                label: 'Team',
                description: 'Team roles + collaboration.',
                href: `${Paths.FEATURES}#team-collaboration`,
            },
        ],
    },
    {
        label: 'Pricing',
        href: Paths.PRICING,
    },
];
