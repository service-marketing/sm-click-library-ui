<script setup>
import { computed, inject } from "vue";

const props = defineProps({
  hasUnread: {
    type: Object,
    default: () => ({ attendants: false, groups: false }),
  },
  currentState: { type: String, default: "" },
  searchQuery: { type: String, default: "" },
});

const emit = defineEmits(["update:currentState", "update:searchQuery"]);
const currentTheme = inject("currentTheme");

const isGroup = computed(() => props.currentState === "grupos");
const isAttendant = computed(() => props.currentState === "atendentes");

const getSearchPlaceholder = computed(() => {
  if (isGroup.value) return "Pesquise entre os grupos...";
  if (isAttendant.value) return "Pesquise entre os atendentes...";
  return "Pesquise...";
});

const buttons = [
  {
    label: "Atendentes",
    value: "atendentes",
    svg: '<svg class="size-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24"> <path fill-rule="evenodd" d="M12 4a4 4 0 1 0 0 8 4 4 0 0 0 0-8Zm-2 9a4 4 0 0 0-4 4v1a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-1a4 4 0 0 0-4-4h-4Z" clip-rule="evenodd"/> </svg>',
  },
  {
    label: "Grupos",
    value: "grupos",
    svg: '<svg class="size-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24"> <path fill-rule="evenodd" d="M12 6a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7Zm-1.5 8a4 4 0 0 0-4 4 2 2 0 0 0 2 2h7a2 2 0 0 0 2-2 4 4 0 0 0-4-4h-3Zm6.82-3.096a5.51 5.51 0 0 0-2.797-6.293 3.5 3.5 0 1 1 2.796 6.292ZM19.5 18h.5a2 2 0 0 0 2-2 4 4 0 0 0-4-4h-1.1a5.503 5.503 0 0 1-.471.762A5.998 5.998 0 0 1 19.5 18ZM4 7.5a3.5 3.5 0 0 1 5.477-2.889 5.5 5.5 0 0 0-2.796 6.293A3.501 3.501 0 0 1 4 7.5ZM7.1 12H6a4 4 0 0 0-4 4 2 2 0 0 0 2 2h.5a5.998 5.998 0 0 1 3.071-5.238A5.505 5.505 0 0 1 7.1 12Z" clip-rule="evenodd"/> </svg>',
  },
];
</script>

<template>
  <div class="header-buttons-container">
    <button
      v-for="btn in buttons"
      :key="btn.value"
      class="selector-button flex flex-col"
      :class="{ active: props.currentState === btn.value }"
      @click="$emit('update:currentState', btn.value)"
    >
      <span class="selector-label">
        <div v-html="btn.svg" />
        <span class="selector-text">{{ btn.label }}</span>

        <span
          v-if="hasUnread[btn.value] > 0"
          class="unread-dot"
          aria-label="Há mensagens não lidas"
        ></span>
      </span>
    </button>
  </div>

  <!-- Campo de busca -->
  <div class="p-2 flex items-center gap-2 relative">
    <svg
      style="left: 1rem"
      class="text-gray-500 size-4 absolute left-4 top-1/2 -translate-y-1/2"
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <path
        stroke="currentColor"
        stroke-linecap="round"
        stroke-width="2"
        d="m21 21-3.5-3.5M17 10a7 7 0 1 1-14 0 7 7 0 0 1 14 0Z"
      />
    </svg>

    <input
      style="padding-left: 2rem"
      :value="searchQuery"
      @input="emit('update:searchQuery', $event.target.value)"
      class="bg-base-300 w-full p-1 border-none focus:border-primary rounded-full placeholder:text-gray-500 text-sm"
      :class="[currentTheme === 'dark' ? 'text-black' : 'text-white']"
      :placeholder="getSearchPlaceholder"
    />
  </div>
</template>

<style scoped>
.header-buttons-container {
  @apply flex;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.selector-button {
  flex: 1;
  padding: 0.65rem 0.75rem;
  text-align: center;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  margin-bottom: -1px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  font-size: 0.85rem;
  border-radius: 0;
  opacity: 0.65;
}

.selector-button:hover {
  opacity: 0.9;
  background: rgba(59, 130, 246, 0.05);
}

.selector-label {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.selector-text {
  line-height: 1;
}

.selector-button.active {
  font-weight: 600;
  border-bottom: 2px solid #3b82f6;
  color: #3b82f6;
  opacity: 1;
  background: rgba(59, 130, 246, 0.06);
}

.unread-dot {
  width: 7px;
  height: 7px;
  border-radius: 9999px;
  background: #22c55e;
  box-shadow: 0 0 6px rgba(34, 197, 94, 0.55);
  animation: pulse-dot 2s ease-in-out infinite;
}

@keyframes pulse-dot {
  0%, 100% { box-shadow: 0 0 5px rgba(34, 197, 94, 0.5); }
  50% { box-shadow: 0 0 10px rgba(34, 197, 94, 0.85), 0 0 18px rgba(34, 197, 94, 0.3); }
}
</style>
