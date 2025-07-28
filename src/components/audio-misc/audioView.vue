<template>
  <div
    class="flex size-full min-w-[220px] select-none items-center justify-center space-x-2 pr-2 text-gray-200 dark:text-gray-700"
  >
    <section v-if="!isOwner" class="w-20">
      <main v-show="!isPlaying" class="fade relative">
        <Avatar :icon-url="avatar" class="xl:size-[50px]" />
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="currentColor"
          class="absolute -bottom-1 -right-1 w-5 rounded-full bg-emerald-500 p-1 text-white"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z"
          />
        </svg>
      </main>
      <div
        v-show="isPlaying"
        class="fade header relative flex size-12 cursor-pointer items-center justify-center rounded-full border-2 border-light dark:border-light"
        @click="changeValue"
      >
        {{ playbackRate.toFixed(1) }}x
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="currentColor"
          class="absolute bottom-[-11px] left-[28px] w-5 rounded-full bg-emerald-500 p-[4px] text-white"
          viewBox="0 0 16 16"
        >
          <path
            d="M12.5 4a.5.5 0 0 0-1 0v3.248L5.233 3.612C4.693 3.3 4 3.678 4 4.308v7.384c0 .63.692 1.01 1.233.697L11.5 8.753V12a.5.5 0 0 0 1 0V4z"
          />
        </svg>
      </div>
    </section>
    <button class="" @click="playPause">
      <svg
        v-if="!isPlaying"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke-width="1.5"
        stroke="currentColor"
        class="w-8 fill-current"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z"
        />
      </svg>
      <svg
        v-if="isPlaying"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke-width="1.5"
        stroke="currentColor"
        class="w-10"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M15.75 5.25v13.5m-7.5-13.5v13.5"
        />
      </svg>
    </button>
    <section class="flex h-20 w-full items-center justify-center text-center">
      <div
        v-if="isLoading"
        class="loader-dots relative mx-auto flex h-5 w-full items-center justify-center"
      >
        <div class="absolute ml-5 mt-1 size-3 rounded-full bg-[#0FB2D6]"></div>
        <div
          class="absolute top-0 ml-5 mt-1 size-3 rounded-full bg-[#0FB2D6]"
        ></div>
        <div
          class="absolute top-0 ml-5 mt-1 size-3 rounded-full bg-[#0FB2D6]"
        ></div>
        <div
          class="absolute top-0 ml-5 mt-1 size-3 rounded-full bg-[#0FB2D6]"
        ></div>
      </div>
      <div
        v-show="!isLoading"
        id="waveform"
        ref="waveform"
        style="display: block"
        class="w-full"
      ></div>
    </section>
    <section v-if="isOwner" class="w-24 pl-3">
      <main v-show="!isPlaying" class="fade relative">
        <Avatar :icon-url="avatar" class="xl:size-[50px]" />
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="currentColor"
          class="absolute -bottom-2 -left-2 w-7 rounded-full bg-emerald-500 p-1 text-white"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z"
          />
        </svg>
      </main>
      <div
        v-show="isPlaying"
        class="fade header relative flex size-12 cursor-pointer items-center justify-center rounded-full border-2 border-light dark:border-light"
        @click="changeValue"
      >
        {{ playbackRate.toFixed(1) }}x
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="currentColor"
          class="absolute bottom-[-10px] right-[26px] w-7 rounded-full bg-emerald-500 p-[4px] text-white"
          viewBox="0 0 16 16"
        >
          <path
            d="M12.5 4a.5.5 0 0 0-1 0v3.248L5.233 3.612C4.693 3.3 4 3.678 4 4.308v7.384c0 .63.692 1.01 1.233.697L11.5 8.753V12a.5.5 0 0 0 1 0V4z"
          />
        </svg>
      </div>
    </section>
  </div>
</template>

<script>
import WaveSurfer from "wavesurfer.js";
import Avatar from "../intern-chat/Avatar.vue";
// import { useGlobalStore } from "../stores/globalStore";

export default {
  components: {
    Avatar,
  },
  props: {
    audio: {
      type: String,
      required: true,
    },
    avatar: {
      type: [String, null],
      required: true,
    },
    isOwner: {
      type: Boolean,
    },
  },
  emits: ["duration", "currentTime"],
  data() {
    return {
      wavesurfer: null,
      audioData: null,
      isPlaying: false,
      duration: 0,
      currentTime: 0,
      isLoading: true,
      playbackRate: 1,
    };
  },
  watch: {
    audio(newAudio) {
      this.loadAudio(newAudio);
    },
  },
  mounted() {
    this.wavesurfer = WaveSurfer.create({
      container: this.$refs.waveform,
      //   waveColor: useGlobalStore().themeMode ? "#1ca3d9" : "#165CF3",
      progressColor: "#AFAFAF",
      height: 70,
      cursorWidth: 14,
      cursorColor: "#fff",
      barWidth: 4,
      barRadius: 30,
      barHeight: 0.7,
      barGap: 3,
      hideScrollbar: true,
    });

    this.wavesurfer.on("ready", () => {
      this.duration = this.wavesurfer.getDuration(); // Update duration when audio is ready
      this.$emit("duration", this.duration);
      this.isLoading = false;
    });

    this.wavesurfer.on("play", () => {
      this.isPlaying = true;
    });

    this.wavesurfer.on("pause", () => {
      this.isPlaying = false;
    });

    this.wavesurfer.on("finish", () => {
      this.isPlaying = false;
    });

    this.wavesurfer.on("audioprocess", () => {
      this.currentTime = this.wavesurfer.getCurrentTime(); // Update current time when audio position changes
      this.$emit("currentTime", this.currentTime);
    });

    this.loadAudio(this.audio);
  },
  methods: {
    changeValue() {
      if (this.playbackRate === 2) {
        this.playbackRate = 1;
      } else {
        this.playbackRate += 0.5;
      }
      this.changePlaybackRate();
    },
    changePlaybackRate() {
      this.wavesurfer.setPlaybackRate(this.playbackRate);
    },
    loadAudio(audio) {
      if (this.isBase64(audio)) {
        const blob = this.base64ToBlob(audio);
        this.wavesurfer.loadBlob(blob);
      } else {
        this.wavesurfer.load(audio);
      }
    },
    isBase64(str) {
      try {
        return btoa(atob(str)) == str;
      } catch (err) {
        return false;
      }
    },
    base64ToBlob(base64) {
      const byteCharacters = atob(base64);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      return new Blob([byteArray], { type: "audio/mp3" });
    },
    playPause() {
      this.wavesurfer.playPause();
    },
  },
};
</script>

<style>
/* CSS */
#waveform ::part(cursor) {
  height: 14px;
  top: 0px;
  bottom: 0px;
  border-radius: 100%;
  @apply my-auto items-center;
}

#waveform ::part(progress-bar) {
  background-color: #0891fc;
  border-radius: 100%;
}

.loader-dots div {
  animation-timing-function: cubic-bezier(0, 1, 1, 0);
}

.loader-dots div:nth-child(1) {
  left: 8px;
  animation: loader-dots1 0.6s infinite;
}

.loader-dots div:nth-child(2) {
  left: 8px;
  animation: loader-dots2 0.6s infinite;
}

.loader-dots div:nth-child(3) {
  left: 32px;
  animation: loader-dots2 0.6s infinite;
}

.loader-dots div:nth-child(4) {
  left: 56px;
  animation: loader-dots3 0.6s infinite;
}

@keyframes loader-dots1 {
  0% {
    transform: scale(0);
  }

  100% {
    transform: scale(1);
  }
}

@keyframes loader-dots3 {
  0% {
    transform: scale(1);
  }

  100% {
    transform: scale(0);
  }
}

@keyframes loader-dots2 {
  0% {
    transform: translate(0, 0);
  }

  100% {
    transform: translate(24px, 0);
  }
}

/* #waveform ::part(cursor):after {
    content: '🏄';
    font-size: 1.5em;
    position: absolute;
    left: 0;
    top: -28px;
    transform: translateX(-50%);
} */
</style>
