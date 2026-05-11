/**
 * Nav client behavior.
 *
 * Responsibilities:
 *   1. Add `.scrolled` to the nav after the page scrolls past 4px.
 *   2. Desktop sub-row: hover (with intent delay) swaps the visible panel.
 *      Pinned panels (determined at SSR by route) stay shown on leave.
 *   3. Click on a trigger toggles its panel as a preview.
 *   4. Escape/outside-click reverts to the pinned panel (or hides).
 *   5. Hamburger toggles the mobile menu (slide-down panel).
 *   6. Mobile menu's accordion sections expand/collapse independently.
 *
 * No external state library. Plain DOM, plain TypeScript.
 */

const HOVER_OPEN_DELAY_MS = 100;
const HOVER_CLOSE_DELAY_MS = 120;
const SCROLL_THRESHOLD_PX = 4;

function init() {
    initScrollHandlers();
    initDesktopSubrow();
    initMobileMenu();
}

// --- Scroll-driven effects (sticky nav border + parallax photo) ----

function initScrollHandlers() {
    const nav = document.querySelector<HTMLElement>('[data-nav-root]');
    const parallaxPhoto = document.querySelector<HTMLElement>(
        '[data-parallax-photo]',
    );

    if (!nav && !parallaxPhoto) return;

    let ticking = false;

    function onScroll() {
        // Sticky nav border
        if (nav) {
            if (window.scrollY > SCROLL_THRESHOLD_PX) {
                nav.classList.add('scrolled');
            } else {
                nav.classList.remove('scrolled');
            }
        }

        // Parallax photo: translate Y based on the photo container's position
        // relative to the viewport. Range is ±40px (the container has -10%
        // top/bottom margin so it can travel without exposing edges).
        // Skip entirely under prefers-reduced-motion.
        const prefersReducedMotion = window.matchMedia(
            '(prefers-reduced-motion: reduce)',
        ).matches;

        if (parallaxPhoto && !prefersReducedMotion) {
            const container = parallaxPhoto.parentElement;
            if (container) {
                const rect = container.getBoundingClientRect();
                const viewportH = window.innerHeight;
                if (rect.bottom > 0 && rect.top < viewportH) {
                    const total = viewportH + rect.height;
                    const progress = (viewportH - rect.top) / total;
                    const offset = (progress - 0.5) * 80; // ±40px
                    parallaxPhoto.style.transform = `translateY(${offset}px)`;
                }
            }
        }

        ticking = false;
    }

    window.addEventListener(
        'scroll',
        () => {
            if (!ticking) {
                window.requestAnimationFrame(onScroll);
                ticking = true;
            }
        },
        { passive: true },
    );

    onScroll(); // initial state on load
}

// --- Desktop sub-row hover-swap ----------------------------------

function initDesktopSubrow() {
    const navRoot = document.querySelector<HTMLElement>('[data-nav-root]');
    const subrowEl = document.querySelector<HTMLElement>('[data-nav-subrow]');
    if (!navRoot || !subrowEl) return;
    const subrow: HTMLElement = subrowEl;

    const triggers = Array.from(
        document.querySelectorAll<HTMLElement>('[data-nav-item]'),
    );
    if (!triggers.length) return;

    const panels = Array.from(
        subrow.querySelectorAll<HTMLElement>('[data-subrow-section]'),
    );
    if (!panels.length) return;

    // The pinned panel (if any) was marked at SSR. It's the panel we
    // revert to on hover-leave; null means "hide the row entirely."
    const pinnedPanel =
        panels.find((p) => p.dataset.subrowPinned === 'true') ?? null;

    const panelByLabel = new Map<string, HTMLElement>();
    panels.forEach((p) => {
        const label = p.dataset.subrowSection;
        if (label) panelByLabel.set(label, p);
    });

    let openTimer: number | null = null;
    let closeTimer: number | null = null;
    /** Label currently being previewed via hover/click, or null for "show pinned (or nothing)". */
    let previewLabel: string | null = null;

    function clearTimers() {
        if (openTimer !== null) {
            window.clearTimeout(openTimer);
            openTimer = null;
        }
        if (closeTimer !== null) {
            window.clearTimeout(closeTimer);
            closeTimer = null;
        }
    }

    function setActivePanel(label: string | null) {
        const targetPanel =
            label !== null ? (panelByLabel.get(label) ?? null) : pinnedPanel;

        panels.forEach((p) => {
            p.dataset.subrowActive =
                p === targetPanel && targetPanel !== null ? 'true' : 'false';
        });

        // Open/close styling on the trigger (chevron rotate + bg hint).
        // The pinned section's teal text is set by SSR and doesn't change.
        triggers.forEach((t) => {
            const triggerLabel = t.dataset.sectionLabel;
            const btn =
                t.querySelector<HTMLButtonElement>('[data-nav-trigger]');
            if (!btn) return;
            const isOpen = label !== null && triggerLabel === label;
            t.classList.toggle('open', isOpen);
            btn.setAttribute('aria-expanded', String(isOpen));
        });

        // Host slide: add `is-hover-preview` when we're showing a panel
        // that isn't the pinned one (or there's no pinned one). The class
        // triggers the max-height transition.
        const showingHoverPreview =
            label !== null &&
            (!pinnedPanel || panelByLabel.get(label) !== pinnedPanel);
        subrow.classList.toggle('is-hover-preview', showingHoverPreview);
    }

    function scheduleOpen(label: string) {
        if (closeTimer !== null) {
            window.clearTimeout(closeTimer);
            closeTimer = null;
        }
        if (openTimer !== null) {
            window.clearTimeout(openTimer);
        }
        openTimer = window.setTimeout(() => {
            previewLabel = label;
            setActivePanel(label);
            openTimer = null;
        }, HOVER_OPEN_DELAY_MS);
    }

    function scheduleClose() {
        if (openTimer !== null) {
            window.clearTimeout(openTimer);
            openTimer = null;
        }
        if (closeTimer !== null) {
            window.clearTimeout(closeTimer);
        }
        closeTimer = window.setTimeout(() => {
            previewLabel = null;
            setActivePanel(null); // revert to pinned (or hide if no pin)
            closeTimer = null;
        }, HOVER_CLOSE_DELAY_MS);
    }

    triggers.forEach((trigger) => {
        const label = trigger.dataset.sectionLabel;
        if (!label) return;
        const btn =
            trigger.querySelector<HTMLButtonElement>('[data-nav-trigger]');
        if (!btn) return;

        trigger.addEventListener('mouseenter', () => scheduleOpen(label));
        trigger.addEventListener('mouseleave', () => scheduleClose());

        btn.addEventListener('click', (e) => {
            e.preventDefault();
            clearTimers();
            if (previewLabel === label) {
                previewLabel = null;
                setActivePanel(null);
            } else {
                previewLabel = label;
                setActivePanel(label);
            }
        });

        btn.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                clearTimers();
                previewLabel = null;
                setActivePanel(null);
                btn.focus();
            }
        });
    });

    // Keep the sub-row open while the mouse is over it (so the user can
    // travel from the trigger down into the row).
    subrow.addEventListener('mouseenter', () => {
        if (closeTimer !== null) {
            window.clearTimeout(closeTimer);
            closeTimer = null;
        }
    });
    subrow.addEventListener('mouseleave', () => scheduleClose());

    // Outside click clears any hover-preview; pinned panel stays.
    document.addEventListener('click', (e) => {
        const target = e.target as Element | null;
        if (!target) return;
        if (
            target.closest('[data-nav-root]') ||
            target.closest('[data-nav-subrow]')
        ) {
            return;
        }
        if (previewLabel !== null) {
            clearTimers();
            previewLabel = null;
            setActivePanel(null);
        }
    });

    // Escape anywhere clears the hover-preview.
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && previewLabel !== null) {
            clearTimers();
            previewLabel = null;
            setActivePanel(null);
        }
    });
}

// --- Mobile menu --------------------------------------------------

function initMobileMenu() {
    const root = document.querySelector<HTMLElement>('[data-mobile-menu-root]');
    const trigger = document.querySelector<HTMLButtonElement>(
        '[data-mobile-menu-trigger]',
    );
    if (!root || !trigger) return;

    function open() {
        root!.classList.add('open');
        root!.setAttribute('aria-hidden', 'false');
        trigger!.setAttribute('aria-expanded', 'true');
        document.body.style.overflow = 'hidden';
    }
    function close() {
        root!.classList.remove('open');
        root!.setAttribute('aria-hidden', 'true');
        trigger!.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
        // Also collapse all accordion sections
        root!
            .querySelectorAll<HTMLElement>('[data-mobile-section].open')
            .forEach((s) => {
                s.classList.remove('open');
                const btn = s.querySelector<HTMLButtonElement>(
                    '[data-mobile-section-trigger]',
                );
                btn?.setAttribute('aria-expanded', 'false');
            });
    }

    trigger.addEventListener('click', () => {
        const isOpen = root.classList.contains('open');
        if (isOpen) {
            close();
        } else {
            open();
        }
    });

    // Escape anywhere closes mobile menu
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && root.classList.contains('open')) {
            close();
            trigger.focus();
        }
    });

    // Accordion sections inside the mobile menu
    root.querySelectorAll<HTMLElement>('[data-mobile-section]').forEach(
        (section) => {
            const sectionTrigger = section.querySelector<HTMLButtonElement>(
                '[data-mobile-section-trigger]',
            );
            if (!sectionTrigger) return;

            sectionTrigger.addEventListener('click', () => {
                const isOpen = section.classList.contains('open');
                section.classList.toggle('open');
                sectionTrigger.setAttribute('aria-expanded', String(!isOpen));
            });
        },
    );
}

// Run on initial load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

// Mark this file as an ES module so its top-level `init` doesn't collide
// with other client scripts (e.g. anchor-nav.client.ts) when the TypeScript
// compiler treats them as scripts in a shared global scope.
export {};
