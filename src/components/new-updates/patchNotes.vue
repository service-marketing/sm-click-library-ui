<script setup>
import { ref } from "vue";
import SendSuggestion from "./sendSuggestion.vue";
import FeatureCard from "../../components/cards/feature_card/feature_card.vue";
import V3InfiniteLoading from "v3-infinite-loading";
import "v3-infinite-loading/lib/style.css";

const pageFuture = ref(1);
const pageLatest = ref(1);
const scrollFutContainer = ref(null);
const scrollLasContainer = ref(null);

const props = defineProps({
  future_updates: { type: [Object, null], required: true },
  latest_update: { type: [Object, null], required: true },
  loader: { type: Boolean, default: false },
  sentSuccess: { type: Boolean, default: false },
});

const emit = defineEmits([
  "close",
  "postSuggestion",
  "loadMoreFutureUpdates",
  "loadMoreLatestUpdates",
]);

const getSuggestionText = (suggestion) => emit("postSuggestion", suggestion);

const close = () => {
  emit("close");
  pageFuture.value = 1;
  pageLatest.value = 1;
};

const loadMoreFutureUpdates = ({ loaded, complete }) => {
  emit("loadMoreFutureUpdates", { loaded, complete, page: pageFuture.value });
  pageFuture.value++;
};

const loadMoreLatestUpdates = ({ loaded, complete }) => {
  emit("loadMoreLatestUpdates", { loaded, complete, page: pageLatest.value });
  pageLatest.value++;
};

const isRecent = (dateString) => {
  if (!dateString) return false;
  const diffDays =
    Math.abs(new Date() - new Date(dateString + "T12:00:00")) /
    (1000 * 60 * 60 * 24);
  return diffDays <= 3;
};
</script>

<template>
  <div class="pn-overlay">
    <div class="pn-backdrop" @click="close()"></div>
  </div>

  <div class="pn-container" role="dialog" aria-modal="true">
    <div class="pn-modal">
      <!-- Header -->
      <header class="pn-header">
        <div class="pn-header__brand">
          <svg
            class="pn-header__icon"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
          <h1 class="pn-header__title">Novidades</h1>
        </div>
        <button @click="close()" class="pn-close-btn" aria-label="Fechar">
          <svg
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 14 14"
          >
            <path
              stroke="currentColor"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
            />
          </svg>
        </button>
      </header>

      <!-- Body -->
      <div class="pn-body pn-scroll">
        <div class="pn-columns">
          <!-- Latest Updates -->
          <section class="pn-section pn-section--info">
            <div class="pn-section__header pn-section__header--info">
              <span class="pn-section__dot"></span>
              <h2 class="pn-section__label">Últimas Atualizações</h2>
            </div>
            <div ref="scrollLasContainer" class="pn-list pn-scroll">
              <template v-if="!latest_update">
                <div class="pn-skeleton-group">
                  <div class="pn-skeleton" v-for="n in 8" :key="n"></div>
                </div>
              </template>
              <template v-else-if="!latest_update.length">
                <div class="pn-empty">Nenhuma atualização disponível</div>
              </template>
              <template v-else>
                <FeatureCard
                  v-for="(last, index) in latest_update"
                  :key="index"
                  state="updated"
                  :title="last.title"
                  :description="last.description"
                  :date="last.launched_at"
                  :tutorial="last.tutorial"
                  :flag="last.flag"
                  :sparkles="isRecent(last.launched_at)"
                />
              </template>
              <V3InfiniteLoading
                :distance="20"
                :target="scrollLasContainer"
                @infinite="loadMoreLatestUpdates"
              >
                <template #complete><span></span></template>
                <template #spinner>
                  <div class="pn-skeleton-group">
                    <div class="pn-skeleton pn-skeleton--center">
                      <div class="pn-spinner pn-spinner--info"></div>
                    </div>
                  </div>
                </template>
              </V3InfiniteLoading>
            </div>
          </section>

          <!-- Future Updates -->
          <section class="pn-section pn-section--success">
            <div class="pn-section__header pn-section__header--success">
              <span class="pn-section__dot"></span>
              <h2 class="pn-section__label">Futuras Atualizações</h2>
            </div>
            <div ref="scrollFutContainer" class="pn-list pn-scroll">
              <template v-if="!future_updates">
                <div class="pn-skeleton-group">
                  <div class="pn-skeleton" v-for="n in 8" :key="n"></div>
                </div>
              </template>
              <template v-else-if="!future_updates.length">
                <div class="pn-empty">Nenhuma atualização programada</div>
              </template>
              <template v-else>
                <FeatureCard
                  v-for="(fut, index) in future_updates"
                  :key="index"
                  state="future-update"
                  :title="fut.title"
                  :description="fut.description"
                  :date="fut.launched_at"
                  :tutorial="fut.tutorial"
                  :flag="fut.flag"
                />
              </template>
              <V3InfiniteLoading
                :distance="20"
                :target="scrollFutContainer"
                @infinite="loadMoreFutureUpdates"
              >
                <template #complete><span></span></template>
                <template #spinner>
                  <div class="pn-skeleton-group">
                    <div class="pn-skeleton pn-skeleton--center">
                      <div class="pn-spinner pn-spinner--success"></div>
                    </div>
                  </div>
                </template>
              </V3InfiniteLoading>
            </div>
          </section>
        </div>

        <SendSuggestion
          :loader="loader"
          :sentSuccess="sentSuccess"
          @postSuccess="getSuggestionText"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
/* ── Overlay & backdrop ──────────────────────────────────── */
.pn-overlay {
  position: fixed;
  inset: 0;
  z-index: 50;
}

.pn-backdrop {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.55);
  backdrop-filter: blur(4px);
}

.pn-container {
  position: fixed;
  inset: 0;
  z-index: 51;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  pointer-events: none;
}

/* ── Modal shell ─────────────────────────────────────────── */
.pn-modal {
  /* Design tokens — cascade from host theme, fallback to project vars, then hardcoded */
  --_bg: var(
    --bg-modal,
    var(--color-background-default, rgb(var(--bg-base-200, 32 44 51)))
  );
  --_panel: rgb(var(--bg-base-200, 32 44 51));
  --_surface: rgb(var(--bg-base-100, 48 66 77));
  --_primary: var(
    --color-patch-notes-updates,
    var(--color-state-info, var(--primary, #3666f0))
  );
  --_success: var(
    --color-patch-notes-future,
    var(--color-state-success, var(--accent, #21b458))
  );
  --_text: var(--color-text-primary, rgb(var(--text-base, 231 234 240)));
  --_muted: var(--color-text-muted, rgb(var(--text-muted, 148 163 184)));
  --_border: var(
    --color-border-default,
    var(--border-default, rgba(255, 255, 255, 0.08))
  );
  --_inverse: var(--color-text-inverse, rgb(var(--text-inverted, 255 255 255)));

  background: var(--_bg);
  border-radius: 1.25rem;
  box-shadow:
    0 30px 60px rgba(0, 0, 0, 0.5),
    -6px -6px 18px rgba(255, 255, 255, 0.03),
    6px 6px 18px rgba(0, 0, 0, 0.45);
  width: 100%;
  max-width: 90rem;
  max-height: calc(100vh - 2rem);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  pointer-events: all;
  animation: pn-enter 0.15s ease-out;
}

/* ── Header ──────────────────────────────────────────────── */
.pn-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.5rem;
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
}

.pn-header__brand {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.pn-header__icon {
  width: 1.1rem;
  height: 1.1rem;
  color: var(--_primary);
  flex-shrink: 0;
}

.pn-header__title {
  font-size: 0.9375rem;
  font-weight: 600;
  color: var(--_text);
  line-height: 1;
  margin: 0;
}

.pn-close-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.875rem;
  height: 1.875rem;
  border-radius: 0.5rem;
  border: none;
  background: transparent;
  color: var(--_text);
  opacity: 0.5;
  cursor: pointer;
  transition:
    background 0.2s,
    opacity 0.2s,
    box-shadow 0.2s;
  flex-shrink: 0;
}

.pn-close-btn:hover {
  background: var(--_surface);
  opacity: 1;
  box-shadow:
    -2px -2px 6px rgba(255, 255, 255, 0.04),
    2px 2px 6px rgba(0, 0, 0, 0.4);
}

.pn-close-btn svg {
  width: 0.6875rem;
  height: 0.6875rem;
}

/* ── Body ────────────────────────────────────────────────── */
.pn-body {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 0.75rem;
  overflow-y: auto;
}

/* ── Columns (update sections) ───────────────────────────── */
.pn-columns {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

@media (min-width: 864px) {
  .pn-columns {
    flex-direction: row;
  }
}

@media (min-width: 1280px) {
  .pn-body {
    display: grid;
    grid-template-columns: minmax(0, 2fr) minmax(0, 1fr);
    align-items: stretch;
  }

  .pn-columns {
    display: grid;
    grid-template-columns: 1fr 1fr;
  }
}

/* ── Section card ────────────────────────────────────────── */
.pn-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: var(--_panel);
  border-radius: 1rem;
  overflow: hidden;
  box-shadow:
    inset 2px 2px 8px rgba(0, 0, 0, 0.3),
    inset -1px -1px 4px rgba(255, 255, 255, 0.03);
}

.pn-section--info {
  background: color-mix(in srgb, var(--_primary) 8%, var(--_panel));
}

.pn-section--success {
  background: color-mix(in srgb, var(--_success) 8%, var(--_panel));
}

.pn-section__header {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  padding: 0.875rem 1rem;
  flex-shrink: 0;
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.2);
}

.pn-section--info .pn-section__header {
  background: color-mix(in srgb, var(--_primary) 14%, transparent);
}

.pn-section--success .pn-section__header {
  background: color-mix(in srgb, var(--_success) 14%, transparent);
}

.pn-section__dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  flex-shrink: 0;
}

.pn-section__header--info .pn-section__dot {
  background: var(--_primary);
  box-shadow: 0 0 7px var(--_primary);
}

.pn-section__header--success .pn-section__dot {
  background: var(--_success);
  box-shadow: 0 0 7px var(--_success);
}

.pn-section__label {
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--_text);
  line-height: 1;
  margin: 0;
}

/* ── Scrollable list ─────────────────────────────────────── */
.pn-list {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 0.625rem;
  max-height: 50vh;
  overflow-y: auto;
}

@media (min-width: 864px) {
  .pn-list {
    height: 62vh;
    max-height: 62vh;
  }
}

/* ── Scrollbar ───────────────────────────────────────────── */
.pn-scroll::-webkit-scrollbar {
  width: 4px;
}
.pn-scroll::-webkit-scrollbar-track {
  background: transparent;
}
.pn-scroll::-webkit-scrollbar-thumb {
  background: var(--_border);
  border-radius: 4px;
  transition: background 0.15s;
}
.pn-scroll::-webkit-scrollbar-thumb:hover {
  background: var(--_muted);
}

/* ── Empty state ─────────────────────────────────────────── */
.pn-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 1;
  color: var(--_muted);
  font-size: 0.875rem;
  font-weight: 500;
  text-align: center;
  padding: 2rem 1rem;
}

/* ── Skeletons ───────────────────────────────────────────── */
.pn-skeleton-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  width: 100%;
  animation: pn-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

.pn-skeleton {
  width: 100%;
  height: 7rem;
  border-radius: 0.5rem;
  background: var(--_surface);
}

.pn-skeleton--center {
  display: flex;
  align-items: center;
  justify-content: center;
}

/* ── Spinner ─────────────────────────────────────────────── */
.pn-spinner {
  --r1: 154%;
  --r2: 68.5%;
  --spin-color: var(--_primary);
  width: 20px;
  aspect-ratio: 1;
  border-radius: 50%;
  background:
    radial-gradient(
      var(--r1) var(--r2) at top,
      #0000 79.5%,
      var(--spin-color) 80%
    ),
    radial-gradient(
      var(--r1) var(--r2) at bottom,
      var(--spin-color) 79.5%,
      #0000 80%
    ),
    radial-gradient(
      var(--r1) var(--r2) at top,
      #0000 79.5%,
      var(--spin-color) 80%
    ),
    var(--_surface);
  background-size: 50.5% 220%;
  background-position:
    -100% 0%,
    0% 0%,
    100% 0%;
  background-repeat: no-repeat;
  animation: pn-spin 2s infinite linear;
}

.pn-spinner--success {
  --spin-color: var(--_success);
}

/* ── Animations ──────────────────────────────────────────── */
@keyframes pn-enter {
  from {
    opacity: 0;
    transform: scale(0.97) translateY(4px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

@keyframes pn-pulse {
  50% {
    opacity: 0.45;
  }
}

@keyframes pn-spin {
  33% {
    background-position:
      0% 33%,
      100% 33%,
      200% 33%;
  }
  66% {
    background-position:
      -100% 66%,
      0% 66%,
      100% 66%;
  }
  100% {
    background-position:
      0% 100%,
      100% 100%,
      200% 100%;
  }
}
</style>
