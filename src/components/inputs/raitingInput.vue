<template>
  <main class="flex select-none" :style="{ gap: `${gap}px` }">
    <div
      v-for="star in 5"
      :key="star"
      class="relative cursor-pointer"
      :style="{ width: `${size}px`, height: `${size}px` }"
      @mousemove="onHover($event, star)"
      @mouseleave="hoverRating = 0"
      @click="setRating($event, star)"
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
        class="absolute top-0 left-0 h-full overflow-hidden text-primary transition-all duration-150"
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
import { ref, computed, defineEmits, watch } from "vue";

const props = defineProps({
  modelValue: { type: Number, default: 0 },
  size: { type: Number, default: 24 }, // tamanho das estrelas (px)
  gap: { type: Number, default: 4 }, // espaçamento entre estrelas (px)
  onRate: { type: Function, default: null }, // função opcional a ser executada no clique
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

function fillWidth(star) {
  const diff = displayRating.value - star + 1;
  if (diff >= 1) return "100%";
  if (diff >= 0.5) return "50%";
  if (diff > 0) return `${diff * 100}%`;
  return "0%";
}

function onHover(e, star) {
  const rect = e.currentTarget.getBoundingClientRect();
  const isHalf = e.offsetX < rect.width / 2;
  hoverRating.value = star - (isHalf ? 0.5 : 0);
}

function setRating(e, star) {
  const rect = e.currentTarget.getBoundingClientRect();
  const isHalf = e.offsetX < rect.width / 2;
  const newRating = star - (isHalf ? 0.5 : 0);

  rating.value = rating.value === newRating ? 0 : newRating;
  emit("update:modelValue", rating.value);

  // Executa ação customizada se a função existir
  if (typeof props.onRate === "function") {
    props.onRate(rating.value);
  }
}
</script>

<style scoped>
.color-disabled {
  color: #374151;
}
.text-primary {
  color: #eab308;
}
</style>
