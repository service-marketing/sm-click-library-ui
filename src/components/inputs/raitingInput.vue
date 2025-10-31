<template>
  <main class="flex gap-1">
    <div
      v-for="star in 5"
      :key="star"
      class="relative size-6 cursor-pointer"
      @mousemove="onHover($event, star)"
      @mouseleave="hoverRating = 0"
      @click="setRating($event, star)"
    >
      <!-- estrela cheia -->
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        class="absolute top-0 left-0 size-6 transition-all duration-200"
        :class="{
          'text-primary':
            star <= Math.floor(displayRating) ||
            (star - 0.5 === displayRating && halfActive),
          'color-disabled': star > displayRating,
        }"
      >
        <path
          d="M13.849 4.22c-.684-1.626-3.014-1.626-3.698 0L8.397 8.387l-4.552.361c-1.775.14-2.495 2.331-1.142 3.477l3.468 2.937-1.06 4.392c-.413 1.713 1.472 3.067 2.992 2.149L12 19.35l3.897 2.354c1.52.918 3.405-.436 2.992-2.15l-1.06-4.39 3.468-2.938c1.353-1.146.633-3.336-1.142-3.477l-4.552-.36-1.754-4.17Z"
        />
      </svg>

      <!-- metade preenchida (caso meia estrela) -->
      <svg
        v-if="displayRating % 1 !== 0 && Math.ceil(displayRating) === star"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        class="absolute top-0 left-0 size-6 overflow-hidden text-primary"
        style="clip-path: inset(0 50% 0 0)"
      >
        <path
          d="M13.849 4.22c-.684-1.626-3.014-1.626-3.698 0L8.397 8.387l-4.552.361c-1.775.14-2.495 2.331-1.142 3.477l3.468 2.937-1.06 4.392c-.413 1.713 1.472 3.067 2.992 2.149L12 19.35l3.897 2.354c1.52.918 3.405-.436 2.992-2.15l-1.06-4.39 3.468-2.938c1.353-1.146.633-3.336-1.142-3.477l-4.552-.36-1.754-4.17Z"
        />
      </svg>
    </div>
  </main>
</template>

<script setup>
import { ref, computed, defineEmits } from "vue";

const rating = ref(0);
const hoverRating = ref(0);
const halfActive = ref(false);
const emit = defineEmits(["update:rating"]);

const displayRating = computed(() => hoverRating.value || rating.value);

function onHover(e, star) {
  const rect = e.currentTarget.getBoundingClientRect();
  const isHalf = e.offsetX < rect.width / 2;
  hoverRating.value = star - (isHalf ? 0.5 : 0);
  halfActive.value = isHalf;
}

function setRating(e, star) {
  const rect = e.currentTarget.getBoundingClientRect();
  const isHalf = e.offsetX < rect.width / 2;
  const newRating = star - (isHalf ? 0.5 : 0);

  // mesmo clique duas vezes para limpar
  if (rating.value === newRating) {
    rating.value = 0;
  } else {
    rating.value = newRating;
  }

  emit("update:rating", rating.value);
}
</script>

<style scoped>
.color-disabled {
  color: #111b21;
}
.size-6 {
  width: 24px;
  height: 24px;
}
.text-primary {
  color: #facc15; /* Exemplo amarelo */
}
</style>
