// Mapeamento estático de cores por tipo de evento
const FUNCTION_COLOR_MAP = {
  scheduled_messages: "#3b82f6", // azul
  attendant_reminder: "#f59e0b", // âmbar
};

const fallbackPalette = [
  "#10b981",
  "#06b6d4",
  "#22c55e",
  "#eab308",
  "#ef4444",
  "#84cc16",
  "#f472b6",
  "#0ea5e9",
  "#8b5cf6",
  "#64748b",
];

function hashStr(s = "") {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function getKeyForEvent(ev = {}) {
  const fn = ev.functionName || ev.function || ev?.params?.function;
  if (fn) return `fn:${fn}`;
  const dept =
    ev?.departmentName ||
    ev?.info?.department?.name ||
    ev?.info?.department?.id;
  if (dept) return `dept:${dept}`;
  const inst =
    ev?.instanceName || ev?.info?.instance?.name || ev?.info?.instance?.id;
  if (inst) return `inst:${inst}`;
  const prot = ev?.protocol ?? ev?.info?.protocol;
  if (prot != null) return `proto:${prot}`;
  const chat = ev?.chatId || ev?.params?.chat_id;
  if (chat) return `chat:${chat}`;
  return `misc`;
}

export function getEventColor(ev = {}) {
  const fn = ev.functionName || ev.function || ev?.params?.function;
  if (fn && Object.prototype.hasOwnProperty.call(FUNCTION_COLOR_MAP, fn)) {
    return FUNCTION_COLOR_MAP[fn];
  }
  const key = getKeyForEvent(ev);
  const idx = hashStr(String(key)) % fallbackPalette.length;
  return fallbackPalette[idx];
}

export const EVENT_COLOR_MAP = FUNCTION_COLOR_MAP;
