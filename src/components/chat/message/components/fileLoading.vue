<template>
    <div class="relative">
        <div v-if="shouldShowPreview" class="relative">
            <MessageFileRenderer :message="message" />
            <div
                class="pointer-events-none absolute inset-0 flex flex-col items-center justify-center rounded-md bg-black/30"
            >
                <div class="loader-dots relative mx-auto block h-5 w-20">
                    <div class="absolute left-0 top-0 mt-1 size-3 animate-loader rounded-full bg-white"></div>
                    <div class="absolute left-0 top-0 mt-1 size-3 animate-loader rounded-full bg-white [animation-delay:.2s]"></div>
                    <div class="absolute left-0 top-0 mt-1 size-3 animate-loader rounded-full bg-white [animation-delay:.4s]"></div>
                </div>
                <p class="mt-2 text-sm font-medium text-white">Enviando arquivo...</p>
            </div>
        </div>

        <div
            v-else
            class="relative h-[200px] w-full lg:w-[300px] rounded-lg bg-base-200 dark:bg-base-700 border border-base-300 dark:border-base-600 overflow-hidden"
        >
            <div class="absolute inset-0 opacity-30 dark:opacity-20">
                <div class="absolute top-0 left-0 w-32 h-32 bg-blue-400 dark:bg-blue-500 rounded-full blur-3xl animate-pulse"></div>
                <div class="absolute bottom-0 right-0 w-40 h-40 bg-blue-400 dark:bg-blue-500 rounded-full blur-3xl animate-pulse [animation-delay:.5s]"></div>
            </div>
            <div class="relative h-full flex flex-col items-center justify-center gap-4 p-6">
                <div class="rounded-full bg-base-100 dark:bg-base-800 p-4 ring-2 ring-blue-400 dark:ring-blue-500 backdrop-blur-sm">
                    <svg
                        class="size-10 text-blue-500 dark:text-blue-400 animate-bounce"
                        fill="currentColor"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                    >
                        <path d="M16.88 9.1A4 4 0 0 1 16 17H5a5 5 0 0 1-1-9.9V7a3 3 0 0 1 4.52-2.59A4.98 4.98 0 0 1 17 8c0 .38-.04.74-.12 1.1zM11 11h3l-4-4-4 4h3v3h2v-3z" />
                    </svg>
                </div>
                <div class="flex flex-col items-center gap-3">
                    <p class="text-sm font-semibold text-base-900 dark:text-base-100">Enviando arquivo</p>
                    <div class="flex items-center gap-1.5">
                        <div class="size-2 rounded-full bg-blue-500 dark:bg-blue-400 animate-bounce"></div>
                        <div class="size-2 rounded-full bg-blue-500 dark:bg-blue-400 animate-bounce [animation-delay:.1s]"></div>
                        <div class="size-2 rounded-full bg-blue-500 dark:bg-blue-400 animate-bounce [animation-delay:.2s]"></div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { computed } from "vue";
import MessageFileRenderer from "./MessageFileRenderer.vue";

const props = defineProps({
    message: { type: Object, required: true }
});

const MAX_FILE_SIZE = 7 * 1024 * 1024;

const shouldShowPreview = computed(() => {
    if (!props.message || !props.message.content) return false;
    const content = props.message.content;
    if (content.data64) {
        const estimatedBinarySize = Math.ceil(content.data64.length / 1.33);
        return estimatedBinarySize <= MAX_FILE_SIZE;
    }
    return false;
});
</script>
