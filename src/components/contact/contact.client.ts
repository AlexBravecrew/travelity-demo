/**
 * Contact form behavior — native replacement for the retired React island.
 *
 * Validates name/email/message client-side (UX only — the backend is
 * authoritative), then POSTs directly to travelity-api's public/contact
 * endpoint. The Turnstile token is captured via the widget's data-callback
 * attributes; the honeypot is read from FormData at submit time.
 */

declare global {
    interface Window {
        // Turnstile invokes these by name via the widget's data-*-callback
        // attributes, so they must live on `window`.
        onTurnstileSuccess?: (token: string) => void;
        onTurnstileExpired?: () => void;
        onTurnstileError?: () => void;
        turnstile?: { reset: () => void };
    }
}

const API_BASE_URL =
    import.meta.env.PUBLIC_API_URL ?? 'https://api.travelity.app';
const CONTACT_ENDPOINT = `${API_BASE_URL}/api/v1/public/contact`;

// Backend returns the same generic 400 for honeypot, CAPTCHA, and field
// validation failures by design — do not differentiate in the UI.
const GENERIC_ERROR = 'Could not send. Please try again.';
const RATE_LIMIT_ERROR = 'Too many requests. Please try again in a moment.';
const NETWORK_ERROR =
    'Network error. Please check your connection and try again.';
const VERIFY_ERROR = 'Please complete the verification below.';
const TURNSTILE_ERROR = 'Verification failed. Please refresh and try again.';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type FieldName = 'name' | 'email' | 'message';

const form = document.getElementById('ct-form') as HTMLFormElement | null;
const successWrap = document.getElementById('ct-success');
const alertBox = document.getElementById('ct-alert');
const submitBtn = document.getElementById(
    'ct-submit',
) as HTMLButtonElement | null;
const nameInput = document.getElementById('ct-name') as HTMLInputElement | null;
const emailInput = document.getElementById(
    'ct-email',
) as HTMLInputElement | null;
const messageInput = document.getElementById(
    'ct-message',
) as HTMLTextAreaElement | null;

if (
    form &&
    successWrap &&
    alertBox &&
    submitBtn &&
    nameInput &&
    emailInput &&
    messageInput
) {
    const fields: Record<FieldName, HTMLInputElement | HTMLTextAreaElement> = {
        name: nameInput,
        email: emailInput,
        message: messageInput,
    };
    const touched = new Set<FieldName>();

    // Turnstile token — null until the challenge passes. The submit button
    // stays disabled (set in markup) until a token arrives.
    let turnstileToken: string | null = null;

    const fieldError = (name: FieldName): string => {
        const value = fields[name].value.trim();
        if (name === 'name') {
            if (value.length < 2) return 'Please enter your full name.';
            if (value.length > 100) return "That's too long for a name.";
        } else if (name === 'email') {
            if (value.length === 0 || !EMAIL_RE.test(value)) {
                return 'Please enter a valid email address.';
            }
            if (value.length > 254) {
                return "That's too long for an email address.";
            }
        } else {
            if (value.length === 0) return 'Please enter a message.';
            if (value.length < 10) {
                return 'A bit more detail helps us help you.';
            }
            if (value.length > 2000) {
                return "That's a long message — trim it down?";
            }
        }
        return '';
    };

    const renderField = (name: FieldName): boolean => {
        const message = fieldError(name);
        const input = fields[name];
        const errorEl = document.getElementById(`ct-${name}-error`);
        if (message) {
            input.setAttribute('aria-invalid', 'true');
            if (errorEl) {
                errorEl.textContent = message;
                errorEl.hidden = false;
            }
        } else {
            input.removeAttribute('aria-invalid');
            if (errorEl) {
                errorEl.textContent = '';
                errorEl.hidden = true;
            }
        }
        return !message;
    };

    (Object.keys(fields) as FieldName[]).forEach((name) => {
        fields[name].addEventListener('blur', () => {
            touched.add(name);
            renderField(name);
        });
        fields[name].addEventListener('input', () => {
            if (touched.has(name)) renderField(name);
        });
    });

    const showAlert = (message: string): void => {
        alertBox.textContent = message;
        alertBox.hidden = false;
    };

    // FormData.get() returns `string | File | null`; the honeypot is always
    // a string input — normalize anything else to empty.
    const readField = (fd: FormData, key: string): string => {
        const value = fd.get(key);
        return typeof value === 'string' ? value : '';
    };

    // Turnstile passed → capture token, allow submit.
    window.onTurnstileSuccess = (token: string): void => {
        turnstileToken = token;
        submitBtn.disabled = false;
    };

    // Token expired (tokens are short-lived) → block submit until re-solved.
    window.onTurnstileExpired = (): void => {
        turnstileToken = null;
        submitBtn.disabled = true;
    };

    // Widget failed to load / challenge errored → block submit, surface it.
    window.onTurnstileError = (): void => {
        turnstileToken = null;
        submitBtn.disabled = true;
        showAlert(TURNSTILE_ERROR);
    };

    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        let firstInvalid: FieldName | null = null;
        for (const name of ['name', 'email', 'message'] as FieldName[]) {
            touched.add(name);
            if (!renderField(name) && !firstInvalid) firstInvalid = name;
        }
        if (firstInvalid) {
            fields[firstInvalid].focus();
            return;
        }

        if (!turnstileToken) {
            showAlert(VERIFY_ERROR);
            return;
        }

        alertBox.hidden = true;
        submitBtn.disabled = true;
        submitBtn.textContent = 'Sending…';

        const fd = new FormData(form);

        try {
            const res = await fetch(CONTACT_ENDPOINT, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: fields.name.value.trim(),
                    email: fields.email.value.trim(),
                    message: fields.message.value.trim(),
                    turnstileToken,
                    website: readField(fd, 'website'),
                }),
            });

            if (res.status === 204) {
                form.hidden = true;
                const emailSlot = successWrap.querySelector(
                    '[data-success-email]',
                );
                if (emailSlot) {
                    emailSlot.textContent = fields.email.value.trim();
                }
                successWrap.hidden = false;
                successWrap.focus();
                return;
            }

            showAlert(res.status === 429 ? RATE_LIMIT_ERROR : GENERIC_ERROR);
        } catch {
            showAlert(NETWORK_ERROR);
        }

        // Failure path only (success returns early). Turnstile tokens are
        // single-use — reset the widget and keep the button disabled until
        // the fresh challenge passes via onTurnstileSuccess.
        submitBtn.textContent = 'Send message';
        turnstileToken = null;
        submitBtn.disabled = true;
        window.turnstile?.reset();
    });
}

export {};
