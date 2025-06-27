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
  width: 20.5rem;
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

  .pill_date_popper {
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
  background-color: rgba(33, 180, 88, 0.7);
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
</style>
