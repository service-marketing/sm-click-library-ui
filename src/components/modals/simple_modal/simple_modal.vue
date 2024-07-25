<script setup>
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
  <div v-if="isOpen" class="modal_head_lib">
    <div
      class="modal-overlay_lib absolute h-full bg-gray-600 w-full opacity-70"
    />
    <div class="modal_responsive_lib">
      <div
        class="flex min-h-full items-center justify-center text-center sm:p-0"
      >
        <div class="modal_size_lib lg:w-2/6">
          <!-- Modal content -->
          <div class="modal_background_lib">
            <!-- Modal header -->
            <div class="modal_tittle_lib text-current">
              <slot name="header" />

              <button
                @click="toggleModal"
                class="modal_close_button_lib"
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
            <div class="modal_end_button_lib sm">
              <slot name="footer" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* simple_modal CSS  */
.modal_head_lib {
  @apply my_modal_lib backdrop-blur-[2px] z-50 fixed w-full h-full top-0 left-0 flex items-center justify-center;
}

.my_modal_lib {
  animation: 0.1s ease-out 0s 1 modalani;
  transition: opacity 0.2s ease-in-out;
}

.modal-overlay_lib {
  @apply absolute h-full w-full bg-black opacity-[0.2];
}

.modal_responsive_lib {
  @apply fixed z-10 inset-0 overflow-y-auto scrollbar scrollbar-thumb-gray-900 scrollbar-track-gray-300;
}

.modal_size_lib {
  @apply z-50 w-full md:w-1/2 xl:w-1/3 shadow rounded-2xl shadow-black;
}

.modal_background_lib {
  @apply relative rounded-2xl backdrop-blur-lg;
}

.modal_tittle_lib {
  @apply flex text-current uppercase justify-between  items-center p-3 py-3 rounded-t-2xl ;
}

.modal_end_button_lib {
  @apply flex justify-end p-2 space-x-2 rounded-b-2xl;
}

.modal_close_button_lib {
  @apply hover:scale-105 text-white duration-300  rounded-lg text-sm p-1.5 ml-auto inline-flex items-center  hover:text-white;
}
</style>