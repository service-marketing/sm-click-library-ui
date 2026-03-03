<script setup>
import { computed } from "vue";
import MergeContactCard from "./contactCard.vue";

const props = defineProps({
  parentContact: {
    type: Object,
    required: true,
  },
  childContact: {
    type: Object,
    required: true,
  },
  mergeValidation: {
    type: Object,
    required: true,
  },
  mergePreview: {
    type: Object,
    default: null,
  },
  confirmed: {
    type: Boolean,
    default: false,
  },
  loading: {
    type: Boolean,
    default: false,
  },
  error: {
    type: String,
    default: "",
  },
});

const emit = defineEmits(["update:confirmed"]);

const normalizeText = (value) => (value ?? "").toString().trim();
const normalizeDigits = (value) => normalizeText(value).replace(/\D/g, "");

const formatPhoneNumber = (phone) => {
  const digits = normalizeDigits(phone);
  if (!digits) return null;
  if (digits.length === 11)
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  if (digits.length === 10)
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  if (digits.length === 13 && digits.startsWith("55"))
    return `+55 (${digits.slice(2, 4)}) ${digits.slice(4, 9)}-${digits.slice(9)}`;
  return phone;
};

const previewContact = computed(() => {
  const base = props.mergePreview || {
    name: props.parentContact?.name || props.childContact?.name,
    telephone: props.parentContact?.telephone || props.childContact?.telephone,
    whatsapp_id:
      props.parentContact?.whatsapp_id || props.childContact?.whatsapp_id,
    instagram_user_name:
      props.parentContact?.instagram_user_name ||
      props.childContact?.instagram_user_name,
  };

  // Sempre garantir que a foto seja incluída (mergePreview pode não ter)
  return {
    ...base,
    photo:
      base.photo || props.parentContact?.photo || props.childContact?.photo,
  };
});

const fieldComparisons = computed(() => {
  const parent = props.parentContact || {};
  const child = props.childContact || {};
  const preview = previewContact.value || {};

  const fields = [
    { key: "name", label: "Nome" },
    { key: "telephone", label: "Telefone", format: formatPhoneNumber },
    { key: "instagram_user_name", label: "Instagram" },
  ];

  return fields
    .map((field) => {
      const parentVal = normalizeText(parent[field.key]);
      const childVal = normalizeText(child[field.key]);
      const finalVal = normalizeText(preview[field.key]);

      const parentNorm =
        field.key === "telephone"
          ? normalizeDigits(parentVal)
          : parentVal.toLowerCase();
      const childNorm =
        field.key === "telephone"
          ? normalizeDigits(childVal)
          : childVal.toLowerCase();
      const finalNorm =
        field.key === "telephone"
          ? normalizeDigits(finalVal)
          : finalVal.toLowerCase();

      const fromParent = parentNorm === finalNorm && parentVal;
      const fromChild = childNorm === finalNorm && childVal && !fromParent;
      const discarded = fromParent ? childVal : fromChild ? parentVal : null;

      const formatFn = field.format || ((v) => v);

      return {
        key: field.key,
        label: field.label,
        finalValue: finalVal ? formatFn(finalVal) : null,
        discardedValue:
          discarded && discarded !== finalVal ? formatFn(discarded) : null,
        fromChild,
        hasChange: parentNorm !== childNorm,
      };
    })
    .filter((f) => f.hasChange);
});

const handleConfirmChange = (event) => {
  emit("update:confirmed", event.target.checked);
};
</script>

<template>
  <div class="confirmation-panel">
    <!-- Contato que será REMOVIDO -->
    <section class="contact-section contact-section--remove">
      <header class="section-header section-header--remove">
        <div class="section-header-content">
          <div class="section-icon section-icon--remove">
            <svg class="size-4" viewBox="0 0 20 20" fill="currentColor">
              <path
                fill-rule="evenodd"
                d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                clip-rule="evenodd"
              />
            </svg>
          </div>
          <div>
            <span class="section-title">Contato duplicado</span>
            <span class="section-subtitle"
              >Este contato será excluído permanentemente</span
            >
          </div>
        </div>
      </header>
      <div class="contact-card-wrapper">
        <MergeContactCard
          :contact="childContact"
          size="medium"
          variant="danger"
        />
      </div>
    </section>

    <!-- Seta de direção -->
    <div class="merge-direction">
      <div class="merge-direction-line"></div>
      <div class="merge-direction-icon">
        <svg
          class="size-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2.5"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M19 14l-7 7m0 0l-7-7m7 7V3"
          />
        </svg>
      </div>
      <div class="merge-direction-line"></div>
    </div>

    <!-- Resultado Final -->
    <section class="contact-section contact-section--result">
      <header class="section-header section-header--result">
        <div class="section-header-content">
          <div class="section-icon section-icon--result">
            <svg class="size-4" viewBox="0 0 20 20" fill="currentColor">
              <path
                fill-rule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clip-rule="evenodd"
              />
            </svg>
          </div>
          <div>
            <span class="section-title">Resultado da mesclagem</span>
            <span class="section-subtitle"
              >Este será o contato final após a operação</span
            >
          </div>
        </div>
        <span v-if="fieldComparisons.length > 0" class="changes-badge">
          {{ fieldComparisons.length }} alteraç{{
            fieldComparisons.length > 1 ? "ões" : "ão"
          }}
        </span>
      </header>
      <div class="contact-card-wrapper contact-card-wrapper--result">
        <MergeContactCard
          :contact="previewContact"
          variant="primary"
          :show-details="true"
        />
      </div>

      <!-- Alterações detectadas -->
      <div v-if="fieldComparisons.length > 0" class="changes-list">
        <div
          v-for="field in fieldComparisons"
          :key="field.key"
          class="change-item"
        >
          <span class="change-label">{{ field.label }}</span>
          <div class="change-values">
            <span class="change-kept">
              <svg class="size-3" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fill-rule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clip-rule="evenodd"
                />
              </svg>
              {{ field.finalValue || "—" }}
              <span v-if="field.fromChild" class="incorporated-tag"
                >incorporado</span
              >
            </span>
            <span v-if="field.discardedValue" class="change-discarded">
              <svg class="size-3" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fill-rule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clip-rule="evenodd"
                />
              </svg>
              <span class="discarded-text">{{ field.discardedValue }}</span>
            </span>
          </div>
        </div>
      </div>
    </section>

    <!-- Checkbox de confirmação -->
    <label
      class="confirm-checkbox"
      :class="{
        'confirm-checkbox--checked': confirmed,
        'confirm-checkbox--disabled': loading,
      }"
    >
      <input
        type="checkbox"
        :checked="confirmed"
        :disabled="loading"
        class="sr-only"
        @change="handleConfirmChange"
      />
      <div class="checkbox-box">
        <svg
          v-if="confirmed"
          class="size-3.5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="3"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M5 13l4 4L19 7"
          />
        </svg>
      </div>
      <div class="checkbox-content">
        <span class="checkbox-title"
          >Confirmo que entendi as consequências</span
        >
        <span class="checkbox-desc"
          >Esta ação é <strong>irreversível</strong>. O contato duplicado será
          excluído permanentemente.</span
        >
      </div>
    </label>

    <!-- Erro -->
    <div v-if="error" class="error-message">
      <svg class="size-4" viewBox="0 0 20 20" fill="currentColor">
        <path
          fill-rule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
          clip-rule="evenodd"
        />
      </svg>
      <span>{{ error }}</span>
    </div>
  </div>
</template>

<style scoped>
.confirmation-panel {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

/* Seções de contato */
.contact-section {
  border-radius: 0.75rem;
  overflow: hidden;
  @apply bg-base-300;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.contact-section--remove {
  border: 1px solid rgba(239, 68, 68, 0.2);
}

.contact-section--result {
  border: 1px solid rgba(34, 197, 94, 0.2);
  /* box-shadow: 
    0 4px 16px rgba(34, 197, 94, 0.15),
    0 2px 8px rgba(0, 0, 0, 0.1); */
}

.section-header {
  padding: 0.5rem 0.75rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
}

.section-header--remove {
  background: linear-gradient(
    135deg,
    rgba(239, 68, 68, 0.08),
    rgba(239, 68, 68, 0.03)
  );
  border-bottom: 1px solid rgba(239, 68, 68, 0.15);
}

.section-header--result {
  background: linear-gradient(
    135deg,
    rgba(34, 197, 94, 0.1),
    rgba(34, 197, 94, 0.04)
  );
  border-bottom: 1px solid rgba(34, 197, 94, 0.2);
}

.section-header-content {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.section-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border-radius: 0.5rem;
  flex-shrink: 0;
}

.section-icon--remove {
  background: linear-gradient(
    135deg,
    rgba(239, 68, 68, 0.2),
    rgba(220, 38, 38, 0.15)
  );
  color: rgb(248, 113, 113);
}

.section-icon--result {
  background: linear-gradient(
    135deg,
    rgba(34, 197, 94, 0.2),
    rgba(22, 163, 74, 0.15)
  );
  color: rgb(74, 222, 128);
  @apply dark:bg-green-300/30 dark:text-green-600;
}

.section-title {
  display: block;
  font-size: 0.8rem;
  font-weight: 600;
  text-align: start;
}

.section-subtitle {
  display: block;
  font-size: 0.7rem;
  opacity: 0.6;
  margin-top: 0.125rem;
}

.changes-badge {
  font-size: 0.65rem;
  font-weight: 600;
  padding: 0.25rem 0.625rem;
  border-radius: 9999px;
  background: rgba(14, 116, 144, 0.15);
  color: rgb(34, 211, 238);
  border: 1px solid rgba(14, 116, 144, 0.3);
  flex-shrink: 0;
  @apply dark:text-sky-700 dark:bg-sky-300/30;
}

/* .contact-card-wrapper {
  padding: 0.5rem;
} */

/* .contact-card-wrapper--result {
  padding: 0.625rem;
  background: linear-gradient(180deg, transparent, rgba(34, 197, 94, 0.03));
} */

/* Seta de direção */
.merge-direction {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.375rem 0;
}

.merge-direction-line {
  flex: 1;
  max-width: 4rem;
  height: 1px;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(148, 163, 184, 0.25),
    transparent
  );
  @apply dark:bg-gray-500/50;
}

.merge-direction-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.75rem;
  height: 1.75rem;
  border-radius: 50%;
  background: linear-gradient(
    135deg,
    rgba(14, 116, 144, 0.15),
    rgba(8, 145, 178, 0.1)
  );
  color: rgb(34, 211, 238);
  border: 1px solid rgba(14, 116, 144, 0.3);
  @apply dark:bg-sky-300/30 dark:text-sky-700;
}

/* Lista de alterações */
.changes-list {
  padding: 0.625rem 0.75rem;
  border-top: 1px solid rgba(148, 163, 184, 0.1);
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.change-item {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.75rem;
  font-size: 0.75rem;
}

.change-label {
  font-weight: 600;
  opacity: 0.7;
  text-transform: uppercase;
  font-size: 0.65rem;
  letter-spacing: 0.02em;
  padding-top: 0.125rem;
  flex-shrink: 0;
}

.change-values {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.25rem;
  min-width: 0;
  flex: 1;
}

.change-kept {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  color: rgb(74, 222, 128);
}

.change-kept svg {
  flex-shrink: 0;
}

.incorporated-tag {
  font-size: 0.6rem;
  font-weight: 600;
  text-transform: uppercase;
  padding: 0.125rem 0.375rem;
  border-radius: 0.25rem;
  background: rgba(34, 197, 94, 0.15);
  color: rgb(74, 222, 128);
}

.change-discarded {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  color: rgba(248, 113, 113, 0.7);
}

.change-discarded svg {
  flex-shrink: 0;
}

.discarded-text {
  text-decoration: line-through;
  opacity: 0.7;
}

/* Checkbox de confirmação */
.confirm-checkbox {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  border-radius: 0.625rem;
  cursor: pointer;
  transition: all 150ms ease;
  border: 1px solid rgba(245, 158, 11, 0.3);
  background: rgba(245, 158, 11, 0.08);
}

.confirm-checkbox:hover:not(.confirm-checkbox--disabled) {
  border-color: rgba(245, 158, 11, 0.5);
}

.confirm-checkbox--checked {
  border-color: rgba(34, 197, 94, 0.4);
  background: rgba(34, 197, 94, 0.08);
}

.confirm-checkbox--checked:hover {
  border-color: rgba(34, 197, 94, 0.6);
}

.confirm-checkbox--disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.checkbox-box {
  flex-shrink: 0;
  width: 1.25rem;
  height: 1.25rem;
  border-radius: 0.25rem;
  border: 2px solid rgba(245, 158, 11, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 150ms ease;
  margin-top: 0.125rem;
}

.confirm-checkbox--checked .checkbox-box {
  background: rgb(34, 197, 94);
  border-color: rgb(34, 197, 94);
  color: white;
}

.checkbox-content {
  flex: 1;
  min-width: 0;
}

.checkbox-title {
  display: block;
  font-size: 0.8rem;
  font-weight: 600;
}

.checkbox-desc {
  display: block;
  font-size: 0.7rem;
  opacity: 0.8;
  margin-top: 0.25rem;
  line-height: 1.4;
}

.checkbox-desc strong {
  color: rgb(248, 113, 113);
  font-weight: 600;
}

/* Mensagem de erro */
.error-message {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 0.75rem;
  border-radius: 0.5rem;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  color: rgb(248, 113, 113);
  font-size: 0.75rem;
}

.error-message svg {
  flex-shrink: 0;
}
</style>
