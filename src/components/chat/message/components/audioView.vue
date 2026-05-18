<template>
    <div
        ref="rootEl"
        class="audio-row mx-auto inline-flex min-w-0 max-w-full select-none items-center gap-1"
        :class="rowDir"
        :style="rootStyle"
    >
        <div class="relative shrink-0">
            <Avatar :icon-url="avatar" class="size-11" />
            <button
                v-show="isPlaying"
                type="button"
                class="absolute top-0 flex size-11 items-center justify-center rounded-full border-2 border-primary bg-black/30 text-xs font-semibold text-white"
                @click="cycleRate"
                :aria-label="`Playback rate ${playbackRate.toFixed(1)}x. Click to change`"
            >
                {{ playbackRate.toFixed(1) }}x
            </button>
        </div>
        <button
            :class="`${isOwner ? 'text-gray-200 dark:text-gray-900' : 'text-primary '}`"
            type="button"
            class="shrink-0 rounded-full transition hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 dark:hover:bg-black/5"
            @click="playPause"
            :aria-pressed="isPlaying ? 'true' : 'false'"
            :aria-label="isPlaying ? 'Pause' : 'Play'"
            @keydown.space.prevent="playPause"
        >
            <svg
                v-if="!isPlaying"
                class="size-11"
                :class="{ 'animate-pulse': isLoading }"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                fill="currentColor"
                viewBox="0 0 24 24"
            >
                <path
                    fill-rule="evenodd"
                    d="M8.6 5.2A1 1 0 0 0 7 6v12a1 1 0 0 0 1.6.8l8-6a1 1 0 0 0 0-1.6l-8-6Z"
                    clip-rule="evenodd"
                />
            </svg>

            <svg
                v-else
                class="size-11"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                fill="currentColor"
                viewBox="0 0 24 24"
            >
                <path
                    fill-rule="evenodd"
                    d="M8 5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H8Zm7 0a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-1Z"
                    clip-rule="evenodd"
                />
            </svg>
        </button>

        <div class="relative flex h-14 min-w-0 flex-1 items-center">
            <div v-if="isLoading" ref="loaderContainerEl" class="loading-equalizer">
                <span v-for="i in numBars" :key="i" :style="getBarStyle(i)"></span>
            </div>
            <div v-show="!isLoading" ref="hostEl" class="relative block h-full w-full min-w-0">
                <div id="waveform" ref="waveEl" class="ws-surface absolute inset-0 block h-full w-full min-w-0"></div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, watch, onMounted, onBeforeUnmount, nextTick, computed } from "vue";
import WaveSurfer from "wavesurfer.js";
import Avatar from "./Avatar.vue";

const props = defineProps({
    audio: { type: String, required: true },
    avatar: { type: [String, null], required: true },
    isOwner: { type: Boolean, default: false },

    waveColor: { type: String, default: "#7ab8ff" },
    progressColor: { type: String, default: "#34d399" },
    cursorColor: { type: String, default: "#fff" },

    height: { type: Number, default: 60 },
    barWidth: { type: Number, default: 4 },
    barRadius: { type: Number, default: 2 },
    barHeight: { type: Number, default: 0.75 },
    barGap: { type: Number, default: 2 },
    cursorWidth: { type: Number, default: 14 },
    cursorHeight: { type: Number, default: 14 },

    fullWidth: { type: Boolean, default: false },
    minWidth: { type: String, default: "200px" },
    prefWidth: { type: String, default: "37vw" },
    maxWidth: { type: String, default: "300px" },

    onlyOneAtATime: { type: Boolean, default: true }
});
const emit = defineEmits(["duration", "currentTime"]);

const rootStyle = computed(() =>
    props.fullWidth
        ? { inlineSize: "100%", minInlineSize: "0" }
        : { inlineSize: `clamp(${props.minWidth}, ${props.prefWidth}, ${props.maxWidth})`, minInlineSize: "0" }
);
const rowDir = computed(() => (props.isOwner ? "flex-row-reverse text-right" : "flex-row"));

const rootEl = ref(null);
const hostEl = ref(null);
const waveEl = ref(null);

let ws = null;
let resizeHandler = null;

const isPlaying = ref(false);
const isLoading = ref(true);
const duration = ref(0);
const currentTime = ref(0);
const playbackRate = ref(1);

const isDataUrl = (s) => typeof s === "string" && /^data:audio\/[a-zA-Z0-9.+-]+;base64,/.test(s);
const isLikelyBase64 = (s) =>
    typeof s === "string" && s.length >= 16 && /^[A-Za-z0-9+/=\s]+$/.test(s) && s.length % 4 === 0;
function base64ToBlob(b64, type = "audio/mp3") {
    const pure = b64.includes(",") ? b64.split(",")[1] : b64;
    const bytes = Uint8Array.from(atob(pure), (c) => c.charCodeAt(0));
    return new Blob([bytes], { type });
}

function destroyWS() {
    try { ws?.unAll?.(); } catch {}
    try { ws?.destroy?.(); } catch {}
    ws = null;
}

async function createWS() {
    if (!waveEl.value) return;
    destroyWS();

    ws = WaveSurfer.create({
        container: waveEl.value,
        waveColor: props.isOwner ? "#1ca3d9" : props.waveColor,
        progressColor: props.progressColor,
        height: props.height,
        cursorWidth: props.cursorWidth,
        cursorHeight: props.cursorHeight,
        cursorColor: props.cursorColor,
        barWidth: props.barWidth,
        barRadius: props.barRadius,
        barHeight: props.barHeight,
        barGap: props.barGap,
        hideScrollbar: true
    });

    ws.on("ready", () => {
        duration.value = ws.getDuration();
        emit("duration", duration.value);
        isLoading.value = false;
        ws.setPlaybackRate(playbackRate.value);
    });

    ws.on("play", () => {
        isPlaying.value = true;
        if (props.onlyOneAtATime) {
            const prev = window.__activeWSInstance;
            if (prev && prev !== ws) {
                try { prev.pause(); } catch {}
            }
            window.__activeWSInstance = ws;
        }
    });
    ws.on("pause", () => {
        isPlaying.value = false;
        if (window.__activeWSInstance === ws) window.__activeWSInstance = null;
    });
    ws.on("finish", () => {
        isPlaying.value = false;
        if (window.__activeWSInstance === ws) window.__activeWSInstance = null;
    });

    ws.on("audioprocess", () => {
        currentTime.value = ws.getCurrentTime();
        emit("currentTime", currentTime.value);
    });
    ws.on("seek", () => {
        currentTime.value = ws.getCurrentTime();
    });

    waveEl.value.addEventListener("pointerdown", onPointerDown);

    await loadAudio(props.audio);
}

async function loadAudio(src) {
    if (!ws) return;
    isLoading.value = true;
    try {
        if (isDataUrl(src) || isLikelyBase64(src)) await ws.loadBlob(base64ToBlob(src));
        else await ws.load(src);
    } catch {
        try {
            await ws.load(src);
        } catch (err) {
            console.error("Falha ao carregar áudio:", err);
            isLoading.value = false;
        }
    }
}

function playPause() {
    ws?.playPause?.();
}
function cycleRate() {
    playbackRate.value = playbackRate.value >= 2 ? 1 : +(playbackRate.value + 0.5).toFixed(1);
    ws?.setPlaybackRate?.(playbackRate.value);
}

let isDragging = false;
function percentFromEvent(evt) {
    const rect = waveEl.value?.getBoundingClientRect?.();
    if (!rect) return null;
    const x = "touches" in evt ? evt.touches[0].clientX : evt.clientX;
    const p = (x - rect.left) / rect.width;
    return Math.max(0, Math.min(1, p));
}
function seekAt(evt) {
    const p = percentFromEvent(evt);
    if (p == null) return;
    ws?.seekTo?.(p);
}
function onPointerDown(evt) {
    isDragging = true;
    seekAt(evt);
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerup", onPointerUp, { passive: true });
}
function onPointerMove(evt) {
    if (!isDragging) return;
    seekAt(evt);
}
function onPointerUp() {
    isDragging = false;
    window.removeEventListener("pointermove", onPointerMove);
    window.removeEventListener("pointerup", onPointerUp);
}

const loaderContainerEl = ref(null);
const numBars = ref(20);
let loaderObserver = null;

const BAR_WIDTH = 5;
const BAR_GAP = 3;

const getBarStyle = (index) => {
    const animationDuration = 1.2;
    const delayFactor = (index % 8) * 0.1;
    return {
        animationDelay: `-${(animationDuration - delayFactor).toFixed(2)}s`
    };
};

onMounted(async () => {
    await nextTick();
    await createWS();

    const updateBars = () => {
        if (!loaderContainerEl.value) return;
        const width = loaderContainerEl.value.clientWidth;
        numBars.value = Math.floor(width / (BAR_WIDTH + BAR_GAP));
    };

    watch(
        isLoading,
        (loading) => {
            if (loading) {
                nextTick(() => {
                    if (loaderContainerEl.value && !loaderObserver) {
                        updateBars();
                        loaderObserver = new ResizeObserver(updateBars);
                        loaderObserver.observe(loaderContainerEl.value);
                    }
                });
            } else {
                if (loaderObserver) {
                    loaderObserver.disconnect();
                    loaderObserver = null;
                }
            }
        },
        { immediate: true }
    );
    const resize = async () => {
        if (!ws) return;
        const t = ws.getCurrentTime?.() ?? 0;
        await createWS();
        try {
            ws.seekTo?.(t / (duration.value || 1));
        } catch {}
    };
    window.addEventListener("resize", resize);
    resizeHandler = resize;
});

onBeforeUnmount(() => {
    if (loaderObserver) {
        loaderObserver.disconnect();
    }
    try { window.removeEventListener("resize", resizeHandler); } catch {}
    try { waveEl.value?.removeEventListener("pointerdown", onPointerDown); } catch {}
    destroyWS();
});
watch(
    () => props.audio,
    (nv) => { if (nv) loadAudio(nv); }
);
watch(playbackRate, (nv) => ws?.setPlaybackRate?.(nv));
</script>

<style scoped>
.audio-row {
    min-inline-size: 0;
}
.ws-surface {
    inline-size: 100%;
    block-size: 100%;
    min-inline-size: 0;
    min-block-size: 0;
    display: block;
}

#waveform::part(cursor) {
    height: 14px;
    width: 14px;
    top: 0px;
    bottom: 0px;
    border-radius: 100%;
    @apply my-auto items-center;
}
.loading-equalizer {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 100%;
    gap: 3px;
}

.loading-equalizer span {
    display: inline-block;
    width: 5px;
    height: 32px;
    border-radius: 4px;
    background-color: #9ca3af;
    animation: loading-wave 1.2s infinite ease-in-out;
}

@keyframes loading-wave {
    0%,
    100% {
        transform: scaleY(0.2);
    }
    50% {
        transform: scaleY(1);
    }
}
</style>
