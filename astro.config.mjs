import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import netlify from '@astrojs/netlify';
import partytown from '@astrojs/partytown';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
    // Canonical production origin. Drives canonical/OG URLs (read via
    // `Astro.site` in MarketingLayout) and is required by @astrojs/sitemap.
    site: 'https://travelity.app',
    server: {
        // Matches the port `npx serve dist` uses by default, so a single
        // `localhost:3000` whitelist entry in CookieYes covers both
        // `astro dev` and prod-build previews.
        port: 3000,
    },
    vite: {
        plugins: [tailwindcss()],
    },
    integrations: [
        // Partytown runs gtag.js in a Web Worker. The `forward` list mirrors
        // window-globals from main thread → worker so calls like
        // `window.gtag('event', ...)` and `window.dataLayer.push(...)` work
        // transparently. Required for Consent Mode v2 + ad-conversion calls
        // that originate from main-thread event handlers (e.g. Calendly
        // postMessage listener in CalendlyWidget.astro).
        partytown({
            config: {
                forward: ['dataLayer.push', 'gtag'],
            },
        }),
        // Generates sitemap-index.xml + sitemap-0.xml at build time.
        // `/thank-you` (post-conversion) and `/404` are not search targets.
        sitemap({
            filter: (page) =>
                !page.includes('/thank-you') && !page.includes('/404'),
        }),
    ],
    adapter: netlify(),
});
