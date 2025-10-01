<template>
  <div class="week-header">
    <div v-for="d in weekDays" :key="d" class="week-cell">{{ d }}</div>
  </div>
</template>

<script setup>
defineProps({ weekDays: { type: Array, default: () => [] } });
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
</style>
