<script setup>
import { ref, defineEmits } from "vue";
import primarySelect from "~/components/selects/primary_select/primary_select.vue";

const titleChartsConfig = ref("Horizontal");

const emits = defineEmits(["closeSelect"]);

const closeSelect = (config) => {
  titleChartsConfig.value = config;
  emits("closeSelect");
};
</script>

<template>
  <primarySelect :config="{ title: 'léo' }" @closeSelect="closeSelect">
    <template #free-slot>
      <div class="space-y-2">
        <button
          :class="titleChartsConfig === 'Vertical' ? 'bg-green-500' : ''"
          @click="() => closeSelect('Vertical')"
          class="btn_select_widget_lib"
        >
          <p class="line-clamp-2 uppercase text-xs truncate">Vertical</p>
        </button>
        <button
          :class="titleChartsConfig !== 'Vertical' ? 'bg-green-500' : ''"
          @click="() => closeSelect('Horizontal')"
          class="btn_select_widget_lib"
        >
          <p class="line-clamp-2 uppercase text-xs truncate">Horizontal</p>
        </button>
      </div>
    </template>
  </primarySelect>
</template>

<style scoped>
.btn_select_widget_lib {
  @apply w-full p-2 rounded-md shadow-md shadow-base-300 bg-base-200 hover:bg-base-200/60;
}
</style>
