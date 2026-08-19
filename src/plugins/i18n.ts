import { createI18n } from 'vue-i18n'
import en from '@/locales/en.json'
import de from '@/locales/de.json'

const messages = {
  en,
  de,
}

export type SupportedLocale = keyof typeof messages

export function normalizeLocale(
  input: string | null | undefined,
): SupportedLocale {
  const language = String(input ?? '').trim().toLowerCase()

  if(language.startsWith('de')) return 'de'
  if(language.startsWith('en')) return 'en'

  return 'en'
}

export const i18n = createI18n({
  legacy: false,
  locale: 'en',
  fallbackLocale: 'en',
  messages,
})

export function setI18nLanguage(
  language: string | null | undefined,
): SupportedLocale {
  const locale = normalizeLocale(language)

  i18n.global.locale.value = locale
  document.documentElement.lang = locale

  return locale
}

// Compatibility alias. This intentionally does NOT inspect navigator/browser locale.
export function setI18nLanguageFromConfig(
  language: string | null | undefined,
): SupportedLocale {
  return setI18nLanguage(language)
}

export default i18n
