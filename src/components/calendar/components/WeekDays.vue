<template>
  <h2 class="month-title" :title="`${month} ${year}`">
    {{ month }} {{ year }}
  </h2>
  <div class="week-header">
    <div v-for="d in weekDays" :key="d" class="week-cell">{{ d }}</div>
  </div>
</template>

<script setup>
defineProps({
  weekDays: { type: Array, default: () => [] },
  month: String,
  year: [String, Number],
});
</script>

<style scoped>
/* ===== Vars + Dark ===== */
:global(:root) {
  --neo-muted: #6b8c8a; /* texto dos dias (claro) */
}
:global(.dark) {
  --neo-muted: #7ecdc2; /* texto dos dias (escuro) */
}

/* ===== Layout ===== */
.week-header {
  position: relative; /* relative */
  z-index: 10; /* z-10 */
  display: grid; /* grid */
  grid-template-columns: repeat(7, minmax(0, 1fr)); /* grid-cols-7 */
  text-align: center; /* text-center */
  font-size: 12px; /* text-[12px] */
  font-weight: 600; /* font-semibold */
  padding: 0.5rem 0.75rem; /* py-2 px-3 */
  user-select: none; /* select-none */
  color: var(--neo-muted); /* text-neo-muted */
}

.week-cell {
  padding: 0.25rem 0; /* py-1 */
  letter-spacing: 0.1em; /* tracking-widest aprox */
}

.month-title {
  min-width: 0;
  text-align: center;
  overflow: hidden;
  text-overflow: ellipsis;
  letter-spacing: 0.16em;
  color: var(--cyber-accent);
  text-shadow: 0 0 3px var(--cyber-accent);
  font-weight: 700;
  font-size: clamp(0.9rem, 2.2vw, 1.12rem);
  padding: 0 0.25rem;
  padding-top: 0.5rem /* 8px */;
  padding-bottom: 0rem /* 8px */;
  flex-shrink: 0;
}

@media (min-width: 640px) {
  .month-title {
    display: none;
  }
}
</style>
