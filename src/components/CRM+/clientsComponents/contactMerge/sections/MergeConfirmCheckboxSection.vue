<script setup>
defineProps({
  confirmed: {
    type: Boolean,
    default: false,
  },
  loading: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["update:confirmed"]);

const handleConfirmChange = (event) => {
  emit("update:confirmed", event.target.checked);
};
</script>

<template>
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
      <span class="checkbox-title">Confirmo que entendi as consequências</span>
      <span class="checkbox-desc">
        Esta ação é <strong>irreversível</strong>. O contato selecionado será
        excluído permanentemente.
      </span>
    </div>
  </label>
</template>
