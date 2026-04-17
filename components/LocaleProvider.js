'use client';
import { createContext, useContext, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { getT, DEFAULT_LOCALE } from '../lib/i18n/translations';

export const LocaleContext = createContext({ locale: DEFAULT_LOCALE, setLocale: () => {}, t: (s) => ({}) });

export function LocaleProvider({ initialLocale, children }) {
  const [locale, setLocaleState] = useState(initialLocale ?? DEFAULT_LOCALE);
  const router = useRouter();

  const setLocale = useCallback((newLocale) => {
    setLocaleState(newLocale);
    document.cookie = `locale=${newLocale};path=/;max-age=31536000`;
    router.refresh(); // re-render server components with new locale
  }, [router]);

  const t = useCallback((section) => getT(locale, section), [locale]);

  return (
    <LocaleContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  return useContext(LocaleContext);
}

// Convenience hook: const t = useT('section')
export function useT(section) {
  const { t } = useContext(LocaleContext);
  return t(section);
}
