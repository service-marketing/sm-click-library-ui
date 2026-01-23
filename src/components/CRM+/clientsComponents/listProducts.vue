<script setup>
/**
 * 📋 Descrição:
 * Componente de exibição e seleção de produtos.
 */

import { computed, onMounted, reactive, watch, toRaw, ref } from "vue";
import { crm_products } from "~/utils/systemUrls";
import InfiniteLoading from "v3-infinite-loading";
import api from "~/utils/api.js";

const props = defineProps({
  // --- Lista que será exibida e já selecionada ---
  modelValue: {
    type: Array,
    default: () => [],
  },
  // --- lista de todos os produtos em geral ---
  allProducts: {
    type: Object,
    default: () => {},
  },
  // --- caso o mouse saia do componente executa uma ação ---
  onMouseLeave: {
    type: Function,
    required: false,
  },
  // --- departamento que pode acessar os produtos ---
  departmentBypass: {
    type: String,
    default: "",
  },
  // --- desabilita os botões de incremento/decremento ---
  readonly: {
    type: Boolean,
    default: false,
  },
  // --- habilita funcionalidade de geração de proposta ---
  proposal: {
    type: Boolean,
    default: false,
  },
  // --- indica se está carregando a geração de proposta ---
  loading: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["update:modelValue", "generate-proposal"]);

const loading = ref(false);
const productsList = ref([]);

// --- Organiza a lista de produtos: prioriza com quantidade, depois bloqueados ao final ---
const sortedProducts = computed(() => {
  return [...productsList.value].sort((a, b) => {
    // Produtos com quantidade no topo
    const hasQuantityA = getQuantity(a) > 0;
    const hasQuantityB = getQuantity(b) > 0;
    if (hasQuantityA !== hasQuantityB) {
      return hasQuantityB - hasQuantityA;
    }

    // Se ambos têm ou não têm quantidade, então prioriza bloqueados ao final
    const blockedA = shouldShowDepartmentBlocked(a);
    const blockedB = shouldShowDepartmentBlocked(b);
    if (blockedA === blockedB) return 0;
    return blockedA - blockedB;
  });
});

// --- Normaliza itens do parent para sempre ter { product, quantity, discount } ---
function normalizeProducts(list) {
  if (!Array.isArray(list)) return [];
  return list.map((item) => {
    if (item && item.product) {
      return {
        product: { ...item.product },
        quantity: item.quantity ?? 0,
        discount: item.discount ?? 0,
      };
    }
    return {
      product: { ...item },
      quantity: item.quantity ?? 0,
      discount: item.discount ?? 0,
    };
  });
}
const selectedProducts = ref(normalizeProducts(props.modelValue));
const page = ref(1);
const nextPage = ref(null);
const previousPage = ref(null);

const totalPrice = computed(() => {
  return selectedProducts.value.reduce((total, item) => {
    const price = item.product?.price || item.price || 0;
    const quantity = item.quantity || 0;
    const discount = item.discount || 0;
    const finalPrice = price * (1 - discount / 100);
    return total + finalPrice * quantity;
  }, 0);
});

const productsWithDiscount = computed(() => {
  return selectedProducts.value.filter(
    (item) => item.quantity > 0 && item.discount > 0,
  );
});

const totalSavings = computed(() => {
  return selectedProducts.value.reduce((total, item) => {
    const price = item.product?.price || item.price || 0;
    const quantity = item.quantity || 0;
    const discount = item.discount || 0;
    const savingsAmount = ((price * discount) / 100) * quantity;
    return total + savingsAmount;
  }, 0);
});

function getProductId(p) {
  return p?.product?.id ?? p?.id;
}

// --- Obtém a quantidade de um produto ---
const quantityMap = computed(() => {
  const map = {};
  selectedProducts.value.forEach((p) => {
    const id = getProductId(p);
    if (id != null) map[id] = p.quantity;
  });
  return map;
});

const getQuantity = (prd) => quantityMap.value[prd.id] || 0;

const discountMap = computed(() => {
  const map = {};
  selectedProducts.value.forEach((p) => {
    const id = getProductId(p);
    if (id != null) map[id] = p.discount || 0;
  });
  return map;
});

const getDiscount = (prd) => discountMap.value[prd.id] || 0;

const updateDiscount = (prd, value) => {
  if (props.readonly) return;
  if (shouldShowDepartmentBlocked(prd)) return;

  let numValue = parseInt(value, 10) || 0;
  numValue = Math.max(0, Math.min(100, numValue));

  const found = selectedProducts.value.find((p) => getProductId(p) === prd.id);
  if (found) {
    found.discount = numValue;
  }
};

const validateDiscount = (prd, event) => {
  let value = parseInt(event.target.value, 10) || 0;
  value = Math.max(0, Math.min(100, value));
  event.target.value = value;
  updateDiscount(prd, value);
};

const calculateFinalPrice = (prd) => {
  const price = prd.price || 0;
  const discount = getDiscount(prd);
  return price * (1 - discount / 100);
};

// --- Incrementa ---
const increaseQuantity = (prd) => {
  if (props.readonly) return;
  if (shouldShowDepartmentBlocked(prd)) return;
  const found = selectedProducts.value.find((p) => getProductId(p) === prd.id);
  if (found) {
    found.quantity++;
  } else {
    selectedProducts.value.push({
      product: { ...prd },
      quantity: 1,
      discount: 0,
    });
  }
};

// --- Decrementa (sem deixar ir abaixo de 0) ---
const decreaseQuantity = (prd) => {
  if (props.readonly) return;
  if (shouldShowDepartmentBlocked(prd)) return;
  const found = selectedProducts.value.find((p) => getProductId(p) === prd.id);
  if (!found) return;
  if (found.quantity > 0) {
    found.quantity--;
  } else {
    found.quantity = 0;
  }
};

const mountUrl = (baseUrl, params) => {
  const paramsSearch = new URLSearchParams();
  const url = baseUrl;

  Object.keys(params).forEach((key) => paramsSearch.append(key, params[key]));
  return `${url}?${paramsSearch.toString()}`;
};

const getProducts = async (params) => {
  try {
    const { data } = await api.get(
      mountUrl(crm_products, { page: page.value, ...params }),
    );
    const { results, next, previous } = data;

    // --- Atualiza ponteiros de paginação ---
    nextPage.value = next;
    previousPage.value = previous;

    // --- Concatena somente em páginas > 1. Evita reset + duplicação ---
    if (page.value === 1) {
      productsList.value = results;
    } else {
      // Evita duplicados caso API retorne algum repetido
      const existingIds = new Set(productsList.value.map((p) => p.id));
      const newOnes = results.filter((p) => !existingIds.has(p.id));
      productsList.value = [...productsList.value, ...newOnes];
    }

    // --- Prepara a próxima página (incrementa apenas se há próximo) ---
    if (nextPage.value) {
      page.value += 1;
    }
  } catch (error) {
    console.error("Erro ao buscar produtos:", error);
  }
};

onMounted(async () => {
  // --- Se allProducts já veio com dados, usamos ele direto ---
  if (props.allProducts && props.allProducts.results?.length > 0) {
    productsList.value = props.allProducts.results;
    nextPage.value = props.allProducts.next || null;
    previousPage.value = props.allProducts.previous || null;
    page.value = 2; // assume que já carregamos a primeira página
  }
});

// --- Sempre que selectedProducts mudar, emitimos o evento para o parent ---
watch(
  selectedProducts,
  (newVal) => {
    // Emite sempre normalizado
    emit(
      "update:modelValue",
      newVal.map((i) => ({
        product: i.product,
        quantity: i.quantity,
        discount: i.discount || 0,
      })),
    );
  },
  { deep: true },
);

// --- Quando o parent atualizar v-model, normaliza novamente ---
watch(
  () => props.modelValue,
  (newVal) => {
    const normalized = normalizeProducts(newVal);
    if (JSON.stringify(normalized) !== JSON.stringify(selectedProducts.value)) {
      selectedProducts.value = normalized;
    }
  },
  { deep: true },
);

const isLoading = ref(false);

const loadMoreProducts = async (state) => {
  if (isLoading.value) return;
  isLoading.value = true;

  try {
    // --- Se não há próxima página já finaliza ---
    if (!nextPage.value) {
      state.complete();
      return;
    }

    await getProducts();

    // --- Depois de carregar, verifica novamente se ainda há próxima ---
    if (nextPage.value) {
      state.loaded();
    } else {
      state.complete();
    }
  } catch (error) {
    console.error("Erro ao carregar produtos:", error);
    state.complete();
  } finally {
    isLoading.value = false;
  }
};

function handleMouseLeave() {
  if (typeof props.onMouseLeave === "function") {
    props.onMouseLeave();
  }
}

// --- Verifica se deve mostrar bloqueio por departamento ---
const shouldShowDepartmentBlocked = (prd) => {
  if (isLoading.value) return false;
  const bypassId = props.departmentBypass;
  if (!bypassId) return false;

  const departments = Array.isArray(prd?.department) ? prd.department : [];
  if (departments.length === 0) return false;

  const hasBypass = departments.some((d) => d && d.id === bypassId);
  return !hasBypass;
};

const filters = ref({ query: "" });
const itsSearching = ref(false);

let debounceTimer;
watch(
  filters,
  () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(async () => {
      const { query } = filters.value;
      page.value = 1;
      itsSearching.value = query !== null && query !== undefined;
      loading.value = true;
      await getProducts({ query });
      loading.value = false;
    }, 500); // --- 500ms de atraso após parar de digitar ---
  },
  { deep: true },
);

function handleGenerateProposal() {
  emit("generate-proposal");
}
</script>

<template>
  <div class="list-products-wrapper" @mouseleave="handleMouseLeave">
    <header
      v-if="(productsList.length > 0 && !itsSearching) || itsSearching"
      class="header-products-list"
    >
      <input
        class="search-products-input text-white dark:text-black"
        type="text"
        placeholder="Buscar..."
        v-model="filters.query"
      />

      <section
        class="total-price-badge text-white"
        :class="{ 'with-proposal': proposal }"
      >
        <div
          class="flex items-center gap-1"
          :class="{ 'justify-center': !proposal }"
        >
          <span>Valor total:</span>
          <span class="font-semibold">
            {{
              totalPrice.toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
              })
            }}
          </span>

          <Popper
            v-if="productsWithDiscount.length > 0"
            class="discount-popper"
            :hover="true"
            placement="top"
          >
            <template #content>
              <main class="discount-tooltip">
                <div class="discount-tooltip-header">
                  Produtos com desconto ({{ productsWithDiscount.length }})
                </div>
                <ul class="discount-tooltip-list">
                  <li
                    v-for="item in productsWithDiscount"
                    :key="getProductId(item)"
                    class="discount-tooltip-item"
                  >
                    <span class="discount-tooltip-name">{{
                      item.product.name
                    }}</span>
                    <span class="discount-tooltip-value"
                      >{{ item.discount }}% OFF</span
                    >
                  </li>
                </ul>
                <div class="discount-tooltip-footer">
                  <div class="savings-info">
                    <span class="savings-label">Economia total:</span>
                    <span class="savings-amount">{{
                      totalSavings.toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      })
                    }}</span>
                  </div>
                </div>
              </main>
            </template>
            <div
              class="discount-badge discount-percentage"
              :class="{ 'mr-2': proposal }"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="size-4"
                viewBox="0 0 590 635"
                fill="none"
              >
                <path
                  d="M310.86 10.2568C324.851 -7.41679 353.27 -1.24771 360.711 21.0781L385.338 94.9668C390.061 109.138 404.244 118.008 418.419 115.657L489.449 103.877C511.311 100.251 529.835 122.547 522.516 143.678L495.903 220.51C491.399 233.513 496.733 248.391 508.624 255.996L575.418 298.717C594.157 310.702 594.568 338.119 576.17 348.87L508.033 388.685C496.571 395.383 491.618 409.545 496.134 422.714L523.506 502.543C530.844 523.944 513.237 544.396 491.612 539.592L418.451 523.338C404.513 520.241 390.92 527.845 386.406 541.264L361.263 616C354.018 637.533 325.878 641.26 311.658 622.57L265.838 562.345C256.671 550.297 240.405 546.767 228.058 554.145L166.338 591.025C147.184 602.471 122.152 587.201 122.215 564.109L122.433 483.962C122.472 469.572 112.215 456.791 98.2549 453.832L24.9766 438.299C3.31649 433.707 -6.61363 407.277 6.98828 390.422L57.7256 327.548C66.0956 317.176 65.9616 301.91 57.4043 290.866L6.53418 225.218C-7.20026 207.492 1.8522 182.13 23.0938 178.823L98.8135 167.039C112.294 164.941 121.966 153.32 121.883 139.32L121.394 56.6055C121.259 33.8573 145.561 20.8575 164.775 33.3994L227.204 74.1494C239.663 82.282 255.677 79.9662 264.558 68.748L310.86 10.2568ZM333.442 173.23L199.154 415.935H232.727L367.322 173.23H333.442ZM360.546 287.19C342.066 287.19 328.001 293.248 318.351 305.362C310.137 316.04 306.03 330.926 306.03 350.022C306.03 368.708 310.137 383.389 318.351 394.066C328.001 406.181 342.066 412.238 360.546 412.238C379.231 412.238 393.399 406.181 403.05 394.066C411.674 383.389 415.986 368.708 415.986 350.022C415.986 331.132 411.674 316.245 403.05 305.362C393.399 293.248 379.231 287.19 360.546 287.19ZM360.546 315.834C376.973 315.834 385.187 327.23 385.187 350.022C385.186 372.814 376.972 384.21 360.546 384.21C352.743 384.21 346.686 380.822 342.374 374.046C338.267 368.091 336.214 360.084 336.214 350.022C336.214 327.231 344.325 315.834 360.546 315.834ZM205.93 176.926C187.245 176.926 173.076 182.983 163.426 195.098C155.007 205.98 150.798 220.765 150.798 239.45C150.798 257.93 155.007 272.612 163.426 283.494C172.871 295.814 187.039 301.974 205.93 301.974C224.41 301.974 238.475 295.814 248.126 283.494C256.75 272.817 261.062 258.135 261.062 239.45C261.062 220.765 256.75 205.98 248.126 195.098C238.475 182.983 224.41 176.926 205.93 176.926ZM205.93 205.262C213.938 205.262 220.098 208.547 224.41 215.118C228.517 221.483 230.57 229.594 230.57 239.45C230.57 262.037 222.356 273.33 205.93 273.33C189.709 273.33 181.599 262.037 181.599 239.45C181.599 229.184 183.549 221.073 187.45 215.118C191.762 208.548 197.922 205.262 205.93 205.262Z"
                  fill="currentColor"
                />
              </svg>
            </div>
          </Popper>
        </div>

        <Popper
          v-if="proposal"
          class="discount-popper"
          :hover="true"
          placement="top"
        >
          <template #content>
            <main class="p-2 text-sm px-3">
              <div class="text-center">
                {{
                  selectedProducts.length === 0
                    ? "Adicione produtos para gerar proposta comercial"
                    : props.loading
                      ? "Gerando proposta..."
                      : "Gerar proposta"
                }}
              </div>
            </main>
          </template>
          <button
            @click="handleGenerateProposal"
            :disabled="
              selectedProducts.length === 0 || readonly || props.loading
            "
            class="proposal-button"
            :class="{
              disabled:
                selectedProducts.length === 0 || readonly || props.loading,
            }"
          >
            <div v-if="props.loading" class="flex items-center gap-1">
              <div
                class="size-4 animate-spin rounded-full border-2 border-white border-t-transparent"
              ></div>
              <!-- <span class="text-[13px]">...</span> -->
            </div>
            <div v-else class="flex items-center gap-1">
              <svg
                class="size-4"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  fill-rule="evenodd"
                  d="M9 2.221V7H4.221a2 2 0 0 1 .365-.5L8.5 2.586A2 2 0 0 1 9 2.22ZM11 2v5a2 2 0 0 1-2 2H4a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2 2 2 0 0 0 2 2h12a2 2 0 0 0 2-2 2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2V4a2 2 0 0 0-2-2h-7Zm-6 9a1 1 0 0 0-1 1v5a1 1 0 1 0 2 0v-1h.5a2.5 2.5 0 0 0 0-5H5Zm1.5 3H6v-1h.5a.5.5 0 0 1 0 1Zm4.5-3a1 1 0 0 0-1 1v5a1 1 0 0 0 1 1h1.376A2.626 2.626 0 0 0 15 15.375v-1.75A2.626 2.626 0 0 0 12.375 11H11Zm1 5v-3h.375a.626.626 0 0 1 .625.626v1.748a.625.625 0 0 1-.626.626H12Zm5-5a1 1 0 0 0-1 1v5a1 1 0 1 0 2 0v-1h1a1 1 0 1 0 0-2h-1v-1h1a1 1 0 1 0 0-2h-2Z"
                  clip-rule="evenodd"
                />
              </svg>
              <span class="text-[13px]">{{ selectedProducts.length }}</span>
            </div>
          </button>
        </Popper>
      </section>
    </header>

    <div
      v-if="loading"
      class="flex items-center justify-center overflow-hidden h-full"
    >
      <SimpleLoader />
    </div>

    <main v-else class="list-products-list">
      <div v-if="productsList.length > 0">
        <ul
          class="w-full text-gray-500 list-none list-inside dark:text-gray-400 divide-y divide-base-200"
        >
          <li
            class="flex w-full bg-base-300 justify-between items-center py-1.5 relative"
            v-for="(prd, index) in sortedProducts"
            :key="prd.id"
          >
            <span
              v-if="shouldShowDepartmentBlocked(prd)"
              class="department-blocked"
            >
              <svg
                class="size-5 text-white"
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

              <p class="text-xs text-white/80">
                Este produto não faz parte do seu departamento
              </p>
            </span>

            <div class="flex gap-2 items-center pl-2">
              <section>
                <img
                  class="size-9 rounded-md"
                  v-if="prd.photo"
                  :src="prd.photo"
                />

                <div class="empty-product-photo" v-else>
                  <svg
                    class="size-5"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <path
                      fill="currentColor"
                      d="M4 19v2c0 .5523.44772 1 1 1h14c.5523 0 1-.4477 1-1v-2H4Z"
                    ></path>
                    <path
                      fill="currentColor"
                      fill-rule="evenodd"
                      d="M9 3c0-.55228.44772-1 1-1h8c.5523 0 1 .44772 1 1v3c0 .55228-.4477 1-1 1h-2v1h2c.5096 0 .9376.38314.9939.88957L19.8951 17H4.10498l.90116-8.11043C5.06241 8.38314 5.49047 8 6.00002 8H12V7h-2c-.55228 0-1-.44772-1-1V3Zm1.01 8H8.00002v2.01H10.01V11Zm.99 0h2.01v2.01H11V11Zm5.01 0H14v2.01h2.01V11Zm-8.00998 3H10.01v2.01H8.00002V14ZM13.01 14H11v2.01h2.01V14Zm.99 0h2.01v2.01H14V14ZM11 4h6v1h-6V4Z"
                      clip-rule="evenodd"
                    ></path>
                  </svg>
                </div>
              </section>

              <section
                class="flex flex-col items-start gap-1 justify-between flex-1"
              >
                <div
                  style="display: flex; align-items: center"
                  class="flex items-center gap-1.5"
                >
                  <p
                    :class="[
                      'text-xs font-semibold products-and-services_badge dark:text-white flex-shrink-0',
                      prd.recurrence,
                    ]"
                  >
                    {{ prd.recurrence === "monthly" ? "Mensal" : "Único" }}
                  </p>

                  <p
                    :title="prd.name"
                    class="label-product-name"
                    :class="
                      getQuantity(prd) > 0 ? 'text-white dark:text-primary' : ''
                    "
                  >
                    {{ prd.name }}
                  </p>
                </div>

                <span class="flex gap-1 items-center flex-wrap">
                  <div class="flex gap-1 items-center">
                    <p
                      class="text-xs font-semibold"
                      :class="
                        getDiscount(prd) > 0 ? 'line-through opacity-60' : ''
                      "
                    >
                      {{
                        prd.price.toLocaleString("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        })
                      }}
                    </p>

                    <p v-if="getDiscount(prd) > 0" class="discount-percentage">
                      - {{ getDiscount(prd) }}%
                    </p>

                    <p v-if="getDiscount(prd) > 0" class="discounted-price">
                      {{
                        calculateFinalPrice(prd).toLocaleString("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        })
                      }}
                    </p>
                  </div>

                  <p v-if="getQuantity(prd) > 0" class="price-line">
                    - x {{ getQuantity(prd) }} =
                    <a class="price-total">
                      {{
                        (
                          calculateFinalPrice(prd) * getQuantity(prd)
                        ).toLocaleString("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        })
                      }}
                    </a>
                  </p>
                </span>
              </section>
            </div>

            <section class="product-actions-section">
              <div class="quantity-controls">
                <button
                  :disabled="shouldShowDepartmentBlocked(prd) || readonly"
                  class="action-list-button bg-base-200"
                  @click="decreaseQuantity(prd)"
                >
                  -
                </button>

                <p
                  class="w-5 text-xs flex items-center justify-center font-semibold font-sans"
                  :class="
                    getQuantity(prd) > 0 ? 'text-white dark:text-black' : ''
                  "
                >
                  {{ getQuantity(prd) }}
                </p>

                <button
                  :disabled="shouldShowDepartmentBlocked(prd) || readonly"
                  class="action-list-button bg-base-200"
                  @click="increaseQuantity(prd)"
                >
                  +
                </button>
              </div>

              <div
                v-if="getQuantity(prd) > 0"
                class="discount-input-wrapper-animated"
              >
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="1"
                  :value="getDiscount(prd)"
                  @input="validateDiscount(prd, $event)"
                  @change="validateDiscount(prd, $event)"
                  :disabled="shouldShowDepartmentBlocked(prd) || readonly"
                  class="discount-input-compact"
                  placeholder="0"
                />
                <span class="discount-symbol">%</span>
              </div>
            </section>
          </li>
        </ul>

        <InfiniteLoading
          v-if="nextPage"
          @infinite="loadMoreProducts"
          class="p-3"
        >
          <template #spinner>
            <section class="w-full justify-center items-center flex">
              <div
                class="size-4 animate-spin rounded-full border-4 border-solid border-primary border-t-transparent"
              />
            </section>
          </template>
        </InfiniteLoading>
      </div>

      <section
        v-if="!loading && productsList.length <= 0"
        class="flex flex-col flex-1 gap-2 items-center justify-center"
      >
        <p
          class="text-gray-200 dark:text-gray-900 text-xs md:text-base font-sans"
        >
          Nenhum item encontrado
        </p>
        <p
          v-if="!itsSearching"
          class="text-gray-200 text-[10px] md:text-xs font-sans"
        >
          Comece criando seu primeiro na aba <strong>Produtos</strong>
        </p>
      </section>
    </main>
  </div>
</template>
<style src="../../calendar/utils/calendarTheme.css"></style>
<style scoped>
.department-blocked {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  position: absolute;
  background-color: rgba(47, 51, 57, 0.67);
  gap: 0.5rem;
}

.list-products-wrapper {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.empty-product-photo {
  width: 2.25rem;
  height: 2.25rem;
  border-radius: 0.375rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-width: 1px;
  border-color: #26343d;
}

.header-products-list {
  position: sticky;
  top: 0px;
  z-index: 50;
  /* background-color: #111b21; */
  padding-top: 0.25rem;
  padding-bottom: 0.25rem;
  padding-left: 0.375rem;
  padding-right: 0.375rem;
  display: flex;
  gap: 0.5rem;
}

.search-products-input {
  width: 100%;
  font-size: 0.75rem;
  line-height: 1rem;
  background-color: transparent;
  border-radius: 0.375rem;
  padding-top: 0.375rem;
  outline: 2px solid transparent;
  outline-offset: 2px;
  border-style: none;
}
.search-products-input:focus {
  outline: 2px solid transparent;
  outline-offset: 2px;
  --tw-ring-offset-shadow: var(--tw-ring-inset) 0 0 0
    var(--tw-ring-offset-width) var(--tw-ring-offset-color);
  --tw-ring-shadow: var(--tw-ring-inset) 0 0 0
    calc(0px + var(--tw-ring-offset-width)) var(--tw-ring-color);
  box-shadow:
    var(--tw-ring-offset-shadow), var(--tw-ring-shadow),
    var(--tw-shadow, 0 0 #0000);
  --tw-shadow: 0 0 #0000;
  --tw-shadow-colored: 0 0 #0000;
  box-shadow:
    var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000),
    var(--tw-shadow);
}

.list-products-list {
  flex: 1 1 0%;
  min-height: 0px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.label-product-name {
  font-size: 0.75rem;
  line-height: 1rem;
  text-align: start;
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 6rem;
}

.action-list-button {
  justify-content: center;
  align-items: center;
  display: flex;
  border-radius: 0.375rem;
  width: 1.5rem;
  height: 1.5rem;
  font-weight: 600;
}
.action-list-button:hover {
  background-color: #26343d;
  color: white;
}

.products-and-services_badge {
  @apply inline-flex justify-center items-center rounded-md px-1.5 py-0.5 text-[10px] font-medium hover:scale-105 transition-all h-fit w-12;
}
.products-and-services_badge.monthly {
  @apply bg-green-600/20  text-green-400 hover:text-green-200;
}
.products-and-services_badge.unique {
  @apply bg-[#3666f0]/50  text-blue-200 hover:text-blue-100;
}

.total-price-badge {
  background-color: var(--cyber-accent-glow);
  padding: 0.375rem;
  font-size: 10px;
  border-radius: 0.375rem;
  border-color: #22c55e;
  border-width: 1px;
  flex-wrap: wrap;
  gap: 0.5rem;
  align-items: center;
  white-space: nowrap;
  flex-shrink: 0;
  min-width: 50%;
}

.total-price-badge.with-proposal {
  justify-content: space-between;
  display: flex;
  min-width: 220px;
  padding: 0.1rem 0.1rem 0.1rem 0.5rem;
}

.dark .total-price-badge {
  color: #000000;
}

.proposal-button {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.5rem;
  border-radius: 0.375rem;
  background-color: #3191ac;
  color: white;
  font-size: 1rem;
  transition: all 0.2s;
  cursor: pointer;
  border: none;
}

.proposal-button:hover:not(.disabled) {
  background-color: #1c6579;
  transform: scale(1.05);
}

.proposal-button.disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background-color: #6b7280;
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

.label-popper {
  --popper-theme-background-color: #1f2937;
  --popper-theme-background-color-hover: #1f2937;
  --popper-theme-text-color: #ffffff;
  --popper-theme-border-width: 1px;
  --popper-theme-border-style: solid;
  --popper-theme-border-color: #374151;
  --popper-theme-border-radius: 8px;
  --popper-theme-padding: 0px;
  --popper-theme-box-shadow: 0 10px 40px -10px rgba(0, 0, 0, 0.5);
}

/* Discount Badge Styles */
.discount-badge {
  display: flex;
  align-items: center;
  transition: all 0.2s ease;
  cursor: pointer;
  animation: bounce 3s infinite;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
}

@keyframes bounce {
  0%,
  20%,
  50%,
  80%,
  100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-10px);
  }
  60% {
    transform: translateY(-5px);
  }
}

.discount-badge:hover {
  transform: scale(1.05);
}

/* Discount Popper Styles */
.discount-popper {
  --popper-theme-background-color: #1f2937;
  --popper-theme-background-color-hover: #1f2937;
  --popper-theme-text-color: #ffffff;
  --popper-theme-border-width: 1px;
  --popper-theme-border-style: solid;
  --popper-theme-border-color: #374151;
  --popper-theme-border-radius: 8px;
  --popper-theme-padding: 0px;
  --popper-theme-box-shadow: 0 10px 40px -10px rgba(0, 0, 0, 0.5);
}

.discount-tooltip {
  border-radius: 0.5rem;
  padding: 0.75rem;
  max-width: 280px;
  color: white;
}

.discount-tooltip-header {
  font-size: 0.75rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #374151;
  color: #f59e0b;
}

.discount-tooltip-footer {
  border-top: 1px solid #374151;
  margin-top: 0.5rem;
  padding-top: 0.5rem;
}

.savings-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.688rem;
}

.savings-label {
  opacity: 0.8;
  font-weight: 500;
}

.savings-amount {
  font-weight: 700;
  color: #34d399;
}

.discount-tooltip-list {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
  list-style: none;
  padding: 0;
  margin: 0;
  max-height: 200px;
  overflow-y: auto;
}

.discount-tooltip-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.688rem;
  padding: 0.375rem;
  border-radius: 0.375rem;
  background-color: #374151;
  transition: background-color 0.2s ease;
}

.discount-tooltip-item:hover {
  background-color: #4b5563;
}

.discount-tooltip-name {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: #e5e7eb;
}

.discount-tooltip-value {
  font-weight: 700;
  color: #34d399;
  white-space: nowrap;
}

/* Product Actions Section */
.product-actions-section {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
  padding-right: 0.5rem;
  min-width: fit-content;
}

.actions-top-row {
  display: flex;
  align-items: center;
  gap: 0.375rem;
}

.quantity-controls {
  display: flex;
  gap: 0.25rem;
  align-items: center;
}

/* Discount Input Styles */
.discount-input-wrapper-animated {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
  animation: slideDown 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  transform-origin: top;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-8px);
    max-height: 0;
  }
  to {
    opacity: 1;
    transform: translateY(0);
    max-height: 100px;
  }
}

.discount-input-compact {
  width: 100%;
  height: 1.5rem;
  padding: 0.25rem;
  font-size: 0.75rem;
  font-weight: 600;
  border-radius: 0.375rem;
  border: 1px solid #374151;
  background-color: #1f2937;
  color: white;
  outline: none;
  transition: all 0.2s ease;
  text-align: center;
}

.discount-input-compact:focus {
  border-color: #f59e0b;
  box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.1);
}

.discount-input-compact:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.discount-input-compact::placeholder {
  color: #6b7280;
}

/* Remove spinner buttons in number input */
.discount-input-compact::-webkit-outer-spin-button,
.discount-input-compact::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.discount-input-compact[type="number"] {
  -moz-appearance: textfield;
}

.discount-symbol {
  position: absolute;
  right: 0.5rem;
  top: 50%;
  transform: translateY(-50%);
  font-size: 0.688rem;
  font-weight: 700;
  color: #f59e0b;
  pointer-events: none;
}

/* Dark mode (modo claro da plataforma) */
.dark .discount-input-compact {
  background-color: #f3f4f6;
  color: #111827;
  border-color: #d1d5db;
}

.dark .discount-input-compact:focus {
  border-color: #f59e0b;
  box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.2);
}

.dark .discount-tooltip {
  background-color: #ffffff;
  color: #111827;
  box-shadow: 10px 40px -10px rgba(0, 0, 0, 0.2);
}

.dark .discount-tooltip-header {
  color: #d97706;
  border-bottom-color: #e5e7eb;
}

.dark .discount-tooltip-item {
  background-color: #f3f4f6;
}

.dark .discount-tooltip-item:hover {
  background-color: #e5e7eb;
}

.dark .discount-tooltip-name {
  color: #374151;
}

.dark .discount-tooltip-value {
  color: #059669;
}

.dark .discounted-price {
  color: #047857;
}

/* Popper colors for dark mode */
.dark .label-popper {
  --popper-theme-background-color: #ffffff;
  --popper-theme-background-color-hover: #ffffff;
  --popper-theme-text-color: #111827;
  --popper-theme-border-color: #d1d5db;
}

.dark .discount-popper {
  --popper-theme-background-color: #ffffff;
  --popper-theme-background-color-hover: #ffffff;
  --popper-theme-text-color: #111827;
  --popper-theme-border-color: #d1d5db;
}

/* Pure CSS classes for discount display */
.discount-percentage {
  color: #f97316;
  font-size: 0.75rem;
  font-weight: 700;
}

.dark .discount-percentage {
  color: #f58f46;
}

.discounted-price {
  color: #34d399;
  font-size: 0.75rem;
  font-weight: 700;
}

/* Pure CSS for products badges */
.products-and-services_badge {
  display: inline-flex;
  justify-content: center;
  align-items: center;
  border-radius: 0.375rem;
  padding-left: 0.375rem;
  padding-right: 0.375rem;
  padding-top: 0.125rem;
  padding-bottom: 0.125rem;
  font-size: 0.625rem;
  line-height: 0.875rem;
  font-weight: 500;
  height: fit-content;
  width: 3rem;
  transition: all 0.2s;
}

.products-and-services_badge:hover {
  transform: scale(1.05);
}

.products-and-services_badge.monthly {
  background-color: rgba(22, 163, 74, 0.2);
  color: #4ade80;
}

.products-and-services_badge.monthly:hover {
  color: #a7f3d0;
}

.products-and-services_badge.unique {
  background-color: rgba(54, 102, 240, 0.5);
  color: #93c5fd;
}

.products-and-services_badge.unique:hover {
  color: #dbeafe;
}

/* Adjust badge colors for dark mode */
.dark .products-and-services_badge.monthly {
  background-color: rgba(22, 163, 74, 0.3);
  color: #16a34a;
}

.dark .products-and-services_badge.monthly:hover {
  color: #15803d;
}

.dark .products-and-services_badge.unique {
  background-color: rgba(54, 102, 240, 0.6);
  color: #1d4ed8;
}

.dark .products-and-services_badge.unique:hover {
  color: #1e40af;
}
.price-line {
  display: flex;
  align-items: center;
  gap: 0.25rem;

  font-size: 0.75rem;
  font-weight: 600;
}

.price-total {
  display: inline-flex;
  align-items: center;

  font-weight: 700;
}
</style>
