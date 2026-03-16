<template>
  <GroupChatInfo
    v-if="toggleDescriptionChat && selectedAttendant && isGroupChat"
    :selectedAttendant="selectedAttendant"
    :attendant="attendant"
    :participantsGroup="participantsGroup"
    :participantCount="participantCount"
    @close="handlerDescriptionChat"
  />

  <div class="messages-container bg-base-300">
    <!-- Cabeçalho -->
    <div class="header-intern bg-base-300">
      <button @click="emits('voltar')" class="back-button">
        <svg
          class="w-6 h-6"
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            d="M14.502 7.046h-2.5v-.928a2.122 2.122 0 0 0-1.199-1.954 1.827 1.827 0 0 0-1.984.311L3.71 8.965a2.2 2.2 0 0 0 0 3.24L8.82 16.7a1.829 1.829 0 0 0 1.985.31 2.121 2.121 0 0 0 1.199-1.959v-.928h1a2.025 2.025 0 0 1 1.999 2.047V19a1 1 0 0 0 1.275.961 6.59 6.59 0 0 0 4.662-7.22 6.593 6.593 0 0 0-6.437-5.695Z"
          />
        </svg>
      </button>

      <button @click="handlerDescriptionChat()">
        <Avatar
          v-if="selectedAttendant.photo"
          :style="'size-10'"
          :url="selectedAttendant.photo"
        />

        <Avatar v-else :style="'size-10'">
          <div class="flex items-center justify-center mt-0.5 mr-0.5">
            <svg
              v-if="isGroupChat"
              class="size-9"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                fill-rule="evenodd"
                d="M12 6a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7Zm-1.5 8a4 4 0 0 0-4 4 2 2 0 0 0 2 2h7a2 2 0 0 0 2-2 4 4 0 0 0-4-4h-3Zm6.82-3.096a5.51 5.51 0 0 0-2.797-6.293 3.5 3.5 0 1 1 2.796 6.292ZM19.5 18h.5a2 2 0 0 0 2-2 4 4 0 0 0-4-4h-1.1a5.503 5.503 0 0 1-.471.762A5.998 5.998 0 0 1 19.5 18ZM4 7.5a3.5 3.5 0 0 1 5.477-2.889 5.5 5.5 0 0 0-2.796 6.293A3.501 3.501 0 0 1 4 7.5ZM7.1 12H6a4 4 0 0 0-4 4 2 2 0 0 0 2 2h.5a5.998 5.998 0 0 1 3.071-5.238A5.505 5.505 0 0 1 7.1 12Z"
                clip-rule="evenodd"
              />
            </svg>

            <svg
              v-else
              class="size-9"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                fill-rule="evenodd"
                d="M12 4a4 4 0 1 0 0 8 4 4 0 0 0 0-8Zm-2 9a4 4 0 0 0-4 4v1a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-1a4 4 0 0 0-4-4h-4Z"
                clip-rule="evenodd"
              />
            </svg>
          </div>
        </Avatar>
      </button>

      <span class="flex flex-col">
        <h3 class="atendente-name">{{ selectedAttendant.name }}</h3>
        <h2 v-if="isGroupChat" class="text-xs text-gray-500">
          {{ participantCount }} Membros
        </h2>
      </span>
    </div>

    <!-- Área de mensagens -->
    <div class="message-area" ref="chatArea">
      <v3-infinite-loading
        v-if="!isLoading && hasNextPage && mounted"
        @infinite="loadMoreMessages"
        :distance="30"
        :top="true"
        direction="top"
        class="p-3"
      >
        <template #complete>
          <span></span>
        </template>
        <template #spinner>
          <div class="loading">
            <svg
              class="spinner"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                class="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                stroke-width="4"
              ></circle>
              <path
                class="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              ></path>
            </svg>
          </div>
        </template>
      </v3-infinite-loading>

      <!-- Mensagens -->
      <div>
        <div v-for="(msg, index) in mensagens" :key="index">
          <!-- Exibir separador de datas -->
          <div
            v-if="shouldShowDateSeparator(index)"
            class="date-separator bg-base-100/50"
          >
            <div class="date-separator-line"></div>
            <div class="date-separator-text">
              {{ formatDateSeparator(msg.created_at) }}
            </div>
            <div class="date-separator-line"></div>
          </div>

          <!-- Mensagem -->
          <div
            :class="[
              'message',
              {
                me: msg.sender.id === attendant.id,
                'not-me': msg.sender.id !== attendant.id,
                'new-message': index === mensagens.length - 1,
              },
            ]"
          >
            <div
              class="relative"
              :class="
                msg.sender.id === attendant.id ? 'text-right' : 'text-left'
              "
            >
              <div
                v-if="
                  msg.content && msg.content.media && msg.content.media.data
                "
                class="dropdown-container-internal-messages"
              >
                <Popper
                  hover
                  class="label-popper-internal-messages"
                  placement="left"
                >
                  <button class="dropdown-toggle-internal-messages">
                    <svg
                      class="dropdown-icon-internal-messages"
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
                        d="m19 9-7 7-7-7"
                      />
                    </svg>
                  </button>
                  <template #content>
                    <button
                      class="download-button-internal-messages"
                      @click="
                        toggleDownloadFunctions(
                          msg.content.media,
                          msg.content.media.name
                        )
                      "
                    >
                      Baixar
                    </button>
                  </template>
                </Popper>
              </div>
              <div
                class="shadow shadow-gray-900 dark:shadow-gray-500"
                :class="[
                  'message-content',
                  {
                    me: msg.sender.id === attendant.id,
                    'not-me': msg.sender.id !== attendant.id,
                  },
                ]"
              >
                <div class="text-black font-bold text-sm">
                  {{ msg.sender.name }}
                </div>
                <PreviewFiles
                  v-if="
                    msg.content && msg.content.media && msg.content.media.data
                  "
                  mode="message"
                  :isMobile="isMobile"
                  @download="
                    toggleDownloadFunctions(
                      msg.content.media,
                      msg.content.media.name
                    )
                  "
                  @open-mobile-pdf="openPdf(msg.content.media.data)"
                  :avatar="
                    msg.sender.id === attendant.id
                      ? attendant.photo
                      : msg.sender.photo
                  "
                  :fileName="msg.content.media.name"
                  :base64="msg.content.media.data"
                  :mimetype="msg.content.media.mimetype"
                >
                  <template v-slot:content-message>
                    <p>{{ msg.content.content }}</p>
                  </template>

                  <template v-slot:time-message>
                    <div class="message-time">
                      {{ formatMessageTime(msg.created_at) }}
                    </div>
                  </template>
                </PreviewFiles>

                <section v-else>
                  <p>{{ msg.content.content }}</p>

                  <div class="message-time">
                    {{ formatMessageTime(msg.created_at) }}
                  </div>
                </section>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Área de input e botão de enviar -->
    <TextInput />

    <!-- <div class="input-area">
      <textarea
        ref="messageInputRef"
        type="text"
        v-model="novaMensagem"
        class="message-input bg-base-300 focus:ring-0"
        placeholder="Digite sua mensagem..."
        @keydown="handleKeydown"
        :disabled="isLoadingMessages"
      />
      <button
        @click="handleSendFilesClick"
        class="send-files-button"
        :disabled="isLoadingMessages"
        :class="{ disabled: isLoadingMessages }"
        :title="isLoadingMessages ? 'Aguarde as mensagens carregarem' : ''"
      >
        <svg
          class="size-5 text-white"
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
            d="M7 8v8a5 5 0 1 0 10 0V6.5a3.5 3.5 0 1 0-7 0V15a2 2 0 0 0 4 0V8"
          />
        </svg>
      </button>

      <button
        v-if="novaMensagem.length > 0"
        @click="handleButtonClick"
        class="send-button"
        :disabled="isLoadingMessages"
        :class="{ disabled: isLoadingMessages }"
        :title="isLoadingMessages ? 'Aguarde as mensagens carregarem' : ''"
      >
        <svg
          class="size-5 text-white rotate-90"
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            fill-rule="evenodd"
            d="M12 2a1 1 0 0 1 .932.638l7 18a1 1 0 0 1-1.326 1.281L13 19.517V13a1 1 0 1 0-2 0v6.517l-5.606 2.402a1 1 0 0 1-1.326-1.281l7-18A1 1 0 0 1 12 2Z"
            clip-rule="evenodd"
          />
        </svg>
      </button>

      <section
        class="bg-base-300"
        v-else
        :class="['send-audio-button', { recording: isRecording }]"
      >
        <MobileAudioRecorder
          v-if="isMobile"
          :attendant="attendant"
          :selectedAttendant="selectedAttendant"
          :sendAudioToAttendant="sendMessageToAtendente"
          @recording="(rec) => (isRecording = rec)"
        />
        <AudioRecorder
          v-else
          :can-send-message="!isLoadingMessages"
          :attendant="attendant"
          :selectedAttendant="selectedAttendant"
          :sendAudioToAttendant="sendMessageToAtendente"
          @recording="(rec) => (isRecording = rec)"
        />
      </section>
    </div> -->
  </div>
</template>

<script setup>
import { ref, nextTick, onMounted, computed, watch } from "vue";
import V3InfiniteLoading from "v3-infinite-loading";
import { format, isToday, isYesterday, isThisWeek } from "date-fns";
import { ptBR } from "date-fns/locale"; // Para formatação em português
import Avatar from "./Avatar.vue";
import GroupChatInfo from "./components/groupChatInfo.vue";
import PreviewFiles from "./previewFiles.vue";

import TextInput from "./components/textInput.vue";

// import AudioRecorder from "../audio-misc/audioRecorder.vue";
// import MobileAudioRecorder from "../audio-misc/mobile/mobileAudioRecorder.vue";

const props = defineProps({
  listAttendancesByGroup: { type: Array, default: () => [] },
  isMobile: { type: Boolean, default: false },
  isLoadingMessages: { type: Boolean, default: false },
  selectedAttendant: { type: Object, required: true },
  attendant: { required: true },
  loadMessagesForAtendente: { type: Function, required: true }, // Recebe do pai
  sendMessageToAtendente: { type: Function, required: true }, // Recebe do pai
  hasNextPageForAtendente: { type: Function, required: true }, // Recebe do pai,
  downloadFilesMobile: { type: Function },
  openMobilePdf: { type: Function },
});

// --- Controle de estado da tela de informações de grupo ---
const toggleDescriptionChat = ref(false);

const handlerDescriptionChat = () => {
  if (!isGroupChat.value) return;
  toggleDescriptionChat.value = !toggleDescriptionChat.value;
};
// ----------------------------------------------------------

const isGroupChat = computed(() => Boolean(props.selectedAttendant?.is_group));

const participantIds = computed(
  () => props.selectedAttendant?.participants || []
);

// Participantes reais do grupo (ordenados, com o usuário atual primeiro)
const participantsGroup = computed(() => {
  if (!isGroupChat.value || participantIds.value.length === 0) {
    return [];
  }

  return props.listAttendancesByGroup
    .filter((item) => participantIds.value.includes(item.id))
    .sort((a, b) => {
      if (a.id === props.attendant.id) return -1;
      if (b.id === props.attendant.id) return 1;
      return 0;
    });
});

const participantCount = computed(() => participantsGroup.value.length);

const emits = defineEmits(["send-files", "voltar"]);

const novaMensagem = ref("");
const chatArea = ref(null);
const messageInputRef = ref(null);
const mounted = ref(false);
const isRecording = ref(false);

const isLoading = ref(false);
const mensagens = computed(() => {
  if (!props.selectedAttendant) return [];

  // Se for um grupo, usa chat_info.messages, senão usa messages diretamente
  return props.selectedAttendant.is_group
    ? props.selectedAttendant.chat_info?.messages || []
    : props.selectedAttendant.messages || [];
});

const openPdf = (url) => {
  if (props.isMobile) {
    props.openMobilePdf(url);
  }
};

const toggleDownloadFunctions = (file, name) => {
  if (!file) return;
  if (props.isMobile) {
    const filterFileType = file.mimetype.split("/");
    const fileType = filterFileType[1];

    const mobilePayload = {
      url:
        file.mimetype === "image/svg+xml"
          ? file.data.replace("+", "%2B")
          : file.data,
      type: fileType,
      title: file.name,
    };
    props.downloadFilesMobile(mobilePayload, name);
  } else {
    downloadFiles(file.data, name);
  }
};

const hasNextPage = computed(() =>
  props.hasNextPageForAtendente(
    props.selectedAttendant.internal_chat.channel_id
  )
);

const formatMessageTime = (dateStr) => {
  const date = new Date(dateStr);
  // Obtém a hora local ajustada automaticamente pelo navegador
  const localHours = date.getHours();
  const localMinutes = date.getMinutes();
  // Formata para 'HH:mm'
  return `${localHours.toString().padStart(2, "0")}:${localMinutes
    .toString()
    .padStart(2, "0")}`;
};

const formatDateSeparator = (dateStr) => {
  const date = new Date(dateStr);

  if (isToday(date)) {
    return "Hoje";
  } else if (isYesterday(date)) {
    return "Ontem";
  } else if (isThisWeek(date)) {
    return format(date, "EEEE", { locale: ptBR }); // Dia da semana
  } else {
    return format(date, "dd 'de' MMMM 'de' yyyy", { locale: ptBR }); // Data completa
  }
};

const shouldShowDateSeparator = (index) => {
  if (index === 0) return true;
  const currentMessageDate = new Date(mensagens.value[index].created_at);
  const previousMessageDate = new Date(mensagens.value[index - 1].created_at);

  return (
    currentMessageDate.toDateString() !== previousMessageDate.toDateString()
  );
};

const handleKeydown = (event) => {
  if (props.isLoadingMessages) return;
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    enviarMensagem();
  }
};

const scrollToBottom = () => {
  if (chatArea.value) {
    chatArea.value.scrollTo({
      top: chatArea.value.scrollHeight,
      behavior: "instant",
    });
  }
};

const loadMoreMessages = async ($state) => {
  try {
    if (!hasNextPage.value) {
      $state.complete();
      return;
    }

    // Captura a altura anterior do scroll e a posição anterior do scroll
    const previousScrollHeight = chatArea.value.scrollHeight;
    const previousScrollTop = chatArea.value.scrollTop;

    // Carrega mais mensagens
    await props.loadMessagesForAtendente(
      props.selectedAttendant.internal_chat.channel_id
    );

    // Aguarda a renderização das novas mensagens
    await nextTick();

    // Ajusta a posição do scroll de forma relativa ao aumento do scrollHeight
    chatArea.value.scrollTop =
      chatArea.value.scrollHeight -
      previousScrollHeight +
      previousScrollTop -
      32;

    $state.loaded();
  } catch (error) {
    console.error(error);
    $state.complete();
  }
};

const enviarMensagem = async () => {
  if (props.isLoadingMessages) return;
  if (novaMensagem.value.trim() !== "") {
    try {
      const newMessage = JSON.parse(JSON.stringify(novaMensagem.value));
      const channel_id = props.selectedAttendant?.internal_chat?.channel_id;

      novaMensagem.value = "";
      await props.sendMessageToAtendente(
        channel_id,
        newMessage,
        props.attendant
      );
      await nextTick();
      scrollToBottom();
    } catch (error) {
      console.error("Erro ao enviar mensagem:", error);
    }
  }
};

const handleButtonClick = (event) => {
  if (props.isLoadingMessages) return;
  enviarMensagem();
  const button = event?.currentTarget;
  if (!button) return;
  button.classList.add("clicked");
  setTimeout(() => {
    button.classList.remove("clicked");
  }, 200);
};

const handleSendFilesClick = (event) => {
  if (props.isLoadingMessages) return;
  emits("send-files");
  const button = event?.currentTarget;
  if (!button) return;
  button.classList.add("clicked");
  setTimeout(() => {
    button.classList.remove("clicked");
  }, 200);
};

onMounted(async () => {
  await nextTick(() => {
    scrollToBottom();
    mounted.value = true;
  });

  // Ao abrir a conversa, já deixa o input pronto pra digitação.
  focusMessageInput();
});

const focusMessageInput = async () => {
  if (props.isLoadingMessages) return;
  await nextTick();

  // Pequeno delay ajuda quando há transições/scroll inicial.
  setTimeout(() => {
    if (props.isLoadingMessages) return;
    messageInputRef.value?.focus?.();
  }, 0);
};

watch(
  () => props.selectedAttendant?.internal_chat?.channel_id,
  () => {
    focusMessageInput();
  }
);

watch(
  () => props.isLoadingMessages,
  (isLoading) => {
    if (!isLoading) focusMessageInput();
  }
);

watch(
  () => mensagens.value?.length,
  (newVal, oldVal) => {
    if (mensagens.value) {
      const isNearBottom = checkIsNearBottom();
      if (isNearBottom) {
        setTimeout(() => {
          chatArea.value.scrollTo({
            top: chatArea.value.scrollHeight,
            behavior: "instant",
          });
        }, 100);
      }
    }
  }
);

function checkIsNearBottom() {
  const threshold = 80; // pixels do final do scroll considerados "perto do final"
  const position = chatArea.value.scrollTop + chatArea.value.clientHeight;
  const height = chatArea.value.scrollHeight;
  return height - position <= threshold;
}

const downloadFiles = async (url, name = "undefined") => {
  const isSvg = url.endsWith("svg+xml");

  try {
    const response = await fetch(isSvg ? url.replace("+", "%2B") : url);
    if (!response.ok) {
      throw new Error("Erro ao baixar o arquivo");
    }

    const contentType = response.headers.get("Content-Type");

    const arrayBuffer = await response.arrayBuffer();
    const mimeType =
      contentType && contentType !== "application/octet-stream"
        ? contentType
        : "audio/mp3";

    const blob = new Blob([arrayBuffer], { type: mimeType });
    const blobUrl = window.URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = blobUrl;
    const finalName = contentType.endsWith("aac") ? `${name}.mp3` : name;
    link.download = finalName; // você pode alterar o nome aqui se quiser
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(blobUrl);
  } catch (error) {
    console.error("Erro no download:", error);
  }
};
</script>

<style scoped>
.label-popper-internal-messages {
  --popper-theme-background-color: #26343d;
  --popper-theme-background-color-hover: #26343d;
  --popper-theme-text-color: #ffffff;
  --popper-theme-border-width: 0px;
  --popper-theme-border-style: solid;
  --popper-theme-border-radius: 6px;
  --popper-theme-padding: 0px;
  --popper-theme-box-shadow: 0 6px 30px -6px rgba(0, 0, 0, 0.25);
}

.dropdown-container-internal-messages {
  position: absolute;
  z-index: 20;
}

.dropdown-toggle-internal-messages {
  background-color: rgba(0, 0, 0, 0.6);
  padding: 0.25rem;
  border-radius: 0.375rem;
  border: none;
  cursor: pointer;
  opacity: 0;
}

.dropdown-icon-internal-messages {
  width: 0.75rem;
  height: 0.75rem;
  color: white;
}

.download-button-internal-messages {
  width: 8rem;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #111b21;
  border-radius: 0.375rem;
  padding: 0.5rem;
  cursor: pointer;
  border: none;
  transition: background-color 0.2s ease;
  font-size: 0.75rem;
  line-height: 1rem;
}

.download-button-internal-messages:hover {
  background-color: #26343d;
}

/* Estilos para o messages-container principal */
.messages-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  /* background-color: white; */
  border-radius: 7px;
  /* color: black; */
}

/* Cabeçalho */
.header-intern {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  height: 52px;
  /* background-color: white; */
  border-radius: 7px 7px 0 0;
  padding: 0.5rem;
  flex-shrink: 0;
}

.back-button {
  /* color: #6b7280; */
  cursor: pointer;
  transition: color 0.3s ease;
}

.back-button:hover {
  color: #3b82f6;
}

.atendente-photo {
  width: 40px;
  height: 40px;
  background-color: #1e3a8a;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.atendente-photo img {
  border-radius: 50%;
  width: 40px;
  height: 40px;
}

.atendente-name {
  font-size: 0.975rem;
}

/* Área de mensagens */
.message-area {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: linear-gradient(
      to top right,
      rgba(59, 107, 184, 0.85),
      rgba(55, 61, 150, 0.95)
    ),
    url("https://smzap-bucket.s3.us-east-1.amazonaws.com/arquivos_site/background-whats.png");
  background-repeat: no-repeat, repeat;
  background-size: cover, auto;
  background-attachment: scroll, local;
  /* padding: 0.25rem; */
  overflow-y: auto;
  position: relative;
}

/* Carregando */
.loading {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
}

.spinner {
  animation: spin 1s linear infinite;
  height: 32px;
  width: 32px;
  color: #f3f4f6;
}

/* Animação de rotação */
@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

/* Estilos das mensagens */
.message {
  margin-bottom: 0.25rem;
  /* max-width: 80%; */
  word-wrap: break-word;
  padding-left: 0.5rem;
  padding-right: 0.5rem;
}

.message.me {
  text-align: right;
}

.message.me .dropdown-container-internal-messages {
  right: 0.5rem;
  top: 0.5rem;
}

.message.not-me .dropdown-container-internal-messages {
  left: 0.5rem;
  top: 0.5rem;
}

.message.not-me {
  text-align: left;
}

.message-content {
  display: inline-block;
  padding: 0.5rem;
  border-radius: 1rem;
  color: black;
  max-width: 16rem;
}

.message:hover .dropdown-toggle-internal-messages {
  opacity: 1;
}

.message-content.me {
  background-color: #60a5fa;
  /* color: white; */
}

.message-content.not-me {
  background-color: rgba(125, 211, 252, 0.9);
  /* color: black; */
}

.message-time {
  font-size: 0.75rem;
  /* color: #374151; */
  text-align: right;
  /* margin-top: -0.25rem; */
  opacity: 50%;
}

/* Estilos do separador de datas */
.date-separator {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.4rem 0;
  border-radius: 4px;
  margin-top: 0.5rem /* 7px */;
  margin-bottom: 0.5rem /* 7px */;
}

.date-separator-line {
  flex-grow: 1;
  border-top: 2px solid #d1d5db;
  margin-left: 12px;
  margin-right: 12px;
}

.date-separator-text {
  font-size: 1rem;
  font-weight: 600;
  white-space: nowrap;
}

/* Animação para a mensagem */
/* .new-message { animation: bounce-in 0.6s ease-in-out; } */

@keyframes bounce-in {
  0% {
    transform: scale(0.8);
    opacity: 0;
  }

  50% {
    transform: scale(1.1);
    opacity: 1;
  }

  100% {
    transform: scale(1);
  }
}

/* Animação para as mensagens enviadas pelo usuário (vindo da esquerda) */
.message-enter-active {
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.message.me.new-message {
  transform: translateX(-100%);
  opacity: 0;
  animation: slide-in-left 0.3s forwards ease;
}

@keyframes slide-in-left {
  0% {
    transform: translateX(-100%);
    opacity: 0;
  }

  100% {
    transform: translateX(0);
    opacity: 1;
  }
}

/* Animação para as mensagens enviadas por outra pessoa (vindo da direita) */
.message.not-me.new-message {
  transform: translateX(100%);
  opacity: 0;
  animation: slide-in-right 0.3s forwards ease;
}

@keyframes slide-in-right {
  0% {
    transform: translateX(100%);
    opacity: 0;
  }

  100% {
    transform: translateX(0);
    opacity: 1;
  }
}
</style>
