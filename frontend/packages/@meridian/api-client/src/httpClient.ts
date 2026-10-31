import axios, { AxiosInstance, AxiosResponse } from 'axios';
import qs from 'qs';

export function getCsrfTokenFromCookie(): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(/(?:^|;\s*)kolibri_csrftoken=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}

export function createHttpClient(): AxiosInstance {
  const instance = axios.create({
    xsrfCookieName: 'kolibri_csrftoken',
    xsrfHeaderName: 'X-CSRFToken',
    headers: {
      'X-Requested-With': 'XMLHttpRequest',
    },
    // Array format comma for Django ValuesViewset (?facility=1,2,3)
    paramsSerializer: (params) => qs.stringify(params, { arrayFormat: 'comma' }),
  });

  // Request interceptor ensuring CSRF token is attached
  instance.interceptors.request.use((config) => {
    const token = getCsrfTokenFromCookie();
    if (token) {
      config.headers = config.headers || {};
      config.headers['X-CSRFToken'] = token;
    }
    return config;
  });

  // Response interceptor for session expiration & network disconnects
  instance.interceptors.response.use(
    (response: AxiosResponse) => response,
    (error) => {
      const status = error.response?.status;
      if (status === 403 || status === 401) {
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('meridian:session-expired', { detail: error }));
        }
      }
      if ([0, 502, 503, 504].includes(status)) {
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('meridian:server-disconnected', { detail: error }));
        }
      }
      return Promise.reject(error);
    }
  );

  return instance;
}

export const defaultHttpClient = createHttpClient();
