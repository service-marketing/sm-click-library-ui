<script setup>
import { computed, reactive, ref, watch } from "vue";

const props = defineProps({
  content: {
    type: Object,
    default: () => ({}),
  },
});
const emit = defineEmits(["update:content"]);

// --- Estado reativo para conteúdo ---
const contentHandler = reactive({
  title: props.content.title ?? "Nome do produto",
  svg:
    props.content.svg ??
    `<svg class="size-4 flex items-center text-base-100" fill="currentColor" viewBox="0 0 495.554 495.554">
      <path d="M353.732,451.163c3.388,10.912-2.324,22.536-13.024,26.545c-35.256,13.208-68.455,17.846-111.453,17.846
      c-118.188,0-222.136-84.711-222.136-224.283C7.118,126.042,112.492,0,273.4,0c125.316,0,215.036,86.156,215.036,205.784
      c0,103.949-58.388,169.434-135.282,169.434c-33.456,0-57.69-17.076-61.225-54.813h-1.423
      c-22.095,36.324-54.124,54.813-91.861,54.813c-46.298,0-79.753-34.171-79.753-92.557c0-86.842,64.092-165.898,166.625-165.898
      c17.074,0,35.438,2.328,51.491,6.064c19.1,4.444,31.434,22.886,28.295,42.243l-16.411,101.212
      c-7.14,42.037-2.152,61.253,17.79,61.949c30.619,0.728,69.051-38.442,69.051-120.326c0-92.557-59.801-164.484-170.16-164.484
      c-108.937,0-204.36,85.459-204.36,221.447c0,118.902,76.209,186.558,182.278,186.558c28.226,0,57.728-4.744,82.85-13.864
      c5.426-1.969,11.42-1.629,16.591,0.935c5.171,2.565,9.08,7.133,10.792,12.646L353.732,451.163z M296.189,175.873
      c-5.686-1.423-12.815-2.847-22.064-2.847c-47.017,0-84.035,46.27-84.035,101.11c0,27.053,12.117,44.117,35.594,44.117
      c26.346,0,54.125-33.443,60.527-74.754L296.189,175.873z"/>
    </svg>`,
  info: props.content.info ?? "Nome que será atribuído no Produto",
  type: props.content.type ?? "text",
  placeholder: props.content.placeholder ?? "Integração de sistemas",
  empty: props.content.empty ?? false,
  data: props.content.data ?? "",
});

// --- Modelo do input reativo ---
const model = ref(contentHandler.data);

// --- Watch para emitir e atualizar dinamicamente ---
watch(
  model,
  (newVal) => {
    emit("update:content", { ...contentHandler, data: newVal });
  },
  { immediate: true, deep: true }
);

watch(
  () => props.content,
  (newVal) => {
    if (newVal.data !== model.value) model.value = newVal.data;
    if (newVal.empty !== contentHandler.empty)
      contentHandler.empty = newVal.empty;
  },
  { deep: true }
);

// --- Computed de erro/estado visual ---
const isEmpty = computed(() => contentHandler.empty && !model.value);
</script>

<template>
  <section class="flex flex-col gap-2 w-full h-full">
    <!-- Label e Tooltip -->
    <header class="flex items-center justify-between px-1">
      <p class="text-xs font-medium text-left">{{ contentHandler.title }}</p>

      <Popper hover :content="contentHandler.info" placement="top" arrow>
        <svg
          class="size-4 text-white"
          xmlns="http://www.w3.org/2000/svg"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            fill-rule="evenodd"
            clip-rule="evenodd"
            d="M2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10S2 17.523 2 12Zm9.408-5.5a1 1 0 1 0 0 2h.01a1 1 0 1 0 0-2h-.01ZM10 10a1 1 0 1 0 0 2h1v3h-1a1 1 0 1 0 0 2h4a1 1 0 1 0 0-2h-1v-4a1 1 0 0 0-1-1h-2Z"
          />
        </svg>
      </Popper>
    </header>

    <!-- Campo de entrada -->
    <div
      :class="[
        'input__container',
        isEmpty ? 'input__container--error' : '',
        contentHandler.type === 'textArea' ? 'textArea' : '',
      ]"
    >
      <!-- Ícone -->
      <span
        v-if="contentHandler.type !== 'textArea'"
        :class="isEmpty ? 'text-red-500' : 'text-base-100'"
        v-html="contentHandler.svg"
      ></span>

      <!-- Input  -->
      <input
        v-if="contentHandler.type !== 'textArea'"
        :type="contentHandler.type"
        :key="contentHandler.type"
        :placeholder="contentHandler.placeholder"
        v-model="model"
        :class="[isEmpty ? 'empty' : null, 'input__field']"
      />
      <!-- text-area  -->
      <textarea
        v-else
        :class="[isEmpty ? 'empty' : null, 'input__field h-full resize-y']"
        v-model="model"
        :placeholder="contentHandler.placeholder"
      />

      <!-- Mensagem de erro -->
      <span v-if="isEmpty" class="input__error"> Campo obrigatório </span>
    </div>
  </section>
</template>


<style scoped>
/* --- Container Principal do Input --- */
.input__container {
  @apply flex items-center relative bg-base-300 rounded-md px-3 transition-all duration-150;
}

/* --- Container Principal ajustado para o text-area --- */
.input__container.textArea {
  @apply px-0 h-full;
}

/* --- Estado de erro do input --- */
.input__container--error {
  @apply border border-red-500 ring-1 ring-red-500;
}

/* --- Campo de texto --- */
.input__field {
  @apply w-full text-xs bg-base-300 rounded-md p-3 outline-none border-none focus:outline-none focus:ring-0 focus:shadow-none placeholder:text-gray-500;
}

/* Campo de input vazio */
.input__field.empty {
  @apply placeholder-red-500;
}

/* --- Mensagem de erro --- */
.input__error {
  @apply text-xs absolute -bottom-3 left-1 bg-base-300 px-2 py-0.5 rounded-lg text-red-500 select-none shadow-sm shadow-base-100;
}

/* Remove as setas de inputs numéricos (Chrome, Safari, Edge, Opera) */
input[type="number"]::-webkit-inner-spin-button,
input[type="number"]::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

/* Remove as setas de inputs numéricos (Firefox) */
input[type="number"] {
  -moz-appearance: textfield;
}
</style>
