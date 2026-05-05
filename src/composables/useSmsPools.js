import api from "~/utils/api";
import { smsPoolUrl } from "~/utils/systemUrls";

// ─── Normalização ───────────────────────────────────────────────────────────

export function normalizeSmsListPayload(data) {
  return Array.isArray(data?.results)
    ? data.results
    : Array.isArray(data)
      ? data
      : [];
}

// ─── Helpers de leitura ─────────────────────────────────────────────────────

export function getSmsPoolCredits(pool) {
  return Number(
    pool?.balance ?? pool?.effective_available_credits ?? pool?.credits ?? 0,
  );
}

export function getSmsValidContacts(validation) {
  return validation?.valid_contacts ?? validation?.valid ?? [];
}

export function getSmsInvalidContacts(validation) {
  return validation?.invalid_contacts ?? validation?.invalid ?? [];
}

export function getSmsContactName(contact) {
  return contact?.name ?? contact?.contact?.name ?? "-";
}

export function getSmsContactPhone(contact) {
  return (
    contact?.telephone ??
    contact?.phone ??
    contact?.number ??
    contact?.contact?.telephone ??
    "-"
  );
}

export function getSmsCreditsToConsume(validation) {
  return Number(
    validation?.credits_to_consume ??
      validation?.credits ??
      getSmsValidContacts(validation).length,
  );
}

// ─── API ─────────────────────────────────────────────────────────────────────

export async function listSmsPools({ url = smsPoolUrl } = {}) {
  const { data } = await api.get(url);
  return normalizeSmsListPayload(data);
}

export async function listSmsPoolsPaginated({
  page = 1,
  search = "",
  pageSize = 20,
  url = smsPoolUrl,
} = {}) {
  const params = { page, page_size: pageSize };
  if (search) params.name = search;
  const { data } = await api.get(url, { params });
  return data; // raw DRF response: { count, next, previous, results }
}

export async function updateSmsPool(poolId, payload) {
  const { data } = await api.patch(`${smsPoolUrl}${poolId}/`, payload);
  return data;
}
