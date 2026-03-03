<script setup>
import { computed, ref } from "vue";
import MergeContactCard from "../contactCard.vue";
import FieldChangesSection from "./FieldChangesSection.vue";
import ProductsChangesSection from "./ProductsChangesSection.vue";
import SegmentationChangesSection from "./SegmentationChangesSection.vue";
import TagsChangesSection from "./TagsChangesSection.vue";

const props = defineProps({
  parentContact: {
    type: Object,
    required: true,
  },
  childContact: {
    type: Object,
    required: true,
  },
  mergePreview: {
    type: Object,
    default: null,
  },
});

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

  return {
    ...base,
    photo:
      base.photo || props.parentContact?.photo || props.childContact?.photo,
  };
});

const fieldChangesCount = ref(0);
const tagsChangesCount = ref(0);
const productsChangesCount = ref(0);
const segmentationChangesCount = ref(0);

const totalChanges = computed(() => {
  return (
    fieldChangesCount.value +
    tagsChangesCount.value +
    productsChangesCount.value +
    segmentationChangesCount.value
  );
});
</script>

<template>
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
          <span class="section-subtitle">
            Este será o contato final após a operação
          </span>
        </div>
      </div>
      <span v-if="totalChanges > 0" class="changes-badge">
        {{ totalChanges }} alteraç{{ totalChanges > 1 ? "ões" : "ão" }}
      </span>
    </header>

    <div class="contact-card-wrapper contact-card-wrapper--result">
      <MergeContactCard
        :contact="previewContact"
        variant="primary"
        :show-details="true"
      />
    </div>

    <FieldChangesSection
      :parent-contact="parentContact"
      :child-contact="childContact"
      :preview-contact="previewContact"
      @changes-count="fieldChangesCount = $event"
    />
    <TagsChangesSection
      :parent-contact="parentContact"
      :child-contact="childContact"
      @changes-count="tagsChangesCount = $event"
    />
    <ProductsChangesSection
      :parent-contact="parentContact"
      :child-contact="childContact"
      @changes-count="productsChangesCount = $event"
    />
    <SegmentationChangesSection
      :parent-contact="parentContact"
      :child-contact="childContact"
      @changes-count="segmentationChangesCount = $event"
    />
  </section>
</template>
