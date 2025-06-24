<script setup>
import SendSuggestion from "./sendSuggestion.vue";
import FeatureCard from "../../components/cards/feature_card/feature_card.vue";
import "../../components/cards/feature_card/feature_card.css";

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
            <div class="scrollable-section">
              <h1 class="header_new_features">Ultimas Atualizações</h1>

              <div class="features-list">
                <!-- <FeatureCard
                  v-for="mock in patchNotes.latest_update"
                  :key="mock"
                  state="updated"
                  :title="mock.title_feature"
                  :description="mock.description"
                  :date="mock.date"
                  :tutorial="mock.tutorial"
                  :flag="mock.flag"
                /> -->
              </div>
            </div>
          </div>

          <div class="modal-section-patch-notes future-section-patch-notes">
            <div class="scrollable-section">
              <h1 class="header_new_features_future_update">
                Futuras Atualizações
              </h1>

              <div class="features-list">
                <!-- <FeatureCard
                  v-for="mock in patchNotes.future_updates"
                  :key="mock"
                  state="future-update"
                  :title="mock.title_feature"
                  :description="mock.description"
                  :date="mock.date"
                  :tutorial="mock.tutorial"
                  :flag="mock.flag"
                /> -->
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
/* Overlay e animação */
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

/* Modal */
.modal-container-patch-notes {
  display: flex;
  justify-content: center;
  align-items: center;
  position: fixed;
  inset: 0;
  z-index: 50;
  overflow: auto;
}

.modal-content-patch-notes {
  padding: 0.25rem;
  width: 100%;
  max-width: 90rem;
  background-color: var(--base-300, #0F172A);
  border-radius: 0.5rem;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.8);
}

/* Header */
.modal-header-patch-notes {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 0.5rem;
  /* border-bottom: 1px solid #e5e7eb; */
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

/* Body */
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

/* Sections */
.modal-section-patch-notes {
  border-radius: 0.375rem;
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
  max-height: 27rem;
  overflow: auto;
}

.features-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-top: 0.5rem;
}
</style>