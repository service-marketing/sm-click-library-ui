import { computed } from "vue";
import { useMessageContext } from "./messageContext.js";
import { isHeif } from "./messageUtils.js";

const GIF_TYPES = ["gif", "image/gif"];

function getMimeType(file) {
    return typeof file?.type === "string"
        ? file.type.toLowerCase()
        : typeof file?.content?.type === "string"
          ? file.content.type.toLowerCase()
          : "";
}

export function useMediaPreviewMode() {
    const ctx = useMessageContext();
    const deviceType = computed(() => ctx.deviceType?.value || "web");

    function shouldRenderHeifAsVideo(file, dType = "web") {
        return isHeif(file) && dType !== "ios";
    }

    const isHeifLike = (file) => isHeif(file);
    const isGifLike = (file) => GIF_TYPES.includes(getMimeType(file));

    const useImagePreview = (file) => {
        if (isHeifLike(file)) return !shouldRenderHeifAsVideo(file, deviceType.value);
        return !isGifLike(file);
    };

    const useVideoPreview = (file) => {
        if (isHeifLike(file)) return shouldRenderHeifAsVideo(file, deviceType.value);
        return isGifLike(file);
    };

    const previewMediaSrc = (file) => {
        if (useVideoPreview(file)) {
            return file?.blobUrl || file?.content?.data64 || file?.data64 || file?.content?.url || file?.url;
        }
        return file?.content?.data64 || file?.data64 || file?.content?.url || file?.url;
    };

    return {
        isHeifLike,
        useImagePreview,
        useVideoPreview,
        previewMediaSrc
    };
}
