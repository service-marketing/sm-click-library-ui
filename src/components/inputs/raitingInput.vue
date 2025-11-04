<template>
  <main class="flex gap-1 select-none">
    <div
      v-for="star in 5"
      :key="star"
      class="relative size-6 cursor-pointer"
      @mousemove="onHover($event, star)"
      @mouseleave="hoverRating = 0"
      @click="setRating($event, star)"
    >
      <!-- Base (cinza) -->
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        class="absolute top-0 left-0 size-6 color-disabled"
      >
        <path
          d="M13.849 4.22c-.684-1.626-3.014-1.626-3.698 0L8.397 8.387l-4.552.361c-1.775.14-2.495 2.331-1.142 3.477l3.468 2.937-1.06 4.392c-.413 1.713 1.472 3.067 2.992 2.149L12 19.35l3.897 2.354c1.52.918 3.405-.436 2.992-2.15l-1.06-4.39 3.468-2.938c1.353-1.146.633-3.336-1.142-3.477l-4.552-.36-1.754-4.17Z"
        />
      </svg>

      <!-- Preenchida (dinâmica) -->
      <div
        class="absolute top-0 left-0 h-full overflow-hidden text-primary transition-all duration-150"
        :style="{ width: fillWidth(star) }"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          class="size-6"
        >
          <path
            d="M13.849 4.22c-.684-1.626-3.014-1.626-3.698 0L8.397 8.387l-4.552.361c-1.775.14-2.495 2.331-1.142 3.477l3.468 2.937-1.06 4.392c-.413 1.713 1.472 3.067 2.992 2.149L12 19.35l3.897 2.354c1.52.918 3.405-.436 2.992-2.15l-1.06-4.39 3.468-2.938c1.353-1.146.633-3.336-1.142-3.477l-4.552-.36-1.754-4.17Z"
          />
        </svg>
      </div>
    </div>
  </main>
</template>

<script setup>
import { ref, computed, defineEmits, watch } from "vue";

const props = defineProps({
  modelValue: { type: Number, default: 0 },
});

const emit = defineEmits(["update:modelValue"]);

const rating = ref(props.modelValue);
const hoverRating = ref(0);

watch(
  () => props.modelValue,
  (val) => {
    rating.value = val;
  }
);

const displayRating = computed(() => hoverRating.value || rating.value);

/**
 * Retorna o preenchimento (width) de cada estrela, baseado na nota
 */
function fillWidth(star) {
  const diff = displayRating.value - star + 1;
  if (diff >= 1) return "100%"; // cheia
  if (diff >= 0.5) return "50%"; // meia
  if (diff > 0) return `${diff * 100}%`; // fração menor (segurança)
  return "0%"; // vazia
}

/**
 * Detecta meia estrela ao passar o mouse
 */
function onHover(e, star) {
  const rect = e.currentTarget.getBoundingClientRect();
  const isHalf = e.offsetX < rect.width / 2;
  hoverRating.value = star - (isHalf ? 0.5 : 0);
}

/**
 * Define o valor de rating no clique
 */
function setRating(e, star) {
  const rect = e.currentTarget.getBoundingClientRect();
  const isHalf = e.offsetX < rect.width / 2;
  const newRating = star - (isHalf ? 0.5 : 0);

  // Se clicar na mesma nota, limpa
  rating.value = rating.value === newRating ? 0 : newRating;

  emit("update:modelValue", rating.value);
}
</script>

<style scoped>
.color-disabled {
  color: #374151; /* cinza */
}
.text-primary {
  color: #eab308; /* amarelo */
}
.size-6 {
  width: 24px;
  height: 24px;
}
</style>
