<script setup>
import {
  ref,
  computed,
  watch,
  onMounted,
  onUnmounted,
  nextTick,
  useSlots,
} from "vue";
import { useDepartmentStore } from "~/stores/departmentStore";
import {
  showEllipsisTooltip,
  hideEllipsisTooltip,
} from "~/utils/functions/ellipsisTooltip";
const slots = useSlots();

const props = defineProps({
  department: { type: [Array, String], default: null },
  modal_filter: { type: String, default: null },
  multiSelect: { type: Boolean, default: true },
  permissions: { type: Boolean, default: false },
  externalDepartments: { type: Array, default: null },
  attDel: { type: String, default: null },
  hiddenDepartment: { type: String, default: null },
  // --- Novas props de exibição ---
  variant: {
    type: String,
    default: "expanded",
    validator: (v) => ["expanded", "select", "dropdown"].includes(v),
  },
  showSearch: { type: Boolean, default: true },
  showSelectedBadges: { type: Boolean, default: true },
  maxHeight: { type: String, default: "183.5px" },
  placeholder: { type: String, default: "Pesquise por nome." },
  placeholderSelect: { type: String, default: "Selecione um departamento" },
  // --- Items desabilitados ---
  disabledItems: { type: Array, default: () => [] },
  disabledReason: { type: String, default: "Já encarteirado" },
  // --- Estilo ---
  size: {
    type: String,
    default: "normal",
    validator: (v) => ["small", "normal", "large"].includes(v),
  },
  maxColumns: { type: Number, default: 3 },
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

onMounted(() => {
  document.addEventListener("click", handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener("click", handleClickOutside);
});

// CSS Variables para cores customizáveis
const cssVars = computed(() => ({
  "--primary-color": props.primaryColor,
  "--primary-color-hover": props.primaryColorHover,
  "--primary-color-light": `${props.primaryColor}50`,
  "--primary-color-medium": `${props.primaryColor}cc`,
  "--border-radius": props.borderRadius,
}));

const emit = defineEmits(["depart", "component-mounted"]);
const departmentStore = useDepartmentStore();
const searchInput = ref("");
const departmentSelected = ref([]);
const open_select = ref(false);
const get_loading = ref(false);

const filteredDepartments = computed(() => {
  const departments = props.externalDepartments || departmentStore.departments;
  return departments
    .filter(
      (dep) => !(props.hiddenDepartment && dep.id === props.hiddenDepartment),
    )
    .filter(
      (dep) =>
        !searchInput.value ||
        dep.name.toLowerCase().includes(searchInput.value.toLowerCase()),
    );
});

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
  if (departmentSelected.value.length > 0) {
    return props.multiSelect
      ? `Selecionados: ${departmentSelected.value.length}`
      : `Selecionado: ${departmentSelected.value[0]?.name}`;
  }
  return props.placeholder;
});

// Ref para o select nativo
const nativeSelectValue = ref(props.multiSelect ? [] : "");

// Sync nativeSelectValue com departmentSelected
watch(
  departmentSelected,
  (val) => {
    if (props.multiSelect) {
      nativeSelectValue.value = val.map((d) => d.id);
    } else {
      nativeSelectValue.value = val[0]?.id || "";
    }
  },
  { deep: true },
);

// Handler para o select nativo
function handleNativeSelect(event) {
  const departments = props.externalDepartments || departmentStore.departments;

  if (props.multiSelect) {
    const selectedIds = Array.from(
      event.target.selectedOptions,
      (option) => option.value,
    );
    clearSelectedDepartments();
    selectedIds.forEach((id) => {
      const dept = departments.find((d) => d.id === id);
      if (dept) {
        dept.selected = true;
        departmentSelected.value.push(dept);
      }
    });
  } else {
    const selectedId = event.target.value;
    clearSelectedDepartments();
    const dept = departments.find((d) => d.id === selectedId);
    if (dept) {
      dept.selected = true;
      departmentSelected.value.push(dept);
    }
  }
  emit("depart", departmentSelected.value);
}

onMounted(async () => {
  await clearSelectedDepartments();
  await fetchDepartments();
  emit("component-mounted");
});

watch(
  () => departmentStore.departments.length,
  async () => {
    await clearSelectedDepartments();
    await nextTick();
    await fetchDepartments();
  },
  { immediate: true },
);

watch(
  () => props.attDel,
  (id) => id && deleteDepartmentById(id),
  { immediate: true },
);

watch(open_select, (isOpen) => {
  if (!isOpen) {
    searchInput.value = "";
  }
});

function deleteDepartmentById(departmentId) {
  const departments = props.externalDepartments || departmentStore.departments;
  const index = departments.findIndex((d) => d.id === departmentId);
  if (index !== -1) {
    departmentSelected.value = departmentSelected.value.filter(
      (d) => d.id !== departmentId,
    );
    props.externalDepartments
      ? props.externalDepartments.splice(index, 1)
      : departmentStore.removeDepartments(departmentId);
    emit("depart", departmentSelected.value);
  }
}

async function fetchDepartments() {
  get_loading.value = true;
  const departments = props.externalDepartments || departmentStore.departments;
  if (props.permissions) {
    departments.forEach((department) => {
      if (!department.permission) {
        department.permission = "normal";
      }
    });
  }

  await updateSelectedDepartments();
  get_loading.value = false;
}

async function clearSelectedDepartments() {
  const departments = props.externalDepartments || departmentStore.departments;
  departments.forEach((dep) => (dep.selected = false));
  departmentSelected.value = [];
}

async function updateSelectedDepartments() {
  const departments = props.externalDepartments || departmentStore.departments;
  if (!departments?.length) return;
  const incoming = Array.isArray(props.department)
    ? props.department
    : props.department
      ? [props.department]
      : [];
  incoming.forEach((depLike) => {
    const id = typeof depLike === "object" ? depLike.id : depLike;
    const permission =
      typeof depLike === "object" ? depLike.permission : undefined;
    const deptInStore = departments.find((d) => d.id === id);
    if (!deptInStore) return;
    deptInStore.selected = true;
    if (permission) deptInStore.permission = permission;
    if (!departmentSelected.value.some((d) => d.id === id))
      departmentSelected.value.push(deptInStore);
  });
  emit("depart", departmentSelected.value);
}

function selectDepartment(department) {
  // Não permite selecionar se estiver desabilitado
  if (isItemDisabled(department.id)) return;

  const idx = departmentSelected.value.findIndex((d) => d.id === department.id);
  if (idx !== -1) {
    department.selected = false;
    departmentSelected.value.splice(idx, 1);
  } else {
    if (!props.multiSelect) clearSelectedDepartments();
    department.selected = true;
    departmentSelected.value.push(department);
  }
  emit("depart", departmentSelected.value);
}

function changePermission() {
  emit("depart", departmentSelected.value);
}

function eraseDepartment(department, index) {
  department.selected = false;
  departmentSelected.value.splice(index, 1);
  emit("depart", departmentSelected.value);
}
const isSearching = computed(() => searchInput.value.trim().length > 0);
watch(isSearching, (val) => {
  emit("searching", val);
});

// Função para verificar se um item está desabilitado
function isItemDisabled(departmentId) {
  return props.disabledItems.some((id) => {
    if (typeof id === "object") return id.id === departmentId;
    return id === departmentId;
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
              departmentSelected.length > 0
                ? multiSelect
                  ? `${departmentSelected.length} selecionado(s)`
                  : departmentSelected[0]?.name
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
            <div v-if="!departmentStore.loaded" class="dropdown-loading">
              <div class="library-loader"></div>
              <span
                style="font-size: 0.875rem; opacity: 0.7; margin-left: 0.5rem"
                >Carregando departamentos...</span
              >
            </div>

            <!-- Options List -->
            <template v-else>
              <div
                v-for="department in filteredDepartments"
                :key="department.id"
                @click="selectDepartment(department)"
                :class="{
                  'dropdown-option-selected': department.selected,
                  'dropdown-option-disabled': isItemDisabled(department.id),
                }"
                class="dropdown-option"
              >
                <span
                  class="dropdown-option-label"
                  @mouseenter="showEllipsisTooltip"
                  @mouseleave="hideEllipsisTooltip"
                  >{{ department.name }}</span
                >
                <span
                  class="dropdown-option-check ml-auto"
                  v-if="department.selected"
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
                  v-else-if="isItemDisabled(department.id)"
                  class="disabled-reason-badge"
                >
                  {{ disabledReason }}
                </span>
              </div>

              <!-- Empty State -->
              <div
                v-if="filteredDepartments.length === 0"
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
                <p
                  v-if="!$slots.default"
                  style="margin: 0; font-size: 0.875rem"
                >
                  {{
                    searchInput
                      ? 'Nenhum departamento encontrado para "' +
                        searchInput +
                        '"'
                      : "Nenhum departamento disponível."
                  }}
                </p>
                <slot v-else />
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
          :class="{ expanded: open_select || departmentSelected.length > 0 }"
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
            departmentSelected.length > 0 &&
            multiSelect &&
            departmentStore.loaded
          "
          class="selection-container bg-base-300 border-b border-base-200"
        >
          <div
            v-for="(depart, index) in departmentSelected"
            :key="depart.id"
            class="selection-item"
          >
            <span class="selection-item-label">{{ depart.name }}</span>
            <button @click="eraseDepartment(depart, index)" class="close-btn">
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
            departmentSelected.length > 0 && multiSelect && showSelectedBadges
              ? 'dropdown-depart-expanded'
              : 'dropdown-depart'
          "
          class="dropdown-depart bg-base-300"
          :style="{ maxHeight: maxHeight }"
        >
          <div class="department-list">
            <div class="grid-container" :style="gridStyle">
              <div
                v-if="departmentStore.loaded"
                v-for="department in filteredDepartments"
                :key="department.id"
                :class="{
                  selected: department.selected,
                  'is-disabled': isItemDisabled(department.id),
                }"
                class="department-item bg-slate-500/20 hover:bg-teal-600"
              >
                <span
                  @click="selectDepartment(department)"
                  class="department-name h-full w-full"
                  @mouseenter="showEllipsisTooltip"
                  @mouseleave="hideEllipsisTooltip"
                  >{{ department.name }}</span
                >
                <span
                  v-if="isItemDisabled(department.id)"
                  class="disabled-badge-expanded"
                >
                  {{ disabledReason }}
                </span>
                <div
                  v-if="multiSelect && permissions"
                  style="width: 90px"
                  class="pr-1"
                >
                  <select
                    v-model="department.permission"
                    @change="changePermission(department)"
                    class="select-dropdown-depart bg-base-300"
                  >
                    <option value="normal">normal</option>
                    <option value="supervisor">supervisor</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
          <div
            v-if="departmentStore.loaded && filteredDepartments.length === 0"
            class="no-departments bg-base-300"
          >
            <p v-if="!$slots.default">Nenhum departamento disponível.</p>
            <slot v-else />
          </div>
          <div v-if="!departmentStore.loaded" class="library-loading-spinner">
            Inicializando departamentos
            <div class="library-loader"></div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped src="../sharedSelectStyles.css"></style>

<style scoped>
/* ===== ESTILOS ESPECÍFICOS DO DEPARTMENT SELECT ===== */

/* Select para permissões (normal/supervisor) */
.select-dropdown-depart {
  cursor: pointer;
  text-transform: capitalize;
  appearance: none;
  text-align: center;
  border-radius: 3rem;
  padding-left: 0.2rem;
  padding: 0.2rem;
  width: 100%;
  font-size: 0.875rem;
  line-height: 1.25rem;
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
