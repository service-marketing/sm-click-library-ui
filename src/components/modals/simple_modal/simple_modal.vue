<script setup>
const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false,
  },
  header: {
    type: Object,
    default: {
      title: "title",
      svg: "<svg class='w-5 mr-2 text-primary inline-block' aria-hidden='true' xmlns='http://www.w3.org/2000/svg' fill='currentColor' viewBox='0 0 24 24'> <path d='M18 3h-5.7a2 2 0 0 0-1.4.6L3.6 11a2 2 0 0 0 0 2.8l6.6 6.6a2 2 0 0 0 2.8 0l7.4-7.5a2 2 0 0 0 .6-1.4V6a3 3 0 0 0-3-3Zm-2.4 6.4a1 1 0 1 1 0-2 1 1 0 0 1 0 2Z' /> </svg>",
    },
  },
});

const emits = defineEmits(["update:isOpen"]);

const toggleModal = () => {
  emits("update:isOpen", !props.isOpen);
};
</script>
<template>
  <div class="modal_head">
    <div class="modal-overlay absolute h-full w-full bg-gray-600 opacity-50" />
    <div class="modal_responsive">
      <div
        class="flex min-h-full items-center justify-center text-center sm:p-0"
      >
        <div class="modal_size lg:w-1/4">
          <!-- Modal content -->
          <div class="modal_tittle text-current">
            <h3 class="text-xl font-semibold flex gap-1">
              <div v-html="header?.svg"></div>

              <div>
                {{ header?.title }}
              </div>
            </h3>

            <button @click="" class="modal_close_button">
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
          <div class="bg-base-200">
            <!-- Modal body -->
            <div class="p-4 text-center">
              <slot name="body" />
            </div>
            <!-- Modal footer -->
          </div>
          <div style="justify-content: space-between" class="modal_end_button">
            <slot name="footer" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* simple_modal CSS  */
.modal_head {
  @apply my_modal backdrop-blur-[2px] z-50 fixed w-full h-full top-0 left-0 flex items-center justify-center;
}

.my_modal {
  animation: 0.1s ease-out 0s 1 modalani;
  transition: opacity 0.2s ease-in-out;
}

.modal-overlay {
  @apply absolute h-full w-full bg-black opacity-[0.2];
}

.modal_responsive {
  @apply fixed z-10 inset-0 overflow-y-auto scrollbar scrollbar-thumb-gray-900 scrollbar-track-gray-300;
}

.modal_size {
  @apply z-50 w-full md:w-1/2 xl:w-1/3 shadow rounded-2xl shadow-black;
}

.modal_background {
  @apply relative rounded-2xl bg-base-200 backdrop-blur-lg;
}

.modal_tittle {
  @apply flex text-current uppercase justify-between bg-base-300 items-start p-3 py-3 rounded-t-2xl border-base-100;
}

.modal_end_button {
  @apply flex justify-end p-2 space-x-2 rounded-b-2xl border-base-100 bg-base-300;
}

.modal_close_button {
  @apply hover:scale-105 duration-300 bg-base-200/40 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center hover:bg-gray-600 hover:text-white;
}
</style>
