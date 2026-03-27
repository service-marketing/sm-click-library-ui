<template>
  <div class="event-left">
    <div class="sched-pop sched-pop--right" tabindex="0" aria-haspopup="true">
      <span :style="{ background: color }" class="event-color-bar"></span>
      <div class="sched-pop__card bg-base-300" role="dialog">
        <strong>Evento</strong><br />
        {{ typeLabel }}
      </div>
    </div>

    <div class="event-line">{{ agendaLine }}</div>

    <!-- <span
      v-if="showRecurrenceBadge && isSched"
      class="sched-badge sched-badge--xs"
      :class="
        isRecurringSchedule(ev.raw?.params?.schedule)
          ? 'sched-badge--primary'
          : 'sched-badge--success'
      "
    >
      {{ getScheduleRecurrenceLabel(ev.raw?.params?.schedule) }}
    </span> -->
    <span
      v-if="isSched && fileCount > 0"
      class="sched-badge sched-badge--xs sched-badge--neutral"
    >
      {{ fileCount }} arq.
    </span>
  </div>

  <footer class="event-actions">
    <div
      class="sched-pop"
      tabindex="0"
      aria-haspopup="true"
      aria-label="Agendado por"
    >
      <svg
        class="icon-4"
        aria-hidden="true"
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        fill="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          fill-rule="evenodd"
          d="M12 2a7 7 0 0 0-7 7 3 3 0 0 0-3 3v2a3 3 0 0 0 3 3h1a1 1 0 0 0 1-1V9a5 5 0 1 1 10 0v7.083A2.919 2.919 0 0 1 14.083 19H14a2 2 0 0 0-2-2h-1a2 2 0 0 0-2 2v1a2 2 0 0 0 2 2h1a2 2 0 0 0 1.732-1h.351a4.917 4.917 0 0 0 4.83-4H19a3 3 0 0 0 3-3v-2a3 3 0 0 0-3-3 7 7 0 0 0-7-7Zm1.45 3.275a4 4 0 0 0-4.352.976 1 1 0 0 0 1.452 1.376 2.001 2.001 0 0 1 2.836-.067 1 1 0 1 0 1.386-1.442 4 4 0 0 0-1.321-.843Z"
          clip-rule="evenodd"
        />
      </svg>
      <div class="sched-pop__card bg-base-300" role="dialog">
        <strong>Agendado por</strong><br />
        {{ attendantName(ev.scheduled_by) }}
      </div>
    </div>

    <div
      class="sched-pop"
      tabindex="0"
      aria-haspopup="true"
      :aria-label="statusTooltipTitle"
    >
      <svg
        v-if="useRecurringStatusIcon"
        class="size-4 recurring-status-icon"
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
      <span
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

    <div class="event-time">{{ displayTime }}</div>

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
import { computed } from "vue";
import ActionButtons from "./ActionButtons.vue";
import { useEventItem } from "./useEventItem";
import {
  isRecurringSchedule,
  getScheduleRecurrenceLabel,
  extractFilesFromScheduledMessage,
} from "../../useScheduledEvents";

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
  agendaLine,
  displayTime,
  typeLabel,
  statusTooltipTitle,
  statusTooltipText,
  useRecurringStatusIcon,
  showRecurrenceBadge,
} = useEventItem(props);

const fileCount = computed(
  () => extractFilesFromScheduledMessage(props.ev?.raw?.params)?.length ?? 0,
);
</script>

<style src="../../utils/calendarTheme.css"></style>
<style src="./styles.css"></style>
