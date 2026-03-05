<script setup>
const emit = defineEmits(["update:modelValue"]);

const props = defineProps({
  modelValue: {
    type: String,
    required: true,
  },
  buttons: {
    type: Array,
    required: true,
    default: () => [],
  },
});
</script>

<template>
  <main class="toggle-page-buttons-wrapper">
    <button
      v-for="btn in buttons"
      :key="btn.value"
      :disabled="btn.disabled"
      :class="['toggle-page-button', { selected: modelValue === btn.value }]"
      @click="$emit('update:modelValue', btn.value)"
      :title="
        btn.disabled
          ? 'Este recurso não está disponível para conversas em leads ou finalizadas'
          : ''
      "
    >
      <svg
        v-if="btn.disabled"
        class="size-4 text-white/80"
        aria-hidden="true"
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        fill="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          fill-rule="evenodd"
          d="M8 10V7a4 4 0 1 1 8 0v3h1a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h1Zm2-3a2 2 0 1 1 4 0v3h-4V7Zm2 6a1 1 0 0 1 1 1v3a1 1 0 1 1-2 0v-3a1 1 0 0 1 1-1Z"
          clip-rule="evenodd"
        />
      </svg>

      <p v-else class="toggle-page-button-label">{{ btn.label }}</p>
    </button>
  </main>
</template>

<style scoped>
.toggle-page-buttons-wrapper {
  display: flex;
  gap: 0.15rem;
  padding: 0;
}

.toggle-page-button {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 2.1rem;
  padding: 0.4rem 0.72rem;
  width: 100%;
  font-size: 0.8125rem;
  line-height: 1.125rem;
  font-weight: 600;
  transition-property:
    color, background-color, border-color, text-decoration-color, fill, stroke,
    opacity, box-shadow, transform, filter, backdrop-filter;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
  @apply rounded-md sm:bg-base-200 bg-base-300;
}

.toggle-page-button:hover {
  @apply bg-base-100;
}

.toggle-page-button.selected {
  border-color: rgb(34 197 94 / 0.45);
  background: linear-gradient(
    135deg,
    rgb(22 163 74 / 0.88),
    rgb(5 150 105 / 0.88)
  );
  /* box-shadow: 0 4px 12px rgb(22 163 74 / 0.28); */
}

.toggle-page-button.selected:hover {
  background: linear-gradient(135deg, rgb(22 163 74 / 1), rgb(5 150 105 / 1));
}

.toggle-page-button:disabled {
  opacity: 0.65;
  border-color: rgb(255 255 255 / 0.1);
  cursor: not-allowed;
}

.toggle-page-button-label {
  white-space: nowrap;
}
</style>
