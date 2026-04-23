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
    <!-- vazios antes do dia 1 -->
    <div
      v-for="i in startOffset"
      :key="'x' + i"
      class="cal-cell day-empty bg-base-300 border border-base-100"
    />

    <!-- dias -->
    <div
      v-for="(cell, i) in monthDays"
      :key="cell.key"
      :style="{ '--i': i }"
      class="cal-cell day-cell border border-base-100 bg-base-200 hover:bg-base-100"
      :class="[
        isSameMonthFn(cell.date, viewDate) ? '' : 'opacity-60',
        isSelectedDayFn(cell.date) ? 'neon-selected' : '',
        isTodayFn(cell.date) ? 'is-today' : '',
        dayEventCountFn(cell.date) > 0 ? 'has-events' : '',
      ]"
      @click="selectDayFn(cell.date)"
    >
      <div v-if="isTodayFn(cell.date)" class="cell-today-indicator show-lg">
        Hoje
      </div>

      <div class="cell-top">
        <span class="day-number">{{ cell.date.getDate() }}</span>
      </div>

      <!-- +N badge -->
      <span v-if="barsInfoFor(cell.key, cell.date).overflow > 0" class="more">
        +{{ barsInfoFor(cell.key, cell.date).overflow }}
      </span>

      <div class="bars-wrap">
        <!-- PIRÂMIDE de palitos (múltiplas LINHAS) -->
        <div class="bars-vert" :ref="(el) => registerBarsEl(cell.key, el)">
          <template v-if="barsInfoFor(cell.key, cell.date).bars > 0">
            <div
              v-for="(row, r) in barsRowsFor(cell.key, cell.date)"
              :key="'vrow' + r"
              class="vrow"
            >
              <span
                v-for="(ev, j) in row"
                :key="'vbar' + r + '-' + j"
                class="vbar"
                :style="{
                  background: getEventColor(ev),
                  boxShadow: `0 0 8px ${getEventColor(ev)}70`,
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
import { getEventColor } from "../utils/eventColors";
import { ref, onBeforeUnmount } from "vue";

const props = defineProps({
  startOffset: Number,
  monthDays: Array,
  viewDate: Date,
  isCompact: Boolean,
  isSameMonthFn: Function,
  isSelectedDayFn: Function,
  isTodayFn: Function,
  selectDayFn: Function,
  eventsByDayFn: Function,
  dayEventCountFn: Function,
  eventBarsToShowFn: Function,
  dayEventOverflowFn: Function,
});

/* ===== Palitos ===== */
const VBAR_W = 4;
const VBAR_H = 8;
const H_GAP = 4;
const V_GAP = 2;
const RESERVE_FOR_PLUS = 1;

const capacities = ref({}); // key -> { cols, rows, widths[], sum }
const observers = new Map(); // key -> ResizeObserver

function computeCapacity(el) {
  const w = el?.clientWidth || 0;
  const h = el?.clientHeight || 0;
  if (!w || !h) return { cols: 0, rows: 0, widths: [], sum: 0 };

  const cols = Math.max(0, Math.floor((w + H_GAP) / (VBAR_W + H_GAP)));
  const rows = Math.max(0, Math.floor((h + V_GAP) / (VBAR_H + V_GAP)));

  const widths = pyramidRowWidths(cols, rows);
  const sum = widths.reduce((a, b) => a + b, 0);
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
  observers.forEach((o) => o.disconnect());
  observers.clear();
});

function pyramidRowWidths(cols, rows) {
  if (cols <= 0 || rows <= 0) return [];
  const widths = [];
  const minFrac = 0.25; // topo >= 25% da base
  for (let r = 0; r < rows; r++) {
    const t = r / Math.max(1, rows - 1); // 0 topo .. 1 base
    const frac = minFrac + (1 - minFrac) * t;
    const w = Math.max(1, Math.round(cols * frac));
    widths.push(Math.min(w, cols));
  }
  return widths;
}

function barsInfoFor(key, date) {
  const total =
    (typeof props.dayEventCountFn === "function"
      ? props.dayEventCountFn(date)
      : 0) || 0;

  const cap = capacities.value[key]?.sum ?? 0;
  if (total <= cap) return { bars: total, overflow: 0 };

  const bars = Math.max(0, cap - RESERVE_FOR_PLUS);
  const overflow = Math.max(0, total - bars);
  return { bars, overflow };
}

function barsRowsFor(key, date) {
  const cap = capacities.value[key];
  if (!cap || cap.rows === 0 || cap.cols === 0) return [];

  const { widths } = cap;
  const info = barsInfoFor(key, date);
  const toShow = info.bars;

  const events =
    (typeof props.eventsByDayFn === "function"
      ? props.eventsByDayFn(date).slice(0, toShow)
      : []) || [];

  const rows = widths.map(() => []);
  let idx = 0;
  for (let r = widths.length - 1; r >= 0 && idx < events.length; r--) {
    const take = Math.min(widths[r], events.length - idx);
    rows[r] = events.slice(idx, idx + take);
    idx += take;
  }
  return rows;
}

/* ===== FLIP para saída (sem “fantasma” no canto 0,0) ===== */
const gridRef = ref(null);

function isElement(n) {
  return n && n.nodeType === 1 && typeof n.getBoundingClientRect === "function";
}

function onBeforeLeave(el) {
  if (!isElement(el)) return;

  const gridEl = gridRef.value;
  const container = gridEl && isElement(gridEl) ? gridEl : el.offsetParent;
  if (!isElement(container)) return;

  let elBox, contBox;
  try {
    elBox = el.getBoundingClientRect();
    contBox = container.getBoundingClientRect();
  } catch {
    return; // nó já pode estar saindo do DOM
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

/* ===== GRID / LAYOUT ===== */
.calendar-grid {
  position: relative; /* ref. pro absolute do leave */
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

/* ===== TOPO / NÚMERO ===== */
.cell-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
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
.neon-selected {
  box-shadow:
    0 0 0 1px var(--cyber-accent) inset,
    0 0 0 1px rgba(31, 227, 158, 0.25),
    0 0 18px rgba(31, 227, 158, 0.22);
  border-color: transparent !important;
}

/* ===== PIRÂMIDE ===== */
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
  row-gap: 2px; /* V_GAP */
  width: calc(100% - 8px);
  pointer-events: none;
  flex-shrink: 0;
}
.vrow {
  display: flex;
  align-items: flex-end;
  justify-content: center;
  column-gap: 4px; /* H_GAP */
  height: 8px; /* VBAR_H */
}
.vbar {
  width: 4px; /* VBAR_W */
  height: 8px; /* VBAR_H */
  border-radius: 2px;
  box-shadow: 0 0 8px rgba(16, 185, 129, 0.7);
  flex-shrink: 0;
}

/* +N badge */
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

/* ===== MOBILE ===== */
@media (max-width: 480px) {
  .more {
    font-size: 10px;
  }
  .calendar-grid {
    --cell-h: clamp(80px, 15vw, 84px);
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
    gap: 6px;
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

/* Hoje */
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

/* ===== TRANSIÇÕES: entrada com stagger + saída estável ===== */
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

/* saída absoluta (posição definida no hook) */
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

/* reorder suave */
.cal-move {
  transition:
    transform 180ms cubic-bezier(0.2, 0.8, 0.2, 1),
    opacity 120ms linear;
}

/* keyframes */
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

@media (prefers-reduced-motion: reduce) {
  .cal-fade-enter-active,
  .cal-fade-leave-active,
  .cal-move {
    transition: opacity 120ms linear !important;
  }
  .cal-fade-enter-from,
  .cal-fade-leave-to {
    transform: none !important;
  }
}
</style>
