<template>
  <section class="agenda-section">
    <div v-if="days.length === 0" class="empty-state">
      Sem eventos neste mês.
    </div>
    <ul v-else class="day-list">
      <li v-for="d in days" :key="d.key" class="day-item border-base-200">
        <!-- trilha/cápsula -->
        <div class="date-trail">
          <div class="weekday-short">
            {{ weekdayShort(d.date) }}
          </div>
          <div class="date-pill bg-base-200 border border-base-300">
            <div class="date-pill-month">{{ monthShort(d.date) }}</div>
            <div class="date-pill-day">{{ d.date.getDate() }}</div>
            <div
              :style="{ background: getEventColor(d.events?.[0] || {}) }"
              class="date-pill-dot"
            ></div>
          </div>
        </div>

        <!-- conteúdo -->
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
              v-for="ev in d.events"
              :key="ev.id"
              class="event-item border border-base-100 bg-base-200 hover:bg-base-100"
            >
              <EventItem
                :ev="ev"
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
import { getEventColor } from "../utils/eventColors";
const emit = defineEmits(["open-chat", "open-message", "delete-message", "edit-reminder"]);
const props = defineProps({
  days: { type: Array, default: () => [] },
  weekdayLong: Function,
  weekdayShort: Function,
  monthShort: Function,
  monthLabelOf: Function,
  year: Number,
});
</script>

<style scoped>
:global(:root) {
  --neo-muted: #7ecdc2;
  --agenda-title: #68c3ba;
  --agenda-glow: rgba(31, 227, 158, 0.25);
  --pill-fg: #d0fff6;
  --btn-primary: #3b82f6; /* opcionalmente um pouco mais claro no dark */
  --btn-chat: rgba(16, 185, 129, 0.9);
  --btn-chat-hover: #10b981;
}

:global(.dark) {
  --neo-muted: #6b8c8a; /* usado em weekday-short e month header */
  --agenda-title: #0ea5a4; /* título do dia */
  --agenda-glow: rgba(31, 227, 158, 0.25);
  --pill-fg: #0f766e; /* texto dentro da cápsula da data no claro */
  --btn-primary: #2563eb;
  --btn-chat: rgba(16, 185, 129, 0.9);
  --btn-chat-hover: #10b981;
  /* overrides quando html/body tiver .dark */
}

/* ===== Layout geral ===== */
.agenda-section {
  position: relative; /* relative */
  z-index: 10; /* z-10 */
  padding-left: 0.5rem; /* px-2 */
  padding-right: 0.5rem;
  flex: 1 1 auto; /* flex-1 */
  overflow: auto; /* overflow-auto */
}
.empty-state {
  padding: 1.5rem 0.75rem; /* px-3 py-6 */
  font-size: 0.875rem; /* text-sm */
  opacity: 0.7; /* opacity-70 */
}

/* ===== Lista de dias ===== */
.day-list {
  display: flex; /* flex */
  flex-direction: column; /* flex-col */
}
.day-item {
  display: grid; /* grid */
  grid-template-columns: 56px 1fr; /* grid-cols-[56px_1fr] */
  gap: 0.75rem; /* gap-3 */
  padding-top: 0.5rem; /* py-3 */
  padding-bottom: 0.75rem;
  align-items: center; /* items-start */
  background: transparent; /* bg-transparent */
  border-bottom-width: 1px; /* border-b */
}
.day-item:last-child {
  border-bottom-width: 0; /* last:border-0 */
}

/* ===== Trilha / cápsula da data ===== */
.date-trail {
  display: flex; /* flex */
  flex-direction: column; /* flex-col */
  align-items: center; /* items-center */
}
.weekday-short {
  width: 2.5rem; /* w-10 */
  text-align: center; /* text-center */
  font-size: 10px; /* text-[10px] */
  letter-spacing: 0.1em; /* tracking-widest aprox */
  color: var(--neo-muted); /* text-neo-muted (aprox) */
}

/* ===== Cápsula da data ===== */
.date-pill {
  border-radius: 0.75rem; /* rounded-xl */
  padding: 0.25rem 0.5rem; /* px-2 py-1 */
  text-align: center; /* text-center */
  color: var(--pill-fg);
  box-shadow:
    inset 0 0 0 1px rgba(31, 227, 158, 0.15),
    0 0 12px rgba(31, 227, 158, 0.12);
}
.date-pill-month {
  font-size: 10px; /* text-[10px] */
  line-height: 1; /* leading-none */
}
.date-pill-day {
  font-size: 1rem; /* text-base */
  font-weight: 600; /* font-semibold */
  line-height: 1; /* leading-none */
}
.date-pill-dot {
  height: 0.25rem; /* h-1 */
  width: 0.5rem; /* w-2 */
  margin-left: auto; /* mx-auto */
  margin-right: auto;
  border-radius: 0.25rem; /* rounded */
  box-shadow: 0 0 8px rgba(0, 0, 0, 0.2);
}

/* ===== Coluna de conteúdo ===== */
.content-col {
  min-width: 0; /* min-w-0 */
}

/* Cabeçalho do dia */
.day-header {
  display: flex; /* flex */
  align-items: center; /* items-center */
  justify-content: space-between; /* justify-between */
  margin-bottom: 0.25rem; /* mb-1 */
}
.agenda-title {
  color: var(--agenda-title);
  text-shadow: 0 0 10px var(--agenda-glow);
  font-size: 0.75rem; /* text-xs */
  letter-spacing: 0.2em; /* tracking-[.2em] */
}
.month-header-text {
  font-size: 10px; /* text-[10px] */
  letter-spacing: 0.1em; /* tracking-widest aprox */
  color: var(--neo-muted); /* text-neo-muted aprox */
}

/* Lista de eventos do dia */
.events-list {
  display: flex; /* flex */
  flex-direction: column; /* flex-col */
  gap: 0.25rem; /* gap-1 */
}

/* Item de evento */
.event-item {
  display: flex; /* flex */
  align-items: center; /* items-center */
  justify-content: space-between; /* justify-between */
  border-radius: 0.5rem; /* rounded */
  padding: 0.25rem 0.5rem; /* px-2 py-1 */
  transition:
    background-color 0.2s ease,
    transform 0.2s ease; /* transition */
}

/* Bloco esquerdo do evento */
.event-left {
  min-width: 0; /* min-w-0 */
  display: flex; /* flex */
  align-items: center; /* items-center */
  gap: 0.5rem; /* gap-2 */
}
.event-color-bar {
  display: inline-block; /* inline-block */
  height: 0.5rem; /* h-2 */
  width: 0.25rem; /* w-1 */
  border-radius: 0.25rem; /* rounded */
  box-shadow: 0 0 8px rgba(16, 185, 129, 0.7);
}
.event-title {
  font-size: 0.875rem; /* text-sm */
  font-weight: 500; /* font-medium */
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis; /* truncate */
}
.event-sub {
  opacity: 0.75; /* opacity-75 */
}

/* Ações do evento */
.event-actions {
  display: flex; /* flex */
  align-items: center; /* items-center */
  gap: 0.25rem; /* gap-1 */
}
.event-time {
  font-size: 12px; /* text-[12px] */
  font-weight: 600; /* font-semibold */
  opacity: 0.9; /* opacity-90 */
}

/* Botões (substituem bg-primary / hover:bg-primary_alt e bg-emerald-500/90) */
.btn-primary {
  background: var(--primary, #2563eb); /* equivalente a um “primary” */
  color: #fff;
  border: 0;
  border-radius: 0.75rem; /* rounded-xl */
  padding: 0.25rem; /* p-1 */
  line-height: 0;
  cursor: pointer;
  transition: filter 0.2s ease;
}
.btn-primary:hover {
  filter: brightness(1.05);
}
.btn-chat {
  background: rgba(16, 185, 129, 0.9); /* emerald-500/90 */
  color: #fff;
  border: 0;
  border-radius: 0.75rem; /* rounded-xl */
  padding: 0.25rem; /* p-1 */
  line-height: 0;
  cursor: pointer;
  transition:
    filter 0.2s ease,
    background-color 0.2s ease;
}
.btn-chat:hover {
  background: #10b981; /* hover:bg-emerald-500 */
}

/* Ícones (substitui size-4) */
.icon-4 {
  width: 1rem;
  height: 1rem;
}
</style>
