<template>
  <!-- COMPACT (status = barrinha horizontal sob o horário) -->
  <template v-if="mode === 'compact'">
    <header class="itemc-head">
      <span :style="{ background: color }" class="color-bar"></span>
      <div class="minw0">
        <div class="itemc-title">
          {{ ev.contactName ? ev.contactName + " • " : "" }}
          {{ ev.departmentName || "sem depto" }}
        </div>
        <div class="itemc-sub">
          <span class="flex items-center gap-1">
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
    </header>

    <footer class="itemc-actions">
      <div class="flex flex-col items-center">
        <div class="time-badge">{{ ev.time }}</div>
        <div
          v-if="ev.status !== undefined"
          class="status-bar"
          :class="!ev?.status ? 'status--down' : 'status--up'"
        />
      </div>

      <button
        v-if="isSched"
        @click="$emit('open-message', ev)"
        class="cyber-button cyber-button--xs cyber-button--primary"
        aria-label="Editar mensagem programada"
      >
        <svg
          v-if="ev?.status === true"
          class="icon-4"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
        >
          <path
            fill="currentColor"
            fill-rule="evenodd"
            d="M14 4.182A4.136 4.136 0 0 1 16.9 3c1.087 0 2.13.425 2.899 1.182A4.01 4.01 0 0 1 21 7.037c0 1.068-.43 2.092-1.194 2.849L18.5 11.214l-5.8-5.71 1.287-1.31.012-.012Zm-2.717 2.763L6.186 12.13l2.175 2.141 5.063-5.218-2.141-2.108Zm-6.25 6.886-1.98 5.849a.992.992 0 0 0 .245 1.026 1.03 1.03 0 0 0 1.043.242L10.282 19l-5.25-5.168Zm6.954 4.01 5.096-5.186-2.218-2.183-5.063 5.218 2.185 2.15Z"
            clip-rule="evenodd"
          />
        </svg>
        <svg
          v-else
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
            d="M4.998 7.78C6.729 6.345 9.198 5 12 5c2.802 0 5.27 1.345 7.002 2.78a12.713 12.713 0 0 1 2.096 2.183c.253 .344 .465 .682 .618 .997 .14 .286 .284 .658 .284 1.04s-.145 .754 -.284 1.04a6.6 6.6 0 0 1-.618 .997 12.712 12.712 0 0 1-2.096 2.183C17.271 17.655 14.802 19 12 19c-2.802 0-5.27-1.345-7.002-2.78a12.712 12.712 0 0 1-2.096-2.183 6.6 6.6 0 0 1-.618-.997C2.144 12.754 2 12.382 2 12s.145-.754 .284-1.04c.153-.315 .365-.653 .618-.997A12.714 12.714 0 0 1 4.998 7.78ZM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"
            clip-rule="evenodd"
          />
        </svg>
      </button>

      <button
        v-if="isSched"
        @click="$emit('delete-message', ev)"
        class="cyber-button cyber-button--xs cyber-button--danger"
        aria-label="Apagar evento"
        :disabled="ev.deleteLoading || ev?.status === false"
      >
        <svg
          v-if="!ev.deleteLoading"
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
            d="M8.586 2.586A2 2 0 0 1 10 2h4a2 2 0 0 1 2 2v2h3a1 1 0 1 1 0 2v12a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V8a1 1 0 0 1 0-2h3V4a2 2 0 0 1 .586-1.414ZM10 6h4V4h-4v2Zm1 4a1 1 0 1 0-2 0v8a1 1 0 1 0 2 0v-8Zm4 0a1 1 0 1 0-2 0v8a1 1 0 1 0 2 0v-8Z"
            clip-rule="evenodd"
          />
        </svg>
        <div v-if="ev.deleteLoading" class="loading-spinner"></div>
      </button>

      <button
        class="cyber-button cyber-button--xs cyber-button--accent"
        @click="$emit('open-chat', ev)"
        aria-label="Abrir conversa"
      >
        <svg
          class="icon-4"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
        >
          <path
            fill="currentColor"
            fill-rule="evenodd"
            d="M3.559 4.544c.355-.35.834-.544 1.33-.544H19.11c.496 0 .975.194 1.33.544.356.35.559.829.559 1.331v9.25c0 .502-.203.981-.559 1.331-.355.35-.834.544-1.33.544H15.5l-2.7 3.6a1 1 0 0 1-1.6 0L8.5 17H4.889c-.496 0-.975-.194-1.33-.544A1.868 1.868 0 0 1 3 15.125v-9.25c0-.502.203-.981.559-1.331ZM7.556 7.5a1 1 0 1 0 0 2h8a1 1 0 0 0 0-2h-8Zm0 3.5a1 1 0 1 0 0 2H12a1 1 0 1 0 0-2H7.556Z"
            clip-rule="evenodd"
          />
        </svg>
      </button>
    </footer>
  </template>

  <!-- SIDEBAR (status = bolinha maior no avatar) -->
  <template v-else-if="mode === 'sidebar'">
    <div class="itemsb-head">
      <div class="avatar-wrap" :style="{ boxShadow: `0 0 0 1px ${color}` }">
        <img
          v-if="ev.contactPhoto"
          :src="ev.contactPhoto"
          alt=""
          class="avatar"
          loading="lazy"
        />
        <div v-else class="avatar avatar--placeholder bg-base-100">
          <svg viewBox="0 0 24 24" class="icon-5 icon-muted">
            <path
              fill="currentColor"
              d="M12 12a5 5 0 1 0-5-5a5 5 0 0 0 5 5m0 2c-4 0-8 2-8 4v2h16v-2c0-2-4-4-8-4Z"
            />
          </svg>
        </div>

        <span
          v-if="ev.status !== undefined"
          class="status-dot-avatar"
          :class="!ev?.status ? 'status--down' : 'status--up'"
        />
      </div>

      <!-- bloco principal + horário fixo à direita -->
      <div class="itemsb-main">
        <div class="itemsb-row">
          <span class="itemsb-title truncate">
            {{ ev.contactName }} • {{ ev.departmentName || "sem depto" }}
          </span>
          <span class="itemsb-time">{{ ev.time }}</span>
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
              />
            </svg>
            {{ attendantName(ev.scheduled_by) }}
          </span>
        </div>
      </div>
    </div>

    <p class="itemsb-content">{{ ev.content || ev.title }}</p>
    <div v-if="!viewOnly" class="itemsb-actions">
      <button
        v-if="isSched"
        type="button"
        class="cyber-button cyber-button--sm cyber-button--primary"
        @click="$emit('open-message', ev)"
      >
        {{ ev?.status === true ? "Editar" : "Visualizar" }}
      </button>
      <button
        v-if="isSched"
        @click="$emit('delete-message', ev)"
        class="cyber-button cyber-button--sm cyber-button--danger"
        aria-label="Apagar evento"
        :disabled="ev.deleteLoading || ev?.status === false"
      >
        <div v-if="ev.deleteLoading" class="loading-spinner"></div>
        Apagar
      </button>
      <button
        v-if="isSched"
        type="button"
        class="cyber-button cyber-button--sm cyber-button--accent"
        @click="$emit('open-chat', ev)"
      >
        Abrir conversa
      </button>
    </div>
  </template>

  <!-- AGENDA (status = barrinha horizontal ao lado da barra de cor) -->
  <template v-else>
    <div class="event-left">
      <span :style="{ background: color }" class="event-color-bar"></span>
      <div class="event-line">
        {{ agendaLine }}
      </div>
    </div>

    <footer class="event-actions">
      <!-- SVG do atendente com popover: logo ao lado da barra de status -->
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
      <span
        v-if="ev.status !== undefined"
        class="status-bar"
        :class="!ev?.status ? 'status--down' : 'status--up'"
      />

      <div class="event-time">{{ ev.time }}</div>

      <button
        v-if="isSched"
        @click="$emit('open-message', ev)"
        class="cyber-button cyber-button--xs cyber-button--primary"
        aria-label="Editar mensagem programada"
      >
        <svg
          v-if="ev?.status === true"
          class="icon-4"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
        >
          <path
            fill="currentColor"
            fill-rule="evenodd"
            d="M14 4.182A4.136 4.136 0 0 1 16.9 3c1.087 0 2.13.425 2.899 1.182A4.01 4.01 0 0 1 21 7.037c0 1.068-.43 2.092-1.194 2.849L18.5 11.214l-5.8-5.71 1.287-1.31.012-.012Zm-2.717 2.763L6.186 12.13l2.175 2.141 5.063-5.218-2.141-2.108Zm-6.25 6.886-1.98 5.849a.992.992 0 0 0 .245 1.026 1.03 1.03 0 0 0 1.043.242L10.282 19l-5.25-5.168Zm6.954 4.01 5.096-5.186-2.218-2.183-5.063 5.218 2.185 2.15Z"
            clip-rule="evenodd"
          />
        </svg>
        <svg
          v-else
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
            d="M4.998 7.78C6.729 6.345 9.198 5 12 5c2.802 0 5.27 1.345 7.002 2.78a12.713 12.713 0 0 1 2.096 2.183c.253 .344 .465 .682 .618 .997 .14 .286 .284 .658 .284 1.04s-.145 .754 -.284 1.04a6.6 6.6 0 0 1-.618 .997 12.712 12.712 0 0 1-2.096 2.183C17.271 17.655 14.802 19 12 19c-2.802 0-5.27-1.345-7.002-2.78a12.712 12.712 0 0 1-2.096-2.183 6.6 6.6 0 0 1-.618-.997C2.144 12.754 2 12.382 2 12s.145-.754 .284-1.04c.153-.315 .365-.653 .618-.997A12.714 12.714 0 0 1 4.998 7.78ZM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"
            clip-rule="evenodd"
          />
        </svg>
      </button>
      <button
        v-if="isSched"
        @click="$emit('delete-message', ev)"
        class="cyber-button cyber-button--xs cyber-button--danger"
        aria-label="Apagar evento"
        :disabled="ev.deleteLoading || ev?.status === false"
      >
        <svg
          v-if="!ev.deleteLoading"
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
            d="M8.586 2.586A2 2 0 0 1 10 2h4a2 2 0 0 1 2 2v2h3a1 1 0 1 1 0 2v12a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V8a1 1 0 0 1 0-2h3V4a2 2 0 0 1 .586-1.414ZM10 6h4V4h-4v2Zm1 4a1 1 0 1 0-2 0v8a1 1 0 1 0 2 0v-8Zm4 0a1 1 0 1 0-2 0v8a1 1 0 1 0 2 0v-8Z"
            clip-rule="evenodd"
          />
        </svg>
        <div v-if="ev.deleteLoading" class="loading-spinner"></div>
      </button>

      <button
        class="cyber-button cyber-button--xs cyber-button--accent"
        @click="$emit('open-chat', ev)"
        aria-label="Abrir conversa"
      >
        <svg
          class="icon-4"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
        >
          <path
            fill="currentColor"
            fill-rule="evenodd"
            d="M3.559 4.544c.355-.35.834-.544 1.33-.544H19.11c.496 0 .975.194 1.33.544.356.35.559.829.559 1.331v9.25c0 .502-.203.981-.559 1.331-.355.35-.834.544-1.33.544H15.5l-2.7 3.6a1 1 0 0 1-1.6 0L8.5 17H4.889c-.496 0-.975-.194-1.33-.544A1.868 1.868 0 0 1 3 15.125v-9.25c0-.502.203-.981.559-1.331ZM7.556 7.5a1 1 0 1 0 0 2h8a1 1 0 0 0 0-2h-8Zm0 3.5a1 1 0 1 0 0 2H12a1 1 0 1 0 0-2H7.556Z"
            clip-rule="evenodd"
          />
        </svg>
      </button>
    </footer>
  </template>
</template>

<script setup>
import { computed } from "vue";
import { getEventColor as utilGetEventColor } from "../utils/eventColors";
import { useAttendantStore } from "~/stores/attendantStore";
const attendantStore = useAttendantStore();

const emits = defineEmits(["open-message", "open-chat", "delete-message"]);
const props = defineProps({
  ev: { type: Object, required: true },
  mode: { type: String, default: "compact" }, // 'compact' | 'sidebar' | 'agenda'
  getEventColor: { type: Function, default: null },
  viewOnly: { type: Boolean, default: false },
});

const color = computed(() => {
  const fn = props.getEventColor || utilGetEventColor;
  return fn(props.ev);
});
const isSched = computed(() => props.ev?.type === "scheduled_messages");
const isMe = computed(
  () => attendantStore.attendants.find((a) => a.is_me) || {},
);
const attendantName = (id) => {
  const att = attendantStore.attendants.find((a) => a.id === id);
  if (!att) return "Desconhecido";
  if (att.id === isMe.value.id) return "Você";
  return att.name || "Desconhecido";
};

// Linha única da AGENDA: "Contato • Depto • Atendente"
const agendaLine = computed(() => {
  const parts = [];
  if (props.ev?.contactName) parts.push(props.ev.contactName);
  parts.push(props.ev?.departmentName || "sem depto");
  // parts.push(attendantName(props.ev?.scheduled_by));
  return parts.join(" • ");
});
</script>

<style src="../utils/calendarTheme.css"></style>
<style scoped>
/* util */
.minw0 {
  min-width: 0;
}

/* --- compacto --- */
.itemc-head {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  min-width: 0;
}
.color-bar {
  display: inline-block;
  height: 8px;
  width: 0.25rem;
  border-radius: 0.25rem;
  box-shadow: 0 0 8px rgba(16, 185, 129, 0.7);
  flex-shrink: 0;
}
.itemc-title {
  font-size: 0.875rem;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.itemc-sub {
  font-size: 12px;
  opacity: 0.8;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.items-attendant {
  display: flex;
  align-items: center;
  gap: 0.3rem;
}
.itemc-actions {
  display: flex;
  align-items: center;
  gap: 0.4rem;
}
.time-badge {
  font-size: 12px;
  font-weight: 500;
  opacity: 0.9;
}

/* --- sidebar --- */
.itemsb-head {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  min-width: 0;
}
.itemsb-main {
  flex: 1 1 auto;
  min-width: 0;
}
.itemsb-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  min-width: 0;
}
.itemsb-title {
  font-size: 0.875rem;
  font-weight: 600;
  flex: 1 1 auto;
  min-width: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  text-align: start;
}
.itemsb-time {
  flex: 0 0 auto;
  margin-left: auto;
  font-size: 12px;
  font-weight: 700;
  opacity: 0.9;
  white-space: nowrap;
}
.itemsb-sub {
  font-size: 0.75rem;
  opacity: 0.8;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.itemsb-content {
  margin-top: 0.4rem;
  font-size: 0.875rem;
  overflow: hidden;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  line-clamp: 2;

  word-break: break-word; /* força quebra dentro da palavra */
  overflow-wrap: anywhere; /* alternativa mais moderna */
}

.itemsb-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.4rem;
  margin-top: 0.4rem;
}

.avatar-wrap {
  position: relative;
  width: 2rem;
  height: 2rem;
  border-radius: 9999px;
  box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.08);
  flex-shrink: 0;
}
.avatar {
  width: 100%;
  height: 100%;
  border-radius: 9999px;
  object-fit: cover;
}
.avatar--placeholder {
  display: grid;
  place-items: center;
  border-radius: 9999px;
}
.icon-muted {
  opacity: 0.7;
}

/* --- agenda --- */
.event-left {
  min-width: 0;
  flex: 1 1 auto; /* bloco da esquerda pode encolher */
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
  flex-shrink: 0;
}
/* linha única com ellipsis */
.event-line {
  flex: 1 1 auto;
  min-width: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 0.875rem;
  font-weight: 500;
  opacity: 0.95;
}
.event-actions {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  flex: 0 0 auto;
}
.event-time {
  font-size: 12px;
  font-weight: 600;
  opacity: 0.9;
  width: 36px;
}

/* --- status como barra horizontal (compacto + agenda) --- */
.status-bar {
  width: 8px;
  height: 4px;
  border-radius: 2px;
  display: inline-block;
  vertical-align: middle;
  flex-shrink: 0;
  transition: all 0.2s ease;
}
.status--up {
  background: var(--status-up);
  box-shadow: 0 0 8px var(--status-glow-up);
}
.status--down {
  background: var(--status-down);
  box-shadow: 0 0 8px var(--status-glow-down);
}

/* --- status como bolinha no avatar (sidebar) --- */
.status-dot-avatar {
  position: absolute;
  bottom: -2px;
  right: -2px;
  width: 10px;
  height: 10px;
  border-radius: 9999px;
  border: 1px solid rgba(0, 0, 0, 0.25);
  transition: all 0.2s ease;
}
.status-dot-avatar.status--up {
  background: var(--status-up);
  box-shadow: 0 0 8px var(--status-glow-up);
}
.status-dot-avatar.status--down {
  background: var(--status-down);
  box-shadow: 0 0 8px var(--status-glow-down);
}

/* hovers sutis */
.item-sidebar:hover .status-dot-avatar,
.event-item:hover .status-bar {
  transform: translateY(-1px);
  filter: brightness(1.05);
}

/* ícones */
.icon-3 {
  width: 0.75rem;
  height: 0.75rem;
}
.icon-4 {
  width: 1rem;
  height: 1rem;
}
.icon-5 {
  width: 1.25rem;
  height: 1.25rem;
}

.show-md {
  display: none;
}
@media (min-width: 864px) {
  .show-md {
    display: inline-flex;
  }
}
</style>
