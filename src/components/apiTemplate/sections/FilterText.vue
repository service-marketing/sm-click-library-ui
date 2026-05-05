<script setup>
import { ref, watch } from "vue";

const props = defineProps({
  modelValue: { default: null },
  placeholder: { type: String, default: "Buscar..." },
});

const emit = defineEmits(["update:modelValue"]);

const local = ref(props.modelValue ?? "");

watch(
  () => props.modelValue,
  (v) => {
    local.value = v ?? "";
  },
);

function onInput(e) {
  local.value = e.target.value;
  emit("update:modelValue", local.value || null);
}
</script>

<template>
  <div class="pt-2">
    <div class="relative">
      <svg
        class="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-gray-400 pointer-events-none"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path
          fill-rule="evenodd"
          d="M9 3.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11ZM2 9a7 7 0 1 1 12.452 4.391l3.328 3.329a.75.75 0 1 1-1.06 1.06l-3.329-3.328A7 7 0 0 1 2 9Z"
          clip-rule="evenodd"
        />
      </svg>
      <input
        :value="local"
        @input="onInput"
        @keydown.stop
        type="text"
        :placeholder="placeholder"
        class="w-full py-2 pl-8 pr-3 border dark:hover:border-teal-500 dark:active-border-teal-500 ring-0 focus:border-teal-500 rounded-lg text-sm border-base-200 bg-base-300 shadow shadow-gray-900 dark:shadow-gray-400 placeholder:text-gray-500 outline-none transition-colors focus:border-teal-500/50 focus:bg-teal-500/5"
      />
    </div>
  </div>
</template>
