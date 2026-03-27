<template>
  <div
    class="calendar-main bg-base-300"
    :class="{
      'calendar-main--compact': isCompact,
    }"
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
        :filter-count="Object.keys(filters).length"
        @prev="prevMonth"
        @next="nextMonth"
        @today="today"
        @toggle-compact="compact = !compact"
        @set-view-mode="viewMode = $event"
        @close-page="$emit('close-page')"
        @open-filter="onOpenFilter"
      />

      <template v-if="viewMode === 'calendar'">
        <div class="calendar-stage" :class="stageClass">
          <div
            class="calendar-stage-main"
            @pointerdown="onPointerDown"
            @pointermove="onPointerMove"
            @pointerup="onPointerUp"
            @pointercancel="onPointerCancel"
            @touchstart="onTouchStart"
            @touchmove="onTouchMove"
            @touchend="onTouchEnd"
            @touchcancel="onTouchCancel"
            :style="dragStyle"
          >
            <WeekDays
              :week-days="weekDaysPt"
              :month="monthLabelPt"
              :year="currentYear"
            />
            <CalendarGrid
              :start-offset="startOffset"
              :month-days="monthDays"
              :view-date="viewDate"
              :is-same-month-fn="isSameMonth"
              :is-selected-day-fn="isSelectedDay"
              :is-today-fn="isToday"
              :select-day-fn="selectDay"
              :day-summary-fn="daySummary"
              :day-visual-entries-fn="dayVisualEntries"
            />
          </div>

          <EventsList
            v-if="isCompact"
            class="calendar-daylist calendar-daylist--mobile"
            :loading="loading"
            :selected-label-long="selectedLabelLong"
            :recurring-groups="selectedRecurringGroups"
            :single-events="selectedSingleEventsSorted"
            :mode="'compact'"
            @reload="forceReloadCurrentMonth"
            @open-chat="(ev) => $emit('open-chat', ev)"
            @open-message="(ev) => $emit('open-message', ev)"
            @delete-message="(ev, e) => askConfirmDelete(ev, e)"
            @edit-reminder="openReminderEdit"
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
        :year="currentYear"
        @open-chat="(ev) => $emit('open-chat', ev)"
        @open-message="(ev) => $emit('open-message', ev)"
        @delete-message="(ev, e) => askConfirmDelete(ev, e)"
        @edit-reminder="openReminderEdit"
      />
    </div>

    <EventsList
      class="calendar-daylist calendar-daylist--desktop"
      :loading="loading"
      :selected-label="selectedLabel"
      :selected-label-long="selectedLabelLong"
      :recurring-groups="selectedRecurringGroups"
      :single-events="selectedSingleEventsSorted"
      :mode="isCompact ? 'compact' : 'sidebar'"
      @reload="forceReloadCurrentMonth"
      @open-chat="(ev) => $emit('open-chat', ev)"
      @open-message="(ev) => $emit('open-message', ev)"
      @delete-message="(ev, e) => askConfirmDelete(ev, e)"
      @edit-reminder="openReminderEdit"
    />
  </div>

  <confirmModal
    v-model="confirmCtl.open"
    :title="confirmCtl.title"
    :description="confirmCtl.description"
    :destructive="confirmCtl.destructive"
    :confirm-label="confirmCtl.confirmLabel"
    :cancel-label="confirmCtl.cancelLabel"
    :loading="confirmCtl.loading"
    :loading-label="confirmCtl.loadingLabel"
    :context="confirmCtl.context"
    :anchor-el="confirmCtl.anchorEl"
    placement="auto"
    align="center"
    :offset="12"
    @confirm="onConfirmModal"
    @cancel="onCancelModal"
  >
    <template #details>
      <div v-if="confirmCtl.context?.event">
        <EventItem
          :view-only="true"
          :mode="'sidebar'"
          :ev="confirmCtl.context.event"
        />
      </div>
    </template>
  </confirmModal>

  <!-- Filtro: emite parâmetros e o pai aplica .filter(...) -->
  <CalFilter
    :open="filterUI.open"
    :anchor-el="filterUI.anchorEl"
    v-model:filters="filters"
    @close="filterUI.open = false"
  />

  <!-- Modal de edição de lembretes -->
  <ReminderModal
    v-if="reminderModalOpen"
    :initial-data="reminderToEdit"
    :view-only="reminderViewOnly"
    @close="closeReminderModal"
  />
</template>

<script setup>
import confirmModal from "./components/confirmModal.vue";
import ReminderModal from "../CRM+/reminders/reminderModal/reminderModal.vue";
import {
  ref,
  computed,
  onMounted,
  watch,
} from "vue";
import { crm_scheduled } from "../../utils/systemUrls";
import {
  sameYMD,
  yearMonthKey,
  eraseScheduledEvent,
  buildRecurringGroupForDay,
  isRecurringSchedule,
} from "./useScheduledEvents";
import { storeToRefs } from "pinia";
import EventItem from "./components/EventItem.vue";
import { useScheduledStore } from "~/stores/useScheduledStore";
import { reminderList } from "../CRM+/reminders/reminderFunctions";

import CalHeader from "./components/CalHeader.vue";
import WeekDays from "./components/WeekDays.vue";
import CalendarGrid from "./components/CalendarGrid.vue";
import AgendaList from "./components/AgendaList.vue";
import EventsList from "./components/EventsList.vue";
import CalFilter from "./components/CalFilter.vue";

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

const pointerActive = ref(false);
const pointerStartX = ref(0);
const pointerDeltaX = ref(0);
const dragThreshold = 80; // pixels do drag pra ativar
const dragStyle = computed(() => {
  if (!pointerActive.value) return {};
  // gentle translate while dragging horizontally
  return { transform: `translateX(${pointerDeltaX.value}px)` };
});

function resetPointer() {
  pointerActive.value = false;
  pointerStartX.value = 0;
  pointerDeltaX.value = 0;
}

function onPointerDown(e) {
  if (e.pointerType === "mouse" && e.button !== 0) return;
  pointerActive.value = true;
  pointerStartX.value = e.clientX;
  try {
    e.target.setPointerCapture?.(e.pointerId);
  } catch {}
}

function onPointerMove(e) {
  if (!pointerActive.value) return;
  pointerDeltaX.value = e.clientX - pointerStartX.value;
}

function onPointerUp(e) {
  if (!pointerActive.value) return;
  const delta = pointerDeltaX.value;
  try {
    e.target.releasePointerCapture?.(e.pointerId);
  } catch {}
  resetPointer();
  if (delta < -dragThreshold) {
    nextMonth();
  } else if (delta > dragThreshold) {
    prevMonth();
  }
}

function onPointerCancel(e) {
  try {
    e.target.releasePointerCapture?.(e.pointerId);
  } catch {}
  resetPointer();
}
function onTouchStart(e) {
  const t = e.touches && e.touches[0];
  if (!t) return;
  pointerActive.value = true;
  pointerStartX.value = t.clientX;
  pointerDeltaX.value = 0;
}

function onTouchMove(e) {
  if (!pointerActive.value) return;
  const t = e.touches && e.touches[0];
  if (!t) return;
  pointerDeltaX.value = t.clientX - pointerStartX.value;
}

function onTouchEnd(e) {
  if (!pointerActive.value) return;
  const delta = pointerDeltaX.value;
  resetPointer();
  if (delta < -dragThreshold) nextMonth();
  else if (delta > dragThreshold) prevMonth();
}

function onTouchCancel(e) {
  resetPointer();
}

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
  if (!isSameMonth(d, viewDate.value))
    viewDate.value = new Date(d.getFullYear(), d.getMonth(), 1);
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
  return `${String(d.getDate()).padStart(2, "0")}/${String(
    d.getMonth() + 1,
  ).padStart(2, "0")}/${d.getFullYear()}`;
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

// ===== Filtro =====
const filterUI = ref({ open: false, anchorEl: null });
function onOpenFilter(e) {
  filterUI.value.open = true;
  filterUI.value.anchorEl = e?.currentTarget || null;
}
// parâmetros que o FILHO controla (v-model)
const { filters } = storeToRefs(scheduled);

// ===== Modal de lembretes =====
const reminderModalOpen = ref(false);
const reminderToEdit = ref(null);
const reminderViewOnly = ref(false);

function openReminderEdit(event) {
  reminderToEdit.value = event.raw;
  reminderViewOnly.value = event.status !== true;
  reminderModalOpen.value = true;
}

function closeReminderModal() {
  reminderModalOpen.value = false;
  reminderToEdit.value = null;
  reminderViewOnly.value = false;
}

// ===== Cache via Store =====
const currentYM = computed(() => yearMonthKey(viewDate.value));
const currentMonthEventsRaw = computed(() =>
  scheduled.eventsOf(currentYM.value),
);

// ===== Lista ATIVA (aplica filtros locais) =====
const FILTER_RESOLVERS = {
  scheduled_by: (ev) => {
    const sb =
      ev?.scheduled_by ??
      ev?.raw?.params?.scheduled_by ??
      ev?.raw?.scheduled_by ??
      ev?.created_by ??
      ev?.attendant_id;
    const id = typeof sb === "object" && sb ? (sb.id ?? sb.attendant_id) : sb;
    return id != null ? String(id) : "";
  },
  recurring_only: (ev) => isRecurringSchedule(ev?.raw?.params?.schedule || {}),
  // exemplo: status: (ev) => String(ev.status ?? ev.raw?.status ?? ""),
};

function matchesFilters(ev, f) {
  const _f = f?.value ?? f;
  if (!_f || typeof _f !== "object") return true;

  return Object.entries(_f).every(([key, want]) => {
    if (
      want == null ||
      want === "" ||
      (Array.isArray(want) && want.length === 0)
    ) {
      return true;
    }

    const resolver = FILTER_RESOLVERS[key];
    const gotRaw =
      resolver?.(ev) ??
      ev?.[key] ??
      ev?.raw?.[key] ??
      ev?.raw?.params?.[key] ??
      null;

    // normalizações leves
    const got = typeof gotRaw === "string" ? gotRaw : (gotRaw ?? "");

    // 1) função custom: (val, ev) => boolean
    if (typeof want === "function") return !!want(got, ev);

    // 2) array: IN
    if (Array.isArray(want)) return want.map(String).includes(String(got));

    // 3) objeto: operadores
    if (typeof want === "object") {
      const { in: inList, notIn, range, contains } = want;

      if (inList && !inList.map(String).includes(String(got))) return false;
      if (notIn && notIn.map(String).includes(String(got))) return false;

      // range numérico: { range: [min, max] } (limites opcionais)
      if (range && typeof got === "number") {
        const [min, max] = range;
        if ((min != null && got < min) || (max != null && got > max))
          return false;
      }

      // contains para arrays/cadeias: { contains: "x" | ["x","y"] }
      if (contains != null) {
        const arr = Array.isArray(got) ? got : String(got).split(",");
        const probe = Array.isArray(contains) ? contains : [contains];
        if (!probe.some((p) => arr.map(String).includes(String(p))))
          return false;
      }

      return true;
    }

    // 4) igualdade simples
    return String(got) === String(want);
  });
}

// ===== Lista ATIVA (aplica filtros genéricos) =====
const filteredBaseEvents = computed(() => {
  const list = currentMonthEventsRaw.value || [];
  return list.filter((ev) => matchesFilters(ev, filters));
});

function dayKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
    date.getDate(),
  ).padStart(2, "0")}`;
}

function createEmptyDayBucket(date) {
  return {
    key: `ag-${dayKey(date)}`,
    date: new Date(date.getFullYear(), date.getMonth(), date.getDate()),
    singles: [],
    recurringGroups: [],
    visualEntries: [],
    leadEvent: null,
    summary: {
      totalOccurrences: 0,
      singleCount: 0,
      recurringRulesCount: 0,
      recurringOccurrencesCount: 0,
      peakGroupCount: 0,
      visualCount: 0,
    },
  };
}

function eventSortDate(item) {
  if (item?.firstExecutionAt instanceof Date) return item.firstExecutionAt;
  if (item?.date instanceof Date) return item.date;
  return new Date(0);
}

function comparePresentationItems(a, b) {
  const diff = eventSortDate(a) - eventSortDate(b);
  if (diff !== 0) return diff;
  const aIsRecurring = a?.kind === "recurring-group";
  const bIsRecurring = b?.kind === "recurring-group";
  if (aIsRecurring !== bIsRecurring) return aIsRecurring ? -1 : 1;
  return String(a?.key || a?.id || "").localeCompare(
    String(b?.key || b?.id || ""),
  );
}

function summarizeBucket(bucket) {
  const recurringOccurrencesCount = bucket.recurringGroups.reduce(
    (sum, group) => sum + Number(group?.count || 0),
    0,
  );
  const peakGroupCount = bucket.recurringGroups.reduce(
    (max, group) => Math.max(max, Number(group?.count || 0)),
    0,
  );
  return {
    totalOccurrences: bucket.singles.length + recurringOccurrencesCount,
    singleCount: bucket.singles.length,
    recurringRulesCount: bucket.recurringGroups.length,
    recurringOccurrencesCount,
    peakGroupCount,
    visualCount: bucket.visualEntries.length,
  };
}

function buildMonthPresentation(events, monthDate) {
  const y = monthDate.getFullYear();
  const m = monthDate.getMonth();
  const totalDays = daysInMonth(monthDate);
  const buckets = new Map();

  for (let day = 1; day <= totalDays; day++) {
    const bucketDate = new Date(y, m, day);
    buckets.set(dayKey(bucketDate), createEmptyDayBucket(bucketDate));
  }

  for (const ev of events) {
    const schedule = ev?.raw?.params?.schedule || {};
    if (isRecurringSchedule(schedule)) {
      for (let day = 1; day <= totalDays; day++) {
        const bucketDate = new Date(y, m, day);
        const group = buildRecurringGroupForDay(ev, bucketDate, {
          previewLimit: 4,
        });
        if (!group) continue;

        const key = dayKey(bucketDate);
        const bucket = buckets.get(key);
        bucket.recurringGroups.push(group);
      }
      continue;
    }

    const d = ev?.date;
    if (!(d instanceof Date)) continue;
    if (d.getFullYear() !== y || d.getMonth() !== m) continue;
    const key = dayKey(d);
    const bucket = buckets.get(key);
    if (!bucket) continue;
    bucket.singles.push(ev);
  }

  const agenda = [];
  buckets.forEach((bucket) => {
    bucket.singles.sort((a, b) => a.date - b.date);
    bucket.recurringGroups.sort(comparePresentationItems);
    bucket.visualEntries = [...bucket.recurringGroups, ...bucket.singles].sort(
      comparePresentationItems,
    );
    bucket.leadEvent =
      bucket.recurringGroups[0]?.representative ||
      bucket.singles[0] ||
      null;
    bucket.summary = summarizeBucket(bucket);
    if (bucket.summary.totalOccurrences > 0) agenda.push(bucket);
  });
  agenda.sort((a, b) => a.date - b.date);

  return { buckets, agenda };
}

const monthPresentation = computed(() =>
  buildMonthPresentation(filteredBaseEvents.value, viewDate.value),
);

function dayBucket(date) {
  return (
    monthPresentation.value.buckets.get(dayKey(date)) || createEmptyDayBucket(date)
  );
}

function daySummary(date) {
  return dayBucket(date).summary;
}

function dayVisualEntries(date) {
  return dayBucket(date).visualEntries || [];
}

const selectedDayBucket = computed(() => dayBucket(selectedDate.value));
const selectedRecurringGroups = computed(() =>
  [...selectedDayBucket.value.recurringGroups].sort(comparePresentationItems),
);
const selectedSingleEventsSorted = computed(() =>
  [...selectedDayBucket.value.singles].sort((a, b) => a.date - b.date),
);

// ===== Agenda =====
const agendaDays = computed(() => monthPresentation.value.agenda);

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
// ===== Ações =====
const confirmCtl = ref({
  open: false,
  loading: false,
  context: null,
  title: "Confirmar exclusão",
  description: "Tem certeza que deseja apagar este item?",
  destructive: true,
  anchorEl: null,
  confirmLabel: "Apagar",
  cancelLabel: "Cancelar",
  loadingLabel: "Apagando…",
});

function askConfirmDelete(ev, e) {
  confirmCtl.value.open = true;
  confirmCtl.value.context = { action: "delete-message", event: ev };
  confirmCtl.value.title = "Confirmar exclusão";
  confirmCtl.value.description = "Tem certeza que deseja apagar este evento?";
  confirmCtl.value.anchorEl =
    (e && e.currentTarget) ||
    (typeof document !== "undefined" && document.activeElement) ||
    null;
  confirmCtl.value.destructive = true;
  confirmCtl.value.confirmLabel = "Apagar";
  confirmCtl.value.loadingLabel = "Apagando…";
}

async function onConfirmModal(ctx) {
  if (!ctx) return;
  try {
    confirmCtl.value.loading = true;
    if (ctx.action === "delete-message") {
      await eraseEvent(ctx.event);
    }
    if (ctx.event.type === "attendant_reminder") {
      const index = reminderList.active.reminders.findIndex(
        (p) => p.id === ctx.event.id,
      );
      if (index !== -1) reminderList.active.reminders.splice(index, 1);
    }
  } finally {
    confirmCtl.value.loading = false;
    confirmCtl.value.open = false;
    confirmCtl.value.context = null;
  }
}
function onCancelModal() {
  confirmCtl.value.open = false;
  confirmCtl.value.context = null;
}
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
    if (!hitRemoved) await scheduled.forceReload(currentYM.value);
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
});

watch(
  () => props.sourceUrl,
  async (val) => {
    scheduled.setBaseUrl(val);
    scheduled.resetAll();
    await scheduled.ensureMonthLoaded(currentYM.value);
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
});

defineExpose({ updateEvent: scheduled.applyUpdateToCache });
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
  touch-action: pan-y;
  -webkit-user-select: none;
  user-select: none;
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
</style>
