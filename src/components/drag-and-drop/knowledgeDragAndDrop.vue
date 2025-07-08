<script setup>
import { ref } from "vue";
import { notify } from "notiwind";

const emits = defineEmits(["receiveFile"]);
const isDragging = ref(false);
const file = ref(null);
const manualFile = ref(null);
const b64file = ref(null);

const submitFile = async (event) => {
  const selectedFiles = event.target.files;
  const filePdf = selectedFiles[0].type === "application/pdf";

  //   if (!filePdf) {
  //     console.log("erro");
  //     notify(
  //       {
  //         group: "error",
  //         title: "Erro",
  //         text: `Oops! Apenas arquivos PDF são compatíveis. Verifique o tipo do arquivo e tente novamente`,
  //       },
  //       4000
  //     );
  //     return;
  //   }

  if (selectedFiles.length > 0) {
    file.value = selectedFiles[0];
    event.target.value = null;

    const fileBase64 = await convertToB64(file.value);
    b64file.value = fileBase64;
    emits("receiveFile", fileBase64);
  }
};

const onDrop = async (event) => {
  isDragging.value = false;
  const droppedFiles = event.dataTransfer.files;
  const filePdf = droppedFiles[0].type === "application/pdf";

  //   if (!filePdf) {
  //     console.log("erro");
  //     notify(
  //       {
  //         group: "error",
  //         title: "Erro",
  //         text: `Oops! Apenas arquivos PDF são compatíveis. Verifique o tipo do arquivo e tente novamente`,
  //       },
  //       4000
  //     );
  //     return;
  //   }

  if (droppedFiles.length > 0) {
    const selectedFile = droppedFiles[0];
    file.value = selectedFile;

    const fileBase64 = await convertToB64(selectedFile);
    b64file.value = fileBase64;
    emits("receiveFile", fileBase64);
  }
};

const convertToB64 = (fileToB64) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(fileToB64);

    reader.onload = () => {
      resolve(reader.result);
    };

    reader.onerror = (error) => {
      reject(error);
    };
  });
};

const onDragOver = () => {
  isDragging.value = true;
};

const onDragLeave = () => {
  isDragging.value = false;
};

const discardFile = () => {
  file.value = null;
  emits("receiveFile", null);
};

const chooseFiles = () => {
  manualFile.value.click();
};
</script>

<template>
  <main
    class="drop-area border-2 border-dashed border-gray-400 text-center rounded-lg p-1 flex items-center justify-center relative border-opacity-25 select-none min-h-24"
    @dragover.prevent="onDragOver"
    @dragleave="onDragLeave"
    @drop.prevent="onDrop"
    :class="{ 'bg-gray-500': isDragging }"
  >
    <span v-if="!file" class="flex flex-col justify-center items-center gap-1">
      <svg
        :class="{
          'text-gray-900': isDragging,
          'text-gray-400 opacity-25': !isDragging,
        }"
        class="size-7 text-gray-300"
        width="47"
        height="46"
        viewBox="0 0 47 46"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M15.6129 24.5715L-3.8147e-06 33.645L6.66528 35.5437L1.90117 43.7662L5.7842 46L10.5483 37.7797L15.5322 42.5823L15.6129 24.5715ZM20.0967 8.93507H15.6129V13.4026H4.40317C3.80857 13.4026 3.23832 13.638 2.81787 14.0569C2.39743 14.4758 2.16123 15.0439 2.16123 15.6364V24.5715H6.6451V17.8701H29.0645V40.2078H20.0967V44.6754H31.3064C31.901 44.6754 32.4713 44.44 32.8917 44.0211C33.3122 43.6022 33.5484 43.034 33.5484 42.4416V31.2728H38.0322V26.8052H33.5484V15.6364C33.5484 15.0439 33.3122 14.4758 32.8917 14.0569C32.4713 13.638 31.901 13.4026 31.3064 13.4026H20.0967V8.93507ZM42.5161 26.8052V31.2728H47V26.8052H42.5161ZM42.5161 17.8701V22.3377H47V17.8701H42.5161ZM42.5161 8.93507V13.4026H47V8.93507H42.5161ZM42.5161 0V4.46754H47V0H42.5161ZM33.5484 0V4.46754H38.0322V0H33.5484ZM24.5806 0V4.46754H29.0645V0H24.5806ZM15.6129 0V4.46754H20.0967V0H15.6129Z"
          fill="currentColor"
        />
      </svg>
      <p v-if="!isDragging" class="uppercase text-xs opacity-25">
        Arraste seu documento aqui
      </p>
      <p v-else class="uppercase text-xs text-gray-900">
        Solte aqui o documento
      </p>

      <button
        v-if="!isDragging"
        :class="{ 'bg-gray-400': isDragging }"
        @click="chooseFiles"
        class="bg-base-300 text-white py-1 px-2 rounded-sm text-xs hover:bg-base-200 hover:shadow-md hover:shadow-base-300"
      >
        Selecione o arquivo
      </button>
    </span>

    <section class="w-full" v-else>
      <section class="grid grid-cols-2 md:flex gap-3 max-h-20">
        <iframe
          :src="b64file"
          frameborder="0"
          scrolling="auto"
          class="md:max-w-56 max-h-20 md:max-h-full rounded-md shadow-lg border border-gray-900"
        ></iframe>

        <span
          class="hidden md:flex flex-col items-start gap-2 truncate max-w-[45%]"
        >
          <p class="text-start">{{ file.name }}</p>
          <p class="text-xs text-gray-500">
            {{ (file.size / (1024 * 1024)).toFixed(2) }} MB
          </p>
        </span>
      </section>

      <button
        @click="discardFile()"
        class="bg-base-300 hover:bg-base-100 flex items-center text-white text-xs p-1 absolute rounded-md right-2 top-2"
      >
        <svg
          class="w-4 h-4 text-red-500"
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
    </section>

    <input
      @change="submitFile"
      ref="manualFile"
      type="file"
      accept="application/pdf"
      hidden
    />
  </main>
</template>

<style scoped>
.drop-area {
  transition: background-color 0.3s;
}
</style>
