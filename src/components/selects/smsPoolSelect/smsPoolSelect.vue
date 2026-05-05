<script setup>
import { ref, watch, onMounted, onBeforeUnmount, computed } from "vue";
import InfiniteLoading from "v3-infinite-loading";
import {
  getSmsPoolCredits,
  listSmsPoolsPaginated,
} from "~/composables/useSmsPools";
import { smsPoolUrl } from "~/utils/systemUrls";

/**
 * SmsPoolSelect — seletor de carteira SMS reutilizável.
 *
 * Modos de uso:
 *  1. Auto-fetch (padrão): o componente busca as carteiras via API automaticamente.
 *  2. Controlado: passe `pools` + `loading` e o componente não faz chamadas API.
 */
const props = defineProps({
  /** Carteira selecionada (objeto completo ou null) */
  modelValue: { default: null },
  /** Lista externa de carteiras (desativa o auto-fetch quando fornecida) */
  pools: { type: Array, default: null },
  /** Estado de carregamento externo (usado com `pools`) */
  loading: { type: Boolean, default: false },
  /** Mensagem de erro a exibir abaixo do select */
  error: { type: String, default: "" },
  /** Label exibida acima do select */
  label: { type: String, default: "Carteira SMS" },
  /** Placeholder quando nenhuma carteira estiver selecionada */
  placeholder: { type: String, default: "Selecione uma carteira" },
  /** Desabilita o select */
  disabled: { type: Boolean, default: false },
  /** URL alternativa para o auto-fetch */
  apiUrl: { type: String, default: smsPoolUrl },
});

const emit = defineEmits(["update:modelValue"]);

// ── Estado interno (auto-fetch) ──────────────────────────────────────────────
const open = ref(false);
const openUpward = ref(false);
const search = ref("");
const internalItems = ref([]);
const page = ref(1);
const loadKey = ref(0);
const internalLoading = ref(false);
const hasNext = ref(true);
const dropdownRef = ref(null);
const triggerRef = ref(null);

const DROPDOWN_HEIGHT = 260; // px estimado do painel

function computeDirection() {
  if (!triggerRef.value) return;
  const rect = triggerRef.value.getBoundingClientRect();
  const spaceBelow = window.innerHeight - rect.bottom;
  openUpward.value = spaceBelow < DROPDOWN_HEIGHT && rect.top > DROPDOWN_HEIGHT;
}

const isExternalMode = computed(() => Array.isArray(props.pools));

const displayItems = computed(() =>
  isExternalMode.value ? props.pools : internalItems.value,
);

const isLoading = computed(() =>
  isExternalMode.value ? props.loading : internalLoading.value,
);

// ── Auto-fetch ───────────────────────────────────────────────────────────────

async function load($state) {
  if (isExternalMode.value) {
    $state.complete();
    return;
  }
  internalLoading.value = true;
  try {
    const data = await listSmsPoolsPaginated({
      page: page.value,
      search: search.value,
      url: props.apiUrl,
    });
    const results = Array.isArray(data?.results)
      ? data.results
      : Array.isArray(data)
        ? data
        : [];
    internalItems.value.push(...results);
    page.value++;
    if (data.next) {
      hasNext.value = true;
      $state.loaded();
    } else {
      hasNext.value = false;
      $state.complete();
    }
  } catch {
    $state.error();
  } finally {
    internalLoading.value = false;
  }
}

let debounceTimer = null;
function resetList() {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    internalItems.value = [];
    page.value = 1;
    hasNext.value = true;
    loadKey.value++;
  }, 350);
}

watch(search, () => {
  if (!isExternalMode.value) resetList();
});

// ── Interação ────────────────────────────────────────────────────────────────

function selectPool(pool) {
  if (getSmsPoolCredits(pool) <= 0) return;
  emit("update:modelValue", pool);
  open.value = false;
}

function clearSelection(e) {
  e.stopPropagation();
  emit("update:modelValue", null);
}

function toggleOpen() {
  if (props.disabled) return;
  if (!open.value) computeDirection();
  open.value = !open.value;
}

function onClickOutside(e) {
  if (dropdownRef.value && !dropdownRef.value.contains(e.target))
    open.value = false;
}

onMounted(() => document.addEventListener("mousedown", onClickOutside));
onBeforeUnmount(() => {
  document.removeEventListener("mousedown", onClickOutside);
  clearTimeout(debounceTimer);
});
</script>

<template>
  <div>
    <!-- Label -->
    <label
      v-if="label"
      class="mb-1.5 block text-xs font-semibold uppercase tracking-wide opacity-80"
    >
      {{ label }}
    </label>

    <!-- Wrapper -->
    <div ref="dropdownRef" class="relative">
      <!-- Trigger -->
      <button
        ref="triggerRef"
        type="button"
        :disabled="disabled"
        @click="toggleOpen"
        class="flex w-full items-center justify-between rounded-lg bg-base-200 px-3 py-2.5 text-sm transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-60"
        :class="{ 'ring-2 ring-red-500/60': error }"
      >
        <span v-if="modelValue" class="flex items-center gap-2 truncate">
          <span class="truncate font-semibold">{{ modelValue.name }}</span>
          <span
            class="shrink-0 rounded-full bg-primary/20 px-2 py-0.5 text-xs font-bold text-primary"
          >
            {{ getSmsPoolCredits(modelValue) }} créditos
          </span>
        </span>
        <span v-else class="text-current/40">{{ placeholder }}</span>

        <span class="ml-2 flex shrink-0 items-center gap-1">
          <!-- Clear button -->
          <span
            v-if="modelValue"
            @click="clearSelection"
            class="flex size-4 items-center justify-center rounded-full text-current/40 transition hover:text-current/80"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="size-3.5"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                fill-rule="evenodd"
                d="M2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10S2 17.523 2 12Zm7.707-3.707a1 1 0 0 0-1.414 1.414L10.586 12l-2.293 2.293a1 1 0 1 0 1.414 1.414L12 13.414l2.293 2.293a1 1 0 0 0 1.414-1.414L13.414 12l2.293-2.293a1 1 0 0 0-1.414-1.414L12 10.586 9.707 8.293Z"
                clip-rule="evenodd"
              />
            </svg>
          </span>
          <!-- Chevron -->
          <svg
            class="size-4 text-current/50 transition-transform"
            :class="{ 'rotate-180': open }"
            xmlns="http://www.w3.org/2000/svg"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              fill-rule="evenodd"
              d="M18.425 10.271C19.499 8.967 18.57 7 16.88 7H7.12c-1.69 0-2.618 1.967-1.544 3.271l4.881 5.927a2 2 0 0 0 3.088 0l4.88-5.927Z"
              clip-rule="evenodd"
            />
          </svg>
        </span>
      </button>

      <!-- Dropdown panel -->
      <Transition name="sms-pool-fade">
        <div
          v-if="open"
          class="absolute left-0 z-30 w-full overflow-hidden rounded-lg bg-base-300 shadow-lg shadow-black/20"
          :class="openUpward ? 'bottom-full mb-1' : 'top-full mt-1'"
        >
          <!-- Search -->
          <div
            v-if="!isExternalMode"
            class="border-b border-base-100/50 px-2 py-2"
          >
            <input
              v-model="search"
              type="text"
              placeholder="Buscar carteira…"
              class="w-full border-none focus:border-none rounded-md bg-base-200 px-3 py-1.5 text-sm outline-none placeholder:text-current/30"
              @click.stop
            />
          </div>

          <!-- Scrollable list -->
          <div class="max-h-52 overflow-y-auto">
            <!-- Loading skeleton (external mode) -->
            <div v-if="isLoading && displayItems.length === 0" class="px-3 py-3 space-y-2">
              <div
                v-for="n in 3"
                :key="n"
                class="h-8 w-full animate-pulse rounded-md bg-base-100/60"
              />
            </div>

            <template v-else>
              <div
                v-for="pool in displayItems"
                :key="pool.id"
                @click="selectPool(pool)"
                class="flex items-center justify-between px-3 py-2.5 text-sm transition"
                :class="[
                  getSmsPoolCredits(pool) <= 0
                    ? 'cursor-not-allowed opacity-40'
                    : 'cursor-pointer hover:bg-base-200/60',
                  modelValue?.id === pool.id ? 'bg-primary/10 font-semibold' : '',
                ]"
              >
                <span class="flex items-center gap-2 truncate">
                  <svg
                    v-if="modelValue?.id === pool.id"
                    class="size-3.5 shrink-0 text-primary"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10S2 17.523 2 12Zm13.707-1.293a1 1 0 0 0-1.414-1.414L11 12.586l-1.793-1.793a1 1 0 0 0-1.414 1.414l2.5 2.5a1 1 0 0 0 1.414 0l4-4Z"
                      clip-rule="evenodd"
                    />
                  </svg>
                  <span class="truncate">{{ pool.name }}</span>
                </span>
                <span
                  class="ml-2 shrink-0 rounded-full px-2 py-0.5 text-xs font-bold"
                  :class="
                    getSmsPoolCredits(pool) > 0
                      ? 'bg-primary/20 text-primary'
                      : 'bg-base-100 text-current/40'
                  "
                >
                  {{ getSmsPoolCredits(pool) }} créditos
                </span>
              </div>

              <!-- Empty state -->
              <p
                v-if="!isLoading && displayItems.length === 0"
                class="py-4 text-center text-sm text-current/40"
              >
                Nenhuma carteira encontrada
              </p>

              <!-- Infinite scroll (auto-fetch mode) -->
              <InfiniteLoading
                v-if="!isExternalMode && hasNext"
                :key="loadKey"
                @infinite="load"
              >
                <template #spinner>
                  <div class="flex justify-center py-3">
                    <div
                      class="size-5 animate-spin rounded-full border-4 border-t-transparent border-primary"
                    />
                  </div>
                </template>
                <template #complete><span /></template>
              </InfiniteLoading>
            </template>
          </div>
        </div>
      </Transition>
    </div>

    <!-- Error message -->
    <p v-if="error" class="mt-1 text-xs text-red-500">{{ error }}</p>
  </div>
</template>

<style scoped>
.sms-pool-fade-enter-active,
.sms-pool-fade-leave-active {
  transition:
    opacity 0.15s ease,
    transform 0.15s ease;
}
.sms-pool-fade-enter-from,
.sms-pool-fade-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
