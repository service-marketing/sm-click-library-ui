<script setup>
import { ref, computed, watch, onMounted, nextTick } from "vue";
import { useAttendantStore } from "~/stores/attendantStore";

const props = defineProps({
  attendance: { type: Array, default: null },
  multiSelect: { type: Boolean, default: true },
  department: { type: Array, default: [] },
  modal_filter: { type: String, default: null },
  attDel: { type: Object, default: { id: null } },
  method: { type: String, default: null },
});

const emit = defineEmits(["attend", "component-mounted"]);
const attendantStore = useAttendantStore();

const searchInput = ref("");
const open_select = ref(false);
const attendanceSelected = ref([]);
const get_loading = ref(false);

const filteredAttendants = computed(() => {
  const activeAttendants = attendantStore.attendants.filter(
    (attendant) => attendant.status === true
  );

  const filtered = searchInput.value
    ? activeAttendants.filter((attendant) =>
        attendant.name.toLowerCase().includes(searchInput.value.toLowerCase())
      )
    : activeAttendants;

  return filterByDepartment(filterByMethod(filtered));
});

function filterByMethod(attendants) {
  if (props.method === "remove") {
    return props.attendance.filter(
      (attendant) => attendant.id !== props.attDel.id
    );
  } else if (props.method === "transfer" || props.method === "addParticipant") {
    return attendants.filter((attendant) => attendant.id !== props.attDel.id);
  }
  return attendants;
}

function filterByDepartment(attendants) {
  if (props.department.length > 0) {
    return attendants.filter((attendant) =>
      attendant.department.some((dept) =>
        props.department.some((d) => d.id === dept.id)
      )
    );
  }
  return attendants;
}

onMounted(() => {
  initializeComponent();
  emit("component-mounted");
});

watch(
  () => attendantStore.attendants.length, // Observa apenas o tamanho do array
  async (newLength, oldLength) => {
    if (newLength !== oldLength) { // Verifica se o tamanho realmente mudou
      await nextTick();
      initializeComponent();
    }
  },
  { immediate: true }
);

watch(
  () => props.modal_filter,
  () => {
    if (!props.modal_filter && props.multiSelect) {
      clearSelectedAttendance();
    }
  },
  { immediate: true }
);

watch(
  () => props.department,
  () => {
    initializeComponent();
  },
  { deep: true }
);

function initializeComponent() {
  clearSelectedAttendance();
  updateSelectedAttendance();
}

function clearSelectedAttendance() {
  const attendants = filteredAttendants.value;
  attendants.forEach((attendant) => {
    attendant.selected = false;
  });
  attendanceSelected.value = [];
}

function updateSelectedAttendance() {
  const attendants = attendantStore.attendants;

  if (!attendants || attendants.length === 0) {
    console.warn("Nenhum atendente disponível para atualização.");
    return;
  }

  if (props.attendance && props.attendance.length > 0) {
    props.attendance.forEach((att) => {
      const storedAttendant = attendants.find((a) => a.id === att.id);
      if (
        storedAttendant &&
        !attendanceSelected.value.some((a) => a.id === att.id)
      ) {
        storedAttendant.selected = true;
        attendanceSelected.value.push({ ...storedAttendant });
      }
    });
  }
  emit("attend", attendanceSelected.value);
}

function selectAttendant(attendant) {
  const index = attendanceSelected.value.findIndex(
    (a) => a.id === attendant.id
  );

  if (index !== -1) {
    attendant.selected = false;
    attendanceSelected.value.splice(index, 1);
  } else {
    if (!props.multiSelect) {
      clearSelectedAttendance();
    }
    attendant.selected = true;
    attendanceSelected.value.push(attendant);
  }
  emit("attend", attendanceSelected.value);
}

function eraseAttendant(attendant, index) {
  attendant.selected = false;
  attendanceSelected.value.splice(index, 1);
  emit("attend", attendanceSelected.value);
}
</script>

<template>
  <div class="depart-select-container">
    <!-- Search input -->
    <div
      class="search-container relative shadow shadow-gray-900 dark:shadow-gray-500"
    >
      <div
        class="input-wrapper bg-base-300 border-b border-base-200"
        @click="open_select = !open_select"
        :class="{ expanded: open_select || attendanceSelected.length > 0 }"
      >
        <input
          v-model="searchInput"
          :placeholder="
            attendanceSelected.length > 0
              ? multiSelect
                ? `Selecionados: ${attendanceSelected.length}`
                : `Selecionado: ${attendanceSelected[0].name}`
              : 'Pesquise por nome.'
          "
          class="select-depart-input"
        />
        <div class="icon-container">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            class="search-icon"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
            />
          </svg>
        </div>
      </div>

      <main
        v-if="attendanceSelected.length > 0 && multiSelect && attendantStore.loaded"
        class="selection-container bg-base-300 border-b border-base-200"
      >
        <div
          v-for="(attendant, index) in attendanceSelected"
          :key="attendant.id"
          class="selection-item"
        >
          {{ attendant.name }}
          <button @click="eraseAttendant(attendant, index)" class="close-btn">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
              class="close-icon"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </main>

      <div
        :class="
          attendanceSelected.length > 0 && multiSelect
            ? 'dropdown-attendance-expanded'
            : 'dropdown-attendance'
        "
        class="dropdown-attendance bg-base-300"
      >
        <div class="department-list">
          <div
            :class="{ 'two-columns': filteredAttendants.length > 4 }"
            class="grid-container"
          >
            <div v-if="attendantStore.loaded"
              v-for="attendant in filteredAttendants"
              :key="attendant.id"
              :class="{ selected: attendant.selected }"
              class="department-item line-clamp-1 bg-slate-500/20 hover:bg-teal-600"
            >
              <div style="padding-left: 5px">
                <img
                  v-if="attendant.photo"
                  :src="attendant.photo"
                  style="
                    pointer-events: none;
                    border-radius: 100%;
                    width: 24px;
                    height: 24px;
                  "
                />
                <svg
                  v-else
                  style="
                    pointer-events: none;
                    border-radius: 100%;
                    width: 24px;
                    height: 24px;
                  "
                  class="bg-base-300"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    fill-rule="evenodd"
                    d="M12 4a4 4 0 1 0 0 8 4 4 0 0 0 0-8Zm-2 9a4 4 0 0 0-4 4v1a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-1a4 4 0 0 0-4-4h-4Z"
                    clip-rule="evenodd"
                  />
                </svg>
              </div>
              <span
                @click="selectAttendant(attendant)"
                class="department-name h-full w-full"
                >{{ attendant.name }}</span
              >
            </div>
          </div>
        </div>
        <div
          v-if="attendantStore.loaded && filteredAttendants.length === 0"
          class="no-departments bg-base-300"
        >
          Nenhum atendente disponível.
        </div>
        <div v-if="!attendantStore.loaded" class="library-loading-spinner">
          Inicializando atendentes
          <div class="library-loader"></div>
        </div>
      </div>
    </div>
  </div>
</template>
<style scoped>
/* Adiciona as classes de estilo conforme especificado no terceiro componente */
.shadow {
  --tw-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
  --tw-shadow-colored: 0 1px 3px 0 var(--tw-shadow-color),
    0 1px 2px -1px var(--tw-shadow-color);
  box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000),
    var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow);
}

.depart-select-container {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.search-container {
  width: 100%;
  border-bottom-right-radius: 0.375rem;
  border-bottom-left-radius: 0.375rem;
}

.input-wrapper {
  padding: 10px;
  padding-left: 40px;
  width: 100%;
  display: flex;
  border-top-right-radius: 4px;
  border-top-left-radius: 4px;
  position: relative;
}

.select-depart-input {
  width: 100%;
  border: none;
  outline: none;
  background: transparent;
  color: currentColor;
}

.select-depart-input:focus {
  border: none;
  outline: none;
  @apply ring-0;
}

.ring-0 {
  --tw-ring-offset-shadow: var(--tw-ring-inset) 0 0 0
    var(--tw-ring-offset-width) var(--tw-ring-offset-color);
  --tw-ring-shadow: var(--tw-ring-inset) 0 0 0
    calc(0px + var(--tw-ring-offset-width)) var(--tw-ring-color);
  box-shadow: var(--tw-ring-offset-shadow), var(--tw-ring-shadow),
    var(--tw-shadow, 0 0 #0000);
}

.icon-container {
  position: absolute;
  left: 10px;
  top: 11px;
  display: flex;
  align-items: center;
}

.search-icon {
  background-color: #14b8a6;
  color: white;
  padding: 4px;
  border-radius: 50%;
  width: 22px;
  height: 22px;
}

.selection-container {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  padding: 6px;
  width: 100%;
  overflow-y: auto;
  height: 48px;
}

.selection-item {
  display: flex;
  align-items: center;
  background-color: rgba(20, 184, 166, 0.8);
  padding: 5px 10px;
  border-radius: 4px;
  color: white;
}

.close-btn {
  margin-left: 8px;
  background-color: rgba(55, 65, 81, 0.3);
  border-radius: 4px;
  padding: 2px;
}

.close-icon {
  width: 16px;
  height: 16px;
}

.dropdown-attendance {
  width: 100%;
  max-height: 150px;
  overflow-y: auto;
  border-radius: 0 0 4px 4px;
  padding-bottom: 3px;
}

.dropdown-attendance-expanded {
  top: 93px;
}

.department-list {
  display: flex;
  flex-direction: column;
  width: 100%;
}

.grid-container {
  display: grid;
  gap: 1px;
  width: 100%;
}

.two-columns {
  grid-template-columns: repeat(2, 1fr);
}

.department-item {
  cursor: pointer;
  width: 100%;
  align-items: center;
  display: flex;
}

.department-name {
  padding: 8px;
}

.selected {
  background-color: rgba(20, 184, 166, 0.8);
}

.infinite-loading {
  padding: 12px;
}

.no-departments {
  display: flex;
  justify-content: center;
  padding: 12px;
}

.library-loading-spinner {
  display: flex;
  justify-content: center;
  padding: 26px;
  gap: 12px;
}

@keyframes library-loader-rotate {
  0% {
    transform: rotate(0);
  }

  100% {
    transform: rotate(360deg);
  }
}

.library-loader {
  width: 24px;
  height: 24px;
  border: 4px solid #14b8a6;
  border-right-color: transparent;
  border-radius: 50%;
  animation: library-loader-rotate 1s linear infinite;
}
</style>
