import { InlineWidget, useCalendlyEventListener } from 'react-calendly';

/**
 * Default Calendly URL ported from v1 (with text/primary color params baked in).
 * Production override: PUBLIC_CALENDLY_URL env var.
 */
const DEFAULT_CALENDLY_URL =
    'https://calendly.com/travelity-sales/30min?text_color=3a4d7d&primary_color=55b5cf';

/**
 * Backend endpoint that syncs the booking into Travelity's CRM.
 * Receives { event, invitee } URIs from Calendly's event_scheduled payload.
 *
 * TODO(v2-backend): replace with v2's CRM-sync endpoint when it ships.
 * v1 endpoint is hardcoded here for now; the call site, payload shape,
 * and error handling are stable — only the URL swaps.
 */
const CRM_SYNC_ENDPOINT = 'https://my.travelity.app/api/v1/cem/request-demo';

/** Where to redirect the user after a successful booking. */
const POST_BOOKING_REDIRECT = '/thank-you';

interface CalendlyEventScheduledPayload {
    event: { uri: string };
    invitee: { uri: string };
}

export default function CalendlyWidget() {
    const calendlyUrl =
        import.meta.env.PUBLIC_CALENDLY_URL || DEFAULT_CALENDLY_URL;

    useCalendlyEventListener({
        onEventScheduled: async (event) => {
            const payload = event.data.payload as CalendlyEventScheduledPayload;

            // Sync to CRM. If this fails we still redirect the user — the
            // booking is already confirmed inside Calendly and the user
            // shouldn't be punished for our backend hiccup. We DO log the
            // failure so it shows up in DevTools / observability.
            try {
                const res = await fetch(CRM_SYNC_ENDPOINT, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        event: payload.event.uri,
                        invitee: payload.invitee.uri,
                    }),
                });

                if (!res.ok) {
                    console.error(
                        '[calendly] CRM sync POST failed:',
                        res.status,
                        res.statusText,
                    );
                }
            } catch (err) {
                console.error('[calendly] CRM sync POST threw:', err);
            }

            // TODO(analytics): fire Google Ads conversion when GTM is wired.
            // v1 fires AW-17231403747/o6zNCP7t0fYaEOO1yZhA here. We can't
            // call gtag() because GTM isn't bootstrapped yet — see the
            // analytics phase for the wire-up. Until then this is a no-op.
            //
            // if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
            //     window.gtag('event', 'conversion', {
            //         send_to: 'AW-17231403747/o6zNCP7t0fYaEOO1yZhA',
            //     });
            // }

            // Redirect last so even a CRM sync failure still lands the user
            // on /thank-you (their booking is real inside Calendly).
            window.location.href = POST_BOOKING_REDIRECT;
        },
    });

    return (
        <div className="calendly-widget-container">
            <InlineWidget
                url={calendlyUrl}
                styles={{
                    minWidth: '320px',
                    // Calendly's content height varies by view: date-picker
                    // (~950px), time-slots picker (~1040px), confirmation
                    // (~900px). 1050px clears the tallest view at our 840px
                    // container width without internal scrollbar. Some views
                    // will show a small bottom whitespace — unavoidable
                    // since the iframe is fixed-height and Calendly's
                    // content height varies (cross-origin, no autosize).
                    height: '1050px',
                }}
                pageSettings={{
                    hideEventTypeDetails: false,
                    hideLandingPageDetails: false,
                    hideGdprBanner: false,
                }}
            />
        </div>
    );
}
