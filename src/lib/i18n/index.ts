import { useLocaleStore, type Locale } from '@/store/locale-store';

// ---------------------------------------------------------------------------
// Hook: useTranslation
// ---------------------------------------------------------------------------

interface UseTranslationReturn {
  t: (key: string, fallback?: string) => string;
  locale: Locale;
  setLocale: (locale: Locale) => void;
}

export function useTranslation(): UseTranslationReturn {
  const locale = useLocaleStore((s) => s.locale);
  const setLocale = useLocaleStore((s) => s.setLocale);
  const t = useLocaleStore((s) => s.t);

  return { t, locale, setLocale };
}