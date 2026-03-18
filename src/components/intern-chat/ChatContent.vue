<template>
  <div :class="{ 'h-full': isMobile }" class="chat-content-wrapper">
    <loading v-if="showChatLoading" />

    <template v-else-if="selectedAttendant && !showChatLoading">
      <div class="h-full">
        <DropFilesArea
          ref="dropFilesRef"
          :isMobile="isMobile"
          :attendant="currentAttendant"
          :selectedAttendant="selectedAttendant"
          :sendFilesToAttendant="sendFilesToAttendant"
        >
          <ChatMessages
            :isMobile="isMobile"
            :isLoadingMessages="isLoadingMessages"
            :attendant="currentAttendant"
            :selectedAttendant="selectedAttendant"
            :loadMessagesForAtendente="loadMessagesForAtendente"
            :sendMessageToAtendente="sendMessageToAtendente"
            :hasNextPageForAtendente="hasNextPageForAtendente"
            :downloadFilesMobile="downloadFilesMobile"
            :openMobilePdf="openMobilePdf"
            :listAttendancesByGroup="listAttendancesByGroup"
            @voltar="$emit('voltar')"
            @send-files="$emit('send-files')"
          />
        </DropFilesArea>
      </div>
    </template>

    <slot name="modals" />

    <ChatList
      v-if="!selectedAttendant"
      v-model:currentList="currentListModel"
      v-model:searchQuery="searchQueryModel"
      :mobile="isMobile"
      :currentAttendant="currentAttendant"
      :listAttendants="listAttendants"
      :listGroups="listGroups"
    />
  </div>
</template>

<script setup>
import { computed } from "vue";
import ChatList from "./ChatList.vue";
import ChatMessages from "./ChatMessages.vue";
import loading from "./loading.vue";
import DropFilesArea from "./dropFilesArea.vue";

const props = defineProps({
  isMobile: { type: Boolean, default: false },
  showChatLoading: { type: Boolean, default: false },
  selectedAttendant: { type: Object, default: null },
  currentAttendant: { type: Object, default: null },
  isLoadingMessages: { type: Boolean, default: false },
  listAttendants: { type: Array, default: () => [] },
  listGroups: { type: Array, default: () => [] },
  listAttendancesByGroup: { type: Array, default: () => [] },
  currentList: { type: String, default: "atendentes" },
  searchQuery: { type: String, default: "" },
  // Funções
  sendFilesToAttendant: { type: Function, default: () => {} },
  loadMessagesForAtendente: { type: Function, default: () => {} },
  sendMessageToAtendente: { type: Function, default: () => {} },
  hasNextPageForAtendente: { type: Function, default: () => false },
  downloadFilesMobile: { type: Function, default: null },
  openMobilePdf: { type: Function, default: null },
});

const emit = defineEmits([
  "voltar",
  "send-files",
  "update:currentList",
  "update:searchQuery",
]);

const currentListModel = computed({
  get: () => props.currentList,
  set: (val) => emit("update:currentList", val),
});

const searchQueryModel = computed({
  get: () => props.searchQuery,
  set: (val) => emit("update:searchQuery", val),
});

import { ref, defineExpose } from "vue";
const dropFilesRef = ref(null);

defineExpose({
  chooseFiles: () => dropFilesRef.value?.chooseFiles(),
});
</script>

<style scoped>
.chat-content-wrapper {
  height: 100%;
}
</style>
