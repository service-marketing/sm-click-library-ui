<script setup>
import { computed } from "vue";

const props = defineProps({
  base64: { type: String },
  mimetype: { type: String },
  mode: { type: String, default: "message" }, // miniature | message | preview
  fileName: { type: String },
});

function isBase64DataUrl(str) {
  return (
    typeof str === "string" &&
    str.startsWith("data:") &&
    str.includes(";base64,")
  );
}
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
      v-else-if="mimetype === 'image/png' || mimetype === 'image/jpeg'"
      :class="['preview_img', mode]"
      :src="base64"
    />

    <!-- Imagens SVG -->
    <img
      v-else-if="mimetype === 'image/svg+xml'"
      :class="['preview_img', mode]"
      :src="isBase64DataUrl(base64) ? base64 : base64.replace('+', '%2B')"
    />

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
