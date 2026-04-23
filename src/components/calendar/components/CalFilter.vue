<template>
  <Transition name="cpk-layer" appear>
    <div v-if="open" class="cpk-popover-layer" @mousedown.self="$emit('close')">
      <Transition name="cpk-card" appear>
        <div
          ref="card"
          class="cpk-popover bg-base-300"
          :style="panelInlineStyle"
          role="dialog"
          aria-modal="true"
          aria-label="Filtro de eventos"
        >
          <!-- Cabeçalho -->
          <div class="cpk-popover__header border-base-100">
            <div class="cpk-popover__icon" aria-hidden="true">⚙</div>
            <h3 class="cpk-popover__title">Filtros</h3>
            <button
              class="cpk-popover__close"
              type="button"
              @click="$emit('close')"
              aria-label="Fechar"
            >
              ×
            </button>
          </div>

          <!-- Corpo -->
          <div class="filter-body">
            <!-- Somente meus eventos -->
            <label class="row">
              <input
                class="switch"
                type="checkbox"
                :checked="state.onlyMine"
                @change="onToggleOnlyMine($event)"
                aria-label="Exibir somente meus eventos"
              />
              <span class="label-cpk">Exibir somente meus eventos</span>
            </label>

            <!-- Status de execução (sem opção 'Todos'): marcar = aplica, desmarcar = remove chave -->
            <div
              class="row row--status"
              role="group"
              aria-label="Filtrar por status de execução"
            >
              <span class="status-icon" aria-hidden="true"
                ><svg
                  class="icon-4"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    fill-rule="evenodd"
                    d="M12 2a1 1 0 0 1 .932.638l7 18a1 1 0 0 1-1.326 1.281L13 19.517V13a1 1 0 1 0-2 0v6.517l-5.606 2.402a1 1 0 0 1-1.326-1.281l7-18A1 1 0 0 1 12 2Z"
                    clip-rule="evenodd"
                  />
                </svg>
              </span>
              <div class="status-wrap">
                <div class="label-cpk">
                  Status
                  <!-- Popover de ajuda -->
                  <span
                    class="sched-pop"
                    tabindex="0"
                    aria-label="Ajuda sobre status"
                  >
                    <span class="sched-pop__mark"
                      ><svg
                        class="icon-4"
                        aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          fill-rule="evenodd"
                          d="M2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10S2 17.523 2 12Zm9.008-3.018a1.502 1.502 0 0 1 2.522 1.159v.024a1.44 1.44 0 0 1-1.493 1.418 1 1 0 0 0-1.037.999V14a1 1 0 1 0 2 0v-.539a3.44 3.44 0 0 0 2.529-3.256 3.502 3.502 0 0 0-7-.255 1 1 0 0 0 2 .076c.014-.398.187-.774.48-1.044Zm.982 7.026a1 1 0 1 0 0 2H12a1 1 0 1 0 0-2h-.01Z"
                          clip-rule="evenodd"
                        />
                      </svg>
                    </span>
                    <div
                      class="sched-pop__card bg-base-300"
                      style="
                        --popover-brd: var(--cyber-border);
                        transform: translate(-5%, -50%) scale(0.98);
                      "
                    >
                      <div>
                        <span style="font-weight: 600">Ativos:</span> Eventos
                        que estão programados para ocorrer
                      </div>
                      <div>
                        <span style="font-weight: 600">Executados:</span>
                        Eventos que já ocorreram
                      </div>
                      <!-- <div>Desmarcar as opções limpa o filtro.</div> -->
                    </div>
                  </span>
                </div>

                <div class="seg">
                  <button
                    type="button"
                    class="cyber-button cyber-button--xs btn-ghost"
                    :class="state.status === true ? 'is-active' : ''"
                    @click="toggleStatus(true)"
                    aria-pressed="state.status === true"
                  >
                    Ativos
                  </button>
                  <button
                    type="button"
                    class="cyber-button cyber-button--xs btn-ghost"
                    :class="state.status === false ? 'is-active' : ''"
                    @click="toggleStatus(false)"
                    aria-pressed="state.status === false"
                  >
                    Executados
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </div>
  </Transition>
</template>

<script setup>
import {
  computed,
  reactive,
  watch,
  ref,
  onMounted,
  onBeforeUnmount,
  nextTick,
} from "vue";
import { useAttendantStore } from "~/stores/attendantStore";

const props = defineProps({
  open: { type: Boolean, default: false },
  anchorEl: { type: [HTMLElement, Object], default: null },
  offset: { type: Number, default: 8 }, // distância do botão
  align: { type: String, default: "center" }, // start | center | end
  filters: { type: Object, default: () => ({}) }, // v-model:filters -> o pai guarda
});
const emit = defineEmits(["close", "update:filters"]);

const attendantStore = useAttendantStore();
const me = computed(
  () => attendantStore.attendants.find((a) => a.is_me) || null,
);

/* ======== UI local (derivada de props.filters) ======== */
const state = reactive({
  onlyMine: false,
  // status NÃO tem 'todos' no modelo: internamente usamos null pra UI,
  // mas nunca emitimos status=null (removemos a chave).
  status: null, // true = pendente, false = executado, null = sem filtro (não emitido)
});

// hidrata ao abrir com base no filters atual do pai
watch(
  () => props.open,
  async (v) => {
    if (!v) return;
    await nextTick();
    const mineNow = me.value?.id ? String(me.value.id) : null;
    state.onlyMine =
      !!mineNow && String(props.filters?.scheduled_by ?? "") === mineNow;

    // hidrata status (somente true/false; se vier qualquer outra coisa, limpa)
    const stNow = props.filters?.status;
    state.status = stNow === true || stNow === false ? stNow : null;

    positionNow();
  },
  { immediate: false },
);

/* ======== Emissão de parâmetros ======== */
function omit(obj, key) {
  if (!obj) return {};
  const { [key]: _drop, ...rest } = obj;
  return rest;
}
function onToggleOnlyMine(e) {
  state.onlyMine = !!e.target.checked;
  const mineId = me.value?.id ? String(me.value.id) : null;

  if (state.onlyMine && mineId) {
    // adiciona/atualiza scheduled_by
    emit("update:filters", { ...props.filters, scheduled_by: mineId });
  } else {
    // remove scheduled_by
    emit("update:filters", omit(props.filters, "scheduled_by"));
  }
}

// clicar numa opção marca; clicar de novo desmarca (remove a chave do filtro)
function toggleStatus(val) {
  if (state.status === val) {
    state.status = null; // UI sem filtro
    const next = omit(props.filters, "status");
    emit("update:filters", next); // NÃO existe status=null no modelo: removemos
  } else {
    state.status = val;
    emit("update:filters", { ...props.filters, status: val }); // true|false
  }
}

/* ======== Posicionamento ancorado ao botão ======== */
const card = ref(null);
const pos = ref({ left: 0, top: 0, placed: "bottom" });

const panelInlineStyle = computed(() => ({
  position: "fixed",
  left: `${pos.value.left}px`,
  top: `${pos.value.top}px`,
}));

function getAnchorRect() {
  const el = props.anchorEl instanceof Element ? props.anchorEl : null;
  if (el?.getBoundingClientRect) return el.getBoundingClientRect();
  const cx = window.innerWidth / 2,
    cy = window.innerHeight / 3;
  return { left: cx, right: cx, top: cy, bottom: cy, width: 0, height: 0 };
}
function contain(left, top, w, h) {
  const pad = 8;
  return {
    left: Math.max(pad, Math.min(left, window.innerWidth - w - pad)),
    top: Math.max(pad, Math.min(top, window.innerHeight - h - pad)),
  };
}
function computePosition() {
  const a = getAnchorRect();
  const panel = card.value;
  const cw = panel?.offsetWidth ?? 300;
  const ch = panel?.offsetHeight ?? 220;

  let top = a.bottom + props.offset;
  let left;
  if (props.align === "center") left = a.left + a.width / 2 - cw / 2;
  else if (props.align === "end") left = a.right - cw;
  else left = a.left; // start

  // fallback pra cima se faltar espaço
  if (top + ch > window.innerHeight - 4) {
    const tryTop = a.top - ch - props.offset;
    if (tryTop >= 4) {
      top = tryTop;
      pos.value.placed = "top";
    } else {
      pos.value.placed = "bottom";
    }
  } else {
    pos.value.placed = "bottom";
  }

  const c = contain(left, top, cw, ch);
  pos.value = { left: c.left, top: c.top, placed: pos.value.placed };
}
function positionNow() {
  computePosition();
  requestAnimationFrame(computePosition); // garante dimensões pós-render
}

let roDoc, roAnchor;
let scrollTargets = [];
function addScrollListeners() {
  removeScrollListeners();
  scrollTargets = [window];
  const el = props.anchorEl instanceof Element ? props.anchorEl : null;
  let p = el?.parentElement;
  while (p && p !== document.body) {
    const s = getComputedStyle(p);
    if (/(auto|scroll)/.test(s.overflow + s.overflowY + s.overflowX)) {
      scrollTargets.push(p);
    }
    p = p.parentElement;
  }
  scrollTargets.forEach((t) =>
    t.addEventListener("scroll", positionNow, { passive: true }),
  );
}
function removeScrollListeners() {
  scrollTargets.forEach((t) => t.removeEventListener?.("scroll", positionNow));
  scrollTargets = [];
}

watch(
  () => props.open,
  async (v) => {
    if (!v) {
      removeScrollListeners();
      roDoc?.disconnect?.();
      roAnchor?.disconnect?.();
      return;
    }
    await nextTick();
    positionNow();
    addScrollListeners();

    roDoc?.disconnect?.();
    roDoc = new ResizeObserver(positionNow);
    roDoc.observe(document.body);

    roAnchor?.disconnect?.();
    const el = props.anchorEl instanceof Element ? props.anchorEl : null;
    if (el) {
      roAnchor = new ResizeObserver(positionNow);
      roAnchor.observe(el);
    }
    window.addEventListener("resize", positionNow);
  },
);
watch(
  () => props.anchorEl,
  async () => {
    if (!props.open) return;
    await nextTick();
    addScrollListeners();
    positionNow();
  },
);

/* ======== Fechar fora / ESC ======== */
function onKey(e) {
  if (e.key === "Escape") emit("close");
}
function onDocPointerDown(e) {
  if (!props.open) return;
  const t = e.target;
  const panel = card.value;
  if (panel && panel.contains(t)) return;
  const anchor = props.anchorEl instanceof Element ? props.anchorEl : null;
  if (anchor && anchor.contains && anchor.contains(t)) return;
  emit("close");
}
onMounted(() => {
  document.addEventListener("pointerdown", onDocPointerDown, true);
  window.addEventListener("keydown", onKey);
});
onBeforeUnmount(() => {
  document.removeEventListener("pointerdown", onDocPointerDown, true);
  window.removeEventListener("keydown", onKey);
  removeScrollListeners();
  roDoc?.disconnect?.();
  roAnchor?.disconnect?.();
});
</script>

<style scoped>
.cpk-popover-layer {
  position: fixed;
  inset: 0;
  z-index: 999;
  pointer-events: auto;
  background: transparent;
}

.cpk-popover {
  min-width: 280px;
  max-width: 340px;
  border-radius: var(--cyber-radius-md);
  border: 1px solid var(--cyber-border);
  backdrop-filter: var(--cyber-blur);
  -webkit-backdrop-filter: var(--cyber-blur);
  box-shadow:
    0 10px 30px rgba(0, 0, 0, 0.45),
    inset 0 0 0 1px rgba(255, 255, 255, 0.04),
    0 0 12px var(--cyber-primary-glow);
  z-index: 30;
}
.icon-4 {
  width: 16px;
  height: 16px;
  display: inline-block;
  vertical-align: middle;
  fill: currentColor;
}

.filter-body {
  display: grid;
  gap: 0.5rem;
  padding: 0.5rem;
}

.row {
  display: grid;
  grid-template-columns: 28px 1fr;
  align-items: center;
  gap: 1rem;
  padding: 5px 8px;
  border-radius: var(--cyber-radius-sm);
  background: var(--cyber-bg-light);
  border: 1px solid var(--cyber-border);
  transition: var(--cyber-transition);
  cursor: pointer;
}
.row:hover {
  box-shadow:
    0 0 0 1px var(--cyber-hover-glow) inset,
    0 2px 8px rgba(0, 0, 0, 0.12);
}

.switch {
  appearance: none;
  width: 42px;
  height: 22px;
  border-radius: 999px;
  border: 1px solid var(--cyber-border);
  background: linear-gradient(
    180deg,
    var(--cyber-bg),
    rgba(255, 255, 255, 0.04)
  );
  position: relative;
  outline: none;
  cursor: pointer;
  transition: var(--cyber-transition);
  box-shadow: inset 0 0 0 1px rgba(0, 255, 178, 0.06);
}
.switch::after {
  content: "";
  position: absolute;
  top: 2px;
  left: 2px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: var(--bar-bg);
  box-shadow: 0 0 6px var(--cyber-glow);
  transition: var(--cyber-transition);
}
.switch:checked {
  border-color: var(--cyber-border-light);
  box-shadow:
    inset 0 0 0 1px var(--cyber-hover-glow),
    0 0 8px var(--cyber-accent-glow);
}
.switch:checked::after {
  left: 22px;
  background: linear-gradient(
    135deg,
    rgba(0, 255, 178, 0.5),
    rgba(0, 255, 178, 0.25)
  );
}
.dark .switch {
  border-color: rgba(0, 0, 0, 0.14);
  background: linear-gradient(180deg, #f8fafc, #eef2f7); /* claro */
  box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.04);
}

.dark .switch::after {
  background: #ffffff; /* botão mais claro no tema claro */
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.18);
}

/* Marcado no "tema claro" (classe .dark) mantém teu accent, mas com glow mais suave */
.dark .switch:checked {
  border-color: rgba(0, 0, 0, 0.18);
  box-shadow:
    inset 0 0 0 1px rgba(0, 0, 0, 0.06),
    0 0 8px var(--cyber-accent-glow);
}

.dark .switch:checked::after {
  background: linear-gradient(
    135deg,
    rgba(0, 255, 178, 0.85),
    rgba(0, 255, 178, 0.55)
  );
}

/* Acessibilidade/foco visível no "tema claro" */
.dark .switch:focus-visible {
  outline: 2px solid rgba(0, 255, 178, 0.7);
  outline-offset: 2px;
  box-shadow:
    0 0 0 2px rgba(0, 255, 178, 0.35),
    inset 0 0 0 1px rgba(0, 0, 0, 0.06);
}

.label-cpk {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  color: var(--fg);
  font-weight: 600;
  font-size: 14px;
  justify-content: space-between;
  padding: 4px;
}

/* Linha de status (icone + conteúdo) */
.row.row--status {
  grid-template-columns: 28px 1fr;
}
.status-icon {
  width: 22px;
  height: 22px;
  display: grid;
  place-items: center;
  font-weight: 900;
  color: var(--cyber-accent);
  background: rgba(0, 255, 178, 0.12);
  border-radius: 999px;
  box-shadow: 0 0 8px var(--cyber-accent-glow);
}
.status-wrap {
  display: grid;
}

/* Segmented control */
.seg {
  display: inline-flex;
  gap: var(--gap);
  padding: 2px;
  border-radius: var(--cyber-radius);
  border: 1px solid var(--cyber-border);
  background: var(--cyber-bg-light);
  justify-content: space-between;
}
.cyber-button--xs {
  height: 26px;
  padding: 0 0.5rem;
  font-size: 12px;
}
.seg .cyber-button.is-active {
  color: #061512;
  background: var(--chip-active);
  border-color: var(--cyber-border);
  box-shadow: 0 0 10px rgba(14, 234, 210, 0.28);
}

.sched-pop__mark {
  display: inline-grid;
  place-items: center;
  width: 16px;
  height: 16px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 800;
  color: var(--cyber-accent);
  background: rgba(0, 255, 178, 0.1);
  text-shadow: 0 0 6px var(--cyber-accent-glow);
  margin-left: 4px;
}

.cpk-layer-enter-from,
.cpk-layer-leave-to {
  opacity: 0;
}
.cpk-layer-enter-active,
.cpk-layer-leave-active {
  transition: opacity 120ms ease-out;
}
.cpk-card-enter-from {
  opacity: 0;
  transform: translateY(6px) scale(0.98);
}
.cpk-card-enter-to {
  opacity: 1;
  transform: translateY(0) scale(1);
}
.cpk-card-leave-from {
  opacity: 1;
  transform: translateY(0) scale(1);
}
.cpk-card-leave-to {
  opacity: 0;
  transform: translateY(4px) scale(0.98);
}
.cpk-card-enter-active,
.cpk-card-leave-active {
  transition:
    transform 160ms ease,
    opacity 160ms ease;
}
</style>
