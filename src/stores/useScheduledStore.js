import { defineStore } from "pinia";
import {
  fetchScheduledByMonth,
  yearMonthKey,
  parseDateLocal,
  formatTimeHM,
  normalizeScheduledItem, // normalizador de item único
} from "~/components/calendar/useScheduledEvents";

// Coalescing global por baseUrl|YM (não reativo)
const inFlight = new Map();

export const useScheduledStore = defineStore("scheduled", {
  state: () => ({
    baseUrl: "/crm_scheduled",
    // cache por mês: { "YYYY-MM": Event[] }
    monthCache: {},
    // loading por mês
    loadingYM: new Set(), // ex: "2025-09"
    // erros por mês
    errorByYM: {}, // { "YYYY-MM": "msg" }
    // NEW: meses que já foram CARREGADOS via fetch (independe do cache existir)
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
      // também limpa status
      this.loadingYM.delete(ym);
      const { [ym]: _e, ...eRest } = this.errorByYM;
      this.errorByYM = eRest;
      // NEW: se apagar o mês, deixa de estar "carregado"
      this.loadedYM.delete(ym);
    },

    async ensureMonthLoaded(ym) {
      if (!ym) ym = yearMonthKey(new Date());
      // NEW: só retorna se JÁ FOI CARREGADO via fetch (não basta existir no cache)
      if (this.loadedYM.has(ym)) return;

      const key = `${this.baseUrl}|${ym}`;
      if (inFlight.has(key)) return inFlight.get(key);

      this.loadingYM.add(ym);
      this.errorByYM = { ...this.errorByYM, [ym]: "" };

      const p = fetchScheduledByMonth(this.baseUrl, ym)
        .then((data) => {
          this._setMonth(ym, data);
          // NEW: marca como carregado com sucesso
          this.loadedYM.add(ym);
        })
        .catch((err) => {
          const msg = String(err?.message || err);
          this.errorByYM = { ...this.errorByYM, [ym]: msg };
          console.error("[scheduled] fetch error", ym, msg);
          this._setMonth(ym, []); // evita loop
          // NEW: garante que NÃO fica como carregado
          this.loadedYM.delete(ym);
        })
        .finally(() => {
          inFlight.delete(key);
          this.loadingYM.delete(ym);
        });

      inFlight.set(key, p);
      return p;
    },

    async forceReload(ym) {
      if (!ym) ym = yearMonthKey(new Date());
      const key = `${this.baseUrl}|${ym}`;
      inFlight.delete(key);
      this._deleteMonth(ym);
      // NEW: redundante/seguro — força a perder o status de carregado
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
      const newDate = parseDateLocal(params?.schedule?.time) || new Date();
      const newYM = yearMonthKey(newDate);

      const patchFields = (ev) => {
        ev.date = newDate;
        ev.time = formatTimeHM(newDate);
        if (params?.message?.[0]?.content != null) {
          ev.content = params.message[0].content;
        }
        if (ev.raw?.params) {
          ev.raw.params.message = params.message ?? ev.raw.params.message;
          ev.raw.params.schedule = {
            ...(ev.raw.params.schedule || {}),
            ...(params.schedule || {}),
          };
        }
        return ev;
      };

      const hit = this.findEventById(id);
      if (!hit) {
        // NÃO dispara fetch aqui — apenas insere
        const ev = patchFields({
          id,
          date: newDate,
          time: formatTimeHM(newDate),
          title: "Mensagem programada",
          content: params?.message?.[0]?.content ?? "",
          raw: { id, params },
        });
        const targetArr = this.monthCache[newYM]
          ? [...this.monthCache[newYM], ev]
          : [ev];
        targetArr.sort((a, b) => a.date - b.date);
        this._setMonth(newYM, targetArr);
        return;
      }

      const { ym: oldYM, idx } = hit;
      const oldArr = this.monthCache[oldYM] || [];
      const evOld = { ...oldArr[idx] };
      const evNew = patchFields(evOld);

      if (newYM === oldYM) {
        const newArr = [...oldArr];
        newArr.splice(idx, 1, evNew);
        newArr.sort((a, b) => a.date - b.date);
        this._setMonth(oldYM, newArr);
      } else {
        // mover entre meses — também NÃO busca aqui
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

    /**
     * Insere ou atualiza um evento já normalizado.
     */
    insertNormalizedEvent(ev) {
      if (!ev) return;
      const id = String(ev.id);
      const date =
        ev.date instanceof Date
          ? ev.date
          : parseDateLocal(ev.date) || new Date();
      const ym = yearMonthKey(date);

      // NÃO chama fetch aqui — só insere
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

    /**
     * Insere a partir de um item cru da API (usa normalizeScheduledItem).
     */
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

    insertFromApiPage(page /* array ou {results: [...]} */) {
      const list = Array.isArray(page) ? page : page?.results || [];
      this.insertManyFromApi(list);
    },

    /** Atalho para usar o mesmo fluxo do update */
    insertFromParams(payload /* { id, params } */) {
      return this.applyUpdateToCache(payload);
    },

    hasEvent(id) {
      return !!this.findEventById(id);
    },

    resetAll() {
      this.monthCache = {};
      this.loadingYM = new Set();
      this.errorByYM = {};
      this.loadedYM = new Set(); // NEW
      inFlight.clear?.();
    },
  },
});
