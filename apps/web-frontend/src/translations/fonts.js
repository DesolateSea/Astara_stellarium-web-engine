// UI and engine use the same locally bundled TTF family for non-Latin scripts.
// NotoSans remains the engine default; Latin UI keeps Vuetify's existing Roboto.
export function configureLocaleFont (language, baseUrl = '/') {
  if (!language.font || language.font === 'NotoSans') return
  if (!/^[A-Za-z][A-Za-z0-9_-]*$/.test(language.font)) return
  if (typeof FontFace === 'undefined' || !document.fonts) return
  for (const [weight, suffix] of [[400, 'Regular'], [700, 'Bold']]) {
    const face = new FontFace('Astara Locale', 'url("' + baseUrl + 'fonts/' + language.font + '-' + suffix + '.ttf")', { weight: String(weight), display: 'swap' })
    document.fonts.add(face)
  }
  document.documentElement.style.setProperty('--astara-locale-font', '"Astara Locale"')
}
