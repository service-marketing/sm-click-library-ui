<script setup>
import { computed } from "vue";
import { Fancybox } from "@fancyapps/ui";

const props = defineProps({
  /** Mensagem do tipo proposta. Espera `content.url`, `content.title` e `content.proposal`. */
  message: {
    type: Object,
    required: true,
  },
  /**
   * `true`  → mostra botões Aprovar/Rejeitar e emite `update-status` (uso do atendente).
   * `false` → mostra apenas o status (somente leitura, ex.: cliente/zap).
   */
  interactive: {
    type: Boolean,
    default: false,
  },
  /** Exibe o preview do PDF. Em mobile o app pode passar `false`. */
  showPreview: {
    type: Boolean,
    default: true,
  },
  /**
   * `true`  → web: mostra o preview em iframe e abre o PDF no Fancybox.
   * `false` → mobile: mostra um card "Abrir documento" e emite `open-pdf` para o app
   *           tratar a abertura (ex.: download via Capacitor).
   */
  isWebDevice: {
    type: Boolean,
    default: true,
  },
  /** Desabilita os botões enquanto o pai resolve a chamada de API. */
  loading: {
    type: Boolean,
    default: false,
  },
  /** Opções extras para o Fancybox (sobrescreve o default). */
  fancyboxOptions: {
    type: Object,
    default: null,
  },
});

const emit = defineEmits(["update-status", "open-pdf"]);

const content = computed(() => props.message.content || {});
const url = computed(() => content.value.url || "");
const title = computed(() => content.value.title || "");
const proposal = computed(() => content.value.proposal || {});
const currentStatus = computed(() => proposal.value.status ?? "pending");
const messageFailed = computed(() => props.message.stage === "failed");
const disabled = computed(() => props.loading || messageFailed.value);

const statusLabel = computed(() => {
  switch (currentStatus.value) {
    case "approved":
      return "Aprovada";
    case "rejected":
      return "Rejeitada";
    case "failed":
      return "Falhou";
    default:
      return "Pendente";
  }
});

function openPdf() {
  if (!url.value) return;
  emit("open-pdf", url.value);
  Fancybox.show(
    [{ src: url.value, type: "iframe", caption: title.value || "Proposta" }],
    props.fancyboxOptions ?? {
      Carousel: {
        Toolbar: {
          display: { left: ["counter"], middle: [], right: ["toggleFull", "close"] },
        },
      },
      dragToClose: false,
    },
  );
}

function approveTitle() {
  return messageFailed.value
    ? "Não é possível aprovar: a proposta não foi entregue ao cliente"
    : "Aprovar proposta";
}

function rejectTitle() {
  return messageFailed.value
    ? "Não é possível rejeitar: a proposta não foi entregue ao cliente"
    : "Rejeitar proposta";
}
</script>

<template>
  <div class="flex flex-col gap-2 pb-1">
    <!-- PDF Preview (web) -->
    <button
      v-if="showPreview && url && isWebDevice"
      type="button"
      class="group relative block overflow-hidden rounded-md w-[260px] h-[155px] max-w-full"
      aria-label="Abrir proposta PDF"
      @click="openPdf"
    >
      <iframe
        :src="`${url}#toolbar=0&navpanes=0`"
        class="pointer-events-none absolute inset-0 size-full"
        loading="lazy"
      />
      <div
        class="absolute inset-0 flex items-end justify-start bg-gradient-to-t from-black/50 to-transparent p-2 transition-opacity"
      >
        <span
          class="flex items-center gap-1.5 rounded-md bg-gray-500/80 border border-gray-600 backdrop-blur-sm px-2.5 py-1 text-xs font-medium text-white shadow"
        >
          <svg class="size-3.5 shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path
              fill-rule="evenodd"
              d="M9 2.221V7H4.221a2 2 0 0 1 .365-.5L8.5 2.586A2 2 0 0 1 9 2.22ZM11 2v5a2 2 0 0 1-2 2H4a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2 2 2 0 0 0 2 2h12a2 2 0 0 0 2-2 2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2V4a2 2 0 0 0-2-2h-7Zm-6 9a1 1 0 0 0-1 1v5a1 1 0 1 0 2 0v-1h.5a2.5 2.5 0 0 0 0-5H5Zm1.5 3H6v-1h.5a.5.5 0 0 1 0 1Zm4.5-3a1 1 0 0 0-1 1v5a1 1 0 0 0 1 1h1.376A2.626 2.626 0 0 0 15 15.375v-1.75A2.626 2.626 0 0 0 12.375 11H11Zm1 5v-3h.375a.626.626 0 0 1 .625.626v1.748a.625.625 0 0 1-.626.626H12Zm5-5a1 1 0 0 0-1 1v5a1 1 0 1 0 2 0v-1h1a1 1 0 1 0 0-2h-1v-1h1a1 1 0 1 0 0-2h-2Z"
              clip-rule="evenodd"
            />
          </svg>
          Abrir Proposta
        </span>
      </div>
    </button>

    <!-- PDF card (mobile) -->
    <button
      v-else-if="showPreview && url && !isWebDevice"
      type="button"
      class="w-full min-w-48 rounded-md"
      aria-label="Abrir proposta PDF"
      @click="emit('open-pdf', url)"
    >
      <div
        class="flex items-center gap-3 rounded-md bg-gray-900 p-3 text-left text-white dark:bg-gray-200 dark:text-gray-900"
      >
        <svg class="size-5 shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path
            fill-rule="evenodd"
            d="M9 2.221V7H4.221a2 2 0 0 1 .365-.5L8.5 2.586A2 2 0 0 1 9 2.22ZM11 2v5a2 2 0 0 1-2 2H4a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2 2 2 0 0 0 2 2h12a2 2 0 0 0 2-2 2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2V4a2 2 0 0 0-2-2h-7Zm-6 9a1 1 0 0 0-1 1v5a1 1 0 1 0 2 0v-1h.5a2.5 2.5 0 0 0 0-5H5Zm1.5 3H6v-1h.5a.5.5 0 0 1 0 1Zm4.5-3a1 1 0 0 0-1 1v5a1 1 0 0 0 1 1h1.376A2.626 2.626 0 0 0 15 15.375v-1.75A2.626 2.626 0 0 0 12.375 11H11Zm1 5v-3h.375a.626.626 0 0 1 .625.626v1.748a.625.625 0 0 1-.626.626H12Zm5-5a1 1 0 0 0-1 1v5a1 1 0 1 0 2 0v-1h1a1 1 0 1 0 0-2h-1v-1h1a1 1 0 1 0 0-2h-2Z"
            clip-rule="evenodd"
          />
        </svg>
        <div class="min-w-0">
          <p class="truncate text-sm font-medium">{{ title || "Proposta" }}</p>
          <p class="text-xs opacity-75">Toque para abrir o documento</p>
        </div>
      </div>
    </button>

    <!-- Title (web) -->
    <p v-if="title && isWebDevice" class="text-sm px-0.5 -mt-1">{{ title }}</p>

    <!-- Interactive: Aprovar / Rejeitar -->
    <div v-if="interactive" class="flex flex-col gap-1.5 pt-1">
      <div class="flex items-center gap-2">
        <button
          :disabled="disabled"
          :title="approveTitle()"
          :class="[
            'flex flex-1 items-center justify-center gap-1.5 rounded-lg border py-2 text-xs font-medium transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-40',
            currentStatus === 'approved'
              ? 'bg-emerald-500/35 border-emerald-400/50 text-emerald-200 dark:bg-emerald-500/20 dark:border-emerald-500/40 dark:text-emerald-700 font-semibold'
              : currentStatus === 'rejected'
                ? 'bg-white/5 border-white/10 text-white/25 dark:bg-black/5 dark:border-black/10 dark:text-black/25'
                : 'bg-white/8 border-white/15 text-white/70 dark:bg-black/5 dark:border-black/15 dark:text-black/60 hover:bg-emerald-500/20 hover:border-emerald-400/35 hover:text-emerald-200 dark:hover:bg-emerald-500/15 dark:hover:border-emerald-500/30 dark:hover:text-emerald-700',
          ]"
          @click="emit('update-status', 'approved')"
        >
          <svg class="size-3.5 shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path
              d="M3.16666 6.37502C3.74962 6.37502 4.2222 6.85073 4.22222 7.43752V15.9375C4.22222 16.5243 3.74963 17 3.16666 17H1.05555C0.472588 17 0 16.5243 0 15.9375V7.43752C1.50967e-05 6.85073 0.472597 6.37502 1.05555 6.37502H3.16666Z"
            />
            <path
              d="M9.48143 1.4454C9.79496 -0.637173 11.5194 0.143216 11.5194 0.143216C13.863 1.75728 13.005 4.80783 12.2832 6.13118H17.4424C19.5307 6.65187 19.0768 8.34354 18.5887 9.12465C19.5056 10.7905 18.4191 11.7716 17.7609 12.0538C18.1175 13.7717 17.0601 14.4178 16.4869 14.5264C16.8944 16.4004 15.5533 16.9564 14.8314 17H10.436C8.49997 16.9999 6.19055 16.1753 5.27777 15.7632V7.368C9.03523 5.6108 9.09933 3.98356 9.48143 1.4454Z"
            />
          </svg>
          Aprovar
        </button>

        <button
          :disabled="disabled"
          :title="rejectTitle()"
          :class="[
            'flex flex-1 items-center justify-center gap-1.5 rounded-lg border py-2 text-xs font-medium transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-40',
            currentStatus === 'rejected'
              ? 'bg-red-500/30 border-red-400/50 text-red-200 dark:bg-red-500/15 dark:border-red-500/35 dark:text-red-700 font-semibold'
              : currentStatus === 'approved'
                ? 'bg-white/5 border-white/10 text-white/25 dark:bg-black/5 dark:border-black/10 dark:text-black/25'
                : 'bg-white/8 border-white/15 text-white/70 dark:bg-black/5 dark:border-black/15 dark:text-black/60 hover:bg-red-500/20 hover:border-red-400/35 hover:text-red-200 dark:hover:bg-red-500/10 dark:hover:border-red-500/25 dark:hover:text-red-700',
          ]"
          @click="emit('update-status', 'rejected')"
        >
          <svg class="size-3.5 shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 19" fill="currentColor">
            <path
              d="M15.8333 10.625C15.2504 10.625 14.7778 10.1493 14.7778 9.56249L14.7778 1.0625C14.7778 0.475698 15.2504 1.57955e-06 15.8333 1.63051e-06L17.9444 1.81507e-06C18.5274 1.86603e-06 19 0.475698 19 1.0625L19 9.56249C19 10.1493 18.5274 10.625 17.9444 10.625L15.8333 10.625Z"
            />
            <path
              d="M9.51857 15.5546C9.20504 17.6372 7.48065 16.8568 7.48065 16.8568C5.13698 15.2427 5.99503 12.1922 6.71681 10.8688L1.55759 10.8688C-0.530671 10.3481 -0.0768444 8.65646 0.411319 7.87535C-0.50562 6.20951 0.580926 5.22844 1.23906 4.94622C0.882549 3.22832 1.93994 2.5822 2.51315 2.47363C2.10564 0.59965 3.44673 0.0436064 4.16864 6.1075e-07L8.56403 9.95007e-07C10.5 0.000138493 12.8095 0.824657 13.7222 1.23682L13.7222 9.632C9.96477 11.3892 9.90067 13.0164 9.51857 15.5546Z"
            />
          </svg>
          Rejeitar
        </button>
      </div>
    </div>

    <!-- Read-only: status -->
    <div
      v-else
      class="flex items-center gap-3 justify-center rounded-lg border px-3 py-2 text-xs font-medium"
      :class="{
        'bg-emerald-500/20 border-emerald-500/40 text-emerald-200': currentStatus === 'approved',
        'bg-red-500/15 border-red-500/35 text-red-200': currentStatus === 'rejected',
        'bg-rose-500/15 border-rose-500/35 text-rose-200': currentStatus === 'failed',
        'bg-orange-500/15 border-orange-500/35 text-orange-200': currentStatus === 'pending',
      }"
    >
      <!-- Aprovada: polegar pra cima -->
      <svg
        v-if="currentStatus === 'approved'"
        class="flex items-center justify-center size-3.5 shrink-0"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        fill="currentColor"
        aria-hidden="true"
      >
        <path
          d="M3.16666 6.37502C3.74962 6.37502 4.2222 6.85073 4.22222 7.43752V15.9375C4.22222 16.5243 3.74963 17 3.16666 17H1.05555C0.472588 17 0 16.5243 0 15.9375V7.43752C1.50967e-05 6.85073 0.472597 6.37502 1.05555 6.37502H3.16666Z"
        />
        <path
          d="M9.48143 1.4454C9.79496 -0.637173 11.5194 0.143216 11.5194 0.143216C13.863 1.75728 13.005 4.80783 12.2832 6.13118H17.4424C19.5307 6.65187 19.0768 8.34354 18.5887 9.12465C19.5056 10.7905 18.4191 11.7716 17.7609 12.0538C18.1175 13.7717 17.0601 14.4178 16.4869 14.5264C16.8944 16.4004 15.5533 16.9564 14.8314 17H10.436C8.49997 16.9999 6.19055 16.1753 5.27777 15.7632V7.368C9.03523 5.6108 9.09933 3.98356 9.48143 1.4454Z"
        />
      </svg>
      <!-- Rejeitada: polegar pra baixo -->
      <svg
        v-else-if="currentStatus === 'rejected'"
        class="flex items-center justify-center size-3.5 shrink-0"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 19"
        fill="currentColor"
        aria-hidden="true"
      >
        <path
          d="M15.8333 10.625C15.2504 10.625 14.7778 10.1493 14.7778 9.56249L14.7778 1.0625C14.7778 0.475698 15.2504 1.57955e-06 15.8333 1.63051e-06L17.9444 1.81507e-06C18.5274 1.86603e-06 19 0.475698 19 1.0625L19 9.56249C19 10.1493 18.5274 10.625 17.9444 10.625L15.8333 10.625Z"
        />
        <path
          d="M9.51857 15.5546C9.20504 17.6372 7.48065 16.8568 7.48065 16.8568C5.13698 15.2427 5.99503 12.1922 6.71681 10.8688L1.55759 10.8688C-0.530671 10.3481 -0.0768444 8.65646 0.411319 7.87535C-0.50562 6.20951 0.580926 5.22844 1.23906 4.94622C0.882549 3.22832 1.93994 2.5822 2.51315 2.47363C2.10564 0.59965 3.44673 0.0436064 4.16864 6.1075e-07L8.56403 9.95007e-07C10.5 0.000138493 12.8095 0.824657 13.7222 1.23682L13.7222 9.632C9.96477 11.3892 9.90067 13.0164 9.51857 15.5546Z"
        />
      </svg>
      <!-- Falhou: X -->
      <svg
        v-else-if="currentStatus === 'failed'"
        class="flex items-center justify-center size-3.5 shrink-0"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2.5"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
      >
        <path d="M18 6 6 18M6 6l12 12" />
      </svg>
      <!-- Pendente: relógio -->
      <svg
        v-else
        class="flex items-center justify-center size-3.5 shrink-0"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2.2"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 3" />
      </svg>

      <span>{{ statusLabel }}</span>
    </div>
  </div>
</template>
