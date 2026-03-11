<script setup>
/**
 * baseTable — generic paginated table with column filter dropdowns.
 *
 * Each column can declare a `filter` object to enable a filter dropdown:
 *
 *   filter: {
 *     type:         'text' | 'select' | 'checkbox'
 *     key?:         string       — API param key (defaults to col.key)
 *     placeholder?: string       — for text type
 *     options?:     Array<{ value: string, label: string }>  — for select/checkbox
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
import { ref, watch, onBeforeUnmount } from "vue";

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
const internalFilters = ref({ ...props.filters });
let debounceTimer = null;

watch(
  () => props.filters,
  (v) => {
    internalFilters.value = { ...v };
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

function onTextInput(col, event) {
  internalFilters.value[getFilterKey(col)] = event.target.value || null;
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(emitFilters, 400);
}

function onSelectToggle(col, value) {
  const key = getFilterKey(col);
  internalFilters.value[key] =
    internalFilters.value[key] === value ? null : value;
  emitFilters();
}

function onCheckboxToggle(col, value) {
  const key = getFilterKey(col);
  const current = internalFilters.value[key];
  const arr = Array.isArray(current) ? [...current] : [];
  const idx = arr.indexOf(value);
  idx !== -1 ? arr.splice(idx, 1) : arr.push(value);
  internalFilters.value[key] = arr.length ? arr : null;
  emitFilters();
}

function clearFilter(col) {
  internalFilters.value[getFilterKey(col)] = null;
  emitFilters();
}

function isCheckboxChecked(col, value) {
  const current = internalFilters.value[getFilterKey(col)];
  return Array.isArray(current) && current.includes(value);
}

onBeforeUnmount(() => clearTimeout(debounceTimer));
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
    <div v-if="loading" class="flex justify-center p-10 bg-base-200">
      <slot name="loading">
        <div
          class="mx-auto size-14 animate-spin rounded-full border-4 border-teal-600 border-t-transparent"
        ></div>
      </slot>
    </div>

    <template v-else>
      <!-- Table -->
      <div class="w-full overflow-x-auto">
        <table v-if="rows.length > 0" class="w-full text-center text-sm">
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

                        <!-- Text input -->
                        <div
                          v-if="col.filter.type === 'text'"
                          class="filter-dropdown-body"
                        >
                          <input
                            :value="internalFilters[getFilterKey(col)] ?? ''"
                            @input="onTextInput(col, $event)"
                            @keydown.stop
                            type="text"
                            class="filter-text-input"
                            :placeholder="col.filter.placeholder || 'Buscar...'"
                          />
                        </div>

                        <!-- Select (single choice chips) -->
                        <div
                          v-else-if="col.filter.type === 'select'"
                          class="filter-dropdown-body"
                        >
                          <div class="filter-select-grid">
                            <button
                              v-for="opt in col.filter.options"
                              :key="opt.value"
                              type="button"
                              class="filter-select-option"
                              :class="{
                                active:
                                  internalFilters[getFilterKey(col)] ===
                                  opt.value,
                              }"
                              @click="onSelectToggle(col, opt.value)"
                            >
                              {{ opt.label }}
                            </button>
                          </div>
                        </div>

                        <!-- Checkbox (multi-select) -->
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
                      </div>
                    </template>

                    <!-- Trigger: funnel icon -->
                    <button
                      :title="isFilterActive(col) ? 'Filtro ativo' : 'Filtrar'"
                      :class="[
                        'filter-trigger',
                        { active: isFilterActive(col) },
                      ]"
                    >
                      <svg
                        class="size-4"
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
                    </button>
                  </Popper>
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
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
        </table>

        <!-- Empty state -->
        <div v-else class="flex justify-center bg-base-200">
          <div class="flex h-64 w-full items-center justify-center text-center">
            <slot name="empty">
              <div class="mx-auto flex w-full flex-col items-center">
                <div
                  class="mx-auto rounded-full bg-blue-100 p-3 text-blue-500 dark:bg-gray-800"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke-width="1.5"
                    stroke="currentColor"
                    class="w-14"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                    />
                  </svg>
                </div>
                <h1 class="mt-3 text-lg px-2 text-current">
                  {{ emptyText }}
                </h1>
                <slot name="empty-action" />
              </div>
            </slot>
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <nav
        v-if="totalItems > itemsPerPage"
        class="flex items-center justify-center py-3 bg-base-200"
      >
        <vue-awesome-paginate
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
  @apply flex-shrink-0 rounded-md p-1 transition-all duration-200 cursor-pointer text-gray-500 hover:text-current;
}

.filter-trigger.active {
  @apply text-primary;
}

.filter-dropdown {
  min-width: 240px;
  max-width: 340px;
}

.filter-dropdown-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 14px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.filter-dropdown-title {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: rgba(255, 255, 255, 0.6);
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

/* Text input */
.filter-text-input {
  width: 100%;
  padding: 10px 12px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.9);
  font-size: 13px;
  outline: none;
  transition: border-color 160ms ease;
}

.filter-text-input:focus {
  border-color: rgba(105, 238, 183, 0.5);
}

.filter-text-input::placeholder {
  color: rgba(255, 255, 255, 0.3);
}

/* Select chips */
.filter-select-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.filter-select-option {
  padding: 10px 8px;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.04);
  color: rgba(255, 255, 255, 0.75);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 160ms ease;
  text-align: center;
}

.filter-select-option:hover {
  background: rgba(255, 255, 255, 0.08);
  transform: translateY(-1px);
}

.filter-select-option.active {
  background: rgba(105, 238, 183, 0.15);
  border-color: rgba(105, 238, 183, 0.3);
  color: rgba(105, 238, 183, 0.95);
  box-shadow: 0 0 0 3px rgba(105, 238, 183, 0.08);
}

/* Checkbox rows */
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
