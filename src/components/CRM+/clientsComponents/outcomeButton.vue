<script setup>
/**
 * 📋 Descrição:
 * Componente de botões para definir o resultado de uma oportunidade (Ganho ou Perdido).
 */

import { ref, computed } from "vue";

const props = defineProps({
  outcome: {
    type: String,
    default: null, // pode ser 'won', 'lost' ou null
  },
});

const emit = defineEmits(["update:outcome", "change"]);

async function testBtn(value) {
  // Se clicar no mesmo valor, enviamos null (desmarcar)
  const newValue = props.outcome === value ? null : value;

  emit("update:outcome", newValue);
  emit("change", newValue);
}

// Classe dinâmica para aplicar estilo condicional
const isWon = computed(() => props.outcome === "won");
const isLost = computed(() => props.outcome === "lost");
</script>

<template>
  <div class="outcome-buttons-wrapper">
    <button
      @click="testBtn('won')"
      :class="['button_outcome-base', { 'button_outcome-active-won': isWon }]"
      class="hover:bg-green-500/40 dark:hover:bg-green-300/40"
    >
      <p>Ganho</p>
      <svg
        :class="{ 'svg_outcome-active-won': isWon }"
        class="size-4"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        fill="none"
      >
        <path
          d="M3.16666 6.37502C3.74962 6.37502 4.2222 6.85073 4.22222 7.43752V15.9375C4.22222 16.5243 3.74963 17 3.16666 17H1.05555C0.472588 17 0 16.5243 0 15.9375V7.43752C1.50967e-05 6.85073 0.472597 6.37502 1.05555 6.37502H3.16666Z"
          fill="CurrentColor"
        />
        <path
          d="M9.48143 1.4454C9.79496 -0.637173 11.5194 0.143216 11.5194 0.143216C13.863 1.75728 13.005 4.80783 12.2832 6.13118H17.4424C19.5307 6.65187 19.0768 8.34354 18.5887 9.12465C19.5056 10.7905 18.4191 11.7716 17.7609 12.0538C18.1175 13.7717 17.0601 14.4178 16.4869 14.5264C16.8944 16.4004 15.5533 16.9564 14.8314 17H10.436C8.49997 16.9999 6.19055 16.1753 5.27777 15.7632V7.368C9.03523 5.6108 9.09933 3.98356 9.48143 1.4454Z"
          fill="CurrentColor"
        />
      </svg>
    </button>

    <button
      @click="testBtn('lost')"
      :class="['button_outcome-base', { 'button_outcome-active-lost': isLost }]"
      class="hover:bg-red-500/40 dark:hover:bg-red-300/40"
    >
      <svg
        :class="{ 'svg_outcome-active-lost': isLost }"
        class="size-4 mt-0.8"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 19"
        fill="none"
      >
        <path
          d="M15.8333 10.625C15.2504 10.625 14.7778 10.1493 14.7778 9.56249L14.7778 1.0625C14.7778 0.475698 15.2504 1.57955e-06 15.8333 1.63051e-06L17.9444 1.81507e-06C18.5274 1.86603e-06 19 0.475698 19 1.0625L19 9.56249C19 10.1493 18.5274 10.625 17.9444 10.625L15.8333 10.625Z"
          fill="CurrentColor"
        />
        <path
          d="M9.51857 15.5546C9.20504 17.6372 7.48065 16.8568 7.48065 16.8568C5.13698 15.2427 5.99503 12.1922 6.71681 10.8688L1.55759 10.8688C-0.530671 10.3481 -0.0768444 8.65646 0.411319 7.87535C-0.50562 6.20951 0.580926 5.22844 1.23906 4.94622C0.882549 3.22832 1.93994 2.5822 2.51315 2.47363C2.10564 0.59965 3.44673 0.0436064 4.16864 6.1075e-07L8.56403 9.95007e-07C10.5 0.000138493 12.8095 0.824657 13.7222 1.23682L13.7222 9.632C9.96477 11.3892 9.90067 13.0164 9.51857 15.5546Z"
          fill="CurrentColor"
        />
      </svg>
      <p>Perdido</p>
    </button>
  </div>
</template>

<style scoped>
.outcome-buttons-wrapper {
  display: flex;
  gap: 0.5rem;
  width: 100%;
}

.button_outcome-base {
  @apply min-w-0 flex-1 rounded-lg shadow shadow-gray-900 dark:shadow-gray-200 bg-base-300 px-2.5 py-1.5 transition flex justify-between items-center gap-1.5 text-[12px] font-semibold text-white/85 dark:text-black/75;
  min-height: 2.45rem;
}

.button_outcome-active-won {
  color: rgb(220 252 231 / 0.98);
  background-color: rgb(22 163 74 / 0.44);
}
.button_outcome-active-lost {
  color: rgb(254 226 226 / 0.98);
  background-color: rgb(220 38 38 / 0.42);
}

@media (max-width: 767px) {
  .button_outcome-base {
    min-height: 2.3rem;
    @apply rounded-lg;
  }
}
</style>
