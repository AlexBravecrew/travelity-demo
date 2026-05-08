/**
 * Anchor nav scroll-spy.
 *
 * On page scroll, find which anchor target is currently in view and add
 * `.is-active` to its corresponding nav link (and remove from others).
 *
 * Uses IntersectionObserver — efficient, fires on viewport intersection
 * rather than every scroll frame.
 */

function init() {
    const root = document.querySelector<HTMLElement>('[data-anchor-nav]');
    if (!root) return;

    const links = Array.from(
        root.querySelectorAll<HTMLAnchorElement>('[data-anchor-link]'),
    );
    if (!links.length) return;

    // Build target → link map
    const linkByTargetId = new Map<string, HTMLAnchorElement>();
    links.forEach((link) => {
        const targetId = link.getAttribute('data-anchor-target');
        if (targetId) linkByTargetId.set(targetId, link);
    });

    // Find the section elements
    const sections = Array.from(linkByTargetId.keys())
        .map((id) => document.getElementById(id))
        .filter((el): el is HTMLElement => el !== null);

    if (!sections.length) return;

    const setActive = (targetId: string) => {
        links.forEach((link) => link.classList.remove('is-active'));
        const link = linkByTargetId.get(targetId);
        if (link) link.classList.add('is-active');
    };

    const observer = new IntersectionObserver(
        (entries) => {
            // Pick the topmost intersecting entry
            const visible = entries
                .filter((e) => e.isIntersecting)
                .sort(
                    (a, b) =>
                        a.boundingClientRect.top - b.boundingClientRect.top,
                );
            if (visible[0]) {
                setActive(visible[0].target.id);
            }
        },
        {
            // Trigger when section's top is in the upper third of viewport
            rootMargin: '-30% 0px -55% 0px',
            threshold: 0,
        },
    );

    sections.forEach((section) => observer.observe(section));
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

// Mark this file as an ES module so its top-level `init` doesn't collide
// with other client scripts (e.g. nav.client.ts) when the TypeScript
// compiler treats them as scripts in a shared global scope.
export {};
