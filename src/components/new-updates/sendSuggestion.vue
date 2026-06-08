<script setup>
import { ref } from "vue";
import rocket_animate from "../../assets/lottieAnimates/rocket_animate.json";

const emit = defineEmits(["postSuccess"]);
const props = defineProps({
  loader: { type: Boolean, default: false },
  sentSuccess: { type: Boolean, default: false },
});

const suggestion = ref("");
const errorSent = ref(false);

const sendSuggestions = () => {
  errorSent.value = false;

  if (!suggestion.value) {
    errorSent.value = true;
    return;
  }

  emit("postSuccess", suggestion.value);
};
</script>

<template>
  <main class="main-send-suggestion">
    <section v-if="sentSuccess" class="sent-suggestion-section">
      <div class="sent-suggestion-content">
        <p class="text-lg font-semibold uppercase">
          Sua sugestão foi recebida com sucesso
        </p>

        <Vue3Lottie
          :animation-data="rocket_animate"
          :height="200"
          :width="200"
          :auto-play="true"
          :loop="true"
        />

        <span class="flex flex-col gap-3 lg:text-justify">
          <p class="font-semibold">
            Nossa equipe irá avaliá-la com atenção e considerar sua
            implementação.
          </p>

          <p class="text-[12px]">
            Você irá receber um e-mail com as informações da solicitação e nossa
            equipe irá responder em até 30 dias
          </p>
        </span>

        <p class="font-bold">Agradecemos sua colaboração</p>
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
.main-send-suggestion {
  --fc-text: var(
    --_text,
    var(--color-text-primary, rgb(var(--text-base, 231 234 240)))
  );
  --fc-muted: var(
    --_muted,
    var(--color-text-muted, rgb(var(--text-muted, 148 163 184)))
  );

  position: relative;
}

.sent-suggestion-section {
  position: absolute;
  display: flex;
  z-index: 10;
  width: 100%;
  height: 100%;
  background-color: rgb(0 0 0 / 0.9);
  padding: 0.5rem;
  border-radius: 0.5rem;
  justify-content: center;
}

.sent-suggestion-content {
  display: flex;
  padding: 0.5rem;
  flex-direction: column;
  justify-content: space-between;
  text-align: center;
  color: var(--fc-muted);
}

.container-send-suggestion {
  height: 100%;
  background-color: var(
    --_panel,
    var(--color-surface-default, rgb(var(--bg-base-200, 32 44 51)))
  );
  padding: 0.5rem;
  border-radius: 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 8px;
  box-shadow: inset 2px 2px 8px rgba(0, 0, 0, 0.25),
    inset -1px -1px 4px rgba(255, 255, 255, 0.03);
}

.tool_tip_suggestion_error {
  text-align: center;
  color: var(--color-state-error, rgba(199, 40, 8, 0.977));
  transition: ease-in;
}

.input_send_suggestion {
  width: 100%;
  background-color: var(
    --_surface,
    var(--color-surface-elevated, rgb(var(--bg-base-100, 48 66 77)))
  );
  color: var(
    --_text,
    var(--color-text-primary, rgb(var(--text-base, 231 234 240)))
  );
  font-size: 12px;
  border-radius: 10px;
  padding: 12px;
  border: none;
  outline: none;
}

.input_send_suggestion::placeholder {
  color: var(
    --_muted,
    var(--color-text-muted, rgb(var(--text-muted, 148 163 184)))
  );
}

.textarea-send-suggestion {
  flex: 1;
  resize: none;
  overflow: hidden;
}

.submit-button-send-suggestion {
  background-color: var(
    --_primary,
    var(--color-brand-primary, var(--primary, #2563eb))
  );
  width: 100%;
  min-height: 40px;
  padding: 0.5rem;
  color: var(--_inverse, var(--color-text-inverse, #ffffff));
  border-radius: 10px;
  font-size: 0.875rem;
  border: none;
  cursor: pointer;
  transition: background-color 0.3s, box-shadow 0.2s;
  display: flex;
  justify-content: center;
  font-weight: 600;
}

.submit-button-send-suggestion:hover {
  background-color: var(--primary-alt, var(--color-brand-primary-alt, #1e40af));
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.3);
}

.header_send_suggestion {
  background: var(
    --_surface,
    var(--color-surface-elevated, rgb(var(--bg-base-100, 48 66 77)))
  );
  padding: 16px;
  border-radius: 10px;
  color: var(
    --_text,
    var(--color-text-primary, rgb(var(--text-base, 231 234 240)))
  );
  font-size: 0.9rem;
  line-height: 1rem;
  font-weight: 600;
  box-shadow: inset 1px 1px 4px rgba(0, 0, 0, 0.2),
    inset -1px -1px 3px rgba(255, 255, 255, 0.04);
}

.loader-suggestion {
  width: 24px;
  padding: 6px;
  aspect-ratio: 1;
  border-radius: 50%;
  background: var(--_inverse, #ffffff);
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
