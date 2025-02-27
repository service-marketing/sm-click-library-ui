c<template>
  <main class="flex flex-col gap-2 w-full">
    <img v-if="props.content" :src="props.content" alt="" />

    <section class="flex items-center gap-3 justify-center" v-else>
      <div id="avatar-container" class="w-[50%]">
        <Avatar v-bind="avatarBuildProps" />
      </div>
    </section>

    <div class="flex flex-col gap-2 justify-center mx-auto">
      <label for="">
        Remover barba
        <input v-model="facialHair" type="checkbox" />
      </label>
      <!-- {{ facialHair }} -->
      <button
        @click="createRandom"
        class="bg-blue-200 p-1 rounded-md max-w-1/2"
      >
        Gerar Avatar
      </button>
    </div>
  </main>
</template>

<script setup>
import { Avatar, Factory } from "vue3-avataaars";
import { ref, nextTick, onMounted } from "vue";
import { defaultAvatar } from "./assets/content";
import SelectValue from "./components/selectValue.vue";

const avatarBuildProps = ref(defaultAvatar);
const facialHair = ref(false);

const emit = defineEmits(["base64", "random"]);

const props = defineProps({
  content: {
    type: String,
    default: null,
  },
});

// Função para criar o avatar random
const createRandom = async () => {
  avatarBuildProps.value = Factory({
    isCircle: true,
    circleColor: "#22c55e",
    facialHair: facialHair.value ? "Blank" : null,
  }); // Usa a função factory da lib para criar as props
  await nextTick(); // Aguarda o DOM ser atualizado
  getAvatar();
};

// Função para criar extrair o SVG da DOM e emitir o base64
const getAvatar = () => {
  const avatarElement = document.querySelector("#avatar-container svg");

  if (!avatarElement) {
    console.error("Avatar não encontrado!");
    return;
  }

  const serializer = new XMLSerializer();
  let svgString = serializer.serializeToString(avatarElement);

  // Codificar a string SVG em Base64 sem manipulação extra de caracteres especiais
  const base64Svg = window.btoa(unescape(encodeURIComponent(svgString))); // Codifica em Base64 de forma segura

  const dataUrl = `data:image/svg+xml;base64,${base64Svg}`;
  emit("base64", dataUrl);
};
</script>