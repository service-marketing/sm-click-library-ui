<script setup>
import { ref, computed } from "vue";
import { onClickOutside } from "@vueuse/core";

const props = defineProps({
  config: {
    type: Object,
    default: {
      title: "select_primary",
    },
  },
});

const emits = defineEmits(["closeSelect"]);

const isOpen = ref(false);
const target = ref(null);

const hasFreeSlot = computed(() =>
  props.selectConfig.some((item) => item.freeSlot)
);

const toggleSelect = () => {
  isOpen.value = !isOpen.value;
};

const closeSelect = () => {
  isOpen.value = false;
  emits("closeSelect");
};

const closeSelectOutside = () => {
  if (isOpen.value) isOpen.value = false;
};

onClickOutside(target, closeSelectOutside);
</script>

<template>
  <div ref="target" class="relative w-full">
    <button
      @click="toggleSelect"
      class="bg-base-100 z-10 truncate flex items-center justify-between gap-6 p-2 rounded-md lg:mt-0 w-full shadow-md shadow-base-300"
    >
      <div>
        <p class="line-clamp-2 uppercase text-xs truncate text-white">
          {{ config.title }}
        </p>
      </div>
      <div>
        <svg
          :class="isOpen ? 'rotate-180 transition-transform ease-in-out' : ''"
          class="w-3 h-3 text-white"
          xmlns="http://www.w3.org/2000/svg"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            fill-rule="evenodd"
            d="M18.4 10.3A2 2 0 0 0 17 7H7a2 2 0 0 0-1.5 3.3l4.9 5.9a2 2 0 0 0 3 0l5-6Z"
            clip-rule="evenodd"
          />
        </svg>
      </div>
    </button>

    <section v-if="isOpen" class="select_widget_lib">
      <div>
        <slot name="free-slot" />
      </div>
    </section>
  </div>
</template>

<style scoped>
/* primary_select CSS  */
.select_widget_lib {
  @apply text-white rounded-md absolute w-full mt-2 z-30 p-1.5 shadow-md ;
}
</style>