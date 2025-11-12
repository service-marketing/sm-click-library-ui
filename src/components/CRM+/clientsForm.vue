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
      notes: "",
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
  allProducts: {
    type: Object,
    default: () => {},
  },
  allTags: {
    type: Object,
    default: () => {},
  },
});

// --- Estado principal do formulário ---
const form = reactive({ ...props.form });
const loading = ref(false);
const erros = ref(false);

const configTextArea = {
  title: "Anotações",
  info: "Descreva o produto para facilitar a identificação",
  type: "textArea",
  placeholder:
    "Automatize fluxos de trabalho com integração rápida e segura entre sistemas.",
  empty: false,
  data: null,
};

const configNameInput = ref([
  {
    title: "Nome",
    info: false,
    type: "text",
    placeholder: "Digite o nome do contato",
    empty: computed(() => erros.value),
    data: computed({
      get: () => form.name,
      set: (value) => (form.name = value),
    }),
  },
  {
    title: "Descrição",
    info: "Descreva o produto para facilitar a identificação",
    type: "textArea",
    placeholder:
      "Automatize fluxos de trabalho com integração rápida e segura entre sistemas.",
    empty: false,
    data: computed({
      get: () => form.notes,
      set: (val) => (form.notes = val),
    }),
  },
]);

const modalTitle = computed(() =>
  props.form.mode === "edit" ? "Editar cliente" : "Adicionar Novo Cliente"
);

// --- Função de salvar cliente ---
const saveClient = async () => {
  try {
    erros.value = form.name.trim() === "";
    if (erros.value) return;

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
    <div class="modal-form-background" />

    <div class="modal_responsive">
      <div
        style="min-height: 100%"
        class="flex min-h-full items-center justify-center text-center"
      >
        <div class="modal-form-container">
          <div
            :class="{ noCrmPlus: !hasCrmPlus }"
            class="clients-form-background relative rounded-2xl bg-base-200 backdrop-blur-lg"
          >
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
            <div class="grid grid-cols-2 h-full min-h-0">
              <!-- Coluna Esquerda -->
              <section class="flex flex-col h-full min-h-0 px-1 py-2">
                <!-- Bloco fixo (avatar / outcome / rating) -->
                <div
                  :class="hasCrmPlus ? 'justify-between' : 'justify-center'"
                  class="flex flex-col gap-2 items-center"
                >
                  <OutcomeButton
                    v-if="hasCrmPlus"
                    :outcome="form.outcome"
                    @update:outcome="form.outcome = $event"
                  />

                  <div
                    title="Não é possível alterar a foto do cliente neste momento"
                    class="flex items-center justify-center w-full"
                  >
                    <button
                      v-if="form.photo"
                      @click="viewSingleImage(form.photo)"
                    >
                      <img
                        :src="form.photo"
                        alt=""
                        class="size-24 object-cover rounded-md cursor-not-allowed"
                      />
                    </button>

                    <span
                      v-else
                      class="bg-base-300 p-2 rounded-xl size-24 flex items-center justify-center border border-base-100 cursor-not-allowed"
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
                </div>
                <!-- Área rolável -->
                <div
                  class="flex flex-col gap-1.5 w-full h-full overflow-y-auto overflow-x-hidden"
                >
                  <div class="w-full">
                    <PrimaryInput
                      @update:content="
                        (newContent) =>
                          (configNameInput[0].data = newContent.data)
                      "
                      :content="configNameInput[0]"
                    />
                  </div>

                  <div class="flex flex-col gap-2 w-full">
                    <header class="flex items-center justify-between px-1">
                      <p class="text-xs font-medium text-left">
                        Escolha suas etiquetas
                      </p>

                      <Popper
                        hover
                        content="Etiquetas que estão atribuídas ao cliente"
                        placement="top"
                        arrow
                      >
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

                    <SelectMultipleTags
                      teleportTo="body"
                      maxHeight="10rem"
                      :allTags="allTags"
                      v-model="form.tags"
                    />
                  </div>

                  <div
                    v-if="hasCrmPlus"
                    class="flex flex-1 min-h-0 flex-col gap-2"
                  >
                    <header class="flex items-center justify-between px-1">
                      <p class="text-xs font-medium text-left">
                        Anotações sobre o cliente
                      </p>

                      <Popper
                        hover
                        content="Anotações adicionais sobre o cliente"
                        placement="top"
                        arrow
                      >
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

                    <div
                      class="w-full h-full bg-base-300 rounded-lg flex flex-col min-h-0"
                    >
                      <textarea
                        class="form-text-area flex-1 h-full min-h-0"
                        v-model="form.notes"
                        maxlength="1000"
                        aria-label="Anotações do cliente"
                      ></textarea>

                      <div
                        class="text-[10px] bg-base-300 px-1 rounded-md text-right mb-1 mr-1"
                        :class="
                          form.notes?.length > 900
                            ? 'text-red-500'
                            : form.notes?.length > 700
                            ? 'text-yellow-500'
                            : 'text-gray-400'
                        "
                      >
                        {{ form.notes?.length || 0 }}/1000
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              <!-- Coluna Direita -->
              <section
                class="bg-base-300 flex flex-col h-full min-h-0 overflow-hidden"
              >
                <div v-if="hasCrmPlus" class="flex gap-1 px-1.5">
                  <button
                    :class="[
                      'toggle-page-button',
                      { selected: pageState === 'data' },
                    ]"
                    @click="pageState = 'data'"
                  >
                    Informações
                  </button>

                  <button
                    :class="[
                      'toggle-page-button',
                      { selected: pageState === 'products' },
                    ]"
                    :disabled="!hasCrmPlus"
                    @click="pageState = 'products'"
                  >
                    <p>Produtos</p>
                  </button>
                </div>

                <div
                  v-show="pageState === 'data'"
                  class="flex flex-col gap-2 flex-1 min-h-0 px-1.5 pt-1.5 overflow-hidden"
                >
                  <div
                    class="rounded-md bg-base-200 border border-white/10 shadow-sm transition-shadow duration-200 hover:shadow-md"
                  >
                    <h1
                      class="text-start w-full items-center justify-between flex p-2"
                    >
                      <p class="text-xs font-semibold">Contatos</p>
                    </h1>

                    <div class="flex w-full">
                      <span
                        style="border-bottom-left-radius: 0.4rem"
                        class="bg-base-300 rounded-bl-lg rounded-t-none flex justify-center items-center w-8"
                      >
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
                        class="z-50 w-full"
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
                  </div>

                  <div class="segmentation-section">
                    <ListSegmentationsFields
                      v-model="form.segmentation_fields"
                    />
                  </div>
                </div>

                <div
                  v-show="pageState === 'products'"
                  class="products-list-section flex-1 min-h-0 overflow-y-auto"
                >
                  <ListProducts
                    :allProducts="allProducts"
                    v-model="form.products"
                  />
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
.form-text-area {
  @apply resize-none w-full bg-base-300 text-xs rounded-md outline-none border-none focus:outline-none focus:ring-0 focus:shadow-none p-2 min-h-20 max-h-full;
  height: 100%;
}

.modal-form-background {
  position: absolute;
  height: 100%;
  width: 100%;
  background-color: #000000;
  opacity: 0.2;
}

.modal-form-container {
  z-index: 50;
  width: 90%;
  border-radius: 1rem;
  overflow: auto;
  @apply shadow shadow-black;
}

@media (min-width: 1280px) {
  .modal-form-container {
    width: 55%;
  }
}

.clients-form-background {
  display: flex;
  flex-direction: column;
  height: 85vh;
  max-height: 85vh;
}

.clients-form-background.noCrmPlus {
  max-height: 361px;
}

@media (min-width: 1920px) {
  .clients-form-background {
    height: 65vh;
    max-height: 65vh;
  }
}

.toggle-page-button {
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #26343d;
  padding: 0.375rem;
  width: 100%;
  font-size: 0.75rem;
  line-height: 1rem;
  font-weight: 500;
  font-family: ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji",
    "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";
  transition-property: color, background-color, border-color,
    text-decoration-color, fill, stroke, opacity, box-shadow, transform, filter,
    backdrop-filter;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
  border-radius: 0.375rem /* 6px */;
}
.toggle-page-button:hover {
  background-color: rgb(38 52 61 / 0.7);
}
.toggle-page-button.selected {
  background-color: #16a34ad6;
}
.toggle-page-button.selected:hover {
  background-color: #16a34a;
}

.products-list-section,
.segmentation-section {
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}

::v-deep(.vti__phone) {
  @apply p-0;
}

::v-deep(.vti__dropdown) {
  @apply rounded-none bg-base-300 border border-base-300 shadow-md p-1;
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
