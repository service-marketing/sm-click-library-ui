<script setup>
import { ref } from "vue";

const emit = defineEmits(["open-new-updates"]);
const props = defineProps({
  type: {
    type: String,
    default: "",
    required: true,
  },
});

const openNewUpdates = () => {
  emit("open-new-updates");
};
</script>

<template>
  <main v-if="type === 'attendance'" class="main-container-new-update">
    <button @click="openNewUpdates()" class="new_update-button">
      <svg
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

    <p class="tooltip-new-update">Novas atualizações</p>
  </main>

  <main
    v-if="type === 'managerSideBarOpen'"
    class="main-container-new-update-manager"
  >
    <Popper class="popper-manager-button" hover arrow placement="right">
      <button @click="openNewUpdates()" class="new_update-button">
        <svg
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

      <template #content>
        <div class="tooltip-popper-manager">Novas atualizações</div>
      </template>
    </Popper>

    <!-- <p class="tooltip-new-update">Novas atualizações</p> -->
  </main>

  <main
    v-if="type === 'managerSideBarOpen'"
    class="main-container-new-update-manager"
  >
    <button @click="openNewUpdates()" class="new_update-button">
      <svg
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

      <p class="text-white">Novas atualizações</p>
    </button>
  </main>
</template>

<style>
.main-container-new-update {
  position: relative;
  display: flex;
  align-items: center;
}
.main-container-new-update-manager {
  position: relative;
  display: flex;
  align-items: center;
  border-radius: 9999px;
  padding: 0.25rem;
  background-color: #3666f0;
}

.new_update-button {
  display: flex;
  align-items: center;
  padding: 6px;
  border-radius: 50%;
  background-color: transparent;
  border: none;
  cursor: pointer;
  transition: background-color 0.3s ease-in;
}

.popper-manager-button {
  --popper-theme-background-color: #333333;
  --popper-theme-background-color-hover: #333333;
  --popper-theme-text-color: #ffffff;
  --popper-theme-border-width: 0px;
  --popper-theme-border-style: solid;
  --popper-theme-border-radius: 6px;
  --popper-theme-padding: 8px;
  --popper-theme-box-shadow: 0 6px 30px -6px rgba(0, 0, 0, 0.25);
}

.update-button:hover {
  background-color: #03b5eb;
}

.new_update-icon {
  width: 22px;
  height: 22px;
  color: white;
  transition: color 0.3s ease-in;
}

.new_update-button:hover .update-icon {
  color: white;
}

.tooltip-popper-manager {
  width: 11rem;
  text-align: center;
  border-radius: 0.125rem;
  background-color: #4b6374;
}

.tooltip-new-update {
  display: none;
  position: absolute;
  left: 48px;
  text-align: center;
  width: 168px;
  border-radius: 6px;
  background-color: #03b5eb;
  color: white;
  padding: 4px 8px;
}

.main-container-new-update:hover .tooltip-new-update {
  display: flex;
  justify-content: center;
}
</style>
