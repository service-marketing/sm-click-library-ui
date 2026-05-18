export const GIF_TYPES = new Set(["gif", "image/gif"]);
export const STICKER_TYPES = new Set(["image/webp", "webp"]);
export const HEIF_TYPES = new Set(["heif", "heic", "image/heif", "image/heic"]);
export const AUDIO_TYPES = new Set([
    "audio",
    "audio/mpeg",
    "audio/ogg",
    "audio/wav",
    "audio/mp3",
    "mpeg",
    "mp3",
    "ogg",
    "wav",
    "aac"
]);
export const VIDEO_TYPES = new Set(["video", "video/mp4", "mp4"]);
export const IMAGE_TYPES = new Set(["image", "image/jpeg", "jpeg", "image/png", "png", "jpg"]);

const MIME_BY_EXTENSION = {
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    gif: "image/gif",
    webp: "image/webp",
    bmp: "image/bmp",
    svg: "image/svg+xml",
    heif: "image/heif",
    heic: "image/heic",
    mp4: "video/mp4",
    webm: "video/webm",
    ogg: "video/ogg",
    mov: "video/quicktime",
    m4v: "video/x-m4v",
    avi: "video/x-msvideo",
    mkv: "video/x-matroska",
    mp3: "audio/mpeg",
    wav: "audio/wav",
    m4a: "audio/mp4",
    aac: "audio/aac",
    pdf: "application/pdf"
};

export function normalizeMediaValue(value) {
    return typeof value === "string" ? value.trim().toLowerCase() : "";
}

export function inferMimeTypeFromName(name, fallback = "") {
    const ext = normalizeMediaValue(name).split(".").pop() || "";
    return MIME_BY_EXTENSION[ext] || fallback;
}

export function resolveFileMimeType(fileName = "", mimeType = "", fallback = "") {
    const normalizedMime =
        typeof mimeType === "string" ? normalizeMediaValue(mimeType) : normalizeMediaValue(mimeType?.type);
    return normalizedMime || inferMimeTypeFromName(fileName, fallback);
}
