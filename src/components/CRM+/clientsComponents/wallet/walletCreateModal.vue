<script setup>
import { computed, ref, watch } from "vue";
import { notify } from "notiwind";
import api from "~/utils/api.js";
import { contactWalletUrl } from "~/utils/systemUrls.js";
import { useDepartmentStore } from "~/stores/departmentStore.js";

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false,
  },
  contactId: {
    type: [String, Number],
    default: "",
  },
  existingWallets: {
    type: Array,
    default: () => [],
  },
  currentAttendance: {
    type: Object,
    default: () => null,
  },
  attendants: {
    type: Array,
    default: () => [],
  },
  loggedAttendant: {
    type: Object,
    default: () => null,
  },
  loggedAttendantId: {
    type: [String, Number],
    default: null,
  },
  hasDepartmentMembership: {
    type: Function,
    default: () => false,
  },
  isDepartmentSupervisor: {
    type: Function,
    default: () => false,
  },
});

const emit = defineEmits(["update:isOpen", "saved"]);

const departmentStore = useDepartmentStore();

const submitLoading = ref(false);
const selectedAttendants = ref([]);
const selectedDepartments = ref([]);

const existingWallets = computed(() => props.existingWallets || []);
const lockedDepartmentId = computed(
  () =>
    props.currentAttendance?.departmentId ??
    props.currentAttendance?.department_id ??
    null,
);
const lockedDepartmentName = computed(
  () =>
    props.currentAttendance?.departmentName ??
    props.currentAttendance?.department_name ??
    "",
);
const lockedAttendantName = computed(
  () =>
    props.currentAttendance?.attendantName ??
    props.currentAttendance?.attendant_name ??
    "",
);
const hasLockedDepartment = computed(() => Boolean(lockedDepartmentId.value));
const isManagerFlow = computed(() => !props.currentAttendance);
const loggedAttendantName = computed(
  () => props.loggedAttendant?.name || "Atendente não encontrado",
);

const departmentsWithoutWallets = computed(() =>
  departmentStore.departments
    .filter((department) => department?.wallets_enabled !== true)
    .map((department) => department.id),
);

const enabledDepartmentsFilter = computed(() =>
  selectedDepartments.value.filter(
    (department) => department?.wallets_enabled === true,
  ),
);
const lockedDepartment = computed(() => {
  if (!lockedDepartmentId.value) return null;
  return (
    departmentStore.departments.find(
      (department) =>
        String(department.id) === String(lockedDepartmentId.value),
    ) || null
  );
});
const lockedDepartmentHasWalletsEnabled = computed(
  () => lockedDepartment.value?.wallets_enabled === true,
);
const selectedDepartmentId = computed(() => {
  if (hasLockedDepartment.value) return lockedDepartmentId.value;
  return enabledDepartmentsFilter.value[0]?.id ?? null;
});
const isSupervisor = computed(() => {
  if (isManagerFlow.value) return true;

  return props.isDepartmentSupervisor(selectedDepartmentId.value);
});
const departmentWallets = computed(() => {
  const deptId = selectedDepartmentId.value;
  if (!deptId) return [];

  return existingWallets.value.filter(
    (wallet) => String(wallet.department_id) === String(deptId),
  );
});
const departmentAlreadyLinked = computed(
  () => departmentWallets.value.length > 0,
);
const disabledAttendants = computed(() => {
  const disabledIds = new Set();

  departmentWallets.value.forEach((wallet) => {
    if (wallet?.attendant_id != null) {
      disabledIds.add(String(wallet.attendant_id));
    }
  });

  if (!isSupervisor.value) {
    props.attendants.forEach((attendant) => {
      if (String(attendant.id) !== String(props.loggedAttendantId)) {
        disabledIds.add(String(attendant.id));
      }
    });

    if (departmentAlreadyLinked.value && props.loggedAttendantId != null) {
      disabledIds.add(String(props.loggedAttendantId));
    }
  }

  return Array.from(disabledIds);
});
const attendantSelectDisabled = computed(
  () => !hasLockedDepartment.value && !selectedDepartmentId.value,
);
const effectiveAttendant = computed(() =>
  isSupervisor.value
    ? (selectedAttendants.value[0] ?? null)
    : props.loggedAttendant,
);
const selectedAttendantId = computed(
  () => effectiveAttendant.value?.id ?? null,
);
const isLoggedAttendantSelected = computed(
  () => String(selectedAttendantId.value) === String(props.loggedAttendantId),
);
const roleRestrictionMessage = computed(() => {
  if (isSupervisor.value) {
    return "Neste fluxo, você pode atribuir qualquer atendente do departamento selecionado.";
  }
  if (
    selectedDepartmentId.value &&
    !props.hasDepartmentMembership(selectedDepartmentId.value)
  ) {
    return "Você não pertence ao departamento selecionado, então não pode criar carteira nele.";
  }
  if (departmentAlreadyLinked.value) {
    return "Este contato já possui um vínculo de carteira nesse departamento.";
  }
  return "Neste fluxo, o atendente responsável deve ser você.";
});
const showRoleRestrictionMessage = computed(() => !isSupervisor.value);
const attendantDisabledReason = computed(() => {
  if (!isSupervisor.value && departmentAlreadyLinked.value) {
    return "Já vinculado no departamento";
  }
  if (!isSupervisor.value) {
    return "Somente você";
  }
  return "Já encarteirado";
});

const canSubmit = computed(() => {
  if (
    !props.contactId ||
    !effectiveAttendant.value ||
    !selectedDepartmentId.value
  ) {
    return false;
  }

  const attendantId = effectiveAttendant.value?.id;
  const departmentId = selectedDepartmentId.value;

  if (!isSupervisor.value) {
    if (!props.loggedAttendantId) return false;
    if (!isLoggedAttendantSelected.value) return false;
    if (!props.hasDepartmentMembership(departmentId)) return false;
    if (departmentAlreadyLinked.value) return false;
  }

  return !existingWallets.value.some(
    (wallet) =>
      String(wallet.attendant_id) === String(attendantId) &&
      String(wallet.department_id) === String(departmentId),
  );
});

const resetForm = () => {
  selectedAttendants.value = [];
  selectedDepartments.value = [];
  submitLoading.value = false;
};

const syncLockedDepartmentSelection = () => {
  if (!hasLockedDepartment.value) return;

  const department = lockedDepartment.value;
  selectedDepartments.value = department ? [department] : [];
};

const syncLoggedAttendantSelection = () => {
  if (isSupervisor.value) return;

  selectedAttendants.value = props.loggedAttendant
    ? [props.loggedAttendant]
    : [];
};

const closeModal = () => {
  emit("update:isOpen", false);
};

const handleAttendantSelect = (attendants) => {
  selectedAttendants.value = attendants;
};

const handleDepartmentSelect = (departments) => {
  selectedDepartments.value = departments;

  if (isSupervisor.value) {
    selectedAttendants.value = [];
    return;
  }

  syncLoggedAttendantSelection();
};

const createWalletRelation = async () => {
  if (!canSubmit.value || !props.contactId) return;

  const attendantId = effectiveAttendant.value?.id;
  const departmentId = selectedDepartmentId.value;
  const walletUrl = contactWalletUrl(props.contactId);

  try {
    submitLoading.value = true;

    await api.post(walletUrl, {
      attendant_id: attendantId,
      department_id: departmentId,
    });

    notify(
      {
        group: "success",
        title: "Sucesso",
        text: "Contato encarteirado com sucesso.",
      },
      4000,
    );

    emit("saved", {
      attendant_id: attendantId,
      department_id: departmentId,
    });
    closeModal();
  } catch (error) {
    notify(
      {
        group: "error",
        title: "Falhou",
        text:
          error?.response?.data?.message ||
          "Não foi possível encarteirar o contato.",
      },
      4000,
    );
    console.error("Erro ao encarteirar contato:", error);
  } finally {
    submitLoading.value = false;
  }
};

watch(
  () => props.isOpen,
  (isOpen) => {
    if (isOpen) {
      syncLockedDepartmentSelection();
      syncLoggedAttendantSelection();
      return;
    }

    resetForm();
  },
);

watch(
  () => [lockedDepartmentId.value, departmentStore.departments.length],
  () => {
    syncLockedDepartmentSelection();
  },
);

watch(
  () => [isSupervisor.value, props.loggedAttendantId, props.loggedAttendant],
  () => {
    syncLoggedAttendantSelection();
  },
);
</script>

<template>
  <SimpleModal
    :size="'md:w-[450px]'"
    :isOpen="isOpen"
    @update:isOpen="(value) => emit('update:isOpen', value)"
  >
    <template #header>
      <div class="wallet-modal-header-content">
        <div class="wallet-modal-header-icon">
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
          <h2 class="wallet-modal-title">Encarteirar contato</h2>
          <p class="wallet-modal-subtitle">
            {{
              hasLockedDepartment
                ? "Vincule o contato a um atendente"
                : "Vincule o contato a um atendente e departamento"
            }}
          </p>
        </div>
      </div>
    </template>

    <template #body>
      <section class="wallet-modal-body">
        <div v-if="hasLockedDepartment" class="wallet-info">
          <p class="wallet-info__title">Departamento fixo neste atendimento</p>
          <p class="wallet-info__text">
            O contato será encarteirado no departamento
            <strong>{{ lockedDepartmentName || "atual da conversa" }}</strong
            >. Neste fluxo, esse departamento não pode ser alterado.
          </p>
          <p class="wallet-info__text">
            Depois do vínculo, os atendimentos deste contato que entrarem nesse
            departamento serão direcionados apenas para o atendente selecionado
            na carteira.
          </p>
        </div>
        <div v-else-if="isManagerFlow" class="wallet-info">
          <p class="wallet-info__title">Departamento definido neste vínculo</p>
          <p class="wallet-info__text">
            Como este vínculo está sendo criado fora de um atendimento,
            selecione o departamento em que o contato será encarteirado.
          </p>
          <p class="wallet-info__text">
            Depois do vínculo, os atendimentos deste contato que entrarem nesse
            departamento, serão direcionados apenas para o atendente selecionado
            na carteira.
          </p>
        </div>
        <div class="wallet-select-group">
          <label v-if="!hasLockedDepartment" class="wallet-select-label">
            Departamento (com carteiras habilitadas)
          </label>

          <div
            v-if="hasLockedDepartment"
            class="wallet-locked-field bg-base-300"
          >
            <span class="wallet-locked-field__label"
              >Departamento da conversa</span
            >
            <strong class="wallet-locked-field__value">
              {{ lockedDepartmentName || "Departamento não encontrado" }}
            </strong>
          </div>

          <departSelect
            v-else
            :multiSelect="false"
            :preselect="false"
            variant="dropdown"
            maxHeight="300px"
            :disabledItems="departmentsWithoutWallets"
            :disabledReason="'Carteiras não habilitadas'"
            @depart="handleDepartmentSelect"
          />

          <div
            v-if="
              !hasLockedDepartment &&
              selectedDepartments.length > 0 &&
              enabledDepartmentsFilter.length === 0
            "
            class="wallet-warning"
          >
            O departamento selecionado não possui carteiras habilitadas.
          </div>
        </div>

        <div
          v-if="hasLockedDepartment && !lockedDepartmentHasWalletsEnabled"
          class="wallet-note"
        >
          O departamento atual desta conversa não suporta encarteiramento porque
          não possui carteiras habilitadas.
        </div>

        <div v-else class="wallet-select-group">
          <label
            v-if="isSupervisor && !attendantSelectDisabled"
            class="wallet-select-label"
            >Atendente responsável</label
          >

          <div v-if="!isSupervisor" class="wallet-locked-field bg-base-300">
            <span class="wallet-locked-field__label"
              >Atendente responsável</span
            >
            <strong class="wallet-locked-field__value">
              {{ loggedAttendantName }}
            </strong>
          </div>

          <div
            v-else-if="attendantSelectDisabled"
            class="wallet-locked-field wallet-locked-field--muted bg-base-300"
          >
            <p class="wallet-locked-field__value">
              Selecione um departamento para liberar os atendentes
            </p>
          </div>

          <attendantSelect
            v-else
            :multiSelect="false"
            :preselect="false"
            :department="enabledDepartmentsFilter"
            :disabledItems="disabledAttendants"
            :disabledReason="attendantDisabledReason"
            variant="dropdown"
            maxHeight="210px"
            @attend="handleAttendantSelect"
          />
        </div>

        <div
          v-if="showRoleRestrictionMessage"
          class="wallet-info wallet-info--neutral"
        >
          <p class="wallet-info__title">Permissões deste vínculo</p>
          <p class="wallet-info__text">{{ roleRestrictionMessage }}</p>
        </div>
      </section>
    </template>

    <template #footer>
      <div class="wallet-modal-footer w-full">
        <button
          class="wallet-btn wallet-btn-secondary"
          :disabled="submitLoading"
          @click="closeModal"
        >
          Cancelar
        </button>
        <button
          class="wallet-btn wallet-btn-primary"
          :disabled="!canSubmit || submitLoading"
          @click="createWalletRelation"
        >
          <div v-if="submitLoading" class="wallet-spinner wallet-spinner--sm" />
          <span v-else>Salvar vínculo</span>
        </button>
      </div>
    </template>
  </SimpleModal>
</template>

<style scoped>
.wallet-modal-header-content {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  text-align: left;
}

.wallet-modal-header-icon {
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
  color: var(--primary);
}

.wallet-modal-title {
  font-size: 1rem;
  line-height: 1.25rem;
  font-weight: 700;
}

.wallet-modal-subtitle {
  font-size: 0.78rem;
  line-height: 1rem;
  opacity: 0.75;
}

.wallet-modal-body {
  padding: 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
}

.wallet-select-group {
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
}

.wallet-info {
  border-radius: 0.75rem;
  padding: 0.5rem 0.65rem;
  text-align: start;
  background: rgb(8 145 178 / 0.08);
  border: 1px solid rgb(8 145 178 / 0.18);
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.wallet-info--neutral {
  background: rgb(148 163 184 / 0.08);
  border-color: rgb(148 163 184 / 0.18);
}

.wallet-info--neutral .wallet-info__title {
  opacity: 0.8;
}

.wallet-info__title {
  font-size: 0.78rem;
  line-height: 1rem;
  font-weight: 700;
  color: rgb(8 145 178);
}

.wallet-info__text,
.wallet-info__hint {
  font-size: 0.76rem;
  line-height: 1.1rem;
}

.wallet-info__hint {
  opacity: 0.8;
}

.wallet-select-label {
  font-size: 0.8rem;
  font-weight: 600;
  text-align: start;
  @apply ml-1;
}

.wallet-locked-field {
  border-radius: 0.75rem;
  padding: 0.6rem 0.85rem;
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  text-align: start;
}

.wallet-locked-field__label {
  font-size: 0.7rem;
  line-height: 0.95rem;
  opacity: 0.7;
}

.wallet-locked-field__value {
  font-size: 0.85rem;
  line-height: 1.1rem;
  @apply p-0.5;
}

.wallet-locked-field--muted {
  opacity: 0.75;
}

.wallet-loading-inline {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.78rem;
  opacity: 0.8;
}

.wallet-warning {
  border-radius: 0.6rem;
  padding: 0.65rem 0.75rem;
  font-size: 0.78rem;
  line-height: 1.1rem;
  text-align: start;
  color: rgb(234 179 8);
  background: rgb(234 179 8 / 0.08);
  border: 1px solid rgb(234 179 8 / 0.2);
}

.wallet-note {
  border-radius: 0.6rem;
  padding: 0.65rem 0.75rem;
  font-size: 0.78rem;
  line-height: 1.1rem;
  text-align: start;
  background: rgb(148 163 184 / 0.08);
  border: 1px solid rgb(148 163 184 / 0.18);
  color: rgb(226 232 240);
}

.wallet-modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.6rem;
}

.wallet-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.35rem;
  font-size: 0.75rem;
  line-height: 1rem;
  font-weight: 600;
  border-radius: 0.5rem;
  padding: 0.75rem 0.65rem;
  transition: all 140ms ease;
}

.wallet-btn:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.wallet-btn-secondary {
  @apply bg-base-300 text-current;
}

.wallet-btn-secondary:hover:not(:disabled) {
  @apply bg-base-100;
}

.wallet-btn-primary {
  color: white;
  background: linear-gradient(135deg, rgb(14 116 144), rgb(8 145 178));
}

.wallet-btn-primary:hover:not(:disabled) {
  filter: brightness(1.05);
}

.wallet-spinner {
  width: 1.25rem;
  height: 1.25rem;
  border: 2px solid rgb(148 163 184 / 0.3);
  border-top-color: rgb(14 116 144);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.wallet-spinner--sm {
  width: 1rem;
  height: 1rem;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 768px) {
  .wallet-modal-footer {
    width: 100%;
  }

  .wallet-btn {
    flex: 1;
  }
}
</style>
