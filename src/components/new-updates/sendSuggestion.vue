<script setup>
import { ref } from "vue";

const emit = defineEmits(["open-new-updates"]);

const openNewUpdates = () => {
  emit("open-new-updates");
};
</script>

<template>
  <main class="container-send-suggestion">
    <h1 class="header_send_suggestion">Envie sua sugestão para nós</h1>

    <section class="form-grid-send-suggestion">
      <input class="input_send_suggestion" placeholder="Seu nome" type="text" />
      <input
        class="input_send_suggestion"
        placeholder="Segmento da sua empresa"
        type="text"
      />
      <div class="textarea-container-send-suggestion">
        <textarea
          class="input_send_suggestion textarea-send-suggestion"
          placeholder="gostaria que vocês adicionassem..."
          type="text"
        ></textarea>

        <span class="char-count-send-suggestion"> 0/100 </span>
      </div>
    </section>

    <label class="terms-send-suggestion" for="termsId">
      <input id="termsId" type="checkbox" />
      <p class="terms-text-send-suggestion">
        Eu aceito os termos e condições da
        <a class="link-send-suggestion">SM Click</a>
      </p>
    </label>

    <button class="submit-button-send-suggestion">Enviar</button>
  </main>
</template>

<style scoped>
.container-send-suggestion {
  background-color: #374151;
  padding: 0.5rem;
  border-radius: 0.375rem;
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.form-grid-send-suggestion {
  display: grid;
  grid-template-rows: repeat(8, 1fr);
  gap: 0.375rem;
}

.input_send_suggestion {
  width: 100%;
  background-color: #1f2937;
  color: white;
  font-size: 16px;
  border-radius: 0.375rem;
  padding: 0.5rem;
  border: none;
  outline: none;
}

.input_send_suggestion::placeholder {
  color: #9ca3af;
}

.input_send_suggestion:focus {
  border: 1px solid #111827;
}

.textarea-container-send-suggestion {
  grid-row: span 6;
  position: relative;
}

.textarea-send-suggestion {
  resize: none;
  overflow: hidden;
  height: 100%;
  min-height: 20rem;
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
  background-color: #2563eb;
  width: 100%;
  padding: 0.5rem;
  color: white;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  border: none;
  cursor: pointer;
  transition: background-color 0.3s;
}

.submit-button-send-suggestion:hover {
  background-color: #1e40af;
}

.header_send_suggestion {
  background: #83878b1a;
  padding: 8px;
  border-radius: 0.375rem;
  color: white;
}
</style>
