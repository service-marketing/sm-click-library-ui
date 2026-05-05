<template>
  <!-- Edit / View -->
  <button
    @click="isReminder ? $emit('edit-reminder', ev) : $emit('open-message', ev)"
    :class="`cyber-button cyber-button--${size} cyber-button--primary`"
    :aria-label="size === 'xs' ? (isReminder ? 'Editar lembrete' : 'Editar mensagem') : undefined"
  >
    <template v-if="size === 'xs'">
      <svg
        v-if="ev?.status === true"
        class="icon-4"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
      >
        <path
          fill="currentColor"
          fill-rule="evenodd"
          d="M14 4.182A4.136 4.136 0 0 1 16.9 3c1.087 0 2.13.425 2.899 1.182A4.01 4.01 0 0 1 21 7.037c0 1.068-.43 2.092-1.194 2.849L18.5 11.214l-5.8-5.71 1.287-1.31.012-.012Zm-2.717 2.763L6.186 12.13l2.175 2.141 5.063-5.218-2.141-2.108Zm-6.25 6.886-1.98 5.849a.992.992 0 0 0 .245 1.026 1.03 1.03 0 0 0 1.043.242L10.282 19l-5.25-5.168Zm6.954 4.01 5.096-5.186-2.218-2.183-5.063 5.218 2.185 2.15Z"
          clip-rule="evenodd"
        />
      </svg>
      <svg
        v-else
        class="icon-4"
        aria-hidden="true"
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        fill="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          fill-rule="evenodd"
          d="M4.998 7.78C6.729 6.345 9.198 5 12 5c2.802 0 5.27 1.345 7.002 2.78a12.713 12.713 0 0 1 2.096 2.183c.253.344.465.682.618.997.14.286.284.658.284 1.04s-.145.754-.284 1.04a6.6 6.6 0 0 1-.618.997 12.712 12.712 0 0 1-2.096 2.183C17.271 17.655 14.802 19 12 19c-2.802 0-5.27-1.345-7.002-2.78a12.712 12.712 0 0 1-2.096-2.183 6.6 6.6 0 0 1-.618-.997C2.144 12.754 2 12.382 2 12s.145-.754.284-1.04c.153-.315.365-.653.618-.997A12.714 12.714 0 0 1 4.998 7.78ZM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"
          clip-rule="evenodd"
        />
      </svg>
    </template>
    <template v-else>{{ ev?.status === true ? "Editar" : "Visualizar" }}</template>
  </button>

  <!-- Delete -->
  <button
    @click="$emit('delete-message', ev)"
    :class="`cyber-button cyber-button--${size} cyber-button--danger`"
    aria-label="Apagar evento"
    :disabled="ev.deleteLoading || !ev.status"
  >
    <div v-if="ev.deleteLoading" class="loading-spinner"></div>
    <svg
      v-else-if="size === 'xs'"
      class="icon-4"
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      fill="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        fill-rule="evenodd"
        d="M8.586 2.586A2 2 0 0 1 10 2h4a2 2 0 0 1 2 2v2h3a1 1 0 1 1 0 2v12a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V8a1 1 0 0 1 0-2h3V4a2 2 0 0 1 .586-1.414ZM10 6h4V4h-4v2Zm1 4a1 1 0 1 0-2 0v8a1 1 0 1 0 2 0v-8Zm4 0a1 1 0 1 0-2 0v8a1 1 0 1 0 2 0v-8Z"
        clip-rule="evenodd"
      />
    </svg>
    <template v-else>Apagar</template>
  </button>

  <!-- Open chat -->
  <button
    :disabled="!isSched"
    :class="`disabled:opacity-90 cyber-button cyber-button--${size} cyber-button--accent`"
    @click="$emit('open-chat', ev)"
    :aria-label="size === 'xs' ? 'Abrir conversa' : undefined"
    :type="size === 'sm' ? 'button' : undefined"
  >
    <svg
      v-if="size === 'xs'"
      class="icon-4"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
    >
      <path
        fill="currentColor"
        fill-rule="evenodd"
        d="M3.559 4.544c.355-.35.834-.544 1.33-.544H19.11c.496 0 .975.194 1.33.544.356.35.559.829.559 1.331v9.25c0 .502-.203.981-.559 1.331-.355.35-.834.544-1.33.544H15.5l-2.7 3.6a1 1 0 0 1-1.6 0L8.5 17H4.889c-.496 0-.975-.194-1.33-.544A1.868 1.868 0 0 1 3 15.125v-9.25c0-.502.203-.981.559-1.331ZM7.556 7.5a1 1 0 1 0 0 2h8a1 1 0 0 0 0-2h-8Zm0 3.5a1 1 0 1 0 0 2H12a1 1 0 1 0 0-2H7.556Z"
        clip-rule="evenodd"
      />
    </svg>
    <template v-else>Abrir conversa</template>
  </button>
</template>

<script setup>
defineProps({
  ev: { type: Object, required: true },
  isSched: { type: Boolean, required: true },
  isReminder: { type: Boolean, required: true },
  size: { type: String, default: "xs" }, // 'xs' | 'sm'
});

defineEmits(["open-message", "open-chat", "delete-message", "edit-reminder"]);
</script>

<style src="../../utils/calendarTheme.css"></style>
<style src="./styles.css"></style>
