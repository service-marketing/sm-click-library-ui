import { it } from "date-fns/locale";
import api from "~/utils/api";
import { crm_scheduled } from "~/utils/systemUrls";

// Títulos por função (tradução)
const FUNCTION_TITLES = {
  scheduled_messages: "Mensagem programada",
  attendant_reminder: "Lembretes",
};
export function functionTitle(fn) {
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

  const msgParam = params?.message;
  let textMsg = "";
  if (Array.isArray(msgParam)) textMsg = msgParam[0]?.content?.trim() || "";
  else if (Array.isArray(msgParam?.text)) textMsg = msgParam.text[0]?.content?.trim() || "";
  else if (Array.isArray(msgParam?.text?.text)) textMsg = msgParam.text.text[0]?.content?.trim() || "";

  const funcName = item?.function || params?.function || "";
  const title = functionTitle(funcName);
  const content = (textMsg || "").trim();

  return {
    id: item?.id || cryptoRandomId(),
    date: dt,
    time: formatTimeHM(dt),
    type: item.function,
    status: item.status || null,
    scheduled_by: params.scheduled_by,

    title,
    content,

    functionName: funcName || null,
    chatId: params?.chat_id || info?.id || "",
    protocol: info?.protocol ?? "",

    contactName: entity?.name || "Contato",
    contactPhoto: entity?.photo || "",
    departmentName: department?.name || "",
    departmentId: department?.id || null,
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

// ─── Schedule label helpers ───────────────────────────────────────────────────

const _WEEK_DAYS = [
  { value: 1, label: "Segunda-feira" },
  { value: 2, label: "Terça-feira" },
  { value: 3, label: "Quarta-feira" },
  { value: 4, label: "Quinta-feira" },
  { value: 5, label: "Sexta-feira" },
  { value: 6, label: "Sábado" },
  { value: 0, label: "Domingo" },
];

const _MONTHS_LABELS = [
  { value: 1, label: "Janeiro" }, { value: 2, label: "Fevereiro" },
  { value: 3, label: "Março" }, { value: 4, label: "Abril" },
  { value: 5, label: "Maio" }, { value: 6, label: "Junho" },
  { value: 7, label: "Julho" }, { value: 8, label: "Agosto" },
  { value: 9, label: "Setembro" }, { value: 10, label: "Outubro" },
  { value: 11, label: "Novembro" }, { value: 12, label: "Dezembro" },
];

function _firstCronValue(part, fallback) {
  if (!part || part === "*") return fallback;
  if (part.startsWith("*/")) return fallback;
  const value = Number(part.split(",")[0]);
  return Number.isNaN(value) ? fallback : value;
}

function _sanitizeEveryN(value, type) {
  const max = type === "minute" ? 59 : 23;
  const numeric = Number(value) || 1;
  return Math.min(Math.max(numeric, 1), max);
}

function _parseCronExpression(expression) {
  const state = { period: "day", everyN: 1, minute: 0, hour: 9, weekDay: 1, monthDay: 1, month: 1 };
  if (!expression?.trim()) return state;
  const parts = expression.trim().split(/\s+/);
  if (parts.length !== 5) return state;
  const [minP, hourP, domP, monP, dowP] = parts;
  if (monP !== "*") {
    return { ...state, period: "year", month: _firstCronValue(monP, 1), monthDay: _firstCronValue(domP, 1), hour: _firstCronValue(hourP, 9), minute: _firstCronValue(minP, 0) };
  }
  if (dowP !== "*") {
    return { ...state, period: "week", weekDay: _firstCronValue(dowP, 1), hour: _firstCronValue(hourP, 9), minute: _firstCronValue(minP, 0) };
  }
  if (domP !== "*") {
    return { ...state, period: "month", monthDay: _firstCronValue(domP, 1), hour: _firstCronValue(hourP, 9), minute: _firstCronValue(minP, 0) };
  }
  if (hourP.startsWith("*/")) {
    return { ...state, period: "hour", everyN: _sanitizeEveryN(hourP.slice(2), "hour"), minute: _firstCronValue(minP, 0) };
  }
  if (minP.startsWith("*/") || minP === "*") {
    return { ...state, period: "minute", everyN: minP.startsWith("*/") ? _sanitizeEveryN(minP.slice(2), "minute") : 1 };
  }
  if (hourP === "*") {
    return { ...state, period: "hour", everyN: 1, minute: _firstCronValue(minP, 0) };
  }
  return { ...state, period: "day", hour: _firstCronValue(hourP, 9), minute: _firstCronValue(minP, 0) };
}

function _getCronDescription(state) {
  const h = String(state.hour).padStart(2, "0");
  const m = String(state.minute).padStart(2, "0");
  const previewTime = `${h}:${m}`;
  switch (state.period) {
    case "minute":
      return state.everyN === 1 ? "Executa a cada minuto." : `Executa a cada ${state.everyN} minutos.`;
    case "hour":
      return state.everyN === 1
        ? `Executa a cada hora, no minuto ${String(state.minute).padStart(2, "0")}.`
        : `Executa a cada ${state.everyN} horas, no minuto ${String(state.minute).padStart(2, "0")}.`;
    case "day":
      return `Executa todos os dias às ${previewTime}.`;
    case "week": {
      const wd = _WEEK_DAYS.find((w) => w.value === state.weekDay);
      const isFeminine = wd && (wd.value === 3 || wd.value === 4 || wd.value === 5);
      return `Executa tod${isFeminine ? "a" : "o"} ${wd?.label?.toLowerCase() ?? state.weekDay} às ${previewTime}.`;
    }
    case "month":
      return `Executa todo mês no dia ${state.monthDay} às ${previewTime}.`;
    case "year": {
      const mo = _MONTHS_LABELS.find((mo) => mo.value === state.month);
      return `Executa todo ano em ${mo?.label?.toLowerCase() ?? state.month}, dia ${state.monthDay}, às ${previewTime}.`;
    }
    default:
      return "";
  }
}

function _parseScheduleTime(value) {
  if (value instanceof Date) return isNaN(value.getTime()) ? null : value;
  if (typeof value === "string") {
    const atMatch = /^at\((\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2})(?::(\d{2}))?\)$/.exec(value.trim());
    if (atMatch) {
      const [, y, mo, d, hh, mm, ss = "0"] = atMatch;
      return new Date(+y, +mo - 1, +d, +hh, +mm, +ss, 0);
    }
    const m2 = /^(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2})/.exec(value);
    if (m2) {
      const [, y, mo, d, hh, mm] = m2;
      return new Date(+y, +mo - 1, +d, +hh, +mm, 0, 0);
    }
  }
  const date = new Date(value);
  return isNaN(date.getTime()) ? null : date;
}

function _formatScheduleLabel(schedule = {}) {
  const scheduleTime = _parseScheduleTime(schedule.time) || _parseScheduleTime(schedule.cron);
  if (scheduleTime) {
    const datePart = scheduleTime.toLocaleDateString("pt-BR");
    const timePart = scheduleTime.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
    return `${datePart} ${timePart}`;
  }
  if (schedule.cron) return `CRON: ${schedule.cron}`;
  return "Sem data definida";
}

export function isRecurringSchedule(schedule = {}) {
  return typeof schedule?.cron === "string" && !!schedule.cron.trim() && !schedule.cron.startsWith("at(");
}

export function getScheduleRecurrenceLabel(schedule = {}) {
  return isRecurringSchedule(schedule) ? "Recorrente" : "Única";
}

export function getScheduleDetailsLabel(schedule = {}) {
  if (isRecurringSchedule(schedule)) {
    return _getCronDescription(_parseCronExpression(schedule.cron.trim()));
  }
  return _formatScheduleLabel(schedule);
}

function _roundToMinute(dateLike) {
  const d = dateLike instanceof Date ? new Date(dateLike) : new Date(dateLike);
  if (isNaN(d.getTime())) return null;
  d.setSeconds(0, 0);
  return d;
}

function _startOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0);
}

function _dayKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
    date.getDate(),
  ).padStart(2, "0")}`;
}

function _dateAtMinutes(dayDate, minuteOfDay) {
  const hours = Math.floor(minuteOfDay / 60);
  const minutes = minuteOfDay % 60;
  return new Date(
    dayDate.getFullYear(),
    dayDate.getMonth(),
    dayDate.getDate(),
    hours,
    minutes,
    0,
    0,
  );
}

function _compareYMD(a, b) {
  return _dayKey(a).localeCompare(_dayKey(b));
}

function _buildMinuteDayStats(dayDate, state, anchor, previewLimit) {
  const every = Math.max(1, state.everyN || 1);
  const dayStart = _startOfDay(dayDate);
  const sameDayAsAnchor = sameYMD(dayDate, anchor);
  const cutoffMinutes = sameDayAsAnchor
    ? Math.max(0, Math.ceil((anchor.getTime() - dayStart.getTime()) / 60000))
    : 0;
  const firstMinute = Math.ceil(cutoffMinutes / every) * every;
  const lastMinute = 23 * 60 + 59;

  if (firstMinute > lastMinute) {
    return { count: 0, previewTimes: [], firstExecutionAt: null, lastExecutionAt: null };
  }

  const count = Math.floor((lastMinute - firstMinute) / every) + 1;
  const previewTimes = [];
  for (let i = 0; i < Math.min(count, previewLimit); i++) {
    previewTimes.push(formatTimeHM(_dateAtMinutes(dayDate, firstMinute + i * every)));
  }

  return {
    count,
    previewTimes,
    firstExecutionAt: _dateAtMinutes(dayDate, firstMinute),
    lastExecutionAt: _dateAtMinutes(dayDate, firstMinute + (count - 1) * every),
  };
}

function _buildHourDayStats(dayDate, state, anchor, previewLimit) {
  const every = Math.max(1, state.everyN || 1);
  const minute = Math.max(0, Math.min(59, state.minute || 0));
  const candidates = [];

  for (let hour = 0; hour < 24; hour += every) {
    candidates.push(new Date(
      dayDate.getFullYear(),
      dayDate.getMonth(),
      dayDate.getDate(),
      hour,
      minute,
      0,
      0,
    ));
  }

  const filtered = candidates.filter((candidate) => candidate.getTime() >= anchor.getTime());
  if (!filtered.length) {
    return { count: 0, previewTimes: [], firstExecutionAt: null, lastExecutionAt: null };
  }

  return {
    count: filtered.length,
    previewTimes: filtered.slice(0, previewLimit).map(formatTimeHM),
    firstExecutionAt: filtered[0],
    lastExecutionAt: filtered[filtered.length - 1],
  };
}

function _buildSingleExecutionDayStats(dayDate, occurrenceDate, anchor) {
  if (!sameYMD(dayDate, occurrenceDate) || occurrenceDate.getTime() < anchor.getTime()) {
    return { count: 0, previewTimes: [], firstExecutionAt: null, lastExecutionAt: null };
  }

  return {
    count: 1,
    previewTimes: [formatTimeHM(occurrenceDate)],
    firstExecutionAt: occurrenceDate,
    lastExecutionAt: occurrenceDate,
  };
}

export function getRecurringDayStats(event, dayDate, options = {}) {
  const previewLimit = Math.max(1, Number(options.previewLimit) || 4);
  const schedule = event?.raw?.params?.schedule || event?.params?.schedule || {};
  if (!isRecurringSchedule(schedule)) return null;

  const anchor = _roundToMinute(event?.date || event?.next_execution_at);
  if (!anchor) return null;

  const probeDay = new Date(dayDate.getFullYear(), dayDate.getMonth(), dayDate.getDate());
  if (_compareYMD(probeDay, anchor) < 0) {
    return { count: 0, previewTimes: [], firstExecutionAt: null, lastExecutionAt: null };
  }

  const state = _parseCronExpression(schedule.cron.trim());
  switch (state.period) {
    case "minute":
      return _buildMinuteDayStats(probeDay, state, anchor, previewLimit);
    case "hour":
      return _buildHourDayStats(probeDay, state, anchor, previewLimit);
    case "day": {
      const occurrence = new Date(
        probeDay.getFullYear(),
        probeDay.getMonth(),
        probeDay.getDate(),
        state.hour || 0,
        state.minute || 0,
        0,
        0,
      );
      return _buildSingleExecutionDayStats(probeDay, occurrence, anchor);
    }
    case "week": {
      if (probeDay.getDay() !== state.weekDay) {
        return { count: 0, previewTimes: [], firstExecutionAt: null, lastExecutionAt: null };
      }
      const occurrence = new Date(
        probeDay.getFullYear(),
        probeDay.getMonth(),
        probeDay.getDate(),
        state.hour || 0,
        state.minute || 0,
        0,
        0,
      );
      return _buildSingleExecutionDayStats(probeDay, occurrence, anchor);
    }
    case "month": {
      if (probeDay.getDate() !== state.monthDay) {
        return { count: 0, previewTimes: [], firstExecutionAt: null, lastExecutionAt: null };
      }
      const occurrence = new Date(
        probeDay.getFullYear(),
        probeDay.getMonth(),
        probeDay.getDate(),
        state.hour || 0,
        state.minute || 0,
        0,
        0,
      );
      return _buildSingleExecutionDayStats(probeDay, occurrence, anchor);
    }
    case "year": {
      if (
        probeDay.getMonth() + 1 !== state.month ||
        probeDay.getDate() !== state.monthDay
      ) {
        return { count: 0, previewTimes: [], firstExecutionAt: null, lastExecutionAt: null };
      }
      const occurrence = new Date(
        probeDay.getFullYear(),
        probeDay.getMonth(),
        probeDay.getDate(),
        state.hour || 0,
        state.minute || 0,
        0,
        0,
      );
      return _buildSingleExecutionDayStats(probeDay, occurrence, anchor);
    }
    default:
      return { count: 0, previewTimes: [], firstExecutionAt: null, lastExecutionAt: null };
  }
}

export function buildRecurringGroupForDay(event, dayDate, options = {}) {
  const stats = getRecurringDayStats(event, dayDate, options);
  if (!stats?.count) return null;

  return {
    key: `rg:${event?.raw?.id ?? event?.id}:${_dayKey(dayDate)}`,
    kind: "recurring-group",
    sourceId: String(event?.raw?.id ?? event?.id ?? ""),
    representative: event,
    date: new Date(dayDate.getFullYear(), dayDate.getMonth(), dayDate.getDate()),
    count: stats.count,
    previewTimes: stats.previewTimes,
    previewOverflow: Math.max(0, stats.count - stats.previewTimes.length),
    firstExecutionAt: stats.firstExecutionAt,
    lastExecutionAt: stats.lastExecutionAt,
  };
}

// ─── File display helpers ─────────────────────────────────────────────────────

export function getFileIconType(fileName = "", mimeType = "") {
  const ext = fileName?.split(".").pop()?.toLowerCase() ?? "";
  const normalizedMime = (mimeType || "").toLowerCase();
  if (normalizedMime.startsWith("image/") || ["jpg", "jpeg", "png", "gif", "webp", "svg", "bmp"].includes(ext))
    return "image";
  if (normalizedMime.startsWith("video/") || ["mp4", "mov", "avi", "webm", "mkv"].includes(ext)) return "video";
  if (normalizedMime.startsWith("audio/") || ["mp3", "wav", "ogg", "m4a", "aac"].includes(ext)) return "audio";
  if (normalizedMime.includes("pdf") || ext === "pdf") return "pdf";
  return "file";
}

export function getFileTypeLabel(file) {
  const labels = { image: "Imagem", video: "Vídeo", audio: "Áudio", pdf: "PDF", file: "Arquivo" };
  return labels[getFileIconType(file?.fileName, file?.mimeType)] || "Arquivo";
}

export function formatFileSize(bytes) {
  const size = Number(bytes);
  if (!size) return "";
  if (size < 1024) return `${size} B`;
  if (size < 1048576) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / 1048576).toFixed(1)} MB`;
}

// ─────────────────────────────────────────────────────────────────────────────

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

/**
 * Normaliza arquivos de ambos os formatos (novo e legado) para o formato esperado
 * Novo: { file_name, mimetype, file_type, size }
 * Legado: { fileName, mimeType, size }
 */
export function normalizeFiles(files = []) {
  if (!Array.isArray(files)) return [];
  
  return files.map(f => ({
    fileName: f.fileName || f.file_name || "Arquivo sem nome",
    mimeType: f.mimeType || f.mimetype || "",
    size: f.size || 0,
    file: f.file || "",
    caption: f.caption || "",
    fileType: f.fileType || f.file_type || "file"
  }));
}

/**
 * Extrai e normaliza arquivos de um payload de mensagem programada
 * Suporta arquivos em: params.message.files (novo) ou params.files (legado)
 */
export function extractFilesFromScheduledMessage(params = {}) {
  if (!params) return [];
  // Server format: files nested in message.text.files
  if (Array.isArray(params.message?.text?.files) && params.message.text.files.length > 0)
    return normalizeFiles(params.message.text.files);
  // Client new format: files in message.files
  if (Array.isArray(params.message?.files) && params.message.files.length > 0)
    return normalizeFiles(params.message.files);
  // Legacy: files in params.files
  if (Array.isArray(params.files) && params.files.length > 0)
    return normalizeFiles(params.files);
  return [];
}
