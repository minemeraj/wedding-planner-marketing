/**
 * i18n utilities for the Merrily Plan marketing site.
 *
 * - getLocaleFromUrl()  — extract locale from URL path
 * - t()                 — translate a dot-notation key with English fallback
 * - localizedUrl()      — prepend locale prefix to a path
 * - SUPPORTED_LOCALES   — list of locale metadata
 */

import en from './en.json';
import es from './es.json';
import fr from './fr.json';
import de from './de.json';
import pt from './pt.json';
import it from './it.json';
import ja from './ja.json';
import zh from './zh.json';
import ko from './ko.json';
import hi from './hi.json';

export type Locale = 'en' | 'es' | 'fr' | 'de' | 'pt' | 'it' | 'ja' | 'zh' | 'ko' | 'hi';

export const DEFAULT_LOCALE: Locale = 'en';

export interface LocaleInfo {
  code: Locale;
  name: string;       // English name
  nativeName: string;  // Native name
  flag: string;        // Emoji flag
}

export const SUPPORTED_LOCALES: LocaleInfo[] = [
  { code: 'en', name: 'English',    nativeName: 'English',    flag: '\uD83C\uDDFA\uD83C\uDDF8' },
  { code: 'es', name: 'Spanish',    nativeName: 'Espanol',    flag: '\uD83C\uDDEA\uD83C\uDDF8' },
  { code: 'fr', name: 'French',     nativeName: 'Francais',   flag: '\uD83C\uDDEB\uD83C\uDDF7' },
  { code: 'de', name: 'German',     nativeName: 'Deutsch',    flag: '\uD83C\uDDE9\uD83C\uDDEA' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Portugues',  flag: '\uD83C\uDDE7\uD83C\uDDF7' },
  { code: 'it', name: 'Italian',    nativeName: 'Italiano',   flag: '\uD83C\uDDEE\uD83C\uDDF9' },
  { code: 'ja', name: 'Japanese',   nativeName: 'Japanese',   flag: '\uD83C\uDDEF\uD83C\uDDF5' },
  { code: 'zh', name: 'Chinese',    nativeName: 'Chinese',    flag: '\uD83C\uDDE8\uD83C\uDDF3' },
  { code: 'ko', name: 'Korean',     nativeName: 'Korean',     flag: '\uD83C\uDDF0\uD83C\uDDF7' },
  { code: 'hi', name: 'Hindi',      nativeName: 'Hindi',      flag: '\uD83C\uDDEE\uD83C\uDDF3' },
];

// Map of locale code -> translations
const translations: Record<Locale, Record<string, unknown>> = {
  en, es, fr, de, pt, it, ja, zh, ko, hi,
} as Record<Locale, Record<string, unknown>>;

/**
 * Extract locale from a URL pathname.
 * For the default locale (en), the URL has no prefix.
 * For other locales, the URL starts with /base/locale/ or /locale/.
 */
export function getLocaleFromUrl(url: URL): Locale {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  let pathname = url.pathname;

  // Strip the base path prefix
  if (base && pathname.startsWith(base)) {
    pathname = pathname.slice(base.length);
  }

  // pathname is now like "/" or "/es/" or "/es/pricing" etc.
  const segments = pathname.split('/').filter(Boolean);

  if (segments.length > 0) {
    const maybeLocale = segments[0] as Locale;
    if (SUPPORTED_LOCALES.some((l) => l.code === maybeLocale) && maybeLocale !== DEFAULT_LOCALE) {
      return maybeLocale;
    }
  }

  return DEFAULT_LOCALE;
}

/**
 * Resolve a dot-notation key from a nested JSON object.
 * e.g. resolve(obj, "nav.home") => obj.nav.home
 */
function resolve(obj: Record<string, unknown>, key: string): string | undefined {
  const parts = key.split('.');
  let current: unknown = obj;
  for (const part of parts) {
    if (current === null || current === undefined || typeof current !== 'object') {
      return undefined;
    }
    current = (current as Record<string, unknown>)[part];
  }
  return typeof current === 'string' ? current : undefined;
}

/**
 * Resolve a dot-notation key that points to an array of strings.
 */
function resolveArray(obj: Record<string, unknown>, key: string): string[] | undefined {
  const parts = key.split('.');
  let current: unknown = obj;
  for (const part of parts) {
    if (current === null || current === undefined || typeof current !== 'object') {
      return undefined;
    }
    current = (current as Record<string, unknown>)[part];
  }
  if (Array.isArray(current) && current.every((item) => typeof item === 'string')) {
    return current as string[];
  }
  return undefined;
}

/**
 * Translate a key for the given locale, with English fallback.
 * Supports dot-notation: t('en', 'nav.home') => "Home"
 */
export function t(locale: Locale, key: string): string {
  // Try the requested locale
  const localeTranslations = translations[locale];
  if (localeTranslations) {
    const value = resolve(localeTranslations, key);
    if (value !== undefined) return value;
  }

  // Fallback to English
  if (locale !== DEFAULT_LOCALE) {
    const fallback = resolve(translations[DEFAULT_LOCALE], key);
    if (fallback !== undefined) return fallback;
  }

  // Return the key itself as last resort (helps identify missing translations)
  return key;
}

/**
 * Translate a key that points to an array of strings, with English fallback.
 */
export function tArray(locale: Locale, key: string): string[] {
  const localeTranslations = translations[locale];
  if (localeTranslations) {
    const value = resolveArray(localeTranslations, key);
    if (value !== undefined) return value;
  }

  if (locale !== DEFAULT_LOCALE) {
    const fallback = resolveArray(translations[DEFAULT_LOCALE], key);
    if (fallback !== undefined) return fallback;
  }

  return [key];
}

/**
 * Create a locale-aware URL path.
 * For default locale (en), returns path as-is (with base).
 * For other locales, prepends /{locale} before the path.
 *
 * @param locale - The locale code
 * @param path - The path (e.g., '/pricing', '/')
 * @returns The full path with base and locale prefix
 */
export function localizedUrl(locale: Locale, path: string): string {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  const cleanPath = path.startsWith('/') ? path : `/${path}`;

  if (locale === DEFAULT_LOCALE) {
    // No locale prefix for default
    return base ? `${base}${cleanPath}` : cleanPath;
  }

  // Prepend locale: /base/es/pricing
  return base ? `${base}/${locale}${cleanPath}` : `/${locale}${cleanPath}`;
}

/**
 * Get all locale codes as a simple array.
 */
export function getLocaleCodes(): Locale[] {
  return SUPPORTED_LOCALES.map((l) => l.code);
}

/**
 * Build the current page URL for a different locale.
 * Strips the current locale prefix (if any) and prepends the new one.
 */
export function switchLocaleUrl(currentUrl: URL, newLocale: Locale): string {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  let pathname = currentUrl.pathname;

  // Strip the base path
  if (base && pathname.startsWith(base)) {
    pathname = pathname.slice(base.length);
  }

  // Strip existing locale prefix
  const segments = pathname.split('/').filter(Boolean);
  if (segments.length > 0) {
    const maybeLocale = segments[0];
    if (SUPPORTED_LOCALES.some((l) => l.code === maybeLocale) && maybeLocale !== DEFAULT_LOCALE) {
      segments.shift();
    }
  }

  // Rebuild path
  const cleanPath = '/' + segments.join('/');

  return localizedUrl(newLocale, cleanPath);
}
