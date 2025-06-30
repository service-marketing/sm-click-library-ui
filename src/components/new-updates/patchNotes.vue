<script setup>
import { ref, onMounted } from "vue";
import SendSuggestion from "./sendSuggestion.vue";
import FeatureCard from "../../components/cards/feature_card/feature_card.vue";
import { usePatchStore } from "../../stores/patchNotesStore.js";
import V3InfiniteLoading from "v3-infinite-loading";
import "v3-infinite-loading/lib/style.css";

const pageFuture = ref(1);
const pageLatest = ref(1);
const scrollFutContainer = ref(null);
const scrollLasContainer = ref(null);
const patchStore = usePatchStore();

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

onMounted(() => {
  patchStore.getPatchNotes();
});

const getSuggestionText = (suggestion) => {
  emit("postSuggestion", suggestion);
};

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
</script>

<template>
  <main>
    <div class="modal-overlay-patch-notes">
      <div class="modal-backdrop-patch-notes"></div>
    </div>

    <div class="modal-container-patch-notes">
      <div
        class="modal-content-patch-notes scroll_area_patch_notes_latest_update"
      >
        <div class="modal-header-patch-notes">
          <button @click="close()" class="modal-close-btn-patch-notes">
            <svg
              class="modal-close-icon-patch-notes"
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
        </div>

        <div class="modal-body-patch-notes">
          <div class="modal-body-control">
            <section
              class="modal-section-patch-notes updates-section-patch-notes"
            >
              <h1 class="header_latest_update">Ultimas Atualizações</h1>

              <div
                ref="scrollLasContainer"
                class="features-list scrollable-section scroll_area_patch_notes_latest_update"
              >
                <section v-if="!latest_update" class="sections-skeleton-loader">
                  <div
                    class="skeleton-loader skeleton-color-latest_update"
                    v-for="skeleton in 15"
                  ></div>
                </section>

                <span v-else-if="latest_update <= 0" class="text-not-patchs">
                  Nenhuma atualização programada
                </span>

                <FeatureCard
                  v-else
                  v-for="last in latest_update"
                  :key="last"
                  state="updated"
                  :title="last.title"
                  :description="last.description"
                  :date="last.launched_at"
                  :tutorial="last.tutorial"
                  :flag="last.flag"
                />

                <V3InfiniteLoading
                  :distance="20"
                  :target="scrollLasContainer"
                  @infinite="loadMoreLatestUpdates"
                >
                  <template #complete>
                    <span class=""></span>
                  </template>

                  <template #spinner>
                    <section class="sections-skeleton-loader">
                      <div class="skeleton-loader skeleton-color-latest_update">
                        <div class="infinite-loader-spin"></div>
                      </div>
                    </section>
                  </template>
                </V3InfiniteLoading>
              </div>
            </section>

            <section
              class="modal-section-patch-notes future-section-patch-notes"
            >
              <h1 class="header_future_updates">Futuras Atualizações</h1>

              <div
                ref="scrollFutContainer"
                class="features-list scrollable-section scroll_area_patch_notes_future_updates"
              >
                <section
                  v-if="!future_updates"
                  class="sections-skeleton-loader"
                >
                  <div
                    class="skeleton-loader skeleton-color-latest_update"
                    v-for="skeleton in 15"
                  ></div>
                </section>

                <span v-else-if="future_updates <= 0" class="text-not-patchs">
                  Nenhuma atualização programada
                </span>

                <FeatureCard
                  v-else
                  v-for="fut in future_updates"
                  :key="fut"
                  state="future-update"
                  :title="fut.title"
                  :description="fut.description"
                  :date="fut.launched_at"
                  :tutorial="fut.tutorial"
                  :flag="fut.flag"
                />

                <V3InfiniteLoading
                  :distance="20"
                  :target="scrollFutContainer"
                  @infinite="loadMoreFutureUpdates"
                >
                  <template #complete>
                    <span class=""></span>
                  </template>

                  <template #spinner>
                    <section class="sections-skeleton-loader">
                      <div
                        class="skeleton-loader skeleton-color-future_updates"
                      >
                        <div class="infinite-loader-spin"></div>
                      </div>
                    </section>
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
  </main>
</template>

<style scoped>
.modal-overlay-patch-notes {
  position: fixed;
  inset: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
  animation: modalani 0.1s ease-out;
  transition: opacity 0.2s ease-in-out;
}

.modal-backdrop-patch-notes {
  position: absolute;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(4px);
}

.modal-container-patch-notes {
  display: flex;
  justify-content: center;
  align-items: center;
  position: fixed;
  inset: 0;
  z-index: 50;
}

.modal-body-control {
  display: flex;
  gap: 0.5rem;
  grid-column: span 2 / span 2;
  width: 100%;
}

.modal-content-patch-notes {
  padding: 0.25rem;
  width: 100%;
  background-color: var(--base-300, #0f172a);
  border-radius: 0.5rem;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.8);
  max-width: 90rem;
  max-height: 100vh;
  overflow-y: auto;
  position: relative;
}

.modal-header-patch-notes {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 0.5rem;
  border-radius: 0.5rem 0.5rem 0 0;
}

.modal-close-btn-patch-notes {
  color: #9ca3af;
  background: transparent;
  border: none;
  cursor: pointer;
  border-radius: 0.5rem;
  width: 2rem;
  height: 2rem;
  display: inline-flex;
  justify-content: center;
  align-items: center;
}

.modal-close-btn-patch-notes:hover {
  background-color: #e5e7eb;
  color: #111827;
}

.modal-close-btn-patch-notes:hover svg {
  color: #111827;
}

.modal-close-icon-patch-notes {
  width: 0.75rem;
  height: 0.75rem;
}

.modal-body-patch-notes {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  justify-content: space-between;
  padding: 0.5rem;
  overflow-y: auto;
  width: 100%;
}

.modal-section-patch-notes {
  width: 100%;
  border-radius: 10px;
  padding: 0.5rem;
  display: flex;
  flex-direction: column;
}

.features-list {
  position: relative;
  height: 70vh;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

@media (min-width: 1280px) {
  .modal-body-patch-notes {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (min-width: 864px) {
  .modal-content-patch-notes {
    margin: 0;
  }

  .features-list {
    /* min-height: 70vh;
    max-height: 70vh; */
  }
}

.updates-section-patch-notes {
  background-color: rgba(54, 102, 240, 0.2);
}

.future-section-patch-notes {
  background-color: rgba(33, 180, 88, 0.2);
}

.scrollable-section {
  overflow: auto;
}

.header_latest_update {
  background: #3666f0;
  padding: 16px;
  border-radius: 10px;
  color: white;
  font-size: 0.9rem;
  line-height: 1rem;
  font-weight: 600;
}

.header_future_updates {
  background: #21b458;
  padding: 16px;
  border-radius: 10px;
  color: white;
  font-size: 0.9rem;
  line-height: 1rem;
  font-weight: 600;
}

.scroll_area_patch_notes_latest_update::-webkit-scrollbar {
  width: 3px;
}

.scroll_area_patch_notes_latest_update::-webkit-scrollbar-thumb {
  background-color: rgba(33, 180, 87, 0);
  border-radius: 4px;
}

.scroll_area_patch_notes_latest_update::-webkit-scrollbar-track {
  background: transparent;
}

.scroll_area_patch_notes_future_updates::-webkit-scrollbar {
  width: 3px;
}

.scroll_area_patch_notes_future_updates::-webkit-scrollbar-thumb {
  background-color: rgba(33, 180, 87, 0);
  border-radius: 4px;
}

.scroll_area_patch_notes_future_updates::-webkit-scrollbar-track {
  background: transparent;
}

.text-not-patchs {
  color: white;
  justify-content: center;
  align-items: center;
  display: flex;
  height: 100%;
  font-weight: 500;
}

.sections-skeleton-loader {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

.skeleton-loader {
  width: 100%;
  height: 7.1rem;
  border-radius: 10px;
  @apply justify-center items-center mx-auto flex;
}

.skeleton-color-latest_update {
  background-color: #27435b;
}

.skeleton-color-future_updates {
  background-color: #225a49;
}

@keyframes pulse {
  50% {
    opacity: 0.5;
  }
}

@keyframes modalani {
  0% {
    opacity: 0;
    transform: scale(0.95);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

.infinite-loader-spin {
  --r1: 154%;
  --r2: 68.5%;
  width: 20px;
  aspect-ratio: 1;
  border-radius: 50%;
  background: radial-gradient(
      var(--r1) var(--r2) at top,
      #0000 79.5%,
      #269af2 80%
    ),
    radial-gradient(var(--r1) var(--r2) at bottom, #269af2 79.5%, #0000 80%),
    radial-gradient(var(--r1) var(--r2) at top, #0000 79.5%, #269af2 80%), #ccc;
  background-size: 50.5% 220%;
  background-position: -100% 0%, 0% 0%, 100% 0%;
  background-repeat: no-repeat;
  animation: l9 2s infinite linear;
}

@keyframes l9 {
  33% {
    background-position: 0% 33%, 100% 33%, 200% 33%;
  }
  66% {
    background-position: -100% 66%, 0% 66%, 100% 66%;
  }
  100% {
    background-position: 0% 100%, 100% 100%, 200% 100%;
  }
}
</style>




