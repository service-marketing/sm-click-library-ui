import { it } from "date-fns/locale";
import api from "~/utils/api";
import { crm_scheduled } from "~/utils/systemUrls";

// Títulos por função (tradução)
const FUNCTION_TITLES = {
  scheduled_messages: "Mensagem programada",
};
function functionTitle(fn) {
  return FUNCTION_TITLES[fn] || fn || "Evento";
}

export function sameYMD(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function yearMonthKey(dateLike) {
  const d = dateLike instanceof Date ? dateLike : new Date(dateLike);
  const y = d.getFullYear();
  const m = (d.getMonth() + 1).toString().padStart(2, "0");
  return `${y}-${m}`;
}

// "2025-11-22 12:28" -> Date local (sem timezone do browser bagunçar)
export function parseDateLocal(yyyy_mm_dd_hh_mm) {
  const [datePart, timePart] = String(yyyy_mm_dd_hh_mm || "")
    .trim()
    .split(" ");
  if (!datePart) return null;

  const [y, m, d] = datePart.split("-").map((x) => parseInt(x, 10));
  let hh = 0,
    mm = 0;
  if (timePart) {
    const [H, M] = timePart.split(":");
    hh = parseInt(H || "0", 10);
    mm = parseInt(M || "0", 10);
  }
  const dt = new Date(y, (m || 1) - 1, d || 1, hh, mm);
  return isNaN(dt.getTime()) ? null : dt;
}

// "2025-09-18T12:34:59.998999" -> Date (tenta manter local)
export function parseIsoWithMicrosSafe(isoStr) {
  if (!isoStr) return null;
  try {
    const cleaned = String(isoStr).replace(/(\.\d{3})\d+$/, "$1");
    const d = new Date(cleaned);
    return isNaN(d.getTime()) ? null : d;
  } catch {
    return null;
  }
}

export function formatTimeHM(dateLike) {
  if (!dateLike) return "";
  const d = dateLike instanceof Date ? dateLike : new Date(dateLike);
  if (isNaN(d.getTime())) return "";
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
}

function cryptoRandomId() {
  return "id-" + Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export function normalizeScheduledItem(item) {
  if (!item) return null;

  const params = item?.params || {};
  const schedule = params?.schedule || {};
  const info = item?.info || {};
  const entity = info?.entity || {};
  const department = info?.department || {};
  const instance = info?.instance || {};

  let dt = null;
  if (schedule?.time) dt = parseDateLocal(schedule.time);
  if (!dt && item?.next_execution_at)
    dt = parseIsoWithMicrosSafe(item.next_execution_at);
  if (!dt) return null;

  const firstMsg = Array.isArray(params?.message) ? params.message[0] : null;
  const textMsg = (firstMsg && (firstMsg.content || firstMsg.text)) || "";

  const funcName = item?.function || params?.function || "";
  const title = functionTitle(funcName);
  const content = (textMsg || "").trim();

  return {
    id: item?.id || cryptoRandomId(),
    date: dt,
    time: formatTimeHM(dt),
    type: item.function,
    status: item.status || null,

    title,
    content,

    functionName: funcName || null,
    chatId: params?.chat_id || info?.id || "",
    protocol: info?.protocol ?? "",

    contactName: entity?.name || "Contato",
    contactPhoto: entity?.photo || "",
    departmentName: department?.name || "",
    instanceName: instance?.name || "",

    raw: item,
  };
}

export function normalizeScheduledResponseV2(list = []) {
  const items = Array.isArray(list)
    ? list
    : Array.isArray(list.results)
      ? list.results
      : [];

  const out = [];
  for (const item of items) {
    const ev = normalizeScheduledItem(item);
    if (ev) out.push(ev);
  }
  out.sort((a, b) => a.date - b.date);
  return out;
}

function coerceHttps(url) {
  return url && url.startsWith("http://")
    ? url.replace(/^http:\/\//i, "https://")
    : url;
}

export async function fetchScheduledByMonth(
  baseUrl = "/crm_scheduled",
  yearMonth,
) {
  try {
    const ym = yearMonth || yearMonthKey(new Date());
    let url = `${baseUrl}?year_month=${encodeURIComponent(ym)}&page_size=10`;
    let allData = [];

    while (url) {
      const res = await api.get(url);
      const data = Array.isArray(res?.data)
        ? res.data
        : res?.data?.results || [];
      allData = allData.concat(data);

      url = coerceHttps(res?.data?.next || null);
    }

    return normalizeScheduledResponseV2(allData);
  } catch (error) {
    console.error("Error fetching scheduled events by month:", error);
    return [];
  }
}

export async function eraseScheduledEvent(
  baseUrl = "/crm_scheduled",
  eventOrId,
) {
  try {
    const id = eventOrId?.raw?.id ?? eventOrId?.id ?? eventOrId;
    if (id == null) throw new Error("ID inválido");

    const url = `${String(baseUrl).replace(/\/$/, "")}/${id}/`;
    const res = await api.delete(url);

    const ok = res?.status >= 200 && res.status < 300;
    return { ok, status: res?.status ?? 0 };
  } catch (error) {
    console.error("Error erasing scheduled event:", error);
    return { ok: false, status: 0 };
  }
}
