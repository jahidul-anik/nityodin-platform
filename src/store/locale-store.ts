import { create } from 'zustand';
import en from '@/lib/i18n/translations/en';
import bn from '@/lib/i18n/translations/bn';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type Locale = 'en' | 'bn';

type LocaleState = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, fallback?: string) => string;
};

// ---------------------------------------------------------------------------
// Translation maps
// ---------------------------------------------------------------------------

const translations: Record<Locale, Record<string, string>> = { en, bn };

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

export const useLocaleStore = create<LocaleState>((set, get) => ({
  locale: 'en',

  setLocale: (locale) => set({ locale }),

  t: (key, fallback) => {
    const { locale } = get();
    // Try current locale first
    const value = translations[locale]?.[key];
    if (value) return value;
    // Fallback to English
    const enValue = translations.en[key];
    if (enValue) return enValue;
    // Fallback to provided fallback or the key itself
    return fallback ?? key;
  },
}));