// Stellarium Web - Copyright (c) 2022 - Stellarium Labs SRL
//
// This program is licensed under the terms of the GNU AGPL v3, or
// alternatively under a commercial licence.
//
// The terms of the AGPL v3 license can be found in the main directory of this
// repository.

<template>
  <div>
    <transition name="slide-up">
    <div class="calendar-overlay" v-if="$store.state.showCalendarPanel" @click.self="close">
      <div class="calendar-panel">
        <!-- Header -->
        <div class="calendar-header">
          <div class="header-title">
            <v-icon>mdi-calendar-star</v-icon>
            <span>Astronomical Calendar</span>
          </div>
          <v-btn icon large @click="close">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </div>

        <!-- Controls -->
        <div class="calendar-controls">
          <!-- Month Navigation -->
          <div class="month-navigation">
            <v-btn icon large @click="previousMonth">
              <v-icon>mdi-chevron-left</v-icon>
            </v-btn>
            <div class="month-display" @click="goToToday">
              <span class="month-name">{{ currentMonthName }} {{ currentYear }}</span>
              <span class="today-hint" v-if="!isCurrentMonth">Tap for today</span>
            </div>
            <v-btn icon large @click="nextMonth">
              <v-icon>mdi-chevron-right</v-icon>
            </v-btn>
          </div>

          <!-- View Toggle -->
          <div class="view-toggle">
            <v-btn-toggle v-model="viewMode" mandatory dense>
              <v-btn small value="list">
                <v-icon small>mdi-format-list-bulleted</v-icon>
                <span class="ml-1">List</span>
              </v-btn>
              <v-btn small value="grid">
                <v-icon small>mdi-calendar-month</v-icon>
                <span class="ml-1">Grid</span>
              </v-btn>
            </v-btn-toggle>
          </div>
        </div>

        <!-- Content Area -->
        <div class="calendar-content" v-if="!loading">
          <!-- List View -->
          <div v-if="viewMode === 'list'" class="event-list">
            <div v-if="filteredEvents.length === 0" class="no-events">
              <v-icon size="48" color="grey">mdi-calendar-blank</v-icon>
              <p>No events found for this month</p>
            </div>
            <event-list-item
              v-for="(event, index) in filteredEvents"
              :key="index"
              :event="event"
              @click="selectEvent(event)"
            />
          </div>

          <!-- Grid View -->
          <div v-else class="calendar-grid">
            <div class="weekday-headers">
              <div v-for="day in weekdays" :key="day" class="weekday-header">{{ day }}</div>
            </div>
            <div class="calendar-days">
              <div
                v-for="(day, index) in calendarDays"
                :key="index"
                :class="['calendar-day', {
                  'other-month': !day.isCurrentMonth,
                  'today': day.isToday,
                  'has-events': day.events.length > 0
                }]"
                @click="selectDay(day)"
              >
                <span class="day-number">{{ day.date.getDate() }}</span>
                <div class="day-events">
                  <span
                    v-for="(event, i) in day.events.slice(0, 3)"
                    :key="i"
                    class="event-dot"
                    :style="{ backgroundColor: categoryColors[event.category] }"
                    :title="event.name"
                  ></span>
                  <span v-if="day.events.length > 3" class="more-events">+{{ day.events.length - 3 }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Loading State -->
        <div v-else class="loading-state">
          <v-progress-circular indeterminate color="primary"></v-progress-circular>
          <p>Calculating astronomical events...</p>
        </div>
      </div>
    </div>
    </transition>

    <!-- Event Detail Dialog - Rendered outside calendar panel to avoid z-index stacking issues -->
    <event-detail-dialog
      v-if="selectedEvent"
      :event="selectedEvent"
      @close="selectedEvent = null"
      @viewInSky="viewEventInSky"
    />
  </div>
</template>

<script>
import CalendarService from '@/assets/calendar-service.js'
import EventListItem from './event-list-item.vue'
import EventDetailDialog from './event-detail-dialog.vue'

export default {
  name: 'CalendarPanel',
  components: {
    EventListItem,
    EventDetailDialog
  },
  data () {
    return {
      loading: false,
      selectedEvent: null,
      weekdays: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
      categoryColors: {
        'Moon Events': '#4CAF50',
        'Solar Events': '#FF9800',
        'Planetary Events': '#2196F3',
        Eclipses: '#9C27B0',
        'Historical Events': '#FFC107'
      }
    }
  },
  computed: {
    currentMonth () {
      return this.$store.state.calendarCurrentMonth
    },
    currentYear () {
      return this.$store.state.calendarCurrentYear
    },
    currentMonthName () {
      const date = new Date(this.currentYear, this.currentMonth, 1)
      return date.toLocaleDateString('en-US', { month: 'long' })
    },
    isCurrentMonth () {
      const now = new Date()
      return this.currentMonth === now.getMonth() && this.currentYear === now.getFullYear()
    },
    viewMode: {
      get () {
        return this.$store.state.calendarView
      },
      set (value) {
        this.$store.commit('setCalendarView', value)
      }
    },
    categories () {
      return CalendarService.getCategories()
    },
    events () {
      return this.$store.state.calendarEvents
    },
    filteredEvents () {
      const filters = this.$store.state.calendarFilters
      return this.events.filter(event => filters[event.category])
    },
    calendarDays () {
      const days = []
      const firstDay = new Date(this.currentYear, this.currentMonth, 1)
      const lastDay = new Date(this.currentYear, this.currentMonth + 1, 0)
      const today = new Date()

      // Previous month days
      const firstDayOfWeek = firstDay.getDay()
      for (let i = firstDayOfWeek - 1; i >= 0; i--) {
        const date = new Date(firstDay)
        date.setDate(date.getDate() - i - 1)
        days.push({
          date,
          isCurrentMonth: false,
          isToday: this.isSameDay(date, today),
          events: this.getEventsForDate(date)
        })
      }

      // Current month days
      for (let i = 1; i <= lastDay.getDate(); i++) {
        const date = new Date(this.currentYear, this.currentMonth, i)
        days.push({
          date,
          isCurrentMonth: true,
          isToday: this.isSameDay(date, today),
          events: this.getEventsForDate(date)
        })
      }

      // Next month days
      const remaining = 42 - days.length // 6 weeks * 7 days
      for (let i = 1; i <= remaining; i++) {
        const date = new Date(this.currentYear, this.currentMonth + 1, i)
        days.push({
          date,
          isCurrentMonth: false,
          isToday: this.isSameDay(date, today),
          events: this.getEventsForDate(date)
        })
      }

      return days
    }
  },
  watch: {
    '$store.state.showCalendarPanel' (newVal) {
      if (newVal) {
        this.loadEvents()
      }
    },
    currentMonth () {
      this.loadEvents()
    },
    currentYear () {
      this.loadEvents()
    }
  },
  methods: {
    close () {
      this.$store.commit('setShowCalendarPanel', false)
    },
    previousMonth () {
      let month = this.currentMonth - 1
      let year = this.currentYear
      if (month < 0) {
        month = 11
        year--
      }
      this.$store.commit('setCalendarMonth', { month, year })
    },
    nextMonth () {
      let month = this.currentMonth + 1
      let year = this.currentYear
      if (month > 11) {
        month = 0
        year++
      }
      this.$store.commit('setCalendarMonth', { month, year })
    },
    goToToday () {
      const now = new Date()
      this.$store.commit('setCalendarMonth', {
        month: now.getMonth(),
        year: now.getFullYear()
      })
    },
    toggleFilter (category) {
      this.$store.commit('toggleCalendarFilter', category)
    },
    loadEvents () {
      this.loading = true
      try {
        // Always calculate all events regardless of filters
        // Filters are applied at display time only
        const events = CalendarService.getEventsForMonth(
          this.currentYear,
          this.currentMonth,
          { categories: null } // Get all categories
        )

        this.$store.commit('setCalendarEvents', events)
      } catch (e) {
        console.error('Error loading calendar events:', e)
      } finally {
        this.loading = false
      }
    },
    selectEvent (event) {
      this.selectedEvent = event
    },
    selectDay (day) {
      if (day.events.length > 0) {
        this.selectedEvent = day.events[0]
      }
    },
    getEventsForDate (date) {
      const filters = this.$store.state.calendarFilters
      return this.events.filter(event => {
        const eventDate = new Date(event.date)
        return this.isSameDay(eventDate, date) && filters[event.category]
      })
    },
    isSameDay (date1, date2) {
      return date1.getDate() === date2.getDate() &&
        date1.getMonth() === date2.getMonth() &&
        date1.getFullYear() === date2.getFullYear()
    },
    viewEventInSky (event) {
      // Point Stellarium at the event's object

      if (!event.canViewInSky) {
        console.warn('Event cannot be viewed in sky')
        return
      }

      if (!event.objectName) {
        console.warn('Event has no objectName')
        return
      }

      if (!this.$stel) {
        console.error('$stel is not available')
        return
      }

      try {
        // Try multiple lookup strategies like other components do
        const obj = this.$stel.getObj('NAME ' + event.objectName) || this.$stel.getObj(event.objectName)

        if (obj) {
          // Convert Date to MJD (Modified Julian Date)
          // MJD = (milliseconds / 86400000) + 2440587.5 - 2400000.5
          const dateMs = event.date.getTime()
          const jd = (dateMs / 86400000) + 2440587.5
          const mjd = jd - 2400000.5

          // Set the time to the event time
          this.$stel.core.observer.utc = mjd

          // Point at the object
          this.$stel.core.selection = obj
          this.$stel.pointAndLock(obj)

          // Close calendar
          this.close()
        } else {
          console.warn('Object not found:', event.objectName)
        }
      } catch (error) {
        console.error('Error in viewEventInSky:', error)
      }
    }
  },
  mounted () {
    if (this.$store.state.showCalendarPanel) {
      this.loadEvents()
    }
  }
}
</script>

<style scoped>
.calendar-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.5);
  z-index: 200;
  padding: 16px;
}

.calendar-panel {
  background: #1e1e1e;
  border-radius: 16px;
  width: 100%;
  max-width: 900px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.8);
}

.calendar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.header-title {
  display: flex;
  align-items: center;
  gap: 12px;
  color: white;
  font-size: 18px;
  font-weight: 600;
}

.calendar-controls {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 24px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.month-navigation {
  display: flex;
  align-items: center;
  gap: 8px;
}

.month-display {
  min-width: 200px;
  text-align: center;
  cursor: pointer;
}

.month-name {
  color: white;
  font-size: 18px;
  font-weight: 500;
  display: block;
}

.today-hint {
  color: #2196F3;
  font-size: 11px;
  display: block;
  margin-top: 2px;
}

.calendar-filters {
  padding: 12px 24px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  flex-wrap: wrap;
}

.calendar-content {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}

.event-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.no-events {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 24px;
  color: #999;
}

.no-events p {
  margin-top: 16px;
  font-size: 16px;
}

.calendar-grid {
  color: white;
  width: 100%;
  max-width: 100%;
  overflow: hidden;
}

.weekday-headers {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  gap: 4px;
  margin-bottom: 8px;
}

.weekday-header {
  text-align: center;
  font-weight: 600;
  color: #999;
  font-size: 14px;
  padding: 8px;
}

.calendar-days {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  gap: 4px;
}

.calendar-day {
  aspect-ratio: 1;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 8px 6px;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
  min-height: 50px;
  max-width: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.calendar-day:hover {
  background-color: rgba(255, 255, 255, 0.05);
  transform: scale(1.02);
}

.calendar-day.other-month {
  opacity: 0.3;
}

.calendar-day.today {
  border-color: #2196F3;
  background-color: rgba(33, 150, 243, 0.1);
}

.calendar-day.has-events .day-number {
  font-weight: 600;
}

.day-number {
  font-size: 14px;
  color: white;
}

.day-events {
  display: flex;
  gap: 4px;
  margin-top: 4px;
  flex-wrap: wrap;
}

.event-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
}

.more-events {
  font-size: 10px;
  color: #999;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 24px;
  color: white;
}

.loading-state p {
  margin-top: 16px;
}

/* Slide up animation */
.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.3s ease;
}

.slide-up-enter,
.slide-up-leave-to {
  opacity: 0;
  transform: translateY(20px);
}

/* Mobile responsiveness */
@media (max-width: 600px) {
  .calendar-overlay {
    padding: 0;
  }

  .calendar-panel {
    max-height: 100vh;
    border-radius: 0;
  }

  .calendar-header {
    padding: 16px;
  }

  .header-title {
    font-size: 16px;
  }

  .calendar-controls {
    flex-direction: column;
    gap: 16px;
    padding: 16px;
  }

  .month-navigation {
    width: 100%;
  }

  .view-toggle {
    width: 100%;
  }

  .view-toggle .v-btn-toggle {
    width: 100%;
  }

  .calendar-filters {
    padding: 12px 16px;
  }

  .calendar-content {
    padding: 16px;
  }

  .event-list {
    gap: 12px;
  }

  .calendar-day {
    padding: 8px 4px;
    min-height: 50px;
  }

  .day-number {
    font-size: 13px;
  }

  .weekday-header {
    font-size: 12px;
    padding: 6px 4px;
  }

  .month-name {
    font-size: 16px;
  }
}
</style>
