<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from "vue";

const props = defineProps({
  modelValue: { type: String, required: true },
  options: { type: Array, required: true },
  labelFn: { type: Function, required: true },
  previewKeyPrefix: { type: String, required: true },
  tone: { type: String, default: "sky" }, // sky | emerald | violet | amber | rose
  playingKey: { type: String, default: null },
});
const emit = defineEmits(["update:modelValue", "preview"]);

const open = ref(false);
const root = ref(null);

const currentLabel = computed(() =>
  props.modelValue ? props.labelFn(props.modelValue) : "Selecionar…",
);

// Cores de tema
const toneColors = {
  sky: {
    "--tone-color": "#38bdf8",
    "--tone-ring": "rgba(56, 189, 248, 0.35)",
    "--tone-grad1": "rgba(56, 189, 248, 0.14)",
    "--tone-grad2": "rgba(59, 130, 246, 0.08)",
  },
  emerald: {
    "--tone-color": "#34d399",
    "--tone-ring": "rgba(52, 211, 153, 0.35)",
    "--tone-grad1": "rgba(16, 185, 129, 0.14)",
    "--tone-grad2": "rgba(5, 150, 105, 0.08)",
  },
  violet: {
    "--tone-color": "#a78bfa",
    "--tone-ring": "rgba(167, 139, 250, 0.35)",
    "--tone-grad1": "rgba(139, 92, 246, 0.14)",
    "--tone-grad2": "rgba(124, 58, 237, 0.08)",
  },
  amber: {
    "--tone-color": "#fbbf24",
    "--tone-ring": "rgba(251, 191, 36, 0.35)",
    "--tone-grad1": "rgba(245, 158, 11, 0.14)",
    "--tone-grad2": "rgba(217, 119, 6, 0.08)",
  },
  rose: {
    "--tone-color": "#fb7185",
    "--tone-ring": "rgba(251, 113, 133, 0.35)",
    "--tone-grad1": "rgba(244, 63, 94, 0.14)",
    "--tone-grad2": "rgba(225, 29, 72, 0.08)",
  },
};

const cssVars = computed(() => toneColors[props.tone] || toneColors.sky);

function toggle() {
  open.value = !open.value;
}
function select(v) {
  emit("update:modelValue", v);
  open.value = false;
}
function doPreview(v) {
  emit("preview", v, `${props.previewKeyPrefix}${v}`);
}
const isPlaying = (opt) =>
  props.playingKey === `${props.previewKeyPrefix}${opt}`;

const headIsPlaying = computed(() =>
  props.modelValue ? isPlaying(props.modelValue) : false,
);
function headPreview(e) {
  e.stopPropagation();
  if (!props.modelValue) return;
  doPreview(props.modelValue);
}

function onClickOutside(e) {
  if (root.value && !root.value.contains(e.target)) open.value = false;
}
onMounted(() => document.addEventListener("click", onClickOutside));
onBeforeUnmount(() => document.removeEventListener("click", onClickOutside));
</script>

<!-- ===== Template ===== -->
<template>
  <div ref="root" class="relative soundselect" :style="cssVars">
    <!-- Cabeçalho -->
    <button type="button" class="select-head" @click="toggle">
      <span class="truncate text-primary">{{ currentLabel }}</span>

      <div class="flex items-center gap-2">
        <button
          v-if="modelValue"
          type="button"
          class="head-playbtn text-primary"
          :class="{ playing: headIsPlaying }"
          :title="headIsPlaying ? 'Pausar' : 'Ouvir'"
          @click.stop="headPreview"
        >
          <span
            v-html="
              headIsPlaying
                ? '<svg xmlns=&quot;http://www.w3.org/2000/svg&quot; class=&quot;h-4 w-4&quot; viewBox=&quot;0 0 24 24&quot; fill=&quot;currentColor&quot;><path d=&quot;M6 5h4v14H6zM14 5h4v14h-4z&quot;/></svg>'
                : '<svg xmlns=&quot;http://www.w3.org/2000/svg&quot; class=&quot;h-4 w-4&quot; viewBox=&quot;0 0 24 24&quot; fill=&quot;currentColor&quot;><path d=&quot;M8 5v14l11-7z&quot;/></svg>'
            "
          />
        </button>

        <span class="chev">
          <svg
            class="size-5 text-primary"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              stroke="currentColor"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="m8 10 4 4 4-4"
            />
          </svg>
        </span>
      </div>
    </button>

    <!-- Popover -->
    <Transition name="fade-scale">
      <div
        v-if="open"
        class="select-popover bg-base-300 w-full min-w-full left-0"
        style="position: absolute"
      >
        <div class="select-list">
          <div
            v-for="opt in options"
            :key="opt"
            class="select-item text-start cursor-pointer"
            :class="{ 'is-selected': modelValue === opt }"
            @click="select(opt)"
          >
            <button type="button" class="item-click">
              <span class="radio-dot" :class="modelValue === opt ? 'on' : ''" />
              <span class="item-label">{{ labelFn(opt) }}</span>
            </button>

            <button
              type="button"
              class="playbtn"
              :class="{ playing: isPlaying(opt) }"
              @click.stop="doPreview(opt)"
              :title="isPlaying(opt) ? 'Pausar' : 'Ouvir'"
            >
              <span
                v-html="
                  isPlaying(opt)
                    ? '<svg xmlns=&quot;http://www.w3.org/2000/svg&quot; class=&quot;h-4 w-4&quot; viewBox=&quot;0 0 24 24&quot; fill=&quot;currentColor&quot;><path d=&quot;M6 5h4v14H6zM14 5h4v14h-4z&quot;/></svg>'
                    : '<svg xmlns=&quot;http://www.w3.org/2000/svg&quot; class=&quot;h-4 w-4&quot; viewBox=&quot;0 0 24 24&quot; fill=&quot;currentColor&quot;><path d=&quot;M8 5v14l11-7z&quot;/></svg>'
                "
              />
            </button>
          </div>

          <div v-if="!options?.length" class="empty">Sem opções</div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.select-head {
  @apply w-full flex items-center justify-between gap-2 rounded-lg border pl-3 pr-2 py-1 text-sm
        transition text-white relative overflow-hidden;
  border-color: color-mix(
    in srgb,
    var(--tone-color) 35%,
    rgba(255, 255, 255, 0.1)
  );
  background:
    linear-gradient(135deg, var(--tone-grad1), var(--tone-grad2)),
    rgba(255, 255, 255, 0.04);
  box-shadow:
    inset 0 0 0 1px color-mix(in srgb, var(--tone-color) 22%, transparent),
    0 1px 10px rgba(0, 0, 0, 0.18);
}
.select-head:hover {
  box-shadow:
    inset 0 0 0 1px color-mix(in srgb, var(--tone-color) 30%, transparent),
    0 2px 16px rgba(0, 0, 0, 0.22);
}
.select-head::before {
  content: "";
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3px;
  background: color-mix(in srgb, var(--tone-color) 70%, transparent);
  opacity: 0.65;
  transition:
    width 0.15s ease,
    opacity 0.15s ease;
}
.select-head:hover::before {
  width: 5px;
  opacity: 0.85;
}
.head-playbtn {
  @apply inline-flex items-center justify-center h-7 w-7 rounded-md border transition;
  border-color: rgba(255, 255, 255, 0.12);
  background: rgba(255, 255, 255, 0.06);
}
.head-playbtn.playing {
  box-shadow: 0 0 0 2px var(--tone-ring);
  background: color-mix(in srgb, var(--tone-color) 18%, transparent);
}
.select-popover {
  @apply z-30 rounded-lg border border-white/10 backdrop-blur-xl p-1 shadow-2xl;
}
.select-item {
  @apply w-full flex items-center justify-between gap-2 rounded-md p-1 pl-2 text-sm
        hover:bg-white/10 transition;
}
.select-item.is-selected {
  background: linear-gradient(135deg, var(--tone-grad1), var(--tone-grad2));
  box-shadow: inset 0 0 0 1px
    color-mix(in srgb, var(--tone-color) 35%, transparent);
}
.radio-dot {
  @apply h-3 w-3 rounded-full border mr-2;
  border-color: rgba(255, 255, 255, 0.4);
}
.radio-dot.on {
  background: var(--tone-color);
  box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.15) inset;
}
.playbtn {
  @apply inline-flex items-center justify-center h-6 w-6 rounded-md border;
  border-color: rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.06);
}
.playbtn.playing {
  box-shadow: 0 0 0 2px var(--tone-ring);
  background: color-mix(in srgb, var(--tone-color) 18%, transparent);
}
.empty {
  @apply text-xs opacity-70 px-2 py-3 text-center;
}
.fade-scale-enter-active,
.fade-scale-leave-active {
  transition: all 0.12s ease;
}
.fade-scale-enter-from,
.fade-scale-leave-to {
  opacity: 0;
  transform: translateY(-4px) scale(0.98);
}
</style>
