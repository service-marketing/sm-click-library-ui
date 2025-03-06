<template>
  <main class="main-container">
    <img v-if="props.content" :src="props.content" alt="" />

    <section
      class="avatar-section flex flex-col max-w-[40%] min-h-[40%]"
      v-else
    >
      <div id="avatar-container" class="avatar-container">
        <Avatar v-bind="avatarBuildProps" />
      </div>

      <div class="controls">
        <label class="checkbox-label checkbox-wrapper-2" for="avatarLabel">
          <input
            id="avatarLabel"
            v-model="facialHair"
            type="checkbox"
            class="sc-gJwTLC ikxBAC"
          />
          Remover barba
        </label>

        <button @click="createRandom" class="generate-button">
          Gerar Avatar
        </button>
      </div>
    </section>
  </main>
</template>

<script setup>
import { Avatar, Factory } from "vue3-avataaars";
import { ref, nextTick, onMounted } from "vue";
import { defaultAvatar } from "./assets/content";

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

<style scoped>
.main-container {
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
}

.avatar-section {
  display: flex;
  align-items: center;
  gap: 10px;
  justify-content: center;
}

.avatar-container {
  width: 50%;
}

.controls {
  display: flex;
  flex-direction: column;
  gap: 10px;
  justify-content: center;
  margin: 0 auto;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 14px;
  cursor: pointer;
}

.generate-button {
  background-color: #22c55e;
  padding: 5px;
  border-radius: 5px;
  color: white;
  cursor: pointer;
  border: none;
  transition: background-color 0.3s;
}

.generate-button:hover {
  background-color: #16a34a;
}

.checkbox-wrapper-2 .ikxBAC {
  appearance: none;
  background-color: #dfe1e4;
  border-radius: 72px;
  border-style: none;
  flex-shrink: 0;
  height: 20px;
  margin: 0;
  position: relative;
  width: 30px;
}

.checkbox-wrapper-2 .ikxBAC::before {
  bottom: -6px;
  content: "";
  left: -6px;
  position: absolute;
  right: -6px;
  top: -6px;
}

.checkbox-wrapper-2 .ikxBAC,
.checkbox-wrapper-2 .ikxBAC::after {
  transition: all 100ms ease-out;
}

.checkbox-wrapper-2 .ikxBAC::after {
  background-color: #fff;
  border-radius: 50%;
  content: "";
  height: 14px;
  left: 3px;
  position: absolute;
  top: 3px;
  width: 14px;
}

.checkbox-wrapper-2 input[type="checkbox"] {
  cursor: default;
}

.checkbox-wrapper-2 .ikxBAC:hover {
  background-color: #c9cbcd;
  transition-duration: 0s;
}

.checkbox-wrapper-2 .ikxBAC:checked {
  background-color: #22c55e;
}

.checkbox-wrapper-2 .ikxBAC:checked::after {
  background-color: #fff;
  left: 13px;
}

.checkbox-wrapper-2 :focus:not(.focus-visible) {
  outline: 0;
}

.checkbox-wrapper-2 .ikxBAC:checked:hover {
  background-color: #22c55e;
}
</style>


