<script setup>
import { computed } from "vue";
import { getFileIconType, formatFileSize } from "../../useScheduledEvents";

const props = defineProps({
  files: { type: Array, default: () => [] },
  placement: { type: String, default: "bottom-end" },
  badgeClass: {
    type: String,
    default:
      "sched-badge h-7 sched-badge--neutral",
  },
  previewClass: { type: String, default: "max-h-24 max-w-32" },
  panelClass: {
    type: String,
    default: "max-h-80 w-72 space-y-2 overflow-y-auto p-2",
  },
  iconClass: { type: String, default: "size-4 mr-1" },
  useButton: { type: Boolean, default: false },
});

const normalizedFiles = computed(() => (Array.isArray(props.files) ? props.files : []));

function getFileType(file) {
  return getFileIconType(file?.fileName, file?.mimeType);
}

function getMeta(file) {
  return [formatFileSize(file?.size), file?.caption?.trim()].filter(Boolean).join(" • ");
}
</script>

<template>
  <Popper v-if="normalizedFiles.length" :placement="placement" :arrow="false">
    <template #content>
      <section :class="panelClass">
        <article
          v-for="(file, index) in normalizedFiles"
          :key="`${file.fileName}-${index}`"
          class="flex items-center gap-2 rounded-lg"
        >
          <div
            class="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-base-200"
          >
            <img
              v-if="getFileType(file) === 'image' && file.file"
              :src="file.file"
              :alt="file.fileName"
              :class="['size-full object-cover', previewClass]"
              loading="lazy"
            />
            <svg
              v-else-if="getFileType(file) === 'pdf'"
              class="size-5 text-red-400"
              xmlns="http://www.w3.org/2000/svg"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                fill-rule="evenodd"
                d="M9 2.221V7H4.221a2 2 0 0 1 .365-.5L8.5 2.586A2 2 0 0 1 9 2.22ZM11 2v5a2 2 0 0 1-2 2H4v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2h-7Zm.5 9a.5.5 0 0 0-.5.5v5a.5.5 0 0 0 .5.5h.5a.5.5 0 0 0 .5-.5V14h1a1.5 1.5 0 0 0 0-3h-2Zm1 2v-1h1a.5.5 0 0 1 0 1h-1Zm-5.5-2a.5.5 0 0 0-.5.5v5a.5.5 0 0 0 .5.5H8a2 2 0 0 0 0-4H7Zm1 4v-3h.5a1 1 0 0 1 0 2H8Z"
                clip-rule="evenodd"
              />
            </svg>
            <svg
              v-else-if="getFileType(file) === 'video'"
              class="size-5 text-violet-400"
              xmlns="http://www.w3.org/2000/svg"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                fill-rule="evenodd"
                d="M14 7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V7Zm2 9.387 4.684 1.562A1 1 0 0 0 22 17V7a1 1 0 0 0-1.316-.949L16 7.613v8.774Z"
                clip-rule="evenodd"
              />
            </svg>
            <svg
              v-else-if="getFileType(file) === 'audio'"
              class="size-5 text-emerald-400"
              xmlns="http://www.w3.org/2000/svg"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                d="M13 6a2 2 0 0 0-3.441-1.397l-4.443 4.445H3.1A2.1 2.1 0 0 0 1 11.1v1.8A2.1 2.1 0 0 0 3.1 15h2.01l4.44 4.573A2 2 0 0 0 13 18V6ZM15.5 8.5a1 1 0 0 1 1.414 0A6.979 6.979 0 0 1 19 13a6.979 6.979 0 0 1-2.086 4.914 1 1 0 0 1-1.414-1.414A4.98 4.98 0 0 0 17 13a4.98 4.98 0 0 0-1.5-3.5 1 1 0 0 1 0-1Z"
              />
            </svg>
            <svg
              v-else
              class="size-5 text-sky-400"
              xmlns="http://www.w3.org/2000/svg"
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

          <div class="min-w-0 flex-1">
            <p class="truncate text-sm font-medium leading-tight">{{ file.fileName || "Arquivo sem nome" }}</p>
            <p v-if="getMeta(file)" class="truncate text-xs opacity-50">
              {{ getMeta(file) }}
            </p>
          </div>
        </article>
      </section>
    </template>

    <component :is="useButton ? 'button' : 'span'" type="button" :class="badgeClass">
      <svg
        :class="iconClass"
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
      {{ normalizedFiles.length }}
    </component>
  </Popper>
</template>

<style src="../../utils/calendarTheme.css"></style>
<style src="./styles.css"></style>
