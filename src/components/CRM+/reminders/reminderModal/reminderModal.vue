<script setup>
import { computed, onMounted, ref } from "vue";
import ReminderList from "../reminderModal/reminderList.vue";
import ReminderForm from "../reminderModal/reminderForm.vue";
import { saveReminder, deleteReminder } from "../reminderFunctions.js";

const formRef = ref(null);
const formData = ref({});
const saveLoader = ref(false);
const headerLabel = computed(() => {
  if (pageState.value === "list") return "Lembretes";
  if (pageState.value === "create") return "Criar Lembrete";
  if (pageState.value === "edit") return "Editar Lembrete";
  return "Lembretes";
});

const handleSave = () => {
  if (saveLoader.value) return;

  saveLoader.value = true;
  formRef.value
    ?.save()
    .then(() => {
      // Após salvar, voltar para a lista
      pageState.value = "list";
    })
    .catch((error) => {
      console.error("Erro ao salvar lembrete:", error);
    })
    .finally(() => {
      saveLoader.value = false;
    });
};

const emits = defineEmits(["close"]);
const listState = ref("Próximos");
const listButtons = ref(["Próximos", "Executados"]);
const pageState = ref("list"); //list || create || edit

const toggleCloseModal = () => {
  if (pageState.value === "list") {
    emits("close");
  } else {
    pageState.value = "list";
  }
};

const openForm = (payload) => {
  if (payload?.type === "create") {
    pageState.value = "create";
    formData.value = {};
  } else if (payload?.type === "edit") {
    pageState.value = "edit";
    formData.value = payload;
  }
};
</script>

<template>
  <div class="reminder-modal-header">
    <div class="reminder-modal-overlay" />
    <div class="modal_responsive">
      <div
        class="flex min-h-full items-center justify-center text-center sm:p-0"
      >
        <div class="reminder-modal-container">
          <div class="reminder-modal-title bg-base-300 border-base-100">
            <section class="flex flex-col gap-1 w-full">
              <div class="flex items-center gap-1">
                <svg
                  class="size-5 text-primary"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M17.133 12.632v-1.8a5.406 5.406 0 0 0-4.154-5.262.955.955 0 0 0 .021-.106V3.1a1 1 0 0 0-2 0v2.364a.955.955 0 0 0 .021.106 5.406 5.406 0 0 0-4.154 5.262v1.8C6.867 15.018 5 15.614 5 16.807 5 17.4 5 18 5.538 18h12.924C19 18 19 17.4 19 16.807c0-1.193-1.867-1.789-1.867-4.175ZM8.823 19a3.453 3.453 0 0 0 6.354 0H8.823Z"
                  />
                </svg>
                <h3 class="text-md">{{ headerLabel }}</h3>

                <button
                  @click="toggleCloseModal()"
                  class="reminder-modal-close-button bg-base-200/40"
                >
                  <svg
                    v-if="pageState === 'list'"
                    class="size-4"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke="currentColor"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M6 18 17.94 6M18 18 6.06 6"
                    />
                  </svg>

                  <svg
                    v-else
                    class="size-4"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke="currentColor"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="m15 19-7-7 7-7"
                    />
                  </svg>
                </button>
              </div>

              <div
                v-if="pageState === 'list'"
                class="flex flex-col lg:flex-row w-full gap-1.5"
              >
                <button
                  v-for="btn in listButtons"
                  @click="listState = btn"
                  :class="[
                    ' w-full  rounded-md px-2 flex items-center lg:justify-center justify-between gap-1.5 py-1 text-sm font-medium transition-all duration-200',
                    listState === btn
                      ? 'bg-primary_alt'
                      : 'bg-base-100 text-gray-400 hover:bg-primary_alt hover:text-white',
                  ]"
                >
                  <p>{{ btn }}</p>
                  <svg
                    v-if="btn === 'Próximos'"
                    class="size-3.5"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10S2 17.523 2 12Zm11-4a1 1 0 1 0-2 0v4a1 1 0 0 0 .293.707l3 3a1 1 0 0 0 1.414-1.414L13 11.586V8Z"
                      clip-rule="evenodd"
                    />
                  </svg>

                  <svg
                    v-else
                    class="size-3.5"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10S2 17.523 2 12Zm13.707-1.293a1 1 0 0 0-1.414-1.414L11 12.586l-1.793-1.793a1 1 0 0 0-1.414 1.414l2.5 2.5a1 1 0 0 0 1.414 0l4-4Z"
                      clip-rule="evenodd"
                    />
                  </svg>
                </button>
              </div>
            </section>
          </div>

          <div class="flex-1 min-h-0 flex flex-col bg-base-200 overflow-hidden">
            <ReminderList
              v-show="pageState === 'list'"
              v-model:listState="listState"
              @openForm="openForm($event)"
            />

            <ReminderForm
              v-model="formData"
              ref="formRef"
              v-if="pageState === 'create' || pageState === 'edit'"
            />
          </div>

          <div class="reminder-modal-end-button border-base-100 bg-base-300">
            <button
              :disabled="saveLoader"
              class="btn-save-reminder bg-primary hover:bg-primary_alt disabled:opacity-50 disabled:cursor-not-allowed"
              @click="handleSave"
              v-if="pageState !== 'list'"
            >
              <div
                v-if="saveLoader"
                class="size-3 animate-spin rounded-full border-2 border-solid text-primary border-t-transparent"
              />

              <p v-else-if="!saveLoader && pageState === 'edit'">Salvar</p>
              <p v-else>Criar</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.reminder-modal-header {
  position: fixed;
  justify-content: center;
  align-items: center;
  display: flex;
  left: 0px;
  top: 0px;
  height: 100%;
  width: 100%;
  z-index: 50;
  --tw-backdrop-blur: blur(2px);
  -webkit-backdrop-filter: var(--tw-backdrop-blur) var(--tw-backdrop-brightness)
    var(--tw-backdrop-contrast) var(--tw-backdrop-grayscale)
    var(--tw-backdrop-hue-rotate) var(--tw-backdrop-invert)
    var(--tw-backdrop-opacity) var(--tw-backdrop-saturate)
    var(--tw-backdrop-sepia);
  backdrop-filter: var(--tw-backdrop-blur) var(--tw-backdrop-brightness)
    var(--tw-backdrop-contrast) var(--tw-backdrop-grayscale)
    var(--tw-backdrop-hue-rotate) var(--tw-backdrop-invert)
    var(--tw-backdrop-opacity) var(--tw-backdrop-saturate)
    var(--tw-backdrop-sepia);
  @apply reminder-modal-transition;
}

.reminder-modal-container {
  flex-direction: column;
  display: flex;
  height: 28rem /* 448px */;
  width: 90%;
  z-index: 50;
  border-radius: 1rem /* 16px */;
  --tw-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
  --tw-shadow-colored: 0 1px 3px 0 var(--tw-shadow-color),
    0 1px 2px -1px var(--tw-shadow-color);
  box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000),
    var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow);
  --tw-shadow-color: #000;
  --tw-shadow: var(--tw-shadow-colored);
}

@media (min-width: 864px) {
  .reminder-modal-container {
    width: 40%;
  }
}

.reminder-modal-transition {
  animation: 0.1s ease-out 0s 1 modalani;
  transition: opacity 0.2s ease-in-out;
}

.reminder-modal-overlay {
  position: absolute;
  height: 100%;
  width: 100%;
  background-color: #000000;
  opacity: 0.2;
  --tw-bg-opacity: 1;
}

.reminder-modal-title {
  display: flex;
  text-transform: uppercase;
  justify-content: space-between;
  align-items: flex-start;
  padding: 0.75rem;
  padding-top: 0.75rem;
  padding-bottom: 0.75rem;
  border-top-left-radius: 1rem /* 16px */;
  border-top-right-radius: 1rem /* 16px */;
  color: currentColor;
}

.reminder-modal-end-button {
  display: flex;
  justify-content: flex-end;
  padding: 0.5rem;
  border-bottom-right-radius: 1rem /* 16px */;
  border-bottom-left-radius: 1rem /* 16px */;
  margin-right: calc(0.5rem /* 8px */ * var(--tw-space-x-reverse));
  margin-left: calc(0.5rem /* 8px */ * calc(1 - var(--tw-space-x-reverse)));
  --tw-space-x-reverse: 0;
}

.reminder-modal-close-button {
  transition-duration: 300ms;
  border-radius: 0.5rem /* 8px */;
  font-size: 0.875rem /* 14px */;
  line-height: 1.25rem /* 20px */;
  padding: 0.375rem /* 6px */;
  margin-left: auto;
  display: inline-flex;
  align-items: center;
}

.reminder-modal-close-button:hover {
  --tw-text-opacity: 1;
  color: rgb(255 255 255 / var(--tw-text-opacity, 1)) /* #ffffff */;

  --tw-bg-opacity: 1;
  background-color: rgb(75 85 99 / var(--tw-bg-opacity, 1)) /* #4b5563 */;

  --tw-scale-x: 1.05;
  --tw-scale-y: 1.05;
  transform: translate(var(--tw-translate-x), var(--tw-translate-y))
    rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y))
    scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y));
}

.btn-save-reminder {
  display: flex;
  width: 6rem /* 96px */;
  height: 1.5rem /* 24px */;
  border-radius: 0.375rem /* 6px */;
  padding: 0.25rem /* 4px */;
  align-items: center;
  justify-content: center;
  font-size: 0.675rem /* 14px */;
  line-height: 1.25rem /* 20px */;
  --tw-text-opacity: 1;
  color: rgb(255 255 255 / var(--tw-text-opacity, 1)) /* #ffffff */;
}
</style>
