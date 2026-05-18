/**
 * Lightbox behavior — drives the shared <Lightbox /> overlay.
 *
 * Any element marked `[data-lightbox-group]` is a trigger. Triggers with the
 * same group value form one gallery; opening any of them lets the user step
 * through the rest. A single-image group hides the prev/next controls.
 *
 * Built on a native <dialog>: `showModal()` provides the top layer,
 * Esc-to-close, and focus trapping; the `close` event is the single cleanup
 * point (covers Esc, the close button, and backdrop clicks).
 */

interface LightboxItem {
    src: string;
    alt: string;
}

const dialog = document.querySelector<HTMLDialogElement>('[data-lightbox]');
const imgEl = dialog?.querySelector<HTMLImageElement>('[data-lightbox-img]');
const counterEl = dialog?.querySelector<HTMLElement>('[data-lightbox-counter]');
const prevBtn = dialog?.querySelector<HTMLButtonElement>(
    '[data-lightbox-prev]',
);
const nextBtn = dialog?.querySelector<HTMLButtonElement>(
    '[data-lightbox-next]',
);
const closeBtn = dialog?.querySelector<HTMLButtonElement>(
    '[data-lightbox-close]',
);

const triggers = [
    ...document.querySelectorAll<HTMLElement>('[data-lightbox-group]'),
];

if (
    dialog &&
    imgEl &&
    counterEl &&
    prevBtn &&
    nextBtn &&
    closeBtn &&
    triggers.length > 0
) {
    let group: LightboxItem[] = [];
    let index = 0;

    const render = (): void => {
        const item = group[index];
        if (!item) return;
        imgEl.src = item.src;
        imgEl.alt = item.alt;
        const multi = group.length > 1;
        prevBtn.hidden = !multi;
        nextBtn.hidden = !multi;
        counterEl.hidden = !multi;
        counterEl.textContent = multi ? `${index + 1} / ${group.length}` : '';
    };

    const open = (groupName: string, startSrc: string): void => {
        group = triggers
            .filter((t) => t.dataset.lightboxGroup === groupName)
            .map((t) => ({
                src: t.dataset.lightboxSrc ?? '',
                alt: t.dataset.lightboxAlt ?? '',
            }));
        if (group.length === 0) return;
        const found = group.findIndex((i) => i.src === startSrc);
        index = found >= 0 ? found : 0;
        render();
        dialog.showModal();
        document.documentElement.style.overflow = 'hidden';
    };

    const step = (delta: number): void => {
        if (group.length < 2) return;
        index = (index + delta + group.length) % group.length;
        render();
    };

    triggers.forEach((trigger) => {
        trigger.addEventListener('click', () => {
            open(
                trigger.dataset.lightboxGroup ?? '',
                trigger.dataset.lightboxSrc ?? '',
            );
        });
    });

    prevBtn.addEventListener('click', () => step(-1));
    nextBtn.addEventListener('click', () => step(1));
    closeBtn.addEventListener('click', () => dialog.close());

    // Click outside the image and controls closes the modal.
    dialog.addEventListener('click', (event) => {
        const target = event.target as HTMLElement;
        if (!target.closest('[data-lightbox-content], button')) {
            dialog.close();
        }
    });

    // ←/→ navigate. Esc is handled natively by <dialog>.
    dialog.addEventListener('keydown', (event) => {
        if (event.key === 'ArrowLeft') {
            event.preventDefault();
            step(-1);
        } else if (event.key === 'ArrowRight') {
            event.preventDefault();
            step(1);
        }
    });

    // Single cleanup point — fires on Esc, the close button, and backdrop.
    dialog.addEventListener('close', () => {
        document.documentElement.style.overflow = '';
        imgEl.removeAttribute('src');
    });
}

export {};
