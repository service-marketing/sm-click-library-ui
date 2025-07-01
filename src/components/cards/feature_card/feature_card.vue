<script setup>
import { ref, computed } from "vue";
import { onClickOutside } from "@vueuse/core";
import { arrowSvg, shareSvg, calendarSvg } from "./feature_card_svgs";
import Svg from "../../../assets/svg.vue";

const isOpen = ref(false);
const targetFeatureCard = ref(null);

const props = defineProps({
  state: { type: String, required: true, default: "updated" },
  title: { type: String, required: true },
  description: { type: String, required: true },
  date: { type: [String, null], required: true },
  tutorial: { type: String, default: null },
  flag: { type: String, required: true },
  sparkles: { type: String, required: true },
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
  "pill-flag--improvement": props.flag === "improvement",
  "pill-flag--bug-fix": props.flag === "bug-fix",
}));

const pillFlagName = computed(() => {
  return props.flag === "new-feature"
    ? "Melhorias"
    : props.flag === "improvement"
    ? "Novo Recurso"
    : "correção de erros";
});

const pillDateClass = computed(() => ({
  "pill-date": true,
  "pill-date--updated": props.state === "updated",
  "pill-date--future": props.state !== "updated",
}));
</script>

<template>
  <main
    class="feature_style relative"
    ref="targetFeatureCard"
    @click="isOpen = !isOpen"
    :class="backgroundClass"
  >
    <header class="feature-card__header">
      <h1 class="feature-card__title">
        {{ title }}
      </h1>

      <section class="flex items-center gap-2">
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

        <div v-if="sparkles" class="sparkle-badge">
          <svg class="size-4" viewBox="0 0 128 128">
            <path
              d="M121.59 60.83l-13.93-4.49c-8.91-2.94-14.13-10.15-16.58-19.21L84.95 7.27c-.16-.59-.55-1.38-1.75-1.38c-1.01 0-1.59.79-1.75 1.38l-6.13 29.87c-2.46 9.06-7.67 16.27-16.58 19.21l-13.93 4.49c-1.97.64-2 3.42-.04 4.09l14.03 4.83c8.88 2.95 14.06 10.15 16.52 19.17l6.14 29.53c.16.59.49 1.65 1.75 1.65c1.33 0 1.59-1.06 1.75-1.65l6.14-29.53c2.46-9.03 7.64-16.23 16.52-19.17l14.03-4.83c1.94-.68 1.91-3.46-.06-4.1z"
              fill="#fdd835"
            ></path>

            <path
              d="M122.91 62.08c-.22-.55-.65-1.03-1.32-1.25l-13.93-4.49c-8.91-2.94-14.13-10.15-16.58-19.21L84.95 7.27c-.09-.34-.41-.96-.78-1.14l1.98 29.97c1.47 13.68 2.73 20.12 13.65 22c9.38 1.62 20.23 3.48 23.11 3.98z"
              fill="#ffee58"
            ></path>

            <path
              d="M122.94 63.64l-24.16 5.54c-8.51 2.16-13.2 7.09-13.2 19.99l-2.37 30.94c.81-.08 1.47-.52 1.75-1.65l6.14-29.53c2.46-9.03 7.64-16.23 16.52-19.17l14.03-4.83c.66-.24 1.08-.73 1.29-1.29z"
              fill="#f4b400"
            ></path>

            <g>
              <path
                d="M41.81 86.81c-8.33-2.75-9.09-5.85-10.49-11.08l-3.49-12.24c-.21-.79-2.27-.79-2.49 0L22.97 74.8c-1.41 5.21-4.41 9.35-9.53 11.04l-8.16 3.54c-1.13.37-1.15 1.97-.02 2.35l8.22 2.91c5.1 1.69 8.08 5.83 9.5 11.02l2.37 10.82c.22.79 2.27.79 2.48 0l2.78-10.77c1.41-5.22 3.57-9.37 10.5-11.07l7.72-2.91c1.13-.39 1.12-1.99-.02-2.36l-7-2.56z"
                fill="#fdd835"
              ></path>

              <path
                d="M28.49 75.55c.85 7.86 1.28 10.04 7.65 11.67l13.27 2.59c-.14-.19-.34-.35-.61-.43l-7-2.57c-7.31-2.5-9.33-5.68-10.7-12.04c-1.37-6.36-2.83-10.51-2.83-10.51c-.51-1.37-1.24-1.3-1.24-1.3l1.46 12.59z"
                fill="#ffee58"
              ></path>

              <path
                d="M28.73 102.99c0-7.41 4.05-11.08 10.49-11.08l10.02-.41s-.58.77-1.59 1.01l-6.54 2.13c-5.55 2.23-8.08 3.35-9.8 10.94c0 0-2.22 8.83-2.64 9.76c-.58 1.3-1.27 1.57-1.27 1.57l1.33-13.92z"
                fill="#f4b400"
              ></path>
            </g>

            <path
              d="M59.74 28.14c.56-.19.54-.99-.03-1.15l-7.72-2.08a4.77 4.77 0 0 1-3.34-3.3L45.61 9.06c-.15-.61-1.02-.61-1.17.01l-2.86 12.5a4.734 4.734 0 0 1-3.4 3.37l-7.67 1.99c-.57.15-.61.95-.05 1.15l8.09 2.8c1.45.5 2.57 1.68 3.01 3.15l2.89 11.59c.15.6 1.01.61 1.16 0l2.99-11.63a4.773 4.773 0 0 1 3.04-3.13l8.1-2.72z"
              fill="#f4b400"
              stroke="#f4b400"
              stroke-miterlimit="10"
            ></path>
          </svg>
        </div>
      </section>
    </header>

    <Transition name="fade-slide">
      <div v-if="isOpen">
        <hr class="feature-card__divider" />
        <section class="feature-card__content">
          <span class="feature-card__description scroll_area_feature_card">
            <p
              class="feature-card__paragraph"
              v-html="description.replace(/\n/g, '<br>')"
            ></p>
          </span>

          <a
            class="feature-card__tutorial-button"
            v-if="tutorial"
            :href="tutorial"
            target="__blank"
          >
            Veja o tutorial
            <Svg :svgContent="shareSvg('size-4 text-blue-900')" />
          </a>
        </section>
      </div>
    </Transition>

    <footer class="feature-card__footer">
      <section class="feature-card__footer-section">
        <span :class="pillFlagClass">
          {{ pillFlagName }}
        </span>

        <Popper
          class="pill_date_popper"
          hover
          :disabled="state === 'updated'"
          :arrow="true"
          content="Essa é uma data prevista para o lançamento deste recurso, a mesma está sujeita a mudanças a qualquer momento"
        >
          <div :class="pillDateClass">
            <Svg :svgContent="calendarSvg('size-4 text-white')" />
            <p>
              {{
                new Intl.DateTimeFormat("pt-BR", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })
                  .format(new Date(date))
                  .replace(/ de /g, " ")
              }}
            </p>
          </div>
        </Popper>
      </section>
    </footer>
  </main>
</template>

<style scoped>
.pill_date_popper {
  --popper-theme-background-color: #021812;
  --popper-theme-background-color-hover: #021812;
  --popper-theme-text-color: #ffffff;
  --popper-theme-border-width: 0px;
  --popper-theme-border-style: solid;
  --popper-theme-border-radius: 8px;
  --popper-theme-padding: 12px;
  --popper-theme-box-shadow: 0 6px 30px -6px rgba(0, 0, 0, 0.25);
  font-size: 12px;
  font-weight: 400;
  text-align: justify;
}

.sparkle-badge {
  border-radius: 9999px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.7rem;
  height: 1.7rem;
  z-index: 20;
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.5s ease-in-out;
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateY(-10px);
}

.fade-slide-enter-to {
  opacity: 1;
  transform: translateY(0);
}

.fade-slide-leave-from {
  opacity: 1;
  transform: translateY(0);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

.feature-card {
  border-radius: 10px;
  padding: 0.75rem;
  display: flex;
  justify-content: space-between;
  flex-direction: column;
  gap: 0.75rem;
  cursor: pointer;
}

.feature-card--updated {
  background-color: #83878b1a;
}

.predictive_text {
  color: white;
  font-size: 10px;
  display: flex;
  align-content: flex-start;
  padding-left: 8px;
  text-transform: uppercase;
}

.feature-card--future {
  background-color: #83878b1a;
}

.feature-card--other {
  background-color: #93c5fd;
}

.feature-card__header {
  display: flex;
  justify-content: space-between;
}

.feature-card__title {
  color: white;
  font-weight: 600;
}

.arrow-icon-patch-notes {
  width: 1.7rem;
  height: 1.7rem;
  color: white;
  transition: transform 0.3s ease-out;
}

.arrow-icon-patch-notes.rotate {
  transform: rotate(180deg);
}

.feature-card__divider {
  height: 1px;
  background-color: rgba(110, 185, 175, 0.486);
  margin-bottom: 0.75rem;
  border: none;
}

.feature-card__content {
  display: flex;
  flex-direction: column;
  width: 100%;
}

.feature-card__description {
  min-height: 2rem;
  max-height: 6rem;
  overflow: auto;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.feature-card__paragraph {
  color: rgb(209, 213, 219);
  font-size: 0.875rem;
  font-weight: 200;
}

.feature-card__tutorial-button {
  color: #1e3a8a;
  background-color: #bfdbfe;
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
  background-color: #3b82f6;
  color: #bfdbfe;
}

.feature-card__footer {
  cursor: pointer;
}

.feature-card__footer-section {
  display: flex;
  flex-direction: column;
  text-align: center;
  gap: 8px;
  justify-content: space-between;
  align-items: center;
  @apply lg:text-center;
}

.pill-flag {
  width: 100%;
  color: white;
  padding: 0.35rem 0.75rem;
  font-size: 0.625rem;
  border-radius: 9999px;
  font-weight: 600;
  text-transform: uppercase;
}

.pill-date {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: white;
  font-size: 0.75rem;
  padding: 0.35rem 0.75rem;
  border-radius: 9999px;
}

.pill_date_span {
  width: 100%;
}

@media (min-width: 1280px) {
  .feature-card__footer-section {
    justify-content: space-between;
    flex-direction: row;
  }

  .pill-flag {
    width: auto;
  }

  .pill-date {
    width: auto;
  }

  .pill_date_span {
    width: auto;
  }
}

.pill-flag--new-feature {
  background-color: #007aff;
}

.pill-flag--improvement {
  background-color: #5856d6;
}

.pill-flag--bug-fix {
  background-color: #21b458b3;
}

.pill-date--updated {
  background-color: transparent;
}

.pill-date--future {
  text-decoration-line: underline;
}

.scroll_area_feature_card::-webkit-scrollbar {
  width: 3px;
}

.scroll_area_feature_card::-webkit-scrollbar-thumb {
  background-color: rgba(110, 185, 175, 0.486);
  border-radius: 4px;
}

.scroll_area_feature_card::-webkit-scrollbar-track {
  background: transparent;
}

@keyframes pulse {
  50% {
    opacity: 0.5;
  }
}
</style>
