<script setup>
import { computed, onMounted, reactive, watch, toRaw, ref } from "vue";

import SelectMultipleTags from "../selects/multiSelects/selectMultipleTags.vue";
import OutcomeButton from "./clientsComponents/outcomeButton.vue";
import PrimaryInput from "../inputs/primaryInput.vue";
import RaitingInput from "../inputs/raitingInput.vue";

import ListProducts from "./clientsComponents/listProducts.vue";
import ListSegmentationsFields from "./clientsComponents/listSegmentationsFields.vue";

const emit = defineEmits(["close", "save"]);
const pageState = ref("data");

const props = defineProps({
  // --- Estado atual do formulário caso preenchido ---
  form: {
    type: Object,
    default: () => ({
      tags: [],
      country: "BR",
      name: "",
      photo: null,
      raw_telephone: "",
      telephone: "",
      whatsapp_id: "",
      whatsapp_jid: "",
      whatsapp_lid: null,
      rating: null,
      outcome: null,
      created_at: "",
      updated_at: "",
      client: "",
      products: [],
    }),
  },
  // --- Função que salva o formulário ---
  save: {
    type: Function,
    default: () => {},
  },
  hasCrmPlus: {
    type: Boolean,
    default: false,
  },
  tagsFunctions: {
    type: Function,
    default: () => {},
  },
});

// --- Estado principal do formulário ---
const form = reactive({ ...props.form });
const loading = ref(false);

const configTextArea = {
  title: "Anotações",
  info: "Descreva o produto para facilitar a identificação",
  type: "textArea",
  placeholder:
    "Automatize fluxos de trabalho com integração rápida e segura entre sistemas.",
  empty: false,
  data: null,
};

const configNameInput = ref({
  title: "Nome",
  info: "Nome do contato",
  type: "text",
  placeholder: "Digite o nome do contato",
  empty: false,
  data: computed({
    get: () => form.name,
    set: (value) => (form.name = value),
  }),
});

const modalTitle = computed(() =>
  props.form.mode === "edit" ? `Editar ${form.name}` : "Adicionar Novo Cliente"
);

// --- Função de salvar cliente ---
const saveClient = async () => {
  try {
    loading.value = true;
    await props.save(form);
  } catch (e) {
    console.error(e);
  } finally {
    loading.value = false;
  }
};

// --- Watch para emitir e atualizar dinamicamente ---
watch(
  () => props.form,
  (newForm) => {
    Object.assign(form, toRaw(newForm));
  },
  { deep: true, immediate: true }
);
</script>

<template>
  <div class="modal_head">
    <div class="modal-overlay absolute h-full bg-gray-600 w-full opacity-70" />

    <div class="modal_responsive">
      <div class="flex min-h-full items-center justify-center text-center">
        <div class="z-50 w-full lg:w-1/2 shadow rounded-2xl shadow-black">
          <div class="modal_background">
            <!-- --- Header --- -->
            <div
              class="flex justify-between p-2.5 rounded-t-2xl bg-base-300 items-center text-current"
            >
              <span class="flex items-center gap-2">
                <svg
                  class="size-6 text-green-500"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    fill-rule="evenodd"
                    d="M12 4a4 4 0 1 0 0 8 4 4 0 0 0 0-8Zm-2 9a4 4 0 0 0-4 4v1a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-1a4 4 0 0 0-4-4h-4Z"
                    clip-rule="evenodd"
                  />
                </svg>

                <span class="flex flex-col items-start">
                  <p class="text-lg font-semibold">{{ modalTitle }}</p>
                  <p v-if="form.id" class="text-xs text-gray-400">
                    ID: {{ form.id }}
                  </p>
                </span>
              </span>

              <section class="flex gap-2 items-center">
                <Popper hover arrow>
                  <template #content>
                    <div
                      class="text-[10px] bg-base-100 p-2 rounded-md w-52 text-center"
                    >
                      Uma label explicativa sobre a funcionalidade do CRM+, CTA
                      e etc.
                    </div>
                  </template>

                  <span
                    class="bg-green-500 rounded-full flex items-center justify-center p-1.5 group"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      class="size-3.5 text-white"
                      viewBox="0 0 800 726"
                      fill="none"
                    >
                      <path
                        d="M208 195.556H8.88906C3.98125 195.556 0 199.535 0 204.445V698.667C0 713.393 11.9391 725.334 26.6672 725.334H208C212.908 725.334 216.889 721.354 216.889 716.445V204.445C216.889 199.535 212.908 195.556 208 195.556ZM140.452 616.888H76.4516C61.725 616.888 49.7844 604.949 49.7844 590.221C49.7844 575.493 61.7234 563.554 76.4516 563.554H140.452C155.178 563.554 167.119 575.493 167.119 590.221C167.119 604.949 155.18 616.888 140.452 616.888ZM140.452 487.11H76.4516C61.725 487.11 49.7844 475.171 49.7844 460.443C49.7844 445.717 61.7234 433.776 76.4516 433.776H140.452C155.178 433.776 167.119 445.715 167.119 460.443C167.119 475.171 155.18 487.11 140.452 487.11ZM140.452 357.334H76.4516C61.725 357.334 49.7844 345.395 49.7844 330.667C49.7844 315.938 61.7234 303.999 76.4516 303.999H140.452C155.178 303.999 167.119 315.938 167.119 330.667C167.119 345.395 155.18 357.334 140.452 357.334Z"
                        fill="currentColor"
                      ></path>
                      <path
                        d="M773.333 0H26.6672C11.9391 0 0 11.9406 0 26.6672V133.334C0 138.242 3.97969 142.223 8.88906 142.223H791.111C796.019 142.223 800 138.244 800 133.334V26.6672C800 11.9406 788.061 0 773.333 0ZM101.333 88.8891C91.5141 88.8891 83.5547 80.9297 83.5547 71.1109C83.5547 61.2922 91.5141 53.3328 101.333 53.3328C111.152 53.3328 119.111 61.2922 119.111 71.1109C119.111 80.9297 111.152 88.8891 101.333 88.8891ZM172.444 88.8891C162.625 88.8891 154.666 80.9297 154.666 71.1109C154.666 61.2922 162.625 53.3328 172.444 53.3328C182.262 53.3328 190.222 61.2922 190.222 71.1109C190.222 80.9297 182.262 88.8891 172.444 88.8891ZM243.556 88.8891C233.738 88.8891 225.778 80.9297 225.778 71.1109C225.778 61.2922 233.738 53.3328 243.556 53.3328C253.375 53.3328 261.334 61.2922 261.334 71.1109C261.333 80.9297 253.373 88.8891 243.556 88.8891Z"
                        fill="currentColor"
                      ></path>
                      <path
                        fill-rule="evenodd"
                        clip-rule="evenodd"
                        d="M791.111 195.556C796.021 195.556 800.001 199.535 800.001 204.444V698.667C800.001 713.395 788.06 725.334 773.334 725.334H279.111C274.202 725.334 270.223 721.352 270.223 716.444V204.444C270.223 199.535 274.204 195.556 279.111 195.556H791.111ZM558.521 358.955C550.005 339.015 520.995 339.015 512.479 358.955L490.642 410.056L433.968 414.482C411.869 416.199 402.905 443.068 419.75 457.122L462.928 493.14L449.73 546.999C444.589 568.006 468.057 584.61 486.981 573.353L535.5 544.498L584.019 573.365C602.943 584.623 626.411 568.018 621.27 546.999L608.072 493.164L651.25 457.135C668.095 443.081 659.131 416.224 637.032 414.495L580.358 410.08L558.521 358.955Z"
                        fill="currentColor"
                      ></path>
                    </svg>
                  </span>
                </Popper>

                <button
                  class="bg-base-200 p-1.5 rounded-md hover:bg-base-200/70 transition"
                  @click="emit('close')"
                >
                  <svg
                    class="size-4 text-white"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke="currentColor"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M6 18 17.94 6M18 18 6.06 6"
                    />
                  </svg>
                </button>
              </section>
            </div>

            <!-- --- Body --- -->
            <div class="grid grid-cols-2">
              <section
                class="w-full flex flex-col gap-3 justify-center items-center p-2"
              >
                <div v-if="hasCrmPlus" class="flex gap-2">
                  <OutcomeButton
                    :outcome="form.outcome"
                    @update:outcome="form.outcome = $event"
                  />
                </div>

                <div class="flex items-center justify-center">
                  <button
                    v-if="form.photo"
                    @click="viewSingleImage(form.photo)"
                    class="cursor-pointer"
                  >
                    <img
                      :src="form.photo"
                      alt=""
                      class="size-24 object-cover rounded-md hover:brightness-75 transition cursor-pointer"
                    />
                  </button>

                  <span
                    v-else
                    class="bg-base-300 p-2 rounded-xl size-24 flex items-center justify-center border border-base-100"
                    ><svg
                      class="size-14"
                      aria-hidden="true"
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        fill-rule="evenodd"
                        d="M12 4a4 4 0 1 0 0 8 4 4 0 0 0 0-8Zm-2 9a4 4 0 0 0-4 4v1a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-1a4 4 0 0 0-4-4h-4Z"
                        clip-rule="evenodd"
                      /></svg
                  ></span>
                </div>

                <RaitingInput v-if="hasCrmPlus" v-model="form.rating" />

                <div class="flex flex-col w-full gap-2">
                  <div class="flex flex-col gap-2 w-full">
                    <div class="flex flex-col gap-2 w-full">
                      <header class="flex items-center justify-between px-1">
                        <p class="text-xs font-medium text-left">
                          Nome da etiqueta
                        </p>

                        <Popper hover content="teste" placement="top" arrow>
                          <svg
                            class="size-4 text-white"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              fill-rule="evenodd"
                              clip-rule="evenodd"
                              d="M2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10S2 17.523 2 12Zm9.408-5.5a1 1 0 1 0 0 2h.01a1 1 0 1 0 0-2h-.01ZM10 10a1 1 0 1 0 0 2h1v3h-1a1 1 0 1 0 0 2h4a1 1 0 1 0 0-2h-1v-4a1 1 0 0 0-1-1h-2Z"
                            />
                          </svg>
                        </Popper>
                      </header>

                      <SelectMultipleTags v-model="form.tags" />
                    </div>

                    <div class="w-full">
                      <PrimaryInput
                        @update:content="
                          (newContent) =>
                            (configNameInput.data = newContent.data)
                        "
                        :content="configNameInput"
                      />
                    </div>
                  </div>
                </div>
              </section>

              <section class="bg-base-300 flex flex-col gap-3 justify-center">
                <div class="flex divide-x divide-x-white justify-between -mb-3">
                  <button
                    :class="pageState === 'data' ? 'bg-green-900' : ''"
                    @click="pageState = 'data'"
                    class="bg-base-300 p-1 w-full text-xs font-sans font-medium flex items-center justify-center hover:bg-base-200/70 transition"
                  >
                    Dados do cliente
                  </button>

                  <button
                    :class="pageState === 'products' ? 'bg-green-900' : ''"
                    :disabled="!hasCrmPlus"
                    @click="pageState = 'products'"
                    class="bg-base-300 p-1 w-full text-xs font-sans font-medium flex items-center justify-center hover:bg-base-200/70 transition"
                  >
                    <p v-if="hasCrmPlus">Produtos</p>

                    <svg
                      v-else
                      class="size-3.5 text-white"
                      aria-hidden="true"
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        fill-rule="evenodd"
                        d="M8 10V7a4 4 0 1 1 8 0v3h1a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h1Zm2-3a2 2 0 1 1 4 0v3h-4V7Zm2 6a1 1 0 0 1 1 1v3a1 1 0 1 1-2 0v-3a1 1 0 0 1 1-1Z"
                        clip-rule="evenodd"
                      />
                    </svg>
                  </button>
                </div>

                <div
                  v-if="pageState === 'data'"
                  class="flex flex-col gap-2 justify-between h-full p-1.5"
                >
                  <div class="test-style">
                    <h1
                      class="text-start w-full items-center justify-between flex p-2"
                    >
                      <p class="text-xs font-semibold">Contatos</p>
                    </h1>

                    <vue-tel-input
                      class="z-50"
                      @country-changed="(crt) => (form.country = crt.iso2)"
                      :mode="'national'"
                      :validCharactersOnly="true"
                      :defaultCountry="form.country"
                      :inputOptions="{
                        placeholder: 'Coloque seu telefone',
                        showDialCode: false,
                        required: true,
                        searchBoxPlaceholder: 'Brazil',
                      }"
                      :dropdownOptions="{
                        showSearchBox: true,
                        showFlags: true,
                        searchBoxPlaceholder: 'Brazil',
                      }"
                      v-model="form.telephone"
                    ></vue-tel-input>
                  </div>

                  <div class="h-[28vh] overflow-y-auto">
                    <ListSegmentationsFields
                      v-if="pageState === 'data'"
                      v-model="form.segmentation_fields"
                    />
                  </div>
                </div>

                <div
                  v-show="pageState === 'products'"
                  class="bg-base-300 flex flex-col overflow-auto h-[40vh] overflow-y-auto"
                >
                  <ListProducts v-model="form.products" />
                </div>
              </section>
            </div>

            <!-- --- Rodapé (Botão de salvar) --- -->
            <div class="modal_end_button">
              <button
                :disabled="loading"
                class="bg-green-500 py-2 px-4 rounded-lg text-sm font-medium hover:bg-green-500/80 transition-colors flex gap-2 items-center justify-center min-w-32"
                @click="saveClient()"
              >
                <div
                  v-if="loading"
                  class="size-4 animate-spin rounded-full border-4 border-solid text-white border-t-transparent"
                />
                <p class="text-xs font-semibold" v-else>Salvar</p>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.test-style {
  @apply flex flex-col rounded-md bg-base-200 border border-white/10 shadow-sm transition-shadow duration-200 hover:shadow-md;
}

::v-deep(.vti__phone) {
  @apply p-0;
}

::v-deep(.vti__dropdown) {
  @apply rounded-bl-lg rounded-t-none bg-base-300 border border-base-300 shadow-md;
}

::v-deep(.vti__dropdown-item) {
  @apply flex items-center gap-2 px-2  hover:bg-base-200/50 transition text-xs justify-between hover:scale-105 truncate;
}

::v-deep(.vti__input) {
  @apply w-full text-xs bg-base-300 outline-none border-none focus:outline-none focus:ring-0 focus:shadow-none placeholder:text-gray-500 rounded-br-lg rounded-t-none h-10;
}

::v-deep(.vti__flag) {
  @apply pl-5;
}

::v-deep(.vti__dropdown-list) {
  @apply rounded-none  bg-base-300 rounded-b-md border border-base-200 shadow-lg shadow-green-500/20 overflow-x-hidden text-xs max-h-32;

  /* Scroll personalizado dentro do dropdown */
  scrollbar-width: thin;
  scrollbar-color: #334155 transparent;

  &::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  &::-webkit-scrollbar-thumb {
    background: linear-gradient(180deg, #334155, #1e293b);
    border-radius: 8px;
    transition: background 0.2s ease;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: linear-gradient(180deg, #475569, #1e293b);
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }
}

::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, #334155, #1e293b);
  border-radius: 8px;
  transition: background 0.2s ease;
}

::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(180deg, #475569, #1e293b);
}

::-webkit-scrollbar-track {
  background: transparent;
}

/* Para Firefox */
* {
  scrollbar-width: thin;
  scrollbar-color: #334155 transparent;
}
</style>
