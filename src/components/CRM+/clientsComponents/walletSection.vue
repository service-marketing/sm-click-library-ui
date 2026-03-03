<script setup>
import { ref, watch, onMounted, computed } from "vue";
import { useAttendantStore } from "~/stores/attendantStore";
import { useDepartmentStore } from "~/stores/departmentStore";
import api from "~/utils/api.js";

const props = defineProps({
  contactId: {
    type: String,
    default: null,
  },
  apiBaseUrl: {
    type: String,
    default: "",
  },
});

const attendantStore = useAttendantStore();
const departmentStore = useDepartmentStore();

const wallet = ref([]);
const loading = ref(false);
const loadingStores = ref(false);
const error = ref(null);
const showAddForm = ref(false);
const addingWallet = ref(false);
const selectedAttendant = ref(null);
const selectedDepartment = ref(null);

// Busca dados das stores quando o componente monta
const loadStores = async () => {
  loadingStores.value = true;
  try {
    await Promise.all([
      departmentStore.loaded ? Promise.resolve() : departmentStore.fetchDepartments(),
      attendantStore.loaded ? Promise.resolve() : attendantStore.fetchAttendants(),
    ]);
  } catch (err) {
    console.error("Erro ao carregar stores:", err);
  } finally {
    loadingStores.value = false;
  }
};

// Departamentos disponíveis - apenas com wallets_enabled
const availableDepartments = computed(() => {
  return departmentStore.departments.filter(dept => dept.wallets_enabled === true);
});

// Atendentes disponíveis - filtrados pelo departamento selecionado
const availableAttendants = computed(() => {
  if (!selectedDepartment.value) {
    return [];
  }
  
  // Filtra atendentes ativos que estão no departamento selecionado
  return attendantStore.attendants.filter(att => {
    if (!att.status) return false; // Apenas atendentes ativos
    
    // Verifica se o atendente tem o departamento selecionado
    return att.department && att.department.some(dept => dept.id === selectedDepartment.value);
  });
});

// Função auxiliar para buscar dados de atendente
const getAttendantData = (attendantId) => {
  const attendant = attendantStore.attendants.find(att => att.id === attendantId);
  if (attendant) {
    return {
      name: attendant.name,
      photo: attendant.photo || null,
    };
  }
  return { name: "Desconhecido", photo: null };
};

// Função auxiliar para buscar dados de departamento
const getDepartmentData = (departmentId) => {
  const department = departmentStore.departments.find(dept => dept.id === departmentId);
  if (department) {
    return {
      name: department.name,
    };
  }
  return { name: "Desconhecido" };
};

const fetchWallet = async () => {
  if (!props.contactId) {
    wallet.value = [];
    return;
  }

  loading.value = true;
  error.value = null;

  try {
    const response = await api.get(`v1/api/contacts/contact/${props.contactId}/wallets/`);
    
    if (response.data && response.data.wallet) {
      wallet.value = response.data.wallet.map(item => ({
        ...item,
        attendant: getAttendantData(item.attendant_id),
        department: getDepartmentData(item.department_id),
      }));
    } else {
      wallet.value = [];
    }
  } catch (err) {
    console.error("Erro ao carregar carteira:", err);
    error.value = "Não foi possível carregar a carteira do cliente";
    wallet.value = [];
  } finally {
    loading.value = false;
  }
};

watch(() => props.contactId, () => {
  fetchWallet();
}, { immediate: true });

watch(
  () => props.contactId,
  async () => {
    await loadStores();
    await fetchWallet();
  },
  { immediate: false }
);

onMounted(async () => {
  await loadStores();
  await fetchWallet();
});

// Quando o departamento muda, reseta o atendente selecionado
watch(selectedDepartment, () => {
  selectedAttendant.value = null;
});

const addWallet = async () => {
  if (!selectedAttendant.value || !selectedDepartment.value) {
    return;
  }

  // Validação: verifica se o atendente está no departamento selecionado
  const attendant = attendantStore.attendants.find(att => att.id === selectedAttendant.value);
  if (!attendant || !attendant.department || !attendant.department.some(dept => dept.id === selectedDepartment.value)) {
    error.value = "O atendente selecionado não pertence ao departamento escolhido";
    return;
  }

  addingWallet.value = true;
  error.value = null;

  try {
    await api.post(`v1/api/contacts/contact/${props.contactId}/wallets/`, {
      attendant_id: selectedAttendant.value,
      department_id: selectedDepartment.value,
    });

    // Recarrega a lista de wallets após adicionar
    await fetchWallet();

    // Reset form
    selectedAttendant.value = null;
    selectedDepartment.value = null;
    showAddForm.value = false;
  } catch (err) {
    console.error("Erro ao adicionar relacionamento:", err);
    error.value = err.response?.data?.message || "Não foi possível adicionar o relacionamento";
  } finally {
    addingWallet.value = false;
  }
};

const removeWallet = async (index, item) => {
  if (!confirm("Deseja realmente remover este relacionamento?")) {
    return;
  }

  try {
    await api.delete(`v1/api/contacts/contact/${props.contactId}/wallets/${item.attendant_id}/${item.department_id}`);
    
    // Remove localmente
    wallet.value.splice(index, 1);
  } catch (err) {
    console.error("Erro ao remover relacionamento:", err);
    error.value = err.response?.data?.message || "Não foi possível remover o relacionamento";
  }
};
</script>

<template>
  <div class="wallet-container px-1.5 pt-1.5">
    <!-- Loading State -->
    <div v-if="loading || loadingStores" class="flex items-center justify-center py-8">
      <div class="size-8 animate-spin rounded-full border-4 border-solid border-green-500 border-t-transparent" />
    </div>

    <!-- Error State -->
    <div v-else-if="error && !loading && !loadingStores" class="error-message">
      <svg 
        class="size-5 text-red-500" 
        xmlns="http://www.w3.org/2000/svg" 
        fill="currentColor" 
        viewBox="0 0 24 24"
      >
        <path 
          fill-rule="evenodd" 
          d="M2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10S2 17.523 2 12Zm11-4a1 1 0 1 0-2 0v5a1 1 0 1 0 2 0V8Zm-1 7a1 1 0 1 0 0 2h.01a1 1 0 1 0 0-2H12Z" 
          clip-rule="evenodd"
        />
      </svg>
      <p class="text-xs text-red-500">{{ error }}</p>
      <button
        @click="error = null; fetchWallet();"
        class="text-xs text-green-500 hover:text-green-400 underline mt-2"
      >
        Tentar novamente
      </button>
    </div>

    <!-- Empty State -->
    <div v-else-if="!wallet.length" class="empty-state">
      <svg 
        class="size-12 text-gray-400" 
        xmlns="http://www.w3.org/2000/svg" 
        fill="none" 
        viewBox="0 0 24 24"
      >
        <path 
          stroke="currentColor" 
          stroke-linecap="round" 
          stroke-linejoin="round" 
          stroke-width="2" 
          d="M20 6H10a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V7a1 1 0 0 0-1-1Zm-7 7H9m4-4H9m12 4h-6m6 4h-6m-3-9h2a1 1 0 0 0 1-1V5a1 1 0 0 0-1-1h-2a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1Zm-4 0H5a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h5m-4-8h4m-4 4h4"
        />
      </svg>
      <p class="text-xs text-gray-400 mt-2">Nenhum relacionamento encontrado</p>
    </div>

    <!-- Wallet List -->
    <div v-else class="wallet-list">
      <!-- Botão Adicionar -->
      <button
        v-if="!showAddForm"
        @click="showAddForm = true"
        class="add-wallet-button"
      >
        <svg 
          class="size-4" 
          xmlns="http://www.w3.org/2000/svg" 
          fill="none" 
          viewBox="0 0 24 24"
        >
          <path 
            stroke="currentColor" 
            stroke-linecap="round" 
            stroke-linejoin="round" 
            stroke-width="2" 
            d="M5 12h14m-7 7V5"
          />
        </svg>
        <span class="text-xs font-medium">Adicionar Relacionamento</span>
      </button>

      <!-- Formulário de Adicionar -->
      <div v-if="showAddForm" class="add-wallet-form">
        <div class="flex flex-col gap-3">
          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-medium text-left px-1">Departamento</label>
            <select 
              v-model="selectedDepartment" 
              class="wallet-select"
            >
              <option :value="null">Selecione um departamento</option>
              <option 
                v-for="dept in availableDepartments" 
                :key="dept.id" 
                :value="dept.id"
              >
                {{ dept.name }}
              </option>
            </select>
            <p v-if="availableDepartments.length === 0" class="text-xs text-yellow-500 px-1">
              Nenhum departamento com carteiras habilitadas
            </p>
          </div>

          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-medium text-left px-1">Atendente</label>
            <select 
              v-model="selectedAttendant" 
              class="wallet-select"
              :disabled="!selectedDepartment"
            >
              <option :value="null">
                {{ selectedDepartment ? 'Selecione um atendente' : 'Selecione um departamento primeiro' }}
              </option>
              <option 
                v-for="attendant in availableAttendants" 
                :key="attendant.id" 
                :value="attendant.id"
              >
                {{ attendant.name }}
              </option>
            </select>
            <p v-if="selectedDepartment && availableAttendants.length === 0" class="text-xs text-yellow-500 px-1">
              Nenhum atendente ativo neste departamento
            </p>
          </div>

          <p v-if="error" class="text-xs text-red-500 px-1">{{ error }}</p>

          <div class="flex gap-2">
            <button
              @click="addWallet"
              :disabled="!selectedAttendant || !selectedDepartment || addingWallet"
              class="wallet-form-button wallet-form-button-save"
            >
              <div
                v-if="addingWallet"
                class="size-3 animate-spin rounded-full border-2 border-solid border-white border-t-transparent"
              />
              <span v-else class="text-xs font-medium">Salvar</span>
            </button>
            <button
              @click="showAddForm = false; selectedAttendant = null; selectedDepartment = null; error = null;"
              :disabled="addingWallet"
              class="wallet-form-button wallet-form-button-cancel"
            >
              <span class="text-xs font-medium">Cancelar</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Lista de Relacionamentos -->
      <div 
        v-for="(item, index) in wallet" 
        :key="index" 
        class="wallet-card"
      >
        <div class="flex items-center gap-3 flex-1">
          <!-- Attendant Photo -->
          <img 
            v-if="item.attendant.photo" 
            :src="item.attendant.photo" 
            :alt="item.attendant.name"
            class="wallet-avatar"
          />
          <div 
            v-else 
            class="wallet-avatar-placeholder"
          >
            <svg 
              class="size-5" 
              xmlns="http://www.w3.org/2000/svg" 
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

          <!-- Info -->
          <div class="flex-1 min-w-0">
            <p class="wallet-attendant-name">
              {{ item.attendant.name }}
            </p>
            <div class="flex items-center gap-1.5 mt-0.5">
              <svg 
                class="size-3 text-gray-400 flex-shrink-0" 
                xmlns="http://www.w3.org/2000/svg" 
                fill="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  fill-rule="evenodd" 
                  d="M4 4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2H4Zm10 5a1 1 0 0 1 1-1h3a1 1 0 1 1 0 2h-3a1 1 0 0 1-1-1Zm0 3a1 1 0 0 1 1-1h3a1 1 0 1 1 0 2h-3a1 1 0 0 1-1-1Zm0 3a1 1 0 0 1 1-1h3a1 1 0 1 1 0 2h-3a1 1 0 0 1-1-1Zm-8-5a3 3 0 1 1 6 0 3 3 0 0 1-6 0Zm1.942 4a3 3 0 0 0-2.847 2.051l-.044.133-.004.012c-.042.126-.055.167-.042.195.006.013.02.023.038.039.032.025.08.064.146.155A1 1 0 0 0 6 17h6a1 1 0 0 0 .811-.415.713.713 0 0 1 .146-.155c.019-.016.031-.026.038-.04.013-.027 0-.068-.042-.194l-.004-.012-.044-.133A3 3 0 0 0 10.059 14H7.942Z" 
                  clip-rule="evenodd"
                />
              </svg>
              <p class="wallet-department-name">
                {{ item.department.name }}
              </p>
            </div>
          </div>
        </div>

        <!-- Botão Remover -->
        <Popper
          hover
          content="Remover relacionamento"
          placement="left"
          arrow
        >
          <button
            @click="removeWallet(index, item)"
            class="wallet-remove-button"
          >
            <svg 
              class="size-4" 
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
          </button>
        </Popper>
      </div>
    </div>
  </div>
</template>

<style scoped>
.wallet-container {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
}

.wallet-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  overflow-y: auto;
  padding-right: 0.25rem;
}

.wallet-card {
  @apply bg-base-200 rounded-lg p-3 transition-all duration-200 hover:bg-base-100;
  border: 1px solid rgba(255, 255, 255, 0.05);
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.add-wallet-button {
  @apply bg-green-500 hover:bg-green-600 rounded-lg p-3 transition-all duration-200;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  width: 100%;
  border: 1px solid rgba(34, 197, 94, 0.3);
}

.add-wallet-form {
  @apply bg-base-200 rounded-lg p-3;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.wallet-select {
  @apply bg-base-300 rounded-md px-3 py-2 text-xs outline-none border-none focus:outline-none focus:ring-2 focus:ring-green-500 transition-all;
  width: 100%;
}

.wallet-select:disabled {
  @apply opacity-50 cursor-not-allowed;
}

.wallet-form-button {
  flex: 1;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  font-size: 0.75rem;
  font-weight: 500;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 2rem;
}

.wallet-form-button-save {
  @apply bg-green-500 hover:bg-green-600;
}

.wallet-form-button-save:disabled {
  @apply bg-green-500/50 cursor-not-allowed;
}

.wallet-form-button-cancel {
  @apply bg-base-300 hover:bg-base-100;
}

.wallet-form-button-cancel:disabled {
  @apply bg-base-300/50 cursor-not-allowed;
}

.wallet-remove-button {
  @apply p-2 rounded-md bg-red-500/10 hover:bg-red-500/20 transition-all duration-200;
  flex-shrink: 0;
}

.wallet-remove-button svg {
  @apply text-red-500;
}

.wallet-avatar {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 0.5rem;
  object-fit: cover;
  flex-shrink: 0;
  border: 2px solid rgba(34, 197, 94, 0.3);
}

.wallet-avatar-placeholder {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 0.5rem;
  @apply bg-base-300 flex items-center justify-center;
  flex-shrink: 0;
  border: 2px solid rgba(100, 116, 139, 0.3);
}

.wallet-attendant-name {
  @apply text-sm font-medium truncate;
}

.wallet-department-name {
  @apply text-xs text-gray-400 truncate;
}

.error-message {
  @apply flex flex-col items-center justify-center gap-2 py-8 px-4 text-center;
}

.empty-state {
  @apply flex flex-col items-center justify-center py-12 px-4 text-center;
}

/* Scroll personalizado */
.wallet-list::-webkit-scrollbar {
  width: 6px;
}

.wallet-list::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, #334155, #1e293b);
  border-radius: 8px;
}

.wallet-list::-webkit-scrollbar-track {
  background: transparent;
}

.wallet-list {
  scrollbar-width: thin;
  scrollbar-color: #334155 transparent;
}
</style>
