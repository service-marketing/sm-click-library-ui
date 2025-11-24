<template>
  <div
    class="floating-widget"
    :style="widgetStyle"
    ref="widgetRef"
    @mousedown="startDrag"
    @touchstart="startDrag"
  >
    <!-- --- Botão Flutuante --- -->
    <button
      class="floating-button"
      @click.stop="togglePanel"
      aria-label="Abrir painel flutuante"
    >
      <svg
        class="floating-button-svg"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 512 512"
      >
        <path
          d="M370 378c28.89 23.52 46 46.07 46 86M142 378c-28.89 23.52-46 46.06-46 86M384 208c28.89-23.52 32-56.07 32-96M128 206c-28.89-23.52-32-54.06-32-94M464 288.13h-80M128 288.13H48M256 192v256"
          fill="none"
          stroke="currentColor"
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="32"
        />
        <path
          d="M256 448h0c-70.4 0-128-57.6-128-128v-96.07c0-65.07 57.6-96 128-96h0c70.4 0 128 25.6 128 96V320c0 70.4-57.6 128-128 128z"
          fill="none"
          stroke="currentColor"
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="32"
        />
        <path
          d="M179.43 143.52a49.08 49.08 0 01-3.43-15.73A80 80 0 01255.79 48h.42A80 80 0 01336 127.79a41.91 41.91 0 01-3.12 14.3"
          fill="none"
          stroke="currentColor"
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="32"
        />
      </svg>
    </button>

    <!-- --- Painel com Slot --- -->
    <transition name="fade">
      <div
        v-if="isPanelOpen"
        class="floating-panel"
        ref="panelRef"
        :style="panelDynamicStyle"
      >
        <slot>
          <p style="text-align: center; font-size: 0.9rem">
            Adicione seu conteúdo aqui 👇
          </p>
        </slot>
      </div>
    </transition>
  </div>
</template>

<script setup>
// --- Imports ---
import { ref, computed, onBeforeUnmount, nextTick } from "vue";

// --- Estado Reativo ---
const isPanelOpen = ref(false);
const position = ref({ x: 30, y: 30 });
const offset = ref({ x: 0, y: 0 });
const dragging = ref(false);
const widgetRef = ref(null);
const panelRef = ref(null);

// --- Direção dinâmica do painel ---
const panelDirection = ref({ vertical: "bottom", horizontal: "right" });

// --- Estilos Computados ---
const widgetStyle = computed(() => ({
  position: "fixed",
  left: `${position.value.x}px`,
  top: `${position.value.y}px`,
  zIndex: 1000,
  cursor: dragging.value ? "grabbing" : "grab",
}));

const panelDynamicStyle = computed(() => {
  const base = {
    position: "absolute",
    background: "#fff",
    borderRadius: "10px",
    boxShadow: "0 4px 15px rgba(0, 0, 0, 0.2)",

    width: "280px",
    maxWidth: "90vw",
    zIndex: 1001,
  };

  // --- Define posição de acordo com o espaço ---
  if (panelDirection.value.vertical === "top") base.bottom = "60px";
  else base.top = "60px";

  if (panelDirection.value.horizontal === "left") base.right = "0";
  else base.left = "0";

  return base;
});

// --- Alternar painel e decidir direção ---
async function togglePanel() {
  if (isPanelOpen.value) {
    isPanelOpen.value = false;
    return;
  }

  // Abre o painel e espera o DOM atualizar
  isPanelOpen.value = true;
  await nextTick();
  updatePanelDirection();
}

// --- Função para escolher direção conforme espaço disponível ---
function updatePanelDirection() {
  if (!widgetRef.value || !panelRef.value) return;

  const rect = widgetRef.value.getBoundingClientRect();
  const panelWidth = panelRef.value.offsetWidth;
  const panelHeight = panelRef.value.offsetHeight;

  // Espaço ao redor
  const space = {
    top: rect.top,
    bottom: window.innerHeight - (rect.top + rect.height),
    left: rect.left,
    right: window.innerWidth - (rect.left + rect.width),
  };

  // Decide lado vertical
  panelDirection.value.vertical =
    space.bottom < panelHeight && space.top > panelHeight ? "top" : "bottom";

  // Decide lado horizontal
  panelDirection.value.horizontal =
    space.right < panelWidth && space.left > panelWidth ? "left" : "right";
}

// --- Funções de arrastar ---
function startDrag(event) {
  dragging.value = true;
  const e = event.type.includes("touch") ? event.touches[0] : event;
  offset.value = {
    x: e.clientX - position.value.x,
    y: e.clientY - position.value.y,
  };

  document.addEventListener("mousemove", onDrag);
  document.addEventListener("mouseup", stopDrag);
  document.addEventListener("touchmove", onDrag);
  document.addEventListener("touchend", stopDrag);
}

function onDrag(event) {
  if (!dragging.value) return;
  const e = event.type.includes("touch") ? event.touches[0] : event;

  const newX = e.clientX - offset.value.x;
  const newY = e.clientY - offset.value.y;

  const maxX = window.innerWidth - widgetRef.value.offsetWidth;
  const maxY = window.innerHeight - widgetRef.value.offsetHeight;
  position.value.x = Math.min(Math.max(0, newX), maxX);
  position.value.y = Math.min(Math.max(0, newY), maxY);
}

function stopDrag() {
  dragging.value = false;
  document.removeEventListener("mousemove", onDrag);
  document.removeEventListener("mouseup", stopDrag);
  document.removeEventListener("touchmove", onDrag);
  document.removeEventListener("touchend", stopDrag);
}

onBeforeUnmount(stopDrag);
</script>

<style scoped>
.floating-button {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: #2563eb;
  color: white;
  border: none;
  cursor: pointer;
  font-size: 1.4rem;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
  transition:
    transform 0.2s,
    background 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}
.floating-button:hover {
  background: #1d4ed8;
  transform: scale(1.05);
}

.floating-button-svg {
  width: 20px;
  height: 20px;
  color: white;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@media (max-width: 600px) {
  .floating-panel {
    width: 90vw !important;
    left: 50%;
    transform: translateX(-50%);
    top: 70px !important;
  }
}
</style>
