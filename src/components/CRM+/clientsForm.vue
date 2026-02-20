<script setup>
/**
 * 📋 Descrição:
 * Componente de botões para definir o resultado de uma oportunidade (Ganho ou Perdido).
 */

import {
  computed,
  onMounted,
  onUnmounted,
  reactive,
  watch,
  toRaw,
  ref,
} from "vue";
import SelectMultipleTags from "../selects/multiSelects/selectMultipleTags.vue";
import OutcomeButton from "./clientsComponents/outcomeButton.vue";
import PrimaryInput from "../inputs/primaryInput.vue";
import RatingInput from "../inputs/ratingInput.vue";
import ToggleListButtons from "./clientsComponents/toggleListButtons.vue";
import ContactSection from "./clientsComponents/contactSection.vue";

const emit = defineEmits(["close", "save"]);
const pageState = ref("contact");
const teleportContainerId = "selectTags-portal-container";

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
      segmentation_fields: [],
      products: [],
      notes: "",
    }),
  },
  // --- Função que salva o formulário ---
  save: {
    type: Function,
    default: () => {},
  },
  // --- Checa o estado do modulo de CRM ---
  hasCrmPlus: {
    type: Boolean,
    default: false,
  },
  // --- Lista de todos os produtos disponíveis e bloqueia o fetch na lista de produtos ---
  allProducts: {
    type: Object,
    default: () => {},
  },
  // --- Lista de todas as tags disponíveis e bloqueia o fetch na lista de tags ---
  allTags: {
    type: Object,
    default: () => {},
  },
  // --- ID do departamento para ignorar bloqueio de produtos ---
  departmentBypass: {
    type: String,
    default: "",
  },
});

// --- Estado principal do formulário ---
const form = reactive({ ...props.form });
const loading = ref(false);
const errors = ref(false);
const formBackup = ref(null);

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
    empty: computed(() =>
      errors.value ? errors.value.some((e) => e.startsWith("name")) : false,
    ),
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
  props.form.mode === "edit" ? "Editar cliente" : "Adicionar Novo Cliente",
);

const validateClient = (client) => {
  const missing = [];
  const isLid = client.whatsapp_id?.endsWith("@lid");
  const canViewNumber = client.viewContactNumber;

  if (!client.name?.trim()) {
    missing.push("name");
  }

  if (!isLid && canViewNumber && !client.telephone?.trim()) {
    missing.push("telephone");
  }

  return missing;
};

const isEmptyNumber = computed(() => {
  return errors.value
    ? errors.value.some((e) => e.startsWith("telephone"))
    : false;
});

// --- Função de salvar cliente ---
const saveClient = async () => {
  try {
    loading.value = true;
    errors.value = validateClient(form);
    if (errors.value.length > 0) return;

    // Faz backup do estado antes de salvar
    formBackup.value = JSON.parse(JSON.stringify(form));

    await props.save(formBackup.value);
  } catch (e) {
    console.error(e);
    // if (formBackup.value) {
    //   Object.assign(form, formBackup.value);
    // }
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
  { immediate: true },
);

const width = ref(window.innerWidth);

// Atualiza width quando a tela mudar
const updateWidth = () => {
  width.value = window.innerWidth;
};

onMounted(() => {
  window.addEventListener("resize", updateWidth);
});

onUnmounted(() => {
  window.removeEventListener("resize", updateWidth);
});

const isLargeScreen = computed(() => width.value >= 640);

watch(
  isLargeScreen,
  (oldvalue, newVal) => {
    if (newVal) {
      pageState.value = "contact";
    } else if (!newVal && oldvalue) {
      pageState.value = "data";
    }
  },
  { immediate: true },
);

const toggleButtons = [
  { label: "Informações", value: "data" },
  {
    label: "Produtos",
    value: "products",
    disabled:
      props.form.status === "screening" || props.form.status === "finished",
  },
];

const handlerToggleButtons = computed(() => {
  const contactItem = { label: "Contato", value: "contact" };

  const baseList = toggleButtons.filter((item) => item.value !== "contact");

  if (!props.hasCrmPlus) {
    return [
      contactItem,
      ...baseList.filter((item) => item.value !== "products"),
    ];
  }

  return isLargeScreen.value ? [...baseList] : [contactItem, ...baseList];
});
</script>

<template>
  <div class="modal-form-container-wrapper">
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
            <!-- --- Container para teleport --- -->
            <div :id="teleportContainerId" class="relative"></div>
            <!-- --- Header --- -->
            <div class="modal-form-header bg-base-300">
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
                  <p class="text-lg">{{ modalTitle }}</p>
                  <p v-if="form.id" class="id-label-clients">
                    ID: {{ form.id }}
                  </p>
                </span>
              </span>

              <section class="flex gap-2 items-center">
                <button
                  class="bg-base-200 p-1.5 rounded-md hover:bg-base-100 transition"
                  @click="emit('close')"
                >
                  <svg
                    class="size-4 text-white dark:text-black"
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
            <div
              :class="isLargeScreen ? 'grid grid-cols-2' : 'flex'"
              class="modal-form-body"
            >
              <!-- Coluna Esquerda -->
              <section
                :class="
                  pageState !== 'contact' && !isLargeScreen ? 'pt-1.5' : 'p-1.5'
                "
                class="left-column"
              >
                <!-- Bloco fixo (avatar / outcome / rating) -->
                <ToggleListButtons
                  :buttons="handlerToggleButtons"
                  v-model="pageState"
                  v-if="!isLargeScreen"
                />

                <div
                  v-if="isLargeScreen || pageState === 'contact'"
                  class="flex flex-col gap-1 items-center"
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
                    <img
                      v-if="form.photo"
                      :src="form.photo"
                      alt=""
                      class="avatar-client"
                    />

                    <span v-else class="no-avatar-client"
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

                  <RatingInput v-if="hasCrmPlus" v-model="form.rating" />
                </div>

                <div
                  v-if="isLargeScreen || pageState === 'contact'"
                  class="modal-form-left-column-body"
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
                          class="size-4 text-white dark:text-black"
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
                      :teleportTo="`#${teleportContainerId}`"
                      :allTags="allTags"
                      v-model="form.tags"
                    />
                  </div>

                  <div
                    v-if="hasCrmPlus"
                    class="h-full flex flex-col gap-2 w-full"
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
                          class="size-4 text-white dark:text-black"
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
                        class="form-text-area bg-base-300 min-h-0 flex-1"
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

                <section
                  v-show="!isLargeScreen && pageState !== 'contact'"
                  class="right-column bg-base-300"
                >
                  <ContactSection
                    :viewContactNumber="form.viewContactNumber"
                    :hasCrmPlus="hasCrmPlus"
                    :handlerToggleButtons="handlerToggleButtons"
                    :allProducts="allProducts"
                    :departmentBypass="departmentBypass"
                    :isEmptyNumber="isEmptyNumber"
                    :isLargeScreen="isLargeScreen"
                    v-model:pageState="pageState"
                    v-model:telephone="form.telephone"
                    v-model:country="form.country"
                    v-model:segmentationFields="form.segmentation_fields"
                    v-model:products="form.products"
                  />
                </section>
              </section>

              <!-- Coluna Direita -->
              <section v-if="isLargeScreen" class="right-column bg-base-300">
                <ContactSection
                  :viewContactNumber="form.viewContactNumber"
                  :hasCrmPlus="hasCrmPlus"
                  :handlerToggleButtons="handlerToggleButtons"
                  :allProducts="allProducts"
                  :departmentBypass="departmentBypass"
                  :isEmptyNumber="isEmptyNumber"
                  :isLargeScreen="isLargeScreen"
                  v-model:pageState="pageState"
                  v-model:telephone="form.telephone"
                  v-model:country="form.country"
                  v-model:segmentationFields="form.segmentation_fields"
                  v-model:products="form.products"
                />
              </section>
            </div>

            <!-- --- Rodapé (Botão de salvar) --- -->
            <div class="modal-form-end-button bg-base-300">
              <button
                :disabled="loading"
                class="button-save-clients"
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
.avatar-client {
  cursor: not-allowed;
  border-radius: 0.375rem;
  object-fit: cover;
  width: 3.5rem;
  height: 3.5rem;
}

.no-avatar-client {
  cursor: not-allowed;
  border-width: 1px;
  justify-content: center;
  align-items: center;
  display: flex;
  width: 3.5rem;
  height: 3.5rem;
  border-radius: 0.75rem;
  padding: 0.5rem;
  @apply bg-base-300 p-2 border-base-100;
}

.id-label-clients {
  color: #9ca3af;
  font-size: 10px;
}

@media (min-width: 864px) {
  .avatar-client {
    width: 4.5rem;
    height: 4.5rem;
  }
  .no-avatar-client {
    width: 4.5rem;
    height: 4.5rem;
  }
}

@media (min-width: 640px) {
  .id-label-clients {
    font-size: 0.75rem;
    line-height: 1rem;
  }
}

.modal-form-left-column-body {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  width: 100%;
  height: 100%;
  /* justify-content: space-between; */
}

.modal-form-header {
  display: flex;
  justify-content: space-between;
  padding: 0.625rem;
  border-top-left-radius: 1rem;
  border-top-right-radius: 1rem;
  align-items: center;
  color: currentColor;
}
.button-save-clients {
  padding-top: 0.5rem;
  padding-bottom: 0.5rem;
  padding-left: 1rem;
  padding-right: 1rem;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  line-height: 1.25rem;
  font-weight: 500;
  background-color: rgb(34 197 94 / 0.8);
  transition-property:
    color, background-color, border-color, text-decoration-color, fill, stroke;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
  display: flex;
  gap: 0.5rem;
  align-items: center;
  justify-content: center;
  min-width: 8rem;
}

.right-column {
  height: 100%;
  min-height: 0px;
  flex-direction: column;
  display: flex;
  padding-top: 0.25rem;
  padding-bottom: 0.25rem;
  padding-left: 0.125rem;
  padding-right: 0.125rem;
  border-top-left-radius: 0.375rem;
  border-bottom-left-radius: 0.375rem;
}

.left-column {
  display: flex;
  gap: 0.5rem;
  flex-direction: column;
  height: 100%;
  min-height: 0px;
  @apply overflow-y-auto overflow-x-hidden w-full;
}

.modal-form-body {
  height: 100%;
  min-height: 0px;
  @apply flex sm:grid sm:grid-cols-2;
}

.form-text-area {
  @apply resize-none w-full text-xs rounded-md outline-none border-none focus:outline-none focus:ring-0 focus:shadow-none p-2 min-h-20 max-h-full;
  height: 100%;
}
.modal-form-container-wrapper {
  @apply my_modal-form backdrop-blur-[2px] z-50 fixed w-full h-full top-0 left-0 flex items-center justify-center;
}

.my_modal-form {
  animation: 0.1s ease-out 0s 1 modalani;
  transition: opacity 0.2s ease-in-out;
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
  @apply shadow shadow-black;
}
.modal-form-end-button {
  display: flex;
  justify-content: flex-end;
  padding: 0.5rem;
  border-bottom-right-radius: 1rem;
  border-bottom-left-radius: 1rem;
  /* background-color: #111b21; */
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
}

.clients-form-background.noCrmPlus {
  max-height: 350px;
}

@media (min-width: 1920px) {
  .clients-form-background {
    height: 65vh;
    max-height: 65vh;
  }
}

::v-deep(.vti__phone) {
  @apply p-0;
}

::v-deep(.vti__dropdown) {
  @apply rounded-none shadow-none bg-transparent;
}

::v-deep(.vti__dropdown-item) {
}

::v-deep(.vti__input) {
  @apply w-full text-xs outline-none border-none focus:outline-none focus:ring-0 focus:shadow-none placeholder:text-gray-500 rounded-br-lg rounded-t-none h-10 shadow-none bg-transparent;
}

::v-deep(.vti__flag) {
  @apply pl-5;
}

::v-deep(.vti__dropdown-list) {
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
