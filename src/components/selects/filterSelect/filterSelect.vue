<template>
  <Popper placement="bottom" :arrow="false" class="dark:popper-light popper-dark">
    <!-- :show="control_popper" -->
    <template #content="{ close }">
      <section class="">
        <div>
          <div class="flex justify-between mb-3">
            <p>
              {{ title }}
            </p>

            <svg
             :class=""
              class="w-4 h-4 text-white"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                d="M5 3a2 2 0 0 0-1.5 3.3l5.4 6v5c0 .4.3.9.6 1.1l3.1 2.3c1 .7 2.5 0 2.5-1.2v-7.1l5.4-6C21.6 5 20.7 3 19 3H5Z"
              />
            </svg>
          </div>

          <div class="">
            <slot />
          </div>
        </div>
      </section>
    </template>

    <button
      @click="control_arrow = !control_arrow"
      class="group max-w-max relative flex p-0.5 flex-col items-center justify-center cursor-pointer rounded-md text-xs font-semibold"
    >
      <!-- :class="control_arrow ? '' : 'rotate-180 transition-all duration-300'" -->
      <svg
        class="w-3 h-3"
        aria-hidden="true"
        xmlns="http://www.w3.org/2000/svg"
        fill="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          fill-rule="evenodd"
          d="M18.4 10.3A2 2 0 0 0 17 7H7a2 2 0 0 0-1.5 3.3l4.9 5.9a2 2 0 0 0 3 0l5-6Z"
          clip-rule="evenodd"
        />
      </svg>
    </button>
  </Popper>
</template>

<script setup>
import { ref } from "vue";

const props = defineProps({
  title: {
    type: String,
    default: "Filtros",
  },
  modelValue: {
    default: null,
  },
});

const control_arrow = ref(true);
</script>

<style scoped>
.popper-dark {
  --popper-theme-background-color: #111b21;
  --popper-theme-background-color-hover: #111b21;
  --popper-theme-text-color: white;
  --popper-theme-border-width: 0px;
  --popper-theme-border-radius: 6px;
  --popper-theme-padding: 8px;
  --popper-theme-box-shadow: 0 6px 30px -6px rgba(0, 0, 0, 1);
}

.popper-light {
  --popper-theme-background-color: #ffffff;
  --popper-theme-background-color-hover: #ffffff;
  --popper-theme-text-color: #333333;
  --popper-theme-border-width: 1px;
  --popper-theme-border-style: solid;
  --popper-theme-border-color: #eeeeee;
  --popper-theme-border-radius: 6px;
  --popper-theme-padding: 10px;
  --popper-theme-box-shadow: 0 6px 30px -6px rgba(0, 0, 0, 0.6);
}
</style>


