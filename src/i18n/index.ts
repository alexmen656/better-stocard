import { createI18n } from 'vue-i18n'
import de from './locales/de.json'
import en from './locales/en.json'
import es from './locales/es.json'
import sk from './locales/sk.json'
import cz from './locales/cz.json'

const i18n = createI18n({
  legacy: false,
  locale: localStorage.getItem('app-locale') || 'en',
  fallbackLocale: 'en',
  messages: {
    de,
    en,
    es,
    sk,
    cz,
  },
})

export default i18n
