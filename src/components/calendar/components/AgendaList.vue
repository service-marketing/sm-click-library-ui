<template>
  <section class="agenda-section">
    <div v-if="days.length === 0" class="empty-state">
      Sem eventos neste mes.
    </div>
    <ul v-else class="day-list">
      <li v-for="d in days" :key="d.key" class="day-item border-base-200">
        <div class="date-trail">
          <div class="weekday-short">
            {{ weekdayShort(d.date) }}
          </div>
          <div class="date-pill bg-base-200 border border-base-300">
            <div class="date-pill-month">{{ monthShort(d.date) }}</div>
            <div class="date-pill-day">{{ d.date.getDate() }}</div>
            <div
              :style="{ background: getEventColor(leadEvent(d) || {}) }"
              class="date-pill-dot"
            ></div>
          </div>
        </div>

        <div class="content-col">
          <div class="day-header">
            <h3 class="agenda-title">
              {{ weekdayLong(d.date).toUpperCase() }} {{ d.date.getDate() }}
            </h3>
            <div class="month-header-text">
              {{ monthLabelOf(d.date).toUpperCase() }} {{ year }}
            </div>
          </div>

          <ul class="events-list">
            <li
              v-for="item in displayItems(d)"
              :key="itemRenderKey(item)"
              class="event-item border border-base-100 bg-base-200 hover:bg-base-100"
            >
              <RecurringGroupItem
                v-if="item?.kind === 'recurring-group'"
                :group="item"
                mode="agenda"
                @open-message="$emit('open-message', $event)"
                @open-chat="$emit('open-chat', $event)"
                @delete-message="$emit('delete-message', $event)"
                @edit-reminder="$emit('edit-reminder', $event)"
              />
              <EventItem
                v-else
                :ev="item"
                mode="agenda"
                @open-message="$emit('open-message', $event)"
                @open-chat="$emit('open-chat', $event)"
                @delete-message="$emit('delete-message', $event)"
                @edit-reminder="$emit('edit-reminder', $event)"
              />
            </li>
          </ul>
        </div>
      </li>
    </ul>
  </section>
</template>

<script setup>
import EventItem from "./EventItem.vue";
import RecurringGroupItem from "./RecurringGroupItem.vue";
import { getEventColor } from "../utils/eventColors";

defineEmits([
  "open-chat",
  "open-message",
  "delete-message",
  "edit-reminder",
]);

defineProps({
  days: { type: Array, default: () => [] },
  weekdayLong: Function,
  weekdayShort: Function,
  monthShort: Function,
  monthLabelOf: Function,
  year: Number,
});

function leadEvent(day) {
  return day?.leadEvent || day?.recurringGroups?.[0]?.representative || day?.singles?.[0] || null;
}

function itemRenderKey(item) {
  return String(item?.key || item?.id || item?.sourceId || "");
}

function displayItems(day) {
  return day?.visualEntries || [];
}
</script>

<style scoped>
:global(:root) {
  --neo-muted: #7ecdc2;
  --agenda-title: #68c3ba;
  --agenda-glow: rgba(31, 227, 158, 0.25);
  --pill-fg: #d0fff6;
  --btn-primary: #3b82f6;
  --btn-chat: rgba(16, 185, 129, 0.9);
  --btn-chat-hover: #10b981;
}

:global(.dark) {
  --neo-muted: #6b8c8a;
  --agenda-title: #0ea5a4;
  --agenda-glow: rgba(31, 227, 158, 0.25);
  --pill-fg: #0f766e;
  --btn-primary: #2563eb;
  --btn-chat: rgba(16, 185, 129, 0.9);
  --btn-chat-hover: #10b981;
}

.agenda-section {
  position: relative;
  z-index: 10;
  padding-left: 0.5rem;
  padding-right: 0.5rem;
  flex: 1 1 auto;
  overflow: auto;
}
.empty-state {
  padding: 1.5rem 0.75rem;
  font-size: 0.875rem;
  opacity: 0.7;
}

.day-list {
  display: flex;
  flex-direction: column;
}
.day-item {
  display: grid;
  grid-template-columns: 56px 1fr;
  gap: 0.75rem;
  padding-top: 0.5rem;
  padding-bottom: 0.75rem;
  align-items: center;
  background: transparent;
  border-bottom-width: 1px;
}
.day-item:last-child {
  border-bottom-width: 0;
}

.date-trail {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.weekday-short {
  width: 2.5rem;
  text-align: center;
  font-size: 10px;
  letter-spacing: 0.1em;
  color: var(--neo-muted);
}

.date-pill {
  border-radius: 0.75rem;
  padding: 0.25rem 0.5rem;
  text-align: center;
  color: var(--pill-fg);
  box-shadow:
    inset 0 0 0 1px rgba(31, 227, 158, 0.15),
    0 0 12px rgba(31, 227, 158, 0.12);
}
.date-pill-month {
  font-size: 10px;
  line-height: 1;
}
.date-pill-day {
  font-size: 1rem;
  font-weight: 600;
  line-height: 1;
}
.date-pill-dot {
  height: 0.25rem;
  width: 0.5rem;
  margin-left: auto;
  margin-right: auto;
  border-radius: 0.25rem;
  box-shadow: 0 0 8px rgba(0, 0, 0, 0.2);
}

.content-col {
  min-width: 0;
}

.day-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.25rem;
}
.agenda-title {
  color: var(--agenda-title);
  text-shadow: 0 0 10px var(--agenda-glow);
  font-size: 0.75rem;
  letter-spacing: 0.2em;
}
.month-header-text {
  font-size: 10px;
  letter-spacing: 0.1em;
  color: var(--neo-muted);
}

.events-list {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.event-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-radius: 0.5rem;
  padding: 0.25rem 0.5rem;
  transition:
    background-color 0.2s ease,
    transform 0.2s ease;
}

.event-left {
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.event-color-bar {
  display: inline-block;
  height: 0.5rem;
  width: 0.25rem;
  border-radius: 0.25rem;
  box-shadow: 0 0 8px rgba(16, 185, 129, 0.7);
}
.event-title {
  font-size: 0.875rem;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.event-sub {
  opacity: 0.75;
}

.event-actions {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}
.event-time {
  font-size: 12px;
  font-weight: 600;
  opacity: 0.9;
}

.btn-primary {
  background: var(--primary, #2563eb);
  color: #fff;
  border: 0;
  border-radius: 0.75rem;
  padding: 0.25rem;
  line-height: 0;
  cursor: pointer;
  transition: filter 0.2s ease;
}
.btn-primary:hover {
  filter: brightness(1.05);
}
.btn-chat {
  background: rgba(16, 185, 129, 0.9);
  color: #fff;
  border: 0;
  border-radius: 0.75rem;
  padding: 0.25rem;
  line-height: 0;
  cursor: pointer;
  transition:
    filter 0.2s ease,
    background-color 0.2s ease;
}
.btn-chat:hover {
  background: #10b981;
}

.icon-4 {
  width: 1rem;
  height: 1rem;
}
</style>
