<template>
  <div
    class="avatar bg-[#404857] shadow shadow-gray-900 dark:shadow-gray-700 dark:bg-gray-300 text-gray-100 dark:text-gray-500"
    :class="style"
  >
    <!-- Se houver conteúdo slot, usa o slot -->
    <slot v-if="$slots.default"></slot>
    <!-- Senão, se houver URL, mostra a imagem -->
    <img v-else-if="url" style="object-fit: scale-down" :src="url" />
    <!-- Senão, mostra o SVG padrão de pessoa -->
    <svg
      v-else
      style="padding-top: 0.5rem"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      stroke-width="1.5"
      stroke="currentColor"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
      />
    </svg>
  </div>
</template>

<script setup>
const props = defineProps({
  url: { type: String },
  style: { type: String, default: 'size-10' },
});
</script>

<style scoped>
.avatar {
  border-radius: 100%;
  overflow: hidden;
}
</style>
