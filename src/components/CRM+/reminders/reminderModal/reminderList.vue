<script setup>
import { onMounted, ref, reactive, computed, watch } from "vue";
import {
  getReminders,
  deleteReminder,
  fetchRemindersFor,
  reminderList,
  formatDateToHtml,
} from "../reminderFunctions.js";

const emits = defineEmits(["openForm"]);
const pageState = defineModel("listState", {
  type: String,
  default: "Próximos",
});
const isNext = computed(() => pageState.value === "Próximos");
const deleteLoading = ref(false);

const deleteReminderById = async (id) => {
  if (deleteLoading.value) return;
  deleteLoading.value = true;
  await deleteReminder(id);
  deleteLoading.value = false;
};

const state = computed(() => reminderList);

const currentPageModel = computed({
  get() {
    if (!state.value) return 1;
    return pageState.value === "Próximos"
      ? state.value.active?.pagination?.currentPage ?? 1
      : state.value.completed?.pagination?.currentPage ?? 1;
  },
  set(val) {
    if (pageState.value === "Próximos") {
      state.value.active.pagination.currentPage = val;
    } else {
      state.value.completed.pagination.currentPage = val;
    }
  },
});

const createReminder = () => {
  if (!isNext.value) return;
  emits("openForm", { type: "create" });
};

onMounted(async () => {
  await Promise.all([
    fetchRemindersFor("next", 1),
    fetchRemindersFor("completed", 1),
  ]);
});
</script>

<template>
  <section class="w-full h-full max-w-full flex flex-col">
    <div class="flex-1 min-h-0">
      <div
        v-if="
          (pageState === 'Próximos'
            ? state.active.reminders.length
            : state.completed.reminders.length) === 0
        "
        class="w-full h-full flex items-center justify-center text-center p-6"
      >
        <div class="flex flex-col items-center gap-2 text-base-content/70">
          <svg
            class="w-14 text-gray-600"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              d="M17.133 12.632v-1.8a5.407 5.407 0 0 0-4.154-5.262.955.955 0 0 0 .021-.106V3.1a1 1 0 0 0-2 0v2.364a.933.933 0 0 0 .021.106 5.406 5.406 0 0 0-4.154 5.262v1.8C6.867 15.018 5 15.614 5 16.807 5 17.4 5 18 5.538 18h12.924C19 18 19 17.4 19 16.807c0-1.193-1.867-1.789-1.867-4.175Zm-13.267-.8a1 1 0 0 1-1-1 9.424 9.424 0 0 1 2.517-6.391A1.001 1.001 0 1 1 6.854 5.8a7.43 7.43 0 0 0-1.988 5.037 1 1 0 0 1-1 .995Zm16.268 0a1 1 0 0 1-1-1A7.431 7.431 0 0 0 17.146 5.8a1 1 0 0 1 1.471-1.354 9.424 9.424 0 0 1 2.517 6.391 1 1 0 0 1-1 .995ZM8.823 19a3.453 3.453 0 0 0 6.354 0H8.823Z"
            />
          </svg>
          <p class="text-sm">
            {{
              pageState === "Próximos"
                ? "Nenhum lembrete futuro encontrado."
                : "Nenhum lembrete concluído."
            }}
          </p>
          <p class="text-xs">
            {{
              pageState === "Próximos"
                ? "Clique em “Criar novo lembrete +” para adicionar."
                : "Conclua um lembrete para vê-lo aqui."
            }}
          </p>
        </div>
      </div>

      <div v-else class="overflow-auto h-full bg-base-300">
        <table class="w-full table-fixed">
          <thead class="sticky top-0 bg-base-200 z-10 text-xs font-medium">
            <tr>
              <th class="px-6">Nome</th>
              <th class="px-6">Descrição</th>
              <th class="px-6">Data</th>
              <th v-if="isNext" class="px-2">Ação</th>
            </tr>
          </thead>

          <tbody>
            <tr
              v-for="reminder in pageState === 'Próximos'
                ? state.active.reminders
                : state.completed.reminders"
              :key="reminder.id"
              class="bg-base-300 hover:bg-base-200 transition-colors duration-150 cursor-default text-xs h-8"
            >
              <td
                class="whitespace-normal break-words p-1 px-6"
                :title="reminder?.params?.message[0].title || null"
              >
                <p class="truncate text-center">
                  {{ reminder?.params?.message[0].title || "-" }}
                </p>
              </td>

              <td
                class="whitespace-normal break-words p-1 px-6 max-w-32"
                :title="reminder?.params?.message[0].content || null"
              >
                <p class="truncate text-center">
                  {{ reminder?.params?.message[0].content || "-" }}
                </p>
              </td>

              <td class="w-16 px-6">
                <section class="flex gap-1 items-center justify-center">
                  <p>
                    {{
                      formatDateToHtml("data", reminder?.params?.schedule?.time)
                    }}
                  </p>
                  -
                  <p>
                    {{
                      formatDateToHtml("time", reminder?.params?.schedule?.time)
                    }}
                  </p>
                </section>
              </td>

              <td v-if="isNext" class="px-6 py-2">
                <section class="flex gap-1 items-center justify-center">
                  <button
                    class="bg-base-200 hover:bg-base-100 hover:scale-105 transition-all duration-200 p-1 rounded-lg"
                  >
                    <svg
                      @click="emits('openForm', { type: 'edit', ...reminder })"
                      class="size-4 text-yellow-500"
                      aria-hidden="true"
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        fill-rule="evenodd"
                        d="M14 4.182A4.136 4.136 0 0 1 16.9 3c1.087 0 2.13.425 2.899 1.182A4.01 4.01 0 0 1 21 7.037c0 1.068-.43 2.092-1.194 2.849L18.5 11.214l-5.8-5.71 1.287-1.31.012-.012Zm-2.717 2.763L6.186 12.13l2.175 2.141 5.063-5.218-2.141-2.108Zm-6.25 6.886-1.98 5.849a.992.992 0 0 0 .245 1.026 1.03 1.03 0 0 0 1.043.242L10.282 19l-5.25-5.168Zm6.954 4.01 5.096-5.186-2.218-2.183-5.063 5.218 2.185 2.15Z"
                        clip-rule="evenodd"
                      />
                    </svg>
                  </button>

                  <Popper class="reminder-del-popper">
                    <button
                      class="bg-base-200 hover:bg-base-100 hover:scale-105 transition-all duration-200 p-1 rounded-lg"
                    >
                      <svg
                        class="size-4 text-red-500"
                        aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          fill-rule="evenodd"
                          d="M8.586 2.586A2 2 0 0 1 10 2h4a2 2 0 0 1 2 2v2h3a1 1 0 1 1 0 2v12a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V8a1 1 0 0 1 0-2h3V4a2 2 0 0 1 .586-1.414ZM10 6h4V4h-4v2Zm1 4a1 1 0 1 0-2 0v8a1 1 0 1 0 2 0v-8Zm4 0a1 1 0 1 0-2 0v8a1 1 0 1 0 2 0v-8Z"
                          clip-rule="evenodd"
                        />
                      </svg>
                    </button>

                    <template #content="{ close }">
                      <section class="text-center text-base">
                        <div class="line-clamp-2 font-sans">
                          Tem certeza que deseja
                          <span class="font-bold text-red-500">apagar</span>
                          o {{ reminder?.params?.message[0].title }}?
                        </div>
                        <div class="text-sm">Essa ação é irreversível.</div>
                        <div class="center mt-2 text-sm">
                          <button
                            :disabled="deleteLoading"
                            class="group relative inline-flex items-center justify-center w-full overflow-hidden rounded bg-red-500 px-5 py-1 text-xs text-white transition-all duration-300 ease-out hover:bg-gradient-to-r hover:from-red-500 hover:to-red-400 hover:ring-2 hover:ring-red-400 hover:ring-offset-2"
                            v-on:click="close"
                            @click="deleteReminderById(reminder.id)"
                          >
                            <span
                              class="ease absolute right-0 -mt-12 h-32 w-8 translate-x-12 rotate-12 bg-white opacity-10 transition-all duration-1000 group-hover:-translate-x-40"
                            ></span>
                            <div
                              v-if="deleteLoading"
                              class="size-4 animate-spin rounded-full border-4 border-solid text-white border-t-transparent"
                            />
                            <span
                              v-else
                              class="relative uppercase font-medium text-xs"
                              >Apagar lembrete</span
                            >
                          </button>
                        </div>
                      </section>
                    </template>
                  </Popper>
                </section>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div class="p-1 flex-none">
      <button
        :title="
          isNext
            ? 'Criar novo lembrete'
            : 'Volte para aba de próximos para criar lembretes'
        "
        :disabled="!isNext"
        @click="createReminder()"
        class="bg-base-100 w-full border border-base-100 p-2 rounded-md uppercase text-[11px] hover:bg-base-100/80 flex justify-center items-center gap-2"
      >
        Criar novo lembrete +
      </button>
    </div>

    <VueAwesomePaginate
      class="justify-center mx-auto bg-base-300 w-full py-2 flex-none"
      v-if="
        state &&
        (pageState === 'Próximos'
          ? state.active.pagination.count
          : state.completed.pagination.count) > 10
      "
      v-model="currentPageModel"
      :total-items="
        pageState === 'Próximos'
          ? state.active.pagination.count
          : state.completed.pagination.count
      "
      :items-per-page="
        pageState === 'Próximos'
          ? state.active.pagination.pageSize
          : state.completed.pagination.pageSize
      "
      :max-pages-shown="3"
      @click="
        fetchRemindersFor(
          pageState === 'Próximos' ? 'next' : 'completed',
          currentPageModel
        )
      "
    >
      <template #prev-button>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="currentColor"
          class="mx-auto w-5"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M19.5 12h-15m0 0l6.75 6.75M4.5 12l6.75-6.75"
          />
        </svg>
      </template>
      <template #next-button>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="currentColor"
          class="mx-auto w-5"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M4.5 12h15m0 0l-6.75-6.75M19.5 12l-6.75 6.75"
          />
        </svg>
      </template>
    </VueAwesomePaginate>
  </section>
</template>

<style scoped>
.reminder-del-popper {
  --popper-theme-background-color: var(--bg-base-300);
  --popper-theme-background-color-hover: var(--bg-base-300);
  --popper-theme-text-color: white;
  --popper-theme-border-width: 0px;
  --popper-theme-border-radius: 6px;
  --popper-theme-padding: 8px;
  --popper-theme-box-shadow: 0 6px 16px -8px rgba(255, 0, 0, 0.449);
}
</style>
