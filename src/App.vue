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
const test2 = ref([
  {
    id: "9dfa8d9e-2d5b-42e4-bcd5-a4e551a51788",
    system: "manager",
    type: "latest",
    title: "Tela de atualizações e melhorias",
    description:
      "Foi disponibilizada a nova tela onde o usuário poderá visualizar as atualizações passadas, as que estão previstas para serem lançadas e também sugerirem melhorias, funcionalidades ou correções.",
    flag: "new-feature",
    tutorial: null,
    launched_at: "2025-07-01",
  },
  {
    id: "91a6562c-1fbd-486e-a288-d54bd0f787a2",
    system: "manager",
    type: "latest",
    title: "Tela de atualizações e melhorias",
    description:
      "Foi disponibilizada a nova tela onde o usuário poderá visualizar as atualizações passadas, as que estão previstas para serem lançadas e também sugerirem melhorias, funcionalidades ou correções.",
    flag: "new-feature",
    tutorial: null,
    launched_at: "2025-08-27",
  },
  {
    id: "b291fa94-19ae-40a0-9075-804368fbafb8",
    system: "manager",
    type: "latest",
    title: "Adipiscing consectetur amet lorem consectetur.",
    description:
      "Consectetur lorem ipsum dolor adipiscing consectetur adipiscing sit lorem elit amet lorem consectetur ipsum sit.",
    flag: "new-feature",
    tutorial: null,
    launched_at: "2025-08-24",
  },
  {
    id: "92f803c9-bcb5-458c-b5a9-8292e20daff9",
    system: "manager",
    type: "latest",
    title: "Ipsum consectetur sit elit elit.",
    description:
      "Lorem ipsum elit lorem elit dolor lorem consectetur adipiscing consectetur ipsum dolor ipsum amet consectetur.",
    flag: "new-feature",
    tutorial: "https://smclick.com.br",
    launched_at: "2025-08-24",
  },
  {
    id: "b61aed36-03e4-40f7-b38f-012467354003",
    system: "manager",
    type: "latest",
    title: "Lorem elit ipsum lorem adipiscing.",
    description:
      "Sit amet sit consectetur amet elit ipsum amet consectetur amet adipiscing ipsum consectetur dolor lorem.",
    flag: "bug-fix",
    tutorial: "https://smclick.com.br",
    launched_at: "2025-08-24",
  },
  {
    id: "248d3fae-c637-4014-97db-a4c7ec508748",
    system: "manager",
    type: "latest",
    title: "Ipsum lorem sit lorem dolor.",
    description:
      "Dolor lorem elit amet amet ipsum lorem ipsum ipsum dolor sit adipiscing elit elit sit.",
    flag: "improvement",
    tutorial: "https://smclick.com.br",
    launched_at: "2025-08-23",
  },
]);
</script>

<template>
  <main class="h-screen w-screen justify-center items-center flex">
    <div class="w-full justify-center flex">
      <div class="bg-gray-900 p-2 flex flex-col gap-12">
        <BtnNewUpdates
          sparkles
          type="attendant"
          @openNewUpdates="test ? (test = false) : (test = true)"
        />

        <BtnNewUpdates
          sparkles
          type="managerSideBarClose"
          @openNewUpdates="test ? (test = false) : (test = true)"
        />

        <BtnNewUpdates
          sparkles
          type="managerSideBarOpen"
          @openNewUpdates="test ? (test = false) : (test = true)"
        />
      </div>

      <PatchNotes
        v-if="test"
        :future_updates="test2"
        :latest_update="test2"
        :loader="false"
        :sentSuccess="true"
        @close="test = false"
        @postSuggestion="(data) => console.log('ai sim:', data)"
      />
    </div>
  </main>
</template>


