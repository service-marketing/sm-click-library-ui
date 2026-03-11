<script setup>
defineProps({
  emptyText: { type: String, default: "Nenhum item encontrado" },
  hasActiveFilters: { type: Boolean, default: false },
  chips: { type: Array, default: () => [] },
});

const emit = defineEmits(["clear-filter", "clear-all"]);

function getFilterKey(col) {
  return col.filter?.key || col.key;
}
</script>

<template>
  <div class="mx-auto flex w-full flex-col items-center px-4 gap-3">
    <!-- Icon -->
    <div
      :class="[
        'mx-auto rounded-full p-3',
        hasActiveFilters
          ? 'bg-sky-100 text-sky-500 dark:bg-base-100 dark:text-sky-400'
          : 'bg-blue-100 text-blue-500 dark:bg-base-100 dark:text-blue-400',
      ]"
    >
      <!-- Filter icon -->
      <svg
        v-if="hasActiveFilters"
        xmlns="http://www.w3.org/2000/svg"
        fill="currentColor"
        viewBox="0 0 24 24"
        class="w-12"
      >
        <path
          d="M5.05 3C3.291 3 2.352 5.024 3.51 6.317l5.422 6.059v4.874c0 .472.227.917.613 1.2l3.069 2.25c1.01.742 2.454.036 2.454-1.2v-7.124l5.422-6.059C21.647 5.024 20.708 3 18.95 3H5.05Z"
        />
      </svg>
      <!-- Search icon -->
      <svg
        v-else
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke-width="1.5"
        stroke="currentColor"
        class="w-12"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
        />
      </svg>
    </div>

    <h1 class="text-base font-semibold text-current">
      {{
        hasActiveFilters
          ? "Nenhum resultado para os filtros aplicados"
          : emptyText
      }}
    </h1>

    <!-- Active filter chips -->
    <div
      v-if="hasActiveFilters"
      class="flex flex-wrap justify-center gap-2 max-w-md"
    >
      <span
        v-for="chip in chips"
        :key="getFilterKey(chip.col)"
        class="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-base-200 border-base-100"
      >
        <span
          class="opacity-80 dark:text-sky-500 text-sky-300 uppercase tracking-wide"
          >{{ chip.col.label }}:</span
        >
        <span class="truncate max-w-32">{{ chip.label }}</span>
        <button
          type="button"
          class="flex-shrink-0 rounded-full hover:bg-sky-400/20 opacity-70 hover:opacity-100 transition-colors p-0.5"
          @click="emit('clear-filter', chip.col)"
        >
          <svg
            class="size-3.5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="3"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M6 18 18 6M6 6l12 12"
            />
          </svg>
        </button>
      </span>
    </div>

    <button
      v-if="hasActiveFilters"
      type="button"
      class="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm font-semibold dark:text-amber-500 border-amber-400/30 bg-base-200 text-amber-300 hover:bg-amber-400/20 hover:border-amber-400/50 transition-all"
      @click="emit('clear-all')"
    >
      <svg
        class="size-3.5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99"
        />
      </svg>
      Limpar todos os filtros
    </button>

    <slot v-else name="empty-action" />
  </div>
</template>
