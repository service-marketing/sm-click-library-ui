<template>
  <div
    class="calendar-main bg-base-300"
    :class="{ 'calendar-main--compact': isCompact }"
  >
    <!-- Área principal -->
    <div class="calendar-content">
      <!-- glow discreto -->
      <div class="cyber-glow-overlay"></div>

      <CalHeader
        :month="monthLabelPt"
        :year="currentYear"
        :is-compact="isCompact"
        :view-mode="viewMode"
        @prev="prevMonth"
        @next="nextMonth"
        @today="today"
        @toggle-compact="compact = !compact"
        @set-view-mode="viewMode = $event"
        @close-page="$emit('close-page')"
      />

      <template v-if="viewMode === 'calendar'">
        <div class="calendar-stage" :class="stageClass">
          <div class="calendar-stage-main">
            <WeekDays :week-days="weekDaysPt" />
            <CalendarGrid
              :start-offset="startOffset"
              :month-days="monthDays"
              :view-date="viewDate"
              :is-compact="isCompact"
              :is-same-month-fn="isSameMonth"
              :is-selected-day-fn="isSelectedDay"
              :is-today-fn="isToday"
              :select-day-fn="selectDay"
              :events-by-day-fn="eventsByDay"
              :day-event-count-fn="dayEventCount"
              :event-bars-to-show-fn="eventBarsToShow"
              :day-event-overflow-fn="dayEventOverflow"
            />
          </div>

          <EventsList
            v-if="isCompact"
            class="calendar-daylist calendar-daylist--mobile"
            :loading="loading"
            :selected-label-long="selectedLabelLong"
            :events="selectedEventsSorted"
            :mode="'compact'"
            @reload="forceReloadCurrentMonth"
            @open-chat="(ev) => $emit('open-chat', ev)"
            @open-message="(ev) => $emit('open-message', ev)"
            @delete-message="eraseEvent"
          />
        </div>
      </template>

      <AgendaList
        v-else
        :days="agendaDays"
        :weekday-long="weekdayLongPt"
        :weekday-short="weekdayShortPt"
        :month-short="monthShortPt"
        :month-label-of="monthLabelOf"
        @open-chat="(ev) => $emit('open-chat', ev)"
        @open-message="(ev) => $emit('open-message', ev)"
        @delete-message="eraseEvent"
      />
    </div>

    <EventsList
      class="calendar-daylist calendar-daylist--desktop"
      :loading="loading"
      :selected-label="selectedLabel"
      :selected-label-long="selectedLabelLong"
      :events="selectedEventsSorted"
      :mode="isCompact ? 'compact' : 'sidebar'"
      @reload="forceReloadCurrentMonth"
      @open-chat="(ev) => $emit('open-chat', ev)"
      @open-message="(ev) => $emit('open-message', ev)"
      @delete-message="eraseEvent"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { crm_scheduled } from "../../utils/systemUrls";
import {
  sameYMD,
  yearMonthKey,
  parseDateLocal,
  formatTimeHM,
  eraseScheduledEvent,
} from "./useScheduledEvents";

import { useScheduledStore } from "~/stores/useScheduledStore";

import CalHeader from "./components/CalHeader.vue";
import WeekDays from "./components/WeekDays.vue";
import CalendarGrid from "./components/CalendarGrid.vue";
import AgendaList from "./components/AgendaList.vue";
import EventsList from "./components/EventsList.vue";

const props = defineProps({
  sourceUrl: { type: String, default: "/crm_scheduled" },
  initialDate: { type: [String, Date], default: () => new Date() },
});
const emit = defineEmits(["open-chat", "loaded", "open-message", "close-page"]);

// ===== Store =====
const scheduled = useScheduledStore();
scheduled.setBaseUrl(props.sourceUrl);

// ===== Datas =====
const todayDate = new Date();
const viewDate = ref(normalizeToMonth(props.initialDate));
const selectedDate = ref(
  new Date(todayDate.getFullYear(), todayDate.getMonth(), todayDate.getDate()),
);
const viewMode = ref("calendar");

function normalizeToMonth(d) {
  if (d instanceof Date) return new Date(d.getFullYear(), d.getMonth(), 1);
  if (typeof d === "string") {
    const [y, m] = d.split("-").map((x) => parseInt(x, 10));
    return new Date(
      y || todayDate.getFullYear(),
      (m || todayDate.getMonth() + 1) - 1,
      1,
    );
  }
  return new Date(todayDate.getFullYear(), todayDate.getMonth(), 1);
}
function daysInMonth(date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
}
function firstWeekday(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
}
function isSameMonth(a, b) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
}
function isToday(d) {
  return sameYMD(d, todayDate);
}
function isSelectedDay(d) {
  return sameYMD(d, selectedDate.value);
}
function selectDay(d) {
  selectedDate.value = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  if (!isSameMonth(d, viewDate.value)) {
    viewDate.value = new Date(d.getFullYear(), d.getMonth(), 1);
  }
}
function prevMonth() {
  viewDate.value = new Date(
    viewDate.value.getFullYear(),
    viewDate.value.getMonth() - 1,
    1,
  );
}
function nextMonth() {
  viewDate.value = new Date(
    viewDate.value.getFullYear(),
    viewDate.value.getMonth() + 1,
    1,
  );
}
function today() {
  viewDate.value = new Date(todayDate.getFullYear(), todayDate.getMonth(), 1);
  selectedDate.value = new Date(
    todayDate.getFullYear(),
    todayDate.getMonth(),
    todayDate.getDate(),
  );
}

// ===== Labels PT =====
const monthsPt = [
  "janeiro",
  "fevereiro",
  "março",
  "abril",
  "maio",
  "junho",
  "julho",
  "agosto",
  "setembro",
  "outubro",
  "novembro",
  "dezembro",
];
const weekDaysPt = ["DOM", "SEG", "TER", "QUA", "QUI", "SEX", "SÁB"];
const monthLabelPt = computed(() =>
  capitalize(monthsPt[viewDate.value.getMonth()]),
);
const currentYear = computed(() => viewDate.value.getFullYear());
const selectedLabel = computed(() => formatDMY(selectedDate.value));
const selectedLabelLong = computed(
  () => `${weekdayLongPt(selectedDate.value)} ${selectedDate.value.getDate()}`,
);
function formatDMY(d) {
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
}
function weekdayLongPt(d) {
  return ["DOMINGO", "SEGUNDA", "TERÇA", "QUARTA", "QUINTA", "SEXTA", "SÁBADO"][
    d.getDay()
  ];
}
function weekdayShortPt(d) {
  return ["DOM", "SEG", "TER", "QUA", "QUI", "SEX", "SÁB"][d.getDay()];
}
function monthShortPt(d) {
  return [
    "JAN",
    "FEV",
    "MAR",
    "ABR",
    "MAI",
    "JUN",
    "JUL",
    "AGO",
    "SET",
    "OUT",
    "NOV",
    "DEZ",
  ][d.getMonth()];
}
function monthLabelOf(d) {
  return monthsPt[d.getMonth()];
}
function capitalize(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// ===== Células =====
const startOffset = computed(() => firstWeekday(viewDate.value));
const monthDays = computed(() => {
  const total = daysInMonth(viewDate.value);
  return Array.from({ length: total }, (_, i) => {
    const day = i + 1;
    const d = new Date(
      viewDate.value.getFullYear(),
      viewDate.value.getMonth(),
      day,
    );
    return { key: `d${day}`, date: d };
  });
});

// ===== Cache via Store =====
const currentYM = computed(() => yearMonthKey(viewDate.value));
const currentMonthEvents = computed(() => scheduled.eventsOf(currentYM.value));

// ===== Eventos atuais =====
function eventsByDay(date) {
  return currentMonthEvents.value.filter((e) => sameYMD(e.date, date));
}
const selectedEvents = computed(() => eventsByDay(selectedDate.value));
const selectedEventsSorted = computed(() =>
  [...selectedEvents.value].sort((a, b) => a.date - b.date),
);
function dayEventCount(date) {
  return eventsByDay(date).length;
}
function eventBarsToShow(date) {
  return Math.min(3, dayEventCount(date));
}
function dayEventOverflow(date) {
  const c = dayEventCount(date);
  return c > 3 ? c - 3 : 0;
}

// ===== Agenda =====
const agendaDays = computed(() => {
  const y = viewDate.value.getFullYear();
  const m = viewDate.value.getMonth();
  const map = new Map();
  for (const ev of currentMonthEvents.value) {
    const d = ev?.date;
    if (!(d instanceof Date)) continue;
    if (d.getFullYear() !== y || d.getMonth() !== m) continue;
    const key = `${y}-${m + 1}-${d.getDate()}`;
    if (!map.has(key))
      map.set(key, {
        key: `ag-${key}`,
        date: new Date(y, m, d.getDate()),
        events: [],
      });
    map.get(key).events.push(ev);
  }
  const arr = Array.from(map.values());
  for (const g of arr) g.events.sort((a, b) => a.date - b.date);
  arr.sort((a, b) => a.date - b.date);
  return arr;
});

// ===== Responsivo =====
const compact = ref(false);
const isSmall = ref(false);
const isCompact = computed(() => isSmall.value || compact.value);
const stageClass = computed(() =>
  isCompact ? "calendar-stage--compact" : "calendar-stage--single",
);

function setupMedia() {
  const mql = window.matchMedia("(max-width: 1280px)");
  const update = () => (isSmall.value = mql.matches);
  update();
  mql.addEventListener?.("change", update);
}

// ===== Loading/Erro por mês =====
const loading = computed(() => scheduled.isLoading(currentYM.value));
const error = computed(() => scheduled.errorOf(currentYM.value));

// ===== Ações =====
async function forceReloadCurrentMonth() {
  await scheduled.forceReload(currentYM.value);
}

async function eraseEvent(event) {
  try {
    event.deleteLoading = true;
    const eid = event?.raw?.id ?? event?.id ?? event;
    if (eid == null) throw new Error("Evento inválido para exclusão");

    const res = await eraseScheduledEvent(crm_scheduled, event);
    if (!res?.ok) return res;

    const hitRemoved = scheduled.removeFromCache(String(eid));
    if (!hitRemoved) {
      await scheduled.forceReload(currentYM.value);
    }
    return res;
  } catch (error) {
    console.error(error);
    return null;
  } finally {
    event.deleteLoading = false;
  }
}

// ===== Lifecycles / watchers =====
onMounted(async () => {
  setupMedia();
  await scheduled.ensureMonthLoaded(currentYM.value);
  if (
    !eventsByDay(selectedDate.value).length &&
    currentMonthEvents.value.length
  ) {
    const first = currentMonthEvents.value[0];
    selectedDate.value = new Date(
      first.date.getFullYear(),
      first.date.getMonth(),
      first.date.getDate(),
    );
  }
});

watch(
  () => props.sourceUrl,
  async (val) => {
    scheduled.setBaseUrl(val);
    scheduled.resetAll();
    await scheduled.ensureMonthLoaded(currentYM.value);
    if (
      !eventsByDay(selectedDate.value).length &&
      currentMonthEvents.value.length
    ) {
      const first = currentMonthEvents.value[0];
      selectedDate.value = new Date(
        first.date.getFullYear(),
        first.date.getMonth(),
        first.date.getDate(),
      );
    }
  },
);

watch(currentYM, async () => {
  const y = viewDate.value.getFullYear();
  const m = viewDate.value.getMonth();
  const day = Math.min(
    selectedDate.value.getDate(),
    daysInMonth(viewDate.value),
  );
  selectedDate.value = new Date(y, m, day);

  await scheduled.ensureMonthLoaded(currentYM.value);

  if (
    !eventsByDay(selectedDate.value).length &&
    currentMonthEvents.value.length
  ) {
    const first = currentMonthEvents.value[0];
    selectedDate.value = new Date(
      first.date.getFullYear(),
      first.date.getMonth(),
      first.date.getDate(),
    );
  }
});

defineExpose({
  updateEvent: scheduled.applyUpdateToCache,
});
</script>

<style scoped>
.calendar-main {
  display: grid;
  grid-template-columns: 1fr;
  min-height: 0;
  width: 100%;
}

.calendar-main--compact {
  height: 100vh;
}

@media (min-width: 1280px) {
  .calendar-main {
    grid-template-columns: 1fr 340px;
  }
}

.calendar-content {
  position: relative;
  overflow: auto;
  min-height: 0;
  height: 100%;
  display: flex;
  flex-direction: column;
}

@media (min-width: 1024px) {
  .calendar-content {
    overflow: hidden;
  }
}

.cyber-glow-overlay {
  pointer-events: none;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 10;
  filter: blur(48px);
  opacity: 0.7;
  background:
    radial-gradient(
      60% 60% at 50% 50%,
      rgba(34, 226, 160, 0.12),
      transparent 70%
    ),
    radial-gradient(
      40% 40% at 0% 50%,
      rgba(34, 226, 160, 0.1),
      transparent 70%
    ),
    radial-gradient(
      40% 40% at 100% 50%,
      rgba(34, 226, 160, 0.1),
      transparent 70%
    );
}

.calendar-stage {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.calendar-stage--single {
  display: flex;
  flex-direction: column;
}

.calendar-stage--compact {
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.calendar-stage-main {
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
  flex: 1;
}

.calendar-stage--compact .calendar-stage-main {
  flex: 1;
  min-height: 0;
  overflow: auto;
}

.calendar-daylist {
  min-height: 0;
  overflow: auto;
}

.calendar-daylist--mobile {
  flex: none;
  max-height: 40%;
}

.calendar-daylist--desktop {
  display: none;
}

@media (min-width: 1024px) {
  .calendar-daylist--desktop {
    display: block;
  }

  .calendar-daylist--mobile {
    display: none;
  }
}

.calendar-stage--compact .calendar-daylist--mobile {
  flex: none;
  max-height: 40%;
  overflow: auto;
}

.calendar-stage--compact .calendar-daylist--mobile.daylist--tight {
  max-height: 82px;
}

.nav-button {
  height: 32px;
  width: 32px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  background-color: var(--cyber-bg);
  transition: all 0.2s ease;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.nav-button:hover {
  background-color: var(--cyber-bg-light);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
}

.nav-button:active {
  transform: scale(0.98);
}

.action-button {
  padding: 8px 12px;
  color: white;
  border-radius: 50%;
  font-size: 0.75rem;
  font-weight: 500;
  transition: all 0.2s ease;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.action-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.action-button:active {
  transform: translateY(0);
}

.text-neo-muted {
  color: #79e3d9;
  opacity: 0.95;
}

.month-title {
  color: #d0fff6;
  text-shadow:
    0 0 8px rgba(31, 227, 158, 0.35),
    0 0 20px rgba(31, 227, 158, 0.18);
  font-weight: 700;
  font-size: clamp(0.9rem, 2.2vw, 1.12rem);
  letter-spacing: 0.16em;
  text-align: center;
}

@media (prefers-color-scheme: dark) {
  .text-neo-muted {
    color: #7ecdc2;
  }

  .month-title {
    color: #71a49d;
    text-shadow:
      0 0 8px rgba(113, 164, 157, 0.35),
      0 0 20px rgba(113, 164, 157, 0.18);
  }
}

.flex {
  display: flex;
}

.flex-col {
  flex-direction: column;
}

.min-h-0 {
  min-height: 0;
}

.overflow-auto {
  overflow: auto;
}

.overflow-hidden {
  overflow: hidden;
}

.relative {
  position: relative;
}

.hidden {
  display: none;
}

@media (min-width: 1024px) {
  .lg-hidden {
    display: none;
  }

  .lg-block {
    display: block;
  }
}
</style>
