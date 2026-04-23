<template>
  <!-- Head: avatar + title block -->
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
        aria-label="Tipo"
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
          <strong>Status</strong><br />
          {{
            ev?.type === "attendant_reminder"
              ? "Lembrete"
              : "Mensagem programada"
          }}
        </div>
      </div>
    </div>

    <!-- Main block + time -->
    <div class="itemsb-main">
      <div class="itemsb-row">
        <span class="itemsb-title truncate">
          <template v-if="isSched">
            {{ ev.contactName }} • {{ ev.departmentName || "sem depto" }}
          </template>
          <template v-else-if="isReminder">
            {{ ev.raw.params.message[0].title }}
          </template>
        </span>

        <section class="flex flex-col items-center">
          <span class="itemsb-time">{{ ev.time }}</span>
          <div
            class="sched-pop"
            tabindex="0"
            aria-haspopup="true"
            aria-label="Status"
          >
            <span
              v-if="ev.status !== undefined"
              class="status-bar"
              :class="!ev?.status ? 'status--down' : 'status--up'"
            />
            <div class="sched-pop__card bg-base-300" role="dialog">
              <strong>Status</strong><br />
              {{ ev.status === true ? "Ativo" : "Executado" }}
            </div>
          </div>
        </section>
      </div>

      <div class="itemsb-sub">
        <span class="items-attendant">
          <svg
            class="icon-3"
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
          {{ attendantName(ev.scheduled_by) }}
        </span>
      </div>
    </div>
  </div>

  <!-- Content -->
  <template v-if="isReminder">
    <p class="itemsb-content">{{ ev.raw.params.message[0].content }}</p>
  </template>
  <template v-else>
    <p v-if="ev.content" class="itemsb-content">{{ ev.content }}</p>
    <p
      v-else-if="ev.raw?.params?.files?.length"
      class="itemsb-content text-opacity-50 itemsb-content--muted"
    >
      Essa mensagem será enviada apenas com anexos
    </p>
  </template>

  <!-- Recorrência + Arquivos (apenas mensagens programadas) -->
  <template v-if="isSched">
    <div class="itemsb-meta cursor-pointer">
      <span
        class="sched-badge h-7"
        :class="
          isRecurringSchedule(ev.raw?.params?.schedule)
            ? 'sched-badge--primary'
            : 'sched-badge--success'
        "
      >
        {{ getScheduleRecurrenceLabel(ev.raw?.params?.schedule) }}
      </span>
      <FileBadgePopper :files="allFiles" badgeClass="sched-badge h-7 sched-badge--neutral" />
    </div>
  </template>

  <!-- Actions -->
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
});

defineEmits(["open-message", "open-chat", "delete-message", "edit-reminder"]);

const { isSched, isReminder, attendantName } = useEventItem(props);

const allFiles = computed(
  () => extractFilesFromScheduledMessage(props.ev?.raw?.params) || [],
);
</script>

<style src="../../utils/calendarTheme.css"></style>
<style src="./styles.css"></style>
