<template>
  <EventItem
    :ev="normalizedEvent"
    :mode="props.mode"
    :recurring-meta="recurringMeta"
    @open-message="$emit('open-message', $event)"
    @open-chat="$emit('open-chat', $event)"
    @delete-message="$emit('delete-message', $event)"
    @edit-reminder="$emit('edit-reminder', $event)"
  />
</template>

<script setup>
import { computed } from "vue";
import EventItem from "./EventItem.vue";
import { formatTimeHM } from "../useScheduledEvents";

const props = defineProps({
  group: { type: Object, required: true },
  mode: { type: String, default: "sidebar" },
});

defineEmits(["open-message", "open-chat", "delete-message", "edit-reminder"]);

const representative = computed(() => props.group?.representative || {});

function nextExecutionDate() {
  if (props.group?.firstExecutionAt instanceof Date) return props.group.firstExecutionAt;
  if (representative.value?.date instanceof Date) return representative.value.date;
  return null;
}

const displayTitle = computed(() => {
  if (representative.value?.type === "attendant_reminder") {
    return (
      representative.value?.raw?.params?.message?.[0]?.title ||
      representative.value?.title ||
      "Lembrete recorrente"
    );
  }

  const contact = representative.value?.contactName || "Contato";
  const department = representative.value?.departmentName || "sem depto";
  return `${contact} • ${department}`;
});

const normalizedEvent = computed(() => {
  const date = nextExecutionDate();
  return {
    ...representative.value,
    date,
    time: date ? formatTimeHM(date) : representative.value?.time || "-",
  };
});

const recurringMeta = computed(() => ({
  title: displayTitle.value,
  statusTooltipTitle: "Evento",
  statusTooltipText: "Evento recorrente",
  useStatusIcon: true,
  showRecurrenceBadge: false,
}));

</script>
