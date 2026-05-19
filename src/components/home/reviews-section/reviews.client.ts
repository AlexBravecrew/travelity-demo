/**
 * Reviews carousel — client behavior for the home "social proof" band.
 *
 * Two display modes, switched on viewport width:
 *
 *   lg+ (≥1024px): grid layout. One card "active" at a time. Card 1 is
 *     the default-active; hovering any card transfers state; leaving the
 *     grid restores card 1.
 *
 *   <lg (mobile + tablet): horizontal scroll-snap carousel — 1 card
 *     visible on phone, 3 on tablet. Every card is visually active (text
 *     on, halo on) and STRAIGHT — no tilt, no Y offset, no scale-up.
 *     Infinite loop via clones of the first/last cards at the ends; on
 *     each scroll-settle we check for a clone-landing and silently jump
 *     scrollLeft to the matching real card. Pagination dots track and
 *     drive the position.
 *
 * All visual state is written as inline styles (transform / opacity /
 * box-shadow / z-index) so it can't be undone by CSS specificity
 * surprises. Re-syncs on viewport resize.
 */

const ACTIVE_TRANSFORM =
    'translateY(calc(var(--y, 0px) - 6px)) rotate(0deg) scale(1.04)';
const RESTING_TRANSFORM =
    'translateY(var(--y, 0px)) rotate(var(--tilt, 0deg))';
const STRAIGHT_TRANSFORM = 'translateY(0) rotate(0deg) scale(1)';
const ACTIVE_SHADOW =
    '0 26px 56px -18px hsl(220 60% 4% / 0.4), 0 10px 24px -10px hsl(220 60% 4% / 0.2)';
const RESTING_SHADOW =
    '0 18px 40px -16px hsl(218 50% 38% / 0.35), 0 6px 16px -8px hsl(222 47% 11% / 0.15)';

const SETTLE_DEBOUNCE_MS = 120;
const RESIZE_DEBOUNCE_MS = 200;

function writeStyles(
    card: Element,
    transform: string,
    shadow: string,
    overlayOn: boolean,
    haloOn: boolean,
    zIdx: string,
): void {
    const frame = card.querySelector<HTMLElement>('.review-card-frame');
    const overlay = card.querySelector<HTMLElement>('.review-overlay');
    const halo = card.querySelector<HTMLElement>('.review-card-halo');
    if (frame) {
        frame.style.transform = transform;
        frame.style.boxShadow = shadow;
        frame.style.zIndex = zIdx;
    }
    if (overlay) overlay.style.opacity = overlayOn ? '1' : '0';
    if (halo) halo.style.opacity = haloOn ? '1' : '0';
}

function setDesktopActive(card: Element): void {
    card.setAttribute('data-active', 'true');
    writeStyles(card, ACTIVE_TRANSFORM, ACTIVE_SHADOW, true, true, '2');
}

function setDesktopResting(card: Element): void {
    card.setAttribute('data-active', 'false');
    writeStyles(card, RESTING_TRANSFORM, RESTING_SHADOW, false, false, '');
}

function setMobileActive(card: Element): void {
    // Every card on mobile: straight, active, halo on, text on.
    card.setAttribute('data-active', 'true');
    writeStyles(card, STRAIGHT_TRANSFORM, RESTING_SHADOW, true, true, '');
}

function init(): void {
    const gridEl = document.querySelector<HTMLElement>('[data-review-grid]');
    if (!gridEl) return;
    // Re-bind as a non-nullable const — TS doesn't carry the guard above
    // into the nested helper closures, so this saves a check in each.
    const grid: HTMLElement = gridEl;
    const cards = Array.from(
        grid.querySelectorAll<HTMLElement>('[data-review-card]'),
    );
    if (cards.length === 0) return;

    const carouselQuery = window.matchMedia('(max-width: 1023px)');
    const tabletQuery = window.matchMedia(
        '(min-width: 768px) and (max-width: 1023px)',
    );
    let clonesStart: HTMLElement[] = [];
    let clonesEnd: HTMLElement[] = [];

    // How many cards are visible in the carousel viewport at once — 3 on
    // tablet, 1 on phone. Drives clone count and the initial scroll
    // position so the wrap math stays correct.
    function visibleCount(): number {
        return tabletQuery.matches ? 3 : 1;
    }

    function setOnlyActive(target: Element): void {
        for (const card of cards) {
            if (card === target) setDesktopActive(card);
            else setDesktopResting(card);
        }
    }

    function setAllMobileActive(): void {
        for (const card of cards) setMobileActive(card);
    }

    function ensureClones(n: number): void {
        // If the clone count already matches the visible count, keep
        // them; otherwise rebuild from scratch.
        if (clonesStart.length === n && clonesEnd.length === n) return;
        removeClones();
        // Start clones: the LAST n real cards, in order, so the user
        // scrolling backward sees [..., R-2, R-1, R0, R1].
        const startFrag = document.createDocumentFragment();
        for (let i = 0; i < n; i++) {
            const source = cards[cards.length - n + i];
            const clone = source.cloneNode(true) as HTMLElement;
            clone.removeAttribute('data-review-card');
            clone.setAttribute('data-review-clone', 'true');
            setMobileActive(clone);
            clonesStart.push(clone);
            startFrag.appendChild(clone);
        }
        grid.insertBefore(startFrag, grid.firstChild);
        // End clones: the FIRST n real cards, in order.
        const endFrag = document.createDocumentFragment();
        for (let i = 0; i < n; i++) {
            const clone = cards[i].cloneNode(true) as HTMLElement;
            clone.removeAttribute('data-review-card');
            clone.setAttribute('data-review-clone', 'true');
            setMobileActive(clone);
            clonesEnd.push(clone);
            endFrag.appendChild(clone);
        }
        grid.appendChild(endFrag);
    }

    function removeClones(): void {
        for (const c of clonesStart) c.parentNode?.removeChild(c);
        for (const c of clonesEnd) c.parentNode?.removeChild(c);
        clonesStart = [];
        clonesEnd = [];
    }

    // Width of one card + gap. Re-read on every call so resize /
    // orientation changes don't break the math.
    function getStep(): number {
        const styles = getComputedStyle(grid);
        const gap = parseFloat(styles.columnGap || styles.gap || '0') || 0;
        return cards[0].offsetWidth + gap;
    }

    function scrollToCardIndex(idx: number, smooth: boolean): void {
        grid.scrollTo({
            left: idx * getStep(),
            behavior: smooth ? 'smooth' : 'instant',
        });
    }

    function applyMobileMode(): void {
        setAllMobileActive();
        const n = visibleCount();
        ensureClones(n);
        requestAnimationFrame(() => {
            // Real cards begin at index n (after the n start clones).
            scrollToCardIndex(n, false);
        });
    }

    function applyDesktopMode(): void {
        removeClones();
        grid.scrollLeft = 0;
        setOnlyActive(cards[0]);
    }

    function sync(): void {
        if (carouselQuery.matches) applyMobileMode();
        else applyDesktopMode();
    }

    sync();

    // Desktop hover handlers (no-op while in carousel mode).
    for (const card of cards) {
        card.addEventListener('mouseenter', () => {
            if (!carouselQuery.matches) setOnlyActive(card);
        });
    }
    grid.addEventListener('mouseleave', () => {
        if (!carouselQuery.matches && cards[0]) setOnlyActive(cards[0]);
    });

    // Pagination dots — one per real card. The active dot tracks the
    // current "first visible" real card. Click a dot to scroll to it.
    const dots = Array.from(
        document.querySelectorAll<HTMLElement>('[data-review-dot]'),
    );

    function updateDots(): void {
        if (!carouselQuery.matches || dots.length === 0) return;
        const step = getStep();
        if (step === 0) return;
        const idx = Math.round(grid.scrollLeft / step);
        const n = visibleCount();
        const r = cards.length;
        // Map carousel index (which can land on clones) to the real card
        // index it visually represents.
        const realIdx = (((idx - n) % r) + r) % r;
        dots.forEach((dot, i) => {
            dot.setAttribute('data-active', i === realIdx ? 'true' : 'false');
        });
    }

    dots.forEach((dot, i) => {
        dot.addEventListener('click', () => {
            if (!carouselQuery.matches) return;
            scrollToCardIndex(visibleCount() + i, true);
        });
    });

    // Carousel scroll handler — two jobs, two timing strategies:
    //
    //   1. updateDots() runs on every scroll frame (rAF-throttled to one
    //      call per animation frame) so the indicator never lags the
    //      user's gesture.
    //
    //   2. Infinite-loop wrap detection is debounced after the last
    //      scroll event so snap has time to settle — mid-swipe we don't
    //      want to scrollTo and fight the user. With n visible at a
    //      time, real cards sit at indices [n .. n+r-1]; when the first-
    //      visible index hits the start clones (idx <= 0) or the end
    //      clones (idx >= n+r), silently jump scrollLeft to the matching
    //      real position. Visually identical — clones are exact copies.
    let scrollRaf: number | null = null;
    let settleTimer: number | undefined;
    grid.addEventListener(
        'scroll',
        () => {
            if (!carouselQuery.matches || clonesStart.length === 0) return;
            if (scrollRaf === null) {
                scrollRaf = requestAnimationFrame(() => {
                    scrollRaf = null;
                    updateDots();
                });
            }
            clearTimeout(settleTimer);
            settleTimer = window.setTimeout(() => {
                const step = getStep();
                if (step === 0) return;
                const idx = Math.round(grid.scrollLeft / step);
                const n = visibleCount();
                const r = cards.length;
                if (idx <= 0) {
                    scrollToCardIndex(r, false);
                } else if (idx >= n + r) {
                    scrollToCardIndex(n, false);
                }
                updateDots();
            }, SETTLE_DEBOUNCE_MS);
        },
        { passive: true },
    );

    // Initial dot state — after applyMobileMode positions the scroll at
    // the first real card. Run after a rAF so the position has settled.
    requestAnimationFrame(updateDots);

    // Re-sync on viewport resize — debounced so we don't thrash the mode
    // switch during a slow resize.
    let resizeTimer: number | undefined;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = window.setTimeout(sync, RESIZE_DEBOUNCE_MS);
    });
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
