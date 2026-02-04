<script setup>
import { computed } from "vue";
/**
 * 📋 Descrição:
 * Componente que exibe as tags associadas a um cliente em formato de etiquetas coloridas.
 *
 * 💡 Uso:
 * <TagView
 *  :clients="client"
 * />
 */
import { getContrastColor } from "../../utils/functions/getContrastColor.js";

const props = defineProps({
  // --- lista de clientes ---
  clients: {
    type: Object,
    required: true,
  },
});

// --- Computed: mostra as 4 primeiras tags ---
const visibleTags = computed(() => props.clients?.tags?.slice(0, 4) || []);
</script>

<template>
  <section class="flex justify-center items-center">
    <!-- Layout principal - exibe apenas as 4 primeiras tags -->
    <Popper
      class="tag-view-theme"
      arrow
      hover
      v-for="(tag, index) in clients.tags.slice(0, 4)"
      :key="index"
    >
      <div :class="['flex', getContrastColor(tag.color)]">
        <!-- SVG da tag -->
        <svg
          class="svg-list-tag"
          aria-hidden="true"
          viewBox="0 0 30 100"
          :style="{ color: tag.color || '#fff' }"
        >
          <path
            d="M49.9,0a17.1,17.1,0,0,0-12,5L5,37.9A17,17,0,0,0,5,62L37.9,94.9a17.1,17.1,0,0,0,12,5ZM25.4,59.4a9.5,9.5,0,1,1,9.5-9.5A9.5,9.5,0,0,1,25.4,59.4Z"
            fill="currentColor"
          />
        </svg>
        <!-- Primeira letra da tag -->
        <span
          :style="{ backgroundColor: tag.color || '#fff' }"
          class="w-full ml-[-0.10rem] rounded-r-md inline-flex items-center justify-center px-1 border-b-2 border-gray-900"
        >
          <p class="text-[8px] font-bold">
            {{ tag.name.charAt(0).toUpperCase() }}
          </p>
        </span>
      </div>

      <!-- Conteúdo do Popper -->
      <template #content>
        <p class="tag-view-popper-content-text">{{ tag.name }}</p>
      </template>
    </Popper>

    <!-- Layout secundário - exibe a lista de tags -->
    <Popper arrow hover class="tag-view-theme" v-if="clients.tags.length > 4">
      <div class="flex">
        <!-- SVG da tag -->
        <svg
          class="svg-list-tag"
          aria-hidden="true"
          viewBox="0 0 25 100"
          :style="{ color: '#d1d5db' }"
        >
          <path
            d="M49.9,0a17.1,17.1,0,0,0-12,5L5,37.9A17,17,0,0,0,5,62L37.9,94.9a17.1,17.1,0,0,0,12,5ZM25.4,59.4a9.5,9.5,0,1,1,9.5-9.5A9.5,9.5,0,0,1,25.4,59.4Z"
            fill="currentColor"
          />
        </svg>

        <!-- Quantas tags tem além das 4 primeiras -->
        <span
          :style="{ backgroundColor: '#d1d5db' }"
          class="w-full ml-[-0.5rem] rounded-r-md inline-flex items-center justify-center p-0.5 py-0 border-b-2 border-gray-900"
        >
          <p class="text-[8px] text-black font-bold">
            +{{ clients.tags.length - 4 }}
          </p>
        </span>
      </div>

      <!-- Lista de tags -->
      <template #content>
        <section class="max-h-64 overflow-y-auto hide-scrollbar">
          <div class="flex flex-col gap-2">
            <div
              v-for="tag in clients.tags"
              :key="tag.id || tag.name"
              class="relative inline-flex items-center rounded-md overflow-hidden"
            >
              <!-- SVG da tag -->
              <svg
                class="size-6"
                aria-hidden="true"
                viewBox="0 0 75 100"
                :style="{ color: tag.color || '#fff' }"
              >
                <path
                  d="M49.9,0a17.1,17.1,0,0,0-12,5L5,37.9A17,17,0,0,0,5,62L37.9,94.9a17.1,17.1,0,0,0,12,5ZM25.4,59.4a9.5,9.5,0,1,1,9.5-9.5A9.5,9.5,0,0,1,25.4,59.4Z"
                  fill="currentColor"
                />
              </svg>

              <!-- Nome da Tag -->
              <span
                class="p-0.5 w-full text-sm font-semibold truncate text-start -ml-2"
                :class="getContrastColor(tag.color)"
                :style="[
                  'max-width: 12rem',
                  { background: tag.color || '#fff' },
                ]"
              >
                <p class="tag-view-popper-content-text">{{ tag.name }}</p>
              </span>
            </div>
          </div>
        </section>
      </template>
    </Popper>

    <!-- fallback caso não haja tags -->
    <span v-if="!clients.tags || clients.tags.length === 0">-</span>
  </section>
</template>

<style scoped>
/* --- Layout principal --- */
.tag-list {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
}

.svg-list-tag {
  width: 1.25rem;
  height: 1.25rem;
  margin-left: -0.5rem;
}

.tag-view-theme {
  --popper-theme-background-color: #111b21;
  --popper-theme-background-color-hover: #111b21;
  --popper-theme-text-color: #ffffff;
  --popper-theme-border-width: 0px;
  --popper-theme-border-style: solid;
  --popper-theme-border-radius: 6px;
  --popper-theme-padding: 8px;
  --popper-theme-box-shadow: 0 6px 30px -6px rgba(35, 99, 3, 0.25);
}

.tag-view-popper-content-text {
  max-width: 8rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 0.675rem;
  line-height: 1.25rem;
  @apply hover:scale-105 ease-in-out transition-all;
}

.hide-scrollbar {
  -ms-overflow-style: none; /* IE 10+ */
  scrollbar-width: none; /* Firefox */
}

/* --- Chrome, Edge (Blink), Safari, Opera --- */
.hide-scrollbar::-webkit-scrollbar {
  display: none;
  width: 0;
  height: 0;
}
</style>
