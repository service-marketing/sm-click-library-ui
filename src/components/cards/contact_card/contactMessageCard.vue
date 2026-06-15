<script setup>
import { computed, ref } from "vue";
import SimpleModal from "../../modals/simple_modal/simple_modal.vue";
import ContactCard from "../../CRM+/clientsComponents/contactMerge/contactCard.vue";

const props = defineProps({
  /**
   * Estrutura do contato (META WhatsApp API). Aceita tanto o formato novo
   * (campos direto em content) quanto o legado ({ telephone }).
   */
  contact: {
    type: Object,
    default: () => ({}),
  },
  /** Exibe o botão "Iniciar conversa" (uso do atendente). */
  showStartChat: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["start-chat"]);

const showDetails = ref(false);
const copiedKey = ref("");

const detailsHeader = computed(() => ({
  title: data.value.name,
  svg: `<svg class="size-6 text-primary" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24"> <path fill-rule="evenodd" d="M12 4a4 4 0 1 0 0 8 4 4 0 0 0 0-8Zm-2 9a4 4 0 0 0-4 4v1a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-1a4 4 0 0 0-4-4h-4Z" clip-rule="evenodd"/> </svg>`,
}));
let copyTimer = null;

function asArray(value) {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

/** Normaliza qualquer formato de contato para uma estrutura única. */
const data = computed(() => {
  const c = props.contact || {};

  const phones = asArray(
    c.telephones ?? c.phones ?? c.phone ?? c.telephone,
  ).filter(Boolean);

  const emails = asArray(c.emails ?? c.email)
    .map((e) => (typeof e === "string" ? { email: e, type: "" } : e))
    .filter((e) => e && e.email);

  const urls = asArray(c.urls ?? c.url)
    .map((u) => (typeof u === "string" ? { url: u, type: "" } : u))
    .filter((u) => u && u.url);

  const addresses = asArray(c.addresses ?? c.address).filter(Boolean);

  return {
    name: c.name || "Contato",
    title: c.title || "",
    org: c.org || c.organization || "",
    photo: c.photo || null,
    birthday: c.birthday || "",
    phones,
    emails,
    urls,
    addresses,
  };
});

/** Mapeia para o formato esperado pelo ContactCard (CRM). */
const adaptedContact = computed(() => ({
  name: data.value.name,
  telephone: data.value.phones[0] || "",
  photo: data.value.photo,
}));

/** Há informação além de nome + telefone primário? */
const hasDetails = computed(() => {
  const d = data.value;
  return (
    d.phones.length > 0 ||
    d.emails.length > 0 ||
    d.urls.length > 0 ||
    d.addresses.length > 0 ||
    !!d.birthday ||
    !!d.title
  );
});

const infoGroups = computed(() => {
  const d = data.value;
  return [
    {
      key: "phone",
      label: "Telefone",
      icon: `<svg class="group-icon" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24"><path d="M7.978 4a2.553 2.553 0 0 0-1.926.877C4.233 6.7 3.699 8.751 4.153 10.814c.44 1.995 1.778 3.893 3.456 5.572 1.68 1.679 3.577 3.018 5.57 3.459 2.062.456 4.115-.073 5.94-1.885a2.556 2.556 0 0 0 .001-3.861l-1.21-1.21a2.689 2.689 0 0 0-3.802 0l-.617.618a.806.806 0 0 1-1.14 0l-1.854-1.855a.807.807 0 0 1 0-1.14l.618-.62a2.692 2.692 0 0 0 0-3.803l-1.21-1.211A2.555 2.555 0 0 0 7.978 4Z"/></svg>`,
      items: d.phones,
      type: "phone",
    },
    {
      key: "email",
      label: "E-mail",
      icon: `<svg class="group-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>`,
      items: d.emails,
      type: "email",
    },
    {
      key: "addr",
      label: "Endereço",
      icon: `<svg class="group-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>`,
      items: d.addresses,
      type: "address",
    },
    {
      key: "url",
      label: "Site",
      icon: `<svg class="group-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>`,
      items: d.urls,
      type: "url",
    },
  ].filter((g) => g.items.length);
});

const infoChips = computed(() => {
  const d = data.value;
  const chips = [];
  if (d.phones.length)
    chips.push({ key: "phone", count: d.phones.length, label: "Tel" });
  if (d.emails.length)
    chips.push({ key: "email", count: d.emails.length, label: "Email" });
  if (d.urls.length)
    chips.push({ key: "url", count: d.urls.length, label: "Site" });
  if (d.addresses.length)
    chips.push({ key: "addr", count: d.addresses.length, label: "End." });
  if (d.birthday) chips.push({ key: "bday", count: null, label: "Aniv." });
  if (d.title || d.org)
    chips.push({ key: "work", count: null, label: d.org || d.title });
  return chips;
});

const hasBottomAddon = computed(
  () => props.showStartChat || infoChips.value.length > 0,
);

function formatAddress(addr) {
  return [addr.street, addr.city, addr.state, addr.zip, addr.country]
    .filter(Boolean)
    .join(", ");
}

function formatBirthday(value) {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value || "");
  if (!match) return value;
  return `${match[3]}/${match[2]}/${match[1]}`;
}

async function copy(text, key) {
  if (!text) return;
  try {
    await navigator.clipboard.writeText(text);
    copiedKey.value = key;
    if (copyTimer) clearTimeout(copyTimer);
    copyTimer = setTimeout(() => {
      copiedKey.value = "";
    }, 1500);
  } catch (err) {
    console.error("Falha ao copiar:", err);
  }
}
</script>

<template>
  <div class="contact-msg-wrapper">
    <!-- Card base reutilizado do CRM -->
    <div class="contact-card-shell">
      <ContactCard
        :contact="adaptedContact"
        mode="merge"
        avatar-variant="brand"
        :show-start-chat="hasBottomAddon"
      />
    </div>

    <!-- Chips de resumo -->
    <button
      v-if="infoChips.length"
      class="info-chips-bar"
      :class="{ 'info-chips-bar--no-chat': !showStartChat }"
      title="Ver detalhes do contato"
      @click.stop="showDetails = true"
    >
      <span v-for="chip in infoChips" :key="chip.key" class="info-chip">
        {{ chip.label
        }}<span
          v-if="chip.count !== null && chip.count > 1"
          class="info-chip-count"
          >{{ chip.count }}</span
        >
      </span>
      <svg
        class="info-chips-arrow"
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
          d="M8 4H4m0 0v4m0-4 5 5m7-5h4m0 0v4m0-4-5 5M8 20H4m0 0v-4m0 4 5-5m7 5h4m0 0v-4m0 4-5-5"
        />
      </svg>
    </button>

    <!-- Ação opcional -->
    <button
      v-if="showStartChat"
      class="start-chat-btn"
      @click.stop="emit('start-chat', data)"
    >
      <svg
        class="start-chat-icon"
        aria-hidden="true"
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        fill="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          fill-rule="evenodd"
          d="M9 4a4 4 0 1 0 0 8 4 4 0 0 0 0-8Zm-2 9a4 4 0 0 0-4 4v1a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-1a4 4 0 0 0-4-4H7Zm8-1a1 1 0 0 1 1-1h1v-1a1 1 0 1 1 2 0v1h1a1 1 0 1 1 0 2h-1v1a1 1 0 1 1-2 0v-1h-1a1 1 0 0 1-1-1Z"
          clip-rule="evenodd"
        />
      </svg>
      <span>Iniciar conversa</span>
    </button>
  </div>

  <!-- Detalhes em modal — Teleport evita que fique preso no overflow da conversa -->
  <Teleport to="body">
    <SimpleModal
      :is-open="showDetails"
      size="md:w-1/2 xl:w-2/5"
      :header="detailsHeader"
      @close="showDetails = false"
    >
      <template #body>
        <div class="contact-details">
          <!-- Cargo / Empresa -->
          <div v-if="data.title || data.org" class="detail-row">
            <svg
              class="detail-icon"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                fill-rule="evenodd"
                d="M4 4a1 1 0 0 1 1-1h14a1 1 0 1 1 0 2v14a1 1 0 1 1 0 2H5a1 1 0 1 1 0-2V5a1 1 0 0 1-1-1Zm5 2a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1V7a1 1 0 0 0-1-1H9Zm5 0a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1V7a1 1 0 0 0-1-1h-1Zm-5 4a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1v-1a1 1 0 0 0-1-1H9Zm5 0a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1v-1a1 1 0 0 0-1-1h-1Zm-3 4a2 2 0 0 0-2 2v3h2v-3h2v3h2v-3a2 2 0 0 0-2-2h-2Z"
                clip-rule="evenodd"
              />
            </svg>

            <div class="detail-row-content">
              <span class="detail-meta">{{ data.org || "Cargo" }}</span>
              <span class="detail-value">{{ data.title || data.org }}</span>
            </div>
          </div>

          <!-- Telefones -->
          <div v-if="data.phones.length" class="info-group">
            <div class="group-header">
              <svg
                class="group-icon"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  d="M7.978 4a2.553 2.553 0 0 0-1.926.877C4.233 6.7 3.699 8.751 4.153 10.814c.44 1.995 1.778 3.893 3.456 5.572 1.68 1.679 3.577 3.018 5.57 3.459 2.062.456 4.115-.073 5.94-1.885a2.556 2.556 0 0 0 .001-3.861l-1.21-1.21a2.689 2.689 0 0 0-3.802 0l-.617.618a.806.806 0 0 1-1.14 0l-1.854-1.855a.807.807 0 0 1 0-1.14l.618-.62a2.692 2.692 0 0 0 0-3.803l-1.21-1.211A2.555 2.555 0 0 0 7.978 4Z"
                />
              </svg>
              <span class="group-label"
                >Telefone{{ data.phones.length > 1 ? "s" : "" }}</span
              >
            </div>
            <div class="group-items">
              <button
                v-for="(phone, i) in data.phones"
                :key="`phone-${i}`"
                class="group-item"
                :title="
                  copiedKey === `phone-${i}` ? 'Copiado!' : 'Clique para copiar'
                "
                @click.stop="copy(phone, `phone-${i}`)"
              >
                <span class="item-value">{{ phone }}</span>
                <svg
                  v-if="copiedKey === `phone-${i}`"
                  class="copy-icon text-primary"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <svg
                  v-else
                  class="copy-icon"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path
                    d="M8 5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-2v2a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h2V5Zm2 2h4a2 2 0 0 1 2 2v6h2V5h-8v2Zm-4 2v10h8V9H6Z"
                  />
                </svg>
              </button>
            </div>
          </div>

          <!-- E-mails -->
          <div v-if="data.emails.length" class="info-group">
            <div class="group-header">
              <svg class="group-icon" viewBox="0 0 24 24" fill="currentColor">
                <path
                  d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"
                />
              </svg>
              <span class="group-label"
                >E-mail{{ data.emails.length > 1 ? "s" : "" }}</span
              >
            </div>
            <div class="group-items">
              <button
                v-for="(item, i) in data.emails"
                :key="`email-${i}`"
                class="group-item"
                :title="
                  copiedKey === `email-${i}` ? 'Copiado!' : 'Clique para copiar'
                "
                @click.stop="copy(item.email, `email-${i}`)"
              >
                <span class="item-value">{{ item.email }}</span>
                <span v-if="item.type" class="item-type">{{ item.type }}</span>
                <svg
                  v-if="copiedKey === `email-${i}`"
                  class="copy-icon text-primary"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <svg
                  v-else
                  class="copy-icon"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path
                    d="M8 5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-2v2a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h2V5Zm2 2h4a2 2 0 0 1 2 2v6h2V5h-8v2Zm-4 2v10h8V9H6Z"
                  />
                </svg>
              </button>
            </div>
          </div>

          <!-- Endereços -->
          <div v-if="data.addresses.length" class="info-group">
            <div class="group-header">
              <svg class="group-icon" viewBox="0 0 24 24" fill="currentColor">
                <path
                  d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"
                />
              </svg>
              <span class="group-label"
                >Endereço{{ data.addresses.length > 1 ? "s" : "" }}</span
              >
            </div>
            <div class="group-items">
              <button
                v-for="(addr, i) in data.addresses"
                :key="`addr-${i}`"
                class="group-item"
                :title="
                  copiedKey === `addr-${i}` ? 'Copiado!' : 'Clique para copiar'
                "
                @click.stop="copy(formatAddress(addr), `addr-${i}`)"
              >
                <span class="item-value">{{ formatAddress(addr) }}</span>
                <span v-if="addr.type" class="item-type">{{ addr.type }}</span>
                <svg
                  v-if="copiedKey === `addr-${i}`"
                  class="copy-icon text-primary"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <svg
                  v-else
                  class="copy-icon"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path
                    d="M8 5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-2v2a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h2V5Zm2 2h4a2 2 0 0 1 2 2v6h2V5h-8v2Zm-4 2v10h8V9H6Z"
                  />
                </svg>
              </button>
            </div>
          </div>

          <!-- Sites -->
          <div v-if="data.urls.length" class="info-group">
            <div class="group-header">
              <svg class="group-icon" viewBox="0 0 24 24" fill="currentColor">
                <path
                  d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"
                />
              </svg>
              <span class="group-label"
                >Site{{ data.urls.length > 1 ? "s" : "" }}</span
              >
            </div>
            <div class="group-items">
              <a
                v-for="(item, i) in data.urls"
                :key="`url-${i}`"
                :href="item.url"
                target="_blank"
                rel="noopener noreferrer"
                class="group-item group-item-link"
              >
                <span class="item-value text-primary">{{ item.url }}</span>
                <svg
                  class="copy-icon"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
              </a>
            </div>
          </div>

          <!-- Aniversário -->
          <div v-if="data.birthday" class="detail-row">
            <svg
              class="detail-icon"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                fill-rule="evenodd"
                d="M5 5a1 1 0 0 0 1-1 1 1 0 1 1 2 0 1 1 0 0 0 1 1h1a1 1 0 0 0 1-1 1 1 0 1 1 2 0 1 1 0 0 0 1 1h1a1 1 0 0 0 1-1 1 1 0 1 1 2 0 1 1 0 0 0 1 1 2 2 0 0 1 2 2v1a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V7a2 2 0 0 1 2-2ZM3 19v-7a1 1 0 0 1 1-1h16a1 1 0 0 1 1 1v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Zm6.01-6a1 1 0 1 0-2 0 1 1 0 0 0 2 0Zm2 0a1 1 0 1 1 2 0 1 1 0 0 1-2 0Zm6 0a1 1 0 1 0-2 0 1 1 0 0 0 2 0Zm-10 4a1 1 0 1 1 2 0 1 1 0 0 1-2 0Zm6 0a1 1 0 1 0-2 0 1 1 0 0 0 2 0Zm2 0a1 1 0 1 1 2 0 1 1 0 0 1-2 0Z"
                clip-rule="evenodd"
              />
            </svg>
            <div class="detail-row-content">
              <span class="detail-meta">Aniversário</span>
              <span class="detail-value">{{
                formatBirthday(data.birthday)
              }}</span>
            </div>
          </div>
        </div>
      </template>

      <template #footer>
        <button
          class="details-close-btn ml-auto bg-base-200/60 hover:bg-base-200"
          type="button"
          @click="showDetails = false"
        >
          Fechar
        </button>
      </template>
    </SimpleModal>
  </Teleport>
</template>

<style scoped>
.contact-msg-wrapper {
  display: flex;
  flex-direction: column;
  gap: 0;
  @apply lg:min-w-[340px] md:min-w-full sm:min-w-[290px] min-w-[240px];
}

.contact-card-shell {
  position: relative;
}

.start-chat-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.45rem;
  width: 100%;
  border: none;
  cursor: pointer;
  color: #fff;
  font-size: 0.8rem;
  font-weight: 600;
  padding: 0.55rem;
  border-radius: 0 0 0.5rem 0.5rem;
  background: linear-gradient(
    135deg,
    rgb(var(--primary-rgb)),
    var(--primary-alt)
  );
  transition:
    transform 0.18s ease,
    box-shadow 0.18s ease,
    filter 0.18s ease;
}

.start-chat-btn:hover {
  filter: brightness(1.06);
}

.start-chat-btn:active {
  transform: scale(0.99);
}

.start-chat-icon {
  width: 1rem;
  height: 1rem;
  flex-shrink: 0;
}

/* Modal de detalhes */
.contact-details {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 1rem 1.25rem 1.25rem;
  text-align: left;
}

/* Linha simples (cargo, aniversário) */
.detail-row {
  display: flex;
  align-items: center;
  gap: 0.55rem;
  padding: 0.3rem 0.5rem;
  border-radius: 0.6rem;
  background: rgb(var(--bg-base-300) / 0.6);
  border: 1px solid transparent;
  transition:
    border-color 0.18s ease,
    background-color 0.18s ease;
}

.detail-row:hover {
  border-color: rgb(var(--bg-base-100) / 0.8);
  background: rgb(var(--bg-base-300) / 0.9);
}

.detail-icon {
  width: 1rem;
  height: 1rem;
  flex-shrink: 0;
  opacity: 0.55;
}

.detail-row-content {
  display: flex;
  flex-direction: column;
  gap: 0.02rem;
  flex: 1;
  min-width: 0;
}

.detail-meta {
  font-size: 0.58rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  opacity: 0.6;
}

.detail-value {
  font-size: 0.8rem;
  min-width: 0;
  word-break: break-word;
}

/* Grupos (telefones, e-mails, endereços, sites) */
.info-group {
  background: rgb(var(--bg-base-300) / 0.6);
  border: 1px solid transparent;
  border-radius: 0.6rem;
  overflow: hidden;
  transition: border-color 0.18s ease;
}

.info-group:hover {
  border-color: rgb(var(--bg-base-100) / 0.8);
}

.group-header {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.5rem 0.75rem 0.5rem;
}

.group-icon {
  width: 0.85rem;
  height: 0.85rem;
  flex-shrink: 0;
  opacity: 0.55;
}

.group-label {
  font-size: 0.58rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  opacity: 0.6;
}

.group-items {
  display: flex;
  flex-direction: column;
}

.group-item {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.5rem 0.75rem;
  border: none;
  border-top: 1px solid rgb(var(--bg-base-100) / 0.35);
  background: transparent;
  cursor: pointer;
  text-align: left;
  color: inherit;
  text-decoration: none;
  transition: background-color 0.15s ease;
}

.group-item:hover {
  background: rgb(var(--bg-base-100) / 0.45);
}

.group-item:active {
  background: rgb(var(--bg-base-100) / 0.75);
}

.group-item-link {
  cursor: pointer;
}

.item-value {
  font-size: 0.8rem;
  flex: 1;
  min-width: 0;
  word-break: break-word;
}

.item-type {
  font-size: 0.65rem;
  opacity: 0.55;
  flex-shrink: 0;
  text-transform: capitalize;
  padding: 0.1rem 0.4rem;
  border-radius: 0.3rem;
  background: rgb(var(--bg-base-100) / 0.5);
}

.copy-icon {
  width: 0.85rem;
  height: 0.85rem;
  flex-shrink: 0;
  opacity: 0.5;
  transition: opacity 0.15s ease;
}

.group-item:hover .copy-icon {
  opacity: 0.9;
}

.info-chips-bar {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.3rem;
  width: 100%;
  padding: 0.28rem 0.65rem;
  border: none;
  border-top: 1px solid rgb(var(--bg-base-100) / 0.25);
  background: rgb(var(--bg-base-300) / 0.75);
  cursor: pointer;
  text-align: left;
  color: inherit;
  border-radius: 0;
  transition: background-color 0.18s ease;
}

.info-chips-bar:hover {
  background: rgb(var(--bg-base-300) / 0.85);
}

.info-chips-bar--no-chat {
  border-radius: 0 0 0.5rem 0.5rem;
}

.info-chip {
  display: inline-flex;
  align-items: baseline;
  gap: 0.2rem;
  font-size: 0.62rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  opacity: 0.55;
  white-space: nowrap;
  transition: opacity 0.15s ease;
}

.info-chip + .info-chip::before {
  content: "·";
  margin-right: 0.15rem;
  opacity: 0.5;
}

.info-chips-bar:hover .info-chip {
  opacity: 0.8;
}

.info-chip-count {
  font-size: 0.62rem;
  font-weight: 700;
  color: rgb(var(--primary-rgb));
}

.info-chips-arrow {
  width: 1rem;
  height: 1rem;
  margin-left: auto;
  flex-shrink: 0;
  opacity: 0.9;
  transition:
    opacity 0.15s ease,
    transform 0.18s ease;
}

.info-chips-bar:hover .info-chips-arrow {
  opacity: 0.8;
  transform: translateX(2px);
}

.details-close-btn {
  font-size: 0.8rem;
  font-weight: 600;
  padding: 0.45rem 1.1rem;
  border-radius: 0.6rem;
  border: none;
  cursor: pointer;
  color: inherit;
  transition:
    background-color 0.18s ease,
    transform 0.18s ease;
}

.details-close-btn:active {
  transform: scale(0.97);
}
</style>
