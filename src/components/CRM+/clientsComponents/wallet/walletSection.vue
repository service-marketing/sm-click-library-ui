<script setup>
/**
 * Wallet Section Component
 * Displays and manages wallet relationships for a contact.
 * Fetches and displays attendant-department relationships.
 * Uses stores to resolve attendant and department data.
 */
import { computed, onMounted, ref, watch } from "vue";
import api from "../../../../utils/api.js";
import { useAttendantStore } from "../../../../stores/attendantStore.js";
import { useDepartmentStore } from "../../../../stores/departmentStore.js";
import WalletCard from "./walletCard.vue";

const props = defineProps({
  contactId: {
    type: [String, Number],
    default: "",
  },
  pageState: {
    type: String,
    default: "data",
  },
});

const attendantStore = useAttendantStore();
const departmentStore = useDepartmentStore();

const walletRelations = ref([]);
const walletLoading = ref(false);
const walletError = ref("");
const walletLoadedContactId = ref(null);
const removingDepartmentIds = ref([]);

/**
 * Extrai a lista de wallets do payload da API.
 * Formato esperado: { status: true, wallet: [{ attendant_id, department_id }] }
 */
const extractWalletList = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.wallet)) return payload.wallet;
  if (Array.isArray(payload?.results)) return payload.results;
  return [];
};

const buildWalletId = (item, index) => {
  if (item?.id) return item.id;
  const attendantId = item?.attendant_id || "attendant";
  const departmentId = item?.department_id || "department";
  return `${attendantId}-${departmentId}-${index}`;
};

/**
 * Encontra attendant na store pelo ID
 */
const findAttendant = (attendantId) => {
  if (!attendantId) return null;
  return attendantStore.attendants.find((a) => a.id === attendantId);
};

/**
 * Encontra department na store pelo ID
 */
const findDepartment = (departmentId) => {
  if (!departmentId) return null;
  return departmentStore.departments.find((d) => d.id === departmentId);
};

const walletItems = computed(() =>
  walletRelations.value.map((item, index) => {
    const attendantId = item?.attendant_id;
    const departmentId = item?.department_id;

    const attendant = findAttendant(attendantId);
    const department = findDepartment(departmentId);

    const attendantName = attendant?.name || "Atendente não encontrado";
    const departmentName = department?.name || "Departamento não encontrado";
    const attendantPhoto = attendant?.photo || null;
    const updatedAt = item?.updated_at || item?.created_at || null;

    return {
      id: buildWalletId(item, index),
      attendantId,
      departmentId,
      attendantName,
      attendantPhoto,
      departmentName,
      updatedAt,
    };
  }),
);

/**
 * Garante que as stores estejam carregadas
 */
const ensureStoresLoaded = async () => {
  const promises = [];

  if (!attendantStore.loaded && attendantStore.attendants.length === 0) {
    promises.push(
      attendantStore.fetchAttendants().then(() => {
        attendantStore.loaded = true;
      }),
    );
  }

  if (!departmentStore.loaded && departmentStore.departments.length === 0) {
    promises.push(
      departmentStore.fetchDepartments().then(() => {
        departmentStore.loaded = true;
      }),
    );
  }

  if (promises.length > 0) {
    await Promise.all(promises);
  }
};

const fetchWalletRelations = async ({ force = false } = {}) => {
  const contactId = props.contactId;
  if (!contactId) {
    walletRelations.value = [];
    walletError.value = "";
    walletLoadedContactId.value = null;
    return;
  }

  if (
    !force &&
    walletLoadedContactId.value === contactId &&
    walletError.value === ""
  ) {
    return;
  }

  try {
    walletLoading.value = true;
    walletError.value = "";

    // Garante que as stores estejam carregadas antes de buscar as wallets
    await ensureStoresLoaded();

    const { data } = await api.get(
      `/v1/api/contacts/contact/${contactId}/wallets/`,
    );
    walletRelations.value = extractWalletList(data);
    walletLoadedContactId.value = contactId;
  } catch (error) {
    walletError.value =
      error?.response?.data?.message ||
      "Não foi possível carregar as relações de carteira.";
    console.error("Erro ao buscar carteira do contato:", error);
  } finally {
    walletLoading.value = false;
  }
};

const isRemoving = (departmentId) =>
  removingDepartmentIds.value.includes(departmentId);

const setRemoving = (departmentId, active) => {
  if (!departmentId) return;

  if (active) {
    if (!removingDepartmentIds.value.includes(departmentId)) {
      removingDepartmentIds.value = [
        ...removingDepartmentIds.value,
        departmentId,
      ];
    }
    return;
  }

  removingDepartmentIds.value = removingDepartmentIds.value.filter(
    (currentId) => currentId !== departmentId,
  );
};

const removeFromWallet = async (wallet) => {
  const contactId = props.contactId;
  const departmentId = wallet?.departmentId;

  if (!contactId || !departmentId || isRemoving(departmentId)) return;

  try {
    setRemoving(departmentId, true);
    walletError.value = "";

    const url = `/v1/api/contacts/contact/${contactId}/wallets/`;
    const payload = {
      department_id: departmentId,
      attendant_id: null,
    };

    try {
      await api.post(url, payload);
    } catch (requestError) {
      walletError.value =
        requestError?.response?.data?.message ||
        "Não foi possível remover o responsável da carteira.";
      console.error(
        "Erro na requisição para remover da carteira:",
        requestError,
      );
      return;
    }

    walletRelations.value = walletRelations.value.filter(
      (item) => item?.department_id !== departmentId,
    );
  } catch (error) {
    walletError.value =
      error?.response?.data?.message ||
      "Não foi possível remover o responsável da carteira.";
    console.error("Erro ao remover relação da carteira:", error);
  } finally {
    setRemoving(departmentId, false);
  }
};

onMounted(async () => {
  // Carrega as stores ao montar o componente
  await ensureStoresLoaded();
});

watch(
  () => props.contactId,
  (newId, oldId) => {
    if (newId === oldId) return;
    walletRelations.value = [];
    walletError.value = "";
    walletLoadedContactId.value = null;
    if (props.pageState === "wallet" && newId) {
      fetchWalletRelations();
    }
  },
);

watch(
  () => [props.pageState, props.contactId],
  ([newPageState, contactId]) => {
    if (newPageState !== "wallet") return;
    if (!contactId) return;
    fetchWalletRelations();
  },
  { immediate: true },
);
</script>

<template>
  <div class="wallet-section">
    <section class="wallet-box bg-base-200">
      <header class="wallet-header">
        <div class="wallet-header__text">
          <div class="wallet-header__icon">
            <svg
              class="size-5"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                fill-rule="evenodd"
                d="M12 14a3 3 0 0 1 3-3h4a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2h-4a3 3 0 0 1-3-3Zm3-1a1 1 0 1 0 0 2h4v-2h-4Z"
                clip-rule="evenodd"
              />
              <path
                fill-rule="evenodd"
                d="M12.293 3.293a1 1 0 0 1 1.414 0L16.414 6h-2.828l-1.293-1.293a1 1 0 0 1 0-1.414ZM12.414 6 9.707 3.293a1 1 0 0 0-1.414 0L5.586 6h6.828ZM4.586 7l-.056.055A2 2 0 0 0 3 9v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2h-4a5 5 0 0 1 0-10h4a2 2 0 0 0-1.53-1.945L17.414 7H4.586Z"
                clip-rule="evenodd"
              />
            </svg>
          </div>
          <div>
            <h3 class="wallet-title">Carteira do contato</h3>
            <p class="wallet-subtitle">
              Atendentes responsáveis por este contato e seus respectivos
              departamentos
            </p>
          </div>
        </div>
        <button
          class="wallet-refresh-btn"
          :disabled="walletLoading || !props.contactId"
          @click="fetchWalletRelations({ force: true })"
        >
          <svg
            class="size-3.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="2"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          <span>Atualizar</span>
        </button>
      </header>

      <!-- Empty state: No contact ID -->
      <div v-if="!props.contactId" class="wallet-empty-state">
        <svg
          class="wallet-empty-icon"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          stroke-width="1.5"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
          />
        </svg>
        <p class="wallet-empty-text">
          Salve o contato para visualizar as relações de carteira.
        </p>
      </div>

      <!-- Loading state -->
      <div v-else-if="walletLoading" class="wallet-loading-state">
        <div class="wallet-spinner" />
        <p class="wallet-loading-text">Carregando carteira...</p>
      </div>

      <!-- Error state -->
      <div v-else-if="walletError" class="wallet-error-state">
        <svg class="wallet-error-icon" fill="currentColor" viewBox="0 0 20 20">
          <path
            fill-rule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
            clip-rule="evenodd"
          />
        </svg>
        <p class="wallet-error-text">{{ walletError }}</p>
        <button
          class="wallet-retry-btn"
          @click="fetchWalletRelations({ force: true })"
        >
          Tentar novamente
        </button>
      </div>

      <!-- Empty list state -->
      <div v-else-if="walletItems.length === 0" class="wallet-empty-state">
        <svg
          class="wallet-empty-icon"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          stroke-width="1.5"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z"
          />
        </svg>
        <p class="wallet-empty-text">
          Nenhuma relação de carteira encontrada para este contato.
        </p>
      </div>

      <!-- Wallet list -->
      <div v-else class="wallet-list">
        <WalletCard
          v-for="wallet in walletItems"
          :key="wallet.id"
          :wallet="wallet"
          :is-removing="isRemoving(wallet.departmentId)"
          @remove="removeFromWallet"
        />
      </div>
    </section>
  </div>
</template>

<style scoped>
.wallet-section {
  flex: 1 1 0%;
  min-height: 0;
  padding: 0.2rem 0.2rem 0.35rem;
  overflow: hidden;
}

.wallet-box {
  height: 100%;
  border-radius: 0.85rem;
  padding: 0.45rem;
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
}

.wallet-header {
  display: flex;
  justify-content: space-between;
  gap: 0.75rem;
  align-items: flex-start;
}

.wallet-header__text {
  display: flex;
  gap: 0.65rem;
  text-align: start;
}

.wallet-header__icon {
  width: 2rem;
  height: 2rem;
  border-radius: 0.5rem;
  background: linear-gradient(
    135deg,
    rgb(14 116 144 / 0.2),
    rgb(8 145 178 / 0.1)
  );
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  @apply text-primary;
}

.wallet-title {
  font-size: 0.98rem;
  line-height: 1.25rem;
  font-weight: 700;
  text-align: start;
}

.wallet-subtitle {
  font-size: 0.78rem;
  line-height: 1rem;
  max-width: 23rem;
  opacity: 0.75;
}

.wallet-refresh-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.75rem;
  line-height: 1rem;
  font-weight: 600;
  border-radius: 0.5rem;
  padding: 0.4rem 0.65rem;
  transition: all 140ms ease;
  @apply text-primary bg-base-300 dark:bg-sky-900/10;
}

.wallet-refresh-btn:hover:not(:disabled) {
  border-color: rgb(56 189 248 / 0.6);
  @apply text-current;
}

.wallet-refresh-btn:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.wallet-loading-state,
.wallet-empty-state,
.wallet-error-state {
  border-radius: 0.6rem;
  min-height: 7rem;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 0.55rem;
  padding: 0.75rem;
  text-align: center;
  @apply bg-base-300;
}

.wallet-empty-icon {
  width: 2.5rem;
  height: 2.5rem;
  color: rgb(148 163 184 / 0.6);
}

.wallet-empty-text,
.wallet-loading-text {
  font-size: 0.75rem;
  line-height: 1rem;
  color: rgb(148 163 184);
  max-width: 16rem;
}

.wallet-spinner {
  width: 1.25rem;
  height: 1.25rem;
  border: 2px solid rgb(148 163 184 / 0.3);
  border-top-color: rgb(14 116 144);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.wallet-error-state {
  border-color: rgb(248 113 113 / 0.5);
}

.wallet-error-icon {
  width: 2rem;
  height: 2rem;
  color: rgb(248 113 113);
}

.wallet-error-text {
  font-size: 0.75rem;
  line-height: 1rem;
  color: rgb(254 202 202);
}

.wallet-retry-btn {
  font-size: 0.75rem;
  line-height: 1rem;
  font-weight: 600;
  border-radius: 0.5rem;
  border: 1px solid rgb(248 113 113 / 0.45);
  color: rgb(254 202 202);
  padding: 0.38rem 0.62rem;
  transition: all 150ms ease;
}

.wallet-retry-btn:hover {
  background: rgb(248 113 113 / 0.1);
}

.wallet-list {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  overflow-y: auto;
  min-height: 0;
  flex: 1;
  padding-right: 0.15rem;
}

.wallet-highlight {
  border-radius: 0.65rem;
  border: 1px solid rgb(56 189 248 / 0.35);
  background: linear-gradient(
    135deg,
    rgb(8 47 73 / 0.5),
    rgb(14 116 144 / 0.12)
  );
  padding: 0.65rem 0.7rem;
}

.wallet-highlight__title {
  font-size: 0.74rem;
  line-height: 1rem;
  font-weight: 700;
  color: rgb(125 211 252);
  margin-bottom: 0.15rem;
}

.wallet-highlight__text {
  font-size: 0.7rem;
  line-height: 1rem;
  color: rgb(191 219 254);
}

.wallet-highlight__text code {
  color: rgb(224 242 254);
  background: rgb(2 6 23 / 0.3);
  border-radius: 0.3rem;
  padding: 0 0.22rem;
}

.wallet-list::-webkit-scrollbar {
  width: 6px;
}

.wallet-list::-webkit-scrollbar-thumb {
  background: rgb(71 85 105);
  border-radius: 9999px;
}

.wallet-list::-webkit-scrollbar-track {
  background: transparent;
}
</style>
