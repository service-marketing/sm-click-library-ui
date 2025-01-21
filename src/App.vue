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
  id: "3d020001-9feb-4b1f-9074-66c39833b901",
  department: [
    {
      id: "66c6eb3c-ba64-404e-8d7d-60441b4f4ef0",
      name: "Nao creioe",
      entry: false,
      finish_reasons: [
        { id: "eb10809e-a9e3-40be-8573-47e6e1b224c7", reason: "Ta caro" },
      ],
      view_permission: "current",
      permission: "normal",
    },
  ],
  internal_chat: { channel_id: null, unread: null },
  client: {
    id: "d2ddb1f9-eb9f-4faf-a127-477dc29ea272",
    name: "Leo",
    country: "BR",
    cellular: "+5511944446538",
    email: "leoaraujo311@gmail.com",
    timezone: "America/Sao_Paulo",
    days_until: 313,
  },
  login_status: "Online",
  is_me: true,
  average_grade: null,
  name: "Josep Cadura",
  email: "josepc@gmail.com",
  status: true,
  can_delete_message: false,
  can_edit_message: false,
  archived: false,
  photo: null,
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
  created_at: "2025-01-20T17:18:53.921742",
  updated_at: "2025-01-20T17:18:53.922798",
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
    <div class="bg-red-200 flex justify-center items-center w-full h-full">
      <chatWindow
        @unreadMessageEmit="(att) => console.log(att)"
        :countMessages="10"
        :attendant="payload"
        :socket-message="socketMessage"
      />
    </div>
  </main>
</template>

<style scoped></style>
