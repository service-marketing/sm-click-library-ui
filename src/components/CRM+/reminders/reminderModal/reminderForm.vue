<script setup>
/**
 * 📋 Descrição:
 * Componente de formulário para criação/edição de lembretes.
 *
 * 💡 Uso:
 * <ReminderForm
 *   v-model="formData"
 *   ref="formRef" Use para resgatar métodos internos, como 'save'
 * />
 */

import { ref, computed, watch, onMounted, onBeforeUnmount } from "vue";
import {
  saveReminder,
  formatDateToSchedule,
  formatDateToHtml,
} from "../reminderFunctions.js";

const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({}),
  },
});

const date = ref(new Date(Date.now() + 60_000));
const nowRef = ref(Date.now());
const minDate = computed(() => new Date(nowRef.value + 60_000));

const createPayload = ref({
  params: {
    message: [
      {
        title: "",
        type: "text",
        content: "",
      },
    ],
    schedule: {
      type: "unique",
      time: formatDateToSchedule(date.value),
      timezone: "America/Sao_Paulo",
    },
  },
});

const tittleError = ref(false);

const save = async () => {
  const min = minDate.value.getTime();
  const current = date.value.getTime();

  if (current < min) {
    date.value = new Date(min);
    createPayload.value.params.schedule.time = formatDateToSchedule(date.value);
  }

  try {
    await saveReminder(createPayload.value);
  } catch (error) {
    tittleError.value = true;
    console.log("Erro ao salvar lembrete:", error);
    return Promise.reject(error);
  }
};

watch(date, (newVal) => {
  if (!(newVal instanceof Date)) return;
  const min = minDate.value;
  if (newVal.getTime() < min.getTime()) {
    date.value = new Date(min.getTime());
  }
});

let timerId;
onMounted(() => {
  timerId = setInterval(() => {
    nowRef.value = Date.now();

    const min = minDate.value;
    if (date.value.getTime() < min.getTime()) {
      date.value = new Date(min.getTime());
    }
  }, 15_000);

  if (props.modelValue && Object.keys(props.modelValue).length > 0) {
    createPayload.value = JSON.parse(JSON.stringify(props.modelValue));

    const parsed = new Date(
      createPayload.value.params?.schedule?.time || date.value,
    );
    if (isNaN(parsed.getTime()) || parsed.getTime() < minDate.value.getTime()) {
      createPayload.value.params.schedule.time = formatDateToSchedule(
        minDate.value,
      );
      date.value = new Date(minDate.value.getTime());
    } else {
      date.value = parsed;
    }
  }
});

onBeforeUnmount(() => {
  if (timerId) clearInterval(timerId);
});

defineExpose({ save });
</script>

<template>
  <div class="table-body-container">
    <span class="reminder-form-label-name">
      <section class="flex items-center gap-1">
        <p class="reminder-form-label-text">Nome</p>
        <a
          v-if="
            tittleError && createPayload.params.message[0].title.trim() === ''
          "
          class="text-red-500 text-[10px] mt-0.3"
        >
          Campo obrigatório</a
        >
      </section>

      <input
        v-model="createPayload.params.message[0].title"
        @input="tittleError = false"
        placeholder="Ligar para o cliente às 14h"
        type="text"
        :class="[
          'reminder-form-input-name bg-base-300',
          tittleError && createPayload.params.message[0].title.trim() === ''
            ? 'border-red-500 border-2'
            : 'border-transparent border-none',
        ]"
      />
    </span>

    <span class="reminder-form-label-description">
      <p class="reminder-form-label-text">Descrição</p>

      <div class="reminder-form-label-description-container bg-base-300">
        <textarea
          v-model="createPayload.params.message[0].content"
          placeholder="Ligar para o cliente para confirmar o agendamento da reunião."
          class="reminder-form-input-description bg-base-300"
          maxlength="1000"
          aria-label="Anotações do cliente"
        ></textarea>

        <div
          class="description-character-count bg-base-300"
          :class="
            createPayload.params.message[0].content.length > 900
              ? 'text-red-500'
              : createPayload.params.message[0].content.length > 700
                ? 'text-yellow-500'
                : 'text-gray-400'
          "
        >
          {{ createPayload.params.message[0].content.length || 0 }}/1000
        </div>
      </div>
    </span>

    <span class="reminder-form-label-date">
      <p class="reminder-form-label-text">Data do lembrete</p>

      <div class="reminder-data-picker-container">
        <VueDatePicker
          v-model="date"
          text-input
          locale="pt-BR"
          cancel-text="Cancelar"
          select-text="Confirmar"
          :enable-time-picker="true"
          format="dd/MM/yyyy HH:mm"
          :teleport="true"
          :min-date="minDate"
          @update:model-value="
            createPayload.params.schedule.time = formatDateToSchedule(date)
          "
        >
          <template #clear-icon></template>
          <template #dp-input>
            <button class="reminder-btn-data-picker bg-base-300 group">
              <svg
                class="size-4.5 group-hover:scale-105 group-hover:text-primary_alt transition-all duration-200"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  fill-rule="evenodd"
                  d="M5 5a1 1 0 0 0 1-1 1 1 0 1 1 2 0 1 1 0 0 0 1 1h1a1 1 0 0 0 1-1 1 1 0 1 1 2 0 1 1 0 0 0 1 1h1a1 1 0 0 0 1-1 1 1 0 1 1 2 0 1 1 0 0 0 1 1 2 2 0 0 1 2 2v1a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V7a2 2 0 0 1 2-2ZM3 19v-7a1 1 0 0 1 1-1h16a1 1 0 0 1 1 1v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Zm6.01-6a1 1 0 1 0-2 0 1 1 0 0 0 2 0Zm2 0a1 1 0 1 1 2 0 1 1 0 0 1-2 0Zm6 0a1 1 0 1 0-2 0 1 1 0 0 0 2 0Zm-10 4a1 1 0 1 1 2 0 1 1 0 0 1-2 0Zm6 0a1 1 0 1 0-2 0 1 1 0 0 0 2 0Zm2 0a1 1 0 1 1 2 0 1 1 0 0 1-2 0Z"
                  clip-rule="evenodd"
                />
              </svg>

              <div
                class="flex gap-1.5 text-xs group-hover:scale-105 group-hover:text-primary_alt transition-all duration-200"
              >
                <p>{{ formatDateToHtml("data", date) }}</p>
                -
                <p>{{ formatDateToHtml("time", date) }}</p>
              </div>
            </button>
          </template>
        </VueDatePicker>
      </div>
    </span>
  </div>
</template>

<style scoped>
.table-body-container {
  overflow: hidden;
  max-width: 100%;
  gap: 0.5rem;
  flex-direction: column;
  display: flex;
  min-height: 0px;
  flex: 1 1 0%;
  height: 100%;
  padding: 0.5rem;
}

.reminder-form-label-name {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.25rem;
}

.reminder-form-input-name {
  width: 100%;
  font-size: 0.75rem;
  line-height: 1rem;
  border-radius: 0.375rem;
  padding: 0.5rem;
  height: 2.25rem;
  outline: 2px solid transparent;
  outline-offset: 2px;
}

.reminder-form-input-name:focus {
  outline: 2px solid transparent;
  outline-offset: 2px;

  --tw-ring-offset-shadow: var(--tw-ring-inset) 0 0 0
    var(--tw-ring-offset-width) var(--tw-ring-offset-color);
  --tw-ring-shadow: var(--tw-ring-inset) 0 0 0
    calc(0px + var(--tw-ring-offset-width)) var(--tw-ring-color);
  box-shadow:
    var(--tw-ring-offset-shadow), var(--tw-ring-shadow),
    var(--tw-shadow, 0 0 #0000);
  --tw-shadow: 0 0 #0000;
  --tw-shadow-colored: 0 0 #0000;
  box-shadow:
    var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000),
    var(--tw-shadow);
}

.reminder-form-input-name::placeholder {
  --tw-text-opacity: 1;
  color: rgb(107 114 128 / var(--tw-text-opacity, 1));
}

.reminder-form-label-description {
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  align-items: flex-start;
  flex: 1 1 0%;
  min-height: 0px;
  width: 100%;
}

.reminder-form-input-description {
  border-style: none;
  outline: 2px solid transparent;
  outline-offset: 2px;
  border-radius: 0.375rem;
  font-size: 0.75rem;
  line-height: 1rem;
  width: 100%;
  resize: none;
  padding: 0.5rem;
  height: 100%;
  max-height: 100%;
  min-height: 0px;
  flex: 1 1 0%;
}

.reminder-form-input-description:focus {
  outline: 2px solid transparent;
  outline-offset: 2px;

  --tw-ring-offset-shadow: var(--tw-ring-inset) 0 0 0
    var(--tw-ring-offset-width) var(--tw-ring-offset-color);
  --tw-ring-shadow: var(--tw-ring-inset) 0 0 0
    calc(0px + var(--tw-ring-offset-width)) var(--tw-ring-color);
  box-shadow:
    var(--tw-ring-offset-shadow), var(--tw-ring-shadow),
    var(--tw-shadow, 0 0 #0000);
  --tw-shadow: 0 0 #0000;
  --tw-shadow-colored: 0 0 #0000;
  box-shadow:
    var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000),
    var(--tw-shadow);
}

.reminder-form-label-description-container {
  width: 100%;
  height: 100%;
  border-radius: 0.5rem;
  display: flex;
  flex-direction: column;
  min-height: 0px;
}

.description-character-count {
  font-size: 10px;
  padding-left: 0.25rem;
  padding-right: 0.25rem;
  text-align: right;
  margin-bottom: 0.25rem;
  margin-right: 0.25rem;
}

.reminder-form-label-date {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.25rem;
  flex: none;
}

.reminder-form-label-text {
  font-weight: 500;
  font-size: 0.875rem;
  line-height: 1.25rem;
}

.reminder-data-picker-container {
  display: flex;
  gap: 0.5rem;
  width: 100%;
}

.reminder-btn-data-picker {
  width: 100%;
  border-radius: 0.375rem;
  height: 2.25rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
}
</style>
