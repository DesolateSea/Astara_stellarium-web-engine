import assert from 'node:assert/strict'
import { readFileSync, readdirSync } from 'node:fs'
import { createRequire } from 'node:module'
import { test } from 'node:test'
import { runInNewContext } from 'node:vm'

// Load the dependency-free module without changing the Vue CLI package type.
const source = readFileSync(new URL('../src/locale.js', import.meta.url), 'utf8')
  .replace("import languageRegistry from './languages.json'", 'const languageRegistry = ' + readFileSync(new URL('../src/languages.json', import.meta.url), 'utf8'))
const locale = await import('data:text/javascript;base64,' + Buffer.from(source).toString('base64'))
const designationSource = readFileSync(new URL('../src/translations/designations.js', import.meta.url), 'utf8')
const designationHelpers = await import('data:text/javascript;base64,' + Buffer.from(designationSource).toString('base64'))

test('normalizes supported BCP 47 and upstream locale tags', () => {
  for (const tag of ['zh', 'zh-CN', 'zh_SG', 'zh_Hans_CN']) {
    assert.equal(locale.normalizeLocale(tag), 'zh-Hans')
  }
  assert.equal(locale.normalizeLocale('de-DE'), 'de')
  assert.equal(locale.normalizeLocale('FR-ca'), 'fr')
  assert.equal(locale.normalizeLocale('en-US'), 'en')
  for (const tag of ['zh-TW', 'zh-Hant', 'zh-HK', 'zh-MO', 'es', '', null]) {
    assert.equal(locale.normalizeLocale(tag), null)
  }
})

test('saved preference wins; ordered device preferences and English fallback work', () => {
  assert.equal(locale.resolveLocale('fr', ['de-DE']), 'fr')
  assert.equal(locale.resolveLocale('auto', ['es', 'zh-CN', 'en']), 'zh-Hans')
  assert.equal(locale.resolveLocale('unknown', ['de-AT']), 'de')
  assert.equal(locale.resolveLocale(null, ['zh-TW']), 'en')
  assert.equal(locale.resolveLocale(null), 'en')
})

test('preference persistence and unavailable storage are safe', () => {
  const values = new Map()
  globalThis.localStorage = {
    getItem: key => values.get(key),
    setItem: (key, value) => values.set(key, value),
    removeItem: key => values.delete(key)
  }
  assert.equal(locale.getLanguagePreference(), 'auto')
  assert.equal(locale.saveLanguagePreference('zh-Hans'), true)
  assert.equal(locale.getLanguagePreference(), 'zh-Hans')
  assert.equal(locale.saveLanguagePreference('invalid'), false)
  assert.equal(locale.saveLanguagePreference('auto'), true)
  assert.equal(locale.getLanguagePreference(), 'auto')
  delete globalThis.localStorage
  assert.equal(locale.getLanguagePreference(), 'auto')
  assert.equal(locale.saveLanguagePreference('de'), false)
})

test('language settings use a matching navigation list and only restart after a saved change', () => {
  const require = createRequire(import.meta.url)
  const compiler = require('vue-template-compiler')
  const component = compiler.parseComponent(readFileSync(new URL('../src/components/settings-panel.vue', import.meta.url), 'utf8'))
  const script = component.script.content.replace(/^import .*$/gm, '').replace('export default', '')
  let preference = 'auto'
  let canSave = true
  let restarts = 0
  const settings = runInNewContext('(' + script + ')', {
    CoordinateEditor: {},
    getLanguagePreference: () => preference,
    saveLanguagePreference: value => {
      if (!canSave) return false
      preference = value
      return true
    },
    window: { location: { reload: () => { restarts++ } } }
  })
  const state = { languageSaveError: false }
  const select = value => settings.computed.languagePreference.set.call(state, value)
  select('auto')
  assert.equal(restarts, 0)
  select('fr')
  assert.equal(preference, 'fr')
  assert.equal(restarts, 1)
  canSave = false
  select('de')
  assert.equal(preference, 'fr')
  assert.equal(state.languageSaveError, true)
  assert.equal(restarts, 1)
  assert.equal(settings.computed.currentLanguageName.call({ languageOptions: [{ value: 'fr', text: 'Français' }], languagePreference: 'fr' }), 'Français')
  assert.equal(settings.computed.currentViewTitle.call({ currentView: 'language', $t: key => key }), 'Language')
  assert.ok(component.template.content.includes('class="settings-item nav-row language-nav-row"'))
  assert.ok(component.template.content.includes("navigateTo('language')"))
  assert.ok(component.template.content.includes('class="settings-list language-list"'))
  assert.ok(!component.template.content.includes('<v-select'))
})

test('Chinese fonts follow both UI language and sky culture', () => {
  assert.equal(locale.getFontFamily('zh-Hans', 'western'), 'NotoSansSC')
  assert.equal(locale.getFontFamily('en', 'chinese'), 'NotoSansSC')
  assert.equal(locale.getFontFamily('fr', 'western'), 'NotoSans')
})

test('original bundled UI catalogs have matching keys and interpolation placeholders', () => {
  const load = name => JSON.parse(readFileSync(new URL('../src/locales/' + name + '.json', import.meta.url)))
  const english = load('en')
  for (const value of ['en', 'de', 'fr', 'zh-Hans']) {
    const messages = load(value)
    assert.deepEqual(Object.keys(messages).sort(), Object.keys(english).sort(), value)
    for (const key of Object.keys(english)) {
      assert.ok(messages[key], value + ': ' + key)
      assert.deepEqual(messages[key].match(/\{[^}]+\}/g), english[key].match(/\{[^}]+\}/g), value + ': ' + key)
    }
  }
})

test('search and object-name formatting translates named stars, including raw index names, without mutating IDs', () => {
  const source = readFileSync(new URL('../src/assets/sw_helpers.js', import.meta.url), 'utf8')
  const helpers = source.slice(source.indexOf('  cleanupOneSkySourceName:'), source.indexOf('  nameForSkySourceType:'))
  const translations = { Polaris: 'Étoile Polaire', Betelgeuse: 'Bételgeuse' }
  const seenFlags = []
  const stel = {
    designationCleanup: (name, flags) => {
      seenFlags.push(flags)
      if (name.startsWith('NAME ')) return flags & 16 ? translations[name.slice(5)] || name.slice(5) : name.slice(5)
      return name
    }
  }
  const swh = runInNewContext('({' + helpers + '})', {
    Vue: { prototype: { $stel: stel } },
    translateEngine: (_, name) => translations[name] || name
  })
  const object = { names: ['HIP 11767', 'NAME Polaris'], types: ['*'], model: 'star' }
  const original = JSON.stringify(object)
  assert.equal(swh.nameForSkySource(object), 'Étoile Polaire')
  assert.equal(swh.namesForSkySource(object)[0], 'Étoile Polaire')
  assert.equal(swh.cleanupOneSkySourceName('Betelgeuse'), 'Bételgeuse')
  assert.equal(swh.cleanupOneSkySourceName('HIP 11767'), 'HIP 11767')
  assert.ok(seenFlags.every(flags => flags & 16))
  assert.equal(JSON.stringify(object), original)
})

test('engine registers translation and language callbacks before initialization', () => {
  const wrapper = readFileSync(new URL('../../../src/js/pre.js', import.meta.url), 'utf8')
  const memory = new Map()
  let nextPointer = 1
  let translateCallback
  let languageCallback
  let ready = false
  const Module = {
    translateFn: (domain, text) => domain === 'sky' && text === 'Sun' ? '太阳' : text,
    getLangFn: () => 'zh_Hans',
    addFunction: callback => callback,
    UTF8ToString: pointer => memory.get(pointer),
    lengthBytesUTF8: text => Buffer.byteLength(text),
    _malloc: () => nextPointer++,
    stringToUTF8: (text, pointer) => memory.set(pointer, text),
    _sys_set_translate_function: callback => { translateCallback = callback },
    _sys_set_lang_function: callback => { languageCallback = callback },
    _core_init: () => {
      assert.ok(translateCallback)
      assert.ok(languageCallback)
      assert.equal(memory.get(languageCallback()), 'zh_Hans')
    },
    getModule: () => ({ observer: {} }),
    onReady: () => { ready = true }
  }
  runInNewContext(wrapper, { Module })
  Module.onRuntimeInitialized()
  assert.ok(ready)
  memory.set(100, 'sky')
  memory.set(101, 'Sun')
  const translated = translateCallback(0, 100, 101)
  assert.equal(memory.get(translated), '太阳')
  assert.equal(translateCallback(0, 100, 101), translated)
  assert.equal(languageCallback(), languageCallback())
  // Source/translated strings such as JS prototype names must remain safe.
  memory.set(101, 'constructor')
  assert.equal(memory.get(translateCallback(0, 100, 101)), 'constructor')
})

test('engine catalogs respect domains and missing names fall back safely', () => {
  const source = readFileSync(new URL('../src/i18n.js', import.meta.url), 'utf8')
  const functionSource = source.slice(source.indexOf('export function translateEngine'), source.indexOf('export default'))
    .replace('export function', 'function')
  const chinese = JSON.parse(readFileSync(new URL('../src/engine-locales/zh-Hans.json', import.meta.url)))
  const translate = runInNewContext(functionSource + '\ntranslateEngine', {
    ...designationHelpers,
    engineMessages: { 'zh-Hans': chinese, en: {} },
    i18n: { locale: 'zh-Hans', t: text => text === 'Settings' ? '设置' : text }
  })
  assert.equal(translate('sky', 'Sun'), '太阳')
  assert.equal(translate('sky', 'Andromeda Galaxy'), '仙女座星系')
  assert.equal(translate('sky', 'Orion Nebula'), '猎户座星云')
  assert.equal(translate('gui', 'Settings'), '设置')
  assert.equal(translate('unbundled-domain', 'Sun'), 'Sun')
  assert.equal(translate('sky', 'Unknown object'), 'Unknown object')
  assert.equal(translate('sky', 'constructor'), 'constructor')
})

const uiSource = readFileSync(new URL('../src/locales/ui.js', import.meta.url), 'utf8')
const { uiMessages } = await import('data:text/javascript;base64,' + Buffer.from(uiSource).toString('base64'))
async function loadCatalog (file) {
  const source = readFileSync(new URL('../src/locales/' + file + '.js', import.meta.url), 'utf8')
  return import('data:text/javascript;base64,' + Buffer.from(source).toString('base64'))
}
const { historyMessages } = await loadCatalog('history')
const { creditMessages } = await loadCatalog('credits')
const { landscapeMessages } = await loadCatalog('landscapes')
const { objectTypeMessages } = await loadCatalog('object-types')
const { skyNameMessages } = await loadCatalog('sky-names')
const historySource = readFileSync(new URL('../src/assets/astronomy-history-data.js', import.meta.url), 'utf8')
const { default: historyData } = await import('data:text/javascript;base64,' + Buffer.from(historySource).toString('base64'))

test('historical titles and descriptions have complete offline translations', () => {
  for (const event of Object.values(historyData).flat()) {
    for (const language of ['en', 'de', 'fr', 'zh-Hans']) {
      assert.ok(historyMessages[language][event.name], language + ': ' + event.name)
      assert.ok(historyMessages[language][event.description], language + ': ' + event.description)
      if (language !== 'en') assert.notEqual(historyMessages[language][event.description], event.description)
    }
  }
})

test('credits and all bundled landscapes have complete offline catalogs', () => {
  const landscapes = JSON.parse(readFileSync(new URL('../public/skydata/landscapes/index.json', import.meta.url)))
  for (const language of ['de', 'fr', 'zh-Hans']) {
    assert.deepEqual(Object.keys(creditMessages[language]), Object.keys(creditMessages.en))
    for (const key of Object.keys(creditMessages.en)) {
      assert.ok(creditMessages[language][key])
      assert.notEqual(creditMessages[language][key], creditMessages.en[key], key)
    }
    for (const key of landscapes) {
      assert.ok(landscapeMessages[language][key]?.title, language + ': ' + key)
      assert.ok(landscapeMessages[language][key]?.description, language + ': ' + key)
      assert.notEqual(landscapeMessages[language][key].description, landscapeMessages.en[key].description)
    }
  }
})

test('every engine object type has an upstream or app-authored translation', () => {
  const source = readFileSync(new URL('../../../src/otypes.c', import.meta.url), 'utf8')
  const keys = [...source.matchAll(/N_\("([^"]+)"\)/g)].map(match => match[1])
  assert.equal(keys.length, 290)
  for (const language of ['de', 'fr', 'zh-Hans']) {
    const engine = JSON.parse(readFileSync(new URL('../src/engine-locales/' + language + '.json', import.meta.url)))
    for (const key of keys) assert.ok(engine.gui[key] || objectTypeMessages[language][key], language + ': ' + key)
  }
})

test('historical display copies translate descriptions and preserve source data across language changes', () => {
  const source = readFileSync(new URL('../src/event-localization.js', import.meta.url), 'utf8')
    .replace(/^import .*\n/, '').replace('export function', 'function')
  const i18n = {
    locale: 'en',
    te: (key, language) => Object.hasOwn(historyMessages[language], key) || Object.hasOwn(uiMessages[language], key),
    t: (key, values = {}) => (historyMessages[i18n.locale][key] || uiMessages[i18n.locale][key] || key)
      .replace(/\{([^}]+)\}/g, (_, name) => values[name])
  }
  const localize = runInNewContext(source + '\nlocalizeEvent', { i18n })
  for (const item of Object.values(historyData).flat()) {
    const event = { ...item, type: 'historical', category: 'History', yearsAgo: 25, sourceDescription: item.description, description: item.description + ' (25 years ago)' }
    const original = JSON.stringify(event)
    for (const language of ['de', 'fr', 'zh-Hans', 'en']) {
      i18n.locale = language
      const result = localize(event)
      assert.equal(result.name, historyMessages[language][item.name])
      assert.ok(result.description.startsWith(historyMessages[language][item.description]))
      assert.equal(result.category, event.category)
      assert.equal(JSON.stringify(event), original)
    }
  }
})

test('culture-specific contexts override global names without leaking across cultures', () => {
  const source = readFileSync(new URL('../src/i18n.js', import.meta.url), 'utf8')
  const functionSource = source.slice(source.indexOf('export function translateEngine'), source.indexOf('export default'))
    .replace('export function', 'function')
  const chinese = JSON.parse(readFileSync(new URL('../src/engine-locales/zh-Hans.json', import.meta.url)))
  const translate = runInNewContext(functionSource + '\ntranslateEngine', {
    ...designationHelpers,
    engineMessages: { 'zh-Hans': { ...chinese, ...skyNameMessages['zh-Hans'] } }, i18n: { locale: 'zh-Hans', t: text => text }
  })
  assert.equal(translate('skyculture/western', 'Maiden'), '室女座')
  assert.equal(translate('skyculture/western', 'Southern Cross'), '南十字座')
  assert.equal(translate('skyculture/unknown', 'Maiden'), 'Maiden')
  assert.equal(translate('skyculture/unknown', 'Eagle'), chinese.skyculture.Eagle)
  assert.equal(translate('skyculture/western', 'Unknown object'), 'Unknown object')
  assert.equal(translate('skyculture/western/Pyxis', 'Compass'), '罗盘座')
  assert.equal(translate('skyculture/western/Circinus', 'Compass'), '圆规座')
  assert.equal(translate('skyculture/unknown/Pyxis', 'Compass'), 'Compass')
  const western = JSON.parse(readFileSync(new URL('../public/skydata/skycultures/western/index.json', import.meta.url)))
  for (const language of ['de', 'fr', 'zh-Hans']) {
    const catalog = JSON.parse(readFileSync(new URL('../src/engine-locales/' + language + '.json', import.meta.url)))
    for (const constellation of western.constellations) {
      const { english, native } = constellation.common_name
      assert.ok(skyNameMessages[language]['skyculture/western/' + native]?.[english] || catalog['skyculture/western'][english] || catalog.skyculture[english], language + ': ' + english)
    }
  }
  const engine = readFileSync(new URL('../../../src/modules/skycultures.c', import.meta.url), 'utf8')
  assert.ok(engine.includes('"skyculture/%s%s%s", cult->key'))
})

test('expanded UI catalogs have complete translations and preserve placeholders', () => {
  for (const language of ['de', 'fr', 'zh-Hans']) {
    for (const [key, value] of Object.entries(uiMessages.en)) {
      assert.ok(uiMessages[language][key], language + ': ' + key)
      assert.deepEqual((uiMessages[language][key].match(/\{[^}]+\}/g) || []).sort(), (value.match(/\{[^}]+\}/g) || []).sort(), key)
    }
  }
})

test('calendar display translations preserve canonical event identifiers and cached originals', () => {
  const source = readFileSync(new URL('../src/event-localization.js', import.meta.url), 'utf8')
    .replace(/^import .*\n/, '').replace('export function', 'function')
  const examples = [
    { type: 'moon_phase', name: 'Full Moon', description: 'The moon will be in Full Moon phase.' },
    { type: 'lunar_perigee', name: 'Lunar Perigee', distance: 360000 },
    { type: 'lunar_apogee', name: 'Lunar Apogee', distance: 400000 },
    { type: 'march_equinox', name: 'March Equinox', description: 'Spring begins in the Northern Hemisphere. Day and night are approximately equal in length.' },
    { type: 'conjunction', name: 'Moon-Mercury Conjunction', objectName: 'Mercury', bodies: ['Moon', 'Mercury'] },
    { type: 'opposition', name: 'Mars at Opposition', planet: 'Mars' },
    { type: 'elongation', name: 'Mercury Greatest Elongation', planet: 'Mercury', elongation: 25, visibility: 'Evening' },
    { type: 'lunar_eclipse', name: 'Total Lunar Eclipse', eclipseKind: 'total' },
    { type: 'solar_eclipse', name: 'Annular Solar Eclipse', eclipseKind: 'annular' }
  ].map(event => ({ category: 'Moon Events', description: 'Source description', ...event }))
  for (const language of ['de', 'fr', 'zh-Hans']) {
    const catalog = uiMessages[language]
    const engine = JSON.parse(readFileSync(new URL('../src/engine-locales/' + language + '.json', import.meta.url)))
    const i18n = {
      locale: language,
      te: (key, locale) => Object.hasOwn(uiMessages[locale], key),
      t: (key, values = {}) => (catalog[key] || key).replace(/\{([^}]+)\}/g, (_, name) => values[name])
    }
    const localize = runInNewContext(source + '\nlocalizeEvent', {
      i18n, translateEngine: (domain, text) => engine[domain]?.[text] || text, Intl
    })
    for (const event of examples) {
      const original = JSON.stringify(event)
      const translated = localize(event)
      assert.notEqual(translated.name, event.name, language + ': ' + event.type)
      assert.notEqual(translated.description, event.description, language + ': ' + event.type)
      for (const key of ['category', 'objectName', 'bodies', 'planet', 'visibility', 'eclipseKind']) {
        assert.equal(translated[key], event[key], key)
      }
      assert.equal(JSON.stringify(event), original)
    }
  }
})

test('sky culture menu names have translations for every bundled culture', () => {
  const cultures = JSON.parse(readFileSync(new URL('../public/skydata/skycultures/index.json', import.meta.url)))
  for (const culture of cultures) {
    const key = culture.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
    for (const language of ['de', 'fr', 'zh-Hans']) assert.ok(uiMessages[language][key], language + ': ' + key)
  }
})

test('all literal UI translation calls resolve to a bundled English key', () => {
  const english = { ...creditMessages.en, ...historyMessages.en, ...objectTypeMessages.en, ...uiMessages.en, ...JSON.parse(readFileSync(new URL('../src/locales/en.json', import.meta.url))) }
  const directory = new URL('../src/', import.meta.url)
  function visit (directory) {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      const file = new URL(entry.name, directory)
      if (entry.isDirectory()) visit(new URL(entry.name + '/', directory))
      else if (entry.name.endsWith('.vue')) {
        for (const match of readFileSync(file, 'utf8').matchAll(/\$t\(\s*(['"])(.*?)\1/g)) {
          assert.ok(Object.hasOwn(english, match[2]), file.pathname + ': ' + match[2])
        }
      }
    }
  }
  visit(directory)
})

test('application templates no longer contain hard-coded controls outside source citations', () => {
  const require = createRequire(import.meta.url)
  const compiler = require('vue-template-compiler')
  const allowed = new Set(['Astara', 'Stellarium Web Engine', 'GNU Affero General Public License v3.0', 'km', 'Makarov et al.', 'IAU Minor Planet Center', 'STScI/NASA', 'Gaia DR2:', 'Gaia Collaboration et al. (', '2018b'])
  // Preserve exact bibliographic titles so citations can still be located.
  allowed.add('ref. ESA, 1997, The Hipparcos and Tycho Catalogues, ESA SP-1200')
  allowed.add(', "The SIMBAD astronomical database", Wenger et al.')
  allowed.add('2000,A&AS,143,9')
  function walk (node, file, parent = {}) {
    if (node.type === 3 && !node.isComment && parent.tag !== 'v-icon') {
      const text = node.text.trim().replace(/\s+/g, ' ')
      if (/[A-Za-z]{2}/.test(text) && !/^https?:\/\//.test(text)) assert.ok(allowed.has(text), file.pathname + ': ' + text)
    }
    for (const child of node.children || []) walk(child, file, node)
    for (const condition of (node.ifConditions || []).slice(1)) walk(condition.block, file, parent)
  }
  function visit (directory) {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      const file = new URL(entry.name, directory)
      if (entry.isDirectory()) visit(new URL(entry.name + '/', directory))
      else if (entry.name.endsWith('.vue')) {
        const template = compiler.parseComponent(readFileSync(file, 'utf8')).template
        if (!template) continue
        const result = compiler.compile(template.content)
        assert.equal(result.errors.length, 0, file.pathname + ': ' + result.errors.join('; '))
        if (result.ast) walk(result.ast, file)
      }
    }
  }
  visit(new URL('../src/', import.meta.url))
})
