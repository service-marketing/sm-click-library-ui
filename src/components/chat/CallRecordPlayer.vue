<template>
  <div @click.stop="null" class="call-record-player bg-base-200">
    <AudioPlayer
      v-if="recordMetadata?.urls?.general"
      :src="recordMetadata.urls.general"
      label="Conversa"
      type="general"
      :active-src="activeSrc"
      @play-start="handlePlayStart"
      @play-pause="handlePlayPause"
    />
  </div>
</template>

<script setup>
import { ref } from "vue";
import AudioPlayer from "./AudioPlayer.vue";

defineProps({
  recordMetadata: {
    type: Object,
    required: true,
  },
});

defineEmits(["close"]);

const activeSrc = ref(null);

function handlePlayStart(src) {
  activeSrc.value = src;
}

function handlePlayPause(src) {
  if (activeSrc.value === src) activeSrc.value = null;
}
</script>

<style scoped>
.call-record-player {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  border-radius: 0.375rem;
  padding-top: 0.125rem;
  padding-bottom: 0.125rem;
  padding-left: 2px;
  padding-right: 2px;
  border-radius: 8px;
}

.call-record-player > * + * {
  margin-top: 0.25rem;
}
</style>
