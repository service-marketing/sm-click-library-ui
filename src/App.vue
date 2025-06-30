<script setup>
import { onMounted, ref } from "vue";
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
import RandomAvatar from "./components/avatar/randomAvatar.vue";
import MinModal from "./components/modals/min_modal/min_modal.vue";

import BtnNewUpdates from "./components/new-updates/btnNewUpdates.vue";
import PatchNotes from "./components/new-updates/patchNotes.vue";

const futureUpdates = ref([]);
const page = ref(1);
const test = ref(false);

const handleLoadMoreFutureUpdates = async ({ loaded, complete, page }) => {
  console.log("ativou");

  try {
    const res = await new Promise((resolve) => {
      setTimeout(() => {
        // Simula retorno de dados
        const fakeData = page < 8 ? [{ id: page, title: `Item ${page}` }] : [];
        resolve(fakeData);
      }, 1500);
    });

    if (res.length === 0) {
      complete();
    } else {
      futureUpdates.value.push(...res);
      loaded();
    }
  } catch (e) {
    console.error(e);
    complete();
  }
};
</script>

<template>
  <main class="h-screen w-screen justify-center items-center flex">
    <div class="w-full justify-center flex">
      <div class="bg-red-200 p-2 flex flex-col gap-12">
        <BtnNewUpdates
          sparkles
          type="attendant"
          @openNewUpdates="test ? (test = false) : (test = true)"
        />

        <BtnNewUpdates
          type="managerSideBarClose"
          @openNewUpdates="test ? (test = false) : (test = true)"
        />

        <BtnNewUpdates
          type="managerSideBarOpen"
          @openNewUpdates="test ? (test = false) : (test = true)"
        />
      </div>

      <PatchNotes
        v-if="test"
        :future_updates="null"
        :latest_update="null"
        :loader="false"
        :sentSuccess="true"
        @close="test = false"
        @postSuggestion="(data) => console.log('ai sim:', data)"
      />
    </div>
  </main>
</template>


