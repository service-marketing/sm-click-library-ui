<template>
  <section
    class="bg-base-300 daylist"
    :class="[
      mode === 'compact'
        ? 'daylist--compact has-border border-base-200'
        : 'daylist--sidebar has-border border-base-200 supports-blur',
      {
        'daylist--tight': mode === 'compact' && !loading && events.length === 0,
      },
    ]"
    :data-mode="mode"
    :data-empty="!loading && events.length === 0 ? '1' : '0'"
  >
    <div
      :class="[
        'daylist-header',
        mode === 'compact'
          ? 'daylist-header--compact bg-base-300'
          : 'daylist-header--sidebar bg-base-300',
      ]"
    >
      <h3
        :class="
          mode === 'compact'
            ? 'daylist-title--compact'
            : 'daylist-title--sidebar'
        "
      >
        {{ headerLabel }}
      </h3>
      <button
        type="button"
        class="cyber-button cyber-button--sm cyber-button--accent"
        @click="$emit('reload')"
        :disabled="loading"
      >
        {{ loading ? "Atualizando…" : "Atualizar" }}
      </button>
    </div>

    <Transition name="fade" v-if="loading">
      <div
        :class="[
          'loading-text',
          mode === 'compact' ? 'is-compact' : 'is-sidebar',
        ]"
      >
        Carregando…
      </div>
    </Transition>

    <Transition name="fade" v-else-if="events.length === 0">
      <div class="empty-text">Sem eventos.</div>
    </Transition>

    <TransitionGroup
      name="list"
      move-class="list-move"
      tag="ul"
      appear
      v-else
      :class="[
        mode === 'compact'
          ? 'list-compact has-border border-base-300 bg-base-200 supports-blur'
          : 'list-sidebar',
      ]"
    >
      <li
        v-for="(ev, i) in events"
        :key="ev.id"
        :style="{ '--i': i }"
        :class="
          mode === 'compact'
            ? 'item-compact hover:bg-base-100'
            : 'item-sidebar has-border hover:bg-base-100 border-base-100 bg-base-200 '
        "
      >
        <EventItem
          :ev="ev"
          :mode="mode === 'compact' ? 'compact' : 'sidebar'"
          @open-message="$emit('open-message', $event)"
          @open-chat="$emit('open-chat', $event)"
          @delete-message="($event) => $emit('delete-message', $event)"
        />
      </li>
    </TransitionGroup>
  </section>
</template>

<script setup>
import EventItem from "./EventItem.vue";
import { computed } from "vue";

const props = defineProps({
  loading: { type: Boolean, default: false },
  selectedLabel: { type: String, default: "" },
  selectedLabelLong: { type: String, default: "" },
  events: { type: Array, default: () => [] },
  mode: { type: String, default: "compact" }, // 'compact' | 'sidebar'
});
defineEmits(["reload", "open-chat", "open-message", "delete-message"]);

const headerLabel = computed(() =>
  props.mode === "compact"
    ? props.selectedLabelLong || "Hoje"
    : `Eventos em ${props.selectedLabel || "—"}`,
);
</script>

<style src="../utils/calendarTheme.css"></style>
<style scoped>
:global(:root) {
  --pad-x: 0.3rem; /* px-2 */
  --pad-y: 0.5rem; /* pb-2 / py-1 etc. */
  --radius-xl: 1rem; /* rounded-2xl */
  --radius-lg: 0.75rem; /* rounded-xl */
  --gap-1: 0.25rem;
  --gap-2: 0.4rem;

  --muted: #7ecdc2;
  --muted-70: 0.7;
  --muted-80: 0.8;
  --muted-90: 0.9;

  --btn-emerald: rgba(16, 185, 129, 0.9);
  --btn-emerald-hover: #10b981;
  --btn-primary: #3b82f6;
  --btn-primary-hover: #2563eb;

  --btn-alt: #22b3b1;
  --btn-alt-hover: #12908e;

  --icon-muted: 0.7;

  --shadow-sm: 0 1px 1px rgba(0, 0, 0, 0.06);
  --shadow: 0 3px 10px rgba(0, 0, 0, 0.12);
}
:global(.dark) {
  --muted: #6b8c8a;
  --btn-primary: #2563eb;
  --btn-primary-hover: #1d4ed8;
  --btn-alt: #0ea5a4; /* usado no botão Recarregar */
  --btn-alt-hover: #0b8685;
}

/* util para adicionar largura de borda mantendo a cor via token border-base-* */
.has-border {
  border-width: 1px;
}

/* blur que substitui 'backdrop-blur' */
.supports-blur {
  -webkit-backdrop-filter: saturate(120%) blur(8px);
  backdrop-filter: saturate(120%) blur(8px);
}

/* =========================
   WRAPPER
   ========================= */
.daylist {
  position: relative;
  overflow: auto;
  min-height: 0;
  z-index: 10;
  padding: 0 var(--pad-x) var(--pad-y);
}
.daylist--compact {
  border-top-width: 1px;
}

/* =========================
   HEADER
   ========================= */
.daylist-header {
  position: sticky;
  top: 0;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.daylist-header--compact {
  padding: 5px var(--pad-x);
}
.daylist-header--sidebar {
  padding: 5px var(--pad-x);
}

.daylist-title--compact {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.2em;
  opacity: var(--muted-80);
}
.daylist-title--sidebar {
  font-weight: 600;
}

/* =========================
   ESTADOS DE CARREGAMENTO/VAZIO
   ========================= */
.loading-text,
.empty-text {
  font-size: 0.875rem;
  opacity: var(--muted-70);
  text-align: center;
}

/* =========================
   LISTAS
   ========================= */
.list-compact {
  display: flex;
  flex-direction: column;
  border-radius: var(--radius-xl);
  overflow: hidden;
}
.list-sidebar {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

/* =========================
   ITENS
   ========================= */
.item-compact {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.4rem var(--pad-x);
  gap: 10px;
  transition:
    background-color 0.12s ease,
    box-shadow 0.16s ease,
    transform 0.06s ease;
}
.item-sidebar {
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-sm);
  padding: 0.4rem;
  transition:
    background-color 0.12s ease,
    box-shadow 0.16s ease,
    transform 0.06s ease;
}
.item-sidebar:hover {
  box-shadow: var(--shadow);
}

/* --- compacto: bloco esquerdo --- */
.itemc-head {
  display: flex;
  align-items: center;
  gap: var(--gap-2);
  min-width: 0;
}
.minw0 {
  min-width: 0;
}
.color-bar {
  display: inline-block;
  height: 8px;
  width: 0.25rem;
  border-radius: 0.25rem;
  box-shadow: 0 0 8px rgba(16, 185, 129, 0.7);
}
.itemc-title {
  font-size: 0.875rem;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.itemc-sub {
  font-size: 12px;
  opacity: var(--muted-80);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* --- compacto: ações --- */
.itemc-actions {
  display: flex;
  align-items: center;
  gap: var(--gap-2);
}
.time-badge {
  font-size: 12px;
  font-weight: 500;
  opacity: var(--muted-90);
}

/* --- sidebar: topo --- */
.itemsb-head {
  display: flex;
  align-items: center;
  gap: var(--gap-2);
}
.avatar {
  width: 2rem;
  height: 2rem;
  border-radius: 9999px;
  object-fit: cover;
  box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.08);
}
.avatar--placeholder {
  display: grid;
  place-items: center;
  border-radius: 9999px;
}
.icon-muted {
  opacity: var(--icon-muted);
}
.itemsb-title {
  font-size: 0.875rem;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.itemsb-sub {
  font-size: 0.75rem;
  opacity: var(--muted-80);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* --- sidebar: conteúdo/ações --- */
.itemsb-content {
  margin-top: 0.5rem;
  font-size: 0.875rem;
}
.itemsb-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: var(--gap-2);
  margin-top: 0.5rem;
}

/* =========================
   BOTÕES
   ========================= */
.reload-btn {
  padding: 0.5rem 0.75rem;
  color: #fff;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;
  background: var(--chip-active);
  transition:
    transform 0.06s ease,
    box-shadow 0.16s ease,
    background-color 0.12s ease;
  box-shadow: var(--shadow-sm);
}
.reload-btn:hover {
  transform: translateY(-1px);
  box-shadow: var(--shadow);
  background: var(--chip-hover);
}
.reload-btn:active {
  transform: scale(0.98);
}
.reload-btn:disabled {
  opacity: 0.6;
  pointer-events: none;
}

/* tamanhos */
.btn-xs,
.btn-sm {
  color: #fff;
  border-radius: 0.75rem;
  line-height: 0;
  cursor: pointer;
  transition:
    transform 0.06s ease,
    filter 0.12s ease,
    background-color 0.12s ease,
    box-shadow 0.16s ease;
  box-shadow: var(--shadow-sm);
}
.btn-xs {
  padding: 0.25rem;
  font-size: 0.75rem;
} /* p-1 */
.btn-sm {
  padding: 0 0.75rem;
  height: 2rem;
  font-size: 0.75rem;
} /* px-3 h-8 */

.btn-primary {
  background: var(--primary, #2563eb);
  color: #fff;
}
.btn-primary:hover {
  filter: brightness(1.05);
}
.btn-primary:active {
  transform: scale(0.98);
}
.btn-emerald {
  background: var(--btn-emerald);
  color: #fff;
}
.btn-emerald:hover {
  background: var(--btn-emerald-hover);
}
.btn-emerald:active {
  transform: scale(0.98);
}

/* ícones */
.icon-4 {
  width: 1rem;
  height: 1rem;
}
.icon-5 {
  width: 1.25rem;
  height: 1.25rem;
}

/* =========================
   TRANSIÇÕES — rápidas + sem “pulo” ao reduzir muito
   ========================= */

/* Melhora render e evita thrash */
.item-compact,
.item-sidebar {
  will-change: transform, opacity, box-shadow;
  transform-origin: 20% 50%;
  backface-visibility: hidden;
  contain: content;
}

/* ENTRADA (inclui appear) */
.list-enter-from,
.list-appear-from {
  opacity: 0;
  transform: translateY(8px) scale(0.985);
  filter: saturate(0.9);
}
.list-enter-to,
.list-appear-to {
  opacity: 1;
  transform: translateY(0) scale(1);
  filter: saturate(1);
}

/* SAÍDA — itens ficam absolutos pra não colapsar layout ao remover muitos */
.list-leave-active {
  position: absolute;
  left: 0;
  right: 0;
  /* garante que o item mantenha largura do container durante a animação */
}
.list-leave-from {
  opacity: 0.9;
  transform: translateY(0) scale(1);
}
.list-leave-to {
  opacity: 0;
  transform: translateY(-6px) scale(0.985);
}

/* Timings mais rápidos + STAGGER com teto (min 180ms) */
.list-enter-active,
.list-appear-active {
  animation: list-pop-in 220ms cubic-bezier(0.2, 0.8, 0.2, 1) both;
  animation-delay: calc(min(var(--i, 0) * 18ms, 180ms));
}
.list-leave-active {
  animation: list-pop-out 160ms cubic-bezier(0.2, 0.6, 0.2, 1) both;
}

/* FLIP para reordenação/movimentação */
.list-move {
  transition:
    transform 200ms cubic-bezier(0.2, 0.8, 0.2, 1),
    opacity 140ms linear;
}

/* Keyframes enxutos */
@keyframes list-pop-in {
  0% {
    opacity: 0;
    transform: translateY(10px) scale(0.98);
    box-shadow: none;
  }
  60% {
    /* transform: translateY(-1px) scale(1.006); */
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}
@keyframes list-pop-out {
  0% {
    opacity: 0.9;
    transform: translateY(0) scale(1);
  }
  100% {
    opacity: 0;
    transform: translateY(-6px) scale(0.985);
  }
}

/* Fades rápidos */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 140ms ease-out;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* motion reduzido */
@media (prefers-reduced-motion: reduce) {
  .list-enter-active,
  .list-leave-active,
  .list-move,
  .fade-enter-active,
  .fade-leave-active {
    transition: opacity 100ms linear !important;
  }
  .list-enter-from,
  .list-leave-to {
    transform: none !important;
  }
}

/* =========================
   RESPONSIVIDADE FINO AJUSTE
   ========================= */
@media (max-width: 480px) {
  .item-sidebar {
    border-radius: 0.75rem;
  }
  .itemsb-content {
    font-size: 0.8125rem;
  }
}

/* Toque extra no hover (sutil) */
.item-sidebar:hover,
.item-compact:hover {
  transform: translateY(-1px);
}
</style>
