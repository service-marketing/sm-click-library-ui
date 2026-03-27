<template>
  <header class="itemc-head">
    <div class="sched-pop sched-pop--right" tabindex="0" aria-haspopup="true">
      <span :style="{ background: color }" class="color-bar"></span>
      <div class="sched-pop__card bg-base-300" role="dialog">
        <strong>Evento</strong><br />
        {{ typeLabel }}
      </div>
    </div>

    <div class="minw0">
      <div class="itemc-title">{{ displayTitle }}</div>
      <div class="itemc-sub">
        <AttendantLabel :name="attendantName(ev.scheduled_by)" />
      </div>
    </div>
  </header>

  <footer class="itemc-actions">
    <div class="flex flex-col items-center recurring-status-stack">
      <div class="time-badge">{{ displayTime }}</div>
      <div
        class="sched-pop"
        tabindex="0"
        aria-haspopup="true"
        :aria-label="statusTooltipTitle"
      >
        <svg
          v-if="useRecurringStatusIcon"
          class="recurring-status-icon"
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          fill="none"
          viewBox="0 0 24 24"
        >
          <path
            stroke="currentColor"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="m16 10 3-3m0 0-3-3m3 3H5v3m3 4-3 3m0 0 3 3m-3-3h14v-3"
          />
        </svg>
        <div
          v-else-if="ev.status !== undefined"
          class="status-bar"
          :class="!ev?.status ? 'status--down' : 'status--up'"
        />
        <div class="sched-pop__card bg-base-300" role="dialog">
          <strong>{{ statusTooltipTitle }}</strong
          ><br />
          {{ statusTooltipText }}
        </div>
      </div>
    </div>

    <ActionButtons
      v-if="!viewOnly"
      :ev="ev"
      :isSched="isSched"
      :isReminder="isReminder"
      size="xs"
      @open-message="$emit('open-message', $event)"
      @open-chat="$emit('open-chat', $event)"
      @delete-message="$emit('delete-message', $event)"
      @edit-reminder="$emit('edit-reminder', $event)"
    />
  </footer>
</template>

<script setup>
import ActionButtons from "./ActionButtons.vue";
import AttendantLabel from "./AttendantLabel.vue";
import { useEventItem } from "./useEventItem";

const props = defineProps({
  ev: { type: Object, required: true },
  getEventColor: { type: Function, default: null },
  viewOnly: { type: Boolean, default: false },
  recurringMeta: { type: Object, default: null },
});

defineEmits(["open-message", "open-chat", "delete-message", "edit-reminder"]);

const {
  color,
  isSched,
  isReminder,
  attendantName,
  displayTitle,
  displayTime,
  typeLabel,
  statusTooltipTitle,
  statusTooltipText,
  useRecurringStatusIcon,
} = useEventItem(props);
</script>

<style src="../../utils/calendarTheme.css"></style>
<style src="./styles.css"></style>
<style scoped>
.recurring-status-icon {
  width: 0.9rem;
  height: 0.9rem;
  stroke: #60a5fa;
  fill: none;
  stroke-width: 1.7;
  stroke-linecap: round;
  stroke-linejoin: round;
  filter: drop-shadow(0 0 6px rgba(59, 130, 246, 0.35));
}
</style>
