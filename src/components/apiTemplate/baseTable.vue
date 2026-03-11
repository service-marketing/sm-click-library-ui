<script setup>
/**
 * baseTable — generic paginated table with column filter dropdowns.
 *
 * Each column can declare a `filter` object to enable a filter dropdown:
 *
 *   filter: {
 *     type:         'text' | 'select' | 'checkbox' | 'multiselect'
 *     key?:         string       — API param key (defaults to col.key)
 *     placeholder?: string       — for text / multiselect
 *     options?:     Array<{ value: string, label: string }>  — for select/checkbox/multiselect
 *   }
 *
 * Props:
 *   columns      Array<Column>    — required
 *   rows         Array            — default []
 *   loading      Boolean          — default false
 *   totalItems   Number           — default 0
 *   itemsPerPage Number           — default 15
 *   currentPage  Number           — default 1
 *   emptyText    String           — default "Nenhum item encontrado"
 *   filters      Object           — default {}
 *
 * Events:
 *   update:currentPage (page)
 *   update:filters     (filters: Object)
 *
 * Slots:
 *   cell-{column.key}  scoped: { row, value }
 *   empty
 *   empty-action
 *   loading
 */
import { ref, watch, computed } from "vue";
import FilterText from "./sections/FilterText.vue";
import FilterSelect from "./sections/FilterSelect.vue";
import FilterMultiselect from "./sections/FilterMultiselect.vue";
import TableEmptyState from "./sections/TableEmptyState.vue";

const props = defineProps({
  columns: { type: Array, required: true },
  rows: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
  totalItems: { type: Number, default: 0 },
  itemsPerPage: { type: Number, default: 15 },
  currentPage: { type: Number, default: 1 },
  emptyText: { type: String, default: "Nenhum item encontrado" },
  filters: { type: Object, default: () => ({}) },
});

const emit = defineEmits(["update:currentPage", "update:filters"]);

// ── filter logic ──────────────────────────────────────────────────
// internalFilters = committed (sent to API, shown in badges)
// pendingFilters  = being edited inside the open dropdown
const internalFilters = ref({ ...props.filters });
const pendingFilters = ref({ ...props.filters });

watch(
  () => props.filters,
  (v) => {
    internalFilters.value = { ...v };
    pendingFilters.value = { ...v };
  },
  { deep: true },
);

function getFilterKey(col) {
  return col.filter?.key || col.key;
}

function isFilterActive(col) {
  const v = internalFilters.value[getFilterKey(col)];
  return Array.isArray(v) ? v.length > 0 : v != null && v !== "";
}

function getActiveCount(col) {
  const v = internalFilters.value[getFilterKey(col)];
  return Array.isArray(v) ? v.length : 0;
}

function buildActiveFilters() {
  const result = {};
  for (const [k, v] of Object.entries(internalFilters.value)) {
    const active = Array.isArray(v) ? v.length > 0 : v != null && v !== "";
    if (active) result[k] = v;
  }
  return result;
}

function emitFilters() {
  emit("update:filters", buildActiveFilters());
}

/** Write to pending — no API call yet */
function setFilter(col, value) {
  pendingFilters.value[getFilterKey(col)] = value;
}

/** Called when the Popper dropdown closes — commit pending → internal → API */
function onPopperClose(col) {
  const key = getFilterKey(col);
  const pending = pendingFilters.value[key];
  const current = internalFilters.value[key];
  const pendingActive = Array.isArray(pending)
    ? pending.length > 0
    : pending != null && pending !== "";
  const currentActive = Array.isArray(current)
    ? current.length > 0
    : current != null && current !== "";
  // Only emit if value actually changed
  if (JSON.stringify(pending ?? null) !== JSON.stringify(current ?? null)) {
    internalFilters.value[key] = pending ?? null;
    emitFilters();
  }
}

// Checkbox (inline, multi-select array) — writes pending
function onCheckboxToggle(col, value) {
  const key = getFilterKey(col);
  const current = pendingFilters.value[key];
  const arr = Array.isArray(current) ? [...current] : [];
  const idx = arr.indexOf(value);
  idx !== -1 ? arr.splice(idx, 1) : arr.push(value);
  pendingFilters.value[key] = arr.length ? arr : null;
}

/** Clear button in dropdown header — immediate full reset */
function clearFilter(col) {
  const key = getFilterKey(col);
  pendingFilters.value[key] = null;
  internalFilters.value[key] = null;
  emitFilters();
}

function clearAllFilters() {
  for (const col of props.columns.filter((c) => c.filter)) {
    const key = getFilterKey(col);
    pendingFilters.value[key] = null;
    internalFilters.value[key] = null;
  }
  emitFilters();
}

// Derived: chips for active filters (for empty-state display)
const activeFilterChips = computed(() => {
  return props.columns
    .filter((col) => col.filter && isFilterActive(col))
    .map((col) => {
      const v = internalFilters.value[getFilterKey(col)];
      let label = "";
      if (col.filter.type === "text") {
        label = `"${v}"`;
      } else if (col.filter.type === "select") {
        label = col.filter.options?.find((o) => o.value === v)?.label ?? v;
      } else if (
        col.filter.type === "multiselect" ||
        col.filter.type === "checkbox"
      ) {
        const names = (Array.isArray(v) ? v : [])
          .map(
            (id) =>
              col.filter.options?.find((o) => o.value === id)?.label ?? id,
          )
          .filter(Boolean);
        label = names.length ? names.join(", ") : "";
      }
      return { col, label };
    })
    .filter((c) => c.label);
});

const hasActiveFilters = computed(() => activeFilterChips.value.length > 0);

function isCheckboxChecked(col, value) {
  const current = pendingFilters.value[getFilterKey(col)];
  return Array.isArray(current) && current.includes(value);
}
// ──────────────────────────────────────────────────────────────────

function getHeaderAlignClass(align) {
  return align === "left"
    ? "text-left"
    : align === "right"
      ? "text-right"
      : "text-center";
}

function getHeaderFlexClass(align) {
  return align === "left"
    ? "justify-start"
    : align === "right"
      ? "justify-end"
      : "justify-center";
}
</script>

<template>
  <div class="w-full">
    <!-- Loading state -->
    <div
      v-if="loading"
      class="flex justify-center rounded-b-xl p-10 bg-base-200"
    >
      <slot name="loading">
        <div
          class="mx-auto size-14 animate-spin rounded-full border-4 border-teal-600 border-t-transparent"
        ></div>
      </slot>
    </div>

    <template v-else>
      <!-- Table -->
      <div class="w-full overflow-x-auto">
        <table class="w-full text-center text-sm">
          <thead
            class="bg-base-200 border-base-200 bg-opacity-100 shadow text-xs uppercase text-current"
          >
            <tr>
              <th
                v-for="col in columns"
                :key="col.key"
                scope="col"
                :class="[
                  'py-3.5 px-4 font-normal text-current',
                  getHeaderAlignClass(col.headerAlign),
                  col.width,
                  col.headerClass,
                ]"
              >
                <div
                  class="flex items-center gap-1.5"
                  :class="getHeaderFlexClass(col.headerAlign)"
                >
                  <span>{{ col.label }}</span>

                  <!-- Column filter dropdown -->
                  <Popper
                    v-if="col.filter"
                    placement="right"
                    :hover="false"
                    :arrow="false"
                    class="filter-popper"
                    @close:popper="onPopperClose(col)"
                  >
                    <template #content>
                      <div class="filter-dropdown" @click.stop>
                        <!-- Header -->
                        <div class="filter-dropdown-header">
                          <span class="filter-dropdown-title">
                            {{ col.label }}
                          </span>
                          <button
                            v-if="isFilterActive(col)"
                            @click="clearFilter(col)"
                            class="filter-clear-btn"
                            title="Limpar filtro"
                          >
                            <svg
                              class="size-3.5"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              stroke-width="2.5"
                            >
                              <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                d="M6 18L18 6M6 6l12 12"
                              />
                            </svg>
                          </button>
                        </div>

                        <!-- Text input ──────────────────── -->
                        <FilterText
                          v-if="col.filter.type === 'text'"
                          :model-value="pendingFilters[getFilterKey(col)]"
                          :placeholder="col.filter.placeholder"
                          @update:model-value="(v) => setFilter(col, v)"
                        />

                        <!-- Select / single-choice chips ── -->
                        <FilterSelect
                          v-else-if="col.filter.type === 'select'"
                          :options="col.filter.options"
                          :model-value="pendingFilters[getFilterKey(col)]"
                          @update:model-value="(v) => setFilter(col, v)"
                        />

                        <!-- Checkbox (legacy multi-select) ─ -->
                        <div
                          v-else-if="col.filter.type === 'checkbox'"
                          class="filter-dropdown-body"
                        >
                          <label
                            v-for="opt in col.filter.options"
                            :key="opt.value"
                            class="filter-checkbox-row"
                          >
                            <input
                              type="checkbox"
                              :checked="isCheckboxChecked(col, opt.value)"
                              @change="onCheckboxToggle(col, opt.value)"
                              class="filter-checkbox"
                            />
                            <span>{{ opt.label }}</span>
                          </label>
                        </div>

                        <!-- Multiselect (emits comma-separated IDs) -->
                        <FilterMultiselect
                          v-else-if="col.filter.type === 'multiselect'"
                          :options="col.filter.options"
                          :model-value="pendingFilters[getFilterKey(col)] ?? []"
                          :placeholder="col.filter.placeholder"
                          @update:model-value="
                            (v) => setFilter(col, v.length ? v : null)
                          "
                        />
                      </div>
                    </template>

                    <!-- Trigger: funnel icon + optional count badge -->
                    <button
                      :title="isFilterActive(col) ? 'Filtro ativo' : 'Filtrar'"
                      :class="[
                        'filter-trigger',
                        { active: isFilterActive(col) },
                      ]"
                    >
                      <svg
                        class="size-3.5"
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
                      <!-- Count badge for multiselect -->
                      <span
                        v-if="
                          col.filter?.type === 'multiselect' &&
                          getActiveCount(col) > 0
                        "
                        class="filter-count-badge"
                      >
                        {{ getActiveCount(col) }}
                      </span>
                    </button>
                  </Popper>
                </div>
              </th>
            </tr>
          </thead>
          <tbody v-if="rows.length > 0">
            <tr
              v-for="(row, index) in rows"
              :key="row.id ?? index"
              class="table-td"
            >
              <td
                v-for="col in columns"
                :key="col.key"
                :class="['px-4 py-3 text-sm', col.cellClass]"
              >
                <slot
                  :name="`cell-${col.key}`"
                  :row="row"
                  :value="row[col.key]"
                >
                  <span class="whitespace-nowrap">{{ row[col.key] }}</span>
                </slot>
              </td>
            </tr>
          </tbody>

          <!-- Empty state inside the table so the thead (filters) stays visible -->
          <tbody v-else>
            <tr>
              <td :colspan="columns.length" class="bg-base-300">
                <div
                  class="flex h-64 w-full items-center justify-center text-center"
                >
                  <slot name="empty">
                    <TableEmptyState
                      :empty-text="emptyText"
                      :has-active-filters="hasActiveFilters"
                      :chips="activeFilterChips"
                      @clear-filter="clearFilter"
                      @clear-all="clearAllFilters"
                    >
                      <template #empty-action>
                        <slot name="empty-action" />
                      </template>
                    </TableEmptyState>
                  </slot>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <nav
        class="flex items-center justify-center py-2 bg-base-200 rounded-b-xl overflow-hidden"
      >
        <vue-awesome-paginate
          v-if="totalItems > itemsPerPage"
          :total-items="totalItems"
          :items-per-page="itemsPerPage"
          :max-pages-shown="5"
          :model-value="currentPage"
          @click="$emit('update:currentPage', $event)"
        />
      </nav>
    </template>
  </div>
</template>

<style scoped>
.table-td {
  @apply bg-base-300 hover:bg-base-300/70;
}

/* ── Filter Dropdown ── */
/* .filter-popper {
  --popper-theme-background-color: rgba(15, 23, 42, 0.98);
  --popper-theme-background-color-hover: rgba(15, 23, 42, 0.98);
  --popper-theme-text-color: white;
  --popper-theme-border-width: 0px;
  --popper-theme-border-radius: 12px;
  --popper-theme-padding: 0px;
  --popper-theme-box-shadow: 0 20px 50px -12px rgba(0, 0, 0, 0.7);
} */

.filter-trigger {
  position: relative;
  @apply flex-shrink-0 rounded-md p-1 transition-all duration-200 cursor-pointer text-gray-500 hover:text-current;
}

.filter-trigger.active {
  @apply text-primary;
}

.filter-count-badge {
  position: absolute;
  top: -4px;
  right: -4px;
  display: grid;
  place-items: center;
  min-width: 14px;
  height: 14px;
  padding: 0 3px;
  border-radius: 999px;
  font-size: 9px;
  font-weight: 800;
  line-height: 1;
  background: #69eeb7;
  color: #0f172a;
  box-shadow: 0 0 0 2px rgba(15, 23, 42, 0.9);
}

.filter-dropdown {
  min-width: 240px;
  max-width: 340px;
}

.filter-dropdown-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  @apply border-b py-2 px-1 border-base-200;
}

.filter-dropdown-title {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  opacity: 0.6;
}

.filter-clear-btn {
  display: grid;
  place-items: center;
  width: 26px;
  height: 26px;
  border-radius: 8px;
  color: rgba(252, 165, 165, 0.9);
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.15);
  cursor: pointer;
  transition: all 160ms ease;
}

.filter-clear-btn:hover {
  background: rgba(239, 68, 68, 0.18);
  transform: translateY(-1px);
}

.filter-dropdown-body {
  padding-top: 10px;
}

/* Checkbox rows (legacy type) */
.filter-checkbox-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.75);
  transition: background 120ms ease;
}

.filter-checkbox-row:hover {
  background: rgba(255, 255, 255, 0.06);
}

.filter-checkbox {
  width: 16px;
  height: 16px;
  border-radius: 4px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  background: rgba(255, 255, 255, 0.04);
  accent-color: #69eeb7;
}
</style>
