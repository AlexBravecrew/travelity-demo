/**
 * Centralized URL paths.
 *
 * Every internal link in this project reads from `Paths.*`. No inline
 * hardcoded URL strings (`<a href="/pricing">`) anywhere outside this file.
 *
 * When a route is renamed or restructured, this is the only file that changes.
 */

export const Paths = {
    HOME: '/',

    // Solutions cluster (Phase 5)
    SOLUTIONS_BOOKING_ENGINE: '/solutions/booking-engine',
    SOLUTIONS_WIDGET: '/solutions/widget',
    SOLUTIONS_INTEGRATIONS: '/solutions/integrations',
    SOLUTIONS_PROPOSALS: '/solutions/proposals',
    SOLUTIONS_REPORTING: '/solutions/reporting',
    SOLUTIONS_SECURITY: '/solutions/security',

    // Audience cluster (Phase 6)
    AUDIENCE_TOUR_OPERATORS: '/audiences/tour-operators',
    AUDIENCE_TRANSFER_PROVIDERS: '/audiences/transfer-providers',
    AUDIENCE_ACCOMMODATION_HOSTS: '/audiences/accommodation-hosts',
    AUDIENCE_INDEPENDENT_GUIDES: '/audiences/independent-guides',

    // Conversion (Phase 7)
    BOOK_DEMO: '/book-demo',

    // Pricing (Phase 8)
    PRICING: '/pricing',

    // Resources (Phase 9 — deferred until content)
    OUR_STORY: '/our-story',
    FAQ: '/faq',
    GUIDES: '/guides',
    HELP: '/help',
    /** External — Travelity status page is hosted off-platform. Marked external in consumers. */
    STATUS: 'https://status.travelity.app',

    // Utility (Phase 10 — deferred)
    CONTACT: '/contact',
    THANK_YOU: '/thank-you',
    PRIVACY: '/privacy',
    TERMS: '/terms',
    DPA: '/dpa',
    COOKIES: '/cookies',
} as const;

export type PathKey = keyof typeof Paths;
