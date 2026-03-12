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
