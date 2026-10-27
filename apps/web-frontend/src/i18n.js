import Vue from 'vue'
import VueI18n from 'vue-i18n'
import Moment from 'moment'
import _ from 'lodash'
import { getStartupLocale, languages } from './locale'
import { mergeCatalog } from './translations/catalog'
import { configureLocaleFont } from './translations/fonts'
import { translateConstellation, translateStarDesignation, translateGreek, localizedNameOnly } from './translations/designations'
import { uiMessages } from './locales/ui'
import { historyMessages } from './locales/history'
import { creditMessages } from './locales/credits'
import { objectTypeMessages } from './locales/object-types'
import { skyNameMessages } from './locales/sky-names'

Vue.use(VueI18n)

const messages = {}
const guiLocales = require.context('./locales', false, /\.json$/)
guiLocales.keys().forEach(key => {
  messages[key.slice(2, -5)] = guiLocales(key)
})
Object.keys(uiMessages).forEach(locale => {
  messages[locale] = Object.assign({}, objectTypeMessages[locale], creditMessages[locale], historyMessages[locale], uiMessages[locale], messages[locale])
})
const contentMessages = {}
const translationFiles = require.context('./translations', false, /\.json$/)
translationFiles.keys().forEach(key => {
  const locale = key.slice(2, -5)
  contentMessages[locale] = translationFiles(key)
})
const pluginLocales = require.context('./plugins/', true, /\.\/\w+\/locales\/([A-Za-z0-9-_]+)\.json$/i)
pluginLocales.keys().forEach(key => {
  const locale = key.match(/\/locales\/([^/]+)\.json$/)[1]
  messages[locale] = _.merge(messages[locale] || {}, pluginLocales(key))
})
Object.keys(contentMessages).forEach(locale => {
  messages[locale] = mergeCatalog(messages[locale], contentMessages[locale].messages)
})

const locale = getStartupLocale()
const language = languages.find(language => language.value === locale)
Moment.locale(language.moment || locale)
document.documentElement.lang = locale
document.documentElement.dir = language.dir || 'ltr'
configureLocaleFont(language, process.env.BASE_URL || '/')

const i18n = new VueI18n({
  locale,
  messages,
  formatFallbackMessages: true,
  fallbackLocale: 'en',
  silentTranslationWarn: process.env.NODE_ENV === 'production'
})

// Engine catalogs keep gettext domains separate from frontend message keys.
const engineMessages = {}
const engineLocales = require.context('./engine-locales', false, /\.json$/)
engineLocales.keys().forEach(key => {
  engineMessages[key.slice(2, -5)] = engineLocales(key)
})
Object.keys(skyNameMessages).forEach(locale => {
  engineMessages[locale] = Object.assign({}, engineMessages[locale], skyNameMessages[locale])
})
Object.keys(contentMessages).forEach(locale => {
  engineMessages[locale] = mergeCatalog(engineMessages[locale], contentMessages[locale].engine)
})

export function translateLandscape (key) {
  const catalog = contentMessages[i18n.locale] || {}
  return catalog.landscapes && catalog.landscapes[key]
}

export function translateEngine (domain, text) {
  if (domain === 'greek') return translateGreek(text, i18n.locale)
  if (domain === 'constellation') {
    return i18n.locale === 'en' ? text : translateConstellation(text, translateEngine)
  }
  if (domain === 'sky') {
    const designation = translateStarDesignation(text, translateEngine, i18n.locale)
    if (designation !== text) return designation
  }
  const catalogs = engineMessages[i18n.locale] || {}
  const fallback = engineMessages.en || {}
  const translated = catalogs[domain] && catalogs[domain][text]
  const fallbackText = fallback[domain] && fallback[domain][text]
  if (typeof translated === 'string' && translated) return domain === 'gui' ? translated : localizedNameOnly(translated, i18n.locale)
  if (typeof fallbackText === 'string' && fallbackText) return fallbackText
  if (domain.startsWith('skyculture/')) return translateEngine(domain.slice(0, domain.lastIndexOf('/')), text)
  if (domain === 'skyculture') return translateEngine('sky', text)
  return domain === 'gui' ? String(i18n.t(text)) : text
}

export default i18n
