<script setup>
import { ref, onMounted } from "vue";
import SendSuggestion from "./sendSuggestion.vue";
import FeatureCard from "../../components/cards/feature_card/feature_card.vue";
import { usePatchStore } from "../../stores/patchNotesStore.js";
import "../../components/cards/feature_card/feature_card.css";

const patchStore = usePatchStore();

onMounted(() => {
  patchStore.getPatchNotes();
});

const emit = defineEmits(["close"]);
const close = () => {
  emit("close");
};
</script>

<template>
  <section>
    <div class="modal-overlay-patch-notes">
      <div class="modal-backdrop-patch-notes"></div>
    </div>

    <div class="modal-container-patch-notes">
      <div class="modal-content-patch-notes">
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
          <div class="modal-section-patch-notes updates-section-patch-notes">
            <div class="">
              <h1 class="header_latest_update">Ultimas Atualizações</h1>

              <div
                class="features-list scrollable-section scroll_area_patch_notes_latest_update"
              >
                <FeatureCard
                  v-for="mock in patchStore.patchNotes?.latest_update"
                  :key="mock"
                  state="updated"
                  :title="mock.title"
                  :description="mock.description"
                  :date="mock.created_at"
                  :tutorial="mock.tutorial"
                  :flag="mock.flag"
                />
              </div>
            </div>
          </div>

          <div class="modal-section-patch-notes future-section-patch-notes">
            <div class="">
              <h1 class="header_future_updates">Futuras Atualizações</h1>

              <div
                class="features-list scrollable-section scroll_area_patch_notes_future_updates"
              >
                <FeatureCard
                  v-for="mock in patchStore.patchNotes?.future_updates"
                  :key="mock"
                  state="future-update"
                  :title="mock.title"
                  :description="mock.description"
                  :date="mock.created_at"
                  :tutorial="mock.tutorial"
                  :flag="mock.flag"
                />
              </div>
            </div>
          </div>

          <SendSuggestion />
        </div>
      </div>
    </div>
  </section>
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

.modal-content-patch-notes {
  padding: 0.25rem;
  width: 100%;
  background-color: var(--base-300, #0f172a);
  border-radius: 0.5rem;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.8);
  max-width: 90rem;
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
}

@media (min-width: 768px) {
  .modal-body-patch-notes {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
  }
}

.modal-section-patch-notes {
  border-radius: 10px;
  padding: 0.5rem;
  display: flex;
  flex-direction: column;
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

.features-list {
  max-height: 70vh; /* ou 50vh, dependendo da sua preferência */
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-top: 0.5rem;
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
</style>


