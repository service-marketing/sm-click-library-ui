<script setup>
import { ref, computed } from "vue";
import { onClickOutside } from "@vueuse/core";
import { arrowSvg, shareSvg, calendarSvg } from "./feature_card_svgs";
import "./feature_card.css";
import Svg from "../../../assets/svg.vue";

const isOpen = ref(false);
const targetFeatureCard = ref(null);
const currentDate = ref(
  new Date().toLocaleDateString("pt-br", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  })
);

const props = defineProps({
  state: {
    type: String,
    required: true,
    default: "updated",
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: Array,
    required: true,
  },
  date: {
    type: String,
    required: true,
  },
  tutorial: {
    type: String,
    default: null,
  },
  flag: {
    type: String,
    required: true,
  },
});

const close = () => {
  isOpen.value = false;
};

onClickOutside(targetFeatureCard, close);

const svgClass = computed(() => {
  const baseClass = "size-6 text-white transition-all ease-out";
  return isOpen.value ? baseClass : `${baseClass} rotate-180`;
});

const svgPillFlagDate = computed(() => {
  const baseClass =
    "flex items-center gap-2 text-white text-xs py-1 px-3 text-xs rounded-full";
  return props.state === "updated" ? baseClass : `${baseClass} bg-[#21B458B2]`;
});

const svgPillFlag = computed(() => {
  const baseClass =
    "text-white py-1 px-3 text-[10px] rounded-full font-semibold uppercase";
  return props.flag === "new-feature"
    ? `${baseClass} bg-[#007AFF]`
    : `${baseClass} bg-[#5856D6]`;
});

const pillFlagName = computed(() => {
  return props.flag === "new-feature" ? "Melhorias" : "Novo Recurso";
});

const backgroundClass = computed(() => {
  if (props.state === "updated") {
    return "bg-[#83878B1A]";
  } else if (props.state === "future-update") {
    return "bg-[#83878B1A]";
  } else {
    return "bg-blue-300";
  }
});
</script>

<template>
  <main
    ref="targetFeatureCard"
    @click="isOpen ? (isOpen = false) : (isOpen = true)"
    :class="[backgroundClass, 'rounded-md p-3 flex flex-col gap-3']"
  >
    <header class="flex justify-between cursor-pointer">
      <h1 class="text-white font-semibold">
        {{ title }}
      </h1>

      <Svg :svgContent="arrowSvg(svgClass)" />
    </header>

    <Transition>
      <body v-if="isOpen">
        <hr class="h-px bg-gray-200/20 mb-3 border-0" />
        <section class="flex flex-col w-full">
          <span
            class="scroll_area_new_features max-h-64 overflow-auto flex flex-col gap-2"
          >
            <p
              v-for="descrip in description"
              class="text-gray-300 text-sm font-extralight"
            >
              {{ descrip }}
            </p>
          </span>

          <button
            v-if="tutorial"
            class="text-blue-900 flex items-center bg-blue-200 gap-1 py-1 px-3 text-xs rounded-full self-end mt-4 hover:bg-blue-500 hover:text-blue-200"
          >
            Veja o tutorial

            <Svg :svgContent="shareSvg('size-4 text-blue-900')" />
          </button>
        </section>
      </body>
    </Transition>

    <footer class="cursor-pointer">
      <section class="flex justify-between items-center">
        <span :class="svgPillFlag">
          {{ pillFlagName }}
        </span>

        <span :class="svgPillFlagDate">
          <Svg :svgContent="calendarSvg('size-4 text-white ')" />

          <p>
            {{ date.replace(/ de /g, " ").replace(/(\d{4})$/, ",$1") }}
          </p>
        </span>
      </section>
    </footer>
  </main>
</template>

<style scoped>
</style>