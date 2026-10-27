#!/usr/bin/env node
// Offline catalog maintenance; no translation service or npm dependency required.
import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync } from 'node:fs'
import { resolve, dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const defaultRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const readJSON = path => JSON.parse(readFileSync(path, 'utf8'))
const writeJSON = (path, value) => {
  mkdirSync(dirname(path), { recursive: true })
  writeFileSync(path, JSON.stringify(value, null, 2) + '\n')
}
const loadModule = async path => import('data:text/javascript;base64,' + Buffer.from(readFileSync(path, 'utf8')).toString('base64'))
const sorted = object => Object.fromEntries(Object.entries(object).sort(([a], [b]) => a.localeCompare(b, 'en')))

export function isIdentifier (name) {
  return /^(?:\* |V\* |CON |NORAD |Cl |\d|[A-Za-z][A-Za-z0-9+_.-]*\s*[+-]?\d)/.test(name) ||
    /^[A-Za-z][A-Za-z0-9+_.-]*\s+[A-Za-z][+-]?\d/.test(name) ||
    /^(?:alf|alpha|bet|beta|gam|gamma|del|delta|eps|epsilon|zet|zeta|eta|tet|theta|iot|iota|kap|kappa|lam|lambda|mu|nu|ksi|xi|omi|omicron|pi|rho|sig|sigma|tau|ups|upsilon|phi|chi|psi|ome|omega)\d*\s+[A-Za-z]{3,}(?: [AB])?$/i.test(name) ||
    /^[A-Za-z]{1,2} [A-Za-z]{3}$/.test(name)
}

export async function loadProject (root = defaultRoot) {
  const { mergeCatalog } = await loadModule(join(root, 'src/translations/catalog.js'))
  const sets = await Promise.all([
    ['ui', 'uiMessages'], ['history', 'historyMessages'], ['credits', 'creditMessages'],
    ['object-types', 'objectTypeMessages'], ['landscapes', 'landscapeMessages'], ['sky-names', 'skyNameMessages']
  ].map(async ([file, name]) => (await loadModule(join(root, 'src/locales/' + file + '.js')))[name]))
  const [ui, history, credits, types, landscapes, skyNames] = sets
  const registry = readJSON(join(root, 'src/languages.json'))
  const messages = {}, engine = {}, landscapeCatalogs = {}, overrides = {}
  const localeFiles = readdirSync(join(root, 'src/locales')).filter(file => file.endsWith('.json'))
  const engineFiles = readdirSync(join(root, 'src/engine-locales')).filter(file => file.endsWith('.json'))
  const overrideFiles = readdirSync(join(root, 'src/translations')).filter(file => file.endsWith('.json'))
  const locales = new Set([...registry.map(language => language.value), ...localeFiles.map(file => file.slice(0, -5))])
  for (const locale of locales) {
    const original = localeFiles.includes(locale + '.json') ? readJSON(join(root, 'src/locales/' + locale + '.json')) : {}
    messages[locale] = { ...types[locale], ...credits[locale], ...history[locale], ...ui[locale], ...original }
    engine[locale] = engineFiles.includes(locale + '.json') ? readJSON(join(root, 'src/engine-locales/' + locale + '.json')) : {}
    engine[locale] = mergeCatalog(engine[locale], skyNames[locale])
    landscapeCatalogs[locale] = landscapes[locale] || {}
  }
  const pluginRoot = join(root, 'src/plugins')
  if (existsSync(pluginRoot)) {
    for (const plugin of readdirSync(pluginRoot, { withFileTypes: true }).filter(entry => entry.isDirectory())) {
      const directory = join(pluginRoot, plugin.name, 'locales')
      if (!existsSync(directory)) continue
      for (const file of readdirSync(directory).filter(file => file.endsWith('.json'))) {
        const locale = file.slice(0, -5)
        messages[locale] = mergeCatalog(messages[locale], readJSON(join(directory, file)))
      }
    }
  }
  for (const file of overrideFiles) {
    const locale = file.slice(0, -5)
    overrides[locale] = readJSON(join(root, 'src/translations/' + file))
    messages[locale] = mergeCatalog(messages[locale], overrides[locale].messages)
    engine[locale] = mergeCatalog(engine[locale], overrides[locale].engine)
    landscapeCatalogs[locale] = mergeCatalog(landscapeCatalogs[locale], overrides[locale].landscapes)
  }
  const source = { messages: { ...messages.en }, engine: { gui: {}, sky: {}, skyculture: {} }, landscapes: landscapes.en }
  const typeFile = resolve(root, '../../src/otypes.c')
  if (existsSync(typeFile)) {
    for (const match of readFileSync(typeFile, 'utf8').matchAll(/N_\("([^"]+)"\)/g)) source.engine.gui[match[1]] = match[1]
  }
  for (const catalogs of Object.values(engine)) {
    for (const [domain, catalog] of Object.entries(catalogs)) {
      if (domain === '_sources') continue
      source.engine[domain] ||= {}
      for (const key of Object.keys(catalog)) source.engine[domain][key] = key
    }
  }
  const nameIndex = join(root, 'public/skydata/name_index_compact.json')
  let identifierCount = 0
  if (existsSync(nameIndex)) {
    const index = readJSON(nameIndex)
    for (const name of new Set([...(index.stars || []), ...(index.dsos || [])])) {
      if (isIdentifier(name)) { identifierCount++; continue }
      source.engine.sky[name.replace(/^NAME /, '')] = name.replace(/^NAME /, '')
    }
  }
  const cultureRoot = join(root, 'public/skydata/skycultures')
  for (const culture of readJSON(join(cultureRoot, 'index.json'))) {
    const data = readJSON(join(cultureRoot, culture, 'index.json'))
    const domain = 'skyculture/' + culture
    const chinese = culture.startsWith('chinese')
    const keys = new Set(chinese ? ['Added'] : [])
    function visit (value) {
      if (Array.isArray(value)) value.forEach(visit)
      else if (value && typeof value === 'object') {
        if (typeof value.english === 'string') {
          const name = chinese ? value.english.replace(/ (?:Added(?: [IVXLCDM]+)?|[IVXLCDM]+)$/, '') : value.english
          // The engine requests the native-name scope first (e.g. the two Compasses).
          if (!source.engine[domain + '/' + value.native]?.[name]) keys.add(name)
        }
        Object.values(value).forEach(visit)
      }
    }
    visit(data)
    // Culture-specific templates allow later corrections without global collisions.
    source.engine[domain] ||= {}
    for (const key of keys) source.engine[domain][key] = key
  }
  source.messages = sorted(source.messages)
  // Imported catalogs sometimes contain untranslated catalog aliases as well.
  for (const name of Object.keys(source.engine.sky)) {
    if (isIdentifier(name)) delete source.engine.sky[name]
  }
  source.engine = sorted(Object.fromEntries(Object.entries(source.engine).map(([domain, catalog]) => [domain, sorted(catalog)])))
  return { root, registry, messages, engine, landscapes: landscapeCatalogs, overrides, source, identifierCount }
}

export function findEngineTranslation (catalogs, domain, key, messages) {
  if (Object.hasOwn(catalogs[domain] || {}, key) && catalogs[domain][key]) return catalogs[domain][key]
  if (domain.startsWith('skyculture/')) return findEngineTranslation(catalogs, domain.slice(0, domain.lastIndexOf('/')), key, messages)
  if (domain === 'skyculture') return findEngineTranslation(catalogs, 'sky', key, messages)
  return domain === 'gui' ? messages[key] : undefined
}

export function coverage (project, locale) {
  if (!project.registry.some(language => language.value === locale)) throw new Error('Unregistered language: ' + locale)
  const messages = project.messages[locale] || {}, engine = project.engine[locale] || {}
  const missing = { messages: {}, engine: {}, landscapes: {} }, unchanged = { messages: [], engine: {} }
  for (const [key, english] of Object.entries(project.source.messages)) {
    if (!messages[key]) missing.messages[key] = english
    else if (locale !== 'en' && messages[key] === english) unchanged.messages.push(key)
  }
  for (const [domain, source] of Object.entries(project.source.engine)) {
    const gaps = {}, same = []
    for (const key of Object.keys(source)) {
      const value = findEngineTranslation(engine, domain, key, messages)
      if (!value && locale !== 'en') gaps[key] = key
      else if (locale !== 'en' && value === key) same.push(key)
    }
    if (Object.keys(gaps).length) missing.engine[domain] = gaps
    if (same.length) unchanged.engine[domain] = same
  }
  for (const [key, source] of Object.entries(project.source.landscapes)) {
    for (const field of ['title', 'description']) {
      if (!project.landscapes[locale]?.[key]?.[field]) {
        missing.landscapes[key] ||= {}
        missing.landscapes[key][field] = source[field]
      }
    }
  }
  return { locale, excludedIdentifiers: project.identifierCount, missing, unchanged }
}

export function makeTemplate (project, locale) {
  const gaps = coverage(project, locale).missing
  const blank = value => typeof value === 'string' ? '' : Object.fromEntries(Object.entries(value).map(([key, child]) => [key, blank(child)]))
  return blank(gaps)
}

function appendDrafts (existing, template) {
  const result = { ...template, ...existing }
  for (const [key, value] of Object.entries(template)) {
    if (value && typeof value === 'object' && existing[key] && typeof existing[key] === 'object') {
      result[key] = appendDrafts(existing[key], value)
    }
  }
  return result
}

const placeholders = text => [...text.matchAll(/\{([^{}]+)\}/g)].map(match => match[1]).sort()
export function validate (project) {
  const errors = []
  const locales = new Set()
  const aliases = new Map()
  for (const language of project.registry) {
    if (locales.has(language.value)) errors.push('Duplicate language: ' + language.value)
    locales.add(language.value)
    if (!language.text || !language.font) errors.push('Language requires a native name and font: ' + language.value)
    if (language.dir && !['ltr', 'rtl'].includes(language.dir)) errors.push('Invalid text direction: ' + language.value)
    if (!/^[A-Za-z][A-Za-z0-9_-]*$/.test(language.font)) errors.push('Invalid font family: ' + language.value)
    for (const weight of ['Regular', 'Bold']) {
      if (!existsSync(join(project.root, 'public/fonts/' + language.font + '-' + weight + '.ttf'))) errors.push('Missing offline font: ' + language.font + '-' + weight + '.ttf')
    }
    for (const alias of [language.value, ...(language.aliases || [])]) {
      if (typeof alias !== 'string') { errors.push('Invalid alias: ' + language.value); continue }
      const tag = alias.toLowerCase().replace(/_/g, '-')
      if (aliases.has(tag) && aliases.get(tag) !== language.value) errors.push('Conflicting language alias: ' + alias)
      aliases.set(tag, language.value)
    }
    try {
      if (Intl.getCanonicalLocales(language.value)[0] !== language.value) errors.push('Noncanonical locale: ' + language.value)
    } catch { errors.push('Invalid locale: ' + language.value) }
    const file = join(project.root, 'src/locales/' + language.value + '.json')
    if (!existsSync(file) && !project.overrides[language.value]) errors.push('No catalog for registered language: ' + language.value)
  }
  for (const [locale, catalog] of Object.entries(project.overrides)) {
    if (!locales.has(locale)) errors.push('Override has no language registration: ' + locale)
    for (const section of Object.keys(catalog)) {
      if (!['messages', 'engine', 'landscapes'].includes(section)) errors.push(locale + ': unknown section ' + section)
    }
    for (const domain of Object.keys(catalog.engine || {})) {
      if (!['sky', 'gui', 'skyculture'].includes(domain) && !domain.startsWith('skyculture/')) errors.push(locale + ': unknown engine domain ' + domain)
    }
    function walk (value, path = []) {
      if (typeof value === 'string') {
        if (/<\/?[a-z][^>]*>/i.test(value)) errors.push(locale + ':' + path.join('.') + ': use plain text, not HTML')
        const [section, ...keys] = path
        let source = project.source[section]
        for (const key of keys) source = source?.[key]
        if (section === 'messages' && typeof source !== 'string') errors.push(locale + ': unknown message key ' + keys[0])
        if (section === 'landscapes' && typeof source !== 'string') errors.push(locale + ': unknown landscape field ' + keys.join('.'))
        if (value.trim() && typeof source === 'string' && JSON.stringify(placeholders(value)) !== JSON.stringify(placeholders(source))) {
          errors.push(locale + ':' + path.join('.') + ': interpolation placeholders do not match')
        }
      } else if (value && typeof value === 'object' && !Array.isArray(value)) {
        for (const [key, child] of Object.entries(value)) {
          if (['__proto__', 'constructor', 'prototype', '_sources'].includes(key)) errors.push(locale + ': reserved key ' + key)
          walk(child, [...path, key])
        }
      } else errors.push(locale + ':' + path.join('.') + ': expected an object or string')
    }
    walk(catalog)
  }
  return errors
}

export async function main (args = process.argv.slice(2)) {
  const positional = [], options = {}
  for (let i = 0; i < args.length; i++) {
    if (args[i].startsWith('--')) {
      const key = args[i].slice(2)
      if (!['root', 'output', 'name', 'aliases', 'moment', 'vuetify', 'font', 'dir'].includes(key)) throw new Error('Unknown option: --' + key)
      if (!args[i + 1] || args[i + 1].startsWith('--')) throw new Error('Missing value for --' + key)
      options[key] = args[++i]
    } else positional.push(args[i])
  }
  const [command, tag] = positional
  const root = resolve(options.root || defaultRoot)
  if (!command || command === 'help') {
    console.log('l10n init <locale> --name <native name> [--aliases tag,tag] [--moment tag] [--vuetify tag] [--font family] [--dir ltr|rtl]\nl10n template <locale> [--output work.json]\nl10n report [locale] [--output report.json]\nl10n check\nDrafts are empty strings; reports distinguish missing translations from unchanged proper names.')
    return
  }
  const project = await loadProject(root)
  if (command === 'init' || command === 'template') {
    if (!tag) throw new Error('Supply a locale, such as es or hi')
    const locale = Intl.getCanonicalLocales(tag.replace(/_/g, '-'))[0]
    const path = options.output ? resolve(options.output) : join(root, 'src/translations/' + locale + '.json')
    if (command === 'init' && options.output) throw new Error('init writes the bundled catalog; use --output with template or report')
    if (command === 'init' && existsSync(path)) throw new Error('Will not overwrite ' + path)
    if (command === 'init') {
      if (project.registry.some(language => language.value === locale)) throw new Error('Language already registered; use template ' + locale)
      if (!options.name) throw new Error('Supply --name with the native language name')
      const language = { value: locale, text: options.name, aliases: (options.aliases || '').split(',').map(alias => alias.trim()).filter(Boolean), moment: options.moment || locale.toLowerCase(), vuetify: options.vuetify || locale, font: options.font || 'NotoSans', dir: options.dir || 'ltr' }
      project.registry.push(language)
      // Validate before writing either file; temporarily mark the new draft as present.
      project.overrides[locale] = {}
      const errors = validate(project)
      if (errors.length) throw new Error(errors.join('\n'))
    }
    const existing = existsSync(path) ? readJSON(path) : {}
    writeJSON(path, appendDrafts(existing, makeTemplate(project, locale)))
    if (command === 'init') writeJSON(join(root, 'src/languages.json'), project.registry)
    console.log('Created ' + path + '\nFill in JSON values, import upstream catalogs if available, then run l10n check and l10n report ' + locale + '. Empty entries use English fallback.')
    return
  }
  if (command === 'report') {
    const reports = (tag ? [tag] : project.registry.map(language => language.value)).map(locale => coverage(project, locale))
    for (const report of reports) {
      const engine = Object.values(report.missing.engine).reduce((sum, catalog) => sum + Object.keys(catalog).length, 0)
      const landscape = Object.values(report.missing.landscapes).reduce((sum, catalog) => sum + Object.keys(catalog).length, 0)
      console.log(`${report.locale}: missing ${Object.keys(report.missing.messages).length} UI/content, ${engine} engine entries, ${landscape} landscape fields; ${report.excludedIdentifiers} identifiers excluded.`)
    }
    if (options.output) {
      writeJSON(resolve(options.output), { note: 'Missing values are English source keys. Unchanged values may be legitimate proper names, not errors. Scoped engine gaps can overlap between cultures.', reports })
      console.log('Wrote ' + resolve(options.output))
    }
    return
  }
  if (command === 'check') {
    const errors = validate(project)
    if (errors.length) throw new Error(errors.join('\n'))
    console.log('Registry and override catalogs are valid. Run l10n report to review incomplete translations.')
    return
  }
  throw new Error('Unknown command: ' + command)
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch(error => { console.error(error.message); process.exitCode = 1 })
}
