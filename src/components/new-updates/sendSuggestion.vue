<script setup>
import { ref } from "vue";
import rocket_animate from "../../assets/lottieAnimates/rocket_animate.json";
import { usePatchStore } from "../../stores/patchNotesStore.js";
const patchStore = usePatchStore();

const emit = defineEmits(["sendSuggestion"]);
const props = defineProps({
  loader: { type: Boolean, default: false },
  sendSuccess: { type: Boolean, default: false },
});

const suggestion = ref("");
const errorSent = ref(false);

const sendSuggestions = () => {
  errorSent.value = false;

  if (!suggestion.value) {
    errorSent.value = true;
    return;
  }

  emit("sendSuggestion", suggestion.value);
};
</script>

<template>
  <main class="relative">
    <section
      v-if="sendSuccess"
      class="absolute w-full h-full bg-black/90 z-10 p-2 flex justify-center items-center rounded-lg"
    >
      <div
        class="text-white p-4 text-center flex flex-col justify-between h-full"
      >
        <p class="text-lg font-semibold">
          Sua sugestão foi recebida com sucesso
        </p>
        <Vue3Lottie
          :animation-data="rocket_animate"
          :height="200"
          :width="200"
          :auto-play="true"
          :loop="true"
        />

        <p>
          Nossa equipe irá avaliá-la com atenção e considerar sua implementação.
        </p>
        <p>Agradecemos sua colaboração</p>
      </div>
    </section>

    <section class="container-send-suggestion">
      <h1 class="header_send_suggestion">Envie sua sugestão para nós</h1>

      <textarea
        v-model="suggestion"
        class="input_send_suggestion textarea-send-suggestion"
        placeholder="Gostaria que vocês adicionassem..."
        type="text"
      ></textarea>

      <span class="tool_tip_suggestion_error" v-if="errorSent">
        Por favor, preencha o campo antes de continuar
      </span>

      <button @click="sendSuggestions()" class="submit-button-send-suggestion">
        <div v-if="loader" class="loader-suggestion"></div>
        <p v-else>Enviar</p>
      </button>
    </section>
  </main>
</template>

<style scoped>
.container-send-suggestion {
  --blue-primary: #2563eb;
  --gray-primary: #46637b;
  --gray-secondary: #9ca0a6;

  height: 100%;
  background-color: #212730;
  padding: 0.5rem;
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.tool_tip_suggestion_error {
  text-align: center;
  color: rgba(199, 40, 8, 0.977);
  transition: ease-in;
}

.input_send_suggestion {
  width: 100%;
  background-color: var(--gray-primary);
  color: white;
  font-size: 12px;
  border-radius: 10px;
  padding: 12px;
  border: none;
  outline: none;
}

.input_send_suggestion::placeholder {
  color: var(--gray-secondary);
}

.textarea-send-suggestion {
  flex: 1;
  resize: none;
  overflow: hidden;
}

.submit-button-send-suggestion {
  background-color: var(--blue-primary);
  width: 100%;
  min-height: 40px;
  padding: 0.5rem;
  color: white;
  border-radius: 10px;
  font-size: 0.875rem;
  border: none;
  cursor: pointer;
  transition: background-color 0.3s;
  display: flex;
  justify-content: center;
  font-weight: 600;
}

.submit-button-send-suggestion:hover {
  background-color: #1e40af;
}

.header_send_suggestion {
  background: #333741;
  padding: 16px;
  border-radius: 10px;
  color: white;
  font-size: 0.9rem;
  line-height: 1rem;
  font-weight: 600;
}

.loader-suggestion {
  width: 24px;
  padding: 6px;
  aspect-ratio: 1;
  border-radius: 50%;
  background: #ffffff;
  --_m: conic-gradient(#0000 10%, #000), linear-gradient(#000 0 0) content-box;
  -webkit-mask: var(--_m);
  mask: var(--_m);
  -webkit-mask-composite: source-out;
  mask-composite: subtract;
  animation: l3 1s infinite linear;
}
@keyframes l3 {
  to {
    transform: rotate(1turn);
  }
}
</style>






