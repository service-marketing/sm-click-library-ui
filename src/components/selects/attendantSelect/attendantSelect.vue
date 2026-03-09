<script setup>
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from "vue";
import { useAttendantStore } from "~/stores/attendantStore";
import PhotoDisplay from "../../chat/components/photoDisplay.vue";
import {
  showEllipsisTooltip,
  hideEllipsisTooltip,
} from "~/utils/functions/ellipsisTooltip";

const props = defineProps({
  attendance: { type: [Array, String], default: null },
  multiSelect: { type: Boolean, default: true },
  department: { type: Array, default: [] },
  modal_filter: { type: String, default: null },
  attDel: { type: Object, default: { id: null } },
  method: { type: String, default: null },
  preselect: { type: Boolean, default: true },
  // --- Novas props de exibição ---
  variant: {
    type: String,
    default: "expanded",
    validator: (v) => ["expanded", "select", "dropdown"].includes(v),
  },
  showSearch: { type: Boolean, default: true },
  showSelectedBadges: { type: Boolean, default: true },
  showAvatar: { type: Boolean, default: true },
  maxHeight: { type: String, default: "183.5px" },
  placeholder: { type: String, default: "Pesquise por nome." },
  placeholderSelect: { type: String, default: "Selecione um atendente" },
  // --- Items desabilitados ---
  disabledItems: { type: Array, default: () => [] },
  disabledReason: { type: String, default: "Já encarteirado" },
  // --- Estilo ---
  size: {
    type: String,
    default: "normal",
    validator: (v) => ["small", "normal", "large"].includes(v),
  },
  maxColumns: { type: Number, default: 2 },
  minColumnWidth: { type: String, default: "170px" },
  // --- Cores customizáveis ---
  primaryColor: { type: String, default: "#14b8a6" },
  primaryColorHover: { type: String, default: "#0d9488" },
  borderRadius: { type: String, default: "0.75rem" },
});

// Ref para o wrapper do dropdown (click outside)
const dropdownRef = ref(null);

// Click outside handler
function handleClickOutside(event) {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target)) {
    open_select.value = false;
  }
}

// CSS Variables para cores customizáveis
const cssVars = computed(() => ({
  "--primary-color": props.primaryColor,
  "--primary-color-hover": props.primaryColorHover,
  "--primary-color-light": `${props.primaryColor}50`,
  "--primary-color-medium": `${props.primaryColor}cc`,
  "--border-radius": props.borderRadius,
}));

const emit = defineEmits(["attend", "component-mounted"]);
const attendantStore = useAttendantStore();

const searchInput = ref("");
const open_select = ref(false);
const attendanceSelected = ref([]);

// Normalizar lista de IDs vinda em props.attendance
function incomingIds() {
  const incoming = Array.isArray(props.attendance)
    ? props.attendance
    : props.attendance
      ? [props.attendance]
      : [];
  // console.log(props.attendance)
  return new Set(
    incoming
      .filter(Boolean)
      .map((item) => (typeof item === "object" ? item.id : item)),
  );
}

const filteredAttendants = computed(() => {
  const active = attendantStore.attendants.filter((a) => a.status === true);
  const filtered = searchInput.value
    ? active.filter((a) =>
        a.name.toLowerCase().includes(searchInput.value.toLowerCase()),
      )
    : active;
  return filterByDepartment(filterByMethod(filtered));
});

function filterByMethod(attendants) {
  if (props.method === "remove") {
    const list = Array.isArray(props.attendance)
      ? props.attendance
      : props.attendance
        ? [props.attendance]
        : attendants;
    return list.filter((att) => {
      const id = typeof att === "object" ? att.id : att;
      return id !== props?.attDel?.id;
    });
  }
  if (props.method === "addParticipant") {
    // Em "adicionar", esconde quem já está no chat (props.attendance) e o attDel
    const exclude = incomingIds();
    if (props?.attDel?.id) exclude.add(props.attDel.id);
    return attendants.filter((a) => !exclude.has(a.id));
  }
  return attendants;
}

function filterByDepartment(attendants) {
  if (Array.isArray(props.department) && props.department.length > 0) {
    return attendants.filter((att) =>
      att.department.some((dept) =>
        props.department.some((d) => d.id === dept.id),
      ),
    );
  }
  return attendants;
}

// Computed para variante de exibição
const isExpanded = computed(() => props.variant === "expanded");
const isDropdown = computed(() => props.variant === "dropdown");

// Computed para classes de tamanho
const sizeClasses = computed(() => ({
  "size-small": props.size === "small",
  "size-normal": props.size === "normal",
  "size-large": props.size === "large",
}));

// Computed para estilo do grid
const gridStyle = computed(() => ({
  gridTemplateColumns: `repeat(auto-fit, minmax(${props.minColumnWidth}, 1fr))`,
}));

// Computed para o placeholder dinâmico
const dynamicPlaceholder = computed(() => {
  if (attendanceSelected.value.length > 0) {
    return props.multiSelect
      ? `Selecionados: ${attendanceSelected.value.length}`
      : `Selecionado: ${attendanceSelected.value[0]?.name}`;
  }
  return props.placeholder;
});

// Ref para o select nativo
const nativeSelectValue = ref(props.multiSelect ? [] : "");

// Sync nativeSelectValue com attendanceSelected
watch(
  attendanceSelected,
  (val) => {
    if (props.multiSelect) {
      nativeSelectValue.value = val.map((a) => a.id);
    } else {
      nativeSelectValue.value = val[0]?.id || "";
    }
  },
  { deep: true },
);

// Handler para o select nativo
function handleNativeSelect(event) {
  const attendants = attendantStore.attendants;

  if (props.multiSelect) {
    const selectedIds = Array.from(
      event.target.selectedOptions,
      (option) => option.value,
    );
    clearSelectedAttendance();
    selectedIds.forEach((id) => {
      const att = attendants.find((a) => a.id === id);
      if (att) {
        att.selected = true;
        attendanceSelected.value.push(att);
      }
    });
  } else {
    const selectedId = event.target.value;
    clearSelectedAttendance();
    const att = attendants.find((a) => a.id === selectedId);
    if (att) {
      att.selected = true;
      attendanceSelected.value.push(att);
    }
  }
  emit("attend", attendanceSelected.value);
}

onMounted(() => {
  initializeComponent();
  emit("component-mounted");
  document.addEventListener("click", handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener("click", handleClickOutside);
});

watch(
  () => attendantStore.attendants.length,
  async () => {
    await nextTick();
    initializeComponent();
  },
  { immediate: true },
);

watch(
  () => props.modal_filter,
  () => {
    if (!props.modal_filter && props.multiSelect) clearSelectedAttendance();
  },
  { immediate: true },
);

watch(
  () => props.department,
  () => initializeComponent(),
  { deep: true },
);

watch(open_select, (isOpen) => {
  if (!isOpen) {
    searchInput.value = "";
  }
});

function initializeComponent() {
  clearSelectedAttendance();
  updateSelectedAttendance();
}

function clearSelectedAttendance() {
  attendantStore.attendants.forEach((a) => (a.selected = false));
  attendanceSelected.value = [];
}

function updateSelectedAttendance() {
  if (!props.preselect) return;

  const attendants = attendantStore.attendants;
  if (!attendants?.length) return;

  const incoming = Array.isArray(props.attendance)
    ? props.attendance
    : props.attendance
      ? [props.attendance]
      : [];

  incoming.forEach((item) => {
    const id = typeof item === "object" ? item.id : item;
    const stored = attendants.find((a) => a.id === id);

    if (stored && !attendanceSelected.value.some((a) => a.id === id)) {
      stored.selected = true;
      attendanceSelected.value.push(stored);
    }
  });

  emit("attend", attendanceSelected.value);
}

function selectAttendant(attendant) {
  // Não permite selecionar se estiver desabilitado
  if (isItemDisabled(attendant.id)) return;

  const idx = attendanceSelected.value.findIndex((a) => a.id === attendant.id);
  if (idx !== -1) {
    attendant.selected = false;
    attendanceSelected.value.splice(idx, 1);
  } else {
    if (!props.multiSelect) clearSelectedAttendance();
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

// Função para verificar se um item está desabilitado
function isItemDisabled(attendantId) {
  return props.disabledItems.some((id) => {
    if (typeof id === "object") return id.id === attendantId;
    return id === attendantId;
  });
}
</script>

<template>
  <div class="depart-select-container" :class="sizeClasses" :style="cssVars">
    <!-- Variante DROPDOWN (toggle compacto) -->
    <template v-if="isDropdown">
      <div class="dropdown-wrapper" ref="dropdownRef">
        <button
          type="button"
          @click="open_select = !open_select"
          class="dropdown-trigger bg-base-300"
          :class="[sizeClasses, { 'dropdown-open': open_select }]"
        >
          <span class="dropdown-trigger-text">
            {{
              attendanceSelected.length > 0
                ? multiSelect
                  ? `${attendanceSelected.length} selecionado(s)`
                  : attendanceSelected[0]?.name
                : placeholderSelect
            }}
          </span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="2"
            stroke="currentColor"
            class="dropdown-arrow"
            :class="{ 'dropdown-arrow-open': open_select }"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="m19.5 8.25-7.5 7.5-7.5-7.5"
            />
          </svg>
        </button>

        <div v-show="open_select" class="dropdown-menu bg-base-300">
          <div v-if="showSearch" class="dropdown-search-wrapper">
            <input
              v-model="searchInput"
              :placeholder="placeholder"
              class="dropdown-search-input bg-base-200"
            />
          </div>
          <div class="dropdown-options" :style="{ maxHeight: maxHeight }">
            <!-- Loading Store State -->
            <div v-if="!attendantStore.loaded" class="dropdown-loading">
              <div class="library-loader"></div>
              <span
                style="font-size: 0.875rem; opacity: 0.7; margin-left: 0.5rem"
                >Carregando atendentes...</span
              >
            </div>

            <!-- Options List -->
            <template v-else>
              <div
                v-for="attendant in filteredAttendants"
                :key="attendant.id"
                @click="selectAttendant(attendant)"
                :class="{
                  'dropdown-option-selected': attendant.selected,
                  'dropdown-option-disabled': isItemDisabled(attendant.id),
                }"
                class="dropdown-option"
              >
                <template v-if="showAvatar">
                  <PhotoDisplay
                    :photo="attendant.photo"
                    :clickable="false"
                    size="size-5"
                  />
                </template>
                <span
                  class="dropdown-option-label"
                  @mouseenter="showEllipsisTooltip"
                  @mouseleave="hideEllipsisTooltip"
                  >{{ attendant.name }}</span
                >
                <span
                  class="dropdown-option-check ml-auto"
                  v-if="attendant.selected"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke-width="2"
                    stroke="currentColor"
                    class="size-4"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="m4.5 12.75 6 6 9-13.5"
                    />
                  </svg>
                </span>
                <span
                  v-else-if="isItemDisabled(attendant.id)"
                  class="disabled-reason-badge"
                >
                  {{ disabledReason }}
                </span>
              </div>

              <!-- Empty State -->
              <div
                v-if="filteredAttendants.length === 0"
                class="dropdown-empty"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke-width="1.5"
                  stroke="currentColor"
                  style="
                    width: 1.25rem;
                    height: 1.25rem;
                    flex-shrink: 0;
                    opacity: 0.5;
                    margin-right: 0.5rem;
                  "
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
                  />
                </svg>
                <p style="margin: 0; font-size: 0.875rem">
                  {{
                    searchInput
                      ? 'Nenhum atendente encontrado para "' + searchInput + '"'
                      : "Nenhum atendente disponível."
                  }}
                </p>
              </div>
            </template>
          </div>
        </div>
      </div>
    </template>

    <!-- Variante EXPANDED (padrão atual) -->
    <template v-else>
      <div class="search-container relative">
        <div
          v-if="showSearch"
          class="input-wrapper bg-base-300"
          @click="open_select = !open_select"
          :class="{ expanded: open_select || attendanceSelected.length > 0 }"
        >
          <input
            v-model="searchInput"
            :placeholder="dynamicPlaceholder"
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
          v-if="
            showSelectedBadges &&
            attendanceSelected.length > 0 &&
            multiSelect &&
            attendantStore.loaded
          "
          class="selection-container bg-base-300 border-b border-base-200"
        >
          <div
            v-for="(attendant, index) in attendanceSelected"
            :key="attendant.id"
            class="selection-item"
          >
            <span class="selection-item-label">{{ attendant.name }}</span>
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
            attendanceSelected.length > 0 && multiSelect && showSelectedBadges
              ? 'dropdown-attendance-expanded'
              : 'dropdown-attendance'
          "
          class="dropdown-attendance bg-base-300"
          :style="{ maxHeight: maxHeight }"
        >
          <div class="department-list">
            <div class="grid-container" :style="gridStyle">
              <div
                v-if="attendantStore.loaded"
                v-for="attendant in filteredAttendants"
                :key="attendant.id"
                @click="selectAttendant(attendant)"
                :class="{
                  selected: attendant.selected,
                  'is-disabled': isItemDisabled(attendant.id),
                }"
                class="department-item bg-slate-500/20 hover:bg-teal-600"
              >
                <div v-if="showAvatar" style="padding-left: 5px">
                  <PhotoDisplay
                    :photo="attendant.photo"
                    :clickable="false"
                    size="size-5"
                  />
                </div>
                <span
                  class="department-name h-full w-full"
                  @mouseenter="showEllipsisTooltip"
                  @mouseleave="hideEllipsisTooltip"
                >
                  {{ attendant.name }}
                </span>
                <span
                  v-if="isItemDisabled(attendant.id)"
                  class="disabled-badge-expanded"
                >
                  {{ disabledReason }}
                </span>
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
    </template>
  </div>
</template>

<style scoped src="../sharedSelectStyles.css"></style>

<style scoped>
/* ===== ESTILOS ESPECÍFICOS DO ATTENDANT SELECT ===== */

/* Avatar no dropdown */
.dropdown-avatar {
  width: 1.75rem;
  height: 1.75rem;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
}

.dropdown-avatar-placeholder {
  width: 1.75rem;
  height: 1.75rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: currentColor;
}

/* ===== ESTILOS PARA ITEMS DESABILITADOS ===== */

.dropdown-option-disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background-color: rgba(148, 163, 184, 0.05);
}

.dropdown-option-disabled:hover {
  background-color: rgba(148, 163, 184, 0.05);
}

.disabled-reason-badge {
  font-size: 0.65rem;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  background: rgba(148, 163, 184, 0.15);
  white-space: normal;
  overflow-wrap: anywhere;
  word-break: break-word;
  margin-left: auto;
  font-weight: 500;
  text-align: right;
}

.department-item.is-disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background-color: rgba(148, 163, 184, 0.05) !important;
}

.department-item.is-disabled:hover {
  background-color: rgba(148, 163, 184, 0.05) !important;
}

.disabled-badge-expanded {
  font-size: 0.65rem;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  background: rgba(148, 163, 184, 0.15);
  color: rgb(148 163 184);
  white-space: normal;
  overflow-wrap: anywhere;
  word-break: break-word;
  font-weight: 500;
  text-align: right;
}
</style>
