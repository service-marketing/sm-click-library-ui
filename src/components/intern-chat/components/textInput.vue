<script setup>
import { ref, watch, nextTick, onMounted } from "vue";

import AudioRecorder from "../../audio-misc/audioRecorder.vue";
import MobileAudioRecorder from "../../audio-misc/mobile/mobileAudioRecorder.vue";

defineProps({
  isLoadingMessages: {
    type: Boolean,
    default: false,
  },
});

const messageInputRef = ref(null);
const novaMensagem = ref("");

const focusMessageInput = async () => {
  await nextTick();

  // Pequeno delay ajuda quando há transições/scroll inicial.
  setTimeout(() => {
    messageInputRef.value?.focus?.();
  }, 0);
};

const handleKeydown = () => {};

const autoResize = () => {
  const textarea = messageInputRef.value;
  if (!textarea) return;

  const baseHeight = 50; // h-10
  const maxHeight = 120;

  // Se vazio, volta para altura base
  if (!textarea.value.trim()) {
    textarea.style.height = `${baseHeight}px`;
    textarea.style.overflowY = "hidden";
    return;
  }

  // Temporariamente seta para 1px para medir o scrollHeight real
  textarea.style.height = "1px";
  const scrollHeight = textarea.scrollHeight;

  // Só aumenta se o conteúdo precisar de mais espaço que a altura base
  const nextHeight = Math.max(baseHeight, Math.min(scrollHeight, maxHeight));

  textarea.style.height = `${nextHeight}px`;
  textarea.style.overflowY = scrollHeight > maxHeight ? "auto" : "hidden";
};

onMounted(async () => {
  await nextTick();
  focusMessageInput();
  autoResize();
});

watch(novaMensagem, async () => {
  await nextTick();
  autoResize();
});
</script>

<template>
  <div class="input-area gap-1">
    <textarea
      ref="messageInputRef"
      type="text"
      v-model="novaMensagem"
      class="message-input bg-base-300 focus:ring-0"
      placeholder="Digite sua mensagem..."
      @keydown="handleKeydown"
      @input="autoResize"
      :disabled="isLoadingMessages"
    />

    <button
      @click="handleSendFilesClick"
      class="send-button"
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

    <!-- <section
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
    </section> -->
  </div>
</template>

<style scoped>
.input-area {
  display: flex;
  align-items: center;
  position: relative;
  width: 100%;
  flex-shrink: 0;
}

.message-input {
  width: 100%;
  resize: none;
  padding: 0.5rem;
  border: none;
  outline: none;
  /* padding-right: 110px; */
  border-radius: 0 0 7px 7px;
  outline: 2px solid transparent;
  outline-offset: 2px;
  border-style: none;
  @apply hide-scrollbar;
}

.message-input:focus {
  outline: 2px solid transparent;
  outline-offset: 2px;
  border-style: none;
  --tw-ring-offset-shadow: var(--tw-ring-inset) 0 0 0
    var(--tw-ring-offset-width) var(--tw-ring-offset-color);
  --tw-ring-shadow: var(--tw-ring-inset) 0 0 0
    calc(0px + var(--tw-ring-offset-width)) var(--tw-ring-color);
  box-shadow: var(--tw-ring-offset-shadow);
}

/* --- Classe para esconder a barra de rolagem, mantendo a rolagem funcional --- */
.hide-scrollbar {
  -ms-overflow-style: none; /* IE 10+ */
  scrollbar-width: none; /* Firefox */
}

/* --- Chrome, Edge (Blink), Safari, Opera --- */
.hide-scrollbar::-webkit-scrollbar {
  display: none;
  width: 0;
  height: 0;
}

.send-button {
  background-color: #3b82f6;
  border-radius: 9999px;
  padding: 0.5rem;
}
</style>