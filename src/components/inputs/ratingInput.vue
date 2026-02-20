<template>
  <main
    ref="containerRef"
    :disabled="props.readonly"
    class="flex select-none"
    :style="{ gap: `${gap}px` }"
    @mouseleave.passive="!props.readonly && (hoverRating = 0)"
    @touchstart.passive="handleTouchStart"
    @touchmove.passive="handleTouchMove"
    @touchend.passive="handleTouchMoveEnd"
    @touchcancel.passive="handleTouchEnd"
  >
    <div
      v-for="star in 5"
      :key="star"
      class="relative"
      :class="{
        'cursor-pointer': !props.readonly,
        'cursor-default': props.readonly,
      }"
      :style="{ width: `${size}px`, height: `${size}px` }"
      @mousemove="!props.readonly && onHover($event, star)"
      @mouseleave="!props.readonly && (hoverRating = 0)"
      @click="!props.readonly && setRating($event, star)"
    >
      <!-- Base (cinza) -->
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        class="absolute top-0 left-0 color-disabled"
        :style="{ width: `${size}px`, height: `${size}px` }"
      >
        <path
          d="M13.849 4.22c-.684-1.626-3.014-1.626-3.698 0L8.397 8.387l-4.552.361c-1.775.14-2.495 2.331-1.142 3.477l3.468 2.937-1.06 4.392c-.413 1.713 1.472 3.067 2.992 2.149L12 19.35l3.897 2.354c1.52.918 3.405-.436 2.992-2.15l-1.06-4.39 3.468-2.938c1.353-1.146.633-3.336-1.142-3.477l-4.552-.36-1.754-4.17Z"
        />
      </svg>

      <!-- Preenchida (dinâmica) -->
      <div
        class="absolute top-0 left-0 h-full overflow-hidden transition-all duration-150"
        :class="{
          'text-primary': !hoverRating,
          'text-hover': hoverRating > 0,
        }"
        :style="{ width: fillWidth(star), height: `${size}px` }"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          :style="{ width: `${size}px`, height: `${size}px` }"
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
/**
 * 📋 Descrição:
 * Componente para atualizar a avaliação dos clientes.
 */

import { ref, computed, defineEmits, watch } from "vue";

const props = defineProps({
  modelValue: { type: Number, default: 0 },
  size: { type: Number, default: 24 }, // tamanho das estrelas (px)
  gap: { type: Number, default: 4 }, // espaçamento entre estrelas (px)
  onRate: { type: Function, default: null }, // função opcional a ser executada no clique
  readonly: { type: Boolean, default: false },
  starWeight: { type: Number, default: 1 }, // peso de cada estrela (1 padrão, 2 para nota 0-10)
});

const emit = defineEmits(["update:modelValue"]);

const rating = ref(props.modelValue);
const hoverRating = ref(0);
const isDragging = ref(false);
const containerRef = ref(null);

watch(
  () => props.modelValue,
  (val) => {
    rating.value = val;
  }
);


const displayRating = computed(() => hoverRating.value || rating.value);

function fillWidth(star) {
  // star: 1 a 5, cada estrela vale starWeight pontos
  const nota = displayRating.value;
  const starMin = (star - 1) * props.starWeight;
  const starMax = star * props.starWeight;
  if (nota >= starMax) return "100%";
  if (nota <= starMin) return "0%";
  // Preenchimento parcial
  return `${((nota - starMin) / props.starWeight) * 100}%`;
}

function onHover(e, star) {
  const rect = e.currentTarget.getBoundingClientRect();
  // Cada metade da estrela vale starWeight/2 pontos
  const isHalf = e.offsetX < rect.width / 2;
  hoverRating.value = (star - 1) * props.starWeight + (isHalf ? props.starWeight / 2 : props.starWeight);
}

function setRating(e, star) {
  const rect = e.currentTarget.getBoundingClientRect();
  const isHalf = e.offsetX < rect.width / 2;
  const newRating = (star - 1) * props.starWeight + (isHalf ? props.starWeight / 2 : props.starWeight);
  rating.value = rating.value === newRating ? 0 : newRating;
  emit("update:modelValue", rating.value);

  if (typeof props.onRate === "function") props.onRate(rating.value);
}

// --- Funções para suporte a touch/drag no mobile ---
function handleTouchStart() {
  if (!props.readonly) {
    isDragging.value = true;
  }
}

function handleTouchEnd() {
  isDragging.value = false;
  hoverRating.value = 0;
}

function handleTouchMove(e) {
  if (!isDragging.value || !containerRef.value || props.readonly) return;

  const touch = e.touches[0];
  const containerRect = containerRef.value.getBoundingClientRect();

  // --- Calcula a posição relativa do toque dentro do container ---
  const touchX = touch.clientX - containerRect.left;

  // --- Calcula qual estrela foi tocada baseado na largura total ---
  const starWidth = props.size + props.gap;
  const starIndex = Math.floor(touchX / starWidth) + 1;

  if (starIndex >= 1 && starIndex <= 5) {
    const starElement = containerRef.value.children[starIndex - 1];
    if (starElement) {
      const starRect = starElement.getBoundingClientRect();
      const isHalf = touch.clientX - starRect.left < starRect.width / 2;
      // Cada metade da estrela vale starWeight/2 pontos
      hoverRating.value = (starIndex - 1) * props.starWeight + (isHalf ? props.starWeight / 2 : props.starWeight);
    }
  }
}

function handleTouchMoveEnd() {
  if (isDragging.value && hoverRating.value > 0) {
    rating.value = rating.value === hoverRating.value ? 0 : hoverRating.value;
    emit("update:modelValue", rating.value);

    if (typeof props.onRate === "function") props.onRate(rating.value);
  }
  isDragging.value = false;
  hoverRating.value = 0;
}
</script>

<style scoped>
.color-disabled {
  color: #374151;
}
.text-primary {
  color: #eab308;
}
.text-hover {
  color: #ad840b;
}
</style>
