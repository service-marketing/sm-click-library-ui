<script setup>
import { ref, computed, defineProps, defineEmits } from "vue";
import { onClickOutside } from "@vueuse/core";

const props = defineProps({
  // --- Lista que será exibida e já selecionada ---
  modelValue: {
    type: Array,
    default: () => [],
  },
  // --- Lista de todos os departamentos ---
  departments: {
    type: Array,
    default: () => [],
    required: true,
  },
  // --- Label principal do dropdown ---
  placeholder: {
    type: String,
    default: "Selecione departamentos...",
  },
});

const emit = defineEmits(["update:modelValue"]);

const isOpen = ref(false);
const search = ref("");
const dropdownRef = ref(null);

// --- Fecha o dropdown ao clicar fora ---
onClickOutside(dropdownRef, () => (isOpen.value = false));

// --- Filtra os departamentos conforme a busca ---
const filteredDepartments = computed(() =>
  props.departments.filter((d) =>
    d.name.toLowerCase().includes(search.value.toLowerCase())
  )
);

// --- Alterna seleção do departamento ---
const toggleSelect = (item) => {
  const selected = [...props.modelValue];
  const index = selected.findIndex((x) => x.id === item.id);
  if (index === -1) {
    selected.push({ id: item.id, name: item.name });
  } else {
    selected.splice(index, 1);
  }
  emit("update:modelValue", selected);
};

// --- Mostra nomes selecionados ---
const selectedNames = computed(() => {
  return props.modelValue.map((d) => d.name).join(", ");
});
</script>

<template>
  <div class="relative w-full" ref="dropdownRef">
    <!-- Div de seleção -->
    <div
      @click="isOpen = !isOpen"
      class="flex flex-wrap items-center justify-between gap-2 bg-base-300 p-3 rounded-md border border-base-300 cursor-pointer"
    >
      <span v-if="!modelValue.length" class="text-gray-500 text-xs">
        {{ placeholder }}
      </span>

      <span class="text-gray-300 text-xs" v-else>
        Selecionados: <a class="text-green-500">{{ modelValue.length }}</a>
      </span>

      <svg
        :class="[
          'size-3.5 text-white transition duration-300',
          isOpen ? 'rotate-180' : '',
        ]"
        aria-hidden="true"
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        fill="none"
        viewBox="0 0 24 24"
      >
        <path
          stroke="currentColor"
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="m19 9-7 7-7-7"
        />
      </svg>
    </div>

    <!-- Dropdown -->
    <div
      v-if="isOpen"
      class="absolute z-10 mt-1.5 w-full bg-base-300 shadow-sm shadow-base-100 border border-base-300 rounded-md max-h-64 overflow-y-auto hide-scrollbar"
    >
      <div class="p-2 sticky top-0 bg-base-300">
        <input
          v-model="search"
          type="text"
          placeholder="Buscar..."
          class="w-full text-[10px] bg-base-200 rounded-md p-2 outline-none border-none focus:outline-none focus:ring-0 focus:shadow-none placeholder:text-gray-500"
        />
      </div>

      <button
        v-for="depart in filteredDepartments"
        :key="depart.id"
        :class="[
          modelValue.some((d) => d.id === depart.id)
            ? 'bg-green-500/30 hover:bg-green-500/50'
            : 'hover:bg-base-200',
          'flex items-center justify-between gap-2 px-3 py-2 cursor-pointer transition w-full',
        ]"
        @click="toggleSelect(depart)"
      >
        <span class="text-xs truncate max-w-32">{{ depart.name }}</span>

        <svg
          v-if="modelValue.some((d) => d.id === depart.id)"
          class="size-4 text-green-500"
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          fill="none"
          viewBox="0 0 24 24"
        >
          <path
            stroke="currentColor"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M5 11.917 9.724 16.5 19 7.5"
          />
        </svg>
      </button>

      <div
        v-if="!filteredDepartments.length"
        class="text-center text-gray-400 py-2"
      >
        <span class="text-xs">Nenhum resultado encontrado</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
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
