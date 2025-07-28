<template>
  <div
    v-if="!isLoading"
    class="flex w-full items-center space-x-3 text-white dark:text-black"
  >
    <button
      :class="['send-audio-button', { recording: recording }]"
      v-if="!recording && !base64Audio"
      :disabled="recording || !canSendMessage"
      @click="startRecording(), (pausedTime = 0), (canceled = false)"
    >
      <svg
        class="start-recording-icon"
        aria-hidden="true"
        xmlns="http://www.w3.org/2000/svg"
        fill="currentColor"
        viewBox="0 0 16 19"
      >
        <path
          d="M15 5a1 1 0 0 0-1 1v3a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V6a1 1 0 0 0-2 0v3a6.006 6.006 0 0 0 6 6h1v2H5a1 1 0 0 0 0 2h6a1 1 0 0 0 0-2H9v-2h1a6.006 6.006 0 0 0 6-6V6a1 1 0 0 0-1-1Z"
        />
        <path
          d="M9 0H7a3 3 0 0 0-3 3v5a3 3 0 0 0 3 3h2a3 3 0 0 0 3-3V3a3 3 0 0 0-3-3Z"
        />
      </svg>
    </button>
    <button
      v-if="audioStream"
      class="rounded-full bg-red-500 p-1.5 hover:bg-red-600"
      @click="resetAudio()"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke-width="1.5"
        stroke="currentColor"
        class="size-4"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
        />
      </svg>
    </button>
    <button
      v-if="recording"
      :disabled="!recording && !paused"
      @click="pauseResumeRecording"
    >
      <svg
        v-if="!paused"
        class="size-4 hover:text-red-500"
        aria-hidden="true"
        xmlns="http://www.w3.org/2000/svg"
        fill="currentColor"
        viewBox="0 0 10 16"
      >
        <path
          fill-rule="evenodd"
          d="M0 .8C0 .358.32 0 .714 0h1.429c.394 0 .714.358.714.8v14.4c0 .442-.32.8-.714.8H.714a.678.678 0 0 1-.505-.234A.851.851 0 0 1 0 15.2V.8Zm7.143 0c0-.442.32-.8.714-.8h1.429c.19 0 .37.084.505.234.134.15.209.354.209.566v14.4c0 .442-.32.8-.714.8H7.857c-.394 0-.714-.358-.714-.8V.8Z"
          clip-rule="evenodd"
        />
      </svg>
      <svg
        v-else
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke-width="1.5"
        stroke="currentColor"
        class="w-5 hover:text-emerald-500"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M21 7.5V18M15 7.5V18M3 16.811V8.69c0-.864.933-1.406 1.683-.977l7.108 4.061a1.125 1.125 0 010 1.954l-7.108 4.061A1.125 1.125 0 013 16.811z"
        />
      </svg>
    </button>
    <button
      v-if="(recording || audioBlob) && !base64Audio"
      class="rounded-full p-1.5 hover:bg-gray-100 hover:text-light"
      @click="stopRecording"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke-width="1.5"
        stroke="currentColor"
        class="size-4"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M5.25 7.5A2.25 2.25 0 017.5 5.25h9a2.25 2.25 0 012.25 2.25v9a2.25 2.25 0 01-2.25 2.25h-9a2.25 2.25 0 01-2.25-2.25v-9z"
        />
      </svg>
    </button>

    <audioVisualizer
      v-if="audioStream && recording && !paused"
      :audio-stream="audioStream"
    />
    <div v-if="base64Audio" class="flex w-full items-center space-x-2">
      <audioView
        :avatar="attendant?.photo || null"
        :audio="base64Audio"
        @duration="handleDuration"
        @current-time="handleCurrentTime"
      />
      <main class="text-xs">
        <div>{{ formatTime(currentTime) }}</div>
        <div v-if="recording || audioBlob">{{ formatTime(recordingTime) }}</div>
      </main>
    </div>

    <button
      v-if="base64Audio"
      class="rounded-full p-2 hover:bg-gray-100 hover:text-light"
      @click="sendAudio()"
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
  </div>
  <div v-else class="flex items-center px-2 pr-[21px]">
    loading
    <!-- <SendAnimate class="" /> -->
  </div>
</template>

<script setup>
import { ref } from "vue";
import audioVisualizer from "./audioVisualizer.vue";
import audioView from "./audioView.vue";

const props = defineProps({
  canSendMessage: Boolean,
  sendAudioToAttendant: { type: Function, required: true },
  selectedAttendant: { type: Object, required: true },
  attendant: { required: true },
});

const emit = defineEmits(["audio-sent", "recording", "b64Audio"]);

const audioRecorder = ref(null);
const recording = ref(false);
const paused = ref(false);
const recordingTime = ref(0);
const pausedTime = ref(0);
const audioBlob = ref(null);
const base64Audio = ref(null);
const intervalId = ref(null);
const audioStream = ref(null);
const duration = ref(0);
const currentTime = ref(0);
const audioUrl = ref(null);
const canceled = ref(false);
const isLoading = ref(false);

const handleDuration = (durationValue) => {
  duration.value = durationValue;
};

const handleCurrentTime = (currentTimeValue) => {
  currentTime.value = currentTimeValue;
};

const formatTime = (segundos) => {
  const minutos = Math.floor(segundos / 60);
  const segundosRestantes = (segundos % 60).toFixed(0);
  const minutosStr = minutos.toString().padStart(2, "0");
  const segundosStr = segundosRestantes.toString().padStart(2, "0");
  return `${minutosStr}:${segundosStr}`;
};

const startRecording = async () => {
  try {
    base64Audio.value = null;
    audioStream.value = await navigator.mediaDevices.getUserMedia({
      audio: true,
    });
    audioRecorder.value = new MediaRecorder(audioStream.value);
    audioRecorder.value.ondataavailable = handleDataAvailable;
    audioRecorder.value.start();
    startRecordingTimer();
    recording.value = true;
    emit("recording", true);
  } catch (error) {
    console.error("Erro ao iniciar a gravação:", error);
  }
};

const handleDataAvailable = (event) => {
  if (event.data.size > 0 && !canceled.value) {
    audioBlob.value = new Blob([event.data]);
    audioUrl.value = URL.createObjectURL(audioBlob.value);
    convertToBase64();
  }
};

const startRecordingTimer = () => {
  let startTime = Date.now();
  intervalId.value = setInterval(() => {
    recordingTime.value =
      pausedTime.value + Math.floor((Date.now() - startTime) / 1000);
  }, 1000);
};

const pauseResumeRecording = async () => {
  base64Audio.value = null;
  if (audioRecorder.value && recording.value) {
    if (paused.value) {
      audioRecorder.value.resume();
      startRecordingTimer();
    } else {
      audioRecorder.value.pause();
      clearInterval(intervalId.value);
      pausedTime.value = recordingTime.value;
    }
    paused.value = !paused.value;
  }
};

const stopRecording = async () => {
  if (audioRecorder.value && recording.value) {
    await audioRecorder.value.stop();
    clearInterval(intervalId.value);
    recording.value = false;
    paused.value = false;
    convertToBase64();
  }
  if (audioStream.value) {
    audioStream.value.getTracks().forEach((track) => track.stop());
  }
  console.log(base64Audio.value);
};

const convertToBase64 = async () => {
  if (audioBlob.value) {
    // Use o tipo correto desejado
    const correctedBlob = new Blob([audioBlob.value], { type: "audio/mpeg" });
    const reader = new FileReader();
    reader.onload = () => {
      base64Audio.value = reader.result;
    };
    reader.readAsDataURL(correctedBlob);
  }
};
import { v4 as uuidv4 } from "uuid";
const sendAudio = async () => {
  isLoading.value = true;
  emit("b64Audio", base64Audio.value);

  const getMimeType = (base64) => {
    if (base64) {
      return base64.split(";")[0].split(":")[1];
    }
    return null;
  };

  const payload = {
    type: "file",
    media: {
      name: "audio",
      mimetype: getMimeType(base64Audio.value),
      data: base64Audio.value,
    },
  };

  await props.sendAudioToAttendant(
    props.selectedAttendant.id,
    payload,
    props.attendant,
    true
  );

  emit("recording", false);
  isLoading.value = false;
  audioStream.value = null;
  base64Audio.value = null;
  audioBlob.value = null;
  recording.value = false;
  paused.value = false;
  recordingTime.value = 0;

  //   try {
  //     isLoading.value = true;
  //     emit("recording", false);
  //     const quote_id = messageStore.quote ? messageStore.quote.id : null;
  //     const content = {
  //       data64: base64Audio.value,
  //       duration: recordingTime.value,
  //     };
  //     const tempId = uuidv4();
  //     messageStore.addTempMessage(
  //       content,
  //       quote_id,
  //       tempId,
  //       "audio",
  //       globalStore.isInternalMessage
  //     );
  //     messageStore.quote = null;
  //     const res = await api.post(messages, {
  //       id: tempId,
  //       chat: messageStore.currentChatId,
  //       type: "audio",
  //       quote: quote_id,
  //       content: content,
  //     });
  //     if (!res.data.sent_now) {
  //       messageStore.conversations.push(res.data.object);
  //     }
  //     audioStream.value = null;
  //     base64Audio.value = null;
  //     audioBlob.value = null;
  //     recording.value = false;
  //     paused.value = false;
  //     recordingTime.value = 0;
  //   } catch (error) {
  //     const errorMessage = error.response.data.message;
  //     notify(
  //       {
  //         group: "error",
  //         title: "Erro",
  //         text: errorMessage,
  //       },
  //       4000
  //     );
  //   }
  //   isLoading.value = false;
};

const resetAudio = async () => {
  canceled.value = true;
  recording.value = false;
  emit("recording", false);
  await audioRecorder.value.stop();
  if (audioStream.value) {
    audioStream.value.getTracks().forEach((track) => track.stop());
    audioStream.value = null;
  }
  audioBlob.value = null;
  clearInterval(intervalId.value);
  base64Audio.value = null;
  paused.value = false;
  recordingTime.value = 0;
};
</script>

<style scoped>
.start-recording-icon {
  width: 1.2rem;
  height: 1.2rem;
  color: white;
}

.send-audio-button {
  position: absolute;
  right: 0.5rem;
  top: 0.65rem;
  background-color: #3b82f6;
  color: white;
  padding: 0.3rem 0.7rem;
  border-radius: 9999px;
  cursor: pointer;
  transition: background-color 0.3s ease;
  font-size: 15px;
}

.send-audio-button:not(.recording):hover {
  background-color: #2563eb;
}
</style>
