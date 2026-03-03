<script setup>
import MergeConfirmCheckboxSection from "./sections/MergeConfirmCheckboxSection.vue";
import MergeDirectionSection from "./sections/MergeDirectionSection.vue";
import MergeErrorSection from "./sections/MergeErrorSection.vue";
import MergeResultSection from "./sections/MergeResultSection.vue";
import RemoveContactSection from "./sections/RemoveContactSection.vue";

defineProps({
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

const handleConfirmChange = (value) => {
  emit("update:confirmed", value);
};
</script>

<template>
  <div class="confirmation-panel">
    <RemoveContactSection :child-contact="childContact" />
    <MergeDirectionSection />
    <MergeResultSection
      :parent-contact="parentContact"
      :child-contact="childContact"
      :merge-preview="mergePreview"
    />
    <MergeConfirmCheckboxSection
      :confirmed="confirmed"
      :loading="loading"
      @update:confirmed="handleConfirmChange"
    />
    <MergeErrorSection :error="error" />
  </div>
</template>

<style src="./sections/mergeConfirmationPanel.sections.css"></style>
