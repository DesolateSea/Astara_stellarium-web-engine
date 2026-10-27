import i18n, { translateEngine } from './i18n'

// Keep category, objectName, planet and bodies canonical for filtering and engine lookups.
// Localize copies at display time so cached events cannot retain a previous language.
export function localizeEvent (event) {
  const t = (key, values) => i18n.t(key, values)
  const body = name => translateEngine('sky', name)
  const source = text => i18n.te(text, i18n.locale) || i18n.te(text, 'en') ? t(text) : text
  let name = source(event.name)
  let description = source(event.description)
  switch (event.type) {
    case 'moon_phase':
      description = t('The moon will be in {phase} phase.', { phase: name })
      break
    case 'lunar_perigee':
    case 'lunar_apogee':
      description = t(event.type === 'lunar_perigee'
        ? 'The Moon will be {distance} km from Earth at perigee.'
        : 'The Moon will be {distance} km from Earth at apogee.', {
        distance: new Intl.NumberFormat(i18n.locale, { maximumFractionDigits: 0 }).format(event.distance)
      })
      if (event.type === 'lunar_perigee') description += ' ' + t('This may appear as a Supermoon if it coincides with a Full Moon.')
      break
    case 'conjunction': {
      const planet = body(event.objectName)
      name = t('Moon–{planet} Conjunction', { planet })
      description = t('The Moon and {planet} will appear close together in the sky.', { planet })
      break
    }
    case 'opposition': {
      const planet = body(event.planet)
      name = t('{planet} at Opposition', { planet })
      description = t('{planet} will be at opposition, appearing at its brightest and best positioned for observation.', { planet })
      break
    }
    case 'elongation': {
      const planet = body(event.planet)
      name = t('{planet} Greatest Elongation', { planet })
      description = t('{planet} will reach greatest elongation ({degrees}° from the Sun). Best seen in the {sky} sky.', {
        planet, degrees: Math.abs(event.elongation).toFixed(1), sky: t(event.visibility)
      })
      break
    }
    case 'lunar_eclipse':
    case 'solar_eclipse': {
      const lunar = event.type === 'lunar_eclipse'
      const kinds = lunar ? {
        penumbral: ['Penumbral Lunar Eclipse', 'The Moon will pass through Earth’s penumbral shadow.'],
        partial: ['Partial Lunar Eclipse', 'The Moon will be partially shadowed by Earth.'],
        total: ['Total Lunar Eclipse', 'The Moon will be completely shadowed by Earth.']
      } : {
        partial: ['Partial Solar Eclipse', 'The Sun will be partially blocked by the Moon.'],
        annular: ['Annular Solar Eclipse', 'The Moon will appear smaller than the Sun, creating a ring of fire effect.'],
        total: ['Total Solar Eclipse', 'The Sun will be completely blocked by the Moon.'],
        hybrid: ['Hybrid Solar Eclipse', 'This rare eclipse will transition between annular and total along its path.']
      }
      const keys = kinds[event.eclipseKind] || kinds[lunar ? 'penumbral' : 'partial']
      name = t(keys[0])
      description = t(keys[1])
      break
    }
    default:
      if (event.yearsAgo > 0) {
        // The service supplies the source description separately from the anniversary suffix.
        description = t('{description} ({count} years ago)', {
          description: source(event.sourceDescription || event.description), count: event.yearsAgo
        })
      }
  }
  return { ...event, name, description }
}
