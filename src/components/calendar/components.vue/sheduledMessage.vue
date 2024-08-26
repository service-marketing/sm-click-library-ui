<script setup>
import { ref, nextTick, onMounted } from "vue";
import DatePicker from "@vuepic/vue-datepicker";
import axios from "axios";
// import { useGlobalStore } from '../../stores/globalStore';
// import { crm_scheduled } from '../../hooks/new_urls';
import { notify } from "notiwind";
const props = defineProps({
  currentChat: {
    type: Object,
    default: {
      id: null,
      contact: {
        segmentation_fields: [],
      },
    },
  },
  theme: {
    type: Boolean,
    default: true,
  },
  date: Date,
  token: String,
});
const emit = defineEmits(["close"]);
const seeMethod = ref("post");

const config = ref({
  message: [
    {
      type: "text",
      content: "",
    },
  ],
  schedule: {
    time: props.date,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    type: "unique",
  },
  chat_id: props.currentChat.id || null,
});

const textareaRef = ref(null);

function addOneMinute() {
  const date = new Date();
  if (!isValidTime()) {
    date.setMinutes(date.getMinutes() + 1);
    config.value.schedule.time = date;
  }
}

function isValidTime() {
  const currentTime = new Date();
  const selectedTime = new Date(config.value.schedule.time);
  return selectedTime >= currentTime;
}

function addVar(variable) {
  config.value.message[0].content += ` {${variable.name}} `;
  nextTick(() => {
    textareaRef.value.focus();
  });
}

const fileInput = ref(null);

function selectFile() {
  fileInput.value.click();
}

function handleFileUpload(event) {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      config.value.file = e.target.result;
      config.value.fileName = file.name;
    };
    reader.readAsDataURL(file);
  }
}

async function programMessage() {
  try {
    if (!isValidTime()) {
      notify(
        {
          group: "error",
          title: "Erro",
          text: "O horário selecionado deve ser maior do que o horário atual.",
        },
        2000
      );
      return;
    }
    const sendConfig = JSON.parse(JSON.stringify(config.value));
    const scheduleDate = new Date(sendConfig.schedule.time);

    const localDate = new Date(
      scheduleDate.getTime() - scheduleDate.getTimezoneOffset() * 60000
    );
    const formattedSchedule = localDate
      .toISOString()
      .slice(0, 16)
      .replace("T", " ");

    sendConfig.schedule.time = formattedSchedule;
    const response = await axios[seeMethod.value](
      `http://localhost:8000/v1/api/crm/event/scheduled_message/${
        config.value.id ? `${config.value.id}/` : ""
      }`,
      {
        ...sendConfig,
      },
      {
        headers: {
          Authorization: `Bearer ${props.token}`,
        },
      }
    );
    notify(
      { group: "success", title: "Sucesso", text: response.data.message },
      2000
    );
    emit("close", false);
  } catch (e) {
    // console.log(e)
    emit("close", false);
    notify(
      { group: "error", title: "Erro", text: e.response.data.message },
      2000
    );
  }
}

function getConfig(value) {
  const params = value.params;
  config.value.schedule = params.schedule;
  config.value.message = params.message;
  config.value.id = value.id;
  seeMethod.value = "patch";
}
</script>

<template>
  <div class="pt-2 space-y-2">
    <div class="flex flex-col gap-2">
      <label for="contentInput">Horário</label>
      <DatePicker
        auto-apply="true"
        :time-picker="true"
        locale="pt-BR"
        cancel-text="Cancelar"
        select-text="Confirmar"
        :enable-time-picker="true"
        :min-date="new Date()"
        text-input
        :dark="theme"
        v-model="config.schedule.time"
      >
        <template #clear-icon="{ clear }"> </template>
      </DatePicker>
    </div>
    <div class="flex flex-col gap-2">
      <label for="contentInput">Conteúdo</label>
      <textarea
        id="sheduleMessageArea"
        ref="textareaRef"
        autofocus
        v-model="config.message[0].content"
        placeholder="Olá cliente, tudo bem?"
        class="input bg-base-200"
      />
    </div>
    <div
      v-if="
        currentChat.contact &&
        currentChat.contact.segmentation_fields.length > 0
      "
      class="p-2 pt-4 border border-base-100 rounded relative hadow shadow-gray-900 dark:shadow-gray-00"
    >
      <div
        class="absolute gap-1 -top-3 left-3 px-2 bg-base-300 flex items-center"
      >
        Campos personalizáveis disponíveis
        <Popper
          placement="top"
          :arrow="true"
          :hover="true"
          class="info"
          content=""
        >
          <svg
            class="w-5 h-5 dark:text-primary text-white"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              fill-rule="evenodd"
              d="M2 12a10 10 0 1 1 20 0 10 10 0 0 1-20 0Zm9.4-5.5a1 1 0 1 0 0 2 1 1 0 1 0 0-2ZM10 10a1 1 0 1 0 0 2h1v3h-1a1 1 0 1 0 0 2h4a1 1 0 1 0 0-2h-1v-4c0-.6-.4-1-1-1h-2Z"
              clip-rule="evenodd"
            />
          </svg>
          <template #content>
            <p class="break-words text-justify w-[470px]">
              Ao enviar a mensagem para o cliente o valor deste campo será
              substituído pelo valor correspondente no momento do envio
            </p>
          </template>
        </Popper>
      </div>
      <div class="flex flex-wrap gap-2">
        <div
          @click="addVar(variable)"
          v-for="variable in globalStore.messageStore.currentChat.contact
            .segmentation_fields"
          :key="variable"
          class="bg-primary_alt cursor-pointer text-white py-1 px-2 rounded-lg"
        >
          {{ variable.name }}
        </div>
      </div>
    </div>

    <div
      class="bg-base-100 shadow shadow-gray-900 dark:shadow-gray-300 p-2 px-2 rounded-md"
      v-if="config.file"
    >
      <p>{{ config.fileName }}</p>
      <div class="flex justify-end">
        <button
          @click="config.file = ''"
          class="bg-red-500 text-white hover:bg-red-400 rounded-md p-0.5"
        >
          <svg
            class="w-5 h-5"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              fill-rule="evenodd"
              d="M8.586 2.586A2 2 0 0 1 10 2h4a2 2 0 0 1 2 2v2h3a1 1 0 1 1 0 2v12a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V8a1 1 0 0 1 0-2h3V4a2 2 0 0 1 .586-1.414ZM10 6h4V4h-4v2Zm1 4a1 1 0 1 0-2 0v8a1 1 0 1 0 2 0v-8Zm4 0a1 1 0 1 0-2 0v8a1 1 0 1 0 2 0v-8Z"
              clip-rule="evenodd"
            />
          </svg>
        </button>
      </div>
    </div>
    <div class="pt-2">
      <button
        @click="programMessage"
        class="bg-green-500 w-full hover:bg-green-400 p-2 px-5 rounded-md mx-auto uppercase"
      >
        Salvar
      </button>
    </div>
  </div>
</template>
<style scoped>
.input {
  @apply w-full outline-none p-2 rounded px-3;
}
</style>
