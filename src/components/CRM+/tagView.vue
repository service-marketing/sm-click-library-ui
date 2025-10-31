<template>
  <section class="flex justify-center items-center">
    <Popper
      class="delPopper-theme"
      arrow
      hover
      v-for="(tag, index) in clients.tags.slice(0, 4)"
      :key="index"
    >
      <div
        :class="[
          'flex hover:scale-105 ease-in-out transition-all',
          getContrastColor(tag.color),
        ]"
      >
        <svg
          class="svg-list-tag"
          aria-hidden="true"
          viewBox="0 0 30 100"
          :style="{ color: tag.color || '#1ceb5a' }"
        >
          <path
            d="M49.9,0a17.1,17.1,0,0,0-12,5L5,37.9A17,17,0,0,0,5,62L37.9,94.9a17.1,17.1,0,0,0,12,5ZM25.4,59.4a9.5,9.5,0,1,1,9.5-9.5A9.5,9.5,0,0,1,25.4,59.4Z"
            fill="currentColor"
          />
        </svg>
        <span
          :style="{ backgroundColor: tag.color || '#ffff' }"
          class="w-full ml-[-0.10rem] rounded-r-md inline-flex items-center justify-center px-1 py-0.5 border-b-2 border-gray-900"
        >
          <p class="text-[8px] font-bold">
            {{ tag.name.charAt(0).toUpperCase() }}
          </p>
        </span>
      </div>

      <template #content>
        <p class="max-w-32 truncate">{{ tag.name }}</p>
      </template>
    </Popper>

    <Popper arrow hover class="delPopper-theme" v-if="clients.tags.length > 4">
      <div class="flex hover:scale-105 ease-in-out transition-all">
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
        <span
          :style="{ backgroundColor: '#d1d5db' }"
          class="w-full ml-[-0.5rem] rounded-r-md inline-flex items-center justify-center p-0.5 border-b-2 border-gray-900"
        >
          <p class="text-[8px] text-black font-bold">
            +{{ clients.tags.length - 4 }}
          </p>
        </span>
      </div>

      <template #content>
        <section class="max-h-48 overflow-y-auto hide-scrollbar">
          <div class="flex flex-col gap-2">
            <div
              v-for="tag in clients.tags"
              :key="tag.id || tag.name"
              class="relative inline-flex items-center rounded-md overflow-hidden"
            >
              <!-- Ícone -->
              <svg
                class="size-6 -ml-2"
                aria-hidden="true"
                viewBox="0 0 65 100"
                :style="{ color: tag.color || '#1ceb5a' }"
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
                :title="tag.name"
              >
                <p class="truncate">{{ tag.name }}</p>
              </span>
            </div>
          </div>
        </section>
      </template>
    </Popper>
    <span v-if="!clients.tags || clients.tags.length === 0">-</span>
  </section>
</template>

<script setup>
import { getContrastColor } from "../../utils/functions/getContrastColor.js";

// --- Props ---
const props = defineProps({
  clients: {
    type: Object,
    required: true,
  },
});

// --- Computed: mostra as 4 primeiras tags ---
const visibleTags = computed(() => props.clients?.tags?.slice(0, 4) || []);
</script>

<style scoped>
/* --- Layout principal --- */
.tag-list {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
}

.svg-list-tag {
  width: 1.55rem;
  height: 1.55rem;
  margin-left: -0.5rem;
}

.delPopper-theme {
  --popper-theme-background-color: #111b21;
  --popper-theme-background-color-hover: #111b21;
  --popper-theme-text-color: #ffffff;
  --popper-theme-border-width: 0px;
  --popper-theme-border-style: solid;
  --popper-theme-border-radius: 6px;
  --popper-theme-padding: 8px;
  --popper-theme-box-shadow: 0 6px 30px -6px rgba(35, 99, 3, 0.25);
}

.more-tag {
  padding-left: 0.125rem;
  margin-right: -0.5rem;
  padding-right: 0.125rem;
  justify-content: center;
  align-items: center;
  display: inline-flex;
  width: 100%;
  background-color: #d1d5db;
  border-top-right-radius: 0.375rem;
  border-bottom-right-radius: 0.375rem;
  border-bottom-width: 2px;
  border-color: #111827;
}

/* --- Estilo base dos poppers --- */
.tag-popper {
  transition: transform 0.2s ease;
}
.tag-popper:hover {
  /* transform: scale(1.05); */
}

/* --- Estrutura de cada tag --- */
.tag-item {
  display: flex;
  align-items: center;
  margin-right: -0.5rem;
}

/* --- Ícone da tag --- */
.tag-icon {
  width: 1.25rem;
  height: 1.25rem;
}

/* --- Letra curta da tag --- */
.tag-short {
  font-size: 0.5rem;
  padding: 0 0.25rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 0 0.125rem 0.125rem 0;
  color: #fff;
}

/* --- Versão cinza do "+N" --- */
.tag-more .tag-icon {
  color: #d1d5db;
}
.tag-short--more {
  background-color: #d1d5db;
  color: #000;
}

/* --- Popover das tags extras --- */
.tag-list--popover {
  max-height: 10rem;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 0.25rem;
}

/* --- Cada item do popover --- */
.tag-item--full {
  display: flex;
  align-items: center;
  border-radius: 0.25rem;
  overflow: hidden;
}

/* --- Ícone dentro do popover --- */
.tag-icon--full {
  width: 1.5rem;
  height: 1.5rem;
  margin-left: -0.25rem;
}

/* --- Nome da tag no popover --- */
.tag-name {
  padding: 0.25rem 0.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: #fff;
  width: 100%;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
}

/* --- Classe para esconder a barra de rolagem, mantendo a rolagem funcional --- */
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
