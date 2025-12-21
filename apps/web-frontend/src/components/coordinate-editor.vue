<template>
  <div class="coordinate-editor">
    <div class="editor-header">
      <v-btn icon @click="$emit('back')" class="back-btn">
        <v-icon>mdi-arrow-left</v-icon>
      </v-btn>
      <span class="editor-title text-capitalize">{{ type }}</span>
      <v-spacer></v-spacer>
      <v-btn text color="primary" @click="$emit('back')">Done</v-btn>
    </div>

    <div class="editor-body">
      <div class="stepper-container">
        <!-- Degrees -->
        <div class="stepper-group">
          <v-btn icon small @click="changeValue('deg', 1)" class="stepper-arrow"><v-icon>mdi-chevron-up</v-icon></v-btn>
          <div class="value-display" @click="focusInput('deg')">
            <input ref="degInput" v-model.number="deg" type="number" class="stepper-input" @blur="onBlur" @input="clampInput('deg')" />
            <span class="unit">°</span>
          </div>
          <v-btn icon small @click="changeValue('deg', -1)" class="stepper-arrow"><v-icon>mdi-chevron-down</v-icon></v-btn>
        </div>

        <!-- Minutes -->
        <div class="stepper-group">
          <v-btn icon small @click="changeValue('min', 1)" class="stepper-arrow"><v-icon>mdi-chevron-up</v-icon></v-btn>
          <div class="value-display" @click="focusInput('min')">
            <input ref="minInput" v-model.number="min" type="number" class="stepper-input" @blur="onBlur" @input="clampInput('min')" />
            <span class="unit">'</span>
          </div>
          <v-btn icon small @click="changeValue('min', -1)" class="stepper-arrow"><v-icon>mdi-chevron-down</v-icon></v-btn>
        </div>

        <!-- Seconds -->
        <div class="stepper-group">
          <v-btn icon small @click="changeValue('sec', 1)" class="stepper-arrow"><v-icon>mdi-chevron-up</v-icon></v-btn>
          <div class="value-display" @click="focusInput('sec')">
            <input ref="secInput" v-model.number="sec" type="number" class="stepper-input" @blur="onBlur" @input="clampInput('sec')" />
            <span class="unit">"</span>
          </div>
          <v-btn icon small @click="changeValue('sec', -1)" class="stepper-arrow"><v-icon>mdi-chevron-down</v-icon></v-btn>
        </div>

        <!-- Hemisphere Toggle -->
        <div class="stepper-group">
          <v-btn icon small @click="toggleHemisphere" class="stepper-arrow"><v-icon>mdi-chevron-up</v-icon></v-btn>
          <div class="value-display hemisphere" @click="toggleHemisphere">
            {{ hemisphere }}
          </div>
          <v-btn icon small @click="toggleHemisphere" class="stepper-arrow"><v-icon>mdi-chevron-down</v-icon></v-btn>
        </div>
      </div>

      <!-- Slider for coarse adjustment -->
      <div class="slider-wrapper">
        <v-slider
          v-model="sliderValue"
          :min="minVal"
          :max="maxVal"
          :step="0.0001"
          hide-details
          class="coord-slider"
        ></v-slider>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    type: String, // 'latitude' or 'longitude'
    value: Number // Decimal value
  },
  data () {
    return {
      deg: 0,
      min: 0,
      sec: 0,
      isPositive: true
    }
  },
  computed: {
    hemisphere () {
      if (this.type === 'latitude') {
        return this.isPositive ? 'N' : 'S'
      } else {
        return this.isPositive ? 'E' : 'W'
      }
    },
    sliderValue: {
      get () {
        return (this.deg + this.min / 60 + this.sec / 3600) * (this.isPositive ? 1 : -1)
      },
      set (v) {
        this.updateFromDecimal(v)
      }
    },
    minVal () {
      return this.type === 'latitude' ? -90 : -180
    },
    maxVal () {
      return this.type === 'latitude' ? 90 : 180
    }
  },
  watch: {
    value: {
      immediate: true,
      handler (val) {
        this.updateFromDecimal(val)
      }
    }
  },
  methods: {
    changeValue (unit, delta) {
      if (unit === 'deg') this.deg += delta
      if (unit === 'min') this.min += delta
      if (unit === 'sec') this.sec += delta
      this.normalize()
      this.emitChange()
    },
    toggleHemisphere () {
      this.isPositive = !this.isPositive
      this.emitChange()
    },
    updateFromDecimal (v) {
      if (v === null || typeof v === 'undefined') return
      this.isPositive = v >= 0
      const absV = Math.abs(v)
      this.deg = Math.floor(absV)
      this.min = Math.floor((absV - this.deg) * 60)
      this.sec = Math.round((absV - this.deg - this.min / 60) * 3600)
      this.normalize()
    },
    clampInput (unit) {
      if (unit === 'deg') {
        const maxDeg = this.type === 'latitude' ? 90 : 180
        if (this.deg > maxDeg) this.deg = maxDeg
        if (this.deg < 0) this.deg = 0
      } else {
        if (this.min > 59) this.min = 59
        if (this.min < 0) this.min = 0
        if (this.sec > 59) this.sec = 59
        if (this.sec < 0) this.sec = 0
      }
    },
    normalize () {
      if (this.sec >= 60) { this.sec = 0; this.min++ }
      if (this.sec < 0) { this.sec = 59; this.min-- }
      if (this.min >= 60) { this.min = 0; this.deg++ }
      if (this.min < 0) { this.min = 59; this.deg-- }

      const maxDeg = this.type === 'latitude' ? 90 : 180
      if (this.deg > maxDeg) this.deg = maxDeg
      if (this.deg < 0) this.deg = 0
    },
    focusInput (unit) {
      this.$refs[unit + 'Input'].focus()
    },
    onBlur () {
      this.normalize()
      this.emitChange()
    },
    emitChange () {
      const decimal = (this.deg + this.min / 60 + this.sec / 3600) * (this.isPositive ? 1 : -1)
      this.$emit('input', decimal)
    }
  }
}
</script>

<style scoped>
.coordinate-editor {
  background: rgba(30, 30, 30, 0.98);
  min-height: 200px;
}

.editor-header {
  display: flex;
  align-items: center;
  padding: 16px 8px;
  background: rgba(40, 40, 40, 0.95);
}

.editor-title {
  color: white;
  font-size: 18px;
  font-weight: 500;
  margin-left: 16px;
}

.slider-wrapper {
  padding: 0 40px 40px 40px;
}

.coord-slider {
  margin-top: 20px;
}

.stepper-container {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 12px;
  padding: 40px 16px;
}

.stepper-group {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stepper-arrow {
  color: rgba(255, 255, 255, 0.6) !important;
}

.value-display {
  display: flex;
  align-items: flex-end;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  padding: 8px 4px;
  min-width: 60px;
  justify-content: center;
  position: relative;
}

.value-display.hemisphere {
  font-size: 28px;
  font-weight: 600;
  color: white;
  min-width: 50px;
  cursor: pointer;
}

.stepper-input {
  background: transparent;
  border: none;
  color: white;
  font-size: 28px;
  font-weight: 600;
  width: 100%;
  text-align: center;
  outline: none;
  appearance: textfield;
  -moz-appearance: textfield;
}

.stepper-input::-webkit-outer-spin-button,
.stepper-input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.unit {
  color: rgba(255, 255, 255, 0.4);
  font-size: 16px;
  margin-left: -4px;
  margin-bottom: 6px;
}
</style>
