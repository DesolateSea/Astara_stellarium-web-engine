import assert from 'node:assert/strict'
import { readFileSync, writeFileSync, mkdirSync, mkdtempSync, rmSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { test } from 'node:test'
import { runInNewContext } from 'node:vm'
import { loadProject, coverage, makeTemplate, validate, isIdentifier, main } from '../tools/localization.mjs'

const mergeSource = readFileSync(new URL('../src/translations/catalog.js', import.meta.url), 'utf8')
const { mergeCatalog } = await import('data:text/javascript;base64,' + Buffer.from(mergeSource).toString('base64'))

function fixture () {
  const directory = mkdtempSync('/tmp/opencode/astara-l10n-test-')
  const root = join(directory, 'apps/web-frontend')
  const write = (file, data) => {
    mkdirSync(join(root, file, '..'), { recursive: true })
    writeFileSync(join(root, file), typeof data === 'string' ? data : JSON.stringify(data))
  }
  write('src/translations/catalog.js', mergeSource)
  write('public/fonts/NotoSans-Regular.ttf', '')
  write('public/fonts/NotoSans-Bold.ttf', '')
  write('src/languages.json', [
    { value: 'en', text: 'English', font: 'NotoSans' },
    { value: 'fr', text: 'Français', font: 'NotoSans' }
  ])
  write('src/locales/en.json', { 'Hello {name}': 'Hello {name}' })
  write('src/locales/fr.json', { 'Hello {name}': 'Bonjour {name}' })
  for (const [file, name] of [['ui', 'uiMessages'], ['history', 'historyMessages'], ['credits', 'creditMessages'], ['object-types', 'objectTypeMessages'], ['sky-names', 'skyNameMessages']]) {
    write('src/locales/' + file + '.js', 'export const ' + name + ' = { en: {}, fr: {} }')
  }
  write('src/locales/landscapes.js', 'export const landscapeMessages = ' + JSON.stringify({
    en: { ocean: { title: 'Ocean', description: 'An ocean horizon.' } },
    fr: { ocean: { title: 'Océan', description: 'Un horizon marin.' } }
  }))
  write('src/engine-locales/en.json', {})
  write('src/engine-locales/fr.json', {
    sky: { Polaris: 'Étoile Polaire', Sirius: 'Sirius' },
    gui: { Star: 'Étoile' },
    skyculture: { Maiden: 'Vierge' },
    'skyculture/western/Pyxis': { Compass: 'La Boussole' },
    'skyculture/western/Circinus': { Compass: 'Le Compas' }
  })
  write('src/translations/fr.json', { engine: { 'skyculture/western': { Maiden: 'La Vierge' } } })
  write('public/skydata/name_index_compact.json', { stars: ['Polaris', 'Sirius', 'Vega', 'HIP 1', 'alf CMa', 'SDSS J123.4+55'], dsos: ['NGC 1'] })
  write('public/skydata/skycultures/index.json', ['western', 'chinese'])
  write('public/skydata/skycultures/western/index.json', { constellations: [
    { common_name: { english: 'Maiden', native: 'Virgo' } },
    { common_name: { english: 'Compass', native: 'Pyxis' } },
    { common_name: { english: 'Compass', native: 'Circinus' } }
  ] })
  write('public/skydata/skycultures/chinese/index.json', { common_names: {
    'HIP 1': [{ english: 'Net Added IV', native: '毕宿增四' }],
    'HIP 2': [{ english: 'Net V', native: '毕宿五' }]
  } })
  return { root, write, cleanup: () => rmSync(directory, { recursive: true }) }
}

test('JSON overrides preserve source catalogs, ignore drafts, and merge nested scopes safely', () => {
  const original = { sky: { Polaris: 'Polarstern', Sirius: 'Sirius' } }
  const result = mergeCatalog(original, JSON.parse('{"sky":{"Polaris":"","Sirius":"天狼星","Vega":" "},"__proto__":{"polluted":true}}'))
  assert.equal(result.sky.Polaris, 'Polarstern')
  assert.equal(result.sky.Sirius, '天狼星')
  assert.equal(result.sky.Vega, undefined)
  assert.equal(result.polluted, undefined)
  assert.equal(original.sky.Sirius, 'Sirius')
})

test('coverage separates real gaps from proper names and catalog IDs, and checks Chinese base names', async () => {
  const f = fixture()
  try {
    const project = await loadProject(f.root)
    const report = coverage(project, 'fr')
    assert.deepEqual(report.missing.messages, {})
    assert.equal(report.missing.engine.sky.Vega, 'Vega')
    assert.ok(!Object.hasOwn(report.missing.engine.sky, 'HIP 1'))
    assert.deepEqual(report.unchanged.engine.sky, ['Sirius'])
    assert.equal(report.excludedIdentifiers, 4)
    assert.equal(project.engine.fr['skyculture/western'].Maiden, 'La Vierge')
    assert.deepEqual(Object.keys(project.source.engine['skyculture/chinese']), ['Added', 'Net'])
    assert.ok(!Object.hasOwn(project.source.engine['skyculture/western'], 'Compass'))
    assert.equal(makeTemplate(project, 'fr').engine.sky.Vega, '')
    assert.deepEqual(validate(project), [])
  } finally { f.cleanup() }
})

test('init registers a new language and creates one offline editable catalog without changing existing files', async () => {
  const f = fixture()
  try {
    const before = readFileSync(join(f.root, 'src/locales/fr.json'), 'utf8')
    await main(['init', 'es', '--name', 'Español', '--root', f.root])
    const project = await loadProject(f.root)
    assert.equal(project.registry.find(language => language.value === 'es').text, 'Español')
    assert.equal(project.overrides.es.messages['Hello {name}'], '')
    assert.equal(project.overrides.es.engine.sky.Polaris, '')
    assert.equal(project.overrides.es.landscapes.ocean.title, '')
    assert.equal(project.messages.es['Hello {name}'], undefined)
    assert.deepEqual(validate(project), [])
    assert.equal(readFileSync(join(f.root, 'src/locales/fr.json'), 'utf8'), before)
    await assert.rejects(main(['init', 'es', '--name', 'Español', '--root', f.root]), /overwrite|registered/)
    await assert.rejects(main(['init', '../bad', '--name', 'Bad', '--root', f.root]))
    await assert.rejects(main(['init', 'hi', '--name', 'हिन्दी', '--font', 'MissingFont', '--root', f.root]), /Missing offline font/)
    await assert.rejects(main(['init', 'pt', '--name', 'Português', '--aliases', 'fr', '--root', f.root]), /Conflicting language alias/)
    assert.ok(!existsSync(join(f.root, 'src/bad.json')))
  } finally { f.cleanup() }
})

test('refreshing a template adds new drafts without losing an existing correction', async () => {
  const f = fixture()
  try {
    await main(['template', 'fr', '--root', f.root])
    const project = await loadProject(f.root)
    assert.equal(project.overrides.fr.engine['skyculture/western'].Maiden, 'La Vierge')
    assert.equal(project.overrides.fr.engine.sky.Vega, '')
    assert.equal(project.engine.fr.sky.Polaris, 'Étoile Polaire')
  } finally { f.cleanup() }
})

test('validation rejects bad interpolation, unsafe values, and accidental domain typos', async () => {
  const f = fixture()
  try {
    f.write('src/translations/fr.json', { messages: { 'Hello {name}': 'Bonjour {nom}' }, engine: { skyy: { Polaris: '<script>bad</script>' } }, landscapes: { missing: { title: 'Bad' } } })
    const errors = validate(await loadProject(f.root))
    assert.ok(errors.some(error => error.includes('placeholders')))
    assert.ok(errors.some(error => error.includes('unknown engine domain')))
    assert.ok(errors.some(error => error.includes('not HTML')))
    assert.ok(errors.some(error => error.includes('unknown landscape')))
  } finally { f.cleanup() }
})

test('identifier classification excludes scientific designations rather than calling them untranslated names', () => {
  for (const name of ['HIP 123', 'NGC 1', 'HD 123', 'SDSS J123.4+55', 'Cl Collinder 25', '* alf CMa', 'alpha Cen', '100 Vir', 'b And']) assert.ok(isIdentifier(name), name)
  for (const name of ['Polaris', 'Andromeda Galaxy', 'Sirius', 'Orion Nebula']) assert.ok(!isIdentifier(name), name)
})

test('new language registrations drive locale resolution and font choice without editing locale code', async () => {
  const registry = [
    { value: 'en', text: 'English', font: 'NotoSans' },
    { value: 'es', text: 'Español', aliases: ['es-419'], font: 'NotoSans' },
    { value: 'hi', text: 'हिन्दी', font: 'NotoSansDevanagari' },
    { value: 'zh-Hans', aliases: ['zh', 'zh-CN'], font: 'NotoSansSC' },
    { value: 'zh-Hant', aliases: ['zh-TW'], font: 'NotoSansTC' }
  ]
  const source = readFileSync(new URL('../src/locale.js', import.meta.url), 'utf8')
    .replace("import languageRegistry from './languages.json'", 'const languageRegistry = ' + JSON.stringify(registry))
  const locale = await import('data:text/javascript;base64,' + Buffer.from(source).toString('base64'))
  assert.equal(locale.normalizeLocale('es-419'), 'es')
  assert.equal(locale.normalizeLocale('hi-IN'), 'hi')
  assert.equal(locale.normalizeLocale('zh-TW'), 'zh-Hant')
  assert.equal(locale.getFontFamily('hi'), 'NotoSansDevanagari')
})

test('script-specific UI fonts use the registered local TTFs without a remote service', () => {
  const source = readFileSync(new URL('../src/translations/fonts.js', import.meta.url), 'utf8').replace('export function', 'function')
  const faces = [], properties = []
  const configure = runInNewContext(source + '\nconfigureLocaleFont', {
    FontFace: function (family, url, options) { Object.assign(this, { family, url, options }) },
    document: { fonts: { add: face => faces.push(face) }, documentElement: { style: { setProperty: (...args) => properties.push(args) } } }
  })
  configure({ font: 'NotoSansDevanagari' }, '/app/')
  assert.equal(faces.length, 2)
  assert.equal(faces[0].url, 'url("/app/fonts/NotoSansDevanagari-Regular.ttf")')
  assert.equal(faces[1].options.weight, '700')
  assert.equal(properties[0][0], '--astara-locale-font')
  configure({ font: 'NotoSans' })
  assert.equal(faces.length, 2)
})
