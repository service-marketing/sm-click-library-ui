<script setup>
import { computed, ref } from "vue";

const emit = defineEmits(["openNewUpdates"]);
const props = defineProps({
  type: { type: String, default: "attendant", required: true },
  mode: { type: String, default: "dark" },
  sparkles: { type: Boolean, default: false },
});

const getVariantConfig = (type, sparkles) => {
  const base = {
    attendant: {
      container: "main-container-new-update",
      button: sparkles
        ? "update-button sparkle_update-button animate_sparkle"
        : "update-button",
      tooltip: "tooltip-new-update",
      usePopper: false,
      text: null,
    },
    managerSideBarClose: {
      container: sparkles
        ? "main-container-new-update-manager-close animate_sparkle"
        : "main-container-new-update-manager-close",
      button: "new_update-button ",
      tooltip: null,
      usePopper: true,
      text: null,
    },
    managerSideBarOpen: {
      container: sparkles
        ? "main-container-new-update-manager-open animate_sparkle"
        : "main-container-new-update-manager-open",
      button: "new_update-button-open-side open-width",
      tooltip: null,
      usePopper: false,
      text: "Notas de atualização",
    },
  };

  return base[type] || base.attendant;
};

const config = computed(() => getVariantConfig(props.type, props.sparkles));

const openNewUpdates = () => {
  emit("openNewUpdates");
};
</script>

<template>
  <main @click="openNewUpdates" :class="config.container">
    <template v-if="config.usePopper">
      <button :class="config.button">
        <svg v-if="sparkles" class="size-6" viewBox="0 0 128 128">
          <path
            d="M121.59 60.83l-13.93-4.49c-8.91-2.94-14.13-10.15-16.58-19.21L84.95 7.27c-.16-.59-.55-1.38-1.75-1.38c-1.01 0-1.59.79-1.75 1.38l-6.13 29.87c-2.46 9.06-7.67 16.27-16.58 19.21l-13.93 4.49c-1.97.64-2 3.42-.04 4.09l14.03 4.83c8.88 2.95 14.06 10.15 16.52 19.17l6.14 29.53c.16.59.49 1.65 1.75 1.65c1.33 0 1.59-1.06 1.75-1.65l6.14-29.53c2.46-9.03 7.64-16.23 16.52-19.17l14.03-4.83c1.94-.68 1.91-3.46-.06-4.1z"
            fill="#fdd835"
          ></path>

          <path
            d="M122.91 62.08c-.22-.55-.65-1.03-1.32-1.25l-13.93-4.49c-8.91-2.94-14.13-10.15-16.58-19.21L84.95 7.27c-.09-.34-.41-.96-.78-1.14l1.98 29.97c1.47 13.68 2.73 20.12 13.65 22c9.38 1.62 20.23 3.48 23.11 3.98z"
            fill="#ffee58"
          ></path>

          <path
            d="M122.94 63.64l-24.16 5.54c-8.51 2.16-13.2 7.09-13.2 19.99l-2.37 30.94c.81-.08 1.47-.52 1.75-1.65l6.14-29.53c2.46-9.03 7.64-16.23 16.52-19.17l14.03-4.83c.66-.24 1.08-.73 1.29-1.29z"
            fill="#f4b400"
          ></path>

          <g>
            <path
              d="M41.81 86.81c-8.33-2.75-9.09-5.85-10.49-11.08l-3.49-12.24c-.21-.79-2.27-.79-2.49 0L22.97 74.8c-1.41 5.21-4.41 9.35-9.53 11.04l-8.16 3.54c-1.13.37-1.15 1.97-.02 2.35l8.22 2.91c5.1 1.69 8.08 5.83 9.5 11.02l2.37 10.82c.22.79 2.27.79 2.48 0l2.78-10.77c1.41-5.22 3.57-9.37 10.5-11.07l7.72-2.91c1.13-.39 1.12-1.99-.02-2.36l-7-2.56z"
              fill="#fdd835"
            ></path>

            <path
              d="M28.49 75.55c.85 7.86 1.28 10.04 7.65 11.67l13.27 2.59c-.14-.19-.34-.35-.61-.43l-7-2.57c-7.31-2.5-9.33-5.68-10.7-12.04c-1.37-6.36-2.83-10.51-2.83-10.51c-.51-1.37-1.24-1.3-1.24-1.3l1.46 12.59z"
              fill="#ffee58"
            ></path>

            <path
              d="M28.73 102.99c0-7.41 4.05-11.08 10.49-11.08l10.02-.41s-.58.77-1.59 1.01l-6.54 2.13c-5.55 2.23-8.08 3.35-9.8 10.94c0 0-2.22 8.83-2.64 9.76c-.58 1.3-1.27 1.57-1.27 1.57l1.33-13.92z"
              fill="#f4b400"
            ></path>
          </g>

          <path
            d="M59.74 28.14c.56-.19.54-.99-.03-1.15l-7.72-2.08a4.77 4.77 0 0 1-3.34-3.3L45.61 9.06c-.15-.61-1.02-.61-1.17.01l-2.86 12.5a4.734 4.734 0 0 1-3.4 3.37l-7.67 1.99c-.57.15-.61.95-.05 1.15l8.09 2.8c1.45.5 2.57 1.68 3.01 3.15l2.89 11.59c.15.6 1.01.61 1.16 0l2.99-11.63a4.773 4.773 0 0 1 3.04-3.13l8.1-2.72z"
            fill="#f4b400"
            stroke="#f4b400"
            stroke-miterlimit="10"
          ></path>
        </svg>

        <svg
          v-else
          class="new_update-icon"
          fill="currentColor"
          viewBox="0 0 420.827 420.827"
        >
          <g>
            <g>
              <path
                d="M210.29,0C156,0,104.43,20.693,65.077,58.269C25.859,95.715,2.794,146.022,0.134,199.921    c-0.135,2.734,0.857,5.404,2.744,7.388c1.889,1.983,4.507,3.105,7.244,3.105h45.211c5.275,0,9.644-4.098,9.979-9.362    c4.871-76.214,68.553-135.914,144.979-135.914c80.105,0,145.275,65.171,145.275,145.276c0,80.105-65.17,145.276-145.275,145.276    c-18.109,0-35.772-3.287-52.501-9.771l17.366-15.425c2.686-2.354,3.912-5.964,3.217-9.468c-0.696-3.506-3.209-6.371-6.592-7.521    l-113-32.552c-3.387-1.149-7.122-0.407-9.81,1.948c-2.686,2.354-3.913,5.963-3.218,9.467L69.71,403.157    c0.696,3.505,3.209,6.372,6.591,7.521c3.383,1.147,7.122,0.408,9.81-1.946l18.599-16.298    c31.946,18.574,68.456,28.394,105.581,28.394c116.021,0,210.414-94.392,210.414-210.414C420.705,94.391,326.312,0,210.29,0z"
              />
              <path
                d="M195.112,237.9h118.5c2.757,0,5-2.242,5-5v-30c0-2.757-2.243-5-5-5h-83.5v-91c0-2.757-2.243-5-5-5h-30    c-2.757,0-5,2.243-5,5v126C190.112,235.658,192.355,237.9,195.112,237.9z"
              />
            </g>
          </g>
        </svg>
      </button>
    </template>

    <template v-else>
      <button :class="config.button">
        <svg v-if="sparkles" class="size-5" viewBox="0 0 128 128">
          <path
            d="M121.59 60.83l-13.93-4.49c-8.91-2.94-14.13-10.15-16.58-19.21L84.95 7.27c-.16-.59-.55-1.38-1.75-1.38c-1.01 0-1.59.79-1.75 1.38l-6.13 29.87c-2.46 9.06-7.67 16.27-16.58 19.21l-13.93 4.49c-1.97.64-2 3.42-.04 4.09l14.03 4.83c8.88 2.95 14.06 10.15 16.52 19.17l6.14 29.53c.16.59.49 1.65 1.75 1.65c1.33 0 1.59-1.06 1.75-1.65l6.14-29.53c2.46-9.03 7.64-16.23 16.52-19.17l14.03-4.83c1.94-.68 1.91-3.46-.06-4.1z"
            fill="#fdd835"
          ></path>

          <path
            d="M122.91 62.08c-.22-.55-.65-1.03-1.32-1.25l-13.93-4.49c-8.91-2.94-14.13-10.15-16.58-19.21L84.95 7.27c-.09-.34-.41-.96-.78-1.14l1.98 29.97c1.47 13.68 2.73 20.12 13.65 22c9.38 1.62 20.23 3.48 23.11 3.98z"
            fill="#ffee58"
          ></path>

          <path
            d="M122.94 63.64l-24.16 5.54c-8.51 2.16-13.2 7.09-13.2 19.99l-2.37 30.94c.81-.08 1.47-.52 1.75-1.65l6.14-29.53c2.46-9.03 7.64-16.23 16.52-19.17l14.03-4.83c.66-.24 1.08-.73 1.29-1.29z"
            fill="#f4b400"
          ></path>

          <g>
            <path
              d="M41.81 86.81c-8.33-2.75-9.09-5.85-10.49-11.08l-3.49-12.24c-.21-.79-2.27-.79-2.49 0L22.97 74.8c-1.41 5.21-4.41 9.35-9.53 11.04l-8.16 3.54c-1.13.37-1.15 1.97-.02 2.35l8.22 2.91c5.1 1.69 8.08 5.83 9.5 11.02l2.37 10.82c.22.79 2.27.79 2.48 0l2.78-10.77c1.41-5.22 3.57-9.37 10.5-11.07l7.72-2.91c1.13-.39 1.12-1.99-.02-2.36l-7-2.56z"
              fill="#fdd835"
            ></path>

            <path
              d="M28.49 75.55c.85 7.86 1.28 10.04 7.65 11.67l13.27 2.59c-.14-.19-.34-.35-.61-.43l-7-2.57c-7.31-2.5-9.33-5.68-10.7-12.04c-1.37-6.36-2.83-10.51-2.83-10.51c-.51-1.37-1.24-1.3-1.24-1.3l1.46 12.59z"
              fill="#ffee58"
            ></path>

            <path
              d="M28.73 102.99c0-7.41 4.05-11.08 10.49-11.08l10.02-.41s-.58.77-1.59 1.01l-6.54 2.13c-5.55 2.23-8.08 3.35-9.8 10.94c0 0-2.22 8.83-2.64 9.76c-.58 1.3-1.27 1.57-1.27 1.57l1.33-13.92z"
              fill="#f4b400"
            ></path>
          </g>

          <path
            d="M59.74 28.14c.56-.19.54-.99-.03-1.15l-7.72-2.08a4.77 4.77 0 0 1-3.34-3.3L45.61 9.06c-.15-.61-1.02-.61-1.17.01l-2.86 12.5a4.734 4.734 0 0 1-3.4 3.37l-7.67 1.99c-.57.15-.61.95-.05 1.15l8.09 2.8c1.45.5 2.57 1.68 3.01 3.15l2.89 11.59c.15.6 1.01.61 1.16 0l2.99-11.63a4.773 4.773 0 0 1 3.04-3.13l8.1-2.72z"
            fill="#f4b400"
            stroke="#f4b400"
            stroke-miterlimit="10"
          ></path>
        </svg>

        <svg
          v-else
          class="new_update-icon"
          fill="currentColor"
          viewBox="0 0 420.827 420.827"
        >
          <g>
            <g>
              <path
                d="M210.29,0C156,0,104.43,20.693,65.077,58.269C25.859,95.715,2.794,146.022,0.134,199.921    c-0.135,2.734,0.857,5.404,2.744,7.388c1.889,1.983,4.507,3.105,7.244,3.105h45.211c5.275,0,9.644-4.098,9.979-9.362    c4.871-76.214,68.553-135.914,144.979-135.914c80.105,0,145.275,65.171,145.275,145.276c0,80.105-65.17,145.276-145.275,145.276    c-18.109,0-35.772-3.287-52.501-9.771l17.366-15.425c2.686-2.354,3.912-5.964,3.217-9.468c-0.696-3.506-3.209-6.371-6.592-7.521    l-113-32.552c-3.387-1.149-7.122-0.407-9.81,1.948c-2.686,2.354-3.913,5.963-3.218,9.467L69.71,403.157    c0.696,3.505,3.209,6.372,6.591,7.521c3.383,1.147,7.122,0.408,9.81-1.946l18.599-16.298    c31.946,18.574,68.456,28.394,105.581,28.394c116.021,0,210.414-94.392,210.414-210.414C420.705,94.391,326.312,0,210.29,0z"
              />
              <path
                d="M195.112,237.9h118.5c2.757,0,5-2.242,5-5v-30c0-2.757-2.243-5-5-5h-83.5v-91c0-2.757-2.243-5-5-5h-30    c-2.757,0-5,2.243-5,5v126C190.112,235.658,192.355,237.9,195.112,237.9z"
              />
            </g>
          </g>
        </svg>

        <span v-if="config.text" class="text-white text-center flex-1">
          {{ config.text }}
        </span>
      </button>
      <p v-show="config.tooltip" :class="config.tooltip">
        Notas de atualização
      </p>
    </template>
  </main>
</template>

<style scoped>
/* keep existing styles */
.main-container-new-update {
  position: relative;
  display: flex;
  align-items: center;
  cursor: pointer;
  /* @apply animate-pulse; */
}
.main-container-new-update-manager-open {
  text-align: center;
  position: relative;
  display: flex;
  align-items: center;
  border-radius: 9999px;
  padding: 0.4rem;
  background-color: #e06a25;
  width: 100%;
  cursor: pointer;
}
.main-container-new-update-manager-close {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 9999px;
  width: 2rem;
  height: 2rem;
  background-color: #e06a25;
  cursor: pointer;
}

@media (min-width: 1280px) {
  .main-container-new-update-manager-close {
    width: 3rem;
    height: 3rem;
  }
}

.main-container-new-update-manager-close:hover,
.main-container-new-update-manager-open:hover {
  background-color: #8a4822;
}
.update-button {
  display: flex;
  align-items: center;
  padding: 7px;
  border-radius: 50%;
  background-color: transparent;
  border: none;
  cursor: pointer;
  transition: background-color 0.3s ease-in;
}
.sparkle_update-button {
  background-color: #03b5eb;
}
.animate_sparkle {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
.new_update-button,
.new_update-button-open-side {
  display: flex;
  align-items: center;
  padding: 6px;
  border-radius: 50%;
  background-color: transparent;
  border: none;
  cursor: pointer;
  transition: background-color 0.3s ease-in;
}
.new_update-button-open-side {
  gap: 12px;
  font-size: 12px;
  font-size: 0.875rem;
  line-height: 1.25rem;
}
.popper-manager-button {
  /* popper styles */
}
.update-button:hover {
  background-color: #03b5eb;
  padding: 1rem ease-in;
  border-radius: 9999px;
}
.new_update-icon {
  width: 22px;
  height: 22px;
  color: white;
  transition: color 0.3s ease-in;
}
.tooltip-popper-manager {
  width: 11rem;
  text-align: center;
  border-radius: 0.125rem;
  background-color: #4b6374;
  color: #fff;
  padding: 8px;
}
.tooltip-new-update {
  display: none;
  position: absolute;
  left: 48px;
  text-align: center;
  width: 182px;
  border-radius: 6px;
  background-color: #03b5eb;
  color: white;
  padding: 4px 8px;
}
.main-container-new-update:hover .tooltip-new-update {
  display: flex;
  justify-content: center;
}
.open-width {
  width: 100%;
}

@keyframes pulse {
  50% {
    opacity: 0.5;
  }
}
</style>
