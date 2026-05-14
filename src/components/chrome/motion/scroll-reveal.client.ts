/**
 * Scroll-reveal initialiser. Site-wide.
 *
 * Observes every `[data-reveal]` element with a single IntersectionObserver.
 * When an element enters the viewport (≥15% visible, with a 10% bottom
 * rootMargin nudge), adds `.is-revealed` and unobserves. One-shot — never
 * re-triggers on scroll-back.
 *
 * Optional attributes:
 *   data-reveal-direction="up" | "down" | "left" | "right"  (default: up)
 *   data-reveal-delay="120"  (ms — applied as transition-delay)
 *
 * Under `prefers-reduced-motion: reduce`, skips IO entirely and marks every
 * target revealed immediately so the initial-state CSS (opacity:0 + transform)
 * doesn't leave content invisible.
 *
 * Visual state lives in `src/styles/global.css` (the `[data-reveal]` block).
 */

const reducedMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)',
).matches;

const targets =
    document.querySelectorAll<HTMLElement>('[data-reveal]');

if (reducedMotion) {
    targets.forEach((el) => el.classList.add('is-revealed'));
} else {
    const observer = new IntersectionObserver(
        (entries, obs) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                const el = entry.target as HTMLElement;
                const delay = Number(el.dataset.revealDelay ?? 0);
                if (delay > 0) {
                    el.style.transitionDelay = `${delay}ms`;
                }
                el.classList.add('is-revealed');
                obs.unobserve(el);
            });
        },
        { rootMargin: '0px 0px -10% 0px', threshold: 0.15 },
    );

    targets.forEach((el) => observer.observe(el));
}
