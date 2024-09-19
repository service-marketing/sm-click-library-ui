<template>
  <div class="text-center">
    <section class="flex justify-center p-2 gap-2">
      <div class="bg-base-200 rounded-lg p-2">
        <img
          :class="setDimensions"
          class="rounded-md"
          v-if="base64"
          :src="base64"
          alt="QRCode"
        />
        <div
          v-else
          :class="setDimensions"
          class="items-center justify-center inline-flex"
        >
          <div class="loader"></div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  base64: {
    type: String,
    default: null,
  },
  dimensions: {
    type: Array,
    default: [64, 64],
  },
});

const setDimensions = computed(() => {
  return `w-${props.dimensions[0]} h-${props.dimensions[1]}`;
});
</script>

<style scoped>
</style>