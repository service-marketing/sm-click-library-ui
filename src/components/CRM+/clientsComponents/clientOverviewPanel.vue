<script setup>
import OutcomeButton from "./outcomeButton.vue";
import RatingInput from "../../inputs/ratingInput.vue";

const props = defineProps({
  hasCrmPlus: {
    type: Boolean,
    default: false,
  },
  outcome: {
    type: String,
    default: null,
  },
  rating: {
    type: [Number, String],
    default: null,
  },
  photo: {
    type: String,
    default: null,
  },
  blocked: {
    type: Boolean,
    default: false,
  },
  canBlockContacts: {
    type: Boolean,
    default: true,
  },
});

const emit = defineEmits(["update:outcome", "update:rating", "update:blocked"]);

const toggleBlocked = () => {
  emit("update:blocked", !props.blocked);
};
</script>

<template>
  <section class="client-overview-panel">
    <div
      class="client-overview-main"
      :class="{ 'client-overview-main--single': !hasCrmPlus }"
    >
      <div
        title="Não é possível alterar a foto do cliente neste momento"
        class="client-avatar-area"
      >
        <div class="client-avatar-shell">
          <img v-if="photo" :src="photo" alt="" class="avatar-client" />

          <span v-else class="no-avatar-client">
            <svg
              class="size-14"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                fill-rule="evenodd"
                d="M12 4a4 4 0 1 0 0 8 4 4 0 0 0 0-8Zm-2 9a4 4 0 0 0-4 4v1a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-1a4 4 0 0 0-4-4h-4Z"
                clip-rule="evenodd"
              />
            </svg>
          </span>

          <div class="lock-anchor">
            <Popper
              hover
              :content="
                !canBlockContacts
                  ? 'Sem permissão para esta ação'
                  : blocked
                    ? 'Desbloquear contato'
                    : 'Bloquear contato'
              "
              placement="right"
              arrow
            >
              <template #content>
                <div class="p-1 text-xs w-[150px] text-center">
                  {{
                    !canBlockContacts
                      ? "Sem permissão para esta ação"
                      : blocked
                        ? "Desbloquear contato"
                        : "Bloquear contato"
                  }}
                </div>
              </template>
              <button
                @click="toggleBlocked"
                :disabled="!canBlockContacts"
                class="lock-button transition-all duration-200"
                :class="[
                  blocked ? 'lock-button-blocked' : 'lock-button-unblocked',
                  canBlockContacts
                    ? 'lock-button-enabled'
                    : 'lock-button-disabled',
                ]"
              >
                <svg
                  v-if="blocked"
                  class="size-4 text-red-200"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    fill-rule="evenodd"
                    d="M8 10V7a4 4 0 1 1 8 0v3h1a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h1Zm2-3a2 2 0 1 1 4 0v3h-4V7Zm2 6a1 1 0 0 1 1 1v3a1 1 0 1 1-2 0v-3a1 1 0 0 1 1-1Z"
                    clip-rule="evenodd"
                  />
                </svg>

                <svg
                  v-else
                  class="size-4 text-green-200"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    fill-rule="evenodd"
                    d="M15 7a2 2 0 1 1 4 0v4a1 1 0 1 0 2 0V7a4 4 0 0 0-8 0v3H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2V7Zm-5 6a1 1 0 0 1 1 1v3a1 1 0 1 1-2 0v-3a1 1 0 0 1 1-1Z"
                    clip-rule="evenodd"
                  />
                </svg>
              </button>
            </Popper>
          </div>
        </div>
      </div>

      <div v-if="hasCrmPlus" class="client-overview-actions">
        <OutcomeButton
          :outcome="outcome"
          @update:outcome="$emit('update:outcome', $event)"
        />

        <!-- <p class="outcome-help">
          Use ganho/perdido para marcar o status da oportunidade.
        </p> -->

        <div class="client-rating-row">
          <p class="client-rating-label">Avaliação</p>

          <RatingInput
            :model-value="rating || 0"
            :size="24"
            :gap="5"
            @update:modelValue="$emit('update:rating', $event)"
          />
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.client-overview-panel {
  width: 100%;
  border-radius: 0.875rem;
  padding: 0.68rem;
}

.client-overview-main {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  gap: 0.85rem;
  align-items: center;
  min-height: 6.6rem;
}

.client-overview-main--single {
  grid-template-columns: 1fr;
  justify-items: center;
  min-height: 5.6rem;
}

.client-overview-actions {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  width: 100%;
}

.outcome-help {
  font-size: 0.68rem;
  line-height: 0.95rem;
  @apply text-white/70 dark:text-black/60;
  padding-left: 0.1rem;
}

.client-rating-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  justify-content: space-between;
  min-height: 2.7rem;
  padding: 0.45rem 0.6rem;
  border-radius: 0.68rem;
  @apply bg-base-300;
}

.client-rating-label {
  font-size: 0.76rem;
  font-weight: 600;
  letter-spacing: 0.01em;
  @apply text-white/80 dark:text-black/70;
}

.client-avatar-area {
  display: flex;
  align-items: center;
  justify-content: center;
}

.client-avatar-shell {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 0.95rem;
  @apply bg-base-300;
}

.avatar-client {
  cursor: not-allowed;
  border-radius: 0.75rem;
  object-fit: cover;
  width: 5.6rem;
  height: 5.6rem;
  @apply shadow-sm;
}

.no-avatar-client {
  cursor: not-allowed;
  justify-content: center;
  align-items: center;
  display: flex;
  width: 5.6rem;
  height: 5.6rem;
  border-radius: 0.75rem;
  @apply bg-base-300 p-2 text-white/55 dark:text-black/50;
}

.lock-anchor {
  position: absolute;
  right: -10px;
  bottom: -10px;
}

.lock-button {
  width: 1.65rem;
  height: 1.65rem;
  border-radius: 0.55rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.lock-button-blocked {
  background-color: rgb(220 38 38 / 0.6);
}

.lock-button-blocked:hover {
  background-color: rgb(239 68 68 / 0.42);
}

.lock-button-unblocked {
  background-color: rgb(22 163 74 / 0.4);
}

.lock-button-unblocked:hover {
  background-color: rgb(34 197 94 / 0.42);
}

.lock-button-enabled {
  cursor: pointer;
}

.lock-button-enabled:hover {
  transform: translateY(-1px);
}

.lock-button-disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

@media (max-width: 767px) {
  .client-overview-panel {
    padding: 0.55rem;
  }

  .client-overview-main {
    grid-template-columns: 1fr;
    justify-items: center;
    min-height: 6.2rem;
  }

  .client-overview-actions {
    width: 100%;
  }

  .client-rating-row {
    flex-direction: column;
    align-items: flex-start;
  }
}

@media (min-width: 1280px) {
  .avatar-client,
  .no-avatar-client {
    width: 5.9rem;
    height: 5.9rem;
  }
}
</style>
