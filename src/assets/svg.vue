<script setup>
defineProps({
  svgContent: {
    type: String,
    required: true,
  },
});
</script>

<template>
  <div v-html="svgContent"></div>
</template>
