import type { NavLinkData } from './nav-data';

/**
 * Resolve the active section for the current pathname.
 *
 * A section is "active" when the current pathname matches either:
 *   - the dropdown trigger's own `href` (hybrid links like Features
 *     where the trigger navigates to a page that hosts its sub-sections
 *     as anchors), OR
 *   - one of the dropdown items' hrefs (sub-pages on their own routes).
 *
 * The secondary nav row pins to that section so the user always sees
 * which area of the site they're in and which siblings/anchors are
 * available.
 *
 * Returns null when the current page doesn't belong to any grouped
 * section (e.g. /, /pricing, /contact) — no sub-row in that case.
 */
export function getActiveSection(
    pathname: string,
    links: NavLinkData[],
): NavLinkData | null {
    const normalized = stripTrailingSlash(pathname);

    for (const link of links) {
        if (!link.items?.length) continue;
        if (
            link.href &&
            stripTrailingSlash(stripHash(link.href)) === normalized
        ) {
            return link;
        }
        const match = link.items.some(
            (item) => stripTrailingSlash(stripHash(item.href)) === normalized,
        );
        if (match) return link;
    }
    return null;
}

function stripTrailingSlash(p: string): string {
    return p.length > 1 && p.endsWith('/') ? p.slice(0, -1) : p;
}

/**
 * Strip any `#fragment` so anchor-bearing hrefs (e.g. `/features#crm`)
 * still match the bare pathname when the user is on `/features`.
 */
function stripHash(p: string): string {
    const hashAt = p.indexOf('#');
    return hashAt === -1 ? p : p.slice(0, hashAt);
}
