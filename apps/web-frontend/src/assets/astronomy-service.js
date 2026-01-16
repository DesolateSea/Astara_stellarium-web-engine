// Stellarium Web - Copyright (c) 2022 - Stellarium Labs SRL
//
// This program is licensed under the terms of the GNU AGPL v3, or
// alternatively under a commercial licence.
//
// The terms of the AGPL v3 license can be found in the main directory of this
// repository.

import * as Astronomy from 'astronomy-engine'
import historyData from './astronomy-history-data.js'

/**
 * Astronomy Service
 * Provides astronomical event calculations using the astronomy-engine library
 */

const AstronomyService = {
  /**
         * Calculate moon phases for a given date range
         * @param {Date} startDate - Start date
         * @param {Date} endDate - End date
         * @returns {Array} Array of moon phase events
         */
  getMoonPhases (startDate, endDate) {
    const events = []
    let currentDate = new Date(startDate)

    while (currentDate <= endDate) {
      try {
        // Search for next moon quarter
        const phaseInfo = Astronomy.SearchMoonQuarter(currentDate)
        if (phaseInfo && phaseInfo.time) {
          const phaseDate = phaseInfo.time.date
          if (phaseDate >= startDate && phaseDate <= endDate) {
            const phaseNames = ['New Moon', 'First Quarter', 'Full Moon', 'Last Quarter']
            const phaseEmojis = ['🌑', '🌓', '🌕', '🌗']

            events.push({
              type: 'moon_phase',
              category: 'Moon Events',
              name: phaseNames[phaseInfo.quarter],
              emoji: phaseEmojis[phaseInfo.quarter],
              date: phaseDate,
              quarter: phaseInfo.quarter,
              description: 'The moon will be in ' + phaseNames[phaseInfo.quarter] + ' phase.',
              canViewInSky: true,
              objectName: 'Moon'
            })
          }

          // Move to just after this phase to find the next one
          currentDate = new Date(phaseDate.getTime() + 1)
        } else {
          break
        }
      } catch (e) {
        console.error('Error calculating moon phases:', e)
        break
      }
    }

    return events.sort((a, b) => a.date - b.date)
  },

  /**
         * Calculate lunar perigee and apogee events
         * @param {Date} startDate - Start date
         * @param {Date} endDate - End date
         * @returns {Array} Array of perigee/apogee events
         */
  getMoonDistanceEvents (startDate, endDate) {
    const events = []
    let currentDate = new Date(startDate)

    while (currentDate <= endDate) {
      try {
        const apsis = Astronomy.SearchLunarApsis(currentDate)
        if (apsis && apsis.time) {
          const apsisDate = apsis.time.date
          if (apsisDate >= startDate && apsisDate <= endDate) {
            const isPerigee = apsis.kind === 0
            const distanceKm = apsis.dist_km.toFixed(0)

            events.push({
              type: isPerigee ? 'lunar_perigee' : 'lunar_apogee',
              category: 'Moon Events',
              name: isPerigee ? 'Lunar Perigee' : 'Lunar Apogee',
              emoji: isPerigee ? '🌕✨' : '🌕',
              date: apsisDate,
              description: 'The moon will be at ' + (isPerigee ? 'perigee' : 'apogee') + ' (' + distanceKm + ' km from Earth).' + (isPerigee ? ' This may appear as a Supermoon if it coincides with a Full Moon.' : ''),
              distance: apsis.dist_km,
              canViewInSky: true,
              objectName: 'Moon'
            })
          }
        }
      } catch (e) {
        console.error('Error calculating lunar apsis:', e)
      }

      // Move forward by approximately one month
      currentDate = new Date(currentDate.getTime() + 30 * 24 * 60 * 60 * 1000)
    }

    return events
  },

  /**
         * Calculate solar events (equinoxes and solstices)
         * @param {Number} year - Year to calculate for
         * @returns {Array} Array of solar events
         */
  getSolarEvents (year) {
    const events = []

    try {
      // Calculate equinoxes and solstices
      const seasons = Astronomy.Seasons(year)

      if (seasons) {
        events.push({
          type: 'march_equinox',
          category: 'Solar Events',
          name: 'March Equinox',
          emoji: '🌸',
          date: seasons.mar_equinox.date,
          description: 'Spring begins in the Northern Hemisphere. Day and night are approximately equal in length.',
          canViewInSky: true,
          objectName: 'Sun'
        })

        events.push({
          type: 'june_solstice',
          category: 'Solar Events',
          name: 'June Solstice',
          emoji: '☀️',
          date: seasons.jun_solstice.date,
          description: 'Summer begins in the Northern Hemisphere. Longest day of the year in the Northern Hemisphere.',
          canViewInSky: true,
          objectName: 'Sun'
        })

        events.push({
          type: 'september_equinox',
          category: 'Solar Events',
          name: 'September Equinox',
          emoji: '🍂',
          date: seasons.sep_equinox.date,
          description: 'Autumn begins in the Northern Hemisphere. Day and night are approximately equal in length.',
          canViewInSky: true,
          objectName: 'Sun'
        })

        events.push({
          type: 'december_solstice',
          category: 'Solar Events',
          name: 'December Solstice',
          emoji: '❄️',
          date: seasons.dec_solstice.date,
          description: 'Winter begins in the Northern Hemisphere. Shortest day of the year in the Northern Hemisphere.',
          canViewInSky: true,
          objectName: 'Sun'
        })
      }
    } catch (e) {
      console.error('Error calculating solar events:', e)
    }

    return events
  },

  /**
         * Calculate planetary conjunctions
         * @param {Date} startDate - Start date
         * @param {Date} endDate - End date
         * @returns {Array} Array of conjunction events
         */
  getPlanetaryConjunctions (startDate, endDate) {
    const events = []
    const planets = ['Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn']

    // Check Moon-Planet conjunctions (most visible and interesting)
    for (const planet of planets) {
      try {
        let currentDate = new Date(startDate)

        while (currentDate <= endDate) {
          const conjunction = Astronomy.SearchRelativeLongitude(
            'Moon',
            planet,
            0, // 0 degrees = conjunction
            currentDate
          )

          if (conjunction && conjunction.date) {
            if (conjunction.date >= startDate && conjunction.date <= endDate) {
              events.push({
                type: 'conjunction',
                category: 'Planetary Events',
                name: 'Moon-' + planet + ' Conjunction',
                emoji: '🌙⭐',
                date: conjunction.date,
                description: 'The Moon and ' + planet + ' will be in conjunction, appearing close together in the sky.',
                bodies: ['Moon', planet],
                canViewInSky: true,
                objectName: planet
              })
            }

            // Move past this conjunction
            currentDate = new Date(conjunction.date.getTime() + 7 * 24 * 60 * 60 * 1000)
          } else {
            break
          }
        }
      } catch (e) {
        // Some conjunctions may not exist in the time range
        console.debug('No ' + planet + ' conjunction found:', e.message)
      }
    }

    return events.sort((a, b) => a.date - b.date)
  },

  /**
         * Calculate planetary oppositions
         * @param {Date} startDate - Start date
         * @param {Date} endDate - End date
         * @returns {Array} Array of opposition events
         */
  getPlanetaryOppositions (startDate, endDate) {
    const events = []
    const outerPlanets = ['Mars', 'Jupiter', 'Saturn']

    for (const planet of outerPlanets) {
      try {
        let currentDate = new Date(startDate)

        while (currentDate <= endDate) {
          const opposition = Astronomy.SearchRelativeLongitude(
            planet,
            'Sun',
            180, // 180 degrees = opposition
            currentDate
          )

          if (opposition && opposition.date) {
            if (opposition.date >= startDate && opposition.date <= endDate) {
              events.push({
                type: 'opposition',
                category: 'Planetary Events',
                name: planet + ' at Opposition',
                emoji: '⭐',
                date: opposition.date,
                description: planet + ' will be at opposition, appearing at its brightest and best positioned for observation.',
                planet: planet,
                canViewInSky: true,
                objectName: planet
              })
            }

            // Move past this opposition (oppositions happen roughly yearly for outer planets)
            currentDate = new Date(opposition.date.getTime() + 180 * 24 * 60 * 60 * 1000)
          } else {
            break
          }
        }
      } catch (e) {
        console.debug('No ' + planet + ' opposition found:', e.message)
      }
    }

    return events.sort((a, b) => a.date - b.date)
  },

  /**
         * Calculate greatest elongations for inner planets
         * @param {Date} startDate - Start date
         * @param {Date} endDate - End date
         * @returns {Array} Array of elongation events
         */
  getElongations (startDate, endDate) {
    const events = []
    const innerPlanets = ['Mercury', 'Venus']

    for (const planet of innerPlanets) {
      try {
        let currentDate = new Date(startDate)

        while (currentDate <= endDate) {
          const elongation = Astronomy.SearchMaxElongation(planet, currentDate)

          if (elongation && elongation.time) {
            const elongDate = elongation.time.date
            if (elongDate >= startDate && elongDate <= endDate) {
              const direction = elongation.visibility > 0 ? 'Evening' : 'Morning'
              const degrees = Math.abs(elongation.elongation).toFixed(1)

              events.push({
                type: 'elongation',
                category: 'Planetary Events',
                name: planet + ' Greatest Elongation',
                emoji: direction === 'Evening' ? '🌆' : '🌅',
                date: elongDate,
                description: planet + ' will reach its greatest ' + direction.toLowerCase() + ' elongation (' + degrees + '° from the Sun). Best time to observe ' + planet + ' in the ' + direction.toLowerCase() + ' sky.',
                planet: planet,
                elongation: elongation.elongation,
                visibility: direction,
                canViewInSky: true,
                objectName: planet
              })
            }

            // Move past this elongation
            currentDate = new Date(elongDate.getTime() + 60 * 24 * 60 * 60 * 1000)
          } else {
            break
          }
        }
      } catch (e) {
        console.debug('No ' + planet + ' elongation found:', e.message)
      }
    }

    return events.sort((a, b) => a.date - b.date)
  },

  /**
         * Calculate lunar and solar eclipses
         * @param {Date} startDate - Start date
         * @param {Date} endDate - End date
         * @returns {Array} Array of eclipse events
         */
  getEclipses (startDate, endDate) {
    const events = []
    let currentDate = new Date(startDate)

    // Search for lunar eclipses
    while (currentDate <= endDate) {
      try {
        const lunarEclipse = Astronomy.SearchLunarEclipse(currentDate)
        if (lunarEclipse && lunarEclipse.peak) {
          const eclipseDate = lunarEclipse.peak.date

          // If eclipse is past our end date, we're done
          if (eclipseDate > endDate) {
            break
          }

          // Only add if within range
          if (eclipseDate >= startDate) {
            const kind = lunarEclipse.kind

            // Map string kind to display values
            const kindMap = {
              penumbral: { name: 'Penumbral', emoji: '🌑', description: 'pass through the penumbral shadow of Earth' },
              partial: { name: 'Partial', emoji: '🌘', description: 'be partially shadowed by Earth' },
              total: { name: 'Total', emoji: '🌕', description: 'be completely shadowed by Earth' }
            }

            const kindInfo = kindMap[kind] || kindMap.penumbral

            events.push({
              type: 'lunar_eclipse',
              category: 'Eclipses',
              name: kindInfo.name + ' Lunar Eclipse',
              emoji: kindInfo.emoji,
              date: eclipseDate,
              description: 'A ' + kindInfo.name.toLowerCase() + ' lunar eclipse will occur. The Moon will ' + kindInfo.description + '.',
              eclipseKind: kind,
              canViewInSky: true,
              objectName: 'Moon'
            })
          }

          // Always move forward to find the next eclipse
          currentDate = new Date(eclipseDate.getTime() + 1 * 24 * 60 * 60 * 1000)
        } else {
          break
        }
      } catch (e) {
        console.debug('No more lunar eclipses found:', e.message)
        break
      }
    }

    // Search for solar eclipses
    currentDate = new Date(startDate)
    while (currentDate <= endDate) {
      try {
        const solarEclipse = Astronomy.SearchGlobalSolarEclipse(currentDate)
        if (solarEclipse && solarEclipse.peak) {
          const eclipseDate = solarEclipse.peak.date

          // If eclipse is past our end date, we're done
          if (eclipseDate > endDate) {
            break
          }

          // Only add if within range
          if (eclipseDate >= startDate) {
            const kind = solarEclipse.kind

            // Map string kind to display values
            const kindMap = {
              partial: { name: 'Partial', emoji: '🌘', description: 'The Sun will be partially blocked by the Moon.' },
              annular: { name: 'Annular', emoji: '💍', description: 'The Moon will appear smaller than the Sun, creating a ring of fire effect.' },
              total: { name: 'Total', emoji: '⚫', description: 'The Sun will be completely blocked by the Moon.' },
              hybrid: { name: 'Hybrid', emoji: '🌓', description: 'This rare eclipse will transition between annular and total along its path.' }
            }

            const kindInfo = kindMap[kind] || kindMap.partial

            events.push({
              type: 'solar_eclipse',
              category: 'Eclipses',
              name: kindInfo.name + ' Solar Eclipse',
              emoji: kindInfo.emoji,
              date: eclipseDate,
              description: 'A ' + kindInfo.name.toLowerCase() + ' solar eclipse will occur. ' + kindInfo.description,
              eclipseKind: kind,
              canViewInSky: true,
              objectName: 'Sun'
            })
          }

          // Always move forward to find the next eclipse
          currentDate = new Date(eclipseDate.getTime() + 1 * 24 * 60 * 60 * 1000)
        } else {
          break
        }
      } catch (e) {
        console.debug('No more solar eclipses found:', e.message)
        break
      }
    }

    return events.sort((a, b) => a.date - b.date)
  },

  /**
   * Get historical astronomy events (anniversaries)
   * @param {Date} startDate - Start date
   * @param {Date} endDate - End date
   * @returns {Array} Array of historical events
   */
  getHistoricalEvents (startDate, endDate) {
    const events = []
    const currentYear = new Date().getFullYear()

    // Helper function to check if event falls within date range
    const isInRange = (month, day) => {
      const eventDate = new Date(currentYear, month - 1, day)
      return eventDate >= startDate && eventDate <= endDate
    }

    // Helper to create event object
    const createEvent = (item, type, emoji, category = 'Historical Events') => {
      if (!isInRange(item.month, item.day)) return null

      const eventDate = new Date(currentYear, item.month - 1, item.day, 12, 0, 0)
      const yearsAgo = currentYear - item.year
      const yearsAgoText = yearsAgo > 0 ? ' (' + yearsAgo + ' years ago)' : ''

      return {
        type: type,
        category: category,
        name: item.name,
        emoji: emoji,
        date: eventDate,
        description: item.description + yearsAgoText,
        yearOccurred: item.year,
        yearsAgo: yearsAgo,
        canViewInSky: false
      }
    }

    // Add discoveries
    for (const item of historyData.discoveries) {
      const event = createEvent(item, 'historical_discovery', '🔭')
      if (event) events.push(event)
    }

    // Add space missions
    for (const item of historyData.missions) {
      const event = createEvent(item, 'historical_mission', '🚀')
      if (event) events.push(event)
    }

    // Add astronomer birthdays
    for (const item of historyData.birthdays) {
      const event = createEvent(item, 'astronomer_birthday', '👨‍🔬')
      if (event) events.push(event)
    }

    // Add historical eclipses
    for (const item of historyData.historicalEclipses) {
      const event = createEvent(item, 'historical_eclipse', '🌑')
      if (event) events.push(event)
    }

    // Add institutions
    for (const item of historyData.institutions) {
      const event = createEvent(item, 'historical_institution', '🏛️')
      if (event) events.push(event)
    }

    return events.sort((a, b) => a.date - b.date)
  },

  /**
   * Get all astronomical events for a date range
   * @param {Date} startDate - Start date
   * @param {Date} endDate - End date
   * @param {Object} options - Options for filtering events
   * @returns {Array} Array of all events
   */
  getAllEvents (startDate, endDate, options = {}) {
    const allEvents = []

    // Core events
    if (!options.categories || options.categories.includes('Moon Events')) {
      allEvents.push(...this.getMoonPhases(startDate, endDate))
      allEvents.push(...this.getMoonDistanceEvents(startDate, endDate))
    }

    if (!options.categories || options.categories.includes('Solar Events')) {
      // Get solar events for all years in the range
      const startYear = startDate.getFullYear()
      const endYear = endDate.getFullYear()
      for (let year = startYear; year <= endYear; year++) {
        allEvents.push(...this.getSolarEvents(year))
      }
    }

    if (!options.categories || options.categories.includes('Planetary Events')) {
      allEvents.push(...this.getPlanetaryConjunctions(startDate, endDate))
      allEvents.push(...this.getPlanetaryOppositions(startDate, endDate))
      allEvents.push(...this.getElongations(startDate, endDate))
    }

    if (!options.categories || options.categories.includes('Eclipses')) {
      allEvents.push(...this.getEclipses(startDate, endDate))
    }

    if (!options.categories || options.categories.includes('Historical Events')) {
      allEvents.push(...this.getHistoricalEvents(startDate, endDate))
    }

    // Filter by date range
    const filteredEvents = allEvents.filter(event =>
      event.date >= startDate && event.date <= endDate
    )

    // Sort by date
    return filteredEvents.sort((a, b) => a.date - b.date)
  }
}

export default AstronomyService
