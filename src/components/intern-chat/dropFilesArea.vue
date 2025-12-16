<script setup>
import { ref, computed, nextTick, onMounted, onUnmounted, watch } from "vue";
import PreviewFiles from "./previewFiles.vue";
import "vue3-carousel/carousel.css";
import { Carousel, Slide, Pagination, Navigation } from "vue3-carousel";

const props = defineProps({
  sendFilesToAttendant: {
    type: Function,
    required: true,
  },
  selectedAttendant: { type: Object, required: true },
  attendant: { required: true },
  isMobile: { type: Boolean, default: false },
});

const carouselConfig = {
  itemsToShow: 6,
  wrapAround: false,
  gap: 8,
  mouseDrag: true,
  touchDrag: true,
  mouseWheel: true,
  snapAlign: "start",
  breakpoints: {
    1024: { itemsToShow: 4 },
    768: { itemsToShow: 4 },
    480: { itemsToShow: 4 },
    320: { itemsToShow: 2 },
    0: { itemsToShow: 1 },
  },
};

const isDragging = ref(false);
const fileContentText = ref("");
const manualFile = ref(null);
const files = ref([]);
const b64files = ref([]);
const selectedFileToPreview = ref(null);
const currentSlide = ref(0);
const loaderSendFile = ref(false);
const totalFilesToSend = ref(0);
const filesSent = ref(0);

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
  b64files.value = [];
  files.value = [];
  fileContentText.value = "";
  selectedFileToPreview.value = null;
  currentSlide.value = 0;
};

const discardSelectedFile = (index) => {
  if (index < 0 || index >= b64files.value.length) return;
  b64files.value.splice(index, 1);
  files.value.splice(index, 1);
  if (b64files.value.length === 0) {
    selectedFileToPreview.value = null;
    currentSlide.value = 0;
    return;
  }
  if (index === currentSlide.value) {
    const newIndex = index > 0 ? index - 1 : 0;
    selectedFileToPreview.value = b64files.value[newIndex];
    currentSlide.value = newIndex;
  } else if (index < currentSlide.value) {
    currentSlide.value -= 1;
  }
};

const chooseFiles = () => {
  manualFile.value.click();
};

const submitFile = async (event) => {
  const selectedFiles = Array.from(event.target.files);

  files.value = selectedFiles;

  b64files.value = await Promise.all(
    selectedFiles.map(async (file) => ({
      name: file.name,
      base64: await convertToB64(file),
    })),
  );

  selectedFileToPreview.value = b64files.value[0];

  nextTick(() => {
    focusTextInput();
  });
};

const onDrop = async (event) => {
  isDragging.value = false;
  const droppedFiles = Array.from(event.dataTransfer.files);

  files.value.push(...droppedFiles);

  const newB64Files = await Promise.all(
    droppedFiles.map(async (file) => ({
      name: file.name,
      base64: await convertToB64(file),
    })),
  );

  b64files.value.push(...newB64Files);

  if (!selectedFileToPreview.value) {
    selectedFileToPreview.value = b64files.value[0];
    currentSlide.value = 0;
  }

  nextTick(() => {
    focusTextInput();
  });
};

const getMimeType = (base64) => {
  if (base64) {
    return base64.split(";")[0].split(":")[1];
  }
  return null;
};

const sendFiles = async () => {
  try {
    loaderSendFile.value = true;
    totalFilesToSend.value = files.value.length;
    filesSent.value = 0;

    for (let i = 0; i < files.value.length; i++) {
      const isLast = i === files.value.length - 1;

      const payload = {
        type: "file",
        media: {
          name: b64files.value[i].name,
          mimetype: getMimeType(b64files.value[i].base64),
          data: b64files.value[i].base64,
        },
      };

      if (isLast) {
        payload.content = fileContentText.value;
      }

      await props.sendFilesToAttendant(
        props.selectedAttendant.internal_chat.channel_id,
        payload,
        props.attendant,
        true,
      );

      filesSent.value++;
    }

    await nextTick();
  } catch (error) {
    console.error(error);
  } finally {
    loaderSendFile.value = false;
    discardFile();
    onDragLeave();
  }
};

const textInput = ref(null);

const focusTextInput = () => {
  if (!textInput.value) return;
  textInput.value.focus();
};

const setPreviewFiles = (docs, index) => {
  selectedFileToPreview.value = docs;
  currentSlide.value = index;
};

const handlePaste = async (event) => {
  const items = event.clipboardData?.items;
  if (!items) return;

  const fileItems = [];
  for (const item of items) {
    if (item.kind === "file") {
      const file = item.getAsFile();
      if (file) fileItems.push(file);
    }
  }

  if (fileItems.length > 0) {
    const existingNames = new Set(files.value.map((f) => f.name));
    const uniqueFileItems = fileItems.filter(
      (file) => !existingNames.has(file.name),
    );

    if (uniqueFileItems.length === 0) return;

    files.value.push(...fileItems);

    const newB64Files = await Promise.all(
      fileItems.map(async (file) => ({
        name: file.name,
        base64: await convertToB64(file),
      })),
    );

    b64files.value.push(...newB64Files);

    if (!selectedFileToPreview.value) {
      selectedFileToPreview.value = newB64Files[0];
      currentSlide.value = 0;
    }
  }

  nextTick(() => {
    focusTextInput();
  });
};

watch(currentSlide, (newVal, oldVal) => {
  selectedFileToPreview.value = b64files.value[newVal];
});

onMounted(() => {
  window.addEventListener("paste", handlePaste);
});

onUnmounted(() => {
  window.removeEventListener("paste", handlePaste);
});

defineExpose({
  chooseFiles,
});
</script>

<template>
  <main
    @dragover.prevent="onDragOver"
    @dragleave="onDragLeave"
    @drop.prevent="onDrop"
  >
    <section
      :class="['dropzone-container ', { 'dropzone-active': isDragging }]"
    >
      <div
        v-if="!loaderSendFile && b64files.length > 0 && !isDragging"
        class="preview-overlay bg-base-300"
      >
        <button @click="discardFile()" class="close-button">
          <svg
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 14 14"
          >
            <path
              stroke="currentColor"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
            />
          </svg>
        </button>

        <section class="preview-info">
          <p class="text-black">
            {{ selectedFileToPreview?.name }}
          </p>
          <PreviewFiles
            :isMobile="isMobile"
            :avatar="null"
            mode="preview"
            :base64="selectedFileToPreview?.base64"
            :mimetype="getMimeType(selectedFileToPreview?.base64)"
          />

          <input
            ref="textInput"
            @keydown.enter="sendFiles()"
            placeholder="Digite uma mensagem para acompanhar o arquivo"
            class="input-drop-files-area bg-base-200 text-text-base"
            v-model="fileContentText"
            type="text"
          />
        </section>

        <div class="queue-info">
          <p>fila de envio</p>
          <section class="carousel-container bg-base-200">
            <Carousel v-model="currentSlide" v-bind="carouselConfig">
              <template v-if="isMobile" #addons>
                <Navigation />
              </template>

              <Slide v-for="(docs, index) in b64files" :key="index">
                <section class="carousel-item">
                  <button
                    v-if="currentSlide === index"
                    @click="discardSelectedFile(index)"
                    class="remove-file-btn"
                  >
                    <svg
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

                  <button
                    class="bg-base-100"
                    :class="[
                      'carousel-preview',
                      { active: currentSlide === index },
                    ]"
                    @dragstart.prevent
                    @click="setPreviewFiles(docs, index)"
                  >
                    <PreviewFiles
                      :isMobile="isMobile"
                      :avatar="null"
                      mode="miniature"
                      :base64="docs.base64"
                      :mimetype="getMimeType(docs.base64)"
                    />
                  </button>
                </section>
              </Slide>
            </Carousel>
          </section>
        </div>

        <footer class="send-footer">
          <button class="send-button" @click="sendFiles()">
            <svg
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
        </footer>
      </div>
      <section class="toast-loader-files" v-if="loaderSendFile">
        Enviando Arquivos... ({{ filesSent }} / {{ totalFilesToSend }})
      </section>
      <slot />
    </section>
    <input @change="submitFile" multiple ref="manualFile" type="file" hidden />
  </main>
</template>

<style scoped>
.dropzone-container {
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 8px;
  z-index: 50;
}
.dropzone-active {
  border: 2px dashed #3b82f6;
}
.preview-overlay {
  position: absolute;
  border-radius: 8px;
  width: 100%;
  height: 100%;
  /* background-color: #111827; */
  z-index: 50;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 8px;
  /* overflow: auto; */
  gap: 1px;
}
.close-button {
  background-color: #26343d98;
  @apply p-2 w-7 flex items-center justify-center
    rounded-md;
}
.close-button:hover {
  background-color: #253641;
}
.close-button svg {
  width: 10px;
  height: 10px;
  color: white;
}
.preview-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
  justify-content: center;
  align-items: center;
}
.preview-info p {
  font-size: 11px;
  font-weight: 600;
  color: #60a5fa;
}
.queue-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.queue-info p {
  color: white;
  font-weight: 500;
  font-size: 12px;
}
.carousel-container {
  /* background-color: #26343d; */
  padding: 8px;
  border-radius: 6px;
  overflow: hidden;
}
.carousel-item {
  position: relative;
}
.remove-file-btn {
  position: absolute;
  bottom: 0;
  right: 0;
  margin: 8px;
  background-color: #111b21;
  border-radius: 4px;
  padding: 4px;
  z-index: 10;
  display: flex;
}
.remove-file-btn:hover {
  background-color: #4b6374;
  @apply bg-base-200;
}

.remove-file-btn svg {
  width: 16px;
  height: 16px;
  color: #ef4444;
}
.remove-file-btn:hover svg {
  color: #991b1b;
}
.carousel-preview {
  padding: 12px;
  /* background-color: #4b6374; */
  border-radius: 6px;
  cursor: pointer;
}
.carousel-preview.active {
  background-color: #2563eb;
}
.send-footer {
  display: flex;
  justify-content: flex-end;
}
.send-button {
  background-color: #60a5fa;
  color: white;
  border-radius: 9999px;
  padding: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.send-button:hover {
  background-color: #2563eb;
}
.send-button svg {
  width: 16px;
  height: 16px;
  transform: rotate(90deg);
}
.input-drop-files-area {
  outline: none;
  border: none;
  box-shadow: 0 1px 3px 0 #1a202c;
  width: 100%;
  font-size: 10px;
  border-radius: 6px;
  padding: 8px 10px;
  transition: all 0.2s ease-in;
}
.input-drop-files-area::placeholder {
  color: #6b7280;
  font-size: 10px;
}
.input-drop-files-area:focus {
  outline: none;
  box-shadow: none;
}
.toast-loader-files {
  position: absolute;
  display: flex;
  justify-content: flex-end;
  right: 0.5rem;
  top: 1.1rem;
  background-color: #16a34a;
  border-radius: 9999px;
  padding-left: 0.75rem;
  padding-right: 0.75rem;
  color: #ffffff;
  font-size: 0.75rem;
  line-height: 1rem;
}
</style>
