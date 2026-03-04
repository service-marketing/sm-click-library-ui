<script setup>
import { ref, computed, defineProps, defineEmits } from "vue";
import { onClickOutside } from "@vueuse/core";

const props = defineProps({
  // --- Lista que será exibida e já selecionada ---
  modelValue: {
    type: Array,
    default: () => [],
  },
  // --- Lista de todas as instâncias ---
  instances: {
    type: Array,
    default: () => [],
    required: true,
  },
  // --- Label principal do dropdown ---
  placeholder: {
    type: String,
    default: "Selecione instâncias...",
  },
});

const emit = defineEmits(["update:modelValue"]);

const isOpen = ref(false);
const search = ref("");
const dropdownRef = ref(null);

// --- Fecha o dropdown ao clicar fora ---
onClickOutside(dropdownRef, () => (isOpen.value = false));

// --- Filtra as instâncias conforme a busca ---
const filteredInstances = computed(() =>
  props.instances.filter((i) =>
    i.name.toLowerCase().includes(search.value.toLowerCase()),
  ),
);

// --- Alterna seleção da instância ---
const toggleSelect = (item) => {
  const selected = [...props.modelValue];
  const index = selected.indexOf(item.id);
  if (index === -1) {
    selected.push(item.id);
  } else {
    selected.splice(index, 1);
  }
  emit("update:modelValue", selected);
};
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
        Selecionadas: <a class="text-green-500">{{ modelValue.length }}</a>
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
      <div class="p-2 z-20 sticky top-0 bg-base-300">
        <input
          v-model="search"
          type="text"
          placeholder="Buscar..."
          class="w-full text-[10px] bg-base-200 rounded-md p-2 outline-none border-none focus:outline-none focus:ring-0 focus:shadow-none placeholder:text-gray-500"
        />
      </div>

      <button
        v-for="instance in filteredInstances"
        :key="instance.id"
        :class="[
          modelValue.includes(instance.id)
            ? 'bg-green-500/30 hover:bg-green-500/50'
            : 'hover:bg-base-200',
          'flex items-center justify-between line-clamp-1 gap-2 px-3 py-2 cursor-pointer transition w-full',
        ]"
        @click="toggleSelect(instance)"
      >
        <div class="flex items-center gap-4">
          <svg
            v-if="instance.type === 'whatsapp-qrcode'"
            xmlns="http://www.w3.org/2000/svg"
            fill="currentColor"
            class="w-5 h-5 text-green-400"
            viewBox="0 0 16 16"
          >
            <path
              d="M13.601 2.326A7.854 7.854 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.933 7.933 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.898 7.898 0 0 0 13.6 2.326zM7.994 14.521a6.573 6.573 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.557 6.557 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592zm3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.729.729 0 0 0-.529.247c-.182.198-.691.677-.691 1.654 0 .977.71 1.916.81 2.049.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232z"
            />
          </svg>
          <svg
            v-else-if="instance.type === 'instagram'"
            xmlns="http://www.w3.org/2000/svg"
            class="w-5 h-5"
            viewBox="0 0 16 16"
          >
            <defs>
              <linearGradient
                id="instagram-gradient"
                x1="0%"
                y1="100%"
                x2="100%"
                y2="0%"
              >
                <stop
                  offset="0%"
                  style="stop-color: #fd5949; stop-opacity: 1"
                />
                <stop
                  offset="50%"
                  style="stop-color: #d6249f; stop-opacity: 1"
                />
                <stop
                  offset="100%"
                  style="stop-color: #285aeb; stop-opacity: 1"
                />
              </linearGradient>
            </defs>
            <path
              fill="url(#instagram-gradient)"
              d="M8 0C5.829 0 5.556.01 4.703.048 3.85.088 3.269.222 2.76.42a3.917 3.917 0 0 0-1.417.923A3.927 3.927 0 0 0 .42 2.76C.222 3.268.087 3.85.048 4.7.01 5.555 0 5.827 0 8.001c0 2.172.01 2.444.048 3.297.04.852.174 1.433.372 1.942.205.526.478.972.923 1.417.444.445.89.719 1.416.923.51.198 1.09.333 1.942.372C5.555 15.99 5.827 16 8 16s2.444-.01 3.298-.048c.851-.04 1.434-.174 1.943-.372a3.916 3.916 0 0 0 1.416-.923c.445-.445.718-.891.923-1.417.197-.509.332-1.09.372-1.942C15.99 10.445 16 10.173 16 8s-.01-2.445-.048-3.299c-.04-.851-.175-1.433-.372-1.941a3.926 3.926 0 0 0-.923-1.417A3.911 3.911 0 0 0 13.24.42c-.51-.198-1.092-.333-1.943-.372C10.443.01 10.172 0 7.998 0h.003zm-.717 1.442h.718c2.136 0 2.389.007 3.232.046.78.035 1.204.166 1.486.275.373.145.64.319.92.599.28.28.453.546.598.92.11.281.24.705.275 1.485.039.843.047 1.096.047 3.231s-.008 2.389-.047 3.232c-.035.78-.166 1.203-.275 1.485a2.47 2.47 0 0 1-.599.919c-.28.28-.546.453-.92.598-.28.11-.704.24-1.485.276-.843.038-1.096.047-3.232.047s-2.39-.009-3.233-.047c-.78-.036-1.203-.166-1.485-.276a2.478 2.478 0 0 1-.92-.598 2.48 2.48 0 0 1-.6-.92c-.109-.281-.24-.705-.275-1.485-.038-.843-.046-1.096-.046-3.233 0-2.136.008-2.388.046-3.231.036-.78.166-1.204.276-1.486.145-.373.319-.64.599-.92.28-.28.546-.453.92-.598.282-.11.705-.24 1.485-.276.738-.034 1.024-.044 2.515-.045v.002zm4.988 1.328a.96.96 0 1 0 0 1.92.96.96 0 0 0 0-1.92zm-4.27 1.122a4.109 4.109 0 1 0 0 8.217 4.109 4.109 0 0 0 0-8.217zm0 1.441a2.667 2.667 0 1 1 0 5.334 2.667 2.667 0 0 1 0-5.334z"
            />
          </svg>
          <div
            class="relative"
            v-else-if="instance.type === 'whatsapp-api-official'"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="currentColor"
              class="w-5 h-5 text-green-400"
              viewBox="0 0 16 16"
            >
              <path
                d="M13.601 2.326A7.854 7.854 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.933 7.933 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.898 7.898 0 0 0 13.6 2.326zM7.994 14.521a6.573 6.573 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.557 6.557 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592zm3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.729.729 0 0 0-.529.247c-.182.198-.691.677-.691 1.654 0 .977.71 1.916.81 2.049.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232z"
              />
            </svg>
            <svg
              style="color: #0081fb"
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              fill="currentColor"
              class="icon-meta absolute -bottom-1 -right-1"
              viewBox="0 0 16 16"
            >
              <path
                fill-rule="evenodd"
                d="M8.217 5.243C9.145 3.988 10.171 3 11.483 3 13.96 3 16 6.153 16.001 9.907c0 2.29-.986 3.725-2.757 3.725-1.543 0-2.395-.866-3.924-3.424l-.667-1.123-.118-.197a54.944 54.944 0 0 0-.53-.877l-1.178 2.08c-1.673 2.925-2.615 3.541-3.923 3.541C1.086 13.632 0 12.217 0 9.973 0 6.388 1.995 3 4.598 3c.319 0 .625.039.924.122.31.086.611.22.913.407.577.359 1.154.915 1.782 1.714Zm1.516 2.224c-.252-.41-.494-.787-.727-1.133L9 6.326c.845-1.305 1.543-1.954 2.372-1.954 1.723 0 3.102 2.537 3.102 5.653 0 1.188-.39 1.877-1.195 1.877-.773 0-1.142-.51-2.61-2.87l-.937-1.565ZM4.846 4.756c.725.1 1.385.634 2.34 2.001A212.13 212.13 0 0 0 5.551 9.3c-1.357 2.126-1.826 2.603-2.581 2.603-.777 0-1.24-.682-1.24-1.9 0-2.602 1.298-5.264 2.846-5.264.091 0 .181.006.27.018Z"
              />
            </svg>
          </div>
          <span class="text-xs">{{ instance.name }}</span>
        </div>
        <svg
          v-if="modelValue.includes(instance.id)"
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
        v-if="!filteredInstances.length"
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
