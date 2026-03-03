<script setup>
import MergeContactCard from "../contactCard.vue";

defineProps({
  childContact: {
    type: Object,
    required: true,
  },
});
</script>

<template>
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
</template>
