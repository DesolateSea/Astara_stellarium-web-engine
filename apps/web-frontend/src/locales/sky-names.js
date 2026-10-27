// Two constellations share the English name "Compass" but not its meaning.
// Scope by culture and native name instead of guessing a global translation.
export const skyNameMessages = {}
const names = {
  de: { Pyxis: 'Schiffskompass', Circinus: 'Zirkel' },
  fr: { Pyxis: 'La Boussole', Circinus: 'Le Compas' },
  'zh-Hans': { Pyxis: '罗盘座', Circinus: '圆规座' }
}
Object.keys(names).forEach(locale => {
  skyNameMessages[locale] = {}
  for (const culture of ['western', 'western_SnT', 'western_hlad', 'western_rey']) {
    Object.keys(names[locale]).forEach(native => {
      skyNameMessages[locale]['skyculture/' + culture + '/' + native] = { Compass: names[locale][native] }
    })
  }
})
