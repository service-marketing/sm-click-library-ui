<template>
  <div class="itemsb-head">
    <div class="avatar-wrap">
      <img
        v-if="ev.contactPhoto"
        :src="ev.contactPhoto"
        alt=""
        class="avatar"
        loading="lazy"
      />
      <div v-else class="avatar avatar--placeholder bg-base-100">
        <svg v-if="isSched" viewBox="0 0 24 24" class="icon-5 icon-muted">
          <path
            fill="currentColor"
            d="M12 12a5 5 0 1 0-5-5a5 5 0 0 0 5 5m0 2c-4 0-8 2-8 4v2h16v-2c0-2-4-4-8-4Z"
          />
        </svg>
        <span v-else title="Lembrete">
          <svg
            class="size-4"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              d="M17.133 12.632v-1.8a5.406 5.406 0 0 0-4.154-5.262.955.955 0 0 0 .021-.106V3.1a1 1 0 0 0-2 0v2.364a.955.955 0 0 0 .021.106 5.406 5.406 0 0 0-4.154 5.262v1.8C6.867 15.018 5 15.614 5 16.807 5 17.4 5 18 5.538 18h12.924C19 18 19 17.4 19 16.807c0-1.193-1.867-1.789-1.867-4.175ZM8.823 19a3.453 3.453 0 0 0 6.354 0H8.823Z"
            />
          </svg>
        </span>
      </div>
      <div
        class="sched-pop"
        style="position: absolute; bottom: -2px; right: -2px"
        tabindex="0"
        aria-haspopup="true"
        aria-label="Evento"
      >
        <span
          v-if="ev.status !== undefined"
          class="status-dot-avatar"
          :class="
            ev?.type === 'attendant_reminder'
              ? 'status--reminder'
              : 'status--scheduled'
          "
        />
        <div
          class="sched-pop__card bg-base-300"
          style="
            left: -100%;
            right: auto;
            transform: translate(10%, -50%) scale(0.98);
          "
          role="dialog"
        >
          <strong>Evento</strong><br />
          {{ typeLabel }}
        </div>
      </div>
    </div>

    <div class="itemsb-main">
      <div class="itemsb-row">
        <div class="flex flex-col">
          <span class="itemsb-title truncate">{{ displayTitle }}</span>
          <div class="itemsb-sub">
            <AttendantLabel :name="attendantName(ev.scheduled_by)" />
          </div>
        </div>

        <section class="flex flex-col items-center recurring-status-stack">
          <span class="itemsb-time">{{ displayTime }}</span>
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
        </section>
      </div>
    </div>
  </div>

  <p v-if="contentText" class="itemsb-content">{{ contentText }}</p>
  <p
    v-else-if="allFiles.length"
    class="itemsb-content text-opacity-50 itemsb-content--muted"
  >
    Essa mensagem sera enviada apenas com anexos
  </p>

  <template v-if="isSched">
    <div
      v-if="showRecurrenceBadge || allFiles.length"
      class="itemsb-meta cursor-pointer"
    >
      <span
        v-if="
          showRecurrenceBadge && isRecurringSchedule(ev.raw?.params?.schedule)
        "
        class="sched-badge h-7 sched-badge--primary"
      >
        {{ getScheduleRecurrenceLabel(ev.raw?.params?.schedule) }}
      </span>
      <FileBadgePopper
        v-if="allFiles.length"
        :files="allFiles"
        badgeClass="sched-badge h-7 sched-badge--neutral"
      />
    </div>
  </template>

  <div v-if="!viewOnly" class="itemsb-actions">
    <ActionButtons
      :ev="ev"
      :isSched="isSched"
      :isReminder="isReminder"
      size="sm"
      @open-message="$emit('open-message', $event)"
      @open-chat="$emit('open-chat', $event)"
      @delete-message="$emit('delete-message', $event)"
      @edit-reminder="$emit('edit-reminder', $event)"
    />
  </div>
</template>

<script setup>
import { computed } from "vue";
import ActionButtons from "./ActionButtons.vue";
import AttendantLabel from "./AttendantLabel.vue";
import FileBadgePopper from "./FileBadgePopper.vue";
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
  isSched,
  isReminder,
  attendantName,
  displayTitle,
  displayTime,
  typeLabel,
  contentText,
  statusTooltipTitle,
  statusTooltipText,
  useRecurringStatusIcon,
  showRecurrenceBadge,
} = useEventItem(props);

const allFiles = computed(
  () => extractFilesFromScheduledMessage(props.ev?.raw?.params) || [],
);
</script>

<style src="../../utils/calendarTheme.css"></style>
<style src="./styles.css"></style>
