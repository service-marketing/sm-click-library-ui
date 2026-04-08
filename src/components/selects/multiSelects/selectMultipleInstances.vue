<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import InstanceIcon from "./InstanceTypeIcon.vue";

const props = defineProps({
  // --- Lista que será exibida e já selecionada ---
  modelValue: {
    type: Array,
    default: () => [],
  },
  // --- Lista de todas as instâncias ---
  instances: {
    type: Array,
    default: () => [],
    required: true,
  },
  // --- Variante de exibição ---
  variant: {
    type: String,
    default: "dropdown",
    validator: (v) => ["expanded", "dropdown"].includes(v),
  },
  // --- Label principal do dropdown ---
  placeholder: {
    type: String,
    default: "Selecione instâncias...",
  },
  placeholderSelect: {
    type: String,
    default: "Pesquisar instâncias...",
  },
  showSearch: { type: Boolean, default: true },
  showSelectedBadges: { type: Boolean, default: true },
  maxHeight: { type: String, default: "183.5px" },
  // --- Estilo ---
  size: {
    type: String,
    default: "normal",
    validator: (v) => ["small", "normal", "large"].includes(v),
  },
  minColumnWidth: { type: String, default: "170px" },
  // --- Cores customizáveis ---
  primaryColor: { type: String, default: "#14b8a6" },
  primaryColorHover: { type: String, default: "#0d9488" },
  borderRadius: { type: String, default: "0.75rem" },
});

const emit = defineEmits(["update:modelValue"]);

const isOpen = ref(false);
const search = ref("");
const dropdownRef = ref(null);

// --- Click outside handler ---
function handleClickOutside(event) {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target)) {
    isOpen.value = false;
  }
}

onMounted(() => document.addEventListener("click", handleClickOutside));
onUnmounted(() => document.removeEventListener("click", handleClickOutside));

// --- CSS Variables ---
const cssVars = computed(() => ({
  "--primary-color": props.primaryColor,
  "--primary-color-hover": props.primaryColorHover,
  "--primary-color-light": `${props.primaryColor}50`,
  "--primary-color-medium": `${props.primaryColor}cc`,
  "--border-radius": props.borderRadius,
}));

// --- Classes de tamanho ---
const sizeClasses = computed(() => ({
  "size-small": props.size === "small",
  "size-normal": props.size === "normal",
  "size-large": props.size === "large",
}));

// --- Estilo do grid ---
const gridStyle = computed(() => ({
  gridTemplateColumns: `repeat(auto-fit, minmax(${props.minColumnWidth}, 1fr))`,
}));

// --- Variante ---
const isExpanded = computed(() => props.variant === "expanded");

// --- Instâncias selecionadas como objetos ---
const selectedInstances = computed(() =>
  props.instances.filter((i) => props.modelValue.includes(i.id)),
);

// --- Placeholder dinâmico ---
const dynamicPlaceholder = computed(() => {
  if (props.modelValue.length > 0) {
    return `Selecionadas: ${props.modelValue.length}`;
  }
  return props.placeholder;
});

// --- Filtra as instâncias conforme a busca ---
const filteredInstances = computed(() =>
  props.instances.filter((i) =>
    i.name.toLowerCase().includes(search.value.toLowerCase()),
  ),
);

// --- Alterna seleção da instância ---
const toggleSelect = (item) => {
  const selected = [...props.modelValue];
  const index = selected.indexOf(item.id);
  if (index === -1) {
    selected.push(item.id);
  } else {
    selected.splice(index, 1);
  }
  emit("update:modelValue", selected);
};

// --- Remove instância pelos badges ---
const removeInstance = (id) => {
  emit("update:modelValue", props.modelValue.filter((v) => v !== id));
};
</script>

<template>
  <div
    class="depart-select-container"
    :class="sizeClasses"
    :style="cssVars"
    ref="dropdownRef"
  >
    <!-- ===== Variante EXPANDED ===== -->
    <template v-if="isExpanded">
      <div class="search-container">
        <!-- Campo de busca -->
        <div
          v-if="showSearch"
          class="input-wrapper bg-base-300"
          @click="isOpen = !isOpen"
          :class="{ expanded: isOpen || modelValue.length > 0 }"
        >
          <input
            v-model="search"
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

        <!-- Badges de selecionadas -->
        <main
          v-if="showSelectedBadges && selectedInstances.length > 0"
          class="selection-container bg-base-300 border-b border-base-200"
        >
          <div
            v-for="instance in selectedInstances"
            :key="instance.id"
            class="selection-item"
          >
            <span class="selection-item-label">{{ instance.name }}</span>
            <button @click="removeInstance(instance.id)" class="close-btn">
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

        <!-- Lista de instâncias -->
        <div
          :class="
            selectedInstances.length > 0 && showSelectedBadges
              ? 'dropdown-attendance-expanded'
              : 'dropdown-attendance'
          "
          class="dropdown-attendance bg-base-300"
          :style="{ maxHeight: maxHeight }"
        >
          <div class="department-list">
            <div class="grid-container" :style="gridStyle">
              <div
                v-for="instance in filteredInstances"
                :key="instance.id"
                @click="toggleSelect(instance)"
                :class="{ selected: modelValue.includes(instance.id) }"
                class="department-item bg-slate-500/20 hover:bg-teal-600"
              >
                <div style="padding-left: 5px; flex-shrink: 0" class="relative">
                  <InstanceIcon :type="instance.type" />
                </div>
                <span class="department-name h-full w-full">{{
                  instance.name
                }}</span>
              </div>
            </div>
          </div>
          <div
            v-if="filteredInstances.length === 0"
            class="no-departments bg-base-300"
          >
            Nenhuma instância disponível.
          </div>
        </div>
      </div>
    </template>

    <!-- ===== Variante DROPDOWN (padrão original) ===== -->
    <template v-else>
      <div class="dropdown-wrapper">
        <!-- Trigger -->
        <div
          @click="isOpen = !isOpen"
          class="dropdown-trigger bg-base-300 cursor-pointer"
          :class="{ 'dropdown-open': isOpen }"
        >
          <span class="dropdown-trigger-text" :class="{ 'opacity-60': !modelValue.length }">
            {{
              modelValue.length
                ? `Selecionadas: ${modelValue.length}`
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
            :class="{ 'dropdown-arrow-open': isOpen }"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="m19.5 8.25-7.5 7.5-7.5-7.5"
            />
          </svg>
        </div>

        <!-- Menu dropdown -->
        <div v-show="isOpen" class="dropdown-menu bg-base-300">
          <div v-if="showSearch" class="dropdown-search-wrapper">
            <input
              v-model="search"
              type="text"
              :placeholder="placeholder"
              class="dropdown-search-input bg-base-200"
            />
          </div>

          <div class="dropdown-options" :style="{ maxHeight: maxHeight }">
            <div
              v-for="instance in filteredInstances"
              :key="instance.id"
              :class="{ 'dropdown-option-selected': modelValue.includes(instance.id) }"
              class="dropdown-option"
              @click="toggleSelect(instance)"
            >
              <div class="relative flex-shrink-0">
                <InstanceIcon :type="instance.type" />
              </div>
              <span class="dropdown-option-label">{{ instance.name }}</span>
              <span
                class="dropdown-option-check ml-auto"
                v-if="modelValue.includes(instance.id)"
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
            </div>

            <div v-if="filteredInstances.length === 0" class="dropdown-empty">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
                style="width: 1.25rem; height: 1.25rem; flex-shrink: 0; opacity: 0.5; margin-right: 0.5rem"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
                />
              </svg>
              <p style="margin: 0; font-size: 0.875rem">
                {{
                  search
                    ? `Nenhuma instância encontrada para "${search}"`
                    : "Nenhuma instância disponível."
                }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>


<style scoped src="../sharedSelectStyles.css"></style>

<style scoped>
.icon-meta {
  width: 0.7rem;
  height: 0.7rem;
}
</style>
