<script setup>
/**
 * templateTable — shared WhatsApp template table used across sm-zap-front and
 * sm-click-attendance-screen.
 *
 * Renders: name, (lang), category badge, status badge, (departments), actions.
 * Delegates API calls and app-specific navigation to the parent via events/slots.
 *
 * Props:
 *   templates      Array                               – required
 *   loading        Boolean                             – default false
 *   totalPage      Number  (total records count)       – default 0
 *   currentPage    Number                              – default 1
 *   itemsPerPage   Number                              – default 15
 *   mode           'manage' | 'send'                   – default 'manage'
 *     manage → shows edit / delete / copy-id buttons
 *     send   → shows send button (only when status === 'approved')
 *   showLang           Boolean                         – default false
 *   showDepartments    Boolean                         – default false
 *
 * Events:
 *   send(template)        mode='send' – user clicked send
 *   edit(template)        mode='manage'
 *   delete(template)      mode='manage'
 *   copy-id(template)     mode='manage'
 *   update:currentPage(page)
 *
 * Slots:
 *   preview    scoped: { template }   – content rendered inside the preview Popper
 *   empty-action                      – CTA placed below the empty-state text
 *   extra-actions  scoped: { template } – additional action buttons after built-in ones
 */
import { computed } from "vue";
import baseTable from "./baseTable.vue";

const props = defineProps({
  templates: {
    type: Array,
    default: () => [],
  },
  loading: {
    type: Boolean,
    default: false,
  },
  totalPage: {
    type: Number,
    default: 0,
  },
  currentPage: {
    type: Number,
    default: 1,
  },
  itemsPerPage: {
    type: Number,
    default: 15,
  },
  mode: {
    type: String,
    default: "manage",
    validator: (v) => ["manage", "send"].includes(v),
  },
  showLang: {
    type: Boolean,
    default: false,
  },
  showDepartments: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits([
  "send",
  "edit",
  "delete",
  "copy-id",
  "update:currentPage",
]);

const columns = computed(() => {
  const cols = [{ key: "name", label: "Nome", width: "w-64" }];
  if (props.showLang)
    cols.push({ key: "lang", label: "Idioma", width: "w-20" });
  cols.push(
    { key: "category", label: "Categoria", width: "w-32" },
    { key: "status", label: "Status", width: "w-32" },
  );
  if (props.showDepartments)
    cols.push({ key: "department", label: "Departamento(s)", width: "w-28" });
  cols.push({
    key: "actions",
    label: "Ações",
    width: "w-44",
    cellClass: "whitespace-nowrap",
  });
  return cols;
});

function formatCategory(val) {
  switch (val?.toLowerCase()) {
    case "marketing":
      return "Marketing";
    case "utility":
      return "Utilidade";
    case "authentication":
      return "Autenticação";
    default:
      return val ?? "";
  }
}

function formatStatus(val) {
  switch (val?.toLowerCase()) {
    case "pending":
      return "Pendente";
    case "approved":
      return "Aprovado";
    case "rejected":
      return "Reprovado";
    case "pending_deletion":
      return "Aguardando deleção";
    default:
      return val ?? "";
  }
}
</script>

<template>
  <baseTable
    :columns="columns"
    :rows="templates"
    :loading="loading"
    :total-items="totalPage"
    :items-per-page="itemsPerPage"
    :current-page="currentPage"
    empty-text="Nenhum modelo de mensagem disponível"
    @update:current-page="$emit('update:currentPage', $event)"
  >
    <!-- Empty action passthrough -->
    <template #empty-action>
      <slot name="empty-action" />
    </template>

    <!-- Name -->
    <template #cell-name="{ row }">
      <span
        :title="row.name"
        class="block truncate text-center max-w-48 whitespace-nowrap font-medium text-sm"
      >
        {{ row.name }}
      </span>
    </template>

    <!-- Lang (optional) -->
    <template v-if="showLang" #cell-lang="{ row }">
      <span class="whitespace-nowrap text-sm font-medium">{{ row.lang }}</span>
    </template>

    <!-- Category badge -->
    <template #cell-category="{ row }">
      <div class="flex justify-center">
        <div
          class="gap-2 font-semibold flex justify-center items-center min-w-19 lg:min-w-32 w-0 p-1.5 rounded-lg transition-colors"
          :class="{
            'bg-sky-500/20 border border-sky-500/50 hover:border-sky-400 text-sky-400 hover:text-sky-200':
              row.category?.toLowerCase() === 'marketing',
            'bg-purple-500/20 border border-purple-500/50 hover:border-purple-400 text-purple-400 hover:text-purple-200':
              row.category?.toLowerCase() === 'utility',
          }"
        >
          <div class="flex-shrink-0 hidden lg:block">
            <!-- Marketing -->
            <svg
              v-if="row.category?.toLowerCase() === 'marketing'"
              class="size-4"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                fill-rule="evenodd"
                d="M18.458 3.11A1 1 0 0 1 19 4v16a1 1 0 0 1-1.581.814L12 16.944V7.056l5.419-3.87a1 1 0 0 1 1.039-.076ZM22 12c0 1.48-.804 2.773-2 3.465v-6.93c1.196.692 2 1.984 2 3.465ZM10 8H4a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h6V8Zm0 9H5v3a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-3Z"
                clip-rule="evenodd"
              />
            </svg>
            <!-- Utility -->
            <svg
              v-else-if="row.category?.toLowerCase() === 'utility'"
              class="size-4"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                d="M11.209 3.816a1 1 0 0 0-1.966.368l.325 1.74a5.338 5.338 0 0 0-2.8 5.762l.276 1.473.055.296c.258 1.374-.228 2.262-.63 2.998-.285.52-.527.964-.437 1.449.11.586.22 1.173.75 1.074l12.7-2.377c.528-.1.418-.685.308-1.27-.103-.564-.636-1.123-1.195-1.711-.606-.636-1.243-1.306-1.404-2.051-.233-1.085-.275-1.387-.303-1.587-.009-.063-.016-.117-.028-.182a5.338 5.338 0 0 0-5.353-4.39l-.298-1.592Z"
              />
              <path
                fill-rule="evenodd"
                d="M6.539 4.278a1 1 0 0 1 .07 1.412c-1.115 1.23-1.705 2.605-1.83 4.26a1 1 0 0 1-1.995-.15c.16-2.099.929-3.893 2.342-5.453a1 1 0 0 1 1.413-.069Z"
                clip-rule="evenodd"
              />
              <path
                d="M8.95 19.7c.7.8 1.7 1.3 2.8 1.3 1.6 0 2.9-1.1 3.3-2.5l-6.1 1.2Z"
              />
            </svg>
          </div>
          <span class="text-xs">{{ formatCategory(row.category) }}</span>
        </div>
      </div>
    </template>

    <!-- Status badge -->
    <template #cell-status="{ row }">
      <div class="flex justify-center">
        <div
          :class="{
            'bg-orange-500/20 border border-orange-500 text-orange-300 hover:text-orange-200 hover:border-orange-200':
              row.status?.toLowerCase() === 'pending',
            'bg-green-600/20 border border-green-600 text-green-300 hover:text-green-200 hover:border-green-200':
              row.status?.toLowerCase() === 'approved',
            'bg-red-500/20 border border-red-500 text-red-300 hover:text-red-200 hover:border-red-200':
              row.status?.toLowerCase() === 'rejected' ||
              row.status?.toLowerCase() === 'pending_deletion',
          }"
          class="p-1.5 rounded-lg font-semibold text-xs flex items-center justify-center gap-2 min-w-19 lg:min-w-28 w-0 transition-colors"
        >
          <div class="flex-shrink-0 hidden lg:block">
            <!-- Pending -->
            <svg
              v-if="row.status?.toLowerCase() === 'pending'"
              class="size-4"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                stroke="currentColor"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 8v4l3 3M3.22302 14C4.13247 18.008 7.71683 21 12 21c4.9706 0 9-4.0294 9-9 0-4.97056-4.0294-9-9-9-3.72916 0-6.92858 2.26806-8.29409 5.5M7 9H3V5"
              />
            </svg>
            <!-- Rejected -->
            <svg
              v-else-if="row.status?.toLowerCase() === 'rejected'"
              class="size-4"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                stroke="currentColor"
                stroke-linecap="round"
                stroke-width="2"
                d="m6 6 12 12m3-6a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
              />
            </svg>
            <!-- Approved -->
            <svg
              v-else-if="row.status?.toLowerCase() === 'approved'"
              class="size-4"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                stroke="currentColor"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="m8.032 12 1.984 1.984 4.96-4.96m4.55 5.272.893-.893a1.984 1.984 0 0 0 0-2.806l-.893-.893a1.984 1.984 0 0 1-.581-1.403V7.04a1.984 1.984 0 0 0-1.984-1.984h-1.262a1.983 1.983 0 0 1-1.403-.581l-.893-.893a1.984 1.984 0 0 0-2.806 0l-.893.893a1.984 1.984 0 0 1-1.403.581H7.04A1.984 1.984 0 0 0 5.055 7.04v1.262c0 .527-.209 1.031-.581 1.403l-.893.893a1.984 1.984 0 0 0 0 2.806l.893.893c.372.372.581.876.581 1.403v1.262a1.984 1.984 0 0 0 1.984 1.984h1.262c.527 0 1.031.209 1.403.581l.893.893a1.984 1.984 0 0 0 2.806 0l.893-.893a1.985 1.985 0 0 1 1.403-.581h1.262a1.984 1.984 0 0 0 1.984-1.984V15.7c0-.527.209-1.031.581-1.403Z"
              />
            </svg>
            <!-- Pending deletion -->
            <svg
              v-else-if="row.status?.toLowerCase() === 'pending_deletion'"
              class="size-4"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                stroke="currentColor"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M5 7h14m-9 3v8m4-8v8M10 3h4a1 1 0 0 1 1 1v3H9V4a1 1 0 0 1 1-1ZM6 7h12v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V7Z"
              />
            </svg>
          </div>
          <span class="text-xs">{{ formatStatus(row.status) }}</span>
        </div>
      </div>
    </template>

    <!-- Departments (optional) -->
    <template v-if="showDepartments" #cell-department="{ row }">
      <Popper placement="top" :arrow="false" class="tip-popper">
        <template #content>
          <section class="w-72 rounded-lg p-2">
            <div class="text-sm font-semibold text-slate-100 pb-2">
              Departamentos
            </div>
            <div v-if="row.department?.length > 0" class="space-y-2">
              <div
                v-for="depart in row.department"
                :key="depart.id"
                class="bg-slate-800/80 rounded-lg p-2 border border-slate-700/50 hover:border-blue-500/30 transition-all"
              >
                <span class="font-medium text-slate-100 text-sm">{{
                  depart.name
                }}</span>
              </div>
            </div>
            <div v-else class="text-xs text-slate-400 text-center py-2">
              Sem departamentos vinculados
            </div>
          </section>
        </template>
        <div
          class="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-blue-500/10 to-blue-400/10 border border-blue-500/30 rounded-lg cursor-pointer hover:border-blue-300/50 transition-all"
        >
          <svg
            class="size-5 text-blue-400"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              fill-rule="evenodd"
              d="M4 4a1 1 0 0 1 1-1h14a1 1 0 1 1 0 2v14a1 1 0 1 1 0 2H5a1 1 0 1 1 0-2V5a1 1 0 0 1-1-1Zm5 2a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1V7a1 1 0 0 0-1-1H9Zm5 0a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1V7a1 1 0 0 0-1-1h-1Zm-5 4a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1v-1a1 1 0 0 0-1-1H9Zm5 0a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1v-1a1 1 0 0 0-1-1h-1Zm-3 4a2 2 0 0 0-2 2v3h2v-3h2v3h2v-3a2 2 0 0 0-2-2h-2Z"
              clip-rule="evenodd"
            />
          </svg>
          <span class="text-sm font-semibold text-blue-500">{{
            row.department?.length
          }}</span>
        </div>
      </Popper>
    </template>

    <!-- Actions -->
    <template #cell-actions="{ row }">
      <main class="flex items-center justify-center gap-2">
        <!-- Preview (always visible) -->
        <Popper placement="left" class="preview-popper">
          <template #content>
            <div class="border border-base-200 rounded-md overflow-hidden">
              <div
                class="flex justify-between items-center p-2 sticky top-0 bg-base-200 z-10"
              >
                <p class="font-semibold text-sm">{{ row.name }}</p>
              </div>
              <slot name="preview" :template="row">
                <span class="block p-4 text-xs text-gray-400 text-center">
                  Sem pré-visualização disponível
                </span>
              </slot>
            </div>
          </template>
          <button class="group action-btn action-btn-info">
            <svg
              class="size-4"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
              <path
                fill-rule="evenodd"
                d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                clip-rule="evenodd"
              />
            </svg>
            <span
              class="pointer-events-none absolute -left-0 top-[-60px] z-30 m-2 mx-auto -translate-x-1/3 rounded-md bg-slate-700 p-2 text-sm text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100"
              >Pré-visualizar</span
            >
          </button>
        </Popper>

        <!-- Send (mode='send') -->
        <button
          v-if="mode === 'send'"
          :disabled="row.status?.toLowerCase() !== 'approved'"
          :class="[
            'action-btn group',
            row.status?.toLowerCase() === 'approved'
              ? 'action-btn-success'
              : 'action-btn-danger',
          ]"
          @click="$emit('send', row)"
        >
          <svg
            class="size-4"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="currentColor"
            viewBox="0 0 14 16"
          >
            <path
              d="M0 .984v14.032a1 1 0 0 0 1.506.845l12.006-7.016a.974.974 0 0 0 0-1.69L1.506.139A1 1 0 0 0 0 .984Z"
            />
          </svg>
          <span
            class="pointer-events-none absolute -left-0 top-[-60px] z-30 m-2 mx-auto -translate-x-1/3 rounded-md bg-slate-700 p-2 text-sm text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            >Enviar modelo</span
          >
        </button>

        <!-- Edit (mode='manage') -->
        <button
          v-if="mode === 'manage'"
          class="group action-btn action-btn-success"
          @click="$emit('edit', row)"
        >
          <svg
            class="size-4"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"
            />
          </svg>
          <span
            class="pointer-events-none absolute -left-0 top-[-60px] z-30 m-2 mx-auto -translate-x-1/3 rounded-md bg-slate-700 p-2 text-sm text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            >Editar Template</span
          >
        </button>

        <!-- Delete (mode='manage') -->
        <button
          v-if="mode === 'manage'"
          class="group action-btn action-btn-danger"
          @click="$emit('delete', row)"
        >
          <svg
            class="size-4"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M0 0h24v24H0V0z" fill="none" />
            <path
              d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM8 9h8v10H8V9zm7.5-5l-1-1h-5l-1 1H5v2h14V4z"
            />
          </svg>
          <span
            class="pointer-events-none absolute -left-0 top-[-60px] z-30 m-2 mx-auto -translate-x-1/3 rounded-md bg-slate-700 p-2 text-sm text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            >Excluir</span
          >
        </button>

        <!-- Copy ID (mode='manage') -->
        <button
          v-if="mode === 'manage'"
          class="group action-btn action-btn-info"
          @click="$emit('copy-id', row)"
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
              fill-rule="evenodd"
              d="M7 9v6a4 4 0 0 0 4 4h4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h1v2Z"
              clip-rule="evenodd"
            />
            <path
              fill-rule="evenodd"
              d="M13 3.054V7H9.2a2 2 0 0 1 .281-.432l2.46-2.87A2 2 0 0 1 13 3.054ZM15 3v4a2 2 0 0 1-2 2H9v6a2 2 0 0 0 2 2h7a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2h-3Z"
              clip-rule="evenodd"
            />
          </svg>
          <span
            class="pointer-events-none absolute -left-0 top-[-60px] z-30 m-2 mx-auto -translate-x-1/3 rounded-md bg-slate-700 p-2 text-sm text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            >Copiar ID</span
          >
        </button>
      </main>
      <!-- Extra actions injected by the parent -->
      <slot name="extra-actions" :template="row" />
    </template>
  </baseTable>
</template>

<style scoped>
.tip-popper {
  --popper-theme-background-color: rgba(2, 13, 36, 0.95);
  --popper-theme-background-color-hover: rgb(15 23 42 / 0.95);
  --popper-theme-text-color: white;
  --popper-theme-border-width: 0px;
  --popper-theme-border-radius: 6px;
  --popper-theme-padding: 0px;
  --popper-theme-box-shadow: 0 6px 30px -6px rgba(0, 0, 0, 0.7);
}

.preview-popper {
  --popper-theme-background-color: rgb(15 23 42 / 0.98);
  --popper-theme-background-color-hover: rgb(15 23 42 / 0.98);
  --popper-theme-text-color: currentColor;
  --popper-theme-border-width: 0px;
  --popper-theme-border-radius: 8px;
  --popper-theme-padding: 0px;
  --popper-theme-box-shadow: 0 10px 40px -10px rgba(0, 0, 0, 0.8);
}
</style>
