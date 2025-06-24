<script setup>
import { ref } from "vue";

const emit = defineEmits(["open-new-updates"]);
// const props = defineProps({
//   type: {
//     type: String,
//     default: "",
//     required: true,
//   },
// });

const openNewUpdates = () => {
  emit("open-new-updates");
};
</script>

<template>
  <main class="bg-gray-700 p-2 rounded-md flex flex-col gap-1.5">
    <h1 class="header_new_features_send_suggestion">
      Envie sua sugestão para nós
    </h1>

    <section class="grid grid-rows-8 gap-1.5">
      <input
        class="input_send_suggestion row-span-1"
        placeholder="Seu nome"
        type="text"
      />
      <input
        class="input_send_suggestion row-span-1"
        placeholder="Segmento da sua empresa"
        type="text"
      />
      <div class="row-span-6 relative">
        <textarea
          class="input_send_suggestion resize-none overflow-hidden h-full"
          placeholder="gostaria que vocês adicionassem..."
          type="text"
        />

        <span class="absolute right-2 bottom-2 text-gray-700 text-[10px]">
          0/100
        </span>
      </div>
    </section>

    <label
      class="text-[10px] flex gap-1 items-center cursor-pointer"
      for="termsId"
    >
      <input id="termsId" type="checkbox" />
      <p class="text-white select-none">
        Eu aceito os termos e condiçoes da <a class="text-blue-500">SM Click</a>
      </p>
    </label>

    <button
      class="bg-blue-600 w-full p-2 text-white rounded-md text-sm hover:bg-blue-800"
    >
      Enviar
    </button>
  </main>
</template>

<style  scoped>
.input_send_suggestion {
  @apply w-full bg-gray-900 text-sm rounded-md block  p-2 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:border-blue-500 text-white text-[10px] focus:ring-gray-900 outline-none;
}
</style>
