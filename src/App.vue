<script setup>
import { ref } from "vue";
import primarySelect from "~/components/selects/primary_select/primary_select.vue";
import chartsSelect from "~/components/selects/chart_direction_select/chart_direction_select.vue";
import simpleModal from "~/components/modals/simple_modal/simple_modal.vue";
import simpleCard from "~/components/cards/simple_card/simple_card.vue";
import instanceSelect from "~/components/selects/instance_select/index.vue"
import calendar from "./components/calendar/calendar.vue";
const testRender = ref(false);
const toggleRender = () => {
  testRender.value = true;
};
</script>

<template>
  <main
    class="h-screen overflow-auto"
  >
    <!-- <div class="bg-base-200 p-3 space-y-2 rounded-md">
      <span class="text-white">Selects</span>

      <instanceSelect/>

      <section class="text-white">
        primary_select
        <primarySelect
          :config="{
            title: 'léo',
          }"
        >
          <template #free-slot>
            <button
              @click="toggleRender"
              class="p-2 rounded-md bg-base-300 w-full"
            >
              Open Modal
            </button>
          </template>
        </primarySelect>
      </section>

      <section class="text-white">
        chart_direction_select
        <chartsSelect />
      </section>
    </div> -->
    <calendar/>
    <!-- <simpleModal :isOpen="true">
      <template #body>
        <simpleCard
          success
          :content="{ title: 'informações', description: 'coisa linda' }"
        />
      </template>
    </simpleModal> -->
  </main>
</template>

<style scoped>
</style>
