<template>
  <div class="flex items-center justify-between gap-4 px-4 py-2">
    <!-- Footer text: "X-Y de Z" -->
    <span v-if="totalItems > 0" class="text-xs text-base-content/30 tabular-nums">
      {{ firstItem }}-{{ lastItem }} de {{ totalItems }}
    </span>

    <!-- Pagination buttons -->
    <div class="flex items-center gap-0.5">
      <button
        :disabled="currentPage <= 1"
        @click="$emit('change', currentPage - 1)"
        class="action-btn size-7 text-base-content/40 hover:text-base-content hover:bg-base-content/[0.06] disabled:opacity-30 disabled:cursor-not-allowed"
      >
        <svg class="size-3.5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <template v-for="page in pages" :key="page">
        <span v-if="page === '...'" class="flex items-center justify-center size-7 text-xs text-base-content/25 select-none">…</span>
        <button
          v-else
          @click="$emit('change', page)"
          :class="[
            'flex items-center justify-center size-7 rounded-lg text-xs font-medium transition-colors',
            page === currentPage
              ? 'bg-primary/15 text-primary border border-primary/30'
              : 'text-base-content/50 hover:text-base-content hover:bg-base-content/[0.06]'
          ]"
        >{{ page }}</button>
      </template>

      <button
        :disabled="currentPage >= totalPages"
        @click="$emit('change', currentPage + 1)"
        class="action-btn size-7 text-base-content/40 hover:text-base-content hover:bg-base-content/[0.06] disabled:opacity-30 disabled:cursor-not-allowed"
      >
        <svg class="size-3.5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  currentPage: { type: Number, required: true },
  totalItems: { type: Number, required: true },
  itemsPerPage: { type: Number, default: 15 }
});

defineEmits(["change"]);

const totalPages = computed(() => Math.max(1, Math.ceil(props.totalItems / props.itemsPerPage)));

const firstItem = computed(() => {
  if (props.totalItems === 0) return 0;
  return (props.currentPage - 1) * props.itemsPerPage + 1;
});

const lastItem = computed(() => {
  return Math.min(props.currentPage * props.itemsPerPage, props.totalItems);
});

const pages = computed(() => {
  const t = totalPages.value;
  const c = props.currentPage;

  if (t <= 7) return Array.from({ length: t }, (_, i) => i + 1);
  if (c <= 4) return [1, 2, 3, 4, 5, "...", t];
  if (c >= t - 3) return [1, "...", t - 4, t - 3, t - 2, t - 1, t];
  return [1, "...", c - 1, c, c + 1, "...", t];
});
</script>
