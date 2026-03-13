/**
 * Prepend the Astro base path to an internal URL.
 * Handles trailing/leading slash deduplication.
 *
 * Usage:  href={url('/blog')}
 *
 * When base is '/wedding-planner-marketing':
 *   url('/')           => '/wedding-planner-marketing/'
 *   url('/blog')       => '/wedding-planner-marketing/blog'
 *   url('/pricing#faq') => '/wedding-planner-marketing/pricing#faq'
 *
 * When base is '/' (custom domain):
 *   url('/blog')       => '/blog'
 */
export function url(path: string): string {
  const base = import.meta.env.BASE_URL;
  // If base is just '/', return path as-is
  if (base === '/' || base === '') return path;
  // Remove trailing slash from base, ensure path starts with /
  const cleanBase = base.endsWith('/') ? base.slice(0, -1) : base;
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  // Avoid double base prefix if path already starts with base
  if (cleanPath.startsWith(cleanBase)) return cleanPath;
  return `${cleanBase}${cleanPath}`;
}

/**
 * Locale-aware URL helper.
 * For the default locale (en), returns the base-prefixed path.
 * For other locales, inserts the locale segment after the base.
 *
 * Usage:  href={localePath(lang, '/pricing')}
 *
 * localePath('en', '/pricing') => '/wedding-planner-marketing/pricing'
 * localePath('es', '/pricing') => '/wedding-planner-marketing/es/pricing'
 * localePath('fr', '/')        => '/wedding-planner-marketing/fr/'
 */
export function localePath(lang: string, path: string): string {
  const base = import.meta.env.BASE_URL;
  const cleanBase = (base === '/' || base === '') ? '' : (base.endsWith('/') ? base.slice(0, -1) : base);
  const cleanPath = path.startsWith('/') ? path : `/${path}`;

  if (lang === 'en') {
    return cleanBase ? `${cleanBase}${cleanPath}` : cleanPath;
  }

  return cleanBase ? `${cleanBase}/${lang}${cleanPath}` : `/${lang}${cleanPath}`;
}
