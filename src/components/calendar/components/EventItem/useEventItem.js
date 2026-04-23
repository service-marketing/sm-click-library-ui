import { computed } from "vue";
import { getEventColor as utilGetEventColor } from "../../utils/eventColors";
import { useAttendantStore } from "~/stores/attendantStore";
import { getFileIconType } from "../../useScheduledEvents";

export function useEventItem(props) {
  const attendantStore = useAttendantStore();

  const color = computed(() => {
    const fn = props.getEventColor || utilGetEventColor;
    return fn(props.ev);
  });

  const isSched = computed(() => props.ev?.type === "scheduled_messages");
  const isReminder = computed(() => props.ev?.type === "attendant_reminder");

  const isMe = computed(() => attendantStore.attendants.find((a) => a.is_me) || {});

  function attendantName(id) {
    const att = attendantStore.attendants.find((a) => a.id === id);
    if (!att) return "Desconhecido";
    if (att.id === isMe.value.id) return "Você";
    return att.name || "Desconhecido";
  }

  const agendaLine = computed(() => {
    const parts = [];
    if (props.ev?.contactName) parts.push(props.ev.contactName);
    parts.push(props.ev?.departmentName || "sem depto");
    return parts.join(" • ");
  });

  function fileTypeClass(file) {
    const type = getFileIconType(file?.fileName, file?.mimeType);
    return {
      "bg-sky-500/15 text-sky-400": type === "image",
      "bg-violet-500/15 text-violet-400": type === "video",
      "bg-emerald-500/15 text-emerald-400": type === "audio",
      "bg-red-500/15 text-red-400": type === "pdf",
      "bg-slate-500/15 text-slate-300": type === "file",
    };
  }

  return { color, isSched, isReminder, attendantName, agendaLine, fileTypeClass };
}
