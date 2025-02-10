import { useTranslation } from 'react-i18next';

export const getTranslation = () => {
  const { t, i18n } = useTranslation();
  
  const initLocale = (locale: string) => {
    i18n.changeLanguage(locale);
  };

  return { t, initLocale };
};
