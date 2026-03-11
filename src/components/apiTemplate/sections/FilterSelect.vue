<script setup>
const props = defineProps({
  options: { type: Array, default: () => [] },
  modelValue: { default: null },
});

const emit = defineEmits(["update:modelValue"]);

function toggle(value) {
  emit("update:modelValue", props.modelValue === value ? null : value);
}
</script>

<template>
  <div class="pt-2">
    <div class="grid grid-cols-2 gap-2">
      <button
        v-for="opt in options"
        :key="opt.value"
        type="button"
        :class="[
          'px-3 py-2.5 rounded-lg shadow dark:shadow-gray-400 shadow-gray-900 text-xs font-semibold text-center cursor-pointer transition-all duration-150 border',
          modelValue === opt.value
            ? 'border-primary text-primary dark:bg-sky-100/30 bg-primary/10 shadow-[0_0_0_3px_rgba(105,238,183,0.1)]'
            : 'bg-base-300 border hover:border-primary border-base-200 hover:-translate-y-px',
        ]"
        @click="toggle(opt.value)"
      >
        {{ opt.label }}
      </button>
    </div>
  </div>
</template>
