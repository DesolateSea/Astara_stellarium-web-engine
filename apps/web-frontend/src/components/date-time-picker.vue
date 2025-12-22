// Stellarium Web - Copyright (c) 2022 - Stellarium Labs SRL
//
// This program is licensed under the terms of the GNU AGPL v3, or
// alternatively under a commercial licence.
//
// The terms of the AGPL v3 license can be found in the main directory of this
// repository.

<template>
  <v-card class="datetime-picker-card" width="380">
    <v-container class="picker-container">
      <!-- Header with controls -->
      <div class="picker-header">
        <v-row justify="center" no-gutters align="center">
          <v-tooltip top>
            <template v-slot:activator="{ on }">
              <v-btn icon small class="action-btn" @click="resetTime" v-on="on">
                <v-icon small>mdi-history</v-icon>
              </v-btn>
            </template>
            <span>{{ $t('Back to real time') }}</span>
          </v-tooltip>
          <v-tooltip top>
            <template v-slot:activator="{ on }">
              <v-btn icon small class="action-btn" :class="{ 'is-paused': isTimePaused }" @click="togglePauseTime" v-on="on">
                <v-icon small>{{ togglePauseTimeIcon }}</v-icon>
              </v-btn>
            </template>
            <span>{{ $t('Pause/unpause time') }}</span>
          </v-tooltip>
        </v-row>
      </div>

      <!-- Date Wheel Picker -->
      <div class="wheel-section">
        <div class="wheel-container">
          <!-- Month Wheel -->
          <div class="wheel-column">
            <div class="wheel-label">Month</div>
            <div class="wheel-scroll" ref="monthWheel" @scroll="onMonthScroll">
              <div class="wheel-spacer"></div>
              <div
                v-for="m in monthNames"
                :key="m.value"
                class="wheel-item"
                :class="{ 'selected': m.value === currentMonth }"
                @click="setMonth(m.value)"
              >{{ m.label }}</div>
              <div class="wheel-spacer"></div>
            </div>
          </div>

          <!-- Day Wheel -->
          <div class="wheel-column">
            <div class="wheel-label">Day</div>
            <div class="wheel-scroll" ref="dayWheel" @scroll="onDayScroll">
              <div class="wheel-spacer"></div>
              <div
                v-for="d in daysInMonth"
                :key="d"
                class="wheel-item"
                :class="{ 'selected': d === currentDay }"
                @click="setDay(d)"
              >{{ d }}</div>
              <div class="wheel-spacer"></div>
            </div>
          </div>

          <!-- Year Wheel -->
          <div class="wheel-column year-column">
            <div class="wheel-label">Year</div>
            <div class="wheel-scroll" ref="yearWheel" @scroll="onYearScroll">
              <div class="wheel-spacer"></div>
              <div
                v-for="y in yearRange"
                :key="y"
                class="wheel-item"
                :class="{ 'selected': y === currentYear }"
                @click="setYear(y)"
              >{{ y }}</div>
              <div class="wheel-spacer"></div>
            </div>
          </div>
        </div>
        <div class="wheel-highlight"></div>
      </div>

      <!-- Time Wheel Picker -->
      <div class="wheel-section time-section">
        <div class="wheel-container">
          <!-- Hour Wheel -->
          <div class="wheel-column">
            <div class="wheel-label">Hour</div>
            <div class="wheel-scroll" ref="hourWheel" @scroll="onHourScroll">
              <div class="wheel-spacer"></div>
              <div
                v-for="h in 24"
                :key="h - 1"
                class="wheel-item"
                :class="{ 'selected': (h - 1) === currentHour }"
                @click="setHour(h - 1)"
              >{{ String(h - 1).padStart(2, '0') }}</div>
              <div class="wheel-spacer"></div>
            </div>
          </div>

          <span class="time-colon">:</span>

          <!-- Minute Wheel -->
          <div class="wheel-column">
            <div class="wheel-label">Min</div>
            <div class="wheel-scroll" ref="minuteWheel" @scroll="onMinuteScroll">
              <div class="wheel-spacer"></div>
              <div
                v-for="m in 60"
                :key="m - 1"
                class="wheel-item"
                :class="{ 'selected': (m - 1) === currentMinute }"
                @click="setMinute(m - 1)"
              >{{ String(m - 1).padStart(2, '0') }}</div>
              <div class="wheel-spacer"></div>
            </div>
          </div>

          <span class="time-colon">:</span>

          <!-- Second Wheel -->
          <div class="wheel-column">
            <div class="wheel-label">Sec</div>
            <div class="wheel-scroll" ref="secondWheel" @scroll="onSecondScroll">
              <div class="wheel-spacer"></div>
              <div
                v-for="s in 60"
                :key="s - 1"
                class="wheel-item"
                :class="{ 'selected': (s - 1) === currentSecond }"
                @click="setSecond(s - 1)"
              >{{ String(s - 1).padStart(2, '0') }}</div>
              <div class="wheel-spacer"></div>
            </div>
          </div>
        </div>
        <div class="wheel-highlight"></div>
      </div>

      <!-- Sky Brightness Slider -->
      <div class="slider-section">
        <div class="slider-wrapper">
          <input
            type="range"
            min="0"
            max="1439"
            v-model.number="timeMinute"
            class="native-slider"
          />
        </div>
        <div class="sky-status" :class="skyStatusClass">
          <v-icon x-small class="status-icon">{{ skyStatusIcon }}</v-icon>
          <span>{{ sliderHint }}</span>
        </div>
      </div>
    </v-container>
  </v-card>
</template>

<script>

import Moment from 'moment'

export default {
  data: function () {
    return {
      stops: [],
      stopCacheKey: {
        sliderStartTime: undefined,
        location: undefined
      },
      scrollTimeout: null,
      isScrolling: false,
      monthNames: [
        { value: 1, label: 'Jan' },
        { value: 2, label: 'Feb' },
        { value: 3, label: 'Mar' },
        { value: 4, label: 'Apr' },
        { value: 5, label: 'May' },
        { value: 6, label: 'Jun' },
        { value: 7, label: 'Jul' },
        { value: 8, label: 'Aug' },
        { value: 9, label: 'Sep' },
        { value: 10, label: 'Oct' },
        { value: 11, label: 'Nov' },
        { value: 12, label: 'Dec' }
      ]
    }
  },
  props: ['value', 'location'],
  computed: {
    // The MomentJS time in local time
    localTime: {
      get: function () {
        const m = Moment(this.value)
        m.local()
        return m
      },
      set: function (newValue) {
        this.$emit('input', newValue.format())
      }
    },
    currentYear: function () {
      return this.localTime.year()
    },
    currentMonth: function () {
      return this.localTime.month() + 1
    },
    currentDay: function () {
      return this.localTime.date()
    },
    currentHour: function () {
      return this.localTime.hour()
    },
    currentMinute: function () {
      return this.localTime.minute()
    },
    currentSecond: function () {
      return this.localTime.second()
    },
    yearRange: function () {
      const current = this.currentYear
      const years = []
      for (let y = current - 100; y <= current + 100; y++) {
        years.push(y)
      }
      return years
    },
    daysInMonth: function () {
      const days = this.localTime.daysInMonth()
      return Array.from({ length: days }, (_, i) => i + 1)
    },
    time: {
      get: function () {
        return this.localTime.format('HH:mm:ss')
      }
    },
    year: function () {
      return this.localTime.format('YYYY')
    },
    month: function () {
      return this.localTime.format('MM')
    },
    day: function () {
      return this.localTime.format('DD')
    },
    hours: function () {
      return this.localTime.format('HH')
    },
    minutes: function () {
      return this.localTime.format('mm')
    },
    seconds: function () {
      return this.localTime.format('ss')
    },
    date: {
      get: function () {
        return this.localTime.format('YYYY-MM-DD')
      }
    },
    skyStatusClass: function () {
      const hint = this.sliderHint
      if (hint === this.$t('Daylight')) return 'daylight'
      if (hint === this.$t('Dark night')) return 'dark-night'
      if (hint === this.$t('Moonlight')) return 'moonlight'
      if (hint === this.$t('Dawn')) return 'dawn'
      if (hint === this.$t('Twilight')) return 'twilight'
      return ''
    },
    skyStatusIcon: function () {
      const hint = this.sliderHint
      if (hint === this.$t('Daylight')) return 'mdi-white-balance-sunny'
      if (hint === this.$t('Dark night')) return 'mdi-weather-night'
      if (hint === this.$t('Moonlight')) return 'mdi-moon-waning-crescent'
      if (hint === this.$t('Dawn') || hint === this.$t('Twilight')) return 'mdi-weather-sunset'
      return 'mdi-weather-night'
    },
    timeMinute: {
      get: function () {
        // 0 means 12:00, 720 means midnight, 1440 (=24*60) means 12:00 the day after
        const t = this.localTime
        return t.hours() < 12 ? (t.hours() + 12) * 60 + t.minutes() : (t.hours() - 12) * 60 + t.minutes()
      },
      set: function (newValue) {
        var t = Moment(this.sliderStartTime)
        t.add(newValue, 'minutes')
        this.$emit('input', t.format())
      }
    },
    sliderStartTime: function () {
      const t = this.localTime.clone()
      if (t.hours() < 12) {
        t.subtract(1, 'days')
      }
      t.hours(12)
      t.minutes(0)
      t.seconds(0)
      t.milliseconds(0)
      return t
    },
    sliderHint: function () {
      const tm = this.timeMinute
      const stop = this.stops[Math.floor(tm * this.stops.length / 1440)]
      if (!stop) return ''
      if (stop.sunAlt > 0) {
        return this.$t('Daylight')
      }
      if (stop.sunAlt < -16) {
        return stop.moonAlt < 5 ? this.$t('Dark night') : this.$t('Moonlight')
      }
      return tm > 720 ? this.$t('Dawn') : this.$t('Twilight')
    },
    isTimePaused: function () {
      return this.$store.state.stel.time_speed === 0
    },
    togglePauseTimeIcon: function () {
      return this.isTimePaused ? 'mdi-play' : 'mdi-pause'
    }
  },
  methods: {
    resetTime: function () {
      const m = Moment()
      m.local()
      this.$emit('input', m.format())
      this.$nextTick(() => this.scrollToCurrentValues())
    },
    togglePauseTime: function () {
      this.$stel.core.time_speed = (this.$stel.core.time_speed === 0) ? 1 : 0
    },
    setYear: function (year) {
      const t = this.localTime.clone()
      t.year(year)
      this.$emit('input', t.format())
    },
    setMonth: function (month) {
      const t = this.localTime.clone()
      t.month(month - 1)
      this.$emit('input', t.format())
    },
    setDay: function (day) {
      const t = this.localTime.clone()
      t.date(day)
      this.$emit('input', t.format())
    },
    setHour: function (hour) {
      const t = this.localTime.clone()
      t.hour(hour)
      this.$emit('input', t.format())
    },
    setMinute: function (minute) {
      const t = this.localTime.clone()
      t.minute(minute)
      this.$emit('input', t.format())
    },
    setSecond: function (second) {
      const t = this.localTime.clone()
      t.second(second)
      this.$emit('input', t.format())
    },
    scrollToValue: function (el, index, itemHeight) {
      if (el) {
        el.scrollTop = index * itemHeight
      }
    },
    scrollToCurrentValues: function () {
      const itemHeight = 36
      this.$nextTick(() => {
        // Month
        if (this.$refs.monthWheel) {
          this.scrollToValue(this.$refs.monthWheel, this.currentMonth - 1, itemHeight)
        }
        // Day
        if (this.$refs.dayWheel) {
          this.scrollToValue(this.$refs.dayWheel, this.currentDay - 1, itemHeight)
        }
        // Year
        if (this.$refs.yearWheel) {
          this.scrollToValue(this.$refs.yearWheel, 100, itemHeight) // 100 = middle of range
        }
        // Hour
        if (this.$refs.hourWheel) {
          this.scrollToValue(this.$refs.hourWheel, this.currentHour, itemHeight)
        }
        // Minute
        if (this.$refs.minuteWheel) {
          this.scrollToValue(this.$refs.minuteWheel, this.currentMinute, itemHeight)
        }
        // Second
        if (this.$refs.secondWheel) {
          this.scrollToValue(this.$refs.secondWheel, this.currentSecond, itemHeight)
        }
      })
    },
    onMonthScroll: function (e) {
      this.handleScroll(e, 12, (index) => this.setMonth(index + 1))
    },
    onDayScroll: function (e) {
      const days = this.daysInMonth.length
      this.handleScroll(e, days, (index) => this.setDay(index + 1))
    },
    onYearScroll: function (e) {
      this.handleScroll(e, this.yearRange.length, (index) => this.setYear(this.yearRange[index]))
    },
    onHourScroll: function (e) {
      this.handleScroll(e, 24, (index) => this.setHour(index))
    },
    onMinuteScroll: function (e) {
      this.handleScroll(e, 60, (index) => this.setMinute(index))
    },
    onSecondScroll: function (e) {
      this.handleScroll(e, 60, (index) => this.setSecond(index))
    },
    handleScroll: function (e, maxItems, callback) {
      if (this.scrollTimeout) {
        clearTimeout(this.scrollTimeout)
      }
      this.scrollTimeout = setTimeout(() => {
        const itemHeight = 36
        const scrollTop = e.target.scrollTop
        const index = Math.round(scrollTop / itemHeight)
        const clampedIndex = Math.max(0, Math.min(index, maxItems - 1))
        callback(clampedIndex)
        e.target.scrollTop = clampedIndex * itemHeight
      }, 100)
    },
    // 0 means 12:00, 720 means midnight, 1440 (=24*60) means 12:00 the day after
    timeMinuteRangeToUTC: function (tm) {
      return this.sliderStartTime.toDate().getMJD() + tm * 1 / (24 * 60)
    },
    refreshStops: function () {
      if (this.stopCacheKey.sliderStartTime === this.sliderStartTime.format() && this.stopCacheKey.location === JSON.stringify(this.location)) {
        return
      }
      const res = []
      const nbStop = 49
      const obs = this.$stel.core.observer.clone()
      const sun = this.$stel.getObj('NAME Sun')
      const moon = this.$stel.getObj('NAME Moon')
      for (let i = 0; i <= nbStop; ++i) {
        obs.utc = this.timeMinuteRangeToUTC(1440 * i / nbStop)
        const sunAlt = this.$stel.anpm(this.$stel.c2s(this.$stel.convertFrame(obs, 'ICRF', 'OBSERVED', sun.getInfo('radec', obs)))[1]) * 180.0 / Math.PI
        const moonAlt = this.$stel.anpm(this.$stel.c2s(this.$stel.convertFrame(obs, 'ICRF', 'OBSERVED', moon.getInfo('radec', obs)))[1]) * 180.0 / Math.PI
        const brightnessForAltitude = function (sunAlt, moonAlt) {
          const moonBrightness = moonAlt < 0 ? 0 : 2 / 35 * Math.min(20, moonAlt) / 20
          if (sunAlt > 0) return Math.min(10, 1 + sunAlt) + moonBrightness
          if (sunAlt < -16) return moonBrightness
          if (sunAlt < -10) return 1 / 35 * (16 + sunAlt) / 6 + moonBrightness
          return (1 - 1 / 35) * (10 + sunAlt) / 10 + 1 / 35 + moonBrightness
        }
        const brightness = Math.log10(1 + brightnessForAltitude(sunAlt, moonAlt) * 10) / 2
        res.push({
          percent: i / nbStop,
          style: 'stop-color:rgb(64,209,255);stop-opacity:' + brightness,
          sunAlt: sunAlt,
          moonAlt: moonAlt
        })
      }
      obs.destroy()
      this.stopCacheKey.sliderStartTime = this.sliderStartTime.format()
      this.stopCacheKey.location = JSON.stringify(this.location)
      this.stops = res
    }
  },
  mounted: function () {
    this.refreshStops()
    this.$nextTick(() => {
      this.scrollToCurrentValues()
    })
  },
  watch: {
    sliderStartTime: function () {
      this.refreshStops()
    },
    location: function () {
      this.refreshStops()
    }
  }
}
</script>

<style scoped>
.datetime-picker-card {
  background: linear-gradient(145deg, rgba(25, 30, 45, 0.98) 0%, rgba(15, 18, 30, 0.99) 100%) !important;
  border-radius: 16px !important;
  border: 1px solid rgba(64, 209, 255, 0.2);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5), 0 0 40px rgba(64, 209, 255, 0.08) !important;
  overflow: hidden;
}

.picker-container {
  padding: 12px !important;
}

/* Header */
.picker-header {
  background: rgba(64, 209, 255, 0.08);
  border-radius: 10px;
  padding: 6px 12px;
  margin-bottom: 10px;
}

.action-btn {
  background: rgba(64, 209, 255, 0.15) !important;
  border: 1px solid rgba(64, 209, 255, 0.3) !important;
  margin: 0 6px !important;
  width: 32px !important;
  height: 32px !important;
}

.action-btn .v-icon {
  color: #40d1ff !important;
}

.action-btn.is-paused {
  background: rgba(255, 180, 50, 0.2) !important;
  border-color: rgba(255, 180, 50, 0.5) !important;
}

.action-btn.is-paused .v-icon {
  color: #ffb432 !important;
}

/* Wheel Picker Styles */
.wheel-section {
  position: relative;
  background: rgba(0, 0, 0, 0.25);
  border-radius: 12px;
  padding: 8px;
  margin-bottom: 10px;
  border: 1px solid rgba(64, 209, 255, 0.1);
}

.time-section {
  margin-bottom: 10px;
}

.wheel-container {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  gap: 8px;
}

.wheel-column {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 70px;
}

.wheel-column.year-column {
  width: 80px;
}

.wheel-label {
  font-size: 10px;
  color: rgba(64, 209, 255, 0.7);
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 4px;
  font-weight: 500;
}

.wheel-scroll {
  height: 108px;
  overflow-y: auto;
  scroll-snap-type: y mandatory;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.wheel-scroll::-webkit-scrollbar {
  display: none;
}

.wheel-spacer {
  height: 36px;
}

.wheel-item {
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  color: rgba(255, 255, 255, 0.35);
  cursor: pointer;
  scroll-snap-align: center;
  transition: all 0.15s ease;
  font-family: 'Roboto Mono', monospace;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
}

.wheel-item:active {
  background: rgba(64, 209, 255, 0.1);
}

.wheel-item.selected {
  color: #ffffff;
  font-size: 20px;
  font-weight: 500;
  text-shadow: 0 0 10px rgba(64, 209, 255, 0.5);
}

.wheel-highlight {
  position: absolute;
  left: 12px;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  height: 36px;
  background: rgba(64, 209, 255, 0.1);
  border-top: 1px solid rgba(64, 209, 255, 0.3);
  border-bottom: 1px solid rgba(64, 209, 255, 0.3);
  border-radius: 8px;
  pointer-events: none;
  margin-top: 7px;
}

.time-colon {
  font-size: 24px;
  font-weight: 500;
  color: #40d1ff;
  margin-top: 20px;
  animation: blink 1s ease-in-out infinite;
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}

/* Slider Section */
.slider-section {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 12px;
  padding: 12px 12px 8px 12px;
  border: 1px solid rgba(64, 209, 255, 0.1);
}

.slider-wrapper {
  padding: 0 4px;
}

/* Native HTML5 Range Slider - Smooth & Responsive */
.native-slider {
  -webkit-appearance: none;
  appearance: none;
  width: 100%;
  height: 8px;
  border-radius: 4px;
  background: linear-gradient(90deg, rgba(30, 50, 100, 0.8) 0%, rgba(64, 209, 255, 0.4) 50%, rgba(30, 50, 100, 0.8) 100%);
  outline: none;
  margin: 8px 0;
  cursor: pointer;
}

.native-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: radial-gradient(circle, #ffffff 30%, #40d1ff 100%);
  border: 3px solid #ffffff;
  box-shadow: 0 0 15px rgba(64, 209, 255, 0.8), 0 2px 8px rgba(0, 0, 0, 0.4);
  cursor: grab;
}

.native-slider::-webkit-slider-thumb:active {
  cursor: grabbing;
  box-shadow: 0 0 20px rgba(64, 209, 255, 1), 0 2px 10px rgba(0, 0, 0, 0.5);
}

.native-slider::-moz-range-thumb {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: radial-gradient(circle, #ffffff 30%, #40d1ff 100%);
  border: 3px solid #ffffff;
  box-shadow: 0 0 15px rgba(64, 209, 255, 0.8), 0 2px 8px rgba(0, 0, 0, 0.4);
  cursor: grab;
}

.native-slider::-moz-range-thumb:active {
  cursor: grabbing;
}

.native-slider::-moz-range-track {
  background: transparent;
}

/* Sky Status */
.sky-status {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 6px 12px;
  margin-top: 8px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 0.3px;
  background: rgba(64, 209, 255, 0.1);
  border: 1px solid rgba(64, 209, 255, 0.2);
  color: #88ccff;
}

.status-icon {
  margin-right: 6px;
  color: #88ccff !important;
}

.sky-status.daylight {
  background: linear-gradient(135deg, rgba(255, 200, 50, 0.2) 0%, rgba(255, 150, 50, 0.15) 100%);
  border-color: rgba(255, 180, 50, 0.4);
  color: #ffc832;
}

.sky-status.daylight .status-icon {
  color: #ffc832 !important;
}

.sky-status.dark-night {
  background: rgba(30, 50, 100, 0.3);
  border-color: rgba(100, 150, 255, 0.3);
  color: #8fb4ff;
}

.sky-status.dark-night .status-icon {
  color: #8fb4ff !important;
}

.sky-status.moonlight {
  background: rgba(180, 200, 240, 0.15);
  border-color: rgba(200, 220, 255, 0.3);
  color: #d4e4ff;
}

.sky-status.moonlight .status-icon {
  color: #d4e4ff !important;
}

.sky-status.dawn,
.sky-status.twilight {
  background: linear-gradient(135deg, rgba(255, 150, 100, 0.2) 0%, rgba(150, 100, 200, 0.15) 100%);
  border-color: rgba(255, 150, 150, 0.3);
  color: #ffaa88;
}

.sky-status.dawn .status-icon,
.sky-status.twilight .status-icon {
  color: #ffaa88 !important;
}
</style>
