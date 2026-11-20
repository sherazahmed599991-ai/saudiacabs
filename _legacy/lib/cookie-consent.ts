export interface CookieConsentPrefs {
    analytics: boolean;
    marketing: boolean;
}

export interface CookieConsentState extends CookieConsentPrefs {
    timestamp: number;
}

const STORAGE_KEY = 'taxiksa-cookie-consent';
const CONSENT_EVENT = 'taxiksa-cookie-consent-change';

export function getStoredConsent(): CookieConsentState | null {
    if (typeof window === 'undefined') return null;
    try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        if (typeof parsed?.analytics !== 'boolean' || typeof parsed?.marketing !== 'boolean') return null;
        return parsed;
    } catch {
        return null;
    }
}

export function setStoredConsent(prefs: CookieConsentPrefs): void {
    if (typeof window === 'undefined') return;
    const state: CookieConsentState = { ...prefs, timestamp: Date.now() };
    try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
        // localStorage unavailable (private browsing, blocked storage) — consent
        // just won't persist across visits, banner will show again next time.
    }
    window.dispatchEvent(new CustomEvent(CONSENT_EVENT, { detail: state }));
}

export function onConsentChange(handler: (state: CookieConsentState) => void): () => void {
    const listener = (e: Event) => handler((e as CustomEvent<CookieConsentState>).detail);
    window.addEventListener(CONSENT_EVENT, listener);
    return () => window.removeEventListener(CONSENT_EVENT, listener);
}
