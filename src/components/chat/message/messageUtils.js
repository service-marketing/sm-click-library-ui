import { provide, inject } from "vue";
import {
    AUDIO_TYPES,
    GIF_TYPES,
    HEIF_TYPES,
    IMAGE_TYPES,
    STICKER_TYPES,
    VIDEO_TYPES,
    normalizeMediaValue,
    inferMimeTypeFromName
} from "./mediaTypes.js";

// ── Provide / Inject key ──
export const MESSAGE_COMPONENTS_KEY = Symbol("libMessageComponents");

/**
 * Provide sub-components for LibMessage.
 * Call this in a parent component (or the wrapper) so that LibMessage
 * can resolve Avatar, Markdown, audioView, chatQuote, etc.
 *
 * @param {Record<string, import('vue').Component | null>} components
 *
 * Expected keys (all optional – features gracefully degrade):
 *   Avatar, Markdown, audioView, chatQuote, adMessage,
 *   commentMessage, locationMap, vCard, ciphertext,
 *   CallMessage, fileLoading, listMessage, templateMessage,
 *   buttonMessage, groupMessages, MessageFileRenderer
 */
export function provideMessageComponents(components) {
    provide(MESSAGE_COMPONENTS_KEY, components);
}

/**
 * Inject sub-components previously provided by `provideMessageComponents`.
 * @returns {Record<string, import('vue').Component | null>}
 */
export function useMessageComponents() {
    return inject(MESSAGE_COMPONENTS_KEY, {});
}

// ── Media type helpers ──

function getItemName(item) {
    return normalizeMediaValue(
        item?.content?.title ||
            item?.content?.name ||
            item?.content?.filename ||
            item?.content?.original_name ||
            item?.title ||
            item?.name ||
            item?.fileName ||
            item?.filename ||
            item?.original_name ||
            ""
    );
}

function resolveMediaType(item) {
    const explicitType = normalizeMediaValue(
        item?.content?.type || item?.type || item?.mimeType?.type || item?.mimeType || ""
    );
    if (explicitType) return explicitType;
    return inferMimeTypeFromName(getItemName(item));
}

export function isHeif(item) {
    const mediaType = resolveMediaType(item);
    return HEIF_TYPES.has(mediaType) || /\.(heif|heic)$/i.test(getItemName(item));
}

export function isImage(item) {
    const mediaType = resolveMediaType(item);
    if (!mediaType || isSticker(item) || isGif(item)) return false;
    return isHeif(item) || IMAGE_TYPES.has(mediaType) || mediaType.startsWith("image/");
}

export function isGif(item) {
    const mediaType = resolveMediaType(item);
    return (isVideo(item) && item?.content?.is_gif) || GIF_TYPES.has(mediaType);
}

export function isSticker(item) {
    return STICKER_TYPES.has(resolveMediaType(item));
}

export function isVideo(item) {
    const mediaType = resolveMediaType(item);
    return VIDEO_TYPES.has(mediaType) || /^video\//i.test(mediaType);
}

export function isAudio(item) {
    const mediaType = resolveMediaType(item);
    return AUDIO_TYPES.has(mediaType) || /^audio\//i.test(mediaType);
}

// ── Pure helpers ──

/**
 * Returns `true` when `content` has at least one own key.
 * (Legacy name kept for backward compatibility — the name is misleading.)
 */
export function isObjectEmpty(content) {
    return Object.keys(content).length !== 0;
}

/**
 * Decide whether the avatar indicator should be rendered for
 * `currentMessage`, given the `previousMessage` below it.
 */
export function shouldDisplayAvatar(currentMessage, previousMessage) {
    if (!currentMessage || (!currentMessage.sent_by && !currentMessage.content?.sender)) {
        return false;
    }
    if (!previousMessage || (!previousMessage.sent_by && !previousMessage.content?.sender)) {
        return true;
    }
    const currentSenderId =
        currentMessage.sent_by?.id || currentMessage.content?.sender?.id || currentMessage.content?.sender?.name;
    const previousSenderId =
        previousMessage.sent_by?.id || previousMessage.content?.sender?.id || previousMessage.content?.sender?.name;
    if (currentSenderId && previousSenderId) {
        return currentSenderId !== previousSenderId;
    }
    return false;
}

/**
 * Format a duration in seconds as "MM:SS".
 */
export function formatTime(segundos) {
    const minutos = Math.floor(segundos / 60);
    const segundosRestantes = (segundos % 60).toFixed(0);
    return `${minutos.toString().padStart(2, "0")}:${segundosRestantes.toString().padStart(2, "0")}`;
}
