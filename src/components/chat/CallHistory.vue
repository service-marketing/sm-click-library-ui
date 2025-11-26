<template>
  <div class="call-history-container">
    <!-- Loading state -->
    <div v-if="loading" class="call-history-loading">
      <svg
        class="call-history-loading-spinner"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          class="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          stroke-width="4"
        />
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
      </svg>
      <span class="call-history-loading-text">Carregando ligações...</span>
    </div>

    <!-- Error state -->
    <div v-else-if="error" class="call-history-error">
      {{ error }}
    </div>

    <!-- Empty state -->
    <div v-else-if="calls.length === 0" class="call-history-empty">
      Nenhuma ligação registrada nesta conversa
    </div>

    <!-- Calls list -->
    <div v-else class="call-history-list">
      <div
        v-for="call in calls"
        :key="call.id"
        data-test="call-card"
        @click.stop="toggleCallEvents(call.id)"
        class="call-card bg-base-300 border hover:bg-base-300 border-base-300"
      >
        <!-- Call header - compact -->
        <div class="call-card-header">
          <div class="call-card-header-left">
            <div
              class="call-icon bg-primary"
              :class="getEventStatusBgColor(getLastEventType(call))"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  d="M7.978 4a2.553 2.553 0 0 0-1.926.877C4.233 6.7 3.699 8.751 4.153 10.814c.44 1.995 1.778 3.893 3.456 5.572 1.68 1.679 3.577 3.018 5.57 3.459 2.062.456 4.115-.073 5.94-1.885a2.556 2.556 0 0 0 .001-3.861l-1.21-1.21a2.689 2.689 0 0 0-3.802 0l-.617.618a.806.806 0 0 1-1.14 0l-1.854-1.855a.807.807 0 0 1 0-1.14l.618-.62a2.692 2.692 0 0 0 0-3.803l-1.21-1.211A2.555 2.555 0 0 0 7.978 4Z"
                />
              </svg>
            </div>
            <div class="call-card-content">
              <div class="call-card-title">
                {{ call.direction === "outbound" ? "Efetuada" : "Recebida" }}
                <span class="opacity-70"
                  >• {{ formatDateShort(call.started_at) }}</span
                >
              </div>
              <div
                v-if="call.events && call.events.length > 0"
                class="call-card-status"
                :class="getEventStatusColor(getLastEventType(call))"
              >
                {{ getEventStatusText(getLastEventType(call)) }}
              </div>
            </div>
          </div>
          <div class="call-card-actions">
            <button
              v-if="call.external_id && onMessageClick"
              @click.stop="handleMessageClick(call)"
              title="Ver mensagem"
              class="hover:bg-base-100"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </button>
            <button
              v-if="hasRecordMetadata(call)"
              :class="{
                'bg-base-100': showRecordings[call.id],
                'hover:bg-base-100': true,
              }"
              @click.stop="handleRecordingsClick(call.id)"
              title="Ver gravações"
            >
              <svg
                :class="showRecordings[call.id] ? 'text-primary' : 'opacity-70'"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  fill-rule="evenodd"
                  d="M17.316 4.052a.99.99 0 0 0-.9.14c-.262.19-.416.495-.416.82v8.566a4.573 4.573 0 0 0-2-.464c-1.99 0-4 1.342-4 3.443 0 2.1 2.01 3.443 4 3.443 1.99 0 4-1.342 4-3.443V6.801c.538.5 1 1.219 1 2.262 0 .56.448 1.013 1 1.013s1-.453 1-1.013c0-1.905-.956-3.18-1.86-3.942a6.391 6.391 0 0 0-1.636-.998 4 4 0 0 0-.166-.063l-.013-.005-.005-.002h-.002l-.002-.001ZM4 5.012c-.552 0-1 .454-1 1.013 0 .56.448 1.013 1 1.013h9c.552 0 1-.453 1-1.013 0-.559-.448-1.012-1-1.012H4Zm0 4.051c-.552 0-1 .454-1 1.013 0 .56.448 1.013 1 1.013h9c.552 0 1-.454 1-1.013 0-.56-.448-1.013-1-1.013H4Zm0 4.05c-.552 0-1 .454-1 1.014 0 .559.448 1.012 1 1.012h4c.552 0 1-.453 1-1.012 0-.56-.448-1.013-1-1.013H4Z"
                  clip-rule="evenodd"
                />
              </svg>
            </button>
            <button
              @click.stop="toggleCallEvents(call.id)"
              class="call-expand-btn hover:bg-base-100"
              :class="{ rotated: expandedCalls.includes(call.id) }"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
          </div>
        </div>

        <!-- Call events and records - expanded -->
        <transition name="fade">
          <div
            v-if="expandedCalls.includes(call.id)"
            class="call-card-expanded"
          >
            <!-- Record metadata - Audio players -->
            <CallRecordPlayer
              v-if="showRecordings[call.id] && hasRecordMetadata(call)"
              :record-metadata="call.record_metadata"
              @close="toggleRecordings(call.id)"
            />

            <!-- Events timeline -->
            <div class="call-events">
              <div
                v-for="(event, index) in call.events"
                :key="index"
                class="call-event-item"
              >
                <div class="call-event-left">
                  <div
                    class="call-event-dot"
                    :class="getEventStatusDotColor(event.event_type)"
                  ></div>
                  <span
                    class="call-event-text"
                    :class="getEventStatusColor(event.event_type)"
                  >
                    {{ getEventStatusText(event.event_type) }}
                  </span>
                </div>
                <span class="call-event-time">
                  {{ formatTime(event.created_at) }}
                </span>
              </div>
            </div>
          </div>
        </transition>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from "vue";
import CallRecordPlayer from "./CallRecordPlayer.vue";
import api from "~/utils/api";
import { callsUrl } from "../../utils/systemUrls";

const props = defineProps({
  chatId: {
    type: [String, Number],
    required: true,
  },
  callsApiUrl: {
    type: String,
    required: false,
    default: callsUrl,
  },
  onMessageClick: {
    type: Function,
    required: false,
    default: null,
  },
});

const loading = ref(false);
const error = ref(null);
const expandedCalls = ref([]);
const showRecordings = ref({});
const calls = ref([]);

onMounted(() => {
  fetchCalls();
});

watch(
  () => props.chatId,
  () => {
    fetchCalls();
  },
);

async function fetchCalls() {
  if (!props.chatId) return;

  loading.value = true;
  error.value = null;

  try {
    const response = await api.get(
      `${props.callsApiUrl}?chat_id=${props.chatId}`,
    );
    calls.value = response.data.results || response.data || [];
  } catch (err) {
    console.error("Erro ao buscar ligações:", err);
    error.value =
      err.response?.data?.message || "Erro ao carregar o histórico de ligações";
  } finally {
    loading.value = false;
  }
}

function toggleCallEvents(callId) {
  const index = expandedCalls.value.indexOf(callId);
  if (index > -1) {
    expandedCalls.value.splice(index, 1);
  } else {
    expandedCalls.value.push(callId);
  }
}

function toggleRecordings(callId) {
  showRecordings.value[callId] = !showRecordings.value[callId];
}

function handleRecordingsClick(callId) {
  if (!expandedCalls.value.includes(callId)) {
    expandedCalls.value.push(callId);
  }
  toggleRecordings(callId);
}

function handleMessageClick(call) {
  if (props.onMessageClick) {
    props.onMessageClick(call);
  }
}

function getLastEventType(call) {
  if (!call.events || call.events.length === 0) return "";
  return call.events[0].event_type;
}

function getEventStatusColor(eventType) {
  switch (eventType) {
    case "offer":
      return "event-status-offer";
    case "answer":
      return "event-status-answer";
    case "accepted":
      return "event-status-accepted";
    case "ringing":
      return "event-status-ringing";
    case "rejected":
    case "error":
      return "event-status-rejected";
    case "terminated":
      return "event-status-terminated";
    case "update":
      return "event-status-update";
    default:
      return "event-status-unknown";
  }
}

function getEventStatusBgColor(eventType) {
  switch (eventType) {
    case "offer":
      return "event-bg-offer";
    case "answer":
      return "event-bg-answer";
    case "accepted":
      return "event-bg-accepted";
    case "ringing":
      return "event-bg-ringing";
    case "rejected":
    case "error":
      return "event-bg-rejected";
    case "terminated":
      return "bg-primary";
    case "update":
      return "event-bg-update";
    default:
      return "event-bg-unknown";
  }
}

function getEventStatusDotColor(eventType) {
  switch (eventType) {
    case "offer":
      return "event-dot-offer";
    case "answer":
      return "event-dot-answer";
    case "accepted":
      return "event-dot-accepted";
    case "ringing":
      return "event-dot-ringing";
    case "rejected":
    case "error":
      return "event-dot-rejected";
    case "terminated":
      return "event-dot-terminated";
    case "update":
      return "event-dot-update";
    default:
      return "event-dot-unknown";
  }
}

function getEventStatusText(eventType) {
  switch (eventType) {
    case "offer":
      return "Chamada recebida";
    case "answer":
      return "Chamada iniciada";
    case "ringing":
      return "Tocando...";
    case "accepted":
      return "Chamada atendida";
    case "rejected":
      return "Chamada rejeitada";
    case "terminated":
      return "Chamada terminada";
    case "error":
      return "Erro na chamada";
    case "update":
      return "Chamada atualizada";
    default:
      return "Evento desconhecido";
  }
}

function formatDateShort(dateString) {
  if (!dateString) return "";

  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return "Hoje";
  } else if (diffDays === 1) {
    return "Ontem";
  } else if (diffDays < 7) {
    return `${diffDays}d atrás`;
  } else {
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
    });
  }
}

function formatTime(dateString) {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function hasRecordMetadata(call) {
  return (
    call.record_metadata?.urls?.client ||
    call.record_metadata?.urls?.attendant ||
    call.record_metadata?.urls?.general
  );
}
</script>

<style scoped>
/* CallHistory.vue - Scoped Styles */
.call-history-container {
  width: 100%;
}

.call-history-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.call-history-loading-spinner {
  width: 1.5rem;
  height: 1.5rem;
  animation: spin 1s linear infinite;
}

.call-history-loading-text {
  color: rgb(107, 114, 128);
  margin-left: 0.5rem;
}

.call-history-error {
  padding: 1rem;
  text-align: center;
  font-size: 0.875rem;
  color: rgb(239, 68, 68);
}

.call-history-empty {
  padding: 1rem;
  text-align: center;
  font-size: 0.875rem;
  opacity: 0.7;
}

.call-history-list {
  max-height: 300px;
  overflow: auto;
  padding: 0.5rem;
}

.call-history-list > * + * {
  margin-top: 0.375rem;
}

.call-card {
  cursor: pointer;
  border-radius: 0.375rem;
  padding: 0.5rem;
  transition: background-color 0.2s;
}

.call-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
}

.call-card-header-left {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  min-width: 0;
  flex: 1;
}

.call-icon {
  display: flex;
  width: 2rem;
  height: 2rem;
  align-items: center;
  justify-content: center;
  border-radius: 0.375rem;
  flex-shrink: 0;
}

.call-icon svg {
  width: 1rem;
  height: 1rem;
  color: white;
}

.call-card-content {
  min-width: 0;
  flex: 1;
}

.call-card-title {
  font-size: 0.75rem;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.call-card-status {
  font-size: 0.75rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.call-card-actions {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  flex-shrink: 0;
}

.call-card-actions button {
  border-radius: 0.25rem;
  padding: 0.25rem;
  transition: background-color 0.2s;
  border: none;
  cursor: pointer;
}

.call-card-actions svg {
  width: 1rem;
  height: 1rem;
}

.call-expand-btn {
  padding: 0.25rem;
  border-radius: 0.25rem;
  transition:
    background-color 0.2s,
    transform 0.2s;
  border: none;
  cursor: pointer;
}

.call-expand-btn.rotated svg {
  transform: rotate(180deg);
}

.call-card-expanded {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding-top: 0.75rem;
}

.call-events {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.call-event-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  font-size: 0.75rem;
}

.call-event-left {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  min-width: 0;
  flex: 1;
}

.call-event-dot {
  width: 0.375rem;
  height: 0.375rem;
  border-radius: 50%;
  flex-shrink: 0;
}

.call-event-text {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  min-width: 0;
  flex: 1;
}

.call-event-time {
  font-size: 0.75rem;
  opacity: 0.6;
  flex-shrink: 0;
}

/* Animações */
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* Transições Vue */
.fade-enter-active,
.fade-leave-active {
  transition: all 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* Event Status Colors */
.event-status-offer {
  color: rgb(96, 165, 250);
}

.event-status-answer {
  color: rgb(96, 165, 250);
}

.event-status-accepted {
  color: rgb(74, 222, 128);
}

.event-status-ringing {
  color: rgb(255, 139, 57);
}

.event-status-rejected,
.event-status-error {
  color: rgb(248, 113, 113);
}

.event-status-terminated {
  color: rgb(209, 213, 219);
}

.dark .event-status-terminated {
  color: rgb(55, 65, 81);
}

.event-status-update {
  color: rgb(96, 165, 250);
}

.event-status-unknown {
  color: rgb(156, 163, 175);
}

/* Event Status Background Colors */
.event-bg-offer {
  background-color: rgb(59, 130, 246);
}

.event-bg-answer {
  background-color: rgb(96, 165, 250);
}

.event-bg-accepted {
  background-color: rgb(34, 197, 94);
}

.event-bg-ringing {
  background-color: rgb(59, 130, 246);
}

.event-bg-rejected,
.event-bg-error {
  background-color: rgb(239, 68, 68);
}

.event-bg-terminated {
  background-color: rgb(107, 114, 128);
}

.event-bg-update {
  background-color: rgb(59, 130, 246);
}

.event-bg-unknown {
  background-color: rgb(107, 114, 128);
}

/* Event Status Dot Colors */
.event-dot-offer {
  background-color: rgb(96, 165, 250);
}

.event-dot-answer {
  background-color: rgb(96, 165, 250);
}

.event-dot-accepted {
  background-color: rgb(74, 222, 128);
}

.event-dot-ringing {
  background-color: rgb(255, 139, 57);;
}

.event-dot-rejected,
.event-dot-error {
  background-color: rgb(248, 113, 113);
}

.event-dot-terminated {
  background-color: rgb(107, 114, 128);
}

.dark .event-dot-terminated {
  background-color: rgb(55, 65, 81);
}

.event-dot-update {
  background-color: rgb(96, 165, 250);
}

.event-dot-unknown {
  background-color: rgb(107, 114, 128);
}
</style>
