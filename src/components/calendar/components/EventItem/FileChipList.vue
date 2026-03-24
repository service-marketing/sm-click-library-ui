<template>
  <div class="itemsb-files">
    <div
      v-for="(file, index) in files.slice(0, max)"
      :key="index"
      class="file-chip"
    >
      <span class="file-chip-type" :class="fileTypeClass(file)">
        {{ getFileTypeLabel(file) }}
      </span>
      <div class="min-w-0">
        <p class="file-chip-name">{{ file.fileName || "Arquivo sem nome" }}</p>
        <p class="file-chip-size">
          {{ [getFileTypeLabel(file), formatFileSize(file.size)].filter(Boolean).join(" • ") }}
        </p>
      </div>
    </div>

    <div v-if="files.length > max" class="file-chip-more">
      +{{ files.length - max }} arquivo{{ files.length - max > 1 ? "s" : "" }}
    </div>
  </div>
</template>

<script setup>
import { getFileIconType, getFileTypeLabel, formatFileSize } from "../../useScheduledEvents";

const props = defineProps({
  files: { type: Array, default: () => [] },
  max: { type: Number, default: 3 },
});

function fileTypeClass(file) {
  const type = getFileIconType(file?.fileName, file?.mimeType);
  return {
    "bg-sky-500/15 text-sky-400": type === "image",
    "bg-violet-500/15 text-violet-400": type === "video",
    "bg-emerald-500/15 text-emerald-400": type === "audio",
    "bg-red-500/15 text-red-400": type === "pdf",
    "bg-slate-500/15 text-slate-300": type === "file",
  };
}
</script>

<style src="../../utils/calendarTheme.css"></style>
<style src="./styles.css"></style>
