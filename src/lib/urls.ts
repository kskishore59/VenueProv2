/**
 * Resolves absolute URLs based on the current hostname to handle
 * cross-subdomain navigation in production, while falling back to
 * relative paths for local development.
 */

export function getAppUrl(path: string = ''): string {
  const hostname = window.location.hostname;
  if (hostname === 'venuepro.in' || hostname === 'www.venuepro.in') {
    return `https://app.venuepro.in${path}`;
  }
  return path; // Fallback to relative path for localhost / dev
}

export function getLandingUrl(path: string = ''): string {
  const hostname = window.location.hostname;
  if (hostname === 'app.venuepro.in') {
    return `https://www.venuepro.in${path}`;
  }
  return path; // Fallback to relative path for localhost / dev
}

export function getRouteUrl(path: string = ''): string {
  const MARKETING_PATHS = ['/', '/features', '/faqs', '/privacy', '/terms'];
  if (MARKETING_PATHS.includes(path)) {
    return getLandingUrl(path);
  }
  return getAppUrl(path);
}

