<template>
  <header class="cpk-header bg-base-200">
    <!-- ESQUERDA: X (só mobile) + navegação -->
    <div class="left">
      <button
        @click="$emit('close-page')"
        class="cyber-button cyber-button--sm btn-ghost nav hide-md-up"
        aria-label="Fechar"
      >
        <svg class="icon-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            stroke="currentColor"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M6 18 17.94 6M18 18 6.06 6"
          />
        </svg>
      </button>

      <button
        type="button"
        class="cyber-button cyber-button--sm btn-ghost nav"
        @click="$emit('prev')"
        aria-label="Mês anterior"
      >
        <svg class="icon-4" viewBox="0 0 24 24">
          <path
            fill="currentColor"
            d="M15.5 19 9 12l6.5-7 1.5 1.3L12.3 12l4.7 5.7z"
          />
        </svg>
        <span class="label-md">Anterior</span>
      </button>

      <button
        type="button"
        class="cyber-button cyber-button--sm cyber-button--accent today"
        @click="$emit('today')"
        aria-label="Hoje"
      >
        <svg class="icon-4" viewBox="0 0 24 24" aria-hidden="true">
          <path
            fill="currentColor"
            d="M11.6643 2.05648c.0197-.00699.1589-.05645.3357-.05645.1768 0 .316.04946.3357.05645l.0019.00067c.0461.01577.0846.03229.1092.04332.0514.02304.1015.04898.1449.07268.0896.04898.1957.11302.3102.18855.2291.15109.521.36725.8121.63689C14.247 3.49218 15 4.37 15 5.50003c0 1.12688-.7447 2.00396-1.2779 2.49995-.2531.23541-.5075.43043-.7221.57742V10h5c.5523 0 1 .4477 1 1v3h-4c-.0568 0-.1125.0048-.1667.0139-.0542-.0091-.1099-.0139-.1667-.0139H5v-3c0-.5523.44772-1 1-1h5V8.57622c-.2139-.14666-.4676-.34115-.7202-.57589C9.74664 7.50489 9 6.62764 9 5.50003c0-1.13003.753-2.00785 1.286-2.50144.2911-.26964.583-.4858.8121-.63689.1145-.07553.2206-.13957.3102-.18855.0434-.0237.0935-.04964.1449-.07268.0246-.01103.0631-.02755.1092-.04332l.0019-.00067ZM4 17.8377V21c0 .5523.44772 1 1 1h14c.5523 0 1-.4477 1-1v-2.8243c-.0609.0534-.1248.1054-.1917.1556-.56.42-1.274.6687-2.1416.6687-.8677 0-1.5817-.2487-2.1417-.6687-.281-.2108-.5081-.4531-.6917-.7045-.1835.2514-.4106.4937-.6917.7045-.5599.42-1.2739.6687-2.1416.6687-.8677 0-1.5817-.2487-2.14169-.6687-.20142-.1511-.37514-.3184-.52499-.4936-.14984.1752-.32356.3425-.52499.4936-.55999.42-1.27398.6687-2.14166.6687s-1.58168-.2487-2.14167-.6687c-.20143-.1511-.37515-.3184-.525-.4936ZM5.2078 16c.0124.0314.0255.0628.03934.0939.11841.2664.27553.4856.47786.6374.19001.1425.47602.2687.94167.2687s.75165-.1262.94166-.2687c.20234-.1518.35945-.371.47786-.6374.01384-.0311.02694-.0625.03934-.0939H5.2078Zm5.3727.0939c-.0139-.0311-.027-.0625-.0394-.0939h2.9177c-.0124.0314-.0255.0628-.0393.0939-.1184.2664-.2755.4856-.4779.6374-.19.1425-.476.2687-.9416.2687-.4657 0-.7517-.1262-.9417-.2687-.2023-.1518-.3594-.371-.4778-.6374Zm5.6666 0c-.0138-.0311-.0269-.0625-.0393-.0939h2.9177c-.0124.0314-.0255.0628-.0393.0939-.1184.2664-.2755.4856-.4779.6374-.19.1425-.476.2687-.9416.2687-.4657 0-.7517-.1262-.9417-.2687-.2023-.1518-.3594-.371-.4779-.6374Z"
          />
        </svg>
        <span class="label-md">Hoje</span>
      </button>

      <button
        type="button"
        class="cyber-button cyber-button--sm btn-ghost nav"
        @click="$emit('next')"
        aria-label="Próximo mês"
      >
        <span class="label-md">Próximo</span>
        <svg class="icon-4" viewBox="0 0 24 24">
          <path
            fill="currentColor"
            d="M8 19l6.5-7L8 5l-1.5 1.3L11.7 12 6.5 17.7z"
          />
        </svg>
      </button>
    </div>

    <!-- CENTRO: TÍTULO -->
    <h2 class="month-title" :title="`${month} ${year}`">
      {{ month }} {{ year }}
    </h2>

    <!-- DIREITA: toggle de visão + compacto -->
    <div class="right">
      <button
        type="button"
        class="cyber-button cyber-button--sm btn-ghost filter-btn"
        :title="'Filtro de eventos'"
        @click="$emit('open-filter', $event)"
      >
        <svg
          class="icon-5"
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            d="M5.05 3C3.291 3 2.352 5.024 3.51 6.317l5.422 6.059v4.874c0 .472.227.917.613 1.2l3.069 2.25c1.01.742 2.454.036 2.454-1.2v-7.124l5.422-6.059C21.647 5.024 20.708 3 18.95 3H5.05Z"
          />
        </svg>

        <!-- Badge de filtros aplicados -->
        <span
          v-if="filterCount > 0"
          class="filter-badge"
          :title="`${filterCount} filtro${filterCount > 1 ? 's' : ''} ativo${
            filterCount > 1 ? 's' : ''
          }`"
        >
          {{ filterCount }}
        </span>
      </button>

      <div class="toggle">
        <button
          type="button"
          class="cyber-button cyber-button--sm btn-ghost"
          :class="viewMode === 'calendar' ? 'is-active' : ''"
          @click="$emit('set-view-mode', 'calendar')"
          aria-label="Visão Calendário"
        >
          <svg class="icon-5" viewBox="0 0 24 24" aria-hidden="true">
            <path
              fill="currentColor"
              fill-rule="evenodd"
              d="M5 5a1 1 0 0 0 1-1 1 1 0 1 1 2 0 1 1 0 0 0 1 1h1a1 1 0 0 0 1-1 1 1 0 1 1 2 0 1 1 0 0 0 1 1h1a1 1 0 0 0 1-1 1 1 0 1 1 2 0 1 1 0 0 0 1 1 2 2 0 0 1 2 2v1a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V7a2 2 0 0 1 2-2ZM3 19v-7a1 1 0 0 1 1-1h16a1 1 0 0 1 1 1v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z"
              clip-rule="evenodd"
            />
          </svg>
          <span class="label-lg">Calendário</span>
        </button>

        <button
          type="button"
          class="cyber-button cyber-button--sm btn-ghost"
          :class="viewMode === 'agenda' ? 'is-active' : ''"
          @click="$emit('set-view-mode', 'agenda')"
          aria-label="Visão Agenda"
        >
          <svg class="icon-5" viewBox="0 0 24 24" aria-hidden="true">
            <path
              fill="currentColor"
              fill-rule="evenodd"
              d="M11 4.717c-2.286-.58-4.16-.756-7.045-.71A1.99 1.99 0 0 0 2 6v11c0 1.133.934 2.022 2.044 2.007 2.759-.38 4.5-.182 6.956.449V4.717Zm2 15.081c2.456-.631 4.198-.829 6.956-.791A2.013 2.013 0 0 0 22 16.999V6a1.99 1.99 0 0 0-1.955-1.993c-2.885-.046-4.76.13-7.045.71v15.081Z"
              clip-rule="evenodd"
            />
          </svg>
          <span class="label-lg">Agenda</span>
        </button>
      </div>

      <button
        type="button"
        class="cyber-button cyber-button--sm show-lg btn-ghost"
        @click="$emit('toggle-compact')"
        :aria-pressed="isCompact"
        :title="isCompact ? 'Sair do modo compacto' : 'Ativar modo compacto'"
      >
        <svg
          v-if="!isCompact"
          class="icon-5"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <path
            stroke="currentColor"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M4 8h4V4m12 4h-4V4M4 16h4v4m12-4h-4v4"
          />
        </svg>
        <svg
          v-else
          class="icon-5"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <path
            stroke="currentColor"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M8 4H4m0 0v4m0-4 5 5m7-5h4m0 0v4m0-4-5 5M8 20H4m0 0v-4m0 4 5-5m7 5h4m0 0v-4m0 4-5-5"
          />
        </svg>
      </button>
    </div>
  </header>
</template>

<style src="../utils/calendarTheme.css"></style>

<script setup>
defineProps({
  month: String,
  year: [String, Number],
  isCompact: Boolean,
  viewMode: { type: String, default: "calendar" },
  filterCount: { type: Number, default: 0 },
});
defineEmits([
  "prev",
  "next",
  "today",
  "toggle-compact",
  "set-view-mode",
  "close-page",
  "open-filter",
]);
</script>

<style scoped>
/* ===== Layout básico ===== */
.cpk-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.15rem var(--pad-x);
  border-bottom: 1px solid var(--border);
  color: var(--fg);
  white-space: nowrap;
  overflow: hidden;
  flex-shrink: 0;
  justify-content: space-between;
}
.left,
.right {
  flex: 0 0 auto;
  display: inline-flex;
  align-items: center;
  gap: var(--gap);
  min-width: 0;
}

/* Título no centro com prioridade */
.month-title {
  flex: 1 1 auto;
  min-width: 0;
  text-align: center;
  overflow: hidden;
  text-overflow: ellipsis;
  letter-spacing: 0.16em;
  color: var(--cyber-accent);
  text-shadow: 0 0 3px var(--cyber-accent);
  font-weight: 700;
  font-size: clamp(0.9rem, 2.2vw, 1.12rem);
  padding: 0 0.25rem;
}

/* ===== Toggle (container) ===== */
.toggle {
  display: inline-flex;
  gap: var(--gap);
  padding: 2px;
  border-radius: var(--cyber-radius);
  border: 1px solid var(--chip-brd);
  background: var(--cyber-bg-light);
}

/* Botões “fantasma” (neutros) usando cyber-button base */
.btn-ghost {
  /* mantém a borda sempre 1px -> sem flicada */
  border-color: var(--cyber-border);
  background: var(--cyber-bg);
  color: var(--fg-dim);
}

/* Botão “Hoje” com destaque de accent via classe util */

/* Estado ativo no toggle (sem trocar largura de borda) */
.toggle .cyber-button.is-active {
  color: #061512;
  background: var(--chip-active);
  box-shadow: 0 0 10px rgba(14, 234, 210, 0.28);
  border-color: var(--cyber-border);
}

/* Ícones: usam os tokens do theme */
.icon-4 {
  width: var(--icon-4);
  height: var(--icon-4);
}
.icon-5 {
  width: var(--icon-5);
  height: var(--icon-5);
}

/* ===== Visibilidade herdada ===== */
.hide-md-up {
  display: inline-flex;
}
@media (min-width: 1024px) {
  .hide-md-up {
    display: none;
  }
}

.show-lg {
  display: none;
}
@media (min-width: 1024px) {
  .show-lg {
    display: inline-flex;
  }
}
@media (max-width: 640px) {
  .month-title {
    display: none;
  }
}

/* ===== Responsividade progressiva priorizando o título ===== */
@media (max-width: 1280px) {
  .left,
  .right {
    gap: 0.28rem;
  }
  .cyber-button.cyber-button--sm {
    height: 28px;
    padding: 0 0.5rem;
  }
  .icon-5 {
    width: 1.1rem;
    height: 1.1rem;
  }
  .icon-4 {
    width: 0.95rem;
    height: 0.95rem;
  }
}
@media (max-width: 720px) {
  .label-md,
  .label-lg {
    display: none;
  }
  .cyber-button.cyber-button--sm {
    padding: 0 0.5rem;
  }
}
@media (max-width: 520px) {
  .nav,
  .today {
    padding: 0 0.42rem;
  }
}
@media (max-width: 420px) {
  .today .label-md {
    display: none;
  }
  .today {
    padding: 0 0.38rem;
  }
}
@media (max-width: 340px) {
  .icon-5 {
    width: 0.95rem;
    height: 0.95rem;
  }
  .icon-4 {
    width: 0.9rem;
    height: 0.9rem;
  }
  .cyber-button.cyber-button--sm {
    padding: 0 0.34rem;
    height: 25px;
  }
}

/* ===== Correções anti-flicker (Chrome com backdrop-filter) ===== */
/* 1) Não altere largura de borda no :hover (já garantido acima) */
/* 2) Force camada própria p/ evitar “piscada” nas bordas */
.cpk-header .cyber-button {
  -webkit-backface-visibility: hidden;
  backface-visibility: hidden;
  transform: translateZ(0);
  will-change: box-shadow, transform;
  /* fix extra: evita clipping do glow na borda */
  background-clip: padding-box;
}
/* 3) Em hover, só mexe no box-shadow; borda fica estável */
.cpk-header .cyber-button:hover {
  /* mantém a mesma border-color e largura -> zero jiggle */
  border-color: var(--cyber-border);
}
/* Badge em cima do botão de filtro */
.filter-btn {
  position: relative; /* para o badge se posicionar dentro */
}

.filter-badge {
  position: absolute;
  top: -4px;
  right: -4px;
  min-width: 1rem;
  height: 1rem;
  padding: 0 0.3rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  font-size: 0.68rem;
  font-weight: 700;
  line-height: 1;
  color: #061512;
  background: var(--chip-active);
  box-shadow: 0 0 6px rgba(14, 234, 210, 0.25);
  border: 1px solid var(--cyber-border);
  pointer-events: none;
}
</style>
