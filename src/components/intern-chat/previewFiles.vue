<script setup>
import { computed, onMounted, ref } from "vue";
import { Fancybox } from "@fancyapps/ui";
// import "@fancyapps/ui/dist/fancybox/fancybox.css";

const props = defineProps({
  base64: { type: String },
  mimetype: { type: String },
  mode: { type: String, default: "message" }, // miniature | message | preview
  fileName: { type: String },
});
const thumbnail = ref(null);

const viewSingleImage = async (src, mimetype, caption = "") => {
  if (props.mode === "miniature") return;

  if (isVideo(mimetype)) {
    Fancybox.show([
      {
        type: "html",
        src,
        html: `
          <video controls autoplay style="width:100%;height:auto;max-height:80vh">
            <source src="${src}" type="${mimetype}" />
            Seu navegador não suporta vídeo.
          </video>
        `,
        caption,
      },
    ]);
  } else {
    Fancybox.show([
      {
        src,
        type: "image",
        caption,
      },
    ]);
  }
};

function generateVideoThumbnail(base64Video, seekTime = 1) {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    video.src = base64Video;
    video.crossOrigin = "anonymous";
    video.muted = true;
    video.playsInline = true;
    video.preload = "auto";

    video.addEventListener("loadeddata", () => {
      // Espera um tempo (em segundos) no vídeo para pegar o frame desejado
      if (video.readyState >= 2) {
        video.currentTime = seekTime;
      }
    });

    video.addEventListener("seeked", () => {
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const ctx = canvas.getContext("2d");
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Captura a imagem como base64
      const thumbnail = canvas.toDataURL("image/png");
      resolve(thumbnail);
    });

    video.addEventListener("error", (e) => {
      reject("Erro ao carregar vídeo para thumbnail.");
    });
  });
}

const isBase64DataUrl = (str) => {
  return (
    typeof str === "string" &&
    str.startsWith("data:") &&
    str.includes(";base64,")
  );
};

const isVideo = (mimetype) => {
  if (!mimetype) return;
  const validateMymetype = mimetype.startsWith("video/");
  return validateMymetype;
};

onMounted(async () => {
  thumbnail.value = await generateVideoThumbnail(props.base64);
});
</script>

<template>
  <main
    :class="{
      main_preview_files_container_message: mode === 'message',
      main_preview_files_container_miniature: mode === 'miniature',
      main_preview_files_container_preview: mode === 'preview',
    }"
  >
    <!-- PDF preview (iframe) -->
    <iframe
      v-if="mimetype === 'application/pdf' && mode !== 'miniature'"
      class="iframe_preview_files"
      :src="base64"
      frameborder="0"
    ></iframe>

    <!-- PDF icon for miniature -->
    <svg
      v-else-if="mimetype === 'application/pdf' && mode === 'miniature'"
      class="size-12 text-white"
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      fill="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        fill-rule="evenodd"
        d="M9 2.221V7H4.221a2 2 0 0 1 .365-.5L8.5 2.586A2 2 0 0 1 9 2.22ZM11 2v5a2 2 0 0 1-2 2H4a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2 2 2 0 0 0 2 2h12a2 2 0 0 0 2-2 2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2V4a2 2 0 0 0-2-2h-7Zm-6 9a1 1 0 0 0-1 1v5a1 1 0 1 0 2 0v-1h.5a2.5 2.5 0 0 0 0-5H5Zm1.5 3H6v-1h.5a.5.5 0 0 1 0 1Zm4.5-3a1 1 0 0 0-1 1v5a1 1 0 0 0 1 1h1.376A2.626 2.626 0 0 0 15 15.375v-1.75A2.626 2.626 0 0 0 12.375 11H11Zm1 5v-3h.375a.626.626 0 0 1 .625.626v1.748a.625.625 0 0 1-.626.626H12Zm5-5a1 1 0 0 0-1 1v5a1 1 0 1 0 2 0v-1h1a1 1 0 1 0 0-2h-1v-1h1a1 1 0 1 0 0-2h-2Z"
        clip-rule="evenodd"
      />
    </svg>

    <!-- Imagens PNG/JPEG -->
    <img
      @click="viewSingleImage(base64, mimetype)"
      v-else-if="mimetype === 'image/png' || mimetype === 'image/jpeg'"
      :class="['preview_img', mode]"
      :src="base64"
    />

    <!-- Imagens SVG -->
    <img
      @click="viewSingleImage(base64, mimetype)"
      v-else-if="mimetype === 'image/svg+xml'"
      :class="['preview_img', mode]"
      :src="isBase64DataUrl(base64) ? base64 : base64.replace('+', '%2B')"
    />

    <video
      width="300"
      height="150"
      controls
      v-else-if="isVideo(mimetype) && mode === 'preview'"
      :src="base64"
    >
      <source :src="base64" :type="mimetype" />
    </video>

    <button
      @click="viewSingleImage(base64, mimetype)"
      class="video_message_preview_container"
      v-else-if="isVideo(mimetype) && mode === 'message'"
    >
      <section v-if="thumbnail">
        <div class="video_message_preview">
          <svg
            class="size-12 text-white"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              fill-rule="evenodd"
              d="M8.6 5.2A1 1 0 0 0 7 6v12a1 1 0 0 0 1.6.8l8-6a1 1 0 0 0 0-1.6l-8-6Z"
              clip-rule="evenodd"
            />
          </svg>

          <div class="label_video_hover">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="2"
              class="absolute left-2 top-2 size-6"
              style="transform: rotate(135deg)"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="m19 9-7 7-7-7"
              />
            </svg>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="2"
              class="absolute right-2 top-2 size-6"
              style="transform: rotate(-135deg)"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="m19 9-7 7-7-7"
              />
            </svg>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="2"
              class="absolute bottom-2 left-2 size-6"
              style="transform: rotate(45deg)"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="m19 9-7 7-7-7"
              />
            </svg>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="2"
              class="absolute bottom-2 right-2 size-6"
              style="transform: rotate(-45deg)"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="m19 9-7 7-7-7"
              />
            </svg>
          </div>
        </div>

        <img :class="['preview_img', mode]" :src="thumbnail" />
      </section>
      <span v-else>Carregando...</span>
    </button>

    <svg
      v-else-if="isVideo(mimetype) && mode === 'miniature'"
      class="size-12 text-white"
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      fill="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        fill-rule="evenodd"
        d="M14 7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V7Zm2 9.387 4.684 1.562A1 1 0 0 0 22 17V7a1 1 0 0 0-1.316-.949L16 7.613v8.774Z"
        clip-rule="evenodd"
      />
    </svg>

    <!-- Audio player -->
    <audio
      v-else-if="mimetype === 'audio/mpeg' && mode !== 'miniature'"
      controls
    >
      <source :src="base64" :type="mimetype" />
    </audio>

    <!-- Audio icon for miniature -->
    <svg
      v-else-if="mimetype === 'audio/mpeg' && mode === 'miniature'"
      class="size-12 text-white"
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      fill="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        fill-rule="evenodd"
        d="M5 8a1 1 0 0 1 1 1v3a4.006 4.006 0 0 0 4 4h4a4.006 4.006 0 0 0 4-4V9a1 1 0 1 1 2 0v3.001A6.006 6.006 0 0 1 14.001 18H13v2h2a1 1 0 1 1 0 2H9a1 1 0 1 1 0-2h2v-2H9.999A6.006 6.006 0 0 1 4 12.001V9a1 1 0 0 1 1-1Z"
        clip-rule="evenodd"
      />
      <path
        d="M7 6a4 4 0 0 1 4-4h2a4 4 0 0 1 4 4v5a4 4 0 0 1-4 4h-2a4 4 0 0 1-4-4V6Z"
      />
    </svg>

    <div :class="mode === 'message' ? 'generic_files' : ''" v-else>
      <div>
        <svg
          class="size-12 text-white"
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            fill-rule="evenodd"
            d="M9 2.221V7H4.221a2 2 0 0 1 .365-.5L8.5 2.586A2 2 0 0 1 9 2.22ZM11 2v5a2 2 0 0 1-2 2H4v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2h-7Z"
            clip-rule="evenodd"
          />
        </svg>
      </div>

      <span v-if="mode === 'message'" class="span_generic_files">
        <p class="truncate">{{ fileName }}</p>

        <button class="download_btn_generic_files" @click="$emit('download')">
          Baixar arquivo
        </button>
      </span>
    </div>
  </main>
</template>

<style scoped>
.main_preview_files_container_message {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  border-radius: 0.375rem;
}

.main_preview_files_container_miniature {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
}

.main_preview_files_container_preview {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  background-color: #1f2a30;
  border-radius: 0.375rem;
  min-height: 9.5rem;
}
.video_message_preview {
  background-color: rgb(0 0 0 / 0.2);
  position: absolute;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 0.5rem;
}
.label_video_hover {
  pointer-events: none;
  position: absolute;
  inset: 0px;
  background-color: rgb(0 0 0 / 0.3);
  border-radius: 0.5rem;
  opacity: 0;
  transition-property: opacity;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
  color: #ffffff;
}
.video_message_preview:hover .label_video_hover {
  opacity: 1;
}
.video_message_preview_container {
  position: relative;
}

.download_btn_generic_files {
  font-size: 0.75rem;
  line-height: 1rem;
  color: #2563eb;
  text-decoration-line: underline;
}

.generic_files {
  display: flex;
  width: 100%;
  padding: 0.5rem;
  color: #ffffff;
  border-radius: 0.5rem;
  background-color: #1f2a30;
}

.span_generic_files {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  overflow: hidden;
}

.span_generic_files p {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.iframe_preview_files {
  width: 100%;
  height: 100%;
}

.preview_img {
  object-fit: contain;
  border-radius: 0.375rem;
  cursor: pointer;
}

.preview_img.message {
  width: 100%;
  height: 7rem;
}

.preview_img.preview {
  width: 8rem;
  height: 8rem;
}

.preview_img.miniature {
  width: 3rem;
  height: 3rem;
}
</style>
