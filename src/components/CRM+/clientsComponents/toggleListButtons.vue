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
      :class="[
        'toggle-page-button bg-base-200',
        { selected: modelValue === btn.value },
      ]"
      @click="$emit('update:modelValue', btn.value)"
    >
      {{ btn.label }}
    </button>
  </main>
</template>

<style scoped>
.toggle-page-button {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.375rem;
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
