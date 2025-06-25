<script setup>
import { ref } from "vue";
import rocket_animate from "../../assets/lottieAnimates/rocket_animate.json";

const emit = defineEmits(["sendSuggestion"]);
const loader = ref(false);
const suggestionPayload = ref({
  name: "",
  companySegment: "",
  suggestion: "",
  terms: false,
});

const sendSuggestion = () => {
  emit("sendSuggestion", suggestionPayload.value);
};
</script>

<template>
  <main class="relative">
    <section
      v-if="false"
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
      <section class="form-grid-send-suggestion">
        <input
          v-model="suggestionPayload.name"
          class="input_send_suggestion"
          placeholder="Seu nome"
          type="text"
        />
        <input
          v-model="suggestionPayload.companySegment"
          class="input_send_suggestion"
          placeholder="Segmento da sua empresa"
          type="text"
        />
        <div class="textarea-container-send-suggestion">
          <textarea
            v-model="suggestionPayload.suggestion"
            class="input_send_suggestion textarea-send-suggestion"
            placeholder="Gostaria que vocês adicionassem..."
            type="text"
          ></textarea>

          <span class="char-count-send-suggestion"> 0/100 </span>
        </div>
      </section>

      <div class="checkbox-wrapper-46">
        <input
          v-model="suggestionPayload.terms"
          class="inp-cbx"
          id="cbx-46"
          type="checkbox"
        />
        <label class="cbx" for="cbx-46">
          <span>
            <svg width="12px" height="10px" viewbox="0 0 12 10">
              <polyline points="1.5 6 4.5 9 10.5 1"></polyline>
            </svg>
          </span>
          <span class="terms-send-suggestion">
            <p class="terms-text-send-suggestion">
              Eu aceito os termos e condições da
              <a class="link-send-suggestion">SM Click</a>
            </p>
          </span>
        </label>
      </div>

      <button
        @click="loader ? (loader = false) : (loader = true)"
        class="submit-button-send-suggestion"
      >
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

  background-color: #212730;
  padding: 0.5rem;
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.form-grid-send-suggestion {
  display: grid;
  grid-template-rows: repeat(7, 1fr);
  gap: 12px;
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
  grid-row: span 1;
}

.input_send_suggestion::placeholder {
  color: var(--gray-secondary);
}

.input_send_suggestion:focus {
}

.textarea-container-send-suggestion {
  grid-row: span 5;
  position: relative;
}

.textarea-send-suggestion {
  resize: none;
  overflow: hidden;
  height: 100%;
}

.char-count-send-suggestion {
  position: absolute;
  right: 0.5rem;
  bottom: 0.5rem;
  color: #d7d9dd;
  font-size: 10px;
}

.terms-send-suggestion {
  font-size: 10px;
  display: flex;
  gap: 0.25rem;
  align-items: center;
  cursor: pointer;
  /* @apply text-[10px] lg:text-[14px]; */
}

@media (min-width: 1280px) {
  .terms-send-suggestion {
    font-size: 14px;
  }
}

.terms-text-send-suggestion {
  color: white;
  user-select: none;
}

.link-send-suggestion {
  color: #3b82f6;
  text-decoration: none;
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

.checkbox-wrapper-46 input[type="checkbox"] {
  display: none;
  visibility: hidden;
}

.checkbox-wrapper-46 .cbx {
  margin: auto;
  -webkit-user-select: none;
  user-select: none;
  cursor: pointer;
}
.checkbox-wrapper-46 .cbx span {
  display: inline-block;
  vertical-align: middle;
  transform: translate3d(0, 0, 0);
}
.checkbox-wrapper-46 .cbx span:first-child {
  position: relative;
  width: 20px;
  height: 20px;
  border-radius: 6px;
  transform: scale(1);
  vertical-align: middle;
  border: 1px solid #9098a9;
  transition: all 0.2s ease;
}
.checkbox-wrapper-46 .cbx span:first-child svg {
  position: absolute;
  top: 4.2px;
  left: 3px;
  fill: none;
  stroke: #ffffff;
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-dasharray: 16px;
  stroke-dashoffset: 16px;
  transition: all 0.3s ease;
  transition-delay: 0.1s;
  transform: translate3d(0, 0, 0);
}
.checkbox-wrapper-46 .cbx span:first-child:before {
  content: "";
  width: 100%;
  height: 100%;
  background: var(--blue-primary);
  display: block;
  transform: scale(0);
  opacity: 1;
  border-radius: 50%;
}
.checkbox-wrapper-46 .cbx span:last-child {
  padding-left: 8px;
}
.checkbox-wrapper-46 .cbx:hover span:first-child {
  border-color: var(--blue-primary);
}

.checkbox-wrapper-46 .inp-cbx:checked + .cbx span:first-child {
  background: var(--blue-primary);
  border-color: var(--blue-primary);
  animation: wave-46 0.4s ease;
}
.checkbox-wrapper-46 .inp-cbx:checked + .cbx span:first-child svg {
  stroke-dashoffset: 0;
}
.checkbox-wrapper-46 .inp-cbx:checked + .cbx span:first-child:before {
  transform: scale(3.5);
  opacity: 0;
  transition: all 0.6s ease;
}

@keyframes wave-46 {
  50% {
    transform: scale(0.9);
  }
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






