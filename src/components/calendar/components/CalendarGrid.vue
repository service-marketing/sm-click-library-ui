<template>
  <TransitionGroup
    name="cal-fade"
    move-class="cal-move"
    tag="div"
    class="cal-grid calendar-grid"
    appear
    ref="gridRef"
    @before-leave="onBeforeLeave"
    @after-leave="onAfterLeave"
  >
    <div
      v-for="i in startOffset"
      :key="'x' + i"
      class="cal-cell day-empty bg-base-300 border border-base-100"
    />

    <div
      v-for="(cell, i) in monthDays"
      :key="cell.key"
      :style="{ '--i': i }"
      class="cal-cell day-cell border border-base-100 bg-base-200 hover:bg-base-100"
      :class="[
        isSameMonthFn(cell.date, viewDate) ? '' : 'opacity-60',
        isSelectedDayFn(cell.date) ? 'neon-selected' : '',
        isTodayFn(cell.date) ? 'is-today' : '',
        visualEntriesFor(cell.date).length > 0 ? 'has-events' : '',
      ]"
      @click="selectDayFn(cell.date)"
    >
      <div v-if="isTodayFn(cell.date)" class="cell-today-indicator show-lg">
        Hoje
      </div>

      <div class="cell-top">
        <div class="cell-top-main">
          <span class="day-number">{{ cell.date.getDate() }}</span>
          <span
            v-if="recurringBadgeLabel(cell.date)"
            class="recurring-badge items-center gap-1"
            :title="recurringBadgeTitle(cell.date)"
          >
            {{ recurringBadgeLabel(cell.date) }}
            <svg
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
          </span>
        </div>
      </div>

      <span v-if="barsInfoFor(cell.key, cell.date).overflow > 0" class="more">
        +{{ barsInfoFor(cell.key, cell.date).overflow }}
      </span>

      <div class="bars-wrap">
        <div class="bars-vert" :ref="(el) => registerBarsEl(cell.key, el)">
          <template v-if="barsInfoFor(cell.key, cell.date).bars > 0">
            <div
              v-for="(row, r) in barsRowsFor(cell.key, cell.date)"
              :key="'vrow' + r"
              class="vrow"
            >
              <span
                v-for="(entry, j) in row"
                :key="'vbar' + r + '-' + j"
                class="vbar"
                :style="{
                  background: getEntryColor(entry),
                  boxShadow: `0 0 8px ${getEntryColor(entry)}70`,
                }"
              />
            </div>
          </template>
        </div>
      </div>
    </div>
  </TransitionGroup>
</template>

<script setup>
import { ref, onBeforeUnmount } from "vue";
import { getEventColor } from "../utils/eventColors";

const props = defineProps({
  startOffset: Number,
  monthDays: Array,
  viewDate: Date,
  isSameMonthFn: Function,
  isSelectedDayFn: Function,
  isTodayFn: Function,
  selectDayFn: Function,
  daySummaryFn: Function,
  dayVisualEntriesFn: Function,
});

const VBAR_W = 4;
const VBAR_H = 8;
const H_GAP = 4;
const V_GAP = 2;
const RESERVE_FOR_PLUS = 1;

const capacities = ref({});
const observers = new Map();

function summaryFor(date) {
  return (
    (typeof props.daySummaryFn === "function"
      ? props.daySummaryFn(date)
      : null) || {
      totalOccurrences: 0,
      recurringRulesCount: 0,
      recurringOccurrencesCount: 0,
      singleCount: 0,
      peakGroupCount: 0,
      visualCount: 0,
    }
  );
}

function visualEntriesFor(date) {
  return (
    (typeof props.dayVisualEntriesFn === "function"
      ? props.dayVisualEntriesFn(date)
      : []) || []
  );
}

function entryEvent(entry) {
  return entry?.kind === "recurring-group"
    ? entry.representative || entry
    : entry;
}

function getEntryColor(entry) {
  return getEventColor(entryEvent(entry));
}

function compactCount(value) {
  const count = Number(value || 0);
  if (count >= 1000) {
    return `${(count / 1000).toFixed(count >= 10000 ? 0 : 1)}k`;
  }
  return String(count);
}

function recurringBadgeLabel(date) {
  const summary = summaryFor(date);
  if (!summary.recurringRulesCount) return "";
  return `${compactCount(summary.recurringRulesCount)}`;
}

function recurringBadgeTitle(date) {
  const summary = summaryFor(date);
  if (!summary.recurringRulesCount) return "";
  return `${summary.recurringRulesCount} evento${summary.recurringRulesCount > 1 ? "s" : ""} recorrente${summary.recurringRulesCount > 1 ? "s" : ""}`;
}

function computeCapacity(el) {
  const w = el?.clientWidth || 0;
  const h = el?.clientHeight || 0;
  if (!w || !h) return { cols: 0, rows: 0, widths: [], sum: 0 };

  const cols = Math.max(0, Math.floor((w + H_GAP) / (VBAR_W + H_GAP)));
  const rows = Math.max(0, Math.floor((h + V_GAP) / (VBAR_H + V_GAP)));

  const widths = pyramidRowWidths(cols, rows);
  const sum = widths.reduce((acc, value) => acc + value, 0);
  return { cols, rows, widths, sum };
}

function updateCapacity(key, el) {
  const cap = computeCapacity(el);
  const prev = capacities.value[key];
  const changed =
    !prev ||
    prev.cols !== cap.cols ||
    prev.rows !== cap.rows ||
    prev.sum !== cap.sum;
  if (changed) {
    capacities.value = { ...capacities.value, [key]: cap };
  }
}

function registerBarsEl(key, el) {
  if (!el) {
    const ro = observers.get(key);
    if (ro) {
      ro.disconnect();
      observers.delete(key);
    }
    if (capacities.value[key] != null) {
      const clone = { ...capacities.value };
      delete clone[key];
      capacities.value = clone;
    }
    return;
  }

  updateCapacity(key, el);
  const ro = new ResizeObserver(() => updateCapacity(key, el));
  ro.observe(el);
  observers.set(key, ro);
}

onBeforeUnmount(() => {
  observers.forEach((observer) => observer.disconnect());
  observers.clear();
});

function pyramidRowWidths(cols, rows) {
  if (cols <= 0 || rows <= 0) return [];
  const widths = [];
  const minFrac = 0.25;
  for (let row = 0; row < rows; row++) {
    const t = row / Math.max(1, rows - 1);
    const frac = minFrac + (1 - minFrac) * t;
    const width = Math.max(1, Math.round(cols * frac));
    widths.push(Math.min(width, cols));
  }
  return widths;
}

function barsInfoFor(key, date) {
  const total = visualEntriesFor(date).length;
  const cap = capacities.value[key]?.sum ?? 0;
  if (total <= cap) return { bars: total, overflow: 0 };

  const bars = Math.max(0, cap - RESERVE_FOR_PLUS);
  const overflow = Math.max(0, total - bars);
  return { bars, overflow };
}

function barsRowsFor(key, date) {
  const cap = capacities.value[key];
  if (!cap || cap.rows === 0 || cap.cols === 0) return [];

  const info = barsInfoFor(key, date);
  const entries = visualEntriesFor(date).slice(0, info.bars);
  const rows = cap.widths.map(() => []);
  let idx = 0;
  for (
    let row = cap.widths.length - 1;
    row >= 0 && idx < entries.length;
    row--
  ) {
    const take = Math.min(cap.widths[row], entries.length - idx);
    rows[row] = entries.slice(idx, idx + take);
    idx += take;
  }
  return rows;
}

const gridRef = ref(null);

function isElement(node) {
  return (
    node &&
    node.nodeType === 1 &&
    typeof node.getBoundingClientRect === "function"
  );
}

function onBeforeLeave(el) {
  if (!isElement(el)) return;

  const gridEl = gridRef.value;
  const container = gridEl && isElement(gridEl) ? gridEl : el.offsetParent;
  if (!isElement(container)) return;

  let elBox;
  let contBox;
  try {
    elBox = el.getBoundingClientRect();
    contBox = container.getBoundingClientRect();
  } catch {
    return;
  }

  const scrollLeft = container.scrollLeft || 0;
  const scrollTop = container.scrollTop || 0;

  el.style.position = "absolute";
  el.style.zIndex = "0";
  el.style.top = `${elBox.top - contBox.top + scrollTop}px`;
  el.style.left = `${elBox.left - contBox.left + scrollLeft}px`;
  el.style.width = `${elBox.width}px`;
  el.style.height = `${elBox.height}px`;
  el.style.pointerEvents = "none";
}

function onAfterLeave(el) {
  if (!el || !el.style) return;
  requestAnimationFrame(() => {
    if (!el || !el.style) return;
    el.style.position = "";
    el.style.zIndex = "";
    el.style.top = "";
    el.style.left = "";
    el.style.width = "";
    el.style.height = "";
    el.style.pointerEvents = "";
  });
}
</script>

<style src="../utils/calendarTheme.css"></style>
<style scoped>
:global(:root) {
  --neo-muted: #6b8c8a;
  --today-fg: #19e3a2;
  --today-glow: rgba(25, 227, 163, 0.57);
  --day-glow: rgba(31, 227, 158, 0.25);

  --badge-bg: rgba(0, 0, 0, 0.35);
  --badge-br: rgba(0, 255, 178, 0.7);
  --badge-glow: rgba(0, 255, 178, 0.45);

  --bars-top-reserve: 22px;
}
:global(.dark) {
  --neo-muted: #7ecdc2;
  --today-fg: #79e3d9;
  --today-glow: rgba(121, 227, 217, 0.35);
  --day-glow: rgba(31, 227, 158, 0.25);
}

.calendar-grid {
  position: relative;
  z-index: 10;
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  gap: 0.25rem;
  padding-left: 0.5rem;
  padding-right: 0.5rem;
  padding-bottom: 0.75rem;
  flex: 1 1 auto;
  overflow: auto;
  --cell-h: clamp(84px, 12vw, 15vh);
  grid-auto-rows: var(--cell-h);
}

.cal-cell {
  min-height: var(--cell-h);
  height: auto;
  position: relative;
  border-radius: 0.75rem;
  overflow: hidden;
  transition:
    background-color 0.2s ease,
    border-color 0.2s ease,
    transform 0.2s ease;
  will-change: transform, opacity;
  contain: paint;
}

.day-cell {
  cursor: pointer;
  padding: 0.25rem;
  display: flex;
  flex-direction: column;
}

.opacity-60 {
  opacity: 0.6;
}

.cell-top {
  display: flex;
  align-items: center;
  justify-content: flex-start;
}

.cell-top-main {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  min-width: 0;
  position: relative;
}

.day-number {
  font-size: 0.875rem;
  font-weight: 600;
  text-shadow: 0 0 6px var(--day-glow);
}

.is-today .day-number {
  color: var(--cyber-accent);
  text-shadow: 0 0 10px var(--today-glow);
}

.recurring-badge {
  display: inline-flex;
  align-items: center;
  max-width: 58px;
  padding: 0 0.32rem;
  height: 18px;
  border-radius: 999px;
  background: rgba(59, 130, 246, 0.18);
  border: 1px solid rgba(59, 130, 246, 0.28);
  color: #60a5fa;
  font-size: 10px;
  font-weight: 700;
  line-height: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex-shrink: 0;
}

.neon-selected {
  box-shadow:
    0 0 0 1px var(--cyber-accent) inset,
    0 0 0 1px rgba(31, 227, 158, 0.25),
    0 0 18px rgba(31, 227, 158, 0.22);
  border-color: transparent !important;
}

.bars-wrap {
  margin-top: 0.25rem;
  position: relative;
  flex: 1 1 auto;
}

.bars-vert {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  bottom: 4px;
  top: var(--bars-top-reserve);
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  align-items: center;
  row-gap: 2px;
  width: calc(100% - 8px);
  pointer-events: none;
  flex-shrink: 0;
}

.vrow {
  display: flex;
  align-items: flex-end;
  justify-content: center;
  column-gap: 4px;
  height: 8px;
}

.vbar {
  width: 4px;
  height: 8px;
  border-radius: 2px;
  box-shadow: 0 0 8px rgba(16, 185, 129, 0.7);
  flex-shrink: 0;
}

.more {
  position: absolute;
  bottom: calc(var(--bars-top-reserve) + 4px + 6px);
  left: 50%;
  transform: translateX(-50%);
  font-size: 13.5px;
  font-weight: 700;
  letter-spacing: 0.2px;
  color: var(--cyber-accent);
  border-radius: 6px;
  text-shadow: 0 0 6px var(--cyber-accent-glow);
  pointer-events: none;
}

@media (max-width: 480px) {
  .more {
    font-size: 10px;
  }

  .recurring-badge {
    display: none;
  }

  .calendar-grid {
    --cell-h: clamp(80px, 15vw, 84px);
    --bars-top-reserve: 22px;
    gap: 2px;
    padding-left: 0.25rem;
    padding-right: 0.25rem;
  }

  .cal-cell {
    background: transparent !important;
    border-color: transparent !important;
    border-radius: 0 !important;
    padding: 4px 2px 12px 2px;
  }

  .cal-cell:hover {
    background: transparent !important;
  }

  .cell-top {
    justify-content: center !important;
    min-height: 24px;
  }

  .cell-top-main {
    gap: 0;
    width: 100%;
    justify-content: center;
  }

  .neon-selected {
    box-shadow: none !important;
    border-color: transparent !important;
  }

  .neon-selected .day-number {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    border-radius: 9999px;
    background: rgba(31, 227, 158, 0.15);
    border: 1px solid rgba(31, 227, 158, 0.6);
    box-shadow: 0 0 8px rgba(31, 227, 158, 0.35);
  }

  .has-events .day-number {
    font-weight: 700;
  }
}

.cell-today-indicator {
  position: absolute;
  top: 6px;
  right: 0%;
  transform: translateX(-50%);
  font-size: 10px;
  font-weight: 600;
  color: var(--cyber-accent);
  text-shadow: 0 0 6px var(--cyber-accent-glow);
  pointer-events: none;
  user-select: none;
}

.show-lg {
  display: none;
}

@media (min-width: 1280px) {
  .show-lg {
    display: inline-flex;
  }
}

.cal-fade-enter-from,
.cal-fade-appear-from {
  opacity: 0;
  transform: translateY(8px) scale(0.985);
  filter: saturate(0.9);
}

.cal-fade-enter-to,
.cal-fade-appear-to {
  opacity: 1;
  transform: translateY(0) scale(1);
  filter: saturate(1);
}

.cal-fade-enter-active,
.cal-fade-appear-active {
  animation: cal-pop-in 200ms cubic-bezier(0.2, 0.8, 0.2, 1) both;
  animation-delay: calc(min(var(--i, 0) * 10ms, 120ms));
}

.cal-fade-leave-active {
  position: absolute;
  z-index: 0;
  animation: cal-pop-out 150ms cubic-bezier(0.2, 0.6, 0.2, 1) both;
}

.cal-fade-leave-from {
  opacity: 0.9;
  transform: translateY(0) scale(1);
}

.cal-fade-leave-to {
  opacity: 0;
  transform: translateY(-6px) scale(0.985);
}

.cal-move {
  transition:
    transform 180ms cubic-bezier(0.2, 0.8, 0.2, 1),
    opacity 120ms linear;
}

@keyframes cal-pop-in {
  0% {
    opacity: 0;
    transform: translateY(10px) scale(0.98);
  }

  60% {
    transform: translateY(-2px) scale(1.006);
  }

  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes cal-pop-out {
  0% {
    opacity: 0.9;
    transform: translateY(0) scale(1);
  }

  100% {
    opacity: 0;
    transform: translateY(-6px) scale(0.985);
  }
}
</style>
