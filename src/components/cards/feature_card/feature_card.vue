<script setup>
import { ref, computed } from "vue";
import { onClickOutside } from "@vueuse/core";
import { arrowSvg, shareSvg, calendarSvg } from "./feature_card_svgs";
import "./feature_card.css";
import Svg from "../../../assets/svg.vue";

const isOpen = ref(false);
const targetFeatureCard = ref(null);

const props = defineProps({
  state: { type: String, required: true, default: "updated" },
  title: { type: String, required: true },
  description: { type: Array, required: true },
  date: { type: String, required: true },
  tutorial: { type: String, default: null },
  flag: { type: String, required: true },
});

const close = () => {
  isOpen.value = false;
};

onClickOutside(targetFeatureCard, close);

const svgClass = computed(() => ({
  "arrow-icon-patch-notes": true,
  rotate: !isOpen.value,
}));

const backgroundClass = computed(() => {
  return {
    "feature-card": true,
    "feature-card--updated": props.state === "updated",
    "feature-card--future": props.state === "future-update",
    "feature-card--other":
      props.state !== "updated" && props.state !== "future-update",
  };
});

const pillFlagClass = computed(() => ({
  "pill-flag": true,
  "pill-flag--new-feature": props.flag === "new-feature",
  "pill-flag--improvement": props.flag !== "new-feature",
}));

const pillFlagName = computed(() => {
  return props.flag === "new-feature" ? "Melhorias" : "Novo Recurso";
});

const pillDateClass = computed(() => ({
  "pill-date": true,
  "pill-date--updated": props.state === "updated",
  "pill-date--future": props.state !== "updated",
}));
</script>

<template>
  <main
    class="feature_style"
    ref="targetFeatureCard"
    @click="isOpen = !isOpen"
    :class="backgroundClass"
  >
    <header class="feature-card__header">
      <h1 class="feature-card__title">
        {{ title }}
      </h1>

      <svg :class="svgClass" viewBox="0 0 24 24" fill="none">
        <g>
          <path
            d="M15 11L12 8M12 8L9 11M12 8V16M21 12C21 7.02944 16.9706 3 12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21C16.9706 21 21 16.9706 21 12Z"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </g>
      </svg>
    </header>

    <Transition>
      <div v-if="isOpen">
        <hr class="feature-card__divider" />
        <section class="feature-card__content">
          <span class="feature-card__description scroll_area_new_features">
            <p
              v-for="descrip in description"
              class="feature-card__paragraph"
              :key="descrip"
            >
              {{ descrip }}
            </p>
          </span>

          <button v-if="tutorial" class="feature-card__tutorial-button">
            Veja o tutorial
            <Svg :svgContent="shareSvg('size-4 text-blue-900')" />
          </button>
        </section>
      </div>
    </Transition>

    <footer class="feature-card__footer">
      <section class="feature-card__footer-section">
        <span :class="pillFlagClass">
          {{ pillFlagName }}
        </span>

        <span :class="pillDateClass">
          <Svg :svgContent="calendarSvg('size-4 text-white')" />
          <p>
            {{ date.replace(/ de /g, " ").replace(/(\d{4})$/, ",$1") }}
          </p>
        </span>
      </section>
    </footer>
  </main>
</template>

<style scoped>
/* Estrutura básica */
.feature-card {
  border-radius: 0.375rem;
  padding: 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  cursor: pointer;
}

/* Cores de fundo por estado */
.feature-card--updated {
  background-color: #83878b1a;
}

.feature-card--future {
  background-color: #83878b1a;
}

.feature-card--other {
  background-color: #93c5fd; /* bg-blue-300 */
}

/* Header */
.feature-card__header {
  display: flex;
  justify-content: space-between;
}

.feature-card__title {
  color: white;
  font-weight: 600;
}

/* Arrow */
.arrow-icon-patch-notes {
  width: 1.7rem;
  height: 1.7rem;
  color: white;
  transition: transform 0.3s ease-out;
}

.arrow-icon-patch-notes.rotate {
  transform: rotate(180deg);
}

/* Divider */
.feature-card__divider {
  height: 1px;
  background-color: rgba(229, 231, 235, 0.2);
  margin-bottom: 0.75rem;
  border: none;
}

/* Content */
.feature-card__content {
  display: flex;
  flex-direction: column;
  width: 100%;
}

.feature-card__description {
  max-height: 16rem; /* 64 * 4px */
  overflow: auto;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.feature-card__paragraph {
  color: rgb(209, 213, 219); /* text-gray-300 */
  font-size: 0.875rem; /* text-sm */
  font-weight: 200; /* font-extralight */
}

/* Tutorial button */
.feature-card__tutorial-button {
  color: #1e3a8a; /* text-blue-900 */
  background-color: #bfdbfe; /* bg-blue-200 */
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.75rem;
  font-size: 0.75rem;
  border-radius: 9999px;
  align-self: flex-end;
  margin-top: 1rem;
  transition: all 0.3s;
}

.feature-card__tutorial-button:hover {
  background-color: #3b82f6; /* bg-blue-500 */
  color: #bfdbfe; /* text-blue-200 */
}

/* Footer */
.feature-card__footer {
  cursor: pointer;
}

.feature-card__footer-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* Pill flag */
.pill-flag {
  color: white;
  padding: 0.25rem 0.75rem;
  font-size: 0.625rem;
  border-radius: 9999px;
  font-weight: 600;
  text-transform: uppercase;
}

.pill-flag--new-feature {
  background-color: #007aff;
}

.pill-flag--improvement {
  background-color: #5856d6;
}

/* Pill date */
.pill-date {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: white;
  font-size: 0.75rem;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
}

.pill-date--updated {
  background-color: transparent;
}

.pill-date--future {
  background-color: rgba(33, 180, 88, 0.7);
}
</style>
