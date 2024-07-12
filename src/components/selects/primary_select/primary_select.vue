<script setup>
import { ref, computed } from "vue";
import { onClickOutside } from "@vueuse/core";

const props = defineProps({
  titleFreeSlot: {
    type: String,
    default: "Free Slot",
  },
  selectConfig: {
    type: Object,
    default: () => ({
      chartsConfig: false,
      freeSlot: false,
    }),
  },
});

const emits = defineEmits(["closeSelect"]);

const isOpen = ref(false);
const titleChartsConfig = ref("Horizontal");
const target = ref(null);

const isConfigAvailable = computed(() => props.selectConfig.length > 0);

const hasChartsConfig = computed(() =>
  props.selectConfig.some((item) => item.chartsConfig)
);

const hasFreeSlot = computed(() =>
  props.selectConfig.some((item) => item.freeSlot)
);

const toggleSelect = () => {
  isOpen.value = !isOpen.value;
};

const closeSelect = (selection) => {
  isOpen.value = false;
  titleChartsConfig.value =
    selection === "horizontal" ? "Vertical" : "Horizontal";
  emits("closeSelect", selection);
};

const closeSelectOutside = () => {
  if (isOpen.value) isOpen.value = false;
};

onClickOutside(target, closeSelectOutside);
</script>

<template>
  <div v-if="isConfigAvailable" ref="target" class="relative w-full">
    <button
      @click="toggleSelect"
      class="bg-base-200 z-10 truncate flex items-center justify-between gap-6 p-2 rounded-md lg:mt-0 w-full shadow-md shadow-base-300"
    >
      <div>
        <p
          class="line-clamp-2 uppercase text-xs truncate text-white"
          v-if="hasChartsConfig"
        >
          {{ titleChartsConfig }}
        </p>
        <p class="line-clamp-2 uppercase text-xs truncate text-white" v-else>
          {{ titleFreeSlot }}
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
      <div v-if="hasFreeSlot">
        <slot name="free-slot" />
      </div>

      <div v-if="hasChartsConfig" class="space-y-2">
        <button
          :class="titleChartsConfig === 'Vertical' ? 'bg-green-500' : ''"
          @click="() => closeSelect('horizontal')"
          class="btn_select_widget_lib"
        >
          <p class="line-clamp-2 uppercase text-xs truncate">Vertical</p>
        </button>
        <button
          :class="titleChartsConfig !== 'Vertical' ? 'bg-green-500' : ''"
          @click="() => closeSelect('vertical')"
          class="btn_select_widget_lib"
        >
          <p class="line-clamp-2 uppercase text-xs truncate">Horizontal</p>
        </button>
      </div>
    </section>
  </div>
</template>

