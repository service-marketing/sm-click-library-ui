<template>
  <Transition name="cpk-layer" appear>
    <div v-if="model" class="cpk-popover-layer" @mousedown.self="onCancel">
      <Transition name="cpk-card" appear>
        <div
          ref="card"
          class="cpk-popover bg-base-300"
          :class="[{ 'is-loading': loading, 'is-danger': destructive }]"
          :style="cardStyle"
          role="dialog"
          aria-modal="false"
          :aria-labelledby="ids.title"
          :aria-describedby="ids.desc"
        >
          <!-- Cabeçalho -->
          <div class="cpk-popover__header border-base-100">
            <div class="cpk-popover__icon" aria-hidden="true">!</div>
            <h3 class="cpk-popover__title" :id="ids.title">{{ title }}</h3>
            <button
              class="cpk-popover__close"
              type="button"
              @click="onCancel"
              :disabled="loading"
              aria-label="Fechar"
            >
              ×
            </button>
          </div>

          <!-- Corpo -->
          <p v-if="description" class="cpk-popover__desc" :id="ids.desc">
            {{ description }}
          </p>

          <div class="cpk-popover__details bg-base-200 border border-base-100">
            <slot name="details" />
          </div>

          <!-- Rodapé -->
          <div class="cpk-popover__footer">
            <button
              type="button"
              class="cyber-button cyber-button--md"
              @click="onCancel"
              :disabled="loading"
            >
              {{ cancelLabel }}
            </button>

            <button
              type="button"
              :class="[
                'cyber-button',
                'cyber-button--md',
                destructive ? 'cyber-button--danger' : 'cyber-button--accent',
              ]"
              @click="onConfirm"
              :disabled="loading"
            >
              <span v-if="loading" class="loading-spinner" />
              <span>{{ loading ? loadingLabel : confirmLabel }}</span>
            </button>
          </div>
        </div>
      </Transition>
    </div>
  </Transition>
</template>

<script setup>
import {
  computed,
  onMounted,
  onBeforeUnmount,
  ref,
  watch,
  nextTick,
} from "vue";

/* =================== PROPS / EMITS =================== */
const props = defineProps({
  modelValue: { type: Boolean, default: false },

  title: { type: String, default: "Confirmar ação" },
  description: { type: String, default: "" },
  confirmLabel: { type: String, default: "Confirmar" },
  cancelLabel: { type: String, default: "Cancelar" },
  loadingLabel: { type: String, default: "Processando…" },

  loading: { type: Boolean, default: false },
  destructive: { type: Boolean, default: false },

  context: { type: Object, default: () => ({}) },

  /* âncora */
  anchorEl: { type: [HTMLElement, Object], default: null },
  anchorRect: { type: Object, default: null }, // {left, top, width, height}
  placement: { type: String, default: "auto" }, // 'auto' | 'top' | 'bottom' | 'left' | 'right'
  align: { type: String, default: "center" }, // 'start' | 'center' | 'end'
  offset: { type: Number, default: 10 },
  viewportPadding: { type: Number, default: 8 },
});

const emit = defineEmits(["update:modelValue", "confirm", "cancel"]);

/* =================== STATE =================== */
const model = computed({
  get: () => props.modelValue,
  set: (v) => emit("update:modelValue", v),
});

const card = ref(null);
const pos = ref({ left: 0, top: 0, p: "bottom" }); // p = placement efetivo
const ids = {
  title: `cpk-popover-title-${Math.random().toString(36).slice(2)}`,
  desc: `cpk-popover-desc-${Math.random().toString(36).slice(2)}`,
};

function onCancel() {
  emit("cancel", props.context);
  model.value = false;
}
function onConfirm() {
  if (props.loading) return;
  emit("confirm", props.context);
}

/* =================== POSITIONING =================== */
let ro; // ResizeObserver (document/body)
let roAnchor; // ResizeObserver para o elemento âncora atual
let scrollParents = [];

function getAnchorRect() {
  if (props.anchorRect) return props.anchorRect;
  const el = props.anchorEl instanceof Element ? props.anchorEl : null;
  if (el) return el.getBoundingClientRect();
  // fallback: elemento focado ou última posição do mouse (global)
  const focused =
    document.activeElement instanceof Element ? document.activeElement : null;
  if (focused) return focused.getBoundingClientRect();
  return {
    left: window.__lastMouseX ?? window.innerWidth / 2,
    top: window.__lastMouseY ?? window.innerHeight / 2,
    width: 1,
    height: 1,
    right: (window.__lastMouseX ?? 0) + 1,
    bottom: (window.__lastMouseY ?? 0) + 1,
  };
}

function computePosition() {
  if (!model.value) return;
  const vpW = window.innerWidth;
  const vpH = window.innerHeight;
  const pad = props.viewportPadding;

  const a = getAnchorRect();
  const c = card.value
    ? card.value.getBoundingClientRect()
    : { width: 320, height: 200 };

  const order =
    props.placement === "auto"
      ? ["bottom", "top", "right", "left"]
      : [props.placement];

  let placed = order[0];
  let left = 0;
  let top = 0;

  const centerX = a.left + a.width / 2 - c.width / 2;
  const centerY = a.top + a.height / 2 - c.height / 2;
  const startX = a.left;
  const endX = a.left + a.width - c.width;
  const startY = a.top;
  const endY = a.top + a.height - c.height;

  for (const p of order) {
    if (p === "bottom") {
      top = a.bottom + props.offset;
      left =
        props.align === "start"
          ? startX
          : props.align === "end"
            ? endX
            : centerX;
      if (top + c.height + pad <= vpH) {
        placed = "bottom";
        break;
      }
    }
    if (p === "top") {
      top = a.top - c.height - props.offset;
      left =
        props.align === "start"
          ? startX
          : props.align === "end"
            ? endX
            : centerX;
      if (top >= pad) {
        placed = "top";
        break;
      }
    }
    if (p === "right") {
      left = a.right + props.offset;
      top =
        props.align === "start"
          ? startY
          : props.align === "end"
            ? endY
            : centerY;
      if (left + c.width + pad <= vpW) {
        placed = "right";
        break;
      }
    }
    if (p === "left") {
      left = a.left - c.width - props.offset;
      top =
        props.align === "start"
          ? startY
          : props.align === "end"
            ? endY
            : centerY;
      if (left >= pad) {
        placed = "left";
        break;
      }
    }
  }

  left = Math.min(Math.max(pad, left), vpW - c.width - pad);
  top = Math.min(Math.max(pad, top), vpH - c.height - pad);

  pos.value = { left, top, p: placed };
}

function watchScrollParents() {
  cleanupScrollParents();
  const el = props.anchorEl instanceof Element ? props.anchorEl : document.body;
  let parent = el;
  while (parent && parent !== document.body) {
    scrollParents.push(parent);
    parent = parent.parentElement;
  }
  scrollParents.push(window);
  scrollParents.forEach((sp) =>
    sp.addEventListener("scroll", computePosition, { passive: true }),
  );
}
function cleanupScrollParents() {
  scrollParents.forEach((sp) =>
    sp.removeEventListener?.("scroll", computePosition),
  );
  scrollParents = [];
}

// abre/fecha
watch(
  () => model.value,
  async (open) => {
    if (open) {
      await nextTick();
      computePosition();
      watchScrollParents();

      ro = new ResizeObserver(computePosition);
      ro.observe(document.body);

      // observar âncora atual
      const el = props.anchorEl instanceof Element ? props.anchorEl : null;
      if (el) {
        roAnchor?.disconnect?.();
        roAnchor = new ResizeObserver(computePosition);
        roAnchor.observe(el);
      }

      window.addEventListener("resize", computePosition);
      window.addEventListener("keydown", keyHandler);
    } else {
      cleanup();
    }
  },
);

// trocar âncora com modal aberto -> reobservar e reposicionar
watch(
  () => props.anchorEl,
  async (el) => {
    if (!model.value) return;
    await nextTick();
    cleanupScrollParents();
    watchScrollParents();

    roAnchor?.disconnect?.();
    const tgt = el instanceof Element ? el : null;
    if (tgt) {
      roAnchor = new ResizeObserver(computePosition);
      roAnchor.observe(tgt);
    }
    computePosition();
  },
);

// anchorRect novo -> reposiciona
watch(
  () => props.anchorRect,
  () => {
    if (model.value) computePosition();
  },
);

// mudanças de alinhamento/offset/padding/placement -> reposiciona
watch(
  () => [props.placement, props.align, props.offset, props.viewportPadding],
  () => {
    if (model.value) computePosition();
  },
);

function keyHandler(e) {
  if (e.key === "Escape") onCancel();
  if (e.key === "Enter") onConfirm();
}

onMounted(() => {
  window.addEventListener(
    "mousemove",
    (e) => {
      window.__lastMouseX = e.clientX;
      window.__lastMouseY = e.clientY;
    },
    { passive: true },
  );
});

onBeforeUnmount(cleanup);

function cleanup() {
  cleanupScrollParents();
  window.removeEventListener("resize", computePosition);
  window.removeEventListener("keydown", keyHandler);
  if (ro) ro.disconnect();
  if (roAnchor) roAnchor.disconnect();
}

/* =================== STYLES REACTIVOS =================== */
const cardStyle = computed(() => ({
  left: `${pos.value.left}px`,
  top: `${pos.value.top}px`,
}));
</script>

<style scoped>
/* camada: aceita clique fora */
.cpk-popover-layer {
  position: fixed;
  inset: 0;
  pointer-events: auto;
  z-index: 9999;
}

.cpk-popover {
  pointer-events: auto;
  position: absolute;
  min-width: 320px;
  max-width: 380px;
  color: var(--fg);
  border-radius: var(--cyber-radius-lg);
  border: 1px solid var(--cyber-border);
  backdrop-filter: var(--cyber-blur);
  -webkit-backdrop-filter: var(--cyber-blur);
  box-shadow:
    0 10px 30px rgba(0, 0, 0, 0.45),
    0 0 0 1px rgba(255, 255, 255, 0.06) inset,
    0 0 12px var(--cyber-primary-glow);
  overflow: hidden;
  /* removido animation antiga, usamos Transition */
  will-change: transform, opacity;
}

.cpk-popover__desc {
  margin: 12px 14px 0;
  color: var(--fg-dim);
  text-align: center;
}
.cpk-popover__details {
  margin: 12px 14px 0;
  padding: 7px;
  border-radius: 14px;
}

.is-danger .cpk-popover__icon {
  color: var(--cyber-danger);
  background: rgba(248, 113, 113, 0.14);
  box-shadow: 0 0 10px rgba(248, 113, 113, 0.35);
}

/* acessibilidade UX */
.cyber-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
.cyber-button:focus {
  outline: 2px solid rgba(56, 189, 248, 0.6);
  outline-offset: 2px;
}

/* ===================== Transitions ===================== */
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
