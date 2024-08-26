<template>
  <div
    :class="detectClass"
    class="bg-base-300 border-2 p-2 rounded-lg flex-col items-center"
  >
    <div class="flex items-center gap-3 mb-2">
      <svg
        v-if="typeCard === 'success'"
        class="text-green-500"
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
      >
        <path
          fill-rule="evenodd"
          clip-rule="evenodd"
          d="M0.25 10C0.25 4.61522 4.61522 0.25 10 0.25C15.3848 0.25 19.75 4.61522 19.75 10C19.75 15.3848 15.3848 19.75 10 19.75C4.61522 19.75 0.25 15.3848 0.25 10ZM13.6103 8.18593C13.8511 7.84887 13.773 7.38046 13.4359 7.1397C13.0989 6.89894 12.6305 6.97701 12.3897 7.31407L9.1543 11.8436L7.53033 10.2197C7.23744 9.92678 6.76256 9.92678 6.46967 10.2197C6.17678 10.5126 6.17678 10.9874 6.46967 11.2803L8.71967 13.5303C8.87556 13.6862 9.09215 13.7656 9.31186 13.7474C9.53157 13.7293 9.73216 13.6153 9.8603 13.4359L13.6103 8.18593Z"
          fill="currentColor"
        />
      </svg>

      <svg
        v-if="typeCard === 'info'"
        class="text-blue-400"
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
      >
        <path
          fill-rule="evenodd"
          clip-rule="evenodd"
          d="M0.25 10C0.25 4.61522 4.61522 0.25 10 0.25C15.3848 0.25 19.75 4.61522 19.75 10C19.75 15.3848 15.3848 19.75 10 19.75C4.61522 19.75 0.25 15.3848 0.25 10ZM10 6.25C10.4142 6.25 10.75 6.58579 10.75 7V10.75C10.75 11.1642 10.4142 11.5 10 11.5C9.58579 11.5 9.25 11.1642 9.25 10.75V7C9.25 6.58579 9.58579 6.25 10 6.25ZM10 14.5C10.4142 14.5 10.75 14.1642 10.75 13.75C10.75 13.3358 10.4142 13 10 13C9.58579 13 9.25 13.3358 9.25 13.75C9.25 14.1642 9.58579 14.5 10 14.5Z"
          fill="currentColor"
        />
      </svg>

      <svg
        v-if="typeCard === 'alert'"
        class="text-yellow-400"
        xmlns="http://www.w3.org/2000/svg"
        width="22"
        height="20"
        viewBox="0 0 22 20"
        fill="none"
      >
        <path
          fill-rule="evenodd"
          clip-rule="evenodd"
          d="M8.40123 2.0034C9.55572 0.0022862 12.4439 0.0022856 13.5983 2.0034L20.9527 14.7509C22.1065 16.7509 20.6631 19.2501 18.3541 19.2501H3.64546C1.33649 19.2501 -0.106939 16.7509 1.04691 14.7509L8.40123 2.0034ZM11 7.25C11.4142 7.25 11.75 7.58579 11.75 8V11.75C11.75 12.1642 11.4142 12.5 11 12.5C10.5858 12.5 10.25 12.1642 10.25 11.75V8C10.25 7.58579 10.5858 7.25 11 7.25ZM11 15.5C11.4142 15.5 11.75 15.1642 11.75 14.75C11.75 14.3358 11.4142 14 11 14C10.5858 14 10.25 14.3358 10.25 14.75C10.25 15.1642 10.5858 15.5 11 15.5Z"
          fill="currentColor"
        />
      </svg>

      <svg
        v-if="typeCard === 'error'"
        class="w-6 h-6 text-red-500"
        aria-hidden="true"
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        fill="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          fill-rule="evenodd"
          d="M2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10S2 17.523 2 12Zm7.707-3.707a1 1 0 0 0-1.414 1.414L10.586 12l-2.293 2.293a1 1 0 1 0 1.414 1.414L12 13.414l2.293 2.293a1 1 0 0 0 1.414-1.414L13.414 12l2.293-2.293a1 1 0 0 0-1.414-1.414L12 10.586 9.707 8.293Z"
          clip-rule="evenodd"
        />
      </svg>
      <span>
        <p class="font-bold">{{ content.title }}</p>
      </span>
    </div>

    <section class="text-white flex text-left">
      {{ content.description }}
    </section>
  </div>
</template>

<script setup>
import { computed } from "vue";
const props = defineProps({
  content: {
    type: Object,
    default: {
      title: "Title",
      description:
        "Coloque aqui a descrição",
    },
  },
  typeCard: {
    type: String,
    default: "default",
  },
});

const detectClass = computed(() => {
  if (props.typeCard === "success") {
    return "border-green-500 text-green-500 shadow-md shadow-green-700";
  } else if (props.info) {
    return "border-blue-400 text-blue-400 shadow-md shadow-blue-700";
  } else if (props.alert) {
    return "border-yellow-400 text-yellow-400 shadow-md shadow-yellow-700";
  } else if (props.error) {
    return "border-red-500 text-red-500 shadow-md shadow-red-700";
  } else {
    return "border-white text-white";
  }
});
</script>