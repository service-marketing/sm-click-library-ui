<script setup>
import { ref } from "vue";
import primarySelect from "~/components/selects/primary_select/primary_select.vue";

const testRender = ref(false);
const toggleRender = () => {
  testRender.value = true;
};
</script>

<template>
  <main
    class="justify-center p-3 bg-blue-900 flex-col space-y-2 items-center h-screen"
  >
    <div class="bg-red-200 p-3 space-y-2 rounded-md">
      <primarySelect
        titleFreeSlot="teste select"
        :selectConfig="[{ chartsConfig: true }]"
      >
        <template #free-slot>
          <button
            @click="toggleRender"
            class="p-2 rounded-md bg-lib-base-300 w-full"
          >
            Open Modal
          </button>
        </template>
      </primarySelect>

      <primarySelect
        titleFreeSlot="Free Slot"
        :selectConfig="[{ freeSlot: true }]"
      >
        <template #free-slot>
          <button
            @click="toggleRender"
            class="p-2 rounded-md bg-lib-base-300 w-full"
          >
            Open Modal
          </button>
        </template>
      </primarySelect>
    </div>
  </main>
</template>

<style scoped>
</style>
