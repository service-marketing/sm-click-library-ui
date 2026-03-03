<script setup>
/**
 * 📋 Descrição:
 * Um dropdown genérico e acessível, com suporte a seleção única ou múltipla,
 * fechamento automático ao clicar fora, busca, e personalização de rótulos.
 *
 * 💡 Uso:
 * <SimpleSelect
 *   v-model="selectedOptions"
 *   :options="departments"
 *   placeholder="Selecione algo..."
 *   :multiple="true"
 * />
 */

import {
  ref,
  computed,
  defineProps,
  defineEmits,
  watch,
  onMounted,
  onUnmounted,
  nextTick,
} from "vue";

const props = defineProps({
  // --- Valor selecionado — pode ser um único valor ou um array (caso múltiplo) ---

  modelValue: {
    type: [Array, String, Number, Object],
    default: () => [],
  },

  // --- Lista de opções disponíveis ---
  // ---  Cada item deve ter no mínimo: { value: any, name: string } ---
  options: {
    type: Array,
    required: true,
    default: () => [],
  },

  // --- Texto exibido quando nada está selecionado ---
  placeholder: {
    type: String,
    default: "Selecione uma opção...",
  },

  // --- Permite múltiplas seleções ---
  multiple: {
    type: Boolean,
    default: false,
  },
  // --- Tema para customização via CSS ---
  theme: {
    type: String,
    default: "bg-base-300 border-base-300",
  },
  // --- Teleport do dropdown para fora do fluxo normal (ex: 'body') ---
  // Use quando o select estiver dentro de um contêiner com overflow que corta o dropdown.
  teleportTo: {
    type: String,
    default: null, // quando null mantém comportamento antigo (absolute dentro do container)
  },

  // --- Mostra dropdown como overlay (position: fixed) sem precisar de Teleport ---
  // Útil quando o dropdown está "esticando" o layout ou quando Teleport não é uma opção.
  overlay: {
    type: Boolean,
    default: false,
  },

  //--- Aceita um svg para ficar do lado esquerdo das ecolhas ---
  //   (continua existindo para compatibilidade / fallback)
  icon: {
    type: [String, Object],
    default: null,
  },

  // Ícone específico para o placeholder (usado via prop `icon-placeholder`) ---
  iconPlaceholder: {
    type: [String, Object],
    default: null,
  },
});

const emit = defineEmits(["update:modelValue"]);

const isOpen = ref(false);
const dropdownRef = ref(null); // ref do container geral
const teleportedRef = ref(null); // ref do dropdown quando teletransportado
const triggerRef = ref(null); // ref da área clicável (campo principal)
const dropdownStyle = ref({}); // estilos calculados quando usa teleport

// --- Fecha dropdown ao clicar fora ---
const handleOutside = (event) => {
  if (!isOpen.value) return;
  const target = event.target;

  if (
    dropdownRef.value?.contains(target) ||
    teleportedRef.value?.contains(target)
  ) {
    return;
  }

  isOpen.value = false;
};

const getFixedContainingBlock = (element) => {
  let node = element?.parentElement || null;
  while (node && node !== document.body && node !== document.documentElement) {
    const style = window.getComputedStyle(node);
    const willChange = style.willChange || "";
    const createsContainingBlock =
      style.transform !== "none" ||
      style.perspective !== "none" ||
      style.filter !== "none" ||
      style.backdropFilter !== "none" ||
      willChange.includes("transform") ||
      willChange.includes("filter") ||
      willChange.includes("perspective");
    if (createsContainingBlock) return node;
    node = node.parentElement;
  }
  return null;
};

// --- Calcula posição absoluta (fixed) para overlay/teleport ---
const updatePosition = () => {
  if ((!props.teleportTo && !props.overlay) || !triggerRef.value) return;
  const rect = triggerRef.value.getBoundingClientRect();
  let top = rect.bottom + 6;
  let left = rect.left;

  // Overlay sem Teleport pode ficar relativo a um ancestor transformado.
  // Ajustamos para esse containing block quando existir.
  if (props.overlay && !props.teleportTo) {
    const containingBlock = getFixedContainingBlock(triggerRef.value);
    if (containingBlock) {
      const blockRect = containingBlock.getBoundingClientRect();
      top -= blockRect.top;
      left -= blockRect.left;
    }
  }

  dropdownStyle.value = {
    position: "fixed", // evita ser afetado por scroll de ancestors
    top: `${top}px`, // pequeno espaçamento
    left: `${left}px`,
    width: `${rect.width}px`,
    zIndex: 9999,
  };
};

// --- Verifica se há seleção válida ---
const hasSelection = computed(() => {
  if (props.multiple) {
    return Array.isArray(props.modelValue) && props.modelValue.length > 0;
  }
  return props.options.some((opt) => opt.value === props.modelValue);
});

// --- Ícone que aparece quando há seleção ---
const selectedIcon = computed(() => {
  if (props.multiple) return null;

  const selectedOption = props.options.find(
    (opt) => opt.value === props.modelValue,
  );

  // Ícone da opção; se não tiver, usa ícone de placeholder/icon como fallback
  return selectedOption?.icon || props.iconPlaceholder || props.icon || null;
});

// --- Ícone para placeholder (usa o novo prop) ---
const placeholderIcon = computed(() => {
  // prioridade: iconPlaceholder → icon (compatibilidade antiga)
  return props.iconPlaceholder || props.icon || null;
});

watch(isOpen, async (open) => {
  if (!open) return;
  await nextTick();
  updatePosition();
  requestAnimationFrame(updatePosition);
});

const listeners = [];
onMounted(() => {
  document.addEventListener("mousedown", handleOutside);

  if (props.teleportTo || props.overlay) {
    const reposition = () => {
      if (isOpen.value) updatePosition();
    };
    window.addEventListener("scroll", reposition, true); // true captura scroll em containers
    window.addEventListener("resize", reposition);
    listeners.push(["scroll", reposition], ["resize", reposition]);
  }
});

onUnmounted(() => {
  document.removeEventListener("mousedown", handleOutside);
  listeners.forEach(([evt, fn]) =>
    window.removeEventListener(evt, fn, evt === "scroll" ? true : undefined),
  );
});

// --- Verifica se um item está selecionado ---
const isSelected = (optionValue) => {
  if (props.multiple && Array.isArray(props.modelValue)) {
    return props.modelValue.includes(optionValue);
  }
  return props.modelValue === optionValue;
};

// --- Alterna seleção (single ou múltipla) ---
const toggleSelect = (optionValue) => {
  if (props.multiple) {
    const selected = Array.isArray(props.modelValue)
      ? [...props.modelValue]
      : [];

    const index = selected.indexOf(optionValue);
    if (index === -1) selected.push(optionValue);
    else selected.splice(index, 1);

    emit("update:modelValue", selected);
  } else {
    emit("update:modelValue", optionValue);
    isOpen.value = false; // Fecha dropdown no modo single
  }
};

// --- Label exibido no campo principal ---
const displayLabel = computed(() => {
  if (props.multiple && Array.isArray(props.modelValue)) {
    if (props.modelValue.length === 0) return props.placeholder;
    const selectedNames = props.options
      .filter((opt) => props.modelValue.includes(opt.value))
      .map((opt) => opt.name);
    return selectedNames.join(", ");
  }

  const selectedOption = props.options.find(
    (opt) => opt.value === props.modelValue,
  );
  return selectedOption?.name || props.placeholder;
});
</script>

<template>
  <div class="relative w-full" ref="dropdownRef">
    <!-- Campo principal -->
    <div
      @click="isOpen = !isOpen"
      :class="[
        'flex flex-wrap shadow shadow-gray-900 dark:shadow-gray-400 items-center justify-between p-3 gap-2 rounded-md cursor-pointer transition',
        theme,
      ]"
      ref="triggerRef"
    >
      <span
        :class="[
          'text-xs truncate max-w-full flex gap-2 items-center',
          hasSelection ? '' : 'opacity-80',
        ]"
      >
        <!-- Ícone da seleção -->
        <span
          v-if="hasSelection && selectedIcon"
          class="flex-shrink-0"
          v-html="selectedIcon"
        />

        <!-- Ícone do placeholder -->
        <span
          v-else-if="!hasSelection && placeholderIcon"
          class="flex-shrink-0"
          v-html="placeholderIcon"
        />

        <p class="text-text-text-base">{{ displayLabel }}</p>
      </span>

      <!-- Ícone -->
      <svg
        :class="[
          'size-3 transition-transform duration-300',
          isOpen ? 'rotate-180' : '',
        ]"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <path
          stroke="currentColor"
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="m19 9-7 7-7-7"
        />
      </svg>
    </div>

    <!-- Dropdown (modo padrão dentro do fluxo) -->
    <div
      v-if="isOpen && !teleportTo && !overlay"
      :class="[
        'absolute flex flex-col z-50 mt-1.5 w-full shadow-sm border rounded-md max-h-64 overflow-y-auto hide-scrollbar',
        theme,
      ]"
    >
      <button
        v-for="option in options"
        :key="option.value"
        :class="[
          isSelected(option.value)
            ? 'bg-green-500/30 hover:bg-green-500/50'
            : 'hover:bg-base-200',
          'flex items-center justify-between gap-2 px-3 py-2 text-left text-sm cursor-pointer transition w-full',
        ]"
        @click="toggleSelect(option.value)"
      >
        <div class="flex items-center gap-2">
          <span v-if="option.icon" v-html="option.icon" class="flex-shrink-0" />
          <span class="text-text-base">{{ option.name }}</span>
        </div>
        <svg
          v-if="isSelected(option.value)"
          xmlns="http://www.w3.org/2000/svg"
          class="size-4 text-green-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M5 13l4 4L19 7"
          />
        </svg>
      </button>
    </div>

    <!-- Dropdown como overlay (sem Teleport) -->
    <div
      v-if="isOpen && !teleportTo && overlay"
      :style="dropdownStyle"
      :class="[
        'flex flex-col shadow-sm border rounded-md max-h-64 overflow-y-auto hide-scrollbar',
        theme,
      ]"
    >
      <button
        v-for="option in options"
        :key="option.value"
        :class="[
          isSelected(option.value)
            ? 'bg-green-500/30 hover:bg-green-500/50'
            : 'hover:bg-base-200',
          'flex items-center justify-between gap-2 px-3 py-2 text-left text-sm cursor-pointer transition w-full',
        ]"
        @click="toggleSelect(option.value)"
      >
        <div class="flex items-center gap-2">
          <span v-if="option.icon" v-html="option.icon" class="flex-shrink-0" />
          <span class="text-text-base">{{ option.name }}</span>
        </div>
        <svg
          v-if="isSelected(option.value)"
          xmlns="http://www.w3.org/2000/svg"
          class="size-4 text-green-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M5 13l4 4L19 7"
          />
        </svg>
      </button>
    </div>

    <!-- Dropdown teletransportado para fora (evita clipping por overflow) -->
    <Teleport v-if="isOpen && teleportTo" :to="teleportTo">
      <div
        ref="teleportedRef"
        :style="dropdownStyle"
        :class="[
          'flex flex-col shadow-sm border rounded-md max-h-64 overflow-y-auto hide-scrollbar',
          theme,
        ]"
      >
        <button
          v-for="option in options"
          :key="option.value"
          :class="[
            isSelected(option.value)
              ? 'bg-green-500/30 hover:bg-green-500/50'
              : 'hover:bg-base-200',
            'flex items-center justify-between gap-2 px-3 py-2 text-left text-sm cursor-pointer transition w-full',
          ]"
          @click="toggleSelect(option.value)"
        >
          <div class="flex items-center gap-2">
            <span
              v-if="option.icon"
              v-html="option.icon"
              class="flex-shrink-0"
            />
            <span class="text-text-base">{{ option.name }}</span>
          </div>
          <svg
            v-if="isSelected(option.value)"
            xmlns="http://www.w3.org/2000/svg"
            class="size-4 text-green-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M5 13l4 4L19 7"
            />
          </svg>
        </button>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
/* --- Esconde a barra de rolagem mantendo a rolagem funcional --- */
.hide-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.hide-scrollbar::-webkit-scrollbar {
  display: none;
}
</style>
