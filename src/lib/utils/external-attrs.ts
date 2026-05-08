/**
 * Returns the HTML attributes needed to mark a link as opening in a new tab,
 * with the necessary security tokens. Used by Button (when href + external)
 * and LinkInline.
 *
 * `noopener` prevents the new page from accessing window.opener.
 * `noreferrer` blocks the Referer header.
 */
export function externalAttrs(external: boolean) {
    return external
        ? ({ target: '_blank', rel: 'noopener noreferrer' } as const)
        : ({} as const);
}
