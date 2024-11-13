<script setup>
import { ref } from "vue";
import primarySelect from "~/components/selects/primary_select/primary_select.vue";
import chartsSelect from "~/components/selects/chart_direction_select/chart_direction_select.vue";
import simpleModal from "~/components/modals/simple_modal/simple_modal.vue";
import simpleCard from "~/components/cards/simple_card/simple_card.vue";
import instanceSelect from "~/components/selects/instance_select/index.vue";
import calendar from "./components/calendar/calendar.vue";
import MFA from "./components/mfa/mfa.vue";
import MfaQrCode from "./components/mfa/mfaQrCode.vue";
import chatWindow from "./components/intern-chat/chatWindow.vue";
import departSelect from "./components/selects/departmentSelect/departSelect.vue";
import attendantSelect from "./components/selects/attendantSelect/attendantSelect.vue";

const showModal = ref(false);
</script>

<template>
  <main class="h-screen bg-gray-200 text-white flex">
    <button @click="showModal = true" class="bg-red-200">Abrir modal</button>

    <simpleModal :isOpen="showModal" @update:isOpen="showModal = $event">
      <template v-slot:body>
        <div class="flex justify-between w-full">
          <div>IHUUUUUUUUUUUUUUUUUUUUUUUUUUUU</div>
        </div>
      </template>
      <template v-slot:footer>
        <div class="flex">
          <div>Bobão</div>
          <div>Bobão</div>
        </div>
      </template>
    </simpleModal>
  </main>
</template>

<style scoped></style>
