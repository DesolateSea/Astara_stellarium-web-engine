// Stellarium Web - Copyright (c) 2022 - Stellarium Labs SRL
//
// This program is licensed under the terms of the GNU AGPL v3, or
// alternatively under a commercial licence.
//
// The terms of the AGPL v3 license can be found in the main directory of this
// repository.

<template>
  <v-dialog v-model="show" max-width="500" @click:outside="close" :z-index="1200">
    <v-card dark>
      <v-card-title class="event-detail-header">
        <span class="event-emoji-large">{{ event.emoji }}</span>
        <div class="event-title-text">
          <h3>{{ event.name }}</h3>
          <span class="event-category-badge" :style="{ backgroundColor: categoryColor }">
            {{ event.category }}
          </span>
        </div>
        <v-spacer></v-spacer>

      </v-card-title>

      <v-card-text class="event-detail-content">
        <!-- Date and Time -->
        <div class="detail-section">
          <div class="detail-label">
            <v-icon small>mdi-clock-outline</v-icon>
            <span>Date & Time</span>
          </div>
          <div class="detail-value">{{ formattedDateTime }}</div>
        </div>

        <!-- Description -->
        <div class="detail-section">
          <div class="detail-label">
            <v-icon small>mdi-information-outline</v-icon>
            <span>Description</span>
          </div>
          <div class="detail-value">{{ event.description }}</div>
        </div>

        <!-- Additional Info -->
        <div class="detail-section" v-if="additionalInfo">
          <div class="detail-label">
            <v-icon small>mdi-star-outline</v-icon>
            <span>Details</span>
          </div>
          <div class="detail-value">{{ additionalInfo }}</div>
        </div>
      </v-card-text>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn text @click="close">Close</v-btn>
        <v-tooltip top v-if="event.canViewInSky">
          <template v-slot:activator="{ on, attrs }">
            <v-btn
              color="primary"
              @click="viewInSky"
              v-bind="attrs"
              v-on="on"
            >
              <v-icon left>mdi-crosshairs-gps</v-icon>
              View in Sky
            </v-btn>
          </template>
          <span>Jump to {{ event.objectName }} in the sky at this event's time</span>
        </v-tooltip>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  name: 'EventDetailDialog',
  props: {
    event: {
      type: Object,
      required: true
    }
  },
  data () {
    return {
      show: true
    }
  },
  computed: {
    formattedDateTime () {
      const date = new Date(this.event.date)
      return date.toLocaleString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZoneName: 'short'
      })
    },
    categoryColor () {
      const colors = {
        'Moon Events': '#4CAF50',
        'Solar Events': '#FF9800',
        'Planetary Events': '#2196F3',
        Eclipses: '#9C27B0',
        'Historical Events': '#FFC107'
      }
      return colors[this.event.category] || '#999'
    },
    additionalInfo () {
      const info = []

      if (this.event.distance) {
        info.push('Distance: ' + this.event.distance.toFixed(0) + ' km')
      }

      if (this.event.elongation) {
        info.push('Elongation: ' + Math.abs(this.event.elongation).toFixed(1) + '°')
      }

      if (this.event.visibility) {
        info.push('Best seen: ' + this.event.visibility + ' sky')
      }

      if (this.event.bodies && this.event.bodies.length > 0) {
        info.push('Involving: ' + this.event.bodies.join(' and '))
      }

      return info.length > 0 ? info.join(' • ') : null
    }
  },
  methods: {
    close () {
      this.show = false
      this.$emit('close')
    },
    viewInSky () {
      this.$emit('viewInSky', this.event)
    }
  }
}
</script>

<style scoped>

.event-detail-header {
  background: linear-gradient(135deg, rgba(33, 150, 243, 0.2) 0%, rgba(156, 39, 176, 0.2) 100%);
  padding: 24px !important;
  gap: 16px;
}

.event-emoji-large {
  font-size: 48px;
  line-height: 1;
}

.event-title-text h3 {
  font-size: 20px;
  font-weight: 600;
  margin: 0 0 8px 0;
}

.event-category-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  color: white;
}

.event-detail-content {
  padding: 24px !important;
}

.detail-section {
  margin-bottom: 20px;
}

.detail-section:last-child {
  margin-bottom: 0;
}

.detail-label {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #999;
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 8px;
}

.detail-value {
  color: white;
  font-size: 16px;
  line-height: 1.5;
}
</style>

<style>

</style>
