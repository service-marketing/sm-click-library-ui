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
import dropFiles from "./components/intern-chat/dropFilesArea.vue";

import AudioRecorder from "./components/audio-misc/audioRecorder.vue";
</script>

<template>
  <dropFiles>
    <div class="h-screen flex bg-red-200">
      <button class="bg-red-200 p-3">
        <AudioRecorder
          :can-send-message="true"
          :attendant="attendant"
          :selectedAttendant="selectedAtendente"
          :sendAudioToAttendant="sendMessageToAtendente"
          @recording="(rec) => (isRecording = rec)"
          @b64Audio="(b64) => console.log(b64)"
          @audio-sent="(sent) => console.log(sent)"
        />
      </button>
    </div>
  </dropFiles>

  <!-- <main class="h-screen w-screen justify-center items-center flex">
    <div class="w-full justify-center flex">
      <div class="bg-blue-900 p-2 flex flex-col gap-12">
        <chatWindow mode="dark" />

        <BtnNewUpdates
          type="attendant"
          :sparkles="true"
          mode="dark"
          @openNewUpdates="console.log('open')"
        />
      </div>
    </div>
  </main> -->
</template>


