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
  const recurringMeta = computed(() => props.recurringMeta || null);

  const isMe = computed(() => attendantStore.attendants.find((a) => a.is_me) || {});

  function attendantName(id) {
    const att = attendantStore.attendants.find((a) => a.id === id);
    if (!att) return "Desconhecido";
    if (att.id === isMe.value.id) return "Você";
    return att.name || "Desconhecido";
  }

  const displayTitle = computed(() => {
    if (recurringMeta.value?.title) return recurringMeta.value.title;
    if (isSched.value) {
      const parts = [];
      if (props.ev?.contactName) parts.push(props.ev.contactName);
      parts.push(props.ev?.departmentName || "sem depto");
      return parts.join(" • ");
    }
    if (isReminder.value) {
      return props.ev?.raw?.params?.message?.[0]?.title || "Lembrete";
    }
    return "";
  });

  const agendaLine = computed(() => recurringMeta.value?.title || displayTitle.value);
  const displayTime = computed(() => recurringMeta.value?.timeLabel || props.ev?.time || "-");
  const typeLabel = computed(() => {
    if (recurringMeta.value?.typeLabel) return recurringMeta.value.typeLabel;
    return props.ev?.type === "attendant_reminder" ? "Lembrete" : "Mensagem programada";
  });
  const contentText = computed(() => {
    if (typeof recurringMeta.value?.content === "string") return recurringMeta.value.content;
    if (isReminder.value) return props.ev?.raw?.params?.message?.[0]?.content || "";
    return props.ev?.content || "";
  });
  const statusTooltipTitle = computed(() => recurringMeta.value?.statusTooltipTitle || "Status");
  const statusTooltipText = computed(() => recurringMeta.value?.statusTooltipText || (props.ev?.status === true ? "Ativo" : "Executado"));
  const useRecurringStatusIcon = computed(() => recurringMeta.value?.useStatusIcon === true);
  const showRecurrenceBadge = computed(() => recurringMeta.value?.showRecurrenceBadge !== false);

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

  return {
    color,
    isSched,
    isReminder,
    recurringMeta,
    attendantName,
    displayTitle,
    agendaLine,
    displayTime,
    typeLabel,
    contentText,
    statusTooltipTitle,
    statusTooltipText,
    useRecurringStatusIcon,
    showRecurrenceBadge,
    fileTypeClass,
  };
}
