// Stellarium Web - Copyright (c) 2022 - Stellarium Labs SRL
//
// This program is licensed under the terms of the GNU AGPL v3, or
// alternatively under a commercial licence.
//
// The terms of the AGPL v3 license can be found in the main directory of this
// repository.

<template>
  <div class="event-list-item" @click="$emit('click')">
    <div class="event-icon">
      <span class="event-emoji">{{ event.emoji }}</span>
    </div>
    <div class="event-info">
      <div class="event-name">{{ event.name }}</div>
      <div class="event-date">{{ formattedDate }}</div>
      <div class="event-category" :style="{ color: categoryColor }">
        {{ event.category }}
      </div>
    </div>
    <div class="event-action">
      <v-icon color="white">mdi-chevron-right</v-icon>
    </div>
  </div>
</template>

<script>
export default {
  name: 'EventListItem',
  props: {
    event: {
      type: Object,
      required: true
    }
  },
  computed: {
    formattedDate () {
      const date = new Date(this.event.date)
      return date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    },
    categoryColor () {
      const colors = {
        'Moon Events': '#4CAF50',
        'Solar Events': '#FF9800',
        'Planetary Events': '#2196F3',
        Eclipses: '#9C27B0'
      }
      return colors[this.event.category] || '#999'
    }
  }
}
</script>

<style scoped>
.event-list-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.event-list-item:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: translateX(4px);
}

.event-icon {
  flex-shrink: 0;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
}

.event-emoji {
  font-size: 24px;
}

.event-info {
  flex: 1;
}

.event-name {
  color: white;
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 4px;
}

.event-date {
  color: #ccc;
  font-size: 14px;
  margin-bottom: 4px;
}

.event-category {
  font-size: 12px;
  font-weight: 500;
}

.event-action {
  flex-shrink: 0;
}
</style>
