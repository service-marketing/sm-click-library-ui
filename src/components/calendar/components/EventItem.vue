<template>
  <component
    :is="currentMode"
    :ev="ev"
    :get-event-color="getEventColor"
    :view-only="viewOnly"
    :recurring-meta="recurringMeta"
    @open-message="$emit('open-message', $event)"
    @open-chat="$emit('open-chat', $event)"
    @delete-message="$emit('delete-message', $event)"
    @edit-reminder="$emit('edit-reminder', $event)"
  />
</template>

<script setup>
import { computed } from "vue";
import Compact from "./EventItem/Compact.vue";
import Sidebar from "./EventItem/Sidebar.vue";
import Agenda from "./EventItem/Agenda.vue";

const props = defineProps({
  ev: { type: Object, required: true },
  mode: { type: String, default: "compact" },
  getEventColor: { type: Function, default: null },
  viewOnly: { type: Boolean, default: false },
  recurringMeta: { type: Object, default: null },
});

defineEmits(["open-message", "open-chat", "delete-message", "edit-reminder"]);

const currentMode = computed(() => {
  if (props.mode === "compact") return Compact;
  if (props.mode === "sidebar") return Sidebar;
  return Agenda;
});
</script>
