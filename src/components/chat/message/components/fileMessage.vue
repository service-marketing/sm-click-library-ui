<template>
    <div class="sidebar m- rounded shadow transition duration-150 ease-in-out">
        <div class="flex items-center gap-4 p-1">
            <a class="" :href="file.url" :download="fileLabel" :title="fileLabel" @click.prevent="handleDownload">
                <svg
                    class="size-14 rounded p-1 text-primary header"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        fill-rule="evenodd"
                        d="M9 2.221V7H4.221a2 2 0 0 1 .365-.5L8.5 2.586A2 2 0 0 1 9 2.22ZM11 2v5a2 2 0 0 1-2 2H4v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2h-7Zm3 2h2.01v2.01h-2V8h2v2.01h-2V12h2v2.01h-2V16h2v2.01h-2v2H12V18h2v-1.99h-2V14h2v-1.99h-2V10h2V8.01h-2V6h2V4Z"
                        clip-rule="evenodd"
                    />
                </svg>
            </a>
            <main class="pr-3 max-w-28 md:max-w-32">
                <p class="line-clamp-2 truncate">{{ fileLabel }}</p>
                <a
                    target="_blank"
                    class="cursor-pointer text-cyan-500 hover:underline"
                    :href="file.url"
                    :download="fileLabel"
                    :title="fileLabel"
                    @click.prevent="handleDownload"
                >
                    Baixar arquivo
                </a>
            </main>
        </div>
    </div>
    <div v-if="file.caption" class="mt-2">
        <markDown :content="file.caption" />
    </div>
</template>

<script setup>
import { computed } from "vue";
import markDown from "./markDown.vue";
import { useMessageContext } from "../messageContext.js";

const ctx = useMessageContext();

const props = defineProps({
    file: { type: Object, default: () => ({}) }
});

const fileLabel = computed(
    () => props.file?.title || props.file?.name || props.file?.filename || props.file?.original_name || "arquivo"
);

async function handleDownload() {
    await ctx.downloadFile(props.file);
}
</script>
