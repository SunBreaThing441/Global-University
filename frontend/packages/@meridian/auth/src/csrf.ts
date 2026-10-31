import axios from 'axios';

export function getCsrfToken(): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(/(?:^|;\s*)kolibri_csrftoken=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}

/**
 * Ensures the CSRF cookie is established before executing state-changing mutations.
 * If no token is present, hits the session endpoint to trigger Django's @ensure_csrf_cookie.
 */
export async function ensureCsrfTokenPrimed(): Promise<string> {
  let token = getCsrfToken();
  if (token) return token;

  try {
    await axios.get('/api/auth/session/current/', {
      headers: { 'X-Requested-With': 'XMLHttpRequest' },
    });
  } catch {
    // Probe settles the Set-Cookie header
  }

  return getCsrfToken() ?? '';
}
