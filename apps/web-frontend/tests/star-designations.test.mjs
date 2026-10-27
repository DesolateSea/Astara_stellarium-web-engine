import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'
const read = file => readFileSync(new URL(file, import.meta.url), 'utf8')
const module = await import('data:text/javascript;base64,' + Buffer.from(read('../src/translations/designations.js')).toString('base64'))
const { mergeCatalog } = await import('data:text/javascript;base64,' + Buffer.from(read('../src/translations/catalog.js')).toString('base64'))
const { skyNameMessages } = await import('data:text/javascript;base64,' + Buffer.from(read('../src/locales/sky-names.js')).toString('base64'))

function lookupFor (locale) {
  const catalogs = mergeCatalog(mergeCatalog(JSON.parse(read('../src/engine-locales/' + locale + '.json')), skyNameMessages[locale]), JSON.parse(read('../src/translations/' + locale + '.json')).engine)
  function lookup (domain, text) {
    const value = catalogs[domain]?.[text]
    if (value) return module.localizedNameOnly(value, locale)
    if (domain.startsWith('skyculture/')) return lookup(domain.slice(0, domain.lastIndexOf('/')), text)
    if (domain === 'skyculture') return lookup('sky', text)
    return text
  }
  return lookup
}

test('all 88 designation mappings match bundled culture keys and have translations', () => {
  const bundled = JSON.parse(read('../public/skydata/skycultures/western/index.json')).constellations
  assert.equal(module.constellations.length, 88)
  for (const [, genitive, english, native] of module.constellations) {
    assert.ok(bundled.some(c => c.common_name.english === english && c.common_name.native === native), genitive)
    for (const locale of ['de', 'fr', 'zh-Hans']) assert.notEqual(module.translateConstellation(genitive, lookupFor(locale)), genitive, locale + ':' + genitive)
  }
})

test('common stars use localized names without Chinese Latin duplicates', () => {
  assert.equal(lookupFor('zh-Hans')('sky', 'Spica'), '角宿一')
  assert.equal(lookupFor('zh-Hans')('skyculture/western', 'Arcturus'), '大角')
  assert.equal(lookupFor('fr')('sky', 'Spica'), 'L’Épi')
  assert.equal(lookupFor('de')('sky', 'Arcturus'), 'Arktur')
  assert.equal(lookupFor('fr')('sky', 'Arcturus'), 'Arcturus')
  assert.equal(lookupFor('de')('sky', 'Spica'), 'Spica')
})

test('Bayer names translate their constellation, preserving numbers, components, and catalog IDs', () => {
  for (const [locale, expected] of [['de', 'β Rabe'], ['fr', 'β Le Corbeau'], ['zh-Hans', '乌鸦座β']]) {
    for (const name of ['Beta Corvi', '* bet Crv', 'β Crv']) assert.equal(module.translateStarDesignation(name, lookupFor(locale), locale), expected)
    assert.equal(module.translateGreek('Beta', locale), 'β')
    assert.equal(module.translateStarDesignation('HIP 12345', lookupFor(locale), locale), 'HIP 12345')
    assert.equal(module.translateStarDesignation('NGC 123', lookupFor(locale), locale), 'NGC 123')
  }
  assert.equal(module.translateStarDesignation('Beta Corvi', lookupFor('de'), 'en'), 'Beta Corvi')
  assert.equal(module.translateStarDesignation('* bet2 Crv B', lookupFor('de'), 'de'), 'β2 Rabe B')
  assert.equal(module.translateStarDesignation('* 12 Crv', lookupFor('fr'), 'fr'), '12 Le Corbeau')
})
