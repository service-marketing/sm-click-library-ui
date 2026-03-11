<script setup>
import { ref, computed, watch } from "vue";

const props = defineProps({
  options: { type: Array, default: () => [] },
  modelValue: { type: Array, default: () => [] },
  placeholder: { type: String, default: "Buscar..." },
});

const emit = defineEmits(["update:modelValue"]);

const search = ref("");

const filtered = computed(() => {
  const q = search.value.trim().toLowerCase();
  return q
    ? props.options.filter((o) => o.label.toLowerCase().includes(q))
    : props.options;
});

const selectedCount = computed(() => props.modelValue.length);

function isSelected(val) {
  return props.modelValue.includes(val);
}

function toggle(val) {
  const next = isSelected(val)
    ? props.modelValue.filter((v) => v !== val)
    : [...props.modelValue, val];
  emit("update:modelValue", next);
}

function clearAll() {
  emit("update:modelValue", []);
}

const PALETTE = [
  "#3b82f6",
  "#8b5cf6",
  "#ec4899",
  "#f59e0b",
  "#10b981",
  "#ef4444",
  "#06b6d4",
  "#f97316",
];

function avatarColor(label) {
  return PALETTE[label.charCodeAt(0) % PALETTE.length];
}
</script>

<template>
  <!-- ── Search bar ─────────────────────────────────── -->
  <div class="ms-search">
    <svg
      class="ms-search-icon"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
    >
      <path
        fill-rule="evenodd"
        d="M9 3.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11ZM2 9a7 7 0 1 1 12.452 4.391l3.328 3.329a.75.75 0 1 1-1.06 1.06l-3.329-3.328A7 7 0 0 1 2 9Z"
        clip-rule="evenodd"
      />
    </svg>
    <input
      v-model="search"
      type="text"
      class="ms-search-input"
      :placeholder="placeholder"
      @keydown.stop
    />
    <button
      v-if="search"
      type="button"
      class="ms-search-clear"
      @click="search = ''"
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2.5"
        class="size-3"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M6 18 18 6M6 6l12 12"
        />
      </svg>
    </button>
  </div>

  <!-- ── Options list ───────────────────────────────── -->
  <div class="ms-list">
    <!-- Selected items first, then the rest -->
    <template v-if="filtered.length">
      <button
        v-for="opt in filtered"
        :key="opt.value"
        type="button"
        class="ms-option"
        :class="{ 'ms-option--on': isSelected(opt.value) }"
        @click="toggle(opt.value)"
      >
        <!-- Custom checkbox -->
        <!-- <span
          class="ms-chk"
          :class="{ 'ms-chk--on': isSelected(opt.value) }"
        >
          <svg
            v-show="isSelected(opt.value)"
            viewBox="0 0 12 10"
            fill="none"
            stroke="currentColor"
            stroke-width="2.4"
            class="size-2.5"
            style="color: #0f172a"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M1 5 4.5 8.5 11 1.5"
            />
          </svg>
        </span> -->

        <!-- Colored initial avatar -->
        <span class="ms-avatar" :style="{ background: avatarColor(opt.label) }">
          {{ opt.label[0].toUpperCase() }}
        </span>

        <!-- Label -->
        <span class="ms-label">{{ opt.label }}</span>

        <!-- Checkmark badge when selected -->
        <svg
          v-if="isSelected(opt.value)"
          class="ms-selected-badge"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path
            fill-rule="evenodd"
            d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-1.814a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z"
            clip-rule="evenodd"
          />
        </svg>
      </button>
    </template>

    <!-- Empty state -->
    <div v-else class="ms-empty">
      <svg
        class="size-8 opacity-30"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        stroke-width="1.5"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
        />
      </svg>
      <span class="text-xs opacity-50"
        >Nenhum resultado para "{{ search }}"</span
      >
    </div>
  </div>

  <!-- ── Footer: count + clear + hint ───────────── -->
  <div class="ms-footer">
    <Transition name="ms-footer-content">
      <div v-if="selectedCount > 0" class="ms-footer-left w-full">
        <span class="ms-footer-count">
          <svg
            class="size-3.5"
            style="color: #69eeb7"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path
              fill-rule="evenodd"
              d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-1.814a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z"
              clip-rule="evenodd"
            />
          </svg>
          {{ selectedCount }}
          {{ selectedCount === 1 ? "selecionado" : "selecionados" }}
        </span>
        <button type="button" class="ms-footer-clear ml-auto" @click="clearAll">
          Limpar
        </button>
      </div>
    </Transition>

    <!-- <span class="ms-footer-hint">
      <svg class="size-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
      </svg>
      Fechar para aplicar
    </span> -->
  </div>
</template>

<style scoped>
/* ── Search bar ─────────────────────────────────────── */
.ms-search {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 10px 10px 6px;
  padding: 7px 10px;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.04);
  transition:
    border-color 160ms ease,
    background 160ms ease;
}

.ms-search:focus-within {
  border-color: rgba(105, 238, 183, 0.4);
  background: rgba(105, 238, 183, 0.04);
}

.ms-search-icon {
  flex-shrink: 0;
  width: 14px;
  height: 14px;
  opacity: 0.35;
  transition: opacity 160ms ease;
}

.ms-search:focus-within .ms-search-icon {
  opacity: 0.65;
}

.ms-search-input {
  flex: 1;
  min-width: 0;
  background: transparent;
  border: none;
  outline: none;
  font-size: 12.5px;
  color: inherit;
}

.ms-search-input::placeholder {
  opacity: 0.38;
}

.ms-search-clear {
  display: grid;
  place-items: center;
  flex-shrink: 0;
  width: 20px;
  height: 20px;
  border-radius: 5px;
  background: transparent;
  border: none;
  color: inherit;
  opacity: 0.45;
  cursor: pointer;
  transition: opacity 120ms;
}

.ms-search-clear:hover {
  opacity: 1;
}

/* ── Options list ───────────────────────────────────── */
.ms-list {
  max-height: 230px;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.1) transparent;
}

.ms-list::-webkit-scrollbar {
  width: 4px;
}
.ms-list::-webkit-scrollbar-track {
  background: transparent;
}
.ms-list::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
}

/* ── Option row ─────────────────────────────────────── */
.ms-option {
  display: flex;
  align-items: center;
  gap: 9px;
  width: 100%;
  padding: 7px 8px;
  border-radius: 9px;
  border: 1px solid transparent;
  background: transparent;
  cursor: pointer;
  color: inherit;
  text-align: left;
  transition:
    background 130ms ease,
    border-color 130ms ease;
  position: relative;
}

.ms-option:hover {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.07);
}

.ms-option--on {
  background: rgba(105, 238, 183, 0.07) !important;
  border-color: rgba(105, 238, 183, 0.2) !important;
}

/* ── Custom checkbox ────────────────────────────────── */
.ms-chk {
  flex-shrink: 0;
  display: grid;
  place-items: center;
  width: 16px;
  height: 16px;
  border-radius: 5px;
  border: 1.5px solid rgba(255, 255, 255, 0.2);
  background: rgba(255, 255, 255, 0.03);
  transition:
    background 150ms ease,
    border-color 150ms ease,
    box-shadow 150ms ease;
}

.ms-chk--on {
  background: #69eeb7;
  border-color: #69eeb7;
  box-shadow: 0 0 0 3px rgba(105, 238, 183, 0.18);
}

/* ── Initial avatar ─────────────────────────────────── */
.ms-avatar {
  flex-shrink: 0;
  display: grid;
  place-items: center;
  width: 24px;
  height: 24px;
  border-radius: 7px;
  font-size: 10.5px;
  font-weight: 800;
  color: #fff;
  letter-spacing: 0;
  opacity: 0.88;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.2);
}

/* ── Option label ───────────────────────────────────── */
.ms-label {
  flex: 1;
  min-width: 0;
  font-size: 13px;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* ── Selected badge (right side tick) ──────────────── */
.ms-selected-badge {
  flex-shrink: 0;
  width: 14px;
  height: 14px;
  color: #69eeb7;
  opacity: 0.9;
  margin-left: auto;
}

/* ── Empty state ────────────────────────────────────── */
.ms-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 22px 12px;
}

/* ── Footer ─────────────────────────────────────────── */
.ms-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-top: 2px;
  @apply pt-2 border-t border-base-200;
}

.ms-footer-left {
  display: flex;
  align-items: center;
  gap: 6px;
  overflow: hidden;
  justify-content: space-between;
}

.ms-footer-count {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 11.5px;
  font-weight: 600;
  opacity: 0.75;
  white-space: nowrap;
}

.ms-footer-clear {
  font-size: 11px;
  font-weight: 700;
  padding: 3px 8px;
  border-radius: 7px;
  border: 1px solid rgba(239, 68, 68, 0.25);
  background: rgba(239, 68, 68, 0.08);
  color: rgba(252, 165, 165, 0.85);
  cursor: pointer;
  white-space: nowrap;
  transition: all 130ms ease;
}

.ms-footer-clear:hover {
  background: rgba(239, 68, 68, 0.16);
  border-color: rgba(239, 68, 68, 0.4);
  color: rgba(252, 165, 165, 1);
}

.ms-footer-hint {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 10.5px;
  font-weight: 500;
  opacity: 0.3;
  white-space: nowrap;
  margin-left: auto;
  flex-shrink: 0;
}

/* ── Footer content transition ──────────────────────── */
.ms-footer-content-enter-active,
.ms-footer-content-leave-active {
  transition:
    opacity 180ms ease,
    transform 180ms ease,
    max-width 200ms ease;
  overflow: hidden;
}

.ms-footer-content-enter-from,
.ms-footer-content-leave-to {
  opacity: 0;
  transform: translateX(-6px);
  max-width: 0;
}
</style>
