<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from "vue";
import api from "~/utils/api.js";
import { contact_tag } from "~/utils/systemUrls";
import InfiniteLoading from "v3-infinite-loading";
import { getContrastColor } from "~/utils/functions/getContrastColor.js";

const props = defineProps({
  // --- Lista que será exibida e já selecionada ---
  modelValue: {
    type: Array,
    default: () => [],
  },
  // --- Define se permite múltiplas seleções. Quando false, funciona como single-select ---
  multiple: {
    type: Boolean,
    default: true,
  },
  // --- Em modo single, fecha o dropdown imediatamente após selecionar ---
  closeOnSelectSingle: {
    type: Boolean,
    default: true,
  },
  // --- Define o seletor CSS do container onde o dropdown será teletransportado ---
  // --- quando null mantém comportamento antigo (absolute dentro do container) ---
  teleportTo: {
    type: String,
    default: null,
  },
  // --- lista de todas as tags em geral ---
  allTags: {
    type: Object,
    // Pode vir como objeto paginado { results, next, previous } ou como Array direto
    default: () => ({}),
  },
});

const emit = defineEmits(["update:modelValue"]);

const isOpen = ref(false);
const search = ref("");
const dropdownRef = ref(null); // container original (não teleportado)
const teleportedRef = ref(null); // container quando teleportado
const triggerRef = ref(null); // ref da área clicável (campo principal)
const dropdownStyle = ref({}); // estilos calculados quando usa teleport
const internalTags = ref([]);
const page = ref(1);
const nextPage = ref(null);
const previousPage = ref(null);
const isLoading = ref(false);
const listeners = [];
const filters = ref({ name: "" });
const itsSearching = ref(false);

// --- Primeiro selecionado (modo single) ---
const firstSelected = computed(() => props.modelValue[0] || null);

// --- Fecha o dropdown ao clicar fora (custom p/ suportar teleport) ---
const handleOutside = (e) => {
  if (!isOpen.value) return;
  const target = e.target;
  // Se o clique está dentro de qualquer um dos containers, não fecha
  if (
    triggerRef.value?.contains(target) ||
    dropdownRef.value?.contains(target) ||
    teleportedRef.value?.contains(target)
  ) {
    return;
  }
  isOpen.value = false;
};

// --- Calcula posição absoluta (fixed) para o dropdown quando teletransportado ---
const updatePosition = () => {
  if (!props.teleportTo || !triggerRef.value) return;
  const rect = triggerRef.value.getBoundingClientRect();
  dropdownStyle.value = {
    position: "fixed", // evita ser afetado por scroll de ancestors
    top: `${rect.bottom + 3}px`, // pequeno espaçamento
    left: `${rect.left}px`,
    width: `${rect.width}px`,
    zIndex: 9999,
  };
};

watch(isOpen, (open) => {
  if (open) {
    updatePosition();
  }
});

// --- Filtra as Tags conforme a busca ---
const filteredTags = computed(() =>
  internalTags.value.filter((d) =>
    d.name.toLowerCase().includes(search.value.toLowerCase()),
  ),
);

// --- Alterna seleção das tags ---
const toggleSelect = (item) => {
  // --- Modo single-select ---
  if (!props.multiple) {
    // --- Se já está selecionado, alterna para vazio ---
    if (firstSelected.value?.id === item.id) {
      emit("update:modelValue", []);
      return;
    }
    emit("update:modelValue", [
      { id: item.id, name: item.name, color: item.color },
    ]);
    if (props.closeOnSelectSingle) {
      isOpen.value = false;
    }
    return;
  }
  // --- Modo múltiplo padrão ---
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
      mountUrl(contact_tag, { page: page.value, ...params }),
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

const loadMoreTags = async (state) => {
  if (isLoading.value) return;
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

let debounceTimer;
watch(
  filters,
  () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(async () => {
      const { name } = filters.value;
      page.value = 1;
      await getTags({ name: name.toString() });
    }, 800);
  },
  { deep: true },
);

onMounted(async () => {
  if (props.teleportTo) {
    const reposition = () => {
      if (isOpen.value) updatePosition();
    };
    window.addEventListener("scroll", reposition, true);
    window.addEventListener("resize", reposition);
    listeners.push(["scroll", reposition], ["resize", reposition]);
  }
  // Listener global para clique fora (suporta ambos os modos)
  document.addEventListener("mousedown", handleOutside);
});

onBeforeUnmount(() => {
  document.removeEventListener("mousedown", handleOutside);
});

watch(
  () => props.allTags,
  (val) => {
    if (!val) return;

    if (Array.isArray(val.results)) {
      internalTags.value = val.results;
      nextPage.value = val.next || null;
      previousPage.value = val.previous || null;
      page.value = 2;
    }
  },
  { deep: true, immediate: true },
);
</script>

<template>
  <div class="relative w-full z-[9999]" ref="dropdownRef">
    <!-- Div de seleção -->
    <div
      @click="isOpen = !isOpen"
      ref="triggerRef"
      class="flex items-center justify-between gap-2 p-2 bg-base-300 rounded-md border border-base-300 cursor-pointer"
    >
      <!-- Trigger adaptado para single ou múltiplo -->
      <template v-if="multiple">
        <span v-if="modelValue.length === 0" class="text-gray-500 text-xs p-1">
          Selecione suas etiquetas
        </span>
        <div
          class="text-xs flex-wrap w-full flex items-center gap-1 h-6 overflow-y-auto"
          v-else
        >
          <section v-for="tag in modelValue" :key="tag.id" class="inline-flex">
            <svg
              class="size-6 -ml-2"
              aria-hidden="true"
              viewBox="0 0 3 97"
              :style="{ color: tag.color || '#ffff' }"
            >
              <path
                d="M49.9,0a17.1,17.1,0,0,0-12,5L5,37.9A17,17,0,0,0,5,62L37.9,94.9a17.1,17.1,0,0,0,12,5ZM25.4,59.4a9.5,9.5,0,1,1,9.5-9.5A9.5,9.5,0,0,1,25.4,59.4Z"
                fill="currentColor"
              />
            </svg>
            <span
              :style="[
                'max-width: 5.5rem;',
                { backgroundColor: tag.color || '#ffff' },
              ]"
              class="text-xs rounded-r-md inline-flex gap-1 items-center"
              :class="getContrastColor(tag.color || '#ffff')"
            >
              <p class="truncate">
                {{ tag.name }}
              </p>
              <button class="px-2" @click.prevent.stop="toggleSelect(tag)">
                x
              </button>
            </span>
          </section>
        </div>
      </template>
      <template v-else>
        <span v-if="!modelValue.length" class="text-gray-500 text-xs">
          Selecione a etiqueta
        </span>
        <section v-else class="inline-flex items-center gap-1">
          <span class="text-xs truncate max-w-32 rounded-r-md">{{
            modelValue[0]?.name
          }}</span>
        </section>
      </template>

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
      v-if="isOpen && !teleportTo"
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
        class="p-3 bg-base-300"
      >
        <template #spinner>
          <section class="w-full justify-center items-center flex">
            <div
              class="size-4 animate-spin rounded-full border-4 border-solid border-primary border-t-transparent"
            />
          </section>
        </template>
      </InfiniteLoading>
    </div>

    <Teleport v-if="isOpen && teleportTo" :to="teleportTo">
      <div
        ref="teleportedRef"
        :style="{ ...dropdownStyle }"
        class="absolute z-10 w-full bg-base-300 shadow-sm shadow-base-100 border border-base-300 rounded-md overflow-y-auto hide-scrollbar max-h-[200px]"
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
            'select-tag-btn',
            { selected: modelValue.some((d) => d.id === depart.id) },
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
              class="viewTag"
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
          class="p-3 bg-base-300"
        >
          <template #spinner>
            <section class="w-full justify-center items-center flex">
              <div
                class="size-4 animate-spin rounded-full border-4 border-solid border-primary border-t-transparent"
              />
            </section>
          </template>
        </InfiniteLoading>
      </div>
    </Teleport>
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

.select-tag-btn {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  cursor: pointer;
  transition: background 0.2s;
  width: 100%;
  background: transparent;
}
.select-tag-btn:hover {
  background-color: #26343d;
}
.select-tag-btn.selected {
  background-color: rgba(34, 197, 94, 0.3);
}
.select-tag-btn.selected:hover {
  background-color: rgba(34, 197, 94, 0.5);
}

.viewTag {
  font-size: 0.75rem;
  line-height: 1rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 8rem;
  padding: 0.25rem;
  border-top-right-radius: 0.375rem;
  border-bottom-right-radius: 0.375rem;
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
    box-shadow:
      15px 0,
      -25px 0;
  }
  50% {
    box-shadow:
      15px 0,
      -15px 0;
  }
  100% {
    box-shadow:
      25px 0,
      -15px 0;
  }
}
</style>
