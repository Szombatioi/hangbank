import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from '../../public/locales/en/common.json';
import hu from '../../public/locales/hu/common.json';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { common: en },
      hu: { common: hu },
    },
    lng: 'en', // default language
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false, // react already safes from xss
    },
    defaultNS: 'common',
  });

export default i18n;