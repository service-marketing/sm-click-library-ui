<script setup>
/**
 * Componente que auxilia na secao de contato do formulario de clientes.
 */

import { computed, ref } from "vue";

import SimpleModal from "../../modals/simple_modal/simple_modal.vue";
import ListProducts from "./listProducts.vue";
import ListSegmentationsFields from "./listSegmentationsFields.vue";
import ToggleListButtons from "./toggleListButtons.vue";
import { WalletSection } from "./wallet/index.js";
import InstagramBadge from "./instagramBadge.vue";

const props = defineProps({
  hasCrmPlus: { type: Boolean, default: false },
  handlerToggleButtons: { type: Array, default: () => [] },
  allProducts: { type: Object, default: () => ({}) },
  departmentBypass: {
    type: [String, Number, Boolean, Object],
    default: undefined,
  },
  currentAttendance: {
    type: Object,
    default: () => null,
  },
  supervisor: { type: Boolean, default: false },
  isLargeScreen: { type: Boolean, default: true },
  viewContactNumber: { type: Boolean, default: false },
  contactId: {
    type: [String, Number],
    default: "",
  },
  contact: {
    type: Object,
    default: () => null,
  },
});

// --- v-model separados para atualizar o form ---
const pageState = defineModel("pageState", { type: String, default: "data" });
const telephone = defineModel("telephone", { type: String, default: "" });
const country = defineModel("country", { type: String, default: "br" });
const instagramUserName = defineModel("instagramUserName", {
  type: String,
  default: "",
});
const segmentationFields = defineModel("segmentationFields", {
  type: Array,
  default: () => [],
});
const products = defineModel("products", { type: Array, default: () => [] });

const handleTelephoneInput = (value, phoneObject) => {
  // vue-tel-input pode retornar um objeto ou string
  const phoneValue = phoneObject?.number || value || "";
  // Remove tudo que nao for numero, espaco, parenteses ou hifen
  const sanitized = String(phoneValue).replace(/[^\d\s()-]/g, "");
  telephone.value = sanitized;
};

const whatsappBindings = computed(() => {
  const items = props.contact?.whatsapp_infos || [];
  return items
    .filter((item) => item?.meta_business_acc_id || item?.whatsapp_bsuid)
    .map((item, index) => ({
      id: item.id || `wa-${index}`,
      instanceName: item.instance || "",
      bsuid: item.whatsapp_bsuid || "BSUID não informado",
      user_name: item.whatsapp_user_name || "",
    }))
    .filter((item) => item.instanceName);
});

const instagramBindings = computed(() => {
  const items = props.contact?.instagram_infos || [];

  return items
    .filter((item) => item?.instagram_account_id || item?.instagram_bsuid)
    .map((item, index) => ({
      id: item.id || `ig-${index}`,
      instanceName: item.instance || "",
      bsuid: item.instagram_bsuid || "BSUID não informado",
      user_name: item.instagram_user_name || "",
    }))
    .filter((item) => item.instanceName);
});

const hasContactBindings = computed(
  () =>
    whatsappBindings.value.length > 0 || instagramBindings.value.length > 0,
);

const showBsuidHelp = ref(false);
</script>

<template>
  <ToggleListButtons
    v-if="isLargeScreen && hasCrmPlus"
    class="section-toggle"
    :buttons="props.handlerToggleButtons"
    v-model="pageState"
  />

  <div
    v-show="pageState === 'data'"
    :class="[
      props.hasCrmPlus ? 'pt-1' : 'pt-0',
      'flex flex-col gap-2 flex-1 min-h-0 px-1.5 overflow-hidden',
    ]"
  >
    <div
      class="rounded-md bg-base-200 p-1 shadow-sm transition-shadow duration-200 hover:shadow-md"
    >
      <h1 class="text-start w-full items-center justify-between flex p-1 pb-2">
        <p class="text-xs font-semibold">Contatos</p>

        <Popper v-if="hasContactBindings" class="dark:popper-light popper-dark" placement="bottom" :arrow="true" :offsetDistance="4">
          <button
            type="button"
            class="bindings-info-btn"
            title="IDs por conta conectada"
          >
            <svg
              class="size-3.5"
              aria-hidden="true"
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
          </button>

          <template #content>
            <div class="bindings-popover">
              <div class="bindings-header-row">
                <p class="bindings-header">IDs por conta conectada</p>
                <button
                  type="button"
                  class="bindings-help-btn"
                  title="O que é o BSUID?"
                  @click.stop="showBsuidHelp = true"
                >
                  ?
                </button>
              </div>

              <section v-if="whatsappBindings.length">
                <div class="bindings-platform-title">
                  <svg class="size-3 text-emerald-400" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 17 17">
                    <path d="M13.601 2.326A7.854 7.854 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.933 7.933 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.898 7.898 0 0 0 13.6 2.326zM7.994 14.521a6.573 6.573 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.557 6.557 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592zm3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.729.729 0 0 0-.529.247c-.182.198-.691.677-.691 1.654 0 .977.71 1.916.81 2.049.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232z" />
                  </svg>
                  <span class="text-emerald-400">WhatsApp</span>
                </div>
                <ul class="bindings-list">
                  <li v-for="item in whatsappBindings" :key="item.id" class="bindings-popover-item">
                    <div class="bindings-row">
                      <span class="bindings-label">Instância</span>
                      <span class="bindings-value">{{ item.instanceName }}</span>
                    </div>
                    <div class="bindings-row">
                      <span class="bindings-label">BSUID</span>
                      <span class="bindings-value">{{ item.bsuid }}</span>
                    </div>
                    <div class="bindings-row">
                      <span class="bindings-label">Nome</span>
                      <span class="bindings-value">{{ item.user_name }}</span>
                    </div>
                  </li>
                </ul>
              </section>

              <hr v-if="whatsappBindings.length && instagramBindings.length" class="bindings-divider" />

              <section v-if="instagramBindings.length">
                <div class="bindings-platform-title">
                  <svg class="size-3" style="fill: url(#ig-grad)" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16">
                    <defs>
                      <linearGradient id="ig-grad" x1="0%" y1="100%" x2="100%" y2="0%">
                        <stop offset="0%" stop-color="#f58529" />
                        <stop offset="40%" stop-color="#dd2a7b" />
                        <stop offset="70%" stop-color="#8134af" />
                        <stop offset="100%" stop-color="#515bd4" />
                      </linearGradient>
                    </defs>
                    <path d="M8 0C5.829 0 5.556.01 4.703.048 3.85.088 3.269.222 2.76.42a3.917 3.917 0 0 0-1.417.923A3.927 3.927 0 0 0 .42 2.76C.222 3.268.087 3.85.048 4.7.01 5.555 0 5.827 0 8.001c0 2.172.01 2.444.048 3.297.04.852.174 1.433.372 1.942.205.526.478.972.923 1.417.444.445.89.719 1.416.923.51.198 1.09.333 1.942.372C5.555 15.99 5.827 16 8 16s2.444-.01 3.298-.048c.851-.04 1.434-.174 1.943-.372a3.916 3.916 0 0 0 1.416-.923c.445-.445.718-.891.923-1.417.197-.509.332-1.09.372-1.942C15.99 10.445 16 10.173 16 8s-.01-2.445-.048-3.299c-.04-.851-.175-1.433-.372-1.941a3.926 3.926 0 0 0-.923-1.417A3.911 3.911 0 0 0 13.24.42c-.51-.198-1.092-.333-1.943-.372C10.443.01 10.172 0 7.998 0h.003zm-.717 1.442h.718c2.136 0 2.389.007 3.232.046.78.035 1.204.166 1.486.275.373.145.64.319.92.599.28.28.453.546.598.92.11.281.24.705.275 1.485.039.843.047 1.096.047 3.231s-.008 2.389-.047 3.232c-.035.78-.166 1.203-.275 1.485a2.47 2.47 0 0 1-.599.919c-.28.28-.546.453-.92.598-.28.11-.704.24-1.485.276-.843.038-1.096.047-3.232.047s-2.39-.009-3.233-.047c-.78-.036-1.203-.166-1.485-.276a2.478 2.478 0 0 1-.92-.598 2.48 2.48 0 0 1-.6-.92c-.109-.281-.24-.705-.275-1.485-.038-.843-.046-1.096-.046-3.233 0-2.136.008-2.388.046-3.231.036-.78.166-1.204.276-1.486.145-.373.319-.64.599-.92.28-.28.546-.453.92-.598.282-.11.705-.24 1.485-.276.738-.034 1.024-.044 2.515-.045v.002zm4.988 1.328a.96.96 0 1 0 0 1.92.96.96 0 0 0 0-1.92zm-4.27 1.122a4.109 4.109 0 1 0 0 8.217 4.109 4.109 0 0 0 0-8.217zm0 1.441a2.667 2.667 0 1 1 0 5.334 2.667 2.667 0 0 1 0-5.334z" />
                  </svg>
                  <span class="ig-gradient-text">Instagram</span>
                </div>
                <ul class="bindings-list">
                  <li v-for="item in instagramBindings" :key="item.id"  class="bindings-popover-item">
                    <div class="bindings-row">
                      <span class="bindings-label">Instância</span>
                      <span class="bindings-value">{{ item.instanceName }}</span>
                    </div>
                    <div class="bindings-row">
                      <span class="bindings-label">BSUID</span>
                      <span class="bindings-value">{{ item.bsuid }}</span>
                    </div>
                    <div class="bindings-row">
                      <span class="bindings-label">Nome</span>
                      <span class="bindings-value">{{ item.user_name }}</span>
                    </div>
                  </li>
                </ul>
              </section>
            </div>
          </template>
        </Popper>
      </h1>

      <div
        style="
          border-bottom-right-radius: 0.35rem;
          border-bottom-left-radius: 0.35rem;
        "
        class="flex w-full relative rounded-md bg-base-300"
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
          @update:modelValue="handleTelephoneInput"
          :mode="'national'"
          :validCharactersOnly="true"
          :defaultCountry="country || 'br'"
          :modelValue="telephone || ''"
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
        ></vue-tel-input>

        <div
          class="text-xs font-medium font-sans py-3 blur-sm select-none"
          v-else
        >
          +55 00000-0000
        </div>
      </div>

      <div
        v-if="instagramUserName"
        class="flex w-full relative rounded-md bg-base-300 mt-1"
      >
        <span class="flex justify-center items-center w-8">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="currentColor"
            class="size-4 text-gray-500 ml-1.5"
            viewBox="0 0 24 24"
          >
            <path
              d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 2.25c5.376 0 9.75 4.374 9.75 9.75s-4.374 9.75-9.75 9.75S2.25 17.376 2.25 12 6.624 2.25 12 2.25zm4.875 9.75c0 2.691-2.184 4.875-4.875 4.875s-4.875-2.184-4.875-4.875 2.184-4.875 4.875-4.875 4.875 2.184 4.875 4.875zm-1.906 0c0-1.637-1.332-2.969-2.969-2.969-1.636 0-2.969 1.332-2.969 2.969 0 1.637 1.333 2.969 2.969 2.969 1.637 0 2.969-1.332 2.969-2.969zm2.719-5.25c0 .621-.504 1.125-1.125 1.125s-1.125-.504-1.125-1.125.504-1.125 1.125-1.125 1.125.504 1.125 1.125z"
            ></path>
          </svg>
        </span>

        <div class="flex items-center w-full px-1 py-1.5 text-sm">
          <InstagramBadge
            :hide-svg="true"
            size="large"
            :instagram-user-name="instagramUserName"
          />
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

  <div v-show="pageState === 'wallet'">
    <WalletSection
      :contact-id="props.contactId"
      :contact="props.contact"
      :current-attendance="props.currentAttendance"
      :supervisor="props.supervisor"
      :page-state="pageState"
    />
  </div>

<Teleport to="body">
  <SimpleModal
    v-model:is-open="showBsuidHelp"
    size="w-max"
    class="text-white"
    :header="{
      title: 'O que é o BSUID?',
      svg: `<svg class='w-5 mr-2 text-blue-400 inline-block' viewBox='0 0 20 20' fill='currentColor'><path fill-rule='evenodd' d='M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z' clip-rule='evenodd'/></svg>`,
    }"
  >
    <template #body>
      <div class="bsuid-help-body">
        <p class="bsuid-help-intro">
          O <strong>BSUID</strong> (Business-Scoped User ID) é um identificador único criado pela Meta para cada usuário do WhatsApp ou Instagram, específico para cada portfólio de negócios.
        </p>

        <div class="bsuid-help-rule">
          <svg class="bsuid-help-icon bsuid-help-icon--blue" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 2a8 8 0 100 16A8 8 0 0010 2zm0 3a1 1 0 011 1v4a1 1 0 11-2 0V6a1 1 0 011-1zm0 8a1 1 0 100 2 1 1 0 000-2z" clip-rule="evenodd" />
          </svg>
          <span>O mesmo contato terá um <strong>BSUID diferente para cada instância</strong> conectada ao sistema — mesmo que seja o mesmo número, cada instância de negócio enxerga o usuário com seu próprio ID único.</span>
        </div>

        <div class="bsuid-help-rule">
          <svg class="bsuid-help-icon bsuid-help-icon--green" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
          </svg>
          <span>O BSUID é <strong>permanente</strong> enquanto o usuário não trocar de número de telefone — diferente do nome, que pode mudar a qualquer momento.</span>
        </div>

        <div class="bsuid-help-rule">
          <svg class="bsuid-help-icon" viewBox="0 0 20 20" fill="currentColor">
            <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
          </svg>
          <span>O mesmo vale para o <strong>Instagram</strong>: cada instância terá um BSUID diferente para o mesmo perfil do usuário.</span>
        </div>

        <div class="bsuid-help-rule">
          <svg class="bsuid-help-icon bsuid-help-icon--yellow" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
          </svg>
          <span>Se um usuário <strong>trocar de número</strong>, o BSUID anterior se tornará inválido e um novo será gerado automaticamente pela Meta.</span>
        </div>

        <div class="bsuid-help-example">
          <span class="bsuid-help-example__label">Exemplo de BSUID</span>
          <code class="bsuid-help-example__code">BR.13491208655302741918</code>
          <span class="bsuid-help-example__note">Prefixo com o código do país (ISO 3166) + identificador único de até 128 caracteres</span>
        </div>
      </div>
    </template>

    <template #footer>
      <button
        class="bsuid-help-close-btn"
        type="button"
        @click="showBsuidHelp = false"
      >
        Entendi
      </button>
    </template>
  </SimpleModal>
</Teleport>
</template>

<style scoped>
.section-toggle {
  padding: 0 0.25rem;
}

.list-products-container {
  flex: 1 1 0%;
  min-height: 0px;
  padding: 0.2rem 0.2rem 0.35rem;
}

.segmentation-fields-container {
  flex: 1 1 0%;
  min-height: 0px;
  overflow-y: auto;
  border-radius: 0.625rem;
}

/* Normaliza o tema do Popper independente do app consumidor */
.popper-dark {
  --popper-theme-background-color: #111b21;
  --popper-theme-background-color-hover: #111b21;
  --popper-theme-text-color: #ffffff;
  --popper-theme-border-width: 0px;
  --popper-theme-border-radius: 8px;
  --popper-theme-padding: 8px;
  --popper-theme-box-shadow: 0 6px 30px -6px rgba(0, 0, 0, 0.9);
}

.popper-light {
  --popper-theme-background-color: #ffffff;
  --popper-theme-background-color-hover: #ffffff;
  --popper-theme-text-color: #333333;
  --popper-theme-border-width: 1px;
  --popper-theme-border-style: solid;
  --popper-theme-border-color: #eeeeee;
  --popper-theme-border-radius: 8px;
  --popper-theme-padding: 8px;
  --popper-theme-box-shadow: 0 6px 30px -6px rgba(0, 0, 0, 0.5);
}

.bindings-info-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.2rem;
  border-radius: 9999px;
  opacity: 0.5;
  transition: opacity 150ms ease, color 150ms ease;
}

.bindings-info-btn:hover {
  opacity: 1;
}

/* Popover container */
.bindings-popover {
  font-size: 0.72rem;
  line-height: 1.25rem;
  min-width: 15rem;
  max-width: 20rem;
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
}

/* Subtle overline header */
.bindings-header {
  font-size: 0.63rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  opacity: 0.4;
}

/* Platform row: icon + name */
.bindings-platform-title {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  font-weight: 600;
  font-size: 0.72rem;
  margin-bottom: 0.35rem;
}

/* List of binding items */
.bindings-list {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

/* Each binding card */
.bindings-popover-item {
  border-radius: 0.375rem;
  padding: 0.35rem 0.5rem;
  background: rgb(255 255 255 / 0.06);
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
}

/* Label + value row */
.bindings-row {
  display: flex;
  align-items: baseline;
  gap: 0.4rem;
}

.bindings-label {
  font-size: 0.62rem;
  opacity: 0.45;
  flex-shrink: 0;
  min-width: 2.6rem;
}

.bindings-value {
  word-break: break-all;
}

.bindings-value.mono {
  font-family: ui-monospace, 'Cascadia Code', monospace;
  font-size: 0.67rem;
  letter-spacing: -0.01em;
}

/* Divider between platforms */
.bindings-divider {
  border: none;
  border-top: 1px solid rgb(255 255 255 / 0.08);
  margin: 0;
}

.ig-gradient-text {
  background: linear-gradient(45deg, #f58529, #dd2a7b, #8134af, #515bd4);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-weight: 600;
}

/* Header row with help button */
.bindings-header-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.4rem;
}

.bindings-help-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1rem;
  height: 1rem;
  border-radius: 50%;
  font-size: 0.6rem;
  font-weight: 700;
  line-height: 1;
  background: rgba(148, 163, 184, 0.15);
  border: 1px solid rgba(148, 163, 184, 0.25);
  color: rgba(148, 163, 184, 0.7);
  cursor: pointer;
  flex-shrink: 0;
  transition: background 150ms ease, border-color 150ms ease, color 150ms ease;
}

.bindings-help-btn:hover {
  background: rgba(96, 165, 250, 0.2);
  border-color: rgba(96, 165, 250, 0.4);
  color: rgb(147, 197, 253);
}

/* BSUID help modal styles */
.bsuid-help-body {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 1rem 1.25rem 1.25rem;
  text-align: left;
}

.bsuid-help-intro {
  font-size: 0.8rem;
  line-height: 1.55;
  color: rgba(203, 213, 225, 0.85);
}

.bsuid-help-intro strong {
  color: rgb(226, 232, 240);
}

.bsuid-help-rule {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  font-size: 0.78rem;
  line-height: 1.5;
  color: rgba(203, 213, 225, 0.75);
}

.bsuid-help-rule strong {
  color: rgb(226, 232, 240);
}

.bsuid-help-icon {
  width: 0.9rem;
  height: 0.9rem;
  flex-shrink: 0;
  margin-top: 0.15rem;
  color: rgba(148, 163, 184, 0.5);
}

.bsuid-help-icon--blue { color: rgb(96, 165, 250); }
.bsuid-help-icon--green { color: rgb(74, 222, 128); }
.bsuid-help-icon--yellow { color: rgb(250, 204, 21); }

.bsuid-help-example {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  padding: 0.5rem 0.75rem;
  border-radius: 0.5rem;
  background: rgba(148, 163, 184, 0.07);
  border: 1px dashed rgba(148, 163, 184, 0.2);
}

.bsuid-help-example__label {
  font-size: 0.62rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  opacity: 0.4;
}

.bsuid-help-example__code {
  font-family: ui-monospace, 'Cascadia Code', monospace;
  font-size: 0.75rem;
  color: rgb(147, 197, 253);
  letter-spacing: 0.01em;
}

.bsuid-help-example__note {
  font-size: 0.67rem;
  opacity: 0.5;
  line-height: 1.4;
}

.bsuid-help-close-btn {
  margin-left: auto;
  font-size: 0.8rem;
  font-weight: 600;
  padding: 0.375rem 1rem;
  border-radius: 0.5rem;
  background: rgba(96, 165, 250, 0.15);
  border: 1px solid rgba(96, 165, 250, 0.25);
  color: rgb(147, 197, 253);
  cursor: pointer;
  transition: all 150ms ease;
}

.bsuid-help-close-btn:hover {
  background: rgba(96, 165, 250, 0.25);
  border-color: rgba(96, 165, 250, 0.4);
}
</style>
