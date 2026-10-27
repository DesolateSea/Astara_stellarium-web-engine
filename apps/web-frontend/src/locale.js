import languageRegistry from './languages.json'

// Locale selection is independent of the observer's geographic location.
export const LANGUAGE_KEY = 'astara-language'
export const languages = languageRegistry

export function normalizeLocale (value) {
  let tag = String(value || '').replace(/_/g, '-').toLowerCase()
  const traditionalChinese = /^zh(?:-|$)/.test(tag) && /(?:^|-)(hant|tw|hk|mo)(?:-|$)/.test(tag)
  while (tag) {
    const language = languages.find(language => [language.value, ...(language.aliases || [])]
      .some(alias => alias.toLowerCase() === tag))
    // A registered Traditional Chinese locale is allowed, but never substitute Hans.
    if (language && !(traditionalChinese && language.value === 'zh-Hans')) return language.value
    const separator = tag.lastIndexOf('-')
    tag = separator < 0 ? '' : tag.slice(0, separator)
  }
  return null
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
  if (culture.includes('chinese')) return 'NotoSansSC'
  const language = languages.find(language => language.value === locale)
  return (language && language.font) || 'NotoSans'
}
