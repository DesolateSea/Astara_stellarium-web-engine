// Locale selection is independent of the observer's geographic location.
export const LANGUAGE_KEY = 'astara-language'
export const languages = [
  { value: 'en', text: 'English' },
  { value: 'de', text: 'Deutsch' },
  { value: 'fr', text: 'Français' },
  { value: 'zh-Hans', text: '简体中文' }
]

export function normalizeLocale (value) {
  const tag = String(value || '').replace(/_/g, '-').toLowerCase()
  if (/^zh(?:-|$)/.test(tag)) {
    // Do not silently substitute Simplified Chinese for Traditional Chinese.
    if (/(?:^|-)(hant|tw|hk|mo)(?:-|$)/.test(tag)) return null
    return 'zh-Hans'
  }
  const base = tag.split('-')[0]
  return languages.some(language => language.value === base) ? base : null
}

export function resolveLocale (saved, preferred = []) {
  return normalizeLocale(saved) || preferred.map(normalizeLocale).find(Boolean) || 'en'
}

export function getLanguagePreference () {
  try {
    return localStorage.getItem(LANGUAGE_KEY) || 'auto'
  } catch (error) {
    return 'auto'
  }
}

export function getStartupLocale () {
  const preferred = navigator.languages && navigator.languages.length
    ? navigator.languages : [navigator.language || navigator.userLanguage]
  return resolveLocale(getLanguagePreference(), preferred)
}

export function saveLanguagePreference (value) {
  if (value !== 'auto' && !languages.some(language => language.value === value)) return false
  try {
    if (value === 'auto') localStorage.removeItem(LANGUAGE_KEY)
    else localStorage.setItem(LANGUAGE_KEY, value)
    return true
  } catch (error) {
    return false
  }
}

export function getFontFamily (locale, culture = '') {
  return locale === 'zh-Hans' || culture.includes('chinese') ? 'NotoSansSC' : 'NotoSans'
}
