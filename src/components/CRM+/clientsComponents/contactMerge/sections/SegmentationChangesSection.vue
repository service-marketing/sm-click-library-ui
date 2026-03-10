<script setup>
import { computed, ref, watchEffect } from "vue";

const props = defineProps({
  parentContact: {
    type: Object,
    required: true,
  },
  childContact: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(["changes-count"]);

const showSegmentationChanges = ref(false);

const normalizeText = (value) => (value ?? "").toString().trim();

const isEmptySegmentationValue = (value) =>
  value === null || value === undefined || normalizeText(value) === "";

const normalizeSegmentationComparableValue = (field) => {
  if (!field) return "";

  if (field.type === "bool") {
    if (typeof field.content === "boolean") {
      return field.content ? "true" : "false";
    }

    const normalized = normalizeText(field.content).toLowerCase();
    if (!normalized) return "";

    return normalized === "true" ? "true" : "false";
  }

  if (field.type === "list") {
    if (Array.isArray(field.content)) {
      return field.content.map((item) => normalizeText(item)).join("|");
    }
  }

  return normalizeText(field.content);
};

const formatSegmentationValue = (field) => {
  if (isEmptySegmentationValue(field?.content)) {
    return "—";
  }

  if (field.type === "bool") {
    return normalizeSegmentationComparableValue(field) === "true"
      ? "Verdadeiro"
      : "Falso";
  }
  if (field.type === "list") {
    return field.content;
  }
  return field.content || "—";
};

const segmentationComparison = computed(() => {
  const parentFields = props.parentContact?.segmentation_fields || [];
  const childFields = props.childContact?.segmentation_fields || [];

  const parentMap = new Map(parentFields.map((field) => [field.id, field]));
  const childMap = new Map(childFields.map((field) => [field.id, field]));
  const allFieldIds = new Set([...parentMap.keys(), ...childMap.keys()]);

  const fieldChanges = [];

  allFieldIds.forEach((fieldId) => {
    const parentField = parentMap.get(fieldId);
    const childField = childMap.get(fieldId);

    const parentComparable = normalizeSegmentationComparableValue(parentField);
    const childComparable = normalizeSegmentationComparableValue(childField);
    const parentHasValue = !isEmptySegmentationValue(parentField?.content);
    const childHasValue = !isEmptySegmentationValue(childField?.content);

    if (
      parentComparable !== childComparable &&
      (parentHasValue || childHasValue)
    ) {
      const finalField =
        parentHasValue || !childHasValue ? parentField : childField;
      const incorporatedFromChild = !parentHasValue && childHasValue;

      const finalValue = formatSegmentationValue(finalField);
      const discardedField = incorporatedFromChild ? parentField : childField;
      const discardedValue =
        discardedField &&
        !isEmptySegmentationValue(discardedField.content) &&
        normalizeSegmentationComparableValue(discardedField) !==
          normalizeSegmentationComparableValue(finalField)
          ? formatSegmentationValue(discardedField)
          : null;

      fieldChanges.push({
        id: finalField.id,
        name: finalField.name,
        finalValue,
        discardedValue,
        incorporatedFromChild: Boolean(incorporatedFromChild),
      });
    }
  });

  return {
    hasChanges: fieldChanges.length > 0,
    changes: fieldChanges,
  };
});

watchEffect(() => {
  emit("changes-count", segmentationComparison.value.changes.length);
});
</script>

<template>
  <div v-if="segmentationComparison.hasChanges" class="array-changes-section">
    <div class="array-changes-header">
      <svg class="size-3.5" viewBox="0 0 20 20" fill="currentColor">
        <path
          fill-rule="evenodd"
          d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
          clip-rule="evenodd"
        />
      </svg>
      <span class="array-changes-title">Campos Personalizados</span>
      <span class="array-changes-count">
        {{ segmentationComparison.changes.length }} alteraç{{
          segmentationComparison.changes.length > 1 ? "ões" : "ão"
        }}
      </span>
      <button
        class="expand-button"
        type="button"
        @click="showSegmentationChanges = !showSegmentationChanges"
      >
        {{ showSegmentationChanges ? "Ocultar" : "Ver detalhes" }}
        <svg
          class="size-3"
          :class="{ 'rotate-180': showSegmentationChanges }"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fill-rule="evenodd"
            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
            clip-rule="evenodd"
          />
        </svg>
      </button>
    </div>

    <div v-if="showSegmentationChanges" class="segmentation-changes-list">
      <div
        v-for="field in segmentationComparison.changes"
        :key="field.id"
        class="segmentation-change-item"
      >
        <span class="segmentation-field-name">{{ field.name }}</span>
        <div class="segmentation-change-values">
          <span class="change-kept">
            <svg class="size-3" viewBox="0 0 20 20" fill="currentColor">
              <path
                fill-rule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clip-rule="evenodd"
              />
            </svg>
            {{ field.finalValue }}
            <span v-if="field.incorporatedFromChild" class="incorporated-tag">
              incorporado
            </span>
          </span>
          <span v-if="field.discardedValue" class="change-discarded">
            <svg class="size-3" viewBox="0 0 20 20" fill="currentColor">
              <path
                fill-rule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clip-rule="evenodd"
              />
            </svg>
            <span class="discarded-text">{{
              field.discardedValue || "—"
            }}</span>
          </span>
        </div>
      </div>
    </div>
  </div>
</template>
