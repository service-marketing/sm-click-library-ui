<template>
  <section class="flex flex-col text-center">
    <div class="flex flex-col space-y-3 justify-center">
      <div class="space-x-4 flex-col text-black justify-center">
        <input
          v-for="(input, index) in codeAuth"
          :key="index"
          v-model="codeAuth[index]"
          :class="
            eventHandling === 'check'
              ? 'checked_mfa'
              : eventHandling === 'err'
                ? 'err_mfa'
                : 'reset_input'
          "
          class="inline-block w-10 h-10 rounded-md text-center"
          type="text"
          maxlength="1"
          @input="handleInput(index)"
          @keydown.backspace="moveToPrev(index, $event)"
          ref="inputs"
        />
      </div>
    </div>
  </section>
</template>

<script setup>
import { sm_click_logo } from "~/assets/imgLinks.js";
import { onMounted, ref } from "vue";
import "./styleMfa.css";

onMounted(() => {
  inputs.value[0].focus();
});

const props = defineProps({
  eventHandling: {
    type: String,
    default: null,
  },
});
const emit = defineEmits(["filled", "reset"]);
const codeAuth = ref(Array(6).fill(""));
const inputs = ref([]);
const controlClassInput = ref(false);

// Função para lidar com a entrada e permitir apenas números
const handleInput = (index) => {
  const value = codeAuth.value[index];

  if (codeAuth.value[0] < 1) {
    emit("reset");
  }

  if (!/^\d$/.test(value)) {
    codeAuth.value[index] = ""; // Limpa o input se não for um dígito
  } else {
    moveToNext(index); // Move para o próximo input se for um dígito
  }

  // Verifica se todos os campos foram preenchidos
  if (
    index === codeAuth.value.length - 1 &&
    codeAuth.value.every((v) => v !== "")
  ) {
    onComplete(); // Chama a função onComplete quando o último input for preenchido
  }
};

// Move para o próximo input ao digitar
const moveToNext = (index) => {
  if (index < codeAuth.value.length - 1 && codeAuth.value[index]) {
    inputs.value[index + 1].focus();
  }
};

// Move para o input anterior ao apagar
const moveToPrev = (index, event) => {
  if (event.key === "Backspace" && !codeAuth.value[index] && index > 0) {
    inputs.value[index - 1].focus();
  }
};

// Função chamada quando o último número é preenchido
const onComplete = () => {
  const sendAuth = codeAuth.value.join("");
  emit("filled", sendAuth);
};
</script>
