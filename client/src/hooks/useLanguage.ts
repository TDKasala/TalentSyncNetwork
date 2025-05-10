import { useEffect } from 'react';
import { getLanguage, setLanguage, t as translate } from '@/lib/i18n';
import type { Language } from '@/lib/i18n';

export const useLanguage = (pageTitle?: string) => {
  const language = getLanguage();

  // Update page title if provided
  useEffect(() => {
    if (pageTitle) {
      document.title = `${pageTitle} | ${translate('app.name')}`;
    }
  }, [pageTitle, language]);

  // Handle language change
  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang);
  };

  return {
    t: translate,
    language,
    setLanguage: handleLanguageChange
  };
};

export default useLanguage;
