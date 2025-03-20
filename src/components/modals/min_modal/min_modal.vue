<script setup>
const emit = defineEmits(["close"]);
defineProps({
  defineWidth: {
    type: String,
    default: "max-width-md",
  },
});

const closeModal = () => {
  emit("close");
};
</script>

<template>
  <div class="min_modal">
    <div class="modal_overlay" @click="closeModal"></div>
  </div>

  <div class="modal_container">
    <div :class="['modal_content ', defineWidth]">
      <div class="modal_box">
        <div class="modal_header">
          <slot name="header" />
          <button class="modal_close" @click="closeModal()">
            <svg
              class="modal_close_icon"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 14 14"
            >
              <path
                stroke="currentColor"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
              />
            </svg>
          </button>
        </div>
        <div>
          <slot name="body" />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.min_modal {
  position: fixed;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
  animation: modalani 0.1s ease-out;
  transition: opacity 0.2s ease-in-out;
}

.modal_overlay {
  position: absolute;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(2px);
}

.modal_container {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: calc(100% - 1rem);
  max-height: 100%;
  z-index: 50;
}

.modal_content {
  position: relative;
  padding: 16px;
}

.modal_box {
  position: relative;
  background: #111b21;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.modal_header {
  display: flex;
  justify-content: space-between;
  padding: 10px;
}

.modal_close {
  background: transparent;
  border: none;
  cursor: pointer;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal_close_icon {
  width: 12px;
  height: 12px;
  color: #9ca3af;
}

.modal_close:hover {
  background: #e5e7eb;
  border-radius: 8px;
}

@keyframes modalani {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
</style>
