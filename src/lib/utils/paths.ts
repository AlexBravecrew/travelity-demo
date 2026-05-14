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

    // Solutions (Phase 5 cluster retired Phase 21; now a single page)
    SOLUTIONS: '/solutions',

    // Conversion (Phase 7)
    BOOK_DEMO: '/book-demo',

    /**
     * External — admin app where new users start a free trial.
     * Marked external in consumers (target=_blank + rel=noopener noreferrer).
     */
    START_TRIAL: 'https://admin.travelity.app',

    // Pricing (Phase 8)
    PRICING: '/pricing',

    // Features (Phase 19 — page to be built next; cards link with #slug)
    FEATURES: '/features',

    // Resources (Phase 9 — deferred until content)
    OUR_STORY: '/our-story',
    FAQ: '/faq',

    // Utility
    CONTACT: '/contact',
    /**
     * No-JS fallback target. The React form islands swap to a success
     * component in-place rather than redirecting, so nothing currently
     * navigates to THANK_YOU. The constant remains as the destination
     * for any future form that hard-redirects (e.g. a non-React form,
     * or a server-rendered form action that uses `Astro.redirect`).
     */
    THANK_YOU: '/thank-you',

    // Legal (Phase 9)
    LEGAL_PRIVACY: '/legal/privacy',
    LEGAL_TERMS: '/legal/terms',
    LEGAL_DPA: '/legal/dpa',
    LEGAL_COOKIES: '/legal/cookies',
} as const;

export type PathKey = keyof typeof Paths;
