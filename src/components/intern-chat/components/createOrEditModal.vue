<script setup>
import { computed, ref, inject, watch } from "vue";
import Avatar from "../Avatar.vue";

const props = defineProps({
  listAttendances: {
    type: Array,
    default: () => [],
  },
  submitGroup: {
    type: Function,
    default: null,
  },
  errorMap: {
    type: Array,
    default: () => [],
  },
  isCreatingGroup: {
    type: Boolean,
    default: false,
  },
  mode: {
    type: String,
    default: "create", // ou "edit" dependendo do uso futuro
  },
  selectedGroup: {
    type: Object,
    default: null,
  },
});

// --- Injects recebidos de ChatWindow ---
const useChat = inject("useChat");
// --------------------------------------

// --- Controle de estado do modal ---
const popperPanelRef = ref(null);

const closeModal = () => {
  if (typeof useChat.closeCreateOrEdit === "function") {
    useChat.closeCreateOrEdit();
    return;
  }
};

const resetForm = () => {
  groupNameModel.value = "";
  localSelectedParticipants.value = [];
  closeModal();
};
// -----------------------------------

// --- Funções responsaveis pela montagem do payloud de criação/edição ---
const groupNameModel = ref("");
const localSelectedParticipants = ref([]);

const isEditMode = computed(() => props.mode === "edit");

const syncFormWithMode = () => {
  groupNameModel.value = props.selectedGroup?.name || "";
  localSelectedParticipants.value = Array.isArray(
    props.selectedGroup?.participants,
  )
    ? [...props.selectedGroup.participants]
    : [];
};

watch(
  () => [props.mode, props.selectedGroup],
  () => {
    syncFormWithMode();
  },
  { immediate: true },
);

const canCreateGroup = computed(
  () =>
    localSelectedParticipants.value.length > 1 &&
    (isEditMode.value || groupNameModel.value.trim() !== "") &&
    !props.isCreatingGroup,
);

const isSelected = (attendant) =>
  localSelectedParticipants.value.some((id) => id === attendant.id);

const selectAttendant = (attendant) => {
  const selectedList = isSelected(attendant)
    ? localSelectedParticipants.value.filter((id) => id !== attendant.id)
    : [...localSelectedParticipants.value, attendant.id];

  localSelectedParticipants.value = selectedList;
};

const createGroup = async () => {
  if (typeof props.submitGroup !== "function") return;

  const mountPayload = {
    participants: localSelectedParticipants.value.map((id) => id),
    chat_name: isEditMode.value
      ? props.selectedGroup?.name || ""
      : groupNameModel.value,
    channel_id: props.selectedGroup?.internal_chat?.channel_id,
    previousParticipants: props.selectedGroup?.participants || [],
  };

  const hasSavedGroup = await props.submitGroup(mountPayload, props.mode);

  if (hasSavedGroup) {
    resetForm();
  }
};
// -----------------------------------------------------------------------
</script>

<template>
  <div>
    <div class="popper-backdrop" @click="closeModal"></div>

    <div ref="popperPanelRef" class="popper-panel" @click.stop>
      <header class="popper-header bg-base-300 border-b border-base-200">
        <div class="popper-title-row">
          <div class="popper-title">
            {{ mode === "create" ? "Criar Grupo" : "Editar Grupo" }}
          </div>
          <div class="popper-counter">
            {{ localSelectedParticipants.length }} selecionado(s)
          </div>
        </div>
        <!-- Error map shown when createGroup fails -->
        <div v-if="errorMap.length" class="error-list">
          <div v-for="err in errorMap" :key="err.key" class="error-item">
            <strong class="error-key">{{ err.key }}:</strong>
            <span class="error-message">{{ err.message }}</span>
          </div>
        </div>
      </header>

      <div class="popper-list">
        <div
          v-for="att in listAttendances"
          :key="att.id"
          class="popper-item"
          :class="{ selected: isSelected(att) }"
          @click.stop
          @click="selectAttendant(att)"
        >
          <Avatar :url="att.photo" :style="'size-8'" />
          <span class="popper-item-name">{{ att.name }}</span>

          <span class="checkmark" aria-hidden="true">
            <svg
              v-if="isSelected(att)"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              class="size-4"
            >
              <path
                fill-rule="evenodd"
                d="M2.25 12a9.75 9.75 0 1 1 19.5 0 9.75 9.75 0 0 1-19.5 0Zm13.36-1.814a.75.75 0 0 0-1.22-.872l-3.236 4.53-1.61-1.61a.75.75 0 1 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.736-5.264Z"
                clip-rule="evenodd"
              />
            </svg>
          </span>
        </div>
      </div>

      <div
        v-if="!isEditMode"
        class="popper-group-name bg-base-300 border-t border-base-200"
      >
        <input
          v-model="groupNameModel"
          class="group-name-input bg-base-100"
          placeholder="Nome do grupo"
        />
      </div>

      <div class="popper-actions bg-base-300 border-t border-base-200">
        <button
          class="btn-cancel"
          @click="closeModal"
          :disabled="isCreatingGroup"
        >
          Cancelar
        </button>

        <button
          class="btn-create"
          :disabled="!canCreateGroup"
          @click="createGroup"
        >
          <span v-if="isCreatingGroup" class="loading-spinner"></span>
          <span>
            {{
              isCreatingGroup
                ? "Salvando..."
                : isEditMode
                  ? "Salvar alteracoes"
                  : "Criar Grupo"
            }}
          </span>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* We want specific sections to control their own spacing so the
   "nome do grupo" area stays glued to the action buttons. */
.popper-header {
  margin-bottom: 0.5rem;
}

.popper-list {
  margin-bottom: 0.5rem;
}

.popper-header {
  font-weight: 700;
}

.popper-title-row {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0.75rem 0.75rem 0.25rem;
}

.popper-title {
  font-size: 0.95rem;
}

.popper-counter {
  font-weight: 500;
  font-size: 0.8rem;
  opacity: 0.8;
}

.popper-group-name {
  padding: 0.5rem 0.75rem;
}

.popper-group-name + .popper-actions {
  border-top: 0;
}

.group-name-input {
  padding: 0.55rem 0.7rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  outline: none;
  width: 100%;
  border-radius: 8px;
  font-size: 0.9rem;
}

.popper-list {
  overflow-y: auto;
  max-height: 34vh;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  padding: 0.25rem 0.5rem;
}

.popper-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  width: 100%;
  transition:
    transform 0.3s ease,
    background-color 0.3s ease;
  padding: 0.5rem;
  border-radius: 6px;
  border: 1px solid transparent;
  background-color: var(--popper-bg);
}

:global(:root) {
  --popper-bg: rgba(59, 130, 246, 0.1);
  --popper-even-bg: #26343d;
  --popper-panel-bg: rgb(27, 30, 36);
  --popper-selected-color: rgb(31, 70, 128);
}

:global(.dark) {
  --popper-bg: rgb(255, 255, 255);
  --popper-even-bg: #97d1f5;
  --popper-panel-bg: rgb(196 214 226);
  --popper-selected-color: #5bbefc;
  --border-color: rgba(0, 0, 0, 0.08);
  --background-checkmark: rgba(0, 0, 0, 0.08);
}

.popper-item:nth-child(even) {
  background-color: var(--popper-even-bg);
}

.popper-item:hover:not(.selected) {
  background-color: rgba(15, 132, 228, 0.4);
}

.popper-item.selected {
  background-color: var(--popper-selected-color);
}

.popper-item.selected .popper-item-name {
  font-weight: bold;
}

.popper-item-name {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.popper-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  padding: 0.4rem;
}

/* Estilos do Popper */
.popper-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(46, 28, 28, 0.25);
  z-index: 40;
}

.popper-panel {
  position: absolute;
  right: 0.5rem;
  bottom: 3.25rem;
  width: 320px;
  max-height: 60vh;
  background: var(--popper-panel-bg);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 8px;
  box-shadow: 0 0 4px rgba(0, 0, 0, 0.7);
  z-index: 50;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

:global(.dark) .group-name-input {
  border-color: rgba(0, 0, 0, 0.08);
}

.hint-text {
  padding: 0.25rem 0.75rem 0;
  font-weight: 500;
  font-size: 0.8rem;
  opacity: 0.75;
}

.checkmark {
  margin-left: auto;
  width: 26px;
  height: 26px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 9999px;
  background: rgba(255, 255, 255, 0.08);
  flex: 0 0 auto;
}

.btn-cancel {
  background: none;
  border: 1px solid rgba(0, 0, 0, 0.06);
  padding: 0.45rem 0.6rem;
  border-radius: 6px;
  cursor: pointer;
}

.btn-create {
  background: #3b82f6;
  color: rgb(51, 24, 24);
  padding: 0.45rem 0.6rem;
  border-radius: 6px;
  border: none;
  cursor: pointer;
}

.btn-create:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.popper-header {
  padding-top: 0.3rem;
  padding-bottom: 0.75rem;
}

.error-list {
  margin-top: 0.5rem;
  padding: 0.5rem;
  background: rgba(220, 38, 38, 0.06);
  border-radius: 6px;
  border: 1px solid rgba(220, 38, 38, 0.12);
}

.error-item {
  color: #b91c1c;
  font-size: 0.875rem;
  margin-bottom: 0.25rem;
}

.error-key {
  text-transform: capitalize;
  margin-right: 0.25rem;
}

.error-message {
  color: #991b1b;
}

/* Spinner de carregamento */
.loading-spinner {
  display: inline-block;
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
  margin-right: 0.5rem;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.btn-create {
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
