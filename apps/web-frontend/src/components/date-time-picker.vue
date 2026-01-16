```
// Stellarium Web - Copyright (c) 2022 - Stellarium Labs SRL
//
// This program is licensed under the terms of the GNU AGPL v3, or
// alternatively under a commercial licence.
//
// The terms of the AGPL v3 license can be found in the main directory of this
// repository.

<template>
  <v-card
    class="datetime-picker-card"
    width="100%"
    dark
    v-touch="{
      up: () => isExpanded = true,
      down: () => isExpanded = false
    }"
  >
    <!-- Drag Handle -->
    <div class="drag-handle-container" @click="isExpanded = !isExpanded">
      <div class="drag-handle"></div>
    </div>

    <v-container class="picker-container">

      <transition name="fade-transition" mode="out-in">
        <!-- Collapsed View -->
        <div v-if="!isExpanded" key="collapsed" class="collapsed-view">
          <!-- Text Display -->
          <div class="simple-datetime-display">
            {{ collapsedDateTimeString }}
          </div>

          <!-- Simple Controls (Prev, History, Next) -->
          <div class="quick-actions-section compact">
            <div class="action-item" @click.stop="addDay(-1)">
              <v-btn icon large>
                <v-icon>mdi-skip-previous</v-icon>
              </v-btn>
            </div>

            <div class="action-item" @click.stop="resetTime">
              <v-btn icon large class="now-btn">
                <v-icon>mdi-history</v-icon>
              </v-btn>
            </div>

            <div class="action-item" @click.stop="addDay(1)">
              <v-btn icon large>
                <v-icon>mdi-skip-next</v-icon>
              </v-btn>
            </div>
          </div>
        </div>

        <!-- Expanded View -->
        <div v-else key="expanded" class="expanded-view">
          <!-- Date/Time Display with Arrows -->
          <div class="datetime-display-section">
            <!-- Date Group -->
            <div class="datetime-group">
              <!-- Year -->
              <div class="digit-column year-column">
                <v-btn icon max-height="24" @click="addYear(1)">
                  <v-icon small>mdi-menu-up</v-icon>
                </v-btn>
                <div class="digit-value">{{ currentYear }}</div>
                <v-btn icon max-height="24" @click="addYear(-1)">
                  <v-icon small>mdi-menu-down</v-icon>
                </v-btn>
              </div>
              <span class="separator">/</span>
              <!-- Month -->
              <div class="digit-column month-column">
                <v-btn icon max-height="24" @click="addMonth(1)">
                  <v-icon small>mdi-menu-up</v-icon>
                </v-btn>
                <div class="digit-value">{{ currentMonthPadded }}</div>
                <v-btn icon max-height="24" @click="addMonth(-1)">
                  <v-icon small>mdi-menu-down</v-icon>
                </v-btn>
              </div>
              <span class="separator">/</span>
              <!-- Day -->
              <div class="digit-column day-column">
                <v-btn icon max-height="24" @click="addDay(1)">
                  <v-icon small>mdi-menu-up</v-icon>
                </v-btn>
                <div class="digit-value">{{ currentDayPadded }}</div>
                <v-btn icon max-height="24" @click="addDay(-1)">
                  <v-icon small>mdi-menu-down</v-icon>
                </v-btn>
              </div>
            </div>

            <!-- Spacer -->
            <div style="width: 20px;"></div>

            <!-- Time Group -->
            <div class="datetime-group">
              <!-- Hour -->
              <div class="digit-column">
                <v-btn icon max-height="24" @click="addHour(1)">
                  <v-icon small>mdi-menu-up</v-icon>
                </v-btn>
                <div class="digit-value">{{ currentHourPadded }}</div>
                <v-btn icon max-height="24" @click="addHour(-1)">
                  <v-icon small>mdi-menu-down</v-icon>
                </v-btn>
              </div>
              <span class="separator">:</span>
              <!-- Minute -->
              <div class="digit-column">
                <v-btn icon max-height="24" @click="addMinute(1)">
                  <v-icon small>mdi-menu-up</v-icon>
                </v-btn>
                <div class="digit-value">{{ currentMinutePadded }}</div>
                <v-btn icon max-height="24" @click="addMinute(-1)">
                  <v-icon small>mdi-menu-down</v-icon>
                </v-btn>
              </div>
              <span class="separator-seconds">:</span>
              <!-- Second -->
              <div class="digit-column">
                <v-btn icon max-height="24" @click="addSecond(1)">
                  <v-icon small>mdi-menu-up</v-icon>
                </v-btn>
                <div class="digit-value highlight-seconds">{{ currentSecondPadded }}</div>
                <v-btn icon max-height="24" @click="addSecond(-1)">
                  <v-icon small>mdi-menu-down</v-icon>
                </v-btn>
              </div>
            </div>
          </div>

          <!-- Speed Control Section -->
          <div class="speed-control-section">
            <div class="speed-label">{{ speedLabelText }}</div>
            <div class="speed-controls-row">
              <v-btn icon small @click="togglePauseTime">
                 <v-icon>{{ isTimePaused ? 'mdi-play' : 'mdi-pause' }}</v-icon>
              </v-btn>

              <v-slider
                v-model="speedSliderVal"
                :min="-100"
                :max="100"
                track-color="rgba(255,255,255,0.2)"
                thumb-color="#8c9eff"
                hide-details
                class="speed-slider mx-3"
                @change="onSpeedChange"
              ></v-slider>

              <v-btn icon small @click="resetSpeed">
                <v-icon size="20">mdi-refresh</v-icon>
              </v-btn>
            </div>
          </div>

          <v-divider class="my-3" style="border-color: rgba(255,255,255,0.1);"></v-divider>

          <!-- Quick Actions (Expanded) -->
          <div class="quick-actions-section">
            <div class="action-item" @click="addDay(-1)">
              <v-btn icon>
                <v-icon>mdi-skip-previous</v-icon>
              </v-btn>
              <span class="action-label">Previous night</span>
            </div>

            <div class="action-item" @click="resetTime">
              <v-btn icon large class="now-btn">
                <v-icon>mdi-history</v-icon>
              </v-btn>
              <span class="action-label">Set time to now</span>
            </div>

            <div class="action-item" @click="addDay(1)">
              <v-btn icon>
                <v-icon>mdi-skip-next</v-icon>
              </v-btn>
              <span class="action-label">Next night</span>
            </div>
          </div>
        </div>
      </transition>

      <!-- Sky Brightness / Dusk Slider (Shared) -->
      <div class="dusk-slider-section mt-4">
        <div class="slider-wrapper">
          <input
            type="range"
            min="0"
            max="1439"
            v-model.number="timeMinute"
            class="native-slider"
          />
        </div>
        <div class="dusk-label text-center mt-1">
          {{ sliderHint || 'Time' }}
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
      rafId: null,
      speedSliderVal: 0, // Logarithmic or mapped value for slider
      isExpanded: false
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
    collapsedDateTimeString: function () {
      return this.localTime.format('ddd MMM DD YYYY, HH:mm:ss')
    },
    currentYear () { return this.localTime.year() },
    currentMonth () { return this.localTime.month() + 1 },
    currentMonthPadded () { return String(this.currentMonth).padStart(2, '0') },
    currentDay () { return this.localTime.date() },
    currentDayPadded () { return String(this.currentDay).padStart(2, '0') },
    currentHour () { return this.localTime.hour() },
    currentHourPadded () { return String(this.currentHour).padStart(2, '0') },
    currentMinute () { return this.localTime.minute() },
    currentMinutePadded () { return String(this.currentMinute).padStart(2, '0') },
    currentSecond () { return this.localTime.second() },
    currentSecondPadded () { return String(this.currentSecond).padStart(2, '0') },

    isTimePaused: function () {
      return this.$store.state.stel.time_speed === 0
    },
    speedLabelText: function () {
      const speed = this.$store.state.stel.time_speed
      if (Math.abs(speed - 1) < 0.001) {
        return 'Real time'
      }
      if (speed === 0) {
        return 'Paused'
      }
      const formatted = Number.isInteger(speed) ? speed : speed.toFixed(1)
      return formatted + 'x'
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
    }
  },
  methods: {
    addYear (val) { this.updateTime(t => t.add(val, 'years')) },
    addMonth (val) { this.updateTime(t => t.add(val, 'months')) },
    addDay (val) { this.updateTime(t => t.add(val, 'days')) },
    addHour (val) { this.updateTime(t => t.add(val, 'hours')) },
    addMinute (val) { this.updateTime(t => t.add(val, 'minutes')) },
    addSecond (val) { this.updateTime(t => t.add(val, 'seconds')) },

    updateTime (fn) {
      const t = this.localTime.clone()
      fn(t)
      this.$emit('input', t.format())
    },

    resetTime: function () {
      if (this.rafId) cancelAnimationFrame(this.rafId)

      const targetMoment = Moment().local()
      const currentMoment = Moment(this.value).local()

      let startMoment = currentMoment

      if (currentMoment.year() !== targetMoment.year() || currentMoment.month() !== targetMoment.month()) {
        const intermediate = currentMoment.clone()
        intermediate.year(targetMoment.year())
        intermediate.month(targetMoment.month())
        startMoment = intermediate
        this.$emit('input', startMoment.format())
      }

      const startMjd = startMoment.toDate().getMJD()
      const targetMjd = targetMoment.toDate().getMJD()

      const startTime = performance.now()
      const duration = 2500

      const animate = (currentTime) => {
        const elapsed = currentTime - startTime
        const progress = Math.min(elapsed / duration, 1.0)

        const currentMjd = startMjd + (targetMjd - startMjd) * progress

        const d = new Date()
        d.setMJD(currentMjd)
        const m = Moment(d).local()

        this.$emit('input', m.format())

        if (progress < 1.0) {
          this.rafId = requestAnimationFrame(animate)
        } else {
          const finalM = Moment().local()
          this.$emit('input', finalM.format())
          this.rafId = null
          // Also reset speed
          this.resetSpeed()
        }
      }

      this.rafId = requestAnimationFrame(animate)
    },

    togglePauseTime: function () {
      this.$stel.core.time_speed = (this.$stel.core.time_speed === 0) ? 1 : 0
    },

    resetSpeed () {
      this.$stel.core.time_speed = 1
      this.speedSliderVal = 0
    },

    onSpeedChange (val) {
      // Map -100..100 to some time speed
      // Example: 0 -> 1x, 100 -> 1000x?
      // Logarithmic scale might be better
      let speed = 1
      if (val === 0) {
        speed = 1
      } else if (val > 0) {
        speed = Math.pow(10, val / 25) // Max 10^4 = 10000x
      } else {
        speed = -Math.pow(10, Math.abs(val) / 25)
      }
      this.$stel.core.time_speed = speed
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
    // Initialize slider val from current speed?
    // Doing reverse calculation is tricky, so just default to 0 for now.
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
  background: rgba(17, 20, 32, 0.3) !important; /* Made more transparent */
  backdrop-filter: blur(15px); /* Glassmorphism blur */
  border-radius: 24px 24px 0 0 !important;
  overflow: hidden;
  box-shadow: 0 -4px 30px rgba(0,0,0,0.5) !important;
  transition: all 0.3s ease;
}

.picker-container {
  padding: 16px 20px 24px 20px !important;
}

/* Drag Handle */
.drag-handle-container {
  display: flex;
  justify-content: center;
  padding-top: 10px;
  padding-bottom: 5px;
  cursor: pointer;
}
.drag-handle {
  width: 40px;
  height: 4px;
  background: rgba(255,255,255,0.2);
  border-radius: 2px;
}

/* Collapsed View Styles */
.collapsed-view {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
}

.simple-datetime-display {
  font-size: 18px;
  font-weight: 700;
  color: white;
  margin-bottom: 16px;
  letter-spacing: 0.5px;
  text-align: center;
}

.quick-actions-section.compact {
  width: 100%;
  max-width: 300px;
  margin-bottom: 8px; /* Less space in compact */
}

/* Transitions */
.fade-transition-enter-active, .fade-transition-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.fade-transition-enter, .fade-transition-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

/* DateTime Display */
.datetime-display-section {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 24px;
}

.datetime-group {
  display: flex;
  align-items: center;
}

.digit-column {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 40px;
}

.year-column { width: 60px; }
.month-column { width: 40px; }
.day-column { width: 40px; }

.digit-value {
  font-size: 26px;
  font-weight: 700;
  color: #fff;
  line-height: 1.2;
}

.separator {
  font-size: 20px;
  color: rgba(255,255,255,0.4);
  margin: 0 2px;
  margin-bottom: 2px; /* align with text */
}

.separator-seconds {
  font-size: 20px;
  color: rgba(255,255,255,0.4);
  margin: 0 2px;
  margin-bottom: 2px;
}

/* Speed Control */
.speed-control-section {
  background: rgba(255,255,255,0.03);
  border-radius: 16px;
  padding: 12px 16px;
  margin-bottom: 12px;
}

.speed-label {
  text-align: center;
  font-size: 11px;
  color: rgba(255,255,255,0.5);
  margin-bottom: 4px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.speed-controls-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.speed-slider {
  flex: 1;
}

/* Quick Actions */
.quick-actions-section {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 0 10px;
}

.action-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 80px;
  cursor: pointer;
  opacity: 0.8;
  transition: opacity 0.2s;
}

.action-item:hover {
  opacity: 1;
}

.action-label {
  font-size: 10px;
  color: rgba(255,255,255,0.5);
  margin-top: 4px;
  text-align: center;
  line-height: 1.1;
}

.now-btn .v-icon {
  font-size: 28px !important;
}

/* Dusk Slider Customization */
.dusk-slider-section {
  padding: 0 4px;
}

.native-slider {
  -webkit-appearance: none;
  appearance: none;
  width: 100%;
  height: 6px; /* slightly thinner */
  border-radius: 3px;
  background: linear-gradient(90deg, #1b3b5f 0%, #2f618c 50%, #1b3b5f 100%);
  outline: none;
  margin: 8px 0;
  cursor: pointer;
}

.native-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #8c9eff; /* Light purple/blue */
  box-shadow: 0 0 10px rgba(140, 158, 255, 0.5);
  cursor: grab;
  border: 2px solid #fff;
}

.dusk-label {
  color: rgba(255,255,255,0.6);
  font-size: 12px;
}
</style>
```
