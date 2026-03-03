<script setup>
import { computed, watchEffect } from "vue";

const props = defineProps({
  parentContact: {
    type: Object,
    required: true,
  },
  childContact: {
    type: Object,
    required: true,
  },
  previewContact: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(["changes-count"]);

const normalizeText = (value) => (value ?? "").toString().trim();
const normalizeDigits = (value) => normalizeText(value).replace(/\D/g, "");

const formatPhoneNumber = (phone) => {
  const digits = normalizeDigits(phone);
  if (!digits) return null;
  if (digits.length === 11) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  }
  if (digits.length === 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }
  if (digits.length === 13 && digits.startsWith("55")) {
    return `+55 (${digits.slice(2, 4)}) ${digits.slice(4, 9)}-${digits.slice(9)}`;
  }
  return phone;
};

const fieldComparisons = computed(() => {
  const parent = props.parentContact || {};
  const child = props.childContact || {};
  const preview = props.previewContact || {};

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

      const formatFn = field.format || ((value) => value);

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
    .filter((field) => field.hasChange);
});

watchEffect(() => {
  emit("changes-count", fieldComparisons.value.length);
});
</script>

<template>
  <div v-if="fieldComparisons.length > 0" class="changes-list">
    <div v-for="field in fieldComparisons" :key="field.key" class="change-item">
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
</template>
