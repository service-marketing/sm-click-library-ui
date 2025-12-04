<script setup>
/**
 * 📋 Descrição:
 * Componente que troca o estado do formulário e define a quantidade de botões exibidos.
 */

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
  <main class="flex gap-1 px-1">
    <button
      v-for="btn in buttons"
      :key="btn.value"
      :disabled="btn.disabled"
      :class="[
        'toggle-page-button bg-base-200',
        { selected: modelValue === btn.value },
      ]"
      @click="$emit('update:modelValue', btn.value)"
      :title="
        btn.disabled
          ? 'Este recurso não está disponível para conversas em leads ou finalizadas'
          : ''
      "
    >
      <svg
        v-if="btn.disabled"
        class="size-4 text-white"
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

      <p v-else>{{ btn.label }}</p>
    </button>
  </main>
</template>

<style scoped>
.toggle-page-button {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.235rem;
  width: 100%;
  font-size: 0.75rem;
  line-height: 1rem;
  font-weight: 500;
  font-family:
    ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji",
    "Segoe UI Symbol", "Noto Color Emoji";
  transition-property:
    color, background-color, border-color, text-decoration-color, fill, stroke,
    opacity, box-shadow, transform, filter, backdrop-filter;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
  border-radius: 0.375rem /* 6px */;
}
.toggle-page-button:hover {
  background-color: rgb(38 52 61 / 0.7);
}
.toggle-page-button.selected {
  background-color: #16a34ad6;
}
.toggle-page-button.selected:hover {
  background-color: #16a34a;
}
</style>
