import { defineStore } from "pinia";
import api from "~/utils/api";
import {
  fetchScheduledByMonth,
  yearMonthKey,
  parseDateLocal,
  formatTimeHM,
  normalizeScheduledItem,
  normalizeScheduledResponseV2,
} from "~/components/calendar/useScheduledEvents";
import { crm_events } from "~/utils/systemUrls";

// Coalescing global por baseUrl|YM (não reativo)
const inFlight = new Map();

export const useScheduledStore = defineStore("scheduled", {
  state: () => ({
    baseUrl: crm_events,
    monthCache: {}, // { "YYYY-MM": Event[] }
    loadingYM: new Set(),
    errorByYM: {}, // { "YYYY-MM": "msg" }
    loadedYM: new Set(),
  }),

  getters: {
    eventsOf: (state) => (ym) => state.monthCache[ym] || [],
    isLoading: (state) => (ym) => state.loadingYM.has(ym),
    errorOf: (state) => (ym) => state.errorByYM[ym] || "",
  },

  actions: {
    setBaseUrl(url) {
      this.baseUrl = url || "/crm_scheduled";
    },

    _setMonth(ym, data) {
      this.monthCache = { ...this.monthCache, [ym]: data || [] };
    },

    _deleteMonth(ym) {
      const { [ym]: _drop, ...rest } = this.monthCache;
      this.monthCache = rest;
      this.loadingYM.delete(ym);
      const { [ym]: _e, ...eRest } = this.errorByYM;
      this.errorByYM = eRest;
      this.loadedYM.delete(ym);
    },

    coerceHttps(url) {
      return url && url.startsWith("http://")
        ? url.replace(/^http:\/\//i, "https://")
        : url;
    },

    _appendMonth(ym, items) {
      if (!items || items.length === 0) return;
      if (!this.monthCache[ym]) this.monthCache[ym] = [];

      const seen = new Set(this.monthCache[ym].map((e) => e?.id));
      for (const it of items) {
        if (!it) continue;
        if (it.id && seen.has(it.id)) continue;
        this.monthCache[ym].push(it);
      }
    },

    async ensureMonthLoaded(ym) {
      if (!ym) ym = yearMonthKey(new Date());
      if (this.loadedYM.has(ym)) return;

      const key = `${this.baseUrl}|${ym}`;
      if (inFlight.has(key)) return inFlight.get(key);

      this.loadingYM.add(ym);
      this.errorByYM = { ...this.errorByYM, [ym]: "" };

      const p = (async () => {
        try {
          const firstUrl = `${this.baseUrl}?year_month=${encodeURIComponent(
            ym,
          )}&page_size=10`;
          const res = await api.get(firstUrl);
          const page = Array.isArray(res?.data)
            ? res.data
            : res?.data?.results || [];
          const firstBatch = normalizeScheduledResponseV2(page || []);

          this._setMonth(ym, firstBatch);
          this.loadedYM.add(ym);

          let next = this.coerceHttps(res?.data?.next || null);

          if (next) {
            (async () => {
              try {
                let url = next;
                while (url) {
                  const r = await api.get(url);
                  const data = Array.isArray(r?.data)
                    ? r.data
                    : r?.data?.results || [];
                  const batch = normalizeScheduledResponseV2(data || []);
                  this._appendMonth(ym, batch);
                  url = this.coerceHttps(r?.data?.next || null);
                }
              } catch (bgErr) {
                console.warn(
                  "[scheduled] background paging error:",
                  bgErr?.message || bgErr,
                );
              }
            })();
          }
        } catch (err) {
          const msg = String(err?.message || err);
          this.errorByYM = { ...this.errorByYM, [ym]: msg };
          console.error("[scheduled] fetch error", ym, msg);
          this._setMonth(ym, []);
          this.loadedYM.delete(ym);
          throw err;
        } finally {
          inFlight.delete(key);
          this.loadingYM.delete(ym);
        }
      })();

      inFlight.set(key, p);
      return p;
    },

    async forceReload(ym) {
      if (!ym) ym = yearMonthKey(new Date());
      const key = `${this.baseUrl}|${ym}`;
      inFlight.delete(key);
      this._deleteMonth(ym);
      this.loadedYM.delete(ym);
      await this.ensureMonthLoaded(ym);
    },

    findEventById(id) {
      const want = String(id);
      for (const [ym, arr] of Object.entries(this.monthCache)) {
        const idx = (arr || []).findIndex((e) => {
          const a = e?.raw?.id != null ? String(e.raw.id) : null;
          const b = e?.id != null ? String(e.id) : null;
          return a === want || b === want;
        });
        if (idx !== -1) return { ym, idx };
      }
      return null;
    },

    applyUpdateToCache({ id, params }) {
      // 🔎 Parse de data SÓ se veio no payload
      let newDateCandidate = null;
      if (params?.schedule?.time) {
        const rawTime = params.schedule.time;

        // aceita "YYYY-MM-DD HH:mm" ou "YYYY-MM-DDTHH:mm"
        const m = /^(\d{4})-(\d{2})-(\d{2})(?:[ T](\d{2}):(\d{2}))?$/.exec(
          rawTime,
        );
        if (m) {
          const [, y, mo, d, hh = "00", mm = "00"] = m;
          // cria no horário local preservando HH:mm
          newDateCandidate = new Date(
            Number(y),
            Number(mo) - 1,
            Number(d),
            Number(hh),
            Number(mm),
            0,
            0,
          );
        } else {
          // fallback bem conservador
          const normalized =
            typeof rawTime === "string" && !rawTime.includes("T")
              ? rawTime.replace(" ", "T")
              : rawTime;
          newDateCandidate = new Date(normalized);
        }
      }

      // 🔧 Função que aplica APENAS os campos presentes no payload
      const patchFields = (ev) => {
        // data/hora: só muda se veio no payload
        if (newDateCandidate instanceof Date && !isNaN(newDateCandidate)) {
          ev.date = newDateCandidate;
          ev.time = formatTimeHM(newDateCandidate);
        }

        // conteúdo: só se veio message[0].content
        if (params?.message?.[0]?.content != null) {
          ev.content = params.message[0].content;
        }

        // raw.params: merge só do que veio
        ev.raw = ev.raw || { id };
        ev.raw.params = ev.raw.params || {};

        if (params?.schedule) {
          ev.raw.params.schedule = {
            ...(ev.raw.params.schedule || {}),
            ...params.schedule,
          };
        }

        if (params?.message) {
          ev.raw.params.message = params.message;
        }

        // chatId: só se veio no payload
        if (Object.prototype.hasOwnProperty.call(params || {}, "chat_id")) {
          ev.chatId = params.chat_id ?? ev.chatId ?? "";
        }

        // entity: atualiza apenas os campos enviados
        if (params?.entity) {
          ev.raw.params.entity = {
            ...(ev.raw.params.entity || {}),
            ...params.entity,
          };
          if (Object.prototype.hasOwnProperty.call(params.entity, "name")) {
            ev.contactName = params.entity.name ?? ev.contactName ?? "Cliente";
          }
          if (Object.prototype.hasOwnProperty.call(params.entity, "photo")) {
            ev.contactPhoto = params.entity.photo ?? ev.contactPhoto ?? null;
            if (params.entity.photo) ev.photo = params.entity.photo;
          }
        }

        // info: atualiza apenas os campos enviados
        if (params?.info) {
          ev.raw.params.info = {
            ...(ev.raw.params.info || {}),
            ...params.info,
          };
          if (
            params.info?.department &&
            Object.prototype.hasOwnProperty.call(params.info.department, "name")
          ) {
            ev.departmentName =
              params.info.department.name ?? ev.departmentName;
          }
          if (params.info?.instance) {
            if (
              Object.prototype.hasOwnProperty.call(params.info.instance, "name")
            ) {
              ev.instanceName = params.info.instance.name ?? ev.instanceName;
            }
            if (
              Object.prototype.hasOwnProperty.call(
                params.info.instance,
                "last_instance_status",
              )
            ) {
              ev.instanceStatus =
                params.info.instance.last_instance_status ?? ev.instanceStatus;
            }
          }
        }

        // título: só se veio; senão mantém
        if (Object.prototype.hasOwnProperty.call(params || {}, "title")) {
          ev.title = params.title ?? ev.title ?? "Mensagem programada";
        } else {
          ev.title = ev.title || "Mensagem programada";
        }

        // type/function: mantém se não vier; se vier, atualiza
        if (Object.prototype.hasOwnProperty.call(params || {}, "function")) {
          ev.function = params.function ?? ev.function ?? "scheduled_messages";
          ev.type = params.function ?? ev.type ?? "scheduled_messages";
        } else {
          ev.function = ev.function || "scheduled_messages";
          ev.type = ev.type || "scheduled_messages";
        }

        return ev;
      };

      // 🔎 Busca evento existente
      const hit = this.findEventById(id);
      if (!hit) {
        // Criar novo evento (comportamento original, usando data do payload se veio)
        const baseDate =
          newDateCandidate instanceof Date && !isNaN(newDateCandidate)
            ? newDateCandidate
            : (() => {
                const rt = params?.schedule?.time;
                const nt =
                  typeof rt === "string" && !rt.includes("T")
                    ? rt.replace(" ", "T")
                    : rt;
                return parseDateLocal?.(nt) || (nt ? new Date(nt) : new Date());
              })();

        const ev = patchFields({
          id,
          date: baseDate,
          time: formatTimeHM(baseDate),
          title: params?.title || "Mensagem programada",
          type: params?.function || "scheduled_messages",
          function: params?.function || "scheduled_messages",
          content: params?.message?.[0]?.content ?? "",
          raw: { id, params },
          contactName: params?.entity?.name ?? "Cliente",
          contactPhoto: params?.entity?.photo ?? null,
          departmentName: params?.info?.department?.name ?? null,
          instanceName: params?.info?.instance?.name ?? null,
          instanceStatus: params?.info?.instance?.last_instance_status ?? null,
          // chatId só se veio
          ...(Object.prototype.hasOwnProperty.call(params || {}, "chat_id") && {
            chatId: params.chat_id ?? "",
          }),
        });

        const newYM = yearMonthKey(ev.date);
        const targetArr = this.monthCache[newYM]
          ? [...this.monthCache[newYM], ev]
          : [ev];
        targetArr.sort((a, b) => a.date - b.date);
        this._setMonth(newYM, targetArr);
        return;
      }

      // Atualização de existente: só aplicar deltas do payload
      const { ym: oldYM, idx } = hit;
      const oldArr = this.monthCache[oldYM] || [];
      const evOld = { ...oldArr[idx] };
      const evNew = patchFields({ ...evOld });

      // Se mudou o mês (só muda se veio data nova), realoca
      const refDateForYM = evNew.date instanceof Date ? evNew.date : evOld.date;
      const newYM = yearMonthKey(refDateForYM);

      if (newYM === oldYM) {
        const newArr = [...oldArr];
        newArr.splice(idx, 1, evNew);
        newArr.sort((a, b) => a.date - b.date);
        this._setMonth(oldYM, newArr);
      } else {
        const newOldArr = oldArr.slice(0, idx).concat(oldArr.slice(idx + 1));
        const targetArr = this.monthCache[newYM]
          ? [...this.monthCache[newYM], evNew]
          : [evNew];
        targetArr.sort((a, b) => a.date - b.date);
        this.monthCache = {
          ...this.monthCache,
          [oldYM]: newOldArr,
          [newYM]: targetArr,
        };
      }
    },

    removeFromCache(id) {
      const hit = this.findEventById(id);
      if (!hit) return false;
      const { ym, idx } = hit;
      const arr = this.monthCache[ym] || [];
      const newArr = arr.slice(0, idx).concat(arr.slice(idx + 1));
      this._setMonth(ym, newArr);
      return true;
    },

    insertNormalizedEvent(ev) {
      if (!ev) return;
      const id = String(ev.id);
      const date =
        ev.date instanceof Date
          ? ev.date
          : parseDateLocal(ev.date) || new Date();
      const ym = yearMonthKey(date);

      const normalized = {
        ...ev,
        id,
        date,
        time: ev.time ?? formatTimeHM(date),
      };

      const arr = this.monthCache[ym] ? [...this.monthCache[ym]] : [];
      const idx = arr.findIndex((e) => String(e?.raw?.id ?? e?.id) === id);

      if (idx !== -1) {
        arr.splice(idx, 1, normalized);
      } else {
        arr.push(normalized);
      }

      arr.sort((a, b) => a.date - b.date);
      this._setMonth(ym, arr);
    },

    insertFromApiItem(item) {
      const ev = normalizeScheduledItem(item);
      if (!ev) return;
      this.insertNormalizedEvent(ev);
    },

    insertManyFromApi(items = []) {
      for (const item of items) {
        const ev = normalizeScheduledItem(item);
        if (ev) this.insertNormalizedEvent(ev);
      }
    },

    insertFromApiPage(page) {
      const list = Array.isArray(page) ? page : page?.results || [];
      this.insertManyFromApi(list);
    },

    insertFromParams(payload) {
      return this.applyUpdateToCache(payload);
    },

    hasEvent(id) {
      return !!this.findEventById(id);
    },

    resetAll() {
      this.monthCache = {};
      this.loadingYM = new Set();
      this.errorByYM = {};
      this.loadedYM = new Set();
      inFlight.clear?.();
    },
  },
});
