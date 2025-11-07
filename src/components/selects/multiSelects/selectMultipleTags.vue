<script setup>
import { ref, computed, onMounted } from "vue";
import api from "~/utils/api.js";
import { onClickOutside } from "@vueuse/core";
import { contact_tag } from "~/utils/systemUrls";
import InfiniteLoading from "v3-infinite-loading";
import { getContrastColor } from "~/utils/functions/getContrastColor.js";

const props = defineProps({
  // --- Lista que será exibida e já selecionada ---
  modelValue: {
    type: Array,
    default: () => [],
  },
  handlerGetTags: {
    type: Function,
    default: null,
  },
});

const emit = defineEmits(["update:modelValue"]);

const isOpen = ref(false);
const search = ref("");
const dropdownRef = ref(null);
const internalTags = ref([]);
const page = ref(1);

const nextPage = ref(null);
const previousPage = ref(null);

// --- Fecha o dropdown ao clicar fora ---
onClickOutside(dropdownRef, () => (isOpen.value = false));

// --- Filtra as Tags conforme a busca ---
const filteredTags = computed(() =>
  internalTags.value.filter((d) =>
    d.name.toLowerCase().includes(search.value.toLowerCase())
  )
);

// --- Alterna seleção das tags ---
const toggleSelect = (item) => {
  const selected = [...props.modelValue];
  const index = selected.findIndex((x) => x.id === item.id);
  if (index === -1) {
    selected.push({ id: item.id, name: item.name, color: item.color });
  } else {
    selected.splice(index, 1);
  }
  emit("update:modelValue", selected);
};

const mountUrl = (baseUrl, params) => {
  const paramsSearch = new URLSearchParams();
  const url = baseUrl;

  Object.keys(params).forEach((key) => paramsSearch.append(key, params[key]));
  return `${url}?${paramsSearch.toString()}`;
};

const getTags = async (params) => {
  try {
    const res = await api.get(
      mountUrl(contact_tag, { page: page.value, ...params })
    );
    const { results, next, previous } = res.data;

    nextPage.value = next;
    previousPage.value = previous;

    if (page.value === 1) {
      internalTags.value = results;
    } else {
      internalTags.value = [...internalTags.value, ...results];
    }
  } catch (error) {
    console.error(error);
  }
};

const isLoading = ref(false);

const loadMoreTags = async (state) => {
  if (isLoading.value) return; // impede chamadas duplicadas
  isLoading.value = true;

  try {
    await getTags();

    if (nextPage.value) {
      page.value++; // incrementa depois do carregamento
      state.loaded();
    } else {
      state.complete();
    }
  } catch (error) {
    console.error("Erro ao carregar tags:", error);
    state.complete();
  } finally {
    isLoading.value = false; // libera para a próxima chamada
  }
};

const filters = ref({ name: "" });
const itsSearching = ref(false);

let debounceTimer;
watch(
  filters,
  () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(async () => {
      const { name } = filters.value;
      page.value = 1;
      await getTags({ name: name.toString() });
    }, 800); // 500ms de atraso após parar de digitar
  },
  { deep: true }
);

onMounted(async () => {
  await getTags();
});
</script>

<template>
  <div class="relative w-full z-[9999]" ref="dropdownRef">
    <!-- Div de seleção -->
    <div
      @click="isOpen = !isOpen"
      class="flex flex-wrap items-center justify-between gap-2 bg-base-300 p-3 rounded-md border border-base-300 cursor-pointer"
    >
      <span v-if="!modelValue.length" class="text-gray-500 text-xs">
        Selecione suas etiquetas
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
      style="max-height: 10rem"
      class="absolute z-10 mt-1.5 w-full bg-base-300 shadow-sm shadow-base-100 border border-base-300 rounded-md overflow-y-auto hide-scrollbar"
    >
      <div class="p-2 sticky top-0 bg-base-300">
        <input
          v-model="filters.name"
          type="text"
          placeholder="Buscar..."
          class="w-full text-[10px] bg-base-200 rounded-md p-2 outline-none border-none focus:outline-none focus:ring-0 focus:shadow-none placeholder:text-gray-500"
        />
      </div>

      <button
        v-for="depart in filteredTags"
        :key="depart.id"
        :class="[
          modelValue.some((d) => d.id === depart.id)
            ? 'bg-green-500/30 hover:bg-green-500/50'
            : 'hover:bg-base-200',
          'flex items-center justify-between gap-2 px-3 py-2 cursor-pointer transition w-full',
        ]"
        @click="toggleSelect(depart)"
      >
        <section class="inline-flex">
          <svg
            class="size-6"
            aria-hidden="true"
            viewBox="0 0 3 97"
            :style="{ color: depart.color || '#ffff' }"
          >
            <path
              d="M49.9,0a17.1,17.1,0,0,0-12,5L5,37.9A17,17,0,0,0,5,62L37.9,94.9a17.1,17.1,0,0,0,12,5ZM25.4,59.4a9.5,9.5,0,1,1,9.5-9.5A9.5,9.5,0,0,1,25.4,59.4Z"
              fill="currentColor"
            />
          </svg>
          <span
            :style="{ backgroundColor: depart.color || '#ffff' }"
            class="text-xs truncate max-w-32 p-1 rounded-r-md"
            :class="getContrastColor(depart.color || '#ffff')"
            >{{ depart.name }}</span
          >
        </section>

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

      <div v-if="!filteredTags.length" class="text-center text-gray-400 py-2">
        <span class="text-xs">Nenhum resultado encontrado</span>
      </div>

      <InfiniteLoading
        v-if="nextPage"
        @infinite="loadMoreTags"
        class="p-3 bg-slate-800"
      >
        <template #spinner>
          <section class="w-full justify-center items-center flex">
            <div
              class="size-4 animate-spin rounded-full border-4 border-solid border-white border-t-transparent"
            />
          </section>
        </template>
      </InfiniteLoading>
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

.loader-select-tags {
  width: 15px;
  aspect-ratio: 1;
  background: #ffffff;
  border-radius: 50%;
  animation: l6 1s infinite linear alternate;
}
@keyframes l6 {
  0% {
    box-shadow: 15px 0, -25px 0;
  }
  50% {
    box-shadow: 15px 0, -15px 0;
  }
  100% {
    box-shadow: 25px 0, -15px 0;
  }
}
</style>
