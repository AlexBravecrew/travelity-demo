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
        href: Paths.SOLUTIONS,
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
