<script setup>
import { computed, ref } from "vue";
import PhotoDisplay from "../../../chat/components/photoDisplay.vue";
import MinModal from "../../../modals/min_modal/min_modal.vue";

const props = defineProps({
  wallet: {
    type: Object,
    required: true,
  },
  variant: {
    type: String,
    default: "default", // "default" | "primary"
  },
  showDate: {
    type: Boolean,
    default: true,
  },
  isRemoving: {
    type: Boolean,
    default: false,
  },
  canRemove: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["remove"]);

const attendantName = computed(
  () => props.wallet?.attendantName || "Atendente nao informado",
);

const attendantPhoto = computed(() => props.wallet?.attendantPhoto || null);

const departmentName = computed(
  () => props.wallet?.departmentName || "Departamento nao informado",
);

const updatedAt = computed(() => props.wallet?.updatedAt || null);

const formatDate = (value) => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date);
};

const formattedDate = computed(() => formatDate(updatedAt.value));
const canRemove = computed(
  () => props.canRemove && Boolean(props.wallet?.departmentId),
);

const cardClasses = computed(() => {
  const classes = ["wallet-card", "bg-base-300"];
  if (props.variant === "primary") classes.push("wallet-card--primary");
  return classes;
});

const confirmRemoveOpen = ref(false);

const openRemoveConfirm = () => {
  if (!canRemove.value || props.isRemoving) return;
  confirmRemoveOpen.value = true;
};

const closeRemoveConfirm = () => {
  if (props.isRemoving) return;
  confirmRemoveOpen.value = false;
};

const handleRemove = () => {
  if (!canRemove.value || props.isRemoving) return;
  confirmRemoveOpen.value = false;
  emit("remove", props.wallet);
};
</script>

<template>
  <article :class="cardClasses">
    <header class="wallet-card__header">
      <p class="wallet-card__label">Departamento</p>
      <p
        class="wallet-card__department rounded-xl bg-sky-500 px-2 p-1"
        :title="departmentName"
      >
        {{ departmentName }}
      </p>
    </header>
    <hr
      class="border-none w-[70%] flex mx-auto justify-center bg-base-100/70 rounded-xl h-0.5"
    />
    <div class="wallet-card__body">
      <div class="wallet-card__main">
        <div class="wallet-card__avatar">
          <PhotoDisplay
            :photo="attendantPhoto"
            :tooltip="attendantName"
            size="size-10"
          />
        </div>

        <div class="wallet-card__info text-start">
          <p class="wallet-card__name" :title="attendantName">
            {{ attendantName }}
          </p>
          <p class="wallet-card__role flex gap-1">
            Responsável <span class="sm:block hidden">pelo atendimento</span>
          </p>
        </div>
      </div>

      <div class="wallet-card__actions">
        <!-- <p v-if="showDate && formattedDate" class="wallet-card__date">
          Atualizado em {{ formattedDate }}
        </p> -->
        <button
          v-if="props.canRemove"
          class="wallet-card__remove-btn"
          :disabled="isRemoving || !canRemove"
          @click="openRemoveConfirm"
        >
          {{ isRemoving ? "Removendo..." : "Remover da carteira" }}
        </button>
      </div>
    </div>
    <Transition name="fade">
      <MinModal
        v-if="confirmRemoveOpen"
        defineWidth="max-w-sm"
        @close="closeRemoveConfirm"
      >
        <template #header>
          <div class="wallet-card__modal-header">
            <div class="wallet-card__modal-icon">
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
                  d="M2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10S2 17.523 2 12Zm11-4a1 1 0 1 0-2 0v5a1 1 0 1 0 2 0V8Zm-1 7a1 1 0 1 0 0 2h.01a1 1 0 1 0 0-2H12Z"
                  clip-rule="evenodd"
                />
              </svg>
            </div>
            <p class="wallet-card__modal-title">
              Remover atendente da carteira
            </p>
          </div>
        </template>

        <template #body>
          <div class="wallet-card__modal-content bg-base-200 rounded-b-xl">
            <section class="flex flex-col gap-2 p-2">
              <div class="wallet-card__modal-message">
                <p class="wallet-card__modal-text">
                  Você está removendo o responsável por este atendimento neste
                  departamento. Esta ação não pode ser desfeita.
                </p>
              </div>

              <div class="wallet-card__modal-preview">
                <p class="wallet-card__modal-preview-label">
                  Informações da remoção:
                </p>

                <div class="wallet-card__modal-info-group">
                  <div class="wallet-card__modal-info-item">
                    <span class="wallet-card__modal-info-label"
                      >Departamento:</span
                    >
                    <p
                      class="wallet-card__modal-info-value"
                      :title="departmentName"
                    >
                      {{ departmentName }}
                    </p>
                  </div>
                </div>

                <div class="wallet-card__modal-preview-card">
                  <p class="wallet-card__modal-preview-card-label">
                    Atendente responsável:
                  </p>

                  <div class="wallet-card__modal-preview-main -mt-1">
                    <div class="wallet-card__modal-avatar">
                      <PhotoDisplay
                        v-if="attendantPhoto"
                        :photo="attendantPhoto"
                        :tooltip="attendantName"
                        size="size-12"
                      />
                    </div>

                    <div class="wallet-card__modal-info text-start">
                      <p class="wallet-card__modal-name" :title="attendantName">
                        {{ attendantName }}
                      </p>
                      <p class="wallet-card__modal-role">
                        Responsável pelo atendimento
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>
            <div class="wallet-card__modal-actions bg-base-300 rounded-b-xl">
              <button
                class="wallet-card__modal-btn wallet-card__modal-btn--cancel"
                :disabled="isRemoving"
                @click="closeRemoveConfirm"
              >
                Cancelar
              </button>
              <button
                class="wallet-card__modal-btn wallet-card__modal-btn--danger"
                :disabled="isRemoving || !canRemove"
                @click="handleRemove"
              >
                <span v-if="!isRemoving">Remover atendente</span>
                <span v-else>Removendo...</span>
              </button>
            </div>
          </div>
        </template>
      </MinModal>
    </Transition>
  </article>
</template>

<style scoped>
.wallet-card {
  border-radius: 0.75rem;
  padding: 0.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
  transition:
    border-color 150ms ease,
    box-shadow 150ms ease;
  @apply border border-base-300;
}

.wallet-card:hover {
  border-color: rgb(56 189 248 / 0.38);
  box-shadow: 0 6px 12px rgb(2 6 23 / 0.18);
}

.wallet-card--primary {
  border-color: rgb(56 189 248 / 0.35);
  background: rgb(8 47 73 / 0.42);
}

.wallet-card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
}

.wallet-card__label {
  color: rgb(148 163 184);
  font-size: 0.64rem;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  font-weight: 600;
  margin: 0;
  @apply ml-1;
}

.wallet-card__department {
  font-size: 0.72rem;
  line-height: 1.1;
  font-weight: 600;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.wallet-card__body {
  width: 100%;
  display: flex;
  justify-content: space-between;
  gap: 0.65rem;
  align-items: flex-end;
}

.wallet-card__main {
  display: flex;
  align-items: center;
  gap: 0.52rem;
  min-width: 0;
  flex: 1;
}

.wallet-card__avatar {
  border-radius: 8px;
  flex-shrink: 0;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgb(14 116 144 / 0.65);
}

.wallet-card__photo {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.wallet-card__initials {
  color: rgb(255 255 255);
  font-size: 0.72rem;
  font-weight: 700;
}

.wallet-card__info {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.wallet-card__name {
  font-size: 0.84rem;
  line-height: 1.2;
  font-weight: 700;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin: 0;
}

.wallet-card__role {
  font-size: 0.75rem;
  line-height: 1.1;
  font-weight: 400;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  opacity: 0.7;
}

.wallet-card__actions {
  text-align: right;
  flex-shrink: 0;
  display: flex;
  align-items: flex-end;
}

.wallet-card__date {
  font-size: 0.6rem;
  line-height: 1;
  color: rgb(148 163 184);
  margin: 0;
}

.wallet-card__remove-btn {
  border-radius: 0.4rem;
  border: 1px solid rgb(248 113 113 / 0.32);
  background: rgb(127 29 29 / 0.15);
  color: rgb(254 202 202);
  font-size: 0.65rem;
  font-weight: 600;
  line-height: 1.1;
  padding: 0.35rem 0.7rem;
  transition: all 150ms ease-out;
  white-space: nowrap;
  cursor: pointer;
  @apply mt-auto dark:bg-red-200/50 dark:border-red-400/40 dark:text-red-700;
}

.wallet-card__remove-btn:hover:not(:disabled) {
  border-color: rgb(248 113 113 / 0.55);
  background: rgb(127 29 29 / 0.26);
  color: rgb(254 226 226);
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgb(248 113 113 / 0.15);
  @apply dark:bg-red-200/70 dark:border-red-500/60 dark:text-red-800 dark:shadow-red-300/20;
}

.wallet-card__remove-btn:active:not(:disabled) {
  transform: translateY(0);
}

.wallet-card__remove-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.wallet-card__confirm-title {
  margin: 0;
  font-size: 0.95rem;
  font-weight: 700;
  line-height: 1.2;
}

.wallet-card__confirm-body {
  text-align: left;
}

.wallet-card__confirm-text {
  margin: 0;
  font-size: 0.86rem;
  line-height: 1.4;
}

.wallet-card__confirm-description {
  margin: 0.45rem 0 0;
  font-size: 0.76rem;
  line-height: 1.4;
  opacity: 0.65;
}

.wallet-card__confirm-target-box {
  @apply bg-base-300 p-2;
}

.wallet-card__confirm-target-label {
  margin: 0;
  font-size: 0.67rem;
  line-height: 1.2;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  opacity: 0.85;
}

.wallet-card__confirm-target {
  margin: 0.35rem 0 0;
  font-size: 0.86rem;
  line-height: 1.3;
  font-weight: 700;
  @apply dark:text-sky-700 text-sky-200;
}

.wallet-card__confirm-owner-label {
  margin: 0.4rem 0 0;
  font-size: 0.72rem;
  line-height: 1.25;
  opacity: 0.85;
}

.wallet-card__confirm-actions {
  margin-top: 0.95rem;
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
}

.wallet-card__confirm-cancel,
.wallet-card__confirm-remove {
  border-radius: 0.45rem;
  font-size: 0.74rem;
  font-weight: 600;
  padding: 0.42rem 0.7rem;
  transition: all 150ms ease;
}

.wallet-card__confirm-cancel {
  border: 1px solid rgb(148 163 184 / 0.38);
  background: transparent;
  color: rgb(226 232 240);
}

.wallet-card__confirm-cancel:hover:not(:disabled) {
  border-color: rgb(148 163 184 / 0.55);
  background: rgb(15 23 42 / 0.35);
}

.wallet-card__confirm-remove {
  border: 1px solid rgb(248 113 113 / 0.42);
  background: rgb(127 29 29 / 0.2);
  color: rgb(254 226 226);
}

.wallet-card__confirm-remove:hover:not(:disabled) {
  border-color: rgb(248 113 113 / 0.62);
  background: rgb(127 29 29 / 0.32);
}

.wallet-card__confirm-cancel:disabled,
.wallet-card__confirm-remove:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

/* Modal Styles */
.wallet-card__modal-header {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  margin: 0;
}

.wallet-card__modal-icon {
  font-size: 1.5rem;
  flex-shrink: 0;
  @apply bg-red-500/30 dark:text-rose-500 text-red-200 rounded-md p-1;
}

.wallet-card__modal-title {
  margin: 0;
  font-size: 1rem;
  font-weight: 700;
  line-height: 1.3;
  color: inherit;
}

.wallet-card__modal-content {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.wallet-card__modal-message {
  padding: 0.75rem;
  background: rgba(117, 41, 41, 0.2);
  border-radius: 1rem;
  border-left: 3px solid rgba(248, 93, 93, 0.5);
  @apply dark:bg-red-300/15 dark:border-red-500/40;
}

.wallet-card__modal-text {
  margin: 0;
  font-size: 0.85rem;
  line-height: 1.5;
  color: rgb(226 232 240);
  @apply dark:text-slate-800;
}

.wallet-card__modal-preview {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.wallet-card__modal-preview-label {
  margin: 0;
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: rgb(148 163 184);
  @apply dark:text-slate-600;
}

.wallet-card__modal-info-group {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
  padding: 0.5rem;
  border-radius: 0.5rem;
  @apply dark:bg-slate-300/90 bg-base-300/80 dark:border-slate-300/40;
}

.wallet-card__modal-info-item {
  display: flex;
  flex-direction: column;
  gap: 0rem;
}

.wallet-card__modal-info-label {
  font-size: 0.65rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: rgb(100 116 139);
  @apply dark:text-slate-600;
}

.wallet-card__modal-info-value {
  margin: 0;
  font-size: 0.85rem;
  font-weight: 600;
  color: rgb(56 189 248);
  @apply dark:text-cyan-600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.wallet-card__modal-preview-card {
  padding: 0.3rem;
  border-radius: 0.5rem;
  transition: all 150ms ease;
  @apply dark:bg-slate-300/90 p-2 bg-base-300/80 dark:border-slate-300/40;
}

.wallet-card__modal-preview-card-label {
  margin: 0 0 0.6rem 0;
  font-size: 0.65rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: rgb(100 116 139);
  @apply dark:text-slate-600;
}

.wallet-card__modal-preview-main {
  display: flex;
  align-items: center;
  gap: 0.7rem;
}

.wallet-card__modal-avatar {
  width: 3rem;
  height: 3rem;
  border-radius: 0.5rem;
  overflow: hidden;
  flex-shrink: 0;
  background: rgb(14 116 144 / 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  @apply dark:bg-cyan-100/80;
}

.wallet-card__modal-info {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  min-width: 0;
  flex: 1;
}

.wallet-card__modal-name {
  margin: 0;
  font-size: 0.85rem;
  font-weight: 700;
  line-height: 1.2;
  color: rgb(255 255 255);
  @apply dark:text-slate-900;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.wallet-card__modal-role {
  margin: 0;
  font-size: 0.8rem;
  line-height: 1.1;
  color: rgb(148 163 184);
  @apply dark:text-slate-600;
}

.wallet-card__modal-actions {
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
  @apply p-2;
}

.wallet-card__modal-btn {
  border-radius: 0.45rem;
  font-size: 0.8rem;
  font-weight: 600;
  padding: 0.5rem 1rem;
  transition: all 150ms ease-out;
  cursor: pointer;
  border: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  min-width: 5rem;
}

.wallet-card__modal-btn--cancel {
  background: rgb(51 65 85 / 0.4);
  color: rgb(226 232 240);
  border: 1px solid rgb(71 85 105 / 0.4);
  @apply dark:bg-slate-300/50 dark:text-slate-800 dark:border-slate-400/50;
}

.wallet-card__modal-btn--cancel:hover:not(:disabled) {
  background: rgb(51 65 85 / 0.6);
  border-color: rgb(148 163 184 / 0.4);
  transform: translateY(-1px);
  @apply dark:bg-slate-300/70 dark:border-slate-500/60;
}

.wallet-card__modal-btn--danger {
  background: rgb(127 29 29 / 0.3);
  color: rgb(254 202 202);
  border: 1px solid rgb(248 113 113 / 0.4);
  @apply dark:bg-red-200/70 dark:text-red-700 dark:border-red-400/50;
}

.wallet-card__modal-btn--danger:hover:not(:disabled) {
  background: rgb(127 29 29 / 0.45);
  border-color: rgb(248 113 113 / 0.6);
  color: rgb(254 226 226);
  box-shadow: 0 4px 12px rgb(248 113 113 / 0.15);
  transform: translateY(-1px);
  @apply dark:bg-red-200/85 dark:text-red-800 dark:border-red-500/70 dark:shadow-red-300/20;
}

.wallet-card__modal-btn:active:not(:disabled) {
  transform: translateY(0);
}

.wallet-card__modal-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

@media (max-width: 640px) {
  .wallet-card__actions {
    margin-left: auto;
  }

  .wallet-card__modal-actions {
    flex-direction: column-reverse;
    gap: 0.6rem;
  }

  .wallet-card__modal-btn {
    width: 100%;
  }
}
</style>
