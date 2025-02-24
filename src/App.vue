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
import mobileChatWindow from "./components/intern-chat/mobileChatWindow.vue";
import FilterSelect from "./components/selects/filterSelect/filterSelect.vue";
</script>

<template>
  <main
    class="h-screen flex-col bg-gray-200 text-white flex items-center justify-center mt-12 p-8"
  >
    <simpleCard
      typeCard="success"
      :content="{
        title: 'Compra gerada',
        description:
          'Sua cobraça foi gerada e está disponivel no seu painel financeiro, realize o pagamento para liberação dos tokens nessa API Key!',
      }"
    />
  </main>
</template>

<style scoped></style>
