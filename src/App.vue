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

const loader = ref(false);
const qrGenerated = ref(false);
const test = () => {
  loader.value = true;
  setTimeout(() => {
    loader.value = false;
    qrGenerated.value = true;
  }, 5000);
};
</script>

<template>
  <main class="h-screen bg-gray-900 text-white justify-center flex">
    <chatWindow />
    <!-- <calendar v-if="false" /> -->
    <MfaQrCode
      :dimensions="[32, 32]"
      :generated="qrGenerated"
      @generateQR="test"
      :loading="loader"
    />
    <!-- <MFA eventHandling="check" @filled="test" /> -->
  </main>
</template>

<style scoped>
</style>
