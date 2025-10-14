<script setup>
import { ref, nextTick } from "vue";

const props = defineProps({
  // --- O valor atual da foto (pode ser null, base64 ou URL) ---
  modelValue: {
    type: [String, null],
    default: null,
  },
  // --- Tamanho da área (ex: 'size-22', 'w-32 h-32', etc.) ---
  sizeClass: {
    type: String,
    default: "size-22",
  },

  //  --- Classe base do botão ---
  baseClass: {
    type: String,
    default:
      "shadow shadow-black rounded-xl relative border-2 border-gray-500 bg-base-300 hover:bg-base-300/70 transition-all",
  },
  //  --- Svg que irá preencher o espaço quando o input for vazio ---
  emptyPlaceholder: {
    type: String,
    default:
      '<svg class="size-32 text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24"> <path fill-rule="evenodd" d="M7.5 4.586A2 2 0 0 1 8.914 4h6.172a2 2 0 0 1 1.414.586L17.914 6H19a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h1.086L7.5 4.586ZM10 12a2 2 0 1 1 4 0 2 2 0 0 1-4 0Zm2-4a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z" clip-rule="evenodd"/> </svg>',
  },
});

// Emite o novo valor quando o usuário adiciona ou remove foto
const emit = defineEmits(["update:modelValue"]);

// Função para escolher arquivos e emitir para o componente pai
const chooseFiles = async () => {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = "image/*";
  input.onchange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      emit("update:modelValue", reader.result);
    };
    reader.readAsDataURL(file);
  };
  input.click();
};

// Função para remover a foto
const removePhoto = async () => {
  emit("update:modelValue", null);
};
</script>

<template>
  <button :class="baseClass">
    <!-- Ícone de adicionar foto -->
    <section
      :class="`flex items-center justify-center ${sizeClass}`"
      v-if="!modelValue"
      @click="chooseFiles"
    >
      <span
        :class="`p-3 rounded-xl text-gray-400 hover:scale-105 hover:text-primary hover:border-primary`"
        v-html="emptyPlaceholder"
      ></span>
    </section>

    <!-- Exibe imagem -->
    <img
      v-else
      :src="
        typeof modelValue === 'string' && modelValue.startsWith('data:image/')
          ? modelValue
          : `${modelValue}?t=${Date.now()}`
      "
      @click="chooseFiles"
      :class="`${sizeClass} rounded-xl z-10 object-center bg-base-300 object-scale-down hover:bg-base-300/70`"
    />

    <!-- Botão de remover -->
    <button
      v-if="modelValue"
      @click.stop="removePhoto"
      class="absolute top-1 right-1 rounded-lg bg-red-600 hover:bg-red-500 z-50 py-1 px-1"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke-width="1.5"
        stroke="currentColor"
        class="w-5"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M6 18L18 6M6 6l12 12"
        />
      </svg>
    </button>
  </button>
</template>
