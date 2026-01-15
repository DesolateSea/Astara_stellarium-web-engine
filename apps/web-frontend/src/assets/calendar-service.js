// Stellarium Web - Copyright (c) 2022 - Stellarium Labs SRL
//
// This program is licensed under the terms of the GNU AGPL v3, or
// alternatively under a commercial licence.
//
// The terms of the AGPL v3 license can be found in the main directory of this
// repository.

import AstronomyService from './astronomy-service.js'

/**
 * Calendar Service
 * High-level service for managing astronomical calendar events
 * Handles caching, filtering, and coordination
 */

const CalendarService = {
  // Cache for calculated events
  cache: new Map(),

  // Generate a cache key for a date range
  getCacheKey (startDate, endDate, categories) {
    const start = startDate.toISOString().split('T')[0]
    const end = endDate.toISOString().split('T')[0]
    const cats = categories ? categories.sort().join(',') : 'all'
    return start + '_' + end + '_' + cats
  },

  /**
     * Get events for a specific month
     * @param {Number} year - Year
     * @param {Number} month - Month (0-11)
     * @param {Object} options - Filter options
     * @returns {Array} Array of events for the month
     */
  getEventsForMonth (year, month, options = {}) {
    const startDate = new Date(year, month, 1)
    const endDate = new Date(year, month + 1, 0, 23, 59, 59)

    const cacheKey = this.getCacheKey(startDate, endDate, options.categories)

    // Check cache
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)
    }

    // Calculate events
    const events = AstronomyService.getAllEvents(startDate, endDate, options)

    // Cache results
    this.cache.set(cacheKey, events)

    // Limit cache size to prevent memory issues
    if (this.cache.size > 50) {
      const firstKey = this.cache.keys().next().value
      this.cache.delete(firstKey)
    }

    return events
  },

  /**
     * Get events for a date range
     * @param {Date} startDate - Start date
     * @param {Date} endDate - End date
     * @param {Object} options - Filter options
     * @returns {Array} Array of events
     */
  getEventsForRange (startDate, endDate, options = {}) {
    const cacheKey = this.getCacheKey(startDate, endDate, options.categories)

    // Check cache
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)
    }

    // Calculate events
    const events = AstronomyService.getAllEvents(startDate, endDate, options)

    // Cache results
    this.cache.set(cacheKey, events)

    // Limit cache size
    if (this.cache.size > 50) {
      const firstKey = this.cache.keys().next().value
      this.cache.delete(firstKey)
    }

    return events
  },

  /**
     * Get upcoming events from current date
     * @param {Number} count - Number of events to return
     * @param {Object} options - Filter options
     * @returns {Array} Array of upcoming events
     */
  getUpcomingEvents (count = 10, options = {}) {
    const startDate = new Date()
    const endDate = new Date()
    endDate.setFullYear(endDate.getFullYear() + 1) // Look ahead 1 year

    const events = this.getEventsForRange(startDate, endDate, options)
    return events.slice(0, count)
  },

  /**
     * Get events for today
     * @param {Object} options - Filter options
     * @returns {Array} Array of today's events
     */
  getTodayEvents (options = {}) {
    const today = new Date()
    const startDate = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    const endDate = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59)

    return this.getEventsForRange(startDate, endDate, options)
  },

  /**
     * Search events by name or description
     * @param {String} query - Search query
     * @param {Date} startDate - Start date for search
     * @param {Date} endDate - End date for search
     * @returns {Array} Array of matching events
     */
  searchEvents (query, startDate, endDate) {
    const events = this.getEventsForRange(startDate, endDate)
    const lowerQuery = query.toLowerCase()

    return events.filter(event =>
      event.name.toLowerCase().includes(lowerQuery) ||
      event.description.toLowerCase().includes(lowerQuery) ||
      event.category.toLowerCase().includes(lowerQuery)
    )
  },

  /**
     * Group events by date
     * @param {Array} events - Array of events
     * @returns {Object} Events grouped by date string
     */
  groupEventsByDate (events) {
    const grouped = {}

    events.forEach(event => {
      const dateKey = event.date.toISOString().split('T')[0]
      if (!grouped[dateKey]) {
        grouped[dateKey] = []
      }
      grouped[dateKey].push(event)
    })

    return grouped
  },

  /**
     * Get event categories
     * @returns {Array} Array of event categories
     */
  getCategories () {
    return [
      'Moon Events',
      'Solar Events',
      'Planetary Events',
      'Eclipses',
      'Historical Events'
    ]
  },

  /**
     * Clear the event cache
     */
  clearCache () {
    this.cache.clear()
  },

  /**
     * Format event time for display
     * @param {Date} date - Event date
     * @param {Object} location - Observer location (for timezone)
     * @returns {String} Formatted time string
     */
  formatEventTime (date, location) {
    // Format in local time
    const options = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short'
    }

    return date.toLocaleString(undefined, options)
  },

  /**
     * Check if an event is happening soon
     * @param {Object} event - Event object
     * @param {Number} hoursThreshold - Hours threshold (default 24)
     * @returns {Boolean} True if event is within threshold
     */
  isEventSoon (event, hoursThreshold = 24) {
    const now = new Date()
    const timeDiff = event.date - now
    const hoursDiff = timeDiff / (1000 * 60 * 60)

    return hoursDiff > 0 && hoursDiff <= hoursThreshold
  },

  /**
     * Get next occurrence of a specific event type
     * @param {String} eventType - Type of event to find
     * @param {Date} fromDate - Start searching from this date
     * @returns {Object|null} Next event or null if not found
     */
  getNextOccurrence (eventType, fromDate = new Date()) {
    const endDate = new Date(fromDate)
    endDate.setFullYear(endDate.getFullYear() + 2) // Look ahead 2 years

    const events = this.getEventsForRange(fromDate, endDate)
    return events.find(event => event.type === eventType) || null
  }
}

export default CalendarService
