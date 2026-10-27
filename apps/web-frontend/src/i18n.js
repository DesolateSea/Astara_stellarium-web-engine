import Vue from 'vue'
import VueI18n from 'vue-i18n'
import Moment from 'moment'
import _ from 'lodash'
import { getStartupLocale } from './locale'
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
const pluginLocales = require.context('./plugins/', true, /\.\/\w+\/locales\/([A-Za-z0-9-_]+)\.json$/i)
pluginLocales.keys().forEach(key => {
  const locale = key.match(/\/locales\/([^/]+)\.json$/)[1]
  messages[locale] = _.merge(messages[locale] || {}, pluginLocales(key))
})

const locale = getStartupLocale()
Moment.locale(locale === 'zh-Hans' ? 'zh-cn' : locale)
document.documentElement.lang = locale

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

export function translateEngine (domain, text) {
  const catalogs = engineMessages[i18n.locale] || {}
  const fallback = engineMessages.en || {}
  const translated = catalogs[domain] && catalogs[domain][text]
  const fallbackText = fallback[domain] && fallback[domain][text]
  if (typeof translated === 'string' && translated) return translated
  if (typeof fallbackText === 'string' && fallbackText) return fallbackText
  if (domain.startsWith('skyculture/')) return translateEngine(domain.slice(0, domain.lastIndexOf('/')), text)
  return domain === 'gui' ? String(i18n.t(text)) : text
}

export default i18n
