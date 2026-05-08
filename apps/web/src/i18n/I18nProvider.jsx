import { createContext, useContext, useMemo, useState } from 'react';
import { normalizeLocale, translate } from './translations';

const LOCALE_STORAGE_KEY = 'panoramacl_locale';
const I18nContext = createContext(null);

function getInitialLocale() {
  const persistedLocale = window.localStorage.getItem(LOCALE_STORAGE_KEY);

  if (persistedLocale) {
    return normalizeLocale(persistedLocale);
  }

  const browserLocale = navigator.language || '';
  return browserLocale.toLowerCase().startsWith('es') ? 'es' : 'en';
}

export function I18nProvider({ children }) {
  const [locale, setLocaleState] = useState(getInitialLocale);

  const setLocale = (nextLocale) => {
    const normalized = normalizeLocale(nextLocale);
    setLocaleState(normalized);
    window.localStorage.setItem(LOCALE_STORAGE_KEY, normalized);
  };

  const toggleLocale = () => {
    setLocale(locale === 'es' ? 'en' : 'es');
  };

  const value = useMemo(
    () => ({
      locale,
      setLocale,
      toggleLocale,
      t: (key, params) => translate(locale, key, params)
    }),
    [locale]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const context = useContext(I18nContext);

  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider.');
  }

  return context;
}
