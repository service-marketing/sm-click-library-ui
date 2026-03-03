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

const showAllTags = ref(false);

const tagsComparison = computed(() => {
  const parentTags = props.parentContact?.tags || [];
  const childTags = props.childContact?.tags || [];

  const parentIds = new Set(parentTags.map((tag) => tag.id));
  const keptFromParent = parentTags;
  const incorporatedFromChild = childTags.filter(
    (tag) => !parentIds.has(tag.id),
  );
  const hasChanges = incorporatedFromChild.length > 0;
  const total = parentTags.length + incorporatedFromChild.length;

  return {
    hasChanges,
    keptFromParent,
    incorporatedFromChild,
    total,
  };
});

watchEffect(() => {
  emit("changes-count", tagsComparison.value.hasChanges ? 1 : 0);
});
</script>

<template>
  <div v-if="tagsComparison.hasChanges" class="array-changes-section">
    <div class="array-changes-header">
      <svg class="size-3.5" viewBox="0 0 20 20" fill="currentColor">
        <path
          fill-rule="evenodd"
          d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a3 3 0 013-3h5c.256 0 .512.098.707.293l7 7zM5 6a1 1 0 100-2 1 1 0 000 2z"
          clip-rule="evenodd"
        />
      </svg>
      <span class="array-changes-title">Etiquetas</span>
      <span class="array-changes-count">
        +{{ tagsComparison.incorporatedFromChild.length }} incorporada{{
          tagsComparison.incorporatedFromChild.length > 1 ? "s" : ""
        }}
      </span>
      <button
        class="expand-button"
        type="button"
        @click="showAllTags = !showAllTags"
      >
        {{ showAllTags ? "Ocultar" : `Ver todas (${tagsComparison.total})` }}
        <svg
          class="size-3"
          :class="{ 'rotate-180': showAllTags }"
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

    <div class="tags-list">
      <span
        v-for="tag in tagsComparison.incorporatedFromChild"
        :key="tag.id"
        class="tag-item tag-item--incorporated"
        :style="{
          backgroundColor: `${tag.color}20`,
          borderColor: `${tag.color}40`,
        }"
      >
        <span class="tag-color" :style="{ backgroundColor: tag.color }"></span>
        <span class="tag-name">{{ tag.name }}</span>
        <span class="incorporated-badge">+</span>
      </span>

      <template v-if="showAllTags">
        <span
          v-for="tag in tagsComparison.keptFromParent"
          :key="tag.id"
          class="tag-item"
          :style="{
            backgroundColor: `${tag.color}20`,
            borderColor: `${tag.color}40`,
          }"
        >
          <span
            class="tag-color"
            :style="{ backgroundColor: tag.color }"
          ></span>
          <span class="tag-name">{{ tag.name }}</span>
        </span>
      </template>
    </div>
  </div>
</template>
