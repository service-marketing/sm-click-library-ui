<script setup>
/**
 * CategoryBadge - Badge visual para categorias de templates WhatsApp
 *
 * Props:
 *   category    String   — Categoria do template (MARKETING, UTILITY, AUTHENTICATION)
 *   showIcon    Boolean  — Exibir ícone (default: true)
 */
import { computed } from "vue";

const props = defineProps({
  category: {
    type: String,
    required: true,
    validator: (value) =>
      ["MARKETING", "UTILITY", "AUTHENTICATION", "marketing", "utility", "authentication"].includes(
        value?.toLowerCase()
      ),
  },
  showIcon: {
    type: Boolean,
    default: true,
  },
});

const categoryLower = computed(() => props.category?.toLowerCase());

const categoryConfig = computed(() => {
  const configs = {
    marketing: {
      label: "Marketing",
      colorClass: "bg-sky-500/20 border border-sky-500/50 hover:border-sky-400 text-sky-400",
      icon: `<svg class="size-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
        <path fill-rule="evenodd" d="M18.458 3.11A1 1 0 0 1 19 4v16a1 1 0 0 1-1.581.814L12 16.944V7.056l5.419-3.87a1 1 0 0 1 1.039-.076ZM22 12c0 1.48-.804 2.773-2 3.465v-6.93c1.196.692 2 1.984 2 3.465ZM10 8H4a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h6V8Zm0 9H5v3a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-3Z" clip-rule="evenodd" />
      </svg>`,
    },
    utility: {
      label: "Utilidade",
      colorClass:
        "bg-purple-500/20 border dark:hover-text-purple-700 border-purple-500/50 hover:border-purple-400 text-purple-400",
      icon: `<svg class="size-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
        <path d="M11.209 3.816a1 1 0 0 0-1.966.368l.325 1.74a5.338 5.338 0 0 0-2.8 5.762l.276 1.473.055.296c.258 1.374-.228 2.262-.63 2.998-.285.52-.527.964-.437 1.449.11.586.22 1.173.75 1.074l12.7-2.377c.528-.1.418-.685.308-1.27-.103-.564-.636-1.123-1.195-1.711-.606-.636-1.243-1.306-1.404-2.051-.233-1.085-.275-1.387-.303-1.587-.009-.063-.016-.117-.028-.182a5.338 5.338 0 0 0-5.353-4.39l-.298-1.592Z" />
        <path fill-rule="evenodd" d="M6.539 4.278a1 1 0 0 1 .07 1.412c-1.115 1.23-1.705 2.605-1.83 4.26a1 1 0 0 1-1.995-.15c.16-2.099.929-3.893 2.342-5.453a1 1 0 0 1 1.413-.069Z" clip-rule="evenodd" />
        <path d="M8.95 19.7c.7.8 1.7 1.3 2.8 1.3 1.6 0 2.9-1.1 3.3-2.5l-6.1 1.2Z" />
      </svg>`,
    },
    authentication: {
      label: "Autenticação",
      colorClass:
        "bg-amber-500/20 border border-amber-500/50 hover:border-amber-400 text-amber-400",
      icon: `<svg class="size-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
        <path fill-rule="evenodd" d="M8 10V7a4 4 0 1 1 8 0v3h1a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h1Zm2-3a2 2 0 1 1 4 0v3h-4V7Zm2 6a1 1 0 0 1 1 1v3a1 1 0 1 1-2 0v-3a1 1 0 0 1 1-1Z" clip-rule="evenodd"/>
      </svg>`,
    },
  };

  return configs[categoryLower.value] || configs.marketing;
});
</script>

<template>
  <div
    class="gap-2 font-semibold flex justify-center items-center min-w-19 lg:min-w-32 w-0 p-1.5 rounded-lg transition-colors"
    :class="categoryConfig.colorClass"
  >
    <div v-if="showIcon" class="flex-shrink-0 hidden lg:block" v-html="categoryConfig.icon"></div>
    <span class="text-xs">{{ categoryConfig.label }}</span>
  </div>
</template>
