<script setup>
const emit = defineEmits(["close"]);
defineProps({
  defineWidth: {
    type: String,
    default: "max-w-md",
  },
});

const closeModal = () => {
  emit("close");
};
</script>

<template>
  <div
    class="my_modal backdrop-blur-[2px] z-50 fixed w-full h-full top-0 left-0 flex items-center justify-center"
  >
    <div class="absolute h-full w-full bg-black opacity-[0.2]" />
  </div>

  <div
    class="overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 justify-center items-center w-full md:inset-0 h-[calc(100%-1rem)] max-h-full flex"
  >
    <div :class="[defineWidth, 'relative p-4 w-full max-h-full']">
      <!-- Modal content -->
      <div class="relative bg-base-300 rounded-lg shadow-sm dark:bg-gray-700">
        <!-- Modal header -->
        <div
          class="flex items-center justify-between p-4 md:p-5 border- rounded-t dark:border-gray-600 border-gray-200"
        >
          <slot name="header" />
          <button
            class="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm h-8 w-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
            @click="closeModal()"
          >
            <svg
              class="w-3 h-3"
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
        <!-- Modal body -->
        <div class="p-2 md:p-3">
          <slot name="body" />
        </div>
      </div>
    </div>
  </div>
</template>