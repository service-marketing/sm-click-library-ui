<script setup>
import SendSuggestion from "./sendSuggestion.vue";
import FeatureCard from "../../components/cards/feature_card/feature_card.vue";
import "../../components/cards/feature_card/feature_card.css";

const emit = defineEmits(["close"]);
const close = () => {
  emit("close");
};
</script>

<template>
  <section>
    <div
      class="fixed inset-0 w-full h-full flex items-center justify-center z-50 animate-[modalani_0.1s_ease-out] transition-opacity duration-200 ease-in-out"
    >
      <div class="absolute w-full h-full bg-black/20 backdrop-blur-sm"></div>
    </div>

    <div
      class="flex justify-center items-center fixed inset-0 z-50 overflow-auto"
    >
      <div
        class="p-1 w-full max-w-7xl bg-base-300 rounded-lg shadow-md shadow-green-900"
      >
        <div
          class="flex items-center justify-between p-2 rounded-t dark:border-gray-600 border-gray-200"
        >
          <button
            @click="close()"
            class="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
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

        <div
          class="flex flex-col md:grid md:grid-cols-3 gap-2 justify-between p-2 h-full"
        >
          <div class="bg-[#3666F033] rounded-md p-2 flex flex-col">
            <div class="max-h-[27rem] overflow-auto scroll_area_new_features">
              <h1 class="header_new_features">Ultimas Atualizações</h1>

              <div class="flex flex-col gap-2 mt-2">
                <!-- <FeatureCard
                  v-for="mock in patchNotes.latest_update"
                  :key="mock"
                  state="updated"
                  :title="mock.title_feature"
                  :description="mock.description"
                  :date="mock.date"
                  :tutorial="mock.tutorial"
                  :flag="mock.flag"
                /> -->
              </div>
            </div>
          </div>

          <div class="bg-[#21B45833] rounded-md p-2 flex flex-col">
            <div class="max-h-[27rem] overflow-auto scroll_area_new_features">
              <h1 class="header_new_features_future_update">
                Futuras Atualizações
              </h1>

              <div class="flex flex-col gap-2 mt-2">
                <!-- <FeatureCard
                  v-for="mock in patchNotes.future_updates"
                  :key="mock"
                  state="future-update"
                  :title="mock.title_feature"
                  :description="mock.description"
                  :date="mock.date"
                  :tutorial="mock.tutorial"
                  :flag="mock.flag"
                /> -->
              </div>
            </div>
          </div>

          <SendSuggestion />
        </div>
      </div>
    </div>
  </section>
</template>