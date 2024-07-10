<script setup>
import { defineProps, defineEmits } from "vue";

const props = defineProps({
  isOpen: Boolean,
  default: false,
});

const emits = defineEmits(["update:isOpen"]);

const toggleModal = () => {
  emits("update:isOpen", !props.isOpen);
};
</script>
<template>
  <div v-if="isOpen" class="modal_head">
    <div class="modal-overlay absolute h-full bg-gray-600 w-full opacity-70" />
    <div class="modal_responsive">
      <div
        class="flex min-h-full items-center justify-center text-center sm:p-0"
      >
        <div class="modal_size lg:w-2/6">
          <!-- Modal content -->
          <div class="modal_background">
            <!-- Modal header -->
            <div class="modal_tittle text-current">
              <slot name="header" />

              <button
                @click="toggleModal"
                class="modal_close_button"
                data-modal-toggle="editUserModal"
              >
                <svg
                  class="h-5 w-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fill-rule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clip-rule="evenodd"
                  />
                </svg>
              </button>
            </div>
            <!-- Modal body -->
            <div class="p-4">
              <div class="w-full">
                <label class="block">
                  <slot name="body" />
                </label>
              </div>
            </div>
            <!-- Modal footer -->
            <div class="modal_end_button">
              <slot name="footer" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>