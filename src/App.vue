<script setup>
import { ref } from "vue";
import primarySelect from "~/components/selects/primary_select/primary_select.vue";
import SimpleModal from "~/components/modals/simple_modal/simple_modal.vue";

const testRender = ref(false);
const toggleRender = () => {
  testRender.value = true;
};
</script>

<template>
  <!-- <primarySelect
      titleFreeSlot="teste select"
      :selectConfig="[{ freeSlot: true, chartsConfig: true }]"
    >
      <template #free-slot>
        <button @click="toggleRender" class="p-2 rounded-md bg-base-300 w-full">
          Open Modal
        </button>
      </template>
    </primarySelect> -->
  <main
    class="justify-center p-3 bg-blue-900 flex-col space-y-2 items-center h-screen"
  >
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

    <SimpleModal :isOpen="testRender" @update:isOpen="testRender = $event">
      <template #header>
        <div class="text-white">slot do header</div>
      </template>
      <template #body>
        <div>slot do body</div>
      </template>
      <template #footer>
        <div>slot do footer</div>
      </template>
    </SimpleModal>
  </main>
</template>

<style scoped>
</style>
