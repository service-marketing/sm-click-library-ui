<script setup>
/**
 * baseTable — generic paginated table component.
 *
 * Props:
 *   columns      Array<{ key, label, width?, headerClass?, cellClass?, headerAlign? }>   - required
 *   rows         Array                                                       - default []
 *   loading      Boolean                                                     - default false
 *   totalItems   Number  (total records for pagination)                      - default 0
 *   itemsPerPage Number                                                      - default 15
 *   currentPage  Number                                                      - default 1
 *   emptyText    String                                                      - default "Nenhum item encontrado"
 *
 * Events:
 *   update:currentPage (page: Number)
 *
 * Slots:
 *   cell-{column.key}  scoped: { row, value }   — custom cell renderer
 *   empty                                        — replaces the full empty state
 *   empty-action                                 — injected below emptyText (CTA button, etc.)
 *   loading                                      — replaces the default spinner
 */
const props = defineProps({
  columns: {
    type: Array,
    required: true,
  },
  rows: {
    type: Array,
    default: () => [],
  },
  loading: {
    type: Boolean,
    default: false,
  },
  totalItems: {
    type: Number,
    default: 0,
  },
  itemsPerPage: {
    type: Number,
    default: 15,
  },
  currentPage: {
    type: Number,
    default: 1,
  },
  emptyText: {
    type: String,
    default: "Nenhum item encontrado",
  },
});

const emit = defineEmits(["update:currentPage"]);

function getHeaderAlignClass(align) {
  switch (align) {
    case "left":
      return "text-left";
    case "right":
      return "text-right";
    case "center":
    default:
      return "text-center";
  }
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
                {{ col.label }}
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
                <h1 class="mt-3 text-lg px-2 text-current">{{ emptyText }}</h1>
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
</style>
