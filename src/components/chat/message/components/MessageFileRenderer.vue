<template>
    <section v-if="hasContent" :class="wrapperClass">
        <template v-if="renderMode === 'image'">
            <button
                v-if="canExpand"
                type="button"
                class="group"
                :class="surfaceClass"
                :aria-label="openLabel"
                @click="openVisual(false)"
            >
                <img :src="mediaSrc" :alt="fileLabel" :class="imageClass" loading="lazy" />
                <MediaHoverFrame v-if="showMediaHoverFrame" />
            </button>
            <div v-else :class="surfaceClass">
                <img :src="mediaSrc" :alt="fileLabel" :class="imageClass" loading="lazy" />
            </div>
        </template>

        <template v-else-if="renderMode === 'video'">
            <div v-if="isHeifVideoPreview" :class="surfaceClass">
                <video
                    :class="['media-video media-video-heif', heifVideoClass]"
                    :src="mediaSrc"
                    autoplay
                    muted
                    loop
                    playsinline
                />
            </div>
            <div v-else-if="isThumbnailVariant" :class="surfaceClass">
                <video class="media-video media-video-thumbnail" :src="mediaSrc" autoplay muted loop playsinline />
            </div>
            <div v-else-if="isComposerVariant" :class="surfaceClass">
                <video class="media-video" :src="mediaSrc" controls autoplay muted loop playsinline />
            </div>
            <button
                v-else-if="canExpand"
                type="button"
                class="video-trigger group"
                :aria-label="openLabel"
                @click="openVisual(true)"
            >
                <videoLazy :content="mediaSrc" :is-circle="content?.isptv" :compact="props.variant === 'chat'" />
                <MediaHoverFrame v-if="showMediaHoverFrame" />
            </button>
            <div v-else :class="surfaceClass">
                <video class="media-video media-video-thumbnail" :src="mediaSrc" autoplay muted loop playsinline />
            </div>
        </template>

        <template v-else-if="renderMode === 'pdf'">
            <div v-if="isThumbnailVariant" :class="iconSurfaceClass">
                <svg class="size-14 text-red-500" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path
                        fill-rule="evenodd"
                        d="M9 2.221V7H4.221a2 2 0 0 1 .365-.5L8.5 2.586A2 2 0 0 1 9 2.22ZM11 2v5a2 2 0 0 1-2 2H4a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2 2 2 0 0 0 2 2h12a2 2 0 0 0 2-2 2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2V4a2 2 0 0 0-2-2h-7Zm-6 9a1 1 0 0 0-1 1v5a1 1 0 1 0 2 0v-1h.5a2.5 2.5 0 0 0 0-5H5Zm1.5 3H6v-1h.5a.5.5 0 0 1 0 1Zm4.5-3a1 1 0 0 0-1 1v5a1 1 0 0 0 1 1h1.376A2.626 2.626 0 0 0 15 15.375v-1.75A2.626 2.626 0 0 0 12.375 11H11Zm1 5v-3h.375a.626.626 0 0 1 .625.626v1.748a.625.625 0 0 1-.626.626H12Zm5-5a1 1 0 0 0-1 1v5a1 1 0 1 0 2 0v-1h1a1 1 0 1 0 0-2h-1v-1h1a1 1 0 1 0 0-2h-2Z"
                        clip-rule="evenodd"
                    />
                </svg>
            </div>
            <div v-else-if="isWebDevice" :class="pdfContainerClass">
                <button
                    type="button"
                    :class="surfaceClass"
                    :aria-label="`Abrir PDF ${fileLabel}`"
                    @click="openPdfLightbox(content)"
                >
                    <iframe
                        v-if="pdfUrl && !pdfUrl.startsWith('undefined')"
                        :src="`${pdfUrl}#toolbar=0&navpanes=0`"
                        class="pdf-frame"
                        loading="lazy"
                    />
                    <div class="pdf-overlay">
                        <div class="pdf-pill">
                            <svg class="size-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                                <path
                                    fill-rule="evenodd"
                                    d="M9 2.221V7H4.221a2 2 0 0 1 .365-.5L8.5 2.586A2 2 0 0 1 9 2.22ZM11 2v5a2 2 0 0 1-2 2H4a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2 2 2 0 0 0 2 2h12a2 2 0 0 0 2-2 2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2V4a2 2 0 0 0-2-2h-7Zm-6 9a1 1 0 0 0-1 1v5a1 1 0 1 0 2 0v-1h.5a2.5 2.5 0 0 0 0-5H5Zm1.5 3H6v-1h.5a.5.5 0 0 1 0 1Zm4.5-3a1 1 0 0 0-1 1v5a1 1 0 0 0 1 1h1.376A2.626 2.626 0 0 0 15 15.375v-1.75A2.626 2.626 0 0 0 12.375 11H11Zm1 5v-3h.375a.626.626 0 0 1 .625.626v1.748a.625.625 0 0 1-.626.626H12Zm5-5a1 1 0 0 0-1 1v5a1 1 0 1 0 2 0v-1h1a1 1 0 1 0 0-2h-1v-1h1a1 1 0 1 0 0-2h-2Z"
                                    clip-rule="evenodd"
                                />
                            </svg>
                            <span>Abrir PDF</span>
                        </div>
                    </div>
                </button>
            </div>
            <button v-else type="button" class="pdf-mobile-card" @click="openMobilePdf(pdfUrl)">
                <div class="pdf-mobile-header">
                    <svg class="size-5 shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                        <path
                            fill-rule="evenodd"
                            d="M9 2.221V7H4.221a2 2 0 0 1 .365-.5L8.5 2.586A2 2 0 0 1 9 2.22ZM11 2v5a2 2 0 0 1-2 2H4a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2 2 2 0 0 0 2 2h12a2 2 0 0 0 2-2 2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2V4a2 2 0 0 0-2-2h-7Zm-6 9a1 1 0 0 0-1 1v5a1 1 0 1 0 2 0v-1h.5a2.5 2.5 0 0 0 0-5H5Zm1.5 3H6v-1h.5a.5.5 0 0 1 0 1Zm4.5-3a1 1 0 0 0-1 1v5a1 1 0 0 0 1 1h1.376A2.626 2.626 0 0 0 15 15.375v-1.75A2.626 2.626 0 0 0 12.375 11H11Zm1 5v-3h.375a.626.626 0 0 1 .625.626v1.748a.625.625 0 0 1-.626.626H12Zm5-5a1 1 0 0 0-1 1v5a1 1 0 1 0 2 0v-1h1a1 1 0 1 0 0-2h-1v-1h1a1 1 0 1 0 0-2h-2Z"
                            clip-rule="evenodd"
                        />
                    </svg>
                    <div class="min-w-0">
                        <p class="truncate text-sm font-medium">{{ fileLabel }}</p>
                        <p class="text-xs opacity-75">Toque para abrir o documento</p>
                    </div>
                </div>
            </button>
        </template>

        <template v-else-if="renderMode === 'audio'">
            <div :class="iconSurfaceClass">
                <svg class="size-14 text-primary" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path
                        fill-rule="evenodd"
                        d="M9 7V2.221a2 2 0 0 0-.5.365L4.586 6.5a2 2 0 0 0-.365.5H9Zm2 0V2h7a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V9h5a2 2 0 0 0 2-2Zm2.318.052h-.002A1 1 0 0 0 12 8v5.293A4.033 4.033 0 0 0 10.5 13C8.787 13 7 14.146 7 16s1.787 3 3.5 3 3.5-1.146 3.5-3c0-.107-.006-.211-.017-.313A1.04 1.04 0 0 0 14 15.5V9.766c.538.493 1 1.204 1 2.234a1 1 0 1 0 2 0c0-1.881-.956-3.14-1.86-3.893a6.4 6.4 0 0 0-1.636-.985 4.009 4.009 0 0 0-.165-.063l-.014-.005-.005-.001-.002-.001ZM9 16c0-.356.452-1 1.5-1s1.5.644 1.5 1-.452 1-1.5 1S9 16.356 9 16Z"
                        clip-rule="evenodd"
                    />
                </svg>
            </div>
        </template>

        <template v-else>
            <div v-if="isThumbnailVariant" :class="iconSurfaceClass">
                <svg class="size-14 text-primary" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path
                        fill-rule="evenodd"
                        d="M9 2.221V7H4.221a2 2 0 0 1 .365-.5L8.5 2.586A2 2 0 0 1 9 2.22ZM11 2v5a2 2 0 0 1-2 2H4v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2h-7Z"
                        clip-rule="evenodd"
                    />
                </svg>
            </div>
            <div v-else :class="fileContainerClass">
                <fileMessage :file="content" />
            </div>
        </template>

        <div v-if="shouldShowCaption" :class="captionClass">
            <markDown :content="captionText" />
        </div>
    </section>

    <div v-else class="renderer-loading">
        <div class="loader-dots relative my-2 block h-5 w-20">
            <div class="loader-dot"></div>
            <div class="loader-dot [animation-delay:.2s]"></div>
            <div class="loader-dot [animation-delay:.4s]"></div>
        </div>
    </div>
</template>

<script setup>
import { computed } from "vue";
import { Fancybox } from "@fancyapps/ui";
import { useMessageContext } from "../messageContext.js";
import { useMediaPreviewMode } from "../useMediaPreviewMode.js";
import { isAudio, isImage, isGif, isVideo, isSticker } from "../messageUtils.js";
import MediaHoverFrame from "./MediaHoverFrame.vue";
import videoLazy from "./videoLazy.vue";
import markDown from "./markDown.vue";
import fileMessage from "./fileMessage.vue";

const props = defineProps({
    message: { type: Object, default: () => ({}) },
    variant: { type: String, default: "chat" },
    showCaption: { type: Boolean, default: true },
    interactive: { type: Boolean, default: true }
});

const ctx = useMessageContext();
const { isHeifLike, useImagePreview, useVideoPreview, previewMediaSrc } = useMediaPreviewMode();

const content = computed(() => props.message?.content || {});
const mimeType = computed(() => String(content.value?.type || "").toLowerCase());
const mediaSrc = computed(() => previewMediaSrc(content.value));
const pdfUrl = computed(() => content.value?.data64 || content.value?.url || "");
const captionText = computed(() => content.value?.text || content.value?.caption || "");
const fileLabel = computed(
    () =>
        content.value?.title ||
        content.value?.name ||
        content.value?.filename ||
        content.value?.original_name ||
        "arquivo"
);
const hasContent = computed(() => Object.keys(content.value || {}).length > 0);
const isWebDevice = computed(() => (ctx.deviceType?.value || "web") === "web");
const isComposerVariant = computed(() => props.variant === "composer");
const isThumbnailVariant = computed(() => props.variant === "thumbnail");
const interactive = computed(() => props.interactive && !isThumbnailVariant.value);
const canExpand = computed(() => interactive.value && !(isHeifLike(content.value) && useVideoPreview(content.value)));
const isPdfType = computed(() => ["application/pdf", "pdf"].includes(mimeType.value));
const isNativeGifImage = computed(() => ["gif", "image/gif"].includes(mimeType.value));
const isHeifVideoPreview = computed(() => isHeifLike(content.value) && useVideoPreview(content.value));

const renderMode = computed(() => {
    if (isPdfType.value) return "pdf";
    if (isAudio(props.message)) return "audio";
    if (isSticker(props.message)) return "image";
    if (isImage(props.message)) {
        return useVideoPreview(content.value) ? "video" : "image";
    }
    if (isVideo(props.message)) return "video";
    if (isGif(props.message)) {
        if (isNativeGifImage.value || useImagePreview(content.value)) return "image";
        if (useVideoPreview(content.value)) return "video";
    }
    return "file";
});

const shouldShowCaption = computed(
    () => props.showCaption && !!captionText.value && !isComposerVariant.value && !isThumbnailVariant.value
);
const overlayLabel = computed(() => (renderMode.value === "video" ? "Abrir vídeo" : "Ampliar"));
const openLabel = computed(() => `${overlayLabel.value}: ${fileLabel.value}`);
const wrapperClass = computed(() => {
    if (isThumbnailVariant.value) return "renderer renderer-thumbnail";
    if (isComposerVariant.value) return "renderer renderer-composer";
    return "renderer renderer-chat";
});
const surfaceClass = computed(() => {
    if (isThumbnailVariant.value) return "media-surface media-surface-thumbnail";
    if (isComposerVariant.value) return "media-surface media-surface-composer";
    return "media-surface media-surface-chat";
});
const iconSurfaceClass = computed(() =>
    isThumbnailVariant.value ? "icon-surface icon-surface-thumbnail" : "icon-surface"
);
const imageClass = computed(() => {
    if (isThumbnailVariant.value) return "media-image media-image-thumbnail";
    if (isComposerVariant.value) return "media-image media-image-composer";
    return "media-image media-image-chat";
});
const heifVideoClass = computed(() => {
    if (isThumbnailVariant.value) return "media-video-heif-thumbnail";
    if (isComposerVariant.value) return "media-video-heif-composer";
    return "media-video-heif-chat";
});
const showMediaHoverFrame = computed(
    () => canExpand.value && props.variant === "chat" && (renderMode.value === "image" || renderMode.value === "video")
);
const captionClass = computed(() => (renderMode.value === "video" ? "renderer-caption pt-2" : "renderer-caption"));
const pdfContainerClass = computed(() => (isComposerVariant.value ? "pdf-shell pdf-shell-composer" : "pdf-shell"));
const fileContainerClass = computed(() => (isComposerVariant.value ? "file-shell file-shell-composer" : "file-shell"));

function openVisual(isVideoPreview) {
    if (!canExpand.value) return;
    ctx.viewImage(0, isVideoPreview, props.message);
}

function hashString(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash |= 0;
    }
    return hash.toString();
}

async function openMobilePdf(url) {
    try {
        const { Filesystem, Directory } = await import("@capacitor/filesystem");
        const { FileOpener } = await import("@capacitor-community/file-opener");

        const fileId = hashString(url);
        const filePath = `pdfs/smclick-file-${fileId}.pdf`;

        try {
            const fileUriResult = await Filesystem.getUri({
                path: filePath,
                directory: Directory.Documents
            });
            await FileOpener.open({
                filePath: fileUriResult.uri,
                contentType: "application/pdf",
                openWithDefault: true
            });
            return;
        } catch (e) {
            // File not cached, download it
        }

        const response = await fetch(url);
        if (!response.ok) throw new Error(`Erro ao baixar arquivo: ${response.statusText}`);

        const blob = await response.blob();
        const reader = new FileReader();

        reader.onloadend = async () => {
            const base64data = reader.result.split(",")[1];

            await Filesystem.writeFile({
                path: filePath,
                data: base64data,
                directory: Directory.Documents,
                recursive: true
            });

            const fileUriResult = await Filesystem.getUri({
                path: filePath,
                directory: Directory.Documents
            });

            await FileOpener.open({
                filePath: fileUriResult.uri,
                contentType: "application/pdf",
                openWithDefault: true
            });
        };

        reader.readAsDataURL(blob);
    } catch (error) {
        console.error("openMobilePdf error:", error);
    }
}

function openPdfLightbox(msgContent) {
    const src = msgContent?.data64 || msgContent?.url;
    if (!src || String(src).startsWith("undefined")) {
        ctx.notify?.({ group: "error", title: "Erro", text: "PDF inválido." }, 3000);
        return;
    }

    if (!isWebDevice.value) {
        openMobilePdf(src);
        return;
    }

    Fancybox.show(
        [
            {
                src,
                type: "iframe",
                caption: msgContent.caption || msgContent.title || "Documento PDF"
            }
        ],
        {
            Carousel: {
                Toolbar: {
                    display: { left: ["counter"], middle: [], right: ["toggleFull", "close"] }
                }
            },
            Html: {
                videoTpl:
                    '<iframe src="{{src}}" width="90%" height="85vh" style="border-radius: 12px; border: none;"></iframe>'
            },
            dragToClose: false
        }
    );
}
</script>

<style scoped>
.renderer {
    @apply flex w-full flex-col gap-2;
}

.renderer-chat {
    @apply p-1;
}

.renderer-composer {
    @apply h-full min-h-0;
}

.renderer-thumbnail {
    @apply h-full min-h-0;
}

.media-surface {
    @apply relative overflow-hidden;
}

.media-surface-chat {
    @apply rounded-lg;
}

.media-surface-composer {
    @apply flex size-full items-center justify-center rounded-md bg-transparent;
}

.media-surface-thumbnail {
    @apply flex h-full w-full items-center justify-center rounded-t-xl bg-transparent;
}

.media-image {
    @apply sticky mx-auto cursor-pointer rounded bg-fixed;
}

.media-image-chat {
    @apply h-auto max-h-[300px] max-w-full object-scale-down;
}

.media-image-composer {
    @apply size-full max-h-full rounded object-contain;
}

.media-image-thumbnail {
    @apply size-full max-h-full rounded-none object-cover;
}

.media-video {
    @apply size-full rounded bg-black object-contain;
}

.media-video-thumbnail {
    @apply rounded-none max-w-xl object-cover;
}

.media-video-heif {
    @apply bg-transparent object-contain;
}

.media-video-heif-chat {
    @apply h-auto max-h-[300px] max-w-full;
}

.media-video-heif-composer {
    @apply size-full max-h-full;
}

.media-video-heif-thumbnail {
    @apply size-full rounded-none;
}

.video-trigger {
    @apply relative block max-w-full overflow-hidden;
}

.icon-surface {
    @apply flex size-full items-center justify-center;
}

.icon-surface-thumbnail {
    @apply rounded-t-xl bg-transparent;
}

.renderer-caption {
    @apply pl-1 pt-2;
}

.pdf-shell {
    @apply w-full;
}

.pdf-shell-composer {
    @apply h-full;
}

.pdf-frame {
    @apply pointer-events-none h-[350px] w-full border-0;
}

.renderer-composer .pdf-frame {
    @apply h-full rounded;
}

.pdf-overlay {
    @apply absolute inset-x-0 bottom-0 flex justify-end p-4;
}

.pdf-pill {
    @apply inline-flex items-center gap-2 rounded-full bg-black/75 px-4 py-2 text-sm font-medium text-white;
}

.pdf-mobile-card {
    @apply w-full min-w-48 rounded-md;
}

.pdf-mobile-header {
    @apply flex items-center gap-3 rounded-md bg-gray-900 p-3 text-left text-white dark:bg-gray-200 dark:text-gray-900;
}

.file-shell {
    @apply w-full;
}

.file-shell-composer {
    @apply flex h-full items-center justify-center;
}

.renderer-loading {
    @apply mx-auto flex w-32 flex-col items-center rounded-full px-6 py-2;
}

.loader-dot {
    @apply absolute left-0 top-0 mt-1 size-3 rounded-full bg-white;
    animation: loader-dot 1.1s infinite ease-in-out;
}

@keyframes loader-dot {
    0% {
        transform: translateX(0) scale(0.92);
        opacity: 0.45;
    }

    50% {
        transform: translateX(32px) scale(1);
        opacity: 1;
    }

    100% {
        transform: translateX(64px) scale(0.92);
        opacity: 0.45;
    }
}
</style>
