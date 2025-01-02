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
import departSelect from "./components/selects/departmentSelect/departSelect.vue";
import attendantSelect from "./components/selects/attendantSelect/attendantSelect.vue";
import chatWindow from "./components/intern-chat/chatWindow.vue";
import FilterSelect from "./components/selects/filterSelect/filterSelect.vue";
</script>

<template>
  <main
    class="h-screen flex-col bg-gray-200 text-white flex items-center justify-center"
  >
    <div class="bg-red-200 flex justify-center items-center w-full h-full">
      <FilterSelect> teste </FilterSelect>
    </div>
  </main>
</template>

<style scoped></style>
