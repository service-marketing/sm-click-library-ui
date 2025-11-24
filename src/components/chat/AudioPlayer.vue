<template>
  <div class="audio-player hover:bg-base-100">
    <!-- Play button -->
    <button
      @click.stop="togglePlay"
      class="audio-play-btn hover:bg-base-100"
      title="Reproduzir"
      :disabled="isLoading || isBuffering"
      :style="getPlayButtonStyle()"
    >
      <!-- Spinner while loading or buffering -->
      <svg
        v-if="isLoading || isBuffering"
        class="audio-play-spinner"
        :style="{ color: getTypeColor() }"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <circle cx="12" cy="12" r="10" stroke-width="4" stroke-opacity="0.2" />
        <path d="M4 12a8 8 0 018-8" stroke-width="4" stroke-linecap="round" />
      </svg>

      <svg
        v-else-if="!isPlaying"
        :style="{ color: getTypeColor() }"
        xmlns="http://www.w3.org/2000/svg"
        fill="currentColor"
        viewBox="0 0 24 24"
      >
        <path d="M8 5v14l11-7z" />
      </svg>
      <svg
        v-else
        :style="{ color: getTypeColor() }"
        xmlns="http://www.w3.org/2000/svg"
        fill="currentColor"
        viewBox="0 0 24 24"
      >
        <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
      </svg>
    </button>

    <!-- Audio info -->
    <div class="audio-player-info">
      <!-- Title -->
      <div class="audio-player-title" :style="{ color: getTypeColor() }">
        {{ label }}
      </div>
      <!-- Progress bar with time -->
      <div class="audio-progress-container">
        <div
          class="audio-progress-track"
          :style="{ backgroundColor: `${getTypeColor()}20` }"
        >
          <!-- Progress fill -->
          <div
            class="audio-progress-fill"
            :style="{
              width: duration > 0 ? `${(currentTime / duration) * 100}%` : '0%',
              backgroundColor: getTypeColor(),
            }"
          />
          <!-- Input overlay -->
          <input
            type="range"
            class="audio-progress-input"
            min="0"
            :max="duration"
            :value="currentTime"
            @input.stop="seek"
            :disabled="isLoading || isBuffering"
          />
        </div>
      </div>
    </div>

    <!-- Duration with fixed width -->
    <span class="audio-duration">
      <template v-if="isLoading || isBuffering">
        <span class="align-middle">-- : --</span>
      </template>
      <template v-else>
        {{ formatDuration(currentTime) }} : {{ formatDuration(duration) }}
      </template>
    </span>

    <!-- Download button -->
    <button
      @click.stop="downloadAudio"
      class="audio-download-btn hover:bg-primary_alt"
      title="Baixar"
    >
      <svg
        :style="{ color: getTypeColor() }"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        stroke-width="2"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
        />
      </svg>
    </button>

    <!-- Hidden audio element -->
    <audio
      ref="audioElement"
      :src="src"
      @loadstart="onLoadStart"
      @loadedmetadata="onLoadedMetadata"
      @canplay="onCanPlay"
      @playing="onPlaying"
      @waiting="onWaiting"
      @timeupdate="onTimeUpdate"
      @ended="onEnded"
      @error="onError"
      preload="metadata"
    />
  </div>
</template>

<script setup>
import { ref, onUnmounted, watch } from "vue";

const emit = defineEmits(["play-start", "play-pause"]);

const props = defineProps({
  src: {
    type: String,
    required: true,
  },
  label: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
    validator: (value) => ["client", "attendant", "general"].includes(value),
  },
  activeSrc: {
    type: String,
    required: false,
  },
});

const audioElement = ref(null);
const isPlaying = ref(false);
const currentTime = ref(0);
const duration = ref(0);
const isLoading = ref(false);
const isBuffering = ref(false);

function togglePlay() {
  if (!audioElement.value) return;
  if (isPlaying.value) {
    audioElement.value.pause();
    isPlaying.value = false;
    emitPlayPause();
  } else {
    emitPlayStart();

    if (!audioElement.value) return;
    isBuffering.value = true;
    const playPromise = audioElement.value.play();
    if (playPromise && typeof playPromise.then === "function") {
      playPromise
        .then(() => {
          isBuffering.value = false;
          isPlaying.value = true;
        })
        .catch((err) => {
          console.error("Audio play failed:", err);
          isBuffering.value = false;
          isPlaying.value = false;
        });
    } else {
      isBuffering.value = false;
      isPlaying.value = true;
    }
  }
}

function seek(event) {
  if (!audioElement.value) return;
  audioElement.value.currentTime = event.target.value;
}

function onLoadedMetadata() {
  if (!audioElement.value) return;
  duration.value = audioElement.value.duration || 0;
}

function onLoadStart() {
  isLoading.value = true;
}

function onCanPlay() {
  isLoading.value = false;
}

function onPlaying() {
  isBuffering.value = false;
  isPlaying.value = true;
}

function onWaiting() {
  isBuffering.value = true;
}

function onError(event) {
  console.error("Audio error:", event);
  isLoading.value = false;
  isBuffering.value = false;
  isPlaying.value = false;
}

function onTimeUpdate() {
  if (!audioElement.value) return;
  currentTime.value = audioElement.value.currentTime;
}

function onEnded() {
  isPlaying.value = false;
  currentTime.value = 0;
  emitPlayPause();
}

function downloadAudio() {
  window.open(props.src, "_blank");
}

function formatDuration(seconds) {
  if (!seconds || isNaN(seconds)) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

function getTypeColor() {
  switch (props.type) {
    case "client":
      return "#22d3ee";
    case "attendant":
      return "#14b8a6";
    case "general":
      return "#0ea5e9";
    default:
      return "#9ca3af";
  }
}

function getPlayButtonStyle() {
  return {
    backgroundColor: `${getTypeColor()}20`,
    color: getTypeColor(),
  };
}

function getProgressStyle() {
  return {
    background: "transparent",
  };
}

function emitPlayStart() {
  emit("play-start", props.src);
}

function emitPlayPause() {
  emit("play-pause", props.src);
}

watch(
  () => props.activeSrc,
  (newVal) => {
    if (!newVal) return;
    if (newVal !== props.src && isPlaying.value && audioElement.value) {
      audioElement.value.pause();
      isPlaying.value = false;
    }
  },
);

onUnmounted(() => {
  if (audioElement.value) {
    audioElement.value.pause();
    audioElement.value.src = "";
  }
});
</script>

<style scoped>
.audio-player {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.25rem;
  padding-right: 0.25rem;
  transition: background-color 0.2s;
}

.audio-play-btn {
  flex-shrink: 0;
  padding: 0.25rem;
  border-radius: 9999px;
  transition: all 0.2s;
  position: relative;
  background-color: transparent;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.audio-play-btn svg {
  width: 1rem;
  height: 1rem;
}

.audio-play-spinner {
  animation: spin 1s linear infinite;
}

.audio-player-info {
  min-width: 0;
  flex: 1;
}

.audio-player-title {
  font-size: 0.75rem;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.audio-progress-container {
  display: flex;
  align-items: center;
  padding-top: 0.25rem;
  padding-bottom: 0.25rem;
}

.audio-progress-track {
  position: relative;
  flex: 1;
  height: 0.25rem;
  border-radius: 9999px;
  overflow: hidden;
}

.audio-progress-fill {
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  border-radius: 9999px;
  transition: width 0.1s;
}

.audio-progress-input {
  position: absolute;
  left: 0;
  top: 50%;
  width: 100%;
  height: 0.125rem;
  transform: translateY(-50%);
  -webkit-appearance: none;
  appearance: none;
  background: transparent;
  cursor: pointer;
  z-index: 5;
}

.audio-progress-input:disabled {
  cursor: not-allowed;
}

.audio-duration {
  font-size: 0.75rem;
  opacity: 0.6;
  flex-shrink: 0;
  font-variant-numeric: tabular-nums;
}

.audio-download-btn {
  flex-shrink: 0;
  padding: 0.25rem;
  border-radius: 0.25rem;
  transition: background-color 0.2s;
  background-color: transparent;
  border: none;
  cursor: pointer;
}

.audio-download-btn svg {
  width: 0.875rem;
  height: 0.875rem;
}

/* Animações */
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* Range input styles */
input[type="range"] {
  -webkit-appearance: none;
  appearance: none;
  background: transparent;
  width: 100%;
}

input[type="range"]::-webkit-slider-runnable-track {
  background: transparent;
  height: 2px;
  border: none;
}

input[type="range"]::-moz-range-track {
  background: transparent;
  height: 2px;
  border: none;
}

input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: currentColor;
  cursor: pointer;
  opacity: 0.7;
  margin-top: -3px;
}

input[type="range"]::-webkit-slider-thumb:hover {
  opacity: 1;
}

input[type="range"]::-moz-range-thumb {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: currentColor;
  cursor: pointer;
  border: none;
  opacity: 0.7;
  margin-top: -3px;
}

input[type="range"]::-moz-range-thumb:hover {
  opacity: 1;
}
</style>
