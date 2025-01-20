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

const payload = ref({
  id: "b0c66ae4-44d8-4c67-979b-12d9e6830fd6",
  department: [
    {
      id: "3bd6b2f9-1b4d-4ea1-962b-19cd6b685bd1",
      name: "Depart Principal",
      entry: true,
      finish_reasons: [],
      view_permission: "current",
      permission: "normal",
    },
  ],
  internal_chat: { channel_id: null, unread: null },
  client: {
    id: "5f103fbe-e294-478d-8664-e5b6d13c215d",
    name: "leo",
    country: "BR",
    cellular: "+5511944446538",
    email: "leoaraujo311@gmail.com",
    timezone: "America/Sao_Paulo",
    days_until: 3,
  },
  login_status: "Online",
  is_me: true,
  average_grade: 10,
  name: "Léo",
  email: "leoaraujo311@gmail.com",
  status: true,
  can_delete_message: true,
  can_edit_message: false,
  archived: false,
  photo:
    "https://sm-click-client-files-dev.s3.amazonaws.com/clients/5f103fbe-e294-478d-8664-e5b6d13c215d/attendants/b0c66ae4-44d8-4c67-979b-12d9e6830fd6.png",
  allowed_time: {
    journeys: {
      friday: [{ from: "00:01", until: "23:59" }],
      monday: [{ from: "00:01", until: "23:59" }],
      sunday: [{ from: "00:01", until: "23:59" }],
      tuesday: [{ from: "00:01", until: "23:59" }],
      saturday: [{ from: "00:01", until: "23:59" }],
      thursday: [{ from: "00:01", until: "23:59" }],
      wednesday: [{ from: "00:01", until: "23:59" }],
    },
    timezone: "America/Sao_Paulo",
  },
  timezone: "America/Sao_Paulo",
  view_screening: true,
  view_contact: true,
  created_at: "2024-11-29T13:34:38.274732",
  updated_at: "2025-01-17T08:24:29.723325",
  mfa_enabled: false,
  mfa_configured: false,
  mfa_id: null,
});

const socketMessage = ref(null);
</script>

<template>
  <main
    class="h-screen flex-col bg-gray-200 text-white flex items-center justify-center mt-12"
  >
    <div class="bg-red-200 flex justify-center items-center w-full h-full ">
      <chatWindow :countMessages="10" :attendant="payload" :socket-message="socketMessage" />
    </div>
  </main>
</template>

<style scoped></style>
