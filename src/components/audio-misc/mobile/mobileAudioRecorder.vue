<template>
  <transition name="bounce">
    <div
      v-if="isRecording"
      class="bg-base-300 absolute bottom-14 left-0 z-50 flex w-full items-center justify-between rounded-t-2xl p-3"
    >
      <div class="flex h-11 items-center">
        <section v-if="isRecording != 'paused'">Gravando</section>
      </div>

      <section v-if="isRecording != 'paused'">{{ formattedTime }}</section>

      <section
        v-if="isRecording === 'paused'"
        class="flex w-full justify-between rounded-lg border-2 border-gray-500 p-2 px-4"
      >
        <button v-if="!isPlaying" @click="playPauseAudio('play')">
          <PlayIcon class="size-6 cursor-pointer" />
        </button>

        <button v-else>
          <PauseIcon
            class="size-6 cursor-pointer"
            @click="playPauseAudio('pause')"
          />
        </button>

        <div></div>
        {{ formattedTime }}
      </section>
    </div>
  </transition>

  <div class="flex w-full items-center justify-between gap-2">
    <button v-if="isRecording" @click="excludeAudio()">
      <TrashIcon
        class="ml-2 size-6 cursor-pointer text-red-500/80 drop-shadow-md"
      />
    </button>

    <button v-if="isRecording === 'paused'" @click="resumeRecorder()">
      <MicrophoneIcon
        class="size-7 cursor-pointer text-green-500/90 drop-shadow-md"
      />
    </button>

    <button v-if="isRecording === 'started'" @click="pauseRecorder()">
      <PauseIcon class="size-7 cursor-pointer text-green-500 drop-shadow-md" />
    </button>

    <button
      v-if="!isRecording"
      class="rounded-full bg-primary p-2 send-audio-button"
      :disabled="disableBtn"
      @click="startRecorder()"
    >
      <MicrophoneIcon class="hover:text-white size-5" />
    </button>

    <button
      v-else
      :disabled="isLoading"
      class="mr-2 flex items-center justify-center rounded-full bg-primary p-2 drop-shadow-md"
      @click="sendAudio()"
    >
      <PaperAirplaneIcon v-if="!isLoading" class="size-5 cursor-pointer" />
      <span v-else class="loader-mobile-audio-recorder"></span>
    </button>
  </div>
</template>

<script setup>
import { onUnmounted, ref } from "vue";
import { notify } from "notiwind";
import { VoiceRecorder } from "capacitor-voice-recorder";
import {
  PaperAirplaneIcon,
  MicrophoneIcon,
  PauseIcon,
  PlayIcon,
  TrashIcon,
} from "@heroicons/vue/24/solid";

const emit = defineEmits(["audio-sent", "recording", "paused"]);
const props = defineProps({
  disableBtn: {
    type: Boolean,
    default: false,
  },
  sendAudioToAttendant: { type: Function, required: true },
  selectedAttendant: { type: Object, required: true },
  attendant: { required: true },
});

const isRecording = ref(null);
const isLoading = ref(false); //Cuida do Loader da requisição
const recordingTime = ref(0); // tempo que o audio está sendo gravado
const intervalId = ref(null); // Intervalo que o audio ficou pausado
const base64List = ref([]);
const audioType = ref(null);
const formattedTime = ref("00:00");
const isPlaying = ref(false); // Estado de reprodução da previa do audio
const concatenatedAudio = ref(null); // Mantém a referência do áudio globalmente
let currentTime = 0; // Mantém o tempo atual da previa do áudio

onUnmounted(() => {
  stopRecorder();
});

// converte o base64 em um BLOB
const convertAudioB64inBlob = () => {
  let audioRef;
  try {
    if (base64List.value.length > 0) {
      // Converte a lista de base64 em uma lista de Blobs
      const blobs = base64List.value.map((base64) => {
        const byteCharacters = atob(base64);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        return new Blob([byteArray], { type: audioType.value });
      });

      // Concatena todos os blobs em um único blob
      const combinedBlob = new Blob(blobs, { type: audioType.value });

      // Cria um URL de áudio a partir do Blob combinado
      const audioURL = URL.createObjectURL(combinedBlob);
      audioRef = new Audio(audioURL);

      return audioRef;
    }
  } catch (error) {
    console.error("Erro ao criar o objeto Audio:", error);
  }
};

// Pause e play da previa do audio
const playPauseAudio = (state) => {
  if (state === "play") {
    concatenatedAudio.value.currentTime = currentTime; // Retorna ao tempo atual antes de tocar
    concatenatedAudio.value.oncanplay = () => {
      concatenatedAudio.value
        .play()
        .then(() => {
          isPlaying.value = true; // Atualiza o estado para indicar que está tocando
        })
        .catch((error) => {
          console.error("Erro ao tentar reproduzir o áudio:", error);
        });
    };

    concatenatedAudio.value.onended = () => {
      isPlaying.value = false;
      currentTime = 0; // Reinicia o tempo para 0 ao terminar
    };

    concatenatedAudio.value.onerror = (error) => {
      console.error("Erro ao carregar o áudio:", error);
    };

    concatenatedAudio.value.load();
  } else if (state === "pause") {
    if (concatenatedAudio.value && !concatenatedAudio.value.paused) {
      isPlaying.value = false;
      concatenatedAudio.value.pause();
    } else {
      console.error("Nenhum áudio está tocando no momento");
    }
  }
};

// Formata o tempo de duração na hora de encaminhar
const formatTime = (segundos) => {
  const minutos = Math.floor(segundos / 60);
  const segundosRestantes = (segundos % 60).toFixed(0);
  const minutosStr = minutos.toString().padStart(2, "0");
  const segundosStr = segundosRestantes.toString().padStart(2, "0");
  return `${minutosStr}:${segundosStr}`;
};

const updateTimer = () => {
  recordingTime.value++;
  formattedTime.value = formatTime(recordingTime.value);
};

const startTimer = () => {
  if (intervalId.value) {
    clearInterval(intervalId.value);
  }
  intervalId.value = setInterval(updateTimer, 1000);
};

const stopTimer = () => {
  if (intervalId.value) {
    clearInterval(intervalId.value);
  }
};

// Inicia a gravação do audio
const startRecorder = async () => {
  let { value } = await VoiceRecorder.hasAudioRecordingPermission();
  if (value) {
    try {
      VoiceRecorder.startRecording();
      emit("recording", true);
      isRecording.value = "started";
      startTimer(); // Inicia o timer
    } catch (error) {
      console.error(error);
    }
  } else {
    notify(
      {
        group: "error",
        title: "Erro",
        text: "Permissões de microfone desativadas, ajuste nas configurações do dispositivo",
      },
      4000,
    );
  }
};

// Pausa a gravação do audio
const pauseRecorder = () => {
  try {
    emit("paused", true);
    isRecording.value = "paused";
    stopRecorder();
    stopTimer(); // Pausa o timer
  } catch (error) {
    console.error(error);
  }
};

// Retorna a gravação do audio
const resumeRecorder = () => {
  try {
    if (concatenatedAudio.value) {
      concatenatedAudio.value.pause();
      isPlaying.value = false;
    }
    emit("paused", false);
    isRecording.value = "started";
    startRecorder();
    startTimer(); // Retoma o timer
  } catch (error) {
    console.error(error);
  }
};

// para a gravação do audio
const stopRecorder = async () => {
  const statusRecord = await VoiceRecorder.getCurrentStatus();
  if (statusRecord.status === "NONE") {
    return;
  } else {
    await VoiceRecorder.stopRecording().then((result) => {
      audioType.value = result.value.mimeType;
      base64List.value.push(result.value.recordDataBase64);
      concatenatedAudio.value = convertAudioB64inBlob();
      stopTimer(); // Para o timer
    });
  }
};

const resetAudio = async () => {
  const statusRecord = await VoiceRecorder.getCurrentStatus();
  if (statusRecord.status === "RECORDING") {
    await stopRecorder();
    emit("paused", false);
    emit("recording", false);
    isRecording.value = null;
    base64List.value = [];
    isLoading.value = false;
    recordingTime.value = 0; // Reseta o tempo de gravação
    formattedTime.value = formatTime(0);
  } else if (statusRecord.status === "NONE") {
    emit("recording", false);
    emit("paused", false);
    isRecording.value = null;
    isLoading.value = false;
    base64List.value = [];
    recordingTime.value = 0; // Reseta o tempo de gravação
    formattedTime.value = formatTime(0);
  }
};

// Exclui a gravação do audio
const excludeAudio = async () => {
  await VoiceRecorder.getCurrentStatus();
  if (concatenatedAudio.value) {
    concatenatedAudio.value.pause();
    isPlaying.value = false;
  }
  resetAudio();
};

// Função para decodificar Base64 para Uint8Array
function base64ToUint8Array(base64) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

// Função para combinar vários Uint8Arrays em um único Uint8Array
function combineUint8Arrays(arrays) {
  let totalLength = arrays.reduce((acc, value) => acc + value.length, 0);
  let combinedArray = new Uint8Array(totalLength);
  let offset = 0;

  arrays.forEach((arr) => {
    combinedArray.set(arr, offset);
    offset += arr.length;
  });

  return combinedArray;
}

// Função para re-codificar Uint8Array para Base64
function uint8ArrayToBase64(uint8Array) {
  let binary = "";
  let len = uint8Array.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(uint8Array[i]);
  }
  return btoa(binary);
}

// Envia a gravação do audio
const sendAudio = async () => {
  isLoading.value = true;
  const statusRecord = await VoiceRecorder.getCurrentStatus();

  if (statusRecord.status === "RECORDING") {
    await stopRecorder();
  }

  try {
    // Converte as strings base64 em arrays de bytes
    const byteArrays = base64List.value.map(base64ToUint8Array);
    // Combina todos os arrays de bytes em um só
    const combinedByteArray = combineUint8Arrays(byteArrays);
    // Converte o array combinado de volta para base64
    const combinedBase64 = uint8ArrayToBase64(combinedByteArray);
    const audioDataUrl = `data:${audioType.value};base64,${combinedBase64}`;

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
        mimetype: getMimeType(audioDataUrl),
        data: audioDataUrl,
      },
    };

    console.log("payload", JSON.stringify(payload));

    await props.sendAudioToAttendant(
      props.selectedAttendant.internal_chat.channel_id,
      payload,
      props.attendant,
      true,
    );
    resetAudio();
  } catch (error) {
    resetAudio();
    console.error("Erro ao enviar áudio:", error);
    notify(
      {
        group: "error",
        title: "Erro",
        text: "Erro ao enviar áudio, tente novamente.",
      },
      4000,
    );
    return;
  }
};
</script>

<style scoped>
.send-audio-button {
  position: absolute;
  right: 0.5rem;
  top: 0.65rem;
  /* top: 3rem; */
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

.bounce-enter-active {
  animation: bounce-in 0.6s cubic-bezier(0.25, 1, 0.5, 1);
}

.bounce-leave-active {
  animation: bounce-out 0.3s ease; /* Suavidade ao sair */
}

@keyframes bounce-in {
  0% {
    transform: scale(0);
    opacity: 0;
  }
  50% {
    transform: scale(1.1);
    opacity: 1;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

@keyframes bounce-out {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  100% {
    transform: scale(0.8);
    opacity: 0;
  }
}

.loader-mobile-audio-recorder {
  width: 23px;
  height: 23px;
  border: 5px solid #fff;
  border-bottom-color: transparent;
  border-radius: 50%;
  display: inline-block;
  box-sizing: border-box;
  animation: rotation 1s linear infinite;
}

@keyframes rotation {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
