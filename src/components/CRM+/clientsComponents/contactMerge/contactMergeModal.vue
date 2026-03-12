<script setup>
/**
 * Contact Merge Modal
 * Modal for merging duplicate contacts with:
 * - Beautiful contact list UI using MergeContactCard
 * - Clear step-by-step process
 * - Proper validation rules for phone/JID/LID
 */
import { computed, ref, toRaw, watch } from "vue";
import InfiniteLoading from "v3-infinite-loading";
import MergeContactCard from "./contactCard.vue";
import MergeConfirmationPanel from "./MergeConfirmationPanel.vue";
import { useContactSearch } from "./useContactSearch.js";
import {
  validateContactMerge,
  generateMergePreview,
} from "./useContactMergeValidation.js";

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false,
  },
  currentContact: {
    type: Object,
    default: () => ({}),
  },
  mergeContacts: {
    type: Function,
    default: null,
  },
});

const emit = defineEmits(["close", "merged"]);

// ========== COMPOSABLES ==========
const {
  searchTerm,
  candidates,
  candidatesLoading,
  nextPage,
  infiniteKey,
  fetchCandidates,
  loadMoreCandidates,
  resetSearch,
} = useContactSearch(() => props.currentContact?.id);

// ========== STATE ==========
const step = ref("select"); // "select" | "confirm"
const mergeLoading = ref(false);
const mergeError = ref("");
const mergeIrreversibleConfirmed = ref(false);
const selectedContact = ref(null);

// ========== UTILITY FUNCTIONS ==========
const cloneContact = (contact) => {
  return JSON.parse(JSON.stringify(toRaw(contact ?? {})));
};

const sanitizeMergeContact = (contact) => {
  const sanitized = cloneContact(contact);
  delete sanitized.__mergeKey;
  return sanitized;
};

// ========== COMPUTED ==========
const parentContact = computed(() => props.currentContact);
const childContact = computed(() => selectedContact.value);
const hasSelection = computed(() => Boolean(selectedContact.value));

const mergeValidation = computed(() =>
  validateContactMerge(parentContact.value, childContact.value),
);

const mergePreview = computed(() =>
  generateMergePreview(
    parentContact.value,
    childContact.value,
    mergeValidation.value.phoneComparison,
  ),
);

const canProceedToConfirm = computed(
  () => hasSelection.value && mergeValidation.value.canMerge,
);

const canConfirmMerge = computed(() => {
  return (
    mergeValidation.value.canMerge &&
    mergeIrreversibleConfirmed.value &&
    !mergeLoading.value &&
    hasSelection.value
  );
});

const filteredCandidates = computed(() =>
  candidates.value.filter((contact) => contact.id !== parentContact.value?.id),
);

// ========== METHODS ==========
const resetState = () => {
  step.value = "select";
  mergeError.value = "";
  mergeIrreversibleConfirmed.value = false;
  mergeLoading.value = false;
  selectedContact.value = null;
  resetSearch();
};

const closeModal = ({ force = false } = {}) => {
  if (mergeLoading.value && !force) return;
  resetState();
  emit("close");
};

const selectContact = (contact) => {
  if (selectedContact.value?.id === contact.id) {
    selectedContact.value = null;
  } else {
    selectedContact.value = cloneContact(contact);
  }
};

const goToConfirmStep = () => {
  if (!canProceedToConfirm.value) return;
  step.value = "confirm";
};

const goBackToSelect = () => {
  step.value = "select";
  mergeIrreversibleConfirmed.value = false;
  mergeError.value = "";
};

const executeMerge = async () => {
  if (!canConfirmMerge.value) return;

  const payload = {
    parentId: parentContact.value.id ?? null,
    childId: childContact.value.id ?? null,
    parentContact: sanitizeMergeContact(parentContact.value),
    childContact: sanitizeMergeContact(childContact.value),
    mergeableFields: [...mergeValidation.value.mergeableFields],
    mergedPreview: mergePreview.value ? { ...mergePreview.value } : null,
  };

  try {
    mergeLoading.value = true;
    mergeError.value = "";

    let contact = null;
    if (typeof props.mergeContacts === "function") {
      const response = await props.mergeContacts(payload);
      contact = response?.object ?? null;
    }

    emit("merged", { ...payload, contact });
    closeModal({ force: true });
  } catch (error) {
    mergeError.value =
      error?.message || "Não foi possível concluir a mesclagem de contatos.";
  } finally {
    mergeLoading.value = false;
  }
};

// ========== WATCHERS ==========
watch(
  () => props.isOpen,
  (open) => {
    if (open) {
      resetState();
      fetchCandidates(true);
    }
  },
);
</script>

<template>
  <Transition
    enter-active-class="transition duration-200 ease-out"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    leave-active-class="transition duration-150 ease-in"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div v-if="isOpen" class="merge-overlay">
      <div class="merge-modal bg-base-200">
        <!-- Header -->
        <header class="merge-header bg-base-300">
          <div class="merge-header-content">
            <div class="merge-header-icon">
              <svg
                class="size-5"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  fill-rule="evenodd"
                  d="M8 4a4 4 0 1 0 0 8 4 4 0 0 0 0-8Zm-2 9a4 4 0 0 0-4 4v1a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-1a4 4 0 0 0-4-4H6Zm7.25-2.095c.478-.86.75-1.85.75-2.905a5.973 5.973 0 0 0-.75-2.906 4 4 0 1 1 0 5.811ZM15.466 20c.34-.588.535-1.271.535-2v-1a5.978 5.978 0 0 0-1.528-4H18a4 4 0 0 1 4 4v1a2 2 0 0 1-2 2h-4.535Z"
                  clip-rule="evenodd"
                />
              </svg>
            </div>
            <div>
              <h2 class="merge-title">Mesclar Contatos</h2>
              <p class="merge-subtitle">
                {{
                  step === "select"
                    ? "Selecione o contato para mesclar"
                    : "Confirme a mesclagem"
                }}
              </p>
            </div>
          </div>

          <button
            class="merge-close-btn"
            :disabled="mergeLoading"
            @click="closeModal"
          >
            <svg
              class="size-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="2"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </header>

        <!-- Step Indicator -->
        <div class="step-indicator">
          <div
            class="step-item"
            :class="{
              active: step === 'select',
              completed: step === 'confirm',
            }"
          >
            <div class="step-circle">
              <span v-if="step === 'confirm'">✓</span>
              <span v-else>1</span>
            </div>
            <span class="step-label">Selecionar</span>
          </div>
          <div class="step-line" :class="{ active: step === 'confirm' }" />
          <div class="step-item" :class="{ active: step === 'confirm' }">
            <div class="step-circle">2</div>
            <span class="step-label">Confirmar</span>
          </div>
        </div>

        <!-- Content -->
        <div class="merge-content">
          <!-- Step 1: Select Contact -->
          <template v-if="step === 'select'">
            <!-- Current Contact Card -->
            <div class="current-contact-section">
              <p class="section-label">Contato Principal (será mantido)</p>
              <MergeContactCard
                :contact="currentContact"
                variant="primary"
                :show-badge="true"
                badge-text="Principal"
                :show-details="true"
              />
            </div>

            <!-- Search -->
            <div class="search-section">
              <p class="section-label">
                Selecione o contato a ser mesclado (será removido)
              </p>
              <div class="search-box bg-base-300">
                <svg
                  class="search-icon"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                <input
                  v-model="searchTerm"
                  placeholder="Buscar por nome ou telefone..."
                  class="search-input ring-0 focus:ring-0 bg-base-300"
                />
                <div
                  v-if="candidatesLoading && page === 1"
                  class="search-spinner"
                >
                  <div class="spinner" />
                </div>
              </div>
            </div>

            <!-- Candidates List -->
            <div class="candidates-list" :key="infiniteKey">
              <template v-if="filteredCandidates.length > 0">
                <MergeContactCard
                  v-for="contact in filteredCandidates"
                  :key="contact.id"
                  :contact="contact"
                  :selectable="true"
                  :selected="selectedContact?.id === contact.id"
                  :show-details="true"
                  @select="selectContact"
                />

                <InfiniteLoading
                  v-if="nextPage"
                  @infinite="loadMoreCandidates"
                  class="infinite-loader"
                >
                  <template #spinner>
                    <div class="infinite-spinner">
                      <div class="spinner" />
                      <span>Carregando mais contatos...</span>
                    </div>
                  </template>
                  <template #complete>
                    <span />
                  </template>
                </InfiniteLoading>
              </template>

              <div v-else-if="!candidatesLoading" class="empty-state">
                <svg
                  class="empty-icon"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  stroke-width="1.5"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"
                  />
                </svg>
                <p class="empty-text">Nenhum contato encontrado</p>
                <p class="empty-hint">
                  Tente buscar por outro nome ou telefone
                </p>
              </div>

              <div v-else class="loading-state">
                <div class="spinner spinner--lg" />
                <span>Buscando contatos...</span>
              </div>
            </div>

            <!-- Validation Warning -->
            <div
              v-if="hasSelection && !mergeValidation.canMerge"
              class="validation-warning"
            >
              <svg class="warning-icon" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fill-rule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clip-rule="evenodd"
                />
              </svg>
              <div class="warning-content">
                <p class="warning-title">Mesclagem não permitida</p>
                <ul class="warning-list">
                  <li
                    v-for="(reason, idx) in mergeValidation.reasons"
                    :key="idx"
                  >
                    {{ reason }}
                  </li>
                </ul>
              </div>
            </div>

            <!-- Success Info when can merge -->
            <div
              v-if="
                hasSelection &&
                mergeValidation.canMerge &&
                mergeValidation.mergeableFields.length > 0
              "
              class="merge-info"
            >
              <svg class="info-icon" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fill-rule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clip-rule="evenodd"
                />
              </svg>
              <div class="info-content">
                <p class="info-title">Mesclagem permitida</p>
                <ul class="info-list">
                  <li
                    v-if="mergeValidation.mergeableFields.includes('telephone')"
                  >
                    Telefones são variação de 9º dígito - será mantido o com 9
                    dígitos
                  </li>
                  <li
                    v-if="
                      mergeValidation.mergeableFields.includes('whatsapp_jid')
                    "
                  >
                    WhatsApp JID é o mesmo em ambos os contatos
                  </li>
                  <li
                    v-if="
                      mergeValidation.mergeableFields.includes('whatsapp_lid')
                    "
                  >
                    WhatsApp LID é o mesmo em ambos os contatos
                  </li>
                </ul>
              </div>
            </div>
          </template>

          <!-- Step 2: Confirm -->
          <template v-else-if="step === 'confirm'">
            <MergeConfirmationPanel
              :parent-contact="parentContact"
              :child-contact="childContact"
              :merge-validation="mergeValidation"
              :merge-preview="mergePreview"
              :confirmed="mergeIrreversibleConfirmed"
              :loading="mergeLoading"
              :error="mergeError"
              @update:confirmed="mergeIrreversibleConfirmed = $event"
            />
          </template>
        </div>

        <!-- Footer -->
        <footer class="merge-footer bg-base-300">
          <button
            v-if="step === 'confirm'"
            class="btn-secondary"
            :disabled="mergeLoading"
            @click="goBackToSelect"
          >
            <svg
              class="size-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="2"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Voltar
          </button>
          <button
            v-else
            class="btn-secondary"
            :disabled="mergeLoading"
            @click="closeModal"
          >
            Cancelar
          </button>

          <button
            v-if="step === 'select'"
            class="btn-primary"
            :disabled="!canProceedToConfirm"
            @click="goToConfirmStep"
          >
            Continuar
            <svg
              class="size-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="2"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M14 5l7 7m0 0l-7 7m7-7H3"
              />
            </svg>
          </button>
          <button
            v-else
            class="btn-primary"
            :disabled="!canConfirmMerge"
            @click="executeMerge"
          >
            <template v-if="mergeLoading">
              <div class="spinner spinner--sm spinner--white" />
              Mesclando...
            </template>
            <template v-else>
              <svg
                class="size-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                stroke-width="2"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M5 13l4 4L19 7"
                />
              </svg>
              Confirmar Mesclagem
            </template>
          </button>
        </footer>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
/* ========== OVERLAY & MODAL ========== */
.merge-overlay {
  position: absolute;
  inset: 0;
  z-index: 80;
  background-color: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(1px);
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 1rem;
  border-radius: 0.85rem;
}

.merge-modal {
  width: min(96vw, 720px);
  max-height: 95vh;
  border-radius: 1rem;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  border: 1px solid rgba(148, 163, 184, 0.15);
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
}

/* ========== HEADER ========== */
.merge-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid rgba(148, 163, 184, 0.1);
}

.merge-header-content {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.merge-header-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 0.625rem;
  background: linear-gradient(
    135deg,
    rgba(14, 116, 144, 0.2),
    rgba(8, 145, 178, 0.2)
  );
  color: rgb(34, 211, 238);
  @apply dark:bg-sky-300/30 dark:text-sky-700;
}

.merge-title {
  font-size: 1rem;
  font-weight: 700;
  margin: 0;
  @apply text-left;
}

.merge-subtitle {
  font-size: 0.75rem;
  color: rgb(148, 163, 184);
  margin: 0;
  @apply text-left;
}

.merge-close-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border-radius: 0.5rem;
  color: rgb(148, 163, 184);
  transition: all 150ms ease;
}

.merge-close-btn:hover:not(:disabled) {
  background-color: rgba(148, 163, 184, 0.15);
  color: white;
  @apply dark:bg-gray-400/30 dark:text-gray-800;
}

.merge-close-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* ========== STEP INDICATOR ========== */
.step-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 1rem;
  border-bottom: 1px solid rgba(148, 163, 184, 0.1);
}

.step-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  opacity: 0.5;
  transition: opacity 150ms ease;
}

.step-item.active,
.step-item.completed {
  opacity: 1;
}

.step-circle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.75rem;
  height: 1.75rem;
  border-radius: 50%;
  font-size: 0.75rem;
  font-weight: 600;
  background-color: rgba(148, 163, 184, 0.2);
  transition: all 150ms ease;
}

.step-item.active .step-circle {
  background: linear-gradient(135deg, rgb(14, 116, 144), rgb(8, 145, 178));
  color: white;
}

.step-item.completed .step-circle {
  background: linear-gradient(135deg, rgb(34, 197, 94), rgb(22, 163, 74));
  color: white;
}

.step-label {
  font-size: 0.8rem;
  font-weight: 500;
}

.step-line {
  width: 3rem;
  height: 2px;
  background-color: rgba(148, 163, 184, 0.2);
  border-radius: 1px;
  transition: background-color 150ms ease;
}

.step-line.active {
  background: linear-gradient(90deg, rgb(34, 197, 94), rgb(14, 116, 144));
}

/* ========== CONTENT ========== */
.merge-content {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.section-label {
  font-size: 0.75rem;
  font-weight: 600;
  opacity: 0.6;
  margin-bottom: 0.5rem;
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

/* ========== SEARCH ========== */
.search-box {
  display: flex;
  align-items: center;
  gap: 0.125rem;
  padding: 0rem 0.875rem;
  border-radius: 0.625rem;
  @apply bg-base-300 border border-base-100;
}

.search-icon {
  width: 1.125rem;
  height: 1.125rem;
  color: rgb(148, 163, 184);
  flex-shrink: 0;
}

.search-input {
  flex: 1;
  border: none;
  outline: none;
  font-size: 0.875rem;
  background: transparent;
  padding: 0.725rem;
  border: none;
  outline: none;
}

.search-input:focus {
  outline: none;
  border: none;
}

.search-input::placeholder {
  color: rgba(148, 163, 184, 0.6);
}

.search-spinner {
  flex-shrink: 0;
}

/* ========== CANDIDATES LIST ========== */
.candidates-list {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  max-height: 320px;
  overflow-y: auto;
  padding-right: 0.25rem;
}

.infinite-loader {
  padding: 0.75rem;
}

.infinite-spinner {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-size: 0.75rem;
  color: rgb(148, 163, 184);
}

/* ========== EMPTY & LOADING STATES ========== */
.empty-state,
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  gap: 0.5rem;
}

.empty-icon {
  width: 3rem;
  height: 3rem;
  color: rgba(148, 163, 184, 0.4);
}

.empty-text {
  font-size: 0.875rem;
  font-weight: 500;
  opacity: 0.6;
  margin: 0;
}

.empty-hint {
  font-size: 0.75rem;
  opacity: 0.7;
  margin: 0;
}

.loading-state {
  gap: 0.75rem;
  font-size: 0.875rem;
  opacity: 0.6;
}

/* ========== VALIDATION WARNING ========== */
.validation-warning {
  display: flex;
  gap: 0.75rem;
  padding: 0.875rem;
  border-radius: 0.625rem;
  background-color: rgba(245, 158, 11, 0.1);
  border: 1px solid rgba(245, 158, 11, 0.3);
}

.warning-icon {
  width: 1.25rem;
  height: 1.25rem;
  color: rgb(245, 158, 11);
  flex-shrink: 0;
  margin-top: 0.125rem;
}

.warning-content {
  flex: 1;
}

.warning-title {
  font-size: 0.8rem;
  font-weight: 600;
  color: rgb(245, 158, 11);
  margin: 0 0 0.375rem;
}

.warning-list {
  margin: 0;
  padding-left: 1rem;
  font-size: 0.75rem;
  color: rgba(245, 158, 11, 0.9);
}

.warning-list li {
  margin-bottom: 0.125rem;
}

/* ========== MERGE INFO (SUCCESS) ========== */
.merge-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.875rem;
  border-radius: 0.625rem;
  background-color: rgba(34, 197, 94, 0.1);
  border: 1px solid rgba(34, 197, 94, 0.3);
}

.info-icon {
  width: 1.25rem;
  height: 1.25rem;
  color: rgb(34, 197, 94);
  flex-shrink: 0;
  margin-top: 0.125rem;
  @apply dark:text-green-600;
}

.info-content {
  flex: 1;
}

.info-title {
  font-size: 0.8rem;
  font-weight: 600;
  color: rgb(34, 197, 94);
  margin: 0 0 0.375rem;
  @apply dark:text-green-600;
}

.info-list {
  margin: 0;
  padding-left: 1rem;
  font-size: 0.75rem;
  color: rgba(34, 197, 94, 0.9);
  @apply dark:text-green-500;
}

.info-list li {
  margin-bottom: 0.125rem;
}

/* ========== FOOTER ========== */
.merge-footer {
  display: flex;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 1rem 1.25rem;
  border-top: 1px solid rgba(148, 163, 184, 0.1);
}

.btn-secondary,
.btn-primary,
.btn-danger {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.375rem;
  padding: 0.625rem 1rem;
  border-radius: 0.5rem;
  font-size: 0.8rem;
  font-weight: 600;
  transition: all 150ms ease;
}

.btn-secondary {
  background-color: rgba(148, 163, 184, 0.1);
  border: 1px solid rgba(148, 163, 184, 0.2);
  color: rgb(148, 163, 184);
  @apply dark:bg-gray-300 dark:text-gray-700;
}

.btn-secondary:hover:not(:disabled) {
  background-color: rgba(148, 163, 184, 0.2);
  color: white;
  @apply dark:bg-gray-400 dark:text-gray-800;
}

.btn-primary {
  background: linear-gradient(135deg, rgb(14, 116, 144), rgb(8, 145, 178));
  border: 1px solid rgb(14, 116, 144);
  color: white;
  box-shadow: 0 4px 12px rgba(14, 116, 144, 0.4);
  @apply dark:bg-blue-600 dark:text-white;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-1px);
}

.btn-danger {
  background: linear-gradient(135deg, rgb(220, 38, 38), rgb(185, 28, 28));
  border: 1px solid rgb(220, 38, 38);
  color: white;
  box-shadow: 0 4px 12px rgba(220, 38, 38, 0.4);
  @apply dark:bg-red-600 dark:text-white;
}

.btn-danger:hover:not(:disabled) {
  transform: translateY(-1px);
}

.btn-secondary:disabled,
.btn-primary:disabled,
.btn-danger:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

/* ========== SPINNER ========== */
.spinner {
  width: 1rem;
  height: 1rem;
  border: 2px solid rgba(148, 163, 184, 0.3);
  border-top-color: rgb(14, 116, 144);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.spinner--sm {
  width: 0.875rem;
  height: 0.875rem;
  border-width: 2px;
}

.spinner--lg {
  width: 1.5rem;
  height: 1.5rem;
  border-width: 3px;
}

.spinner--white {
  border-color: rgba(255, 255, 255, 0.3);
  border-top-color: white;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* ========== RESPONSIVE ========== */
@media (max-width: 639px) {
  .merge-modal {
    width: 100%;
    max-height: 95vh;
    border-radius: 0.75rem;
  }

  .merge-footer {
    flex-direction: column-reverse;
  }

  .btn-secondary,
  .btn-primary,
  .btn-danger {
    width: 100%;
  }

  .step-label {
    display: none;
  }

  .step-line {
    width: 2rem;
  }
}

/* ========== SCROLLBAR ========== */
.candidates-list::-webkit-scrollbar,
.merge-content::-webkit-scrollbar {
  width: 6px;
}

.candidates-list::-webkit-scrollbar-track,
.merge-content::-webkit-scrollbar-track {
  background: transparent;
}

.candidates-list::-webkit-scrollbar-thumb,
.merge-content::-webkit-scrollbar-thumb {
  background: rgba(148, 163, 184, 0.3);
  border-radius: 3px;
}

.candidates-list::-webkit-scrollbar-thumb:hover,
.merge-content::-webkit-scrollbar-thumb:hover {
  background: rgba(148, 163, 184, 0.5);
}
</style>
