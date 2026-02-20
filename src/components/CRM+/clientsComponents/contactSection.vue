<script setup>
/**
 * 📋 Descrição:
 * Componente que auxilia na seção de contato do formulário de clientes, se ajustando para o mobile.
 */

import ListProducts from "./listProducts.vue";
import ListSegmentationsFields from "./listSegmentationsFields.vue";
import ToggleListButtons from "./toggleListButtons.vue";

const props = defineProps({
  hasCrmPlus: { type: Boolean, default: false },
  handlerToggleButtons: { type: Array, default: () => [] },
  allProducts: { type: Object, default: () => ({}) },
  departmentBypass: {
    type: [String, Number, Boolean, Object],
    default: undefined,
  },
  isLargeScreen: { type: Boolean, default: true },
  viewContactNumber: { type: Boolean, default: false },
});

// --- v-model separados para atualizar o form ---
const pageState = defineModel("pageState", { type: String, default: "data" });
const telephone = defineModel("telephone", { type: String, default: "" });
const country = defineModel("country", { type: String, default: "br" });
const segmentationFields = defineModel("segmentationFields", {
  type: Array,
  default: () => [],
});
const products = defineModel("products", { type: Array, default: () => [] });
</script>

<template>
  <ToggleListButtons
    v-if="isLargeScreen && hasCrmPlus"
    :buttons="props.handlerToggleButtons"
    v-model="pageState"
  />

  <div
    v-show="pageState === 'data'"
    :class="[
      props.hasCrmPlus ? 'pt-1.5' : 'pt-0',
      'flex flex-col gap-2 flex-1 min-h-0 px-1.5 overflow-hidden',
    ]"
  >
    <div class="rounded-md bg-base-200 border shadow-sm transition-shadow duration-200 hover:shadow-md border-white/10">
      <h1 class="text-start w-full items-center justify-between flex p-2">
        <p class="text-xs font-semibold">Contatos</p>
      </h1>

      <div
        style="
          border-bottom-right-radius: 0.35rem;
          border-bottom-left-radius: 0.35rem;
        "
        class="flex w-full relative bg-base-300"
      >
        <span class="flex justify-center items-center w-8">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="currentColor"
            class="size-4 text-gray-500 ml-1.5"
            viewBox="0 0 17 17"
          >
            <path
              d="M13.601 2.326A7.854 7.854 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.933 7.933 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.898 7.898 0 0 0 13.6 2.326zM7.994 14.521a6.573 6.573 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.557 6.557 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592zm3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.729.729 0 0 0-.529.247c-.182.198-.691.677-.691 1.654 0 .977.71 1.916.81 2.049.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232z"
            ></path>
          </svg>
        </span>

        <vue-tel-input
          v-if="viewContactNumber"
          class="z-40 w-full"
          @country-changed="(crt) => (country = crt.iso2)"
          :mode="'national'"
          :validCharactersOnly="true"
          :defaultCountry="country"
          :inputOptions="{
            placeholder: 'Coloque seu telefone',
            showDialCode: false,
            required: false,
            searchBoxPlaceholder: 'Brazil',
          }"
          :dropdownOptions="{
            showSearchBox: true,
            showFlags: true,
            searchBoxPlaceholder: 'Brazil',
          }"
          v-model="telephone"
        ></vue-tel-input>

        <div
          class="text-xs font-medium font-sans py-3 blur-sm select-none"
          v-else
        >
          +55 00000-0000
        </div>
      </div>
    </div>

    <div class="segmentation-fields-container bg-base-200">
      <ListSegmentationsFields v-model="segmentationFields" />
    </div>
  </div>

  <div v-show="pageState === 'products'" class="list-products-container">
    <ListProducts
      v-model="products"
      :allProducts="props.allProducts"
      :departmentBypass="props.departmentBypass"
    />
  </div>
</template>

<style scoped>
.list-products-container {
  flex: 1 1 0%;
  min-height: 0px;
}

.segmentation-fields-container {
  flex: 1 1 0%;
  min-height: 0px;
  overflow-y: auto;
  border-radius: 0.375rem;
  border-width: 1px;
  border-color: rgb(255 255 255 / 0.1);
}
</style>
