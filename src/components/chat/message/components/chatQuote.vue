<script setup>
import { computed } from "vue";
import buttonMessage from "./buttonMessage.vue";
import MessageFileRenderer from "./MessageFileRenderer.vue";
import markDown from "./markDown.vue";
import { useMessageContext } from "../messageContext.js";
import { isVideo, isGif, isImage, isSticker, isAudio } from "../messageUtils.js";

const ctx = useMessageContext();

const emit = defineEmits(["goMessage", "go"]);

const props = defineProps({
    message: { type: Object, required: true },
    isMessage: { type: Boolean, default: false },
    messageId: { type: String, required: false, default: null },
    attendant: { type: [Object, null], required: false, default: null },
    chatId: { type: String, required: false, default: null }
});

const HTTPS_RE = /^https:\/\/[^\s/$.?#].[^\s]*$/i;

function isHttpsLink(value) {
    if (typeof value !== "string") return false;
    return HTTPS_RE.test(value.trim());
}

function formatTime(totalSeconds) {
    const n = Number(totalSeconds);
    if (!Number.isFinite(n) || n < 0) return "00:00";
    const min = Math.floor(n / 60);
    const sec = Math.floor(n % 60);
    return String(min).padStart(2, "0") + ":" + String(sec).padStart(2, "0");
}

function getDisplayName() {
    const msg = props.message || {};
    const attendantName = ctx.attendant?.value?.name ?? "";

    if (props.isMessage) {
        const a = props.attendant;
        const fromAttendant = a?.name ? a.name : msg?.sender?.name;
        if (!fromAttendant) return "";
        return fromAttendant === attendantName ? "Você" : fromAttendant;
    }

    const sentByName = msg?.sent_by?.name;
    const fallbackName = msg?.sender?.name;

    if (sentByName) return sentByName === attendantName ? "Você" : sentByName;
    if (fallbackName) return fallbackName;
    return "";
}

function onCardClick() {
    if (props.isMessage) emit("go", props.messageId, props.chatId);
}

function onClose() {
    ctx.setQuote(null);
}

const type = () => props.message?.type ?? "";
const isPdf = () => type() === "pdf";
const hasSidePreview = computed(
    () =>
        isImage(props.message) || isSticker(props.message) || isGif(props.message) || isVideo(props.message) || isPdf()
);
const quoteRendererMessage = computed(() => ({
    type: props.message?.type || "document",
    content: props.message || {}
}));

const deviceType = computed(() => ctx.deviceType?.value || "web");
</script>

<template>
    <main
        :class="{
            'mb-2 rounded-xl': deviceType !== 'web' && !isMessage,
            'rounded-t-xl': deviceType === 'web' && !isMessage,
            'mb-1 rounded-b-xl': isMessage,
            header: !isMessage
        }"
        class="rounded-t-xl"
    >
        <header :class="{ 'p-2': !isMessage }" class="flex items-center text-xl">
            <div
                :class="{
                    'cursor-pointer bg-black/50': isMessage,
                    'border-l-4': !isMessage
                }"
                class="sidebar relative flex max-h-[200px] min-h-[50px] w-full items-start justify-between overflow-y-auto overflow-x-hidden rounded-lg border-primary text-sm shadow shadow-gray-900 dark:border-primary dark:bg-gray-100 dark:shadow-gray-400"
                @click="onCardClick"
            >
                <section class="p-2 my-auto px-3 flex-1 min-w-0 overflow-hidden">
                    <div class="message-owner-name text-base">
                        {{ getDisplayName() }}
                    </div>
                    <div v-if="message.description" class="flex-col">
                        <span v-if="isMessage" class="message-owner-name text-base">Você</span>
                        <markDown :content="message.description" />
                    </div>
                    <span v-if="message.type && isAudio(message)" class="flex py-1">
                        <svg
                            class="mr-1 size-5 text-primary"
                            aria-hidden="true"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                fill-rule="evenodd"
                                d="M5 8c.6 0 1 .4 1 1v3a4 4 0 0 0 4 4h4a4 4 0 0 0 4-4V9a1 1 0 1 1 2 0v3a6 6 0 0 1-6 6h-1v2h2a1 1 0 1 1 0 2H9a1 1 0 1 1 0-2h2v-2h-1a6 6 0 0 1-6-6V9c0-.6.4-1 1-1Z"
                                clip-rule="evenodd"
                            />
                            <path d="M7 6a4 4 0 0 1 4-4h2a4 4 0 0 1 4 4v5a4 4 0 0 1-4 4h-2a4 4 0 0 1-4-4V6Z" />
                        </svg>
                        {{ formatTime(message.duration) }}
                    </span>
                    <section>
                        <span
                            v-if="message.type && message.type !== 'voice_call'"
                            class="flex items-start gap-1 w-full min-w-0"
                        >
                            <svg
                                v-if="isImage(message)"
                                class="mr-1 size-5 text-primary"
                                aria-hidden="true"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    fill-rule="evenodd"
                                    d="M7.5 4.6A2 2 0 0 1 8.9 4h6.2c.5 0 1 .2 1.4.6L17.9 6H19a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8c0-1.1.9-2 2-2h1l1.5-1.4ZM10 12a2 2 0 1 1 4 0 2 2 0 0 1-4 0Zm2-4a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z"
                                    clip-rule="evenodd"
                                />
                            </svg>

                            <svg
                                v-else-if="isSticker(message)"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke-width="1.5"
                                stroke="currentColor"
                                class="mr-1 size-5 text-primary"
                            >
                                <path
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
                                />
                            </svg>

                            <svg
                                v-else-if="isVideo(message)"
                                class="mr-1 size-5 text-primary"
                                aria-hidden="true"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    fill-rule="evenodd"
                                    d="M19 3a2 2 0 0 1 2 2v2h-2V5.4L17.4 7h-2.8l2-2h-2.2l-2 2H9.6l2-2H9.4l-2 2H3V5c0-1.1.9-2 2-2h14ZM3 9v10c0 1.1.9 2 2 2h14a2 2 0 0 0 2-2V9H3Zm2-2.4L6.6 5H5v1.6ZM9.6 11a1 1 0 0 1 1 .1l4 3a1 1 0 0 1 0 1.6l-4 3A1 1 0 0 1 9 18v-6c0-.4.2-.7.6-.9Z"
                                    clip-rule="evenodd"
                                />
                            </svg>

                            <svg
                                v-else-if="isPdf()"
                                class="mr-1 size-5 text-primary"
                                aria-hidden="true"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    fill-rule="evenodd"
                                    d="M9 2.2V7H4.2l.4-.5 3.9-4 .5-.3Zm2-.2v5a2 2 0 0 1-2 2H4a2 2 0 0 0-2 2v7c0 1.1.9 2 2 2 0 1.1.9 2 2 2h12a2 2 0 0 0 2-2 2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2V4a2 2 0 0 0-2-2h-7Zm-6 9a1 1 0 0 0-1 1v5a1 1 0 1 0 2 0v-1h.5a2.5 2.5 0 0 0 0-5H5Zm1.5 3H6v-1h.5a.5.5 0 0 1 0 1Zm4.5-3a1 1 0 0 0-1 1v5c0 .6.4 1 1 1h1.4a2.6 2.6 0 0 0 2.6-2.6v-1.8a2.6 2.6 0 0 0-2.6-2.6H11Zm1 5v-3h.4a.6.6 0 0 1 .6.6v1.8a.6.6 0 0 1-.6.6H12Zm5-5a1 1 0 0 0-1 1v5a1 1 0 1 0 2 0v-1h1a1 1 0 1 0 0-2h-1v-1h1a1 1 0 1 0 0-2h-2Z"
                                    clip-rule="evenodd"
                                />
                            </svg>

                            <svg
                                v-else-if="!isAudio(message)"
                                class="mr-1 size-5 text-primary"
                                aria-hidden="true"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    fill-rule="evenodd"
                                    d="M9 2.2V7H4.2l.4-.5 3.9-4 .5-.3Zm2-.2v5a2 2 0 0 1-2 2H4v11c0 1.1.9 2 2 2h12a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2h-7Z"
                                    clip-rule="evenodd"
                                />
                            </svg>

                            <markDown v-if="message.text" :content="message.text" />
                            <span v-else-if="isImage(message)">Foto</span>
                            <span v-else-if="isSticker(message)">Figurinha</span>
                            <span v-else-if="isVideo(message)">Vídeo</span>
                            <span v-else-if="isGif(message)">GIF</span>
                            <span v-else-if="isPdf()">PDF</span>
                            <span v-else-if="!isAudio(message)">Arquivo</span>
                        </span>
                        <main v-else-if="message.template" class="mt-1 flex flex-col gap-1">
                            <header v-if="message.template.header" class="font-semibold">
                                <img
                                    v-if="isHttpsLink(message.template.header)"
                                    :src="message.template.header"
                                    class="max-w-full h-auto rounded"
                                />
                                <markDown v-else :content="message.template.header" />
                            </header>
                            <main v-if="message.template.body">
                                <markDown :content="message.template.body" />
                            </main>
                            <footer v-if="message.template.footer" class="opacity-70">
                                <markDown :content="message.template.footer" />
                            </footer>
                        </main>
                        <main v-else-if="message.type === 'voice_call'" class="mt-4 px-3 flex justify-between">
                            <buttonMessage :content="message" />
                        </main>
                        <markDown v-else :content="message.text" />
                    </section>
                </section>
                <div v-if="hasSidePreview" class="shrink-0">
                    <div class="media-preview" :class="{ compact: !isMessage }">
                        <MessageFileRenderer
                            :message="quoteRendererMessage"
                            variant="thumbnail"
                            :interactive="false"
                            :show-caption="false"
                        />
                    </div>
                </div>
            </div>
            <button
                v-if="!isMessage"
                class="ml-[18px] mr-[14px]"
                title="Fechar"
                type="button"
                @click="onClose"
            >
                <svg
                    class="size-6"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                >
                    <path
                        stroke="currentColor"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M6 18 18 6m0 12L6 6"
                    />
                </svg>
            </button>
        </header>
    </main>
</template>

<style scoped>
.media-preview {
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    max-width: min(40vw, 220px);
    max-height: 170px;
}

.media-item {
    width: 100%;
    height: 100%;
    max-width: 100%;
    max-height: 100%;
    object-fit: cover;
    display: block;
}

.media-item iframe {
    width: 100%;
    height: 100%;
    border: none;
}

.media-preview :deep(.renderer-thumbnail) {
    width: 100%;
    height: 100%;
}

.media-preview :deep(.media-surface-thumbnail),
.media-preview :deep(.icon-surface-thumbnail) {
    width: 100%;
    height: 100%;
}

.media-preview.compact {
    max-width: min(28vw, 140px);
    max-height: 100px;
}
</style>
