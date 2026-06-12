<script setup>
import { ref, computed } from "vue";
import { onClickOutside } from "@vueuse/core";

const props = defineProps({
  modelValue: {
    type: String,
    default: "America/Sao_Paulo",
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  saving: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["update:modelValue", "change"]);

const brazilianTimezones = [
  "America/Araguaina",
  "America/Bahia",
  "America/Belem",
  "America/Boa_Vista",
  "America/Campo_Grande",
  "America/Cuiaba",
  "America/Eirunepe",
  "America/Fortaleza",
  "America/Maceio",
  "America/Manaus",
  "America/Noronha",
  "America/Porto_Acre",
  "America/Porto_Velho",
  "America/Recife",
  "America/Rio_Branco",
  "America/Santarem",
  "America/Sao_Paulo",
];

function sortTimezones(list) {
  const national = [];
  const others = [];
  list.forEach((tz) =>
    (brazilianTimezones.includes(tz) ? national : others).push(tz),
  );
  national.sort();
  others.sort();
  return [...national, ...others];
}

const allTimezones = sortTimezones(
  (() => {
    try {
      return Intl.supportedValuesOf("timeZone");
    } catch {
      return brazilianTimezones;
    }
  })(),
);

function getUTCOffset(tz) {
  try {
    const now = new Date();
    const utcMs = new Date(
      now.toLocaleString("en-US", { timeZone: "UTC" }),
    ).getTime();
    const tzMs = new Date(
      now.toLocaleString("en-US", { timeZone: tz }),
    ).getTime();
    const totalMinutes = Math.round((tzMs - utcMs) / 60000);
    const sign = totalMinutes >= 0 ? "+" : "-";
    const abs = Math.abs(totalMinutes);
    const h = Math.floor(abs / 60);
    const m = abs % 60;
    return `UTC ${sign}${h}:${String(m).padStart(2, "0")}`;
  } catch {
    return "UTC +0:00";
  }
}

function formatTzName(tz) {
  return String(tz).replace(/_/g, " ");
}

function normalizeString(str) {
  return String(str)
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[/_]/g, " ")
    .toLowerCase();
}

const isOpen = ref(false);
const search = ref("");
const target = ref(null);

const filtered = computed(() => {
  const term = normalizeString(search.value || "");
  if (!term) return allTimezones;
  return allTimezones.filter((tz) => normalizeString(tz).includes(term));
});

function select(tz) {
  emit("update:modelValue", tz);
  emit("change", tz);
  isOpen.value = false;
  search.value = "";
}

onClickOutside(target, () => {
  isOpen.value = false;
});
</script>

<template>
  <div ref="target" class="relative w-full">
    <button
      type="button"
      :disabled="disabled || saving"
      @click.stop="isOpen = !isOpen"
      class="tz-trigger flex w-full items-center justify-between gap-2 rounded-xl border border-transparent px-4 text-sm outline-none transition-all disabled:cursor-not-allowed disabled:opacity-50"
    >
      <span class="flex min-w-0 items-center gap-2">
        <span class="truncate">{{ formatTzName(modelValue) }}</span>
        <span class="shrink-0 text-xs opacity-60"
          >({{ getUTCOffset(modelValue) }})</span
        >
      </span>

      <svg
        v-if="saving"
        class="size-4 shrink-0 animate-spin text-primary"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          class="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          stroke-width="4"
        />
        <path
          class="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4Z"
        />
      </svg>
      <svg
        v-else
        :class="isOpen ? 'rotate-180' : ''"
        class="size-4 shrink-0 opacity-60 transition-transform duration-200"
        xmlns="http://www.w3.org/2000/svg"
        fill="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          fill-rule="evenodd"
          d="M18.4 10.3A2 2 0 0 0 17 7H7a2 2 0 0 0-1.5 3.3l4.9 5.9a2 2 0 0 0 3 0l5-6Z"
          clip-rule="evenodd"
        />
      </svg>
    </button>

    <Transition name="tz-fade">
      <div
        v-if="isOpen"
        class="tz-dropdown absolute left-0 right-0 top-[calc(100%+4px)] z-30 rounded-xl border shadow-lg"
      >
        <div class="relative p-2">
          <div
            class="pointer-events-none absolute inset-y-0 left-5 flex items-center"
          >
            <svg
              class="size-4 opacity-50"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 20 20"
            >
              <path
                stroke="currentColor"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
              />
            </svg>
          </div>
          <input
            v-model="search"
            type="search"
            class="tz-search w-full rounded-lg py-2 pl-10 pr-3 text-sm outline-none"
            placeholder="Pesquise seu fuso horário..."
          />
        </div>

        <div
          class="scrollbar-none max-h-[224px] space-y-0.5 overflow-y-auto px-2 pb-2"
        >
          <div
            v-if="!filtered.length"
            class="tz-empty rounded-lg p-3 text-center text-sm opacity-60"
          >
            Sem resultados
          </div>
          <button
            v-else
            v-for="(tz, index) in filtered"
            :key="index"
            @click="select(tz)"
            class="tz-option flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-sm transition-all"
            :class="tz === modelValue ? 'tz-option--active' : ''"
          >
            <span class="truncate">{{ formatTzName(tz) }}</span>
            <span class="shrink-0 text-xs opacity-60"
              >({{ getUTCOffset(tz) }})</span
            >
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.tz-trigger {
  height: 3rem;
  @apply bg-base-200;
}
.tz-trigger:focus,
.tz-trigger:not(:disabled):hover {
  border-color: hsl(var(--p, 220 90% 56%) / 0.4);
}

.tz-dropdown {
  @apply bg-base-300 border-base-200;
}

.tz-search {
  background-color: hsl(var(--bc, 215 14% 90%) / 0.04);
  color: inherit;
    @apply border-none outline-none focus:border-none
}
.tz-search:focus {
  background-color: hsl(var(--bc, 215 14% 90%) / 0.07);
}

.tz-option {
  color: inherit;
}
.tz-option:hover {
  background-color: hsl(var(--bc, 215 14% 90%) / 0.06);
}
.tz-option--active {
  background-color: hsl(var(--p, 220 90% 56%) / 0.15);
  color: hsl(var(--p, 220 90% 56%));
}

.tz-fade-enter-active,
.tz-fade-leave-active {
  transition: opacity 0.15s ease;
}
.tz-fade-enter-from,
.tz-fade-leave-to {
  opacity: 0;
}
</style>
