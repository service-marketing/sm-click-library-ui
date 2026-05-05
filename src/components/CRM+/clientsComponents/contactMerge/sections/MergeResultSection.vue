<script setup>
import { computed, ref } from "vue";
import MergeContactCard from "../contactCard.vue";
import FieldChangesSection from "./FieldChangesSection.vue";
import SimpleModal from "../../../../modals/simple_modal/simple_modal.vue";
import ProductsChangesSection from "./ProductsChangesSection.vue";
import SegmentationChangesSection from "./SegmentationChangesSection.vue";
import TagsChangesSection from "./TagsChangesSection.vue";

const props = defineProps({
  parentContact: {
    type: Object,
    required: true,
  },
  childContact: {
    type: Object,
    required: true,
  },
  mergePreview: {
    type: Object,
    default: null,
  },
});

const previewContact = computed(() => {
  const base = props.mergePreview || {
    name: props.parentContact?.name || props.childContact?.name,
    telephone: props.parentContact?.telephone || props.childContact?.telephone,
    whatsapp_id:
      props.parentContact?.whatsapp_id || props.childContact?.whatsapp_id,
    instagram_user_name:
      props.parentContact?.instagram_user_name ||
      props.childContact?.instagram_user_name,
  };

  // Combina as conexões de ambos os contatos no resultado da mesclagem
  const whatsappInfos = [
    ...(props.parentContact?.whatsapp_infos || []),
    ...(props.childContact?.whatsapp_infos || []),
  ];
  const instagramInfos = [
    ...(props.parentContact?.instagram_infos || []),
    ...(props.childContact?.instagram_infos || []),
  ];

  return {
    ...base,
    photo:
      base.photo || props.parentContact?.photo || props.childContact?.photo,
    whatsapp_infos: whatsappInfos,
    instagram_infos: instagramInfos,
  };
});

const fieldChangesCount = ref(0);
const tagsChangesCount = ref(0);
const productsChangesCount = ref(0);
const segmentationChangesCount = ref(0);
const showConnections = ref(false);
const showConnectionsHelp = ref(false);

const connectionsMerge = computed(() => {
  const parentWa = (props.parentContact?.whatsapp_infos || [])
    .filter((item) => item?.instance)
    .map((item, i) => ({
      id: item.id || `pwa-${i}`,
      platform: "whatsapp",
      instanceName: item.instance,
      userName: item.whatsapp_user_name || "",
      fromChild: false,
    }));

  const childWa = (props.childContact?.whatsapp_infos || [])
    .filter((item) => item?.instance)
    .map((item, i) => ({
      id: item.id || `cwa-${i}`,
      platform: "whatsapp",
      instanceName: item.instance,
      userName: item.whatsapp_user_name || "",
      fromChild: true,
    }));

  const parentIg = (props.parentContact?.instagram_infos || [])
    .filter((item) => item?.instance)
    .map((item, i) => ({
      id: item.id || `pig-${i}`,
      platform: "instagram",
      instanceName: item.instance,
      userName: item.instagram_user_name || "",
      fromChild: false,
    }));

  const childIg = (props.childContact?.instagram_infos || [])
    .filter((item) => item?.instance)
    .map((item, i) => ({
      id: item.id || `cig-${i}`,
      platform: "instagram",
      instanceName: item.instance,
      userName: item.instagram_user_name || "",
      fromChild: true,
    }));

  return [...parentWa, ...childWa, ...parentIg, ...childIg];
});

const connectionsNewCount = computed(
  () => connectionsMerge.value.filter((c) => c.fromChild).length,
);

const totalChanges = computed(() => {
  return (
    fieldChangesCount.value +
    tagsChangesCount.value +
    productsChangesCount.value +
    segmentationChangesCount.value +
    connectionsNewCount.value
  );
});
</script>

<template>
  <section class="contact-section contact-section--result">
    <header class="section-header section-header--result">
      <div class="section-header-content">
        <div class="section-icon section-icon--result">
          <svg class="size-4" viewBox="0 0 20 20" fill="currentColor">
            <path
              fill-rule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clip-rule="evenodd"
            />
          </svg>
        </div>
        <div>
          <span class="section-title">Resultado da mesclagem</span>
          <span class="section-subtitle">
            Este será o contato final após a operação
          </span>
        </div>
      </div>
      <span v-if="totalChanges > 0" class="changes-badge">
        {{ totalChanges }} alteraç{{ totalChanges > 1 ? "ões" : "ão" }}
      </span>
    </header>

    <div class="contact-card-wrapper contact-card-wrapper--result">
      <MergeContactCard
        :contact="previewContact"
        variant="primary"
        :show-details="true"
      />
    </div>

    <FieldChangesSection
      :parent-contact="parentContact"
      :child-contact="childContact"
      :preview-contact="previewContact"
      @changes-count="fieldChangesCount = $event"
    />

    <!-- Conexões resultantes -->
    <div
      v-if="connectionsMerge.length"
      class="array-changes-section cursor-pointer"
      @click="showConnections = !showConnections"
    >
      <div class="array-changes-header">
        <span class="array-changes-title">Conexões</span>
        <span v-if="connectionsNewCount" class="array-changes-count">
          +{{ connectionsNewCount }} incorporada{{
            connectionsNewCount > 1 ? "s" : ""
          }}
        </span>
        <div class="ml-auto flex items-center gap-1.5">
          <button
            class="connections-help-btn"
            type="button"
            @click.stop="showConnectionsHelp = true"
          >
            ?
          </button>
          <svg
            class="size-3 transition-transform duration-200"
            :class="{ 'rotate-180': showConnections }"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fill-rule="evenodd"
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              clip-rule="evenodd"
            />
          </svg>
        </div>
      </div>

      <div v-show="showConnections" class="connections-result-list">
        <div
          v-for="conn in connectionsMerge"
          :key="conn.id"
          class="connection-result-item"
          :class="{ 'connection-result-item--new': conn.fromChild }"
        >
          <div class="conn-side conn-side--left">
            <!-- WhatsApp icon -->
            <svg
              v-if="conn.platform === 'whatsapp'"
              class="conn-icon conn-icon--wa"
              xmlns="http://www.w3.org/2000/svg"
              fill="currentColor"
              viewBox="0 0 17 17"
            >
              <path
                d="M13.601 2.326A7.854 7.854 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.933 7.933 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.898 7.898 0 0 0 13.6 2.326zM7.994 14.521a6.573 6.573 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.557 6.557 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592zm3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.729.729 0 0 0-.529.247c-.182.198-.691.677-.691 1.654 0 .977.71 1.916.81 2.049.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232z"
              />
            </svg>
            <!-- Instagram icon -->
            <svg
              v-else
              class="conn-icon conn-icon--ig"
              xmlns="http://www.w3.org/2000/svg"
              fill="currentColor"
              viewBox="0 0 16 16"
            >
              <path
                d="M8 0C5.829 0 5.556.01 4.703.048 3.85.088 3.269.222 2.76.42a3.917 3.917 0 0 0-1.417.923A3.927 3.927 0 0 0 .42 2.76C.222 3.268.087 3.85.048 4.7.01 5.555 0 5.827 0 8.001c0 2.172.01 2.444.048 3.297.04.852.174 1.433.372 1.942.205.526.478.972.923 1.417.444.445.89.719 1.416.923.51.198 1.09.333 1.942.372C5.555 15.99 5.827 16 8 16s2.444-.01 3.298-.048c.851-.04 1.434-.174 1.943-.372a3.916 3.916 0 0 0 1.416-.923c.445-.445.718-.891.923-1.417.197-.509.332-1.09.372-1.942C15.99 10.445 16 10.173 16 8s-.01-2.445-.048-3.299c-.04-.851-.175-1.433-.372-1.941a3.926 3.926 0 0 0-.923-1.417A3.911 3.911 0 0 0 13.24.42c-.51-.198-1.092-.333-1.943-.372C10.443.01 10.172 0 7.998 0h.003zm-.717 1.442h.718c2.136 0 2.389.007 3.232.046.78.035 1.204.166 1.486.275.373.145.64.319.92.599.28.28.453.546.598.92.11.281.24.705.275 1.485.039.843.047 1.096.047 3.231s-.008 2.389-.047 3.232c-.035.78-.166 1.203-.275 1.485a2.47 2.47 0 0 1-.599.919c-.28.28-.546.453-.92.598-.28.11-.704.24-1.485.276-.843.038-1.096.047-3.232.047s-2.39-.009-3.233-.047c-.78-.036-1.203-.166-1.485-.276a2.478 2.478 0 0 1-.92-.598 2.48 2.48 0 0 1-.6-.92c-.109-.281-.24-.705-.275-1.485-.038-.843-.046-1.096-.046-3.233 0-2.136.008-2.388.046-3.231.036-.78.166-1.204.276-1.486.145-.373.319-.64.599-.92.28-.28.546-.453.92-.598.282-.11.705-.24 1.485-.276.738-.034 1.024-.044 2.515-.045v.002zm4.988 1.328a.96.96 0 1 0 0 1.92.96.96 0 0 0 0-1.92zm-4.27 1.122a4.109 4.109 0 1 0 0 8.217 4.109 4.109 0 0 0 0-8.217zm0 1.441a2.667 2.667 0 1 1 0 5.334 2.667 2.667 0 0 1 0-5.334z"
              />
            </svg>
          </div>

          <span class="conn-instance">{{ conn.instanceName }}</span>

          <div class="conn-side conn-side--right">
            <span v-if="conn.fromChild" class="incorporated-tag"
              >incorporado</span
            >
            <span v-if="conn.userName" class="conn-username">{{
              conn.userName
            }}</span>
          </div>
        </div>
      </div>
    </div>
    <TagsChangesSection
      :parent-contact="parentContact"
      :child-contact="childContact"
      @changes-count="tagsChangesCount = $event"
    />
    <ProductsChangesSection
      :parent-contact="parentContact"
      :child-contact="childContact"
      @changes-count="productsChangesCount = $event"
    />
    <SegmentationChangesSection
      :parent-contact="parentContact"
      :child-contact="childContact"
      @changes-count="segmentationChangesCount = $event"
    />
  </section>

  <Teleport to="body">
    <SimpleModal
      v-model:is-open="showConnectionsHelp"
      size="w-max"
      class="text-white"
      :header="{
        title: 'Sobre as Conexões',
        svg: `<svg class='w-5 mr-1 text-blue-400 inline-block' viewBox='0 0 20 20' fill='currentColor'><path fill-rule='evenodd' d='M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z' clip-rule='evenodd'/></svg>`,
      }"
    >
      <template #body>
        <div class="connections-help-body">
          <p class="connections-help-intro">
            As <strong>conexões</strong> representam os canais de comunicação
            vinculados ao contato, como números de WhatsApp ou contas do
            Instagram associados a instâncias do sistema.
          </p>

          <div class="connections-help-rule">
            <svg
              class="connections-help-rule-icon"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fill-rule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clip-rule="evenodd"
              />
            </svg>
            <span
              >Todas as conexões de <em>ambos</em> os contatos são preservadas
              no contato final, nenhuma é perdida na mesclagem.</span
            >
          </div>

          <div class="connections-help-rule">
            <svg
              class="connections-help-rule-icon connections-help-rule-icon--green"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM14 11a1 1 0 011 1v1h1a1 1 0 110 2h-1v1a1 1 0 11-2 0v-1h-1a1 1 0 110-2h1v-1a1 1 0 011-1z"
              />
            </svg>
            <span
              >Conexões marcadas como
              <span class="connections-help-badge">incorporado</span> pertencem
              ao contato secundário, que será apagado após a mesclagem.</span
            >
          </div>

          <div class="connections-help-rule">
            <svg
              class="connections-help-rule-icon"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fill-rule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clip-rule="evenodd"
              />
            </svg>
            <span
              >Se houver conexões duplicadas entre os dois contatos, ambas
              continuarão existindo — revise-as após a mesclagem, se
              necessário.</span
            >
          </div>
        </div>
      </template>

      <template #footer>
        <button
          class="connections-help-close-btn"
          type="button"
          @click="showConnectionsHelp = false"
        >
          Entendi
        </button>
      </template>
    </SimpleModal>
  </Teleport>
</template>
