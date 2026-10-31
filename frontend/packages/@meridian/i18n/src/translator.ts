import { computed, ref } from 'vue';
import type { TranslationDefinitions } from './types';

// Global Reactive Locale State
export const currentLocale = ref<string>('en');

export const textDirection = computed<'ltr' | 'rtl'>(() => {
  const rtlLocales = ['ar', 'fa', 'he', 'ur'];
  return rtlLocales.some((rtl) => currentLocale.value.toLowerCase().startsWith(rtl)) ? 'rtl' : 'ltr';
});

/**
 * Sets the active global locale and updates documentElement lang & dir attributes.
 */
export function setLocale(locale: string): void {
  currentLocale.value = locale;
  if (typeof document !== 'undefined') {
    document.documentElement.setAttribute('lang', locale);
    document.documentElement.setAttribute('dir', textDirection.value);
  }
}

/**
 * Modern Reactive Translation Composable
 * Supports parameter interpolation ({param}), safe fallback, and zero compile-time constraints.
 */
export function useMeridianTranslator<T extends TranslationDefinitions>(
  namespace: string,
  defaultMessages: T
) {
  function t(
    key: keyof T,
    params?: Record<string, string | number>
  ): string {
    const entry = defaultMessages[key];
    let template = typeof entry === 'string' ? entry : entry?.message ?? String(key);

    if (params) {
      Object.entries(params).forEach(([paramKey, paramVal]) => {
        template = template.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), String(paramVal));
      });
    }

    return template;
  }

  return {
    t,
    currentLocale,
    textDirection,
    setLocale,
  };
}
