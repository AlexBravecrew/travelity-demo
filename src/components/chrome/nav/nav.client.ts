/**
 * Nav client behavior.
 *
 * Responsibilities:
 *   1. Add `.scrolled` to the nav after the page scrolls past 4px.
 *   2. Open dropdowns on hover (with 100ms intent delay) and on click.
 *   3. Open dropdowns on Enter/Space when the trigger has keyboard focus.
 *   4. Close dropdowns on hover-leave (120ms close delay), Escape, or
 *      outside-click. Only one dropdown open at a time.
 *   5. Update `aria-expanded` on each trigger to match its open state.
 *   6. Hamburger toggles the mobile menu (slide-down panel).
 *   7. Mobile menu's accordion sections expand/collapse independently.
 *
 * No external state library. Plain DOM, plain TypeScript.
 */

const HOVER_OPEN_DELAY_MS = 100;
const HOVER_CLOSE_DELAY_MS = 120;
const SCROLL_THRESHOLD_PX = 4;

type NavItem = {
    el: HTMLElement;
    trigger: HTMLButtonElement;
    openTimer: number | null;
    closeTimer: number | null;
};

function init() {
    initScrollHandlers();
    initDesktopDropdowns();
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

// --- Desktop dropdowns --------------------------------------------

function initDesktopDropdowns() {
    const items: NavItem[] = Array.from(
        document.querySelectorAll<HTMLElement>('.nav-item'),
    )
        .map((el): NavItem | null => {
            const trigger =
                el.querySelector<HTMLButtonElement>('[data-nav-trigger]');
            return trigger
                ? { el, trigger, openTimer: null, closeTimer: null }
                : null;
        })
        .filter((x): x is NavItem => x !== null);

    if (!items.length) return;

    function openItem(target: NavItem) {
        // Cancel any pending close on the target
        if (target.closeTimer !== null) {
            window.clearTimeout(target.closeTimer);
            target.closeTimer = null;
        }
        // Close all others
        items.forEach((other) => {
            if (other !== target && other.el.classList.contains('open')) {
                other.el.classList.remove('open');
                other.trigger.setAttribute('aria-expanded', 'false');
            }
        });
        // Open this one
        target.el.classList.add('open');
        target.trigger.setAttribute('aria-expanded', 'true');
    }

    function closeItem(target: NavItem) {
        target.el.classList.remove('open');
        target.trigger.setAttribute('aria-expanded', 'false');
    }

    items.forEach((item) => {
        const { el, trigger } = item;

        // Hover: open after intent delay
        el.addEventListener('mouseenter', () => {
            if (item.closeTimer !== null) {
                window.clearTimeout(item.closeTimer);
                item.closeTimer = null;
            }
            item.openTimer = window.setTimeout(() => {
                openItem(item);
                item.openTimer = null;
            }, HOVER_OPEN_DELAY_MS);
        });

        // Hover: close after delay
        el.addEventListener('mouseleave', () => {
            if (item.openTimer !== null) {
                window.clearTimeout(item.openTimer);
                item.openTimer = null;
            }
            item.closeTimer = window.setTimeout(() => {
                closeItem(item);
                item.closeTimer = null;
            }, HOVER_CLOSE_DELAY_MS);
        });

        // Click: toggle
        trigger.addEventListener('click', (e) => {
            e.preventDefault();
            const isOpen = el.classList.contains('open');
            if (isOpen) {
                closeItem(item);
            } else {
                openItem(item);
            }
        });

        // Keyboard: Enter/Space opens (button default), Escape closes
        trigger.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                closeItem(item);
                trigger.focus();
            }
        });
    });

    // Outside click closes all
    document.addEventListener('click', (e) => {
        const target = e.target as Element | null;
        if (!target || !target.closest('.nav-item')) {
            items.forEach(closeItem);
        }
    });

    // Escape anywhere closes all
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            items.forEach(closeItem);
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
