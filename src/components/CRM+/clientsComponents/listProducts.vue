<script setup>
/**
 * 📋 Descrição:
 * Componente de exibição e seleção de produtos.
 */

import { computed, onMounted, reactive, watch, toRaw, ref } from "vue";
import { crm_products } from "~/utils/systemUrls";
import InfiniteLoading from "v3-infinite-loading";
import api from "~/utils/api.js";
import DiscountProductCard from "./DiscountProductCard.vue";
import { formatCurrency } from "~/utils/currencyUtils.js";

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

const clampDiscount = (val, maxDiscount = 100) => {
  let n = Number(val);
  if (!Number.isFinite(n)) n = 0;
  if (n < 0) n = 0;
  if (n > maxDiscount) n = maxDiscount;
  return Math.round(n * 100) / 100;
};

const updateDiscount = (prd, value) => {
  if (props.readonly) return;
  if (shouldShowDepartmentBlocked(prd)) return;
  if (!prd.discountable) return;

  const maxDiscount = prd.max_discount || 100;
  const numValue = clampDiscount(value, maxDiscount);

  const found = selectedProducts.value.find((p) => getProductId(p) === prd.id);
  if (found) {
    found.discount = numValue;
  }
};

const handleDiscountInput = (prd, e) => {
  if (props.readonly) return;
  if (shouldShowDepartmentBlocked(prd)) return;
  if (!prd.discountable) return;

  const productId = prd.id;
  isEditingDiscount.value[productId] = true;
  let value = e.target.value;

  // Permite deletar tudo
  if (value === "") {
    discountInputValues.value[productId] = "";
    e.target.value = "";
    clearTimeout(discountDebounceTimers[productId]);
    discountDebounceTimers[productId] = setTimeout(() => {
      // Só reseta se ainda está vazio (user não digitou nada)
      if (discountInputValues.value[productId] === "") {
        discountInputValues.value[productId] = "0";
        updateDiscount(prd, 0);
      }
      isEditingDiscount.value[productId] = false;
    }, 600);
    return;
  }

  // Remove tudo que não é número, ponto ou vírgula, depois normaliza para ponto
  value = value.replace(/[^\d.,]/g, "").replace(",", ".");

  // Remove pontos extras (mantém apenas um)
  const parts = value.split(".");
  if (parts.length > 2) {
    value = parts[0] + "." + parts.slice(1).join("");
  }

  // Exibe com vírgula
  e.target.value = value.replace(".", ",");
  discountInputValues.value[productId] = value;

  // Debounce de 600ms
  clearTimeout(discountDebounceTimers[productId]);
  discountDebounceTimers[productId] = setTimeout(() => {
    validateDiscount(prd);
    isEditingDiscount.value[productId] = false;
  }, 600);
};

const validateDiscount = (prd) => {
  const productId = prd.id;
  let raw = (discountInputValues.value[productId] || "").trim();

  // Se o campo está vazio, mantém o valor atual do desconto do produto
  if (raw === "" || raw === ".") {
    const currentDiscount = getDiscount(prd);
    discountInputValues.value[productId] = String(currentDiscount);
    return;
  }

  const maxDiscount = prd.max_discount || 100;
  const n = clampDiscount(raw, maxDiscount);
  discountInputValues.value[productId] = String(n);
  updateDiscount(prd, n);
};

const handleDiscountFocus = (prd, e) => {
  const productId = prd.id;
  isEditingDiscount.value[productId] = true;
  e.target.select();
};

const handleDiscountBlur = (prd) => {
  const productId = prd.id;
  clearTimeout(discountDebounceTimers[productId]);

  // Se o campo está vazio, reseta para 0
  if (discountInputValues.value[productId] === "") {
    discountInputValues.value[productId] = "0";
    updateDiscount(prd, 0);
  } else {
    validateDiscount(prd);
  }

  isEditingDiscount.value[productId] = false;
};

const getDiscountInputValue = (prd) => {
  const productId = prd.id;
  if (isEditingDiscount.value[productId]) {
    // Durante edição, converte para vírgula para exibição
    return (
      discountInputValues.value[productId] ?? String(getDiscount(prd))
    ).replace(".", ",");
  }
  // Quando não está editando, mostra o valor armazenado com vírgula
  return String(getDiscount(prd)).replace(".", ",");
};

const formatDiscount = (value) => {
  const num = Number(value);
  if (!Number.isFinite(num)) return "0,00";
  return num.toFixed(2).replace(".", ",");
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
    // Inicializa o valor de desconto para este produto
    discountInputValues.value[prd.id] = "0";
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
      // Evita duplicados caso API retorne algum repetido ou que já está em selectedProducts
      const existingIds = new Set(productsList.value.map((p) => p.id));
      const selectedIds = new Set(
        selectedProducts.value.map((p) => getProductId(p)),
      );

      const newOnes = results.filter(
        (p) => !existingIds.has(p.id) && !selectedIds.has(p.id),
      );
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

  // --- Pré-carrega produtos já selecionados que não estão na lista ---
  const existingIds = new Set(productsList.value.map((p) => p.id));
  const preLoadedProducts = selectedProducts.value
    .filter((item) => {
      const productId = getProductId(item);
      return productId && !existingIds.has(productId);
    })
    .map((item) => item.product);

  if (preLoadedProducts.length > 0) {
    productsList.value = [...preLoadedProducts, ...productsList.value];
  }

  // Inicializa discountInputValues para produtos já selecionados
  selectedProducts.value.forEach((item) => {
    const productId = getProductId(item);
    if (productId && !discountInputValues.value[productId]) {
      discountInputValues.value[productId] = String(item.discount || 0);
    }
  });
});

// Monitora mudanças em sortedProducts para garantir que discountInputValues sempre tenha valores inicializados
watch(
  sortedProducts,
  (newProducts) => {
    newProducts.forEach((product) => {
      if (product && product.id && !discountInputValues.value[product.id]) {
        // Procura o desconto do produto em selectedProducts
        const selectedItem = selectedProducts.value.find(
          (p) => getProductId(p) === product.id,
        );
        const discount = selectedItem?.discount || 0;
        discountInputValues.value[product.id] = String(discount);
      }
    });
  },
  { immediate: true },
);

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

    // Inicializa valores de input de desconto (armazena com ponto)
    newVal.forEach((item) => {
      const productId = getProductId(item);
      if (productId && !isEditingDiscount.value[productId]) {
        discountInputValues.value[productId] = String(item.discount || 0);
      }
    });
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

// Controle de edição de desconto
const discountInputValues = ref({});
const isEditingDiscount = ref({});
let discountDebounceTimers = {};

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
      class="header-products-list bg-base-300"
    >
      <div style="padding: 0.5rem 0.5rem 0rem 0.5rem">
        <section
          class="total-price-badge text-white"
          :class="{ 'with-proposal': proposal }"
        >
          <div class="flex items-center gap-1.5 flex-wrap">
            <span class="text-xs">Valor total:</span>
            <span class="font-semibold text-sm">
              {{
                (totalPrice + totalSavings).toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                })
              }}
            </span>

            <template v-if="productsWithDiscount.length > 0">
              <span class="text-xs">-</span>
              <span
                style="font-size: 0.875rem"
                class="font-medium discount-percentage"
              >
                {{
                  totalSavings.toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  })
                }}
              </span>
              <Popper class="discount-popper" :hover="true" placement="top">
                <template #content>
                  <main class="discount-tooltip">
                    <div class="discount-tooltip-header">
                      Produtos com desconto ({{ productsWithDiscount.length }})
                    </div>
                    <ul class="discount-tooltip-list">
                      <DiscountProductCard
                        v-for="item in productsWithDiscount"
                        :key="getProductId(item)"
                        :item="item"
                        :getProductId="getProductId"
                      />
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
                <div class="discount-badge">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="size-6"
                    viewBox="0 0 55 62"
                    fill="none"
                  >
                    <path
                      d="M26.6839 11.1304C28.6291 8.59593 32.6389 9.49368 33.6735 12.6953V12.6953C34.3268 14.7172 36.3132 15.9948 38.2894 15.6568V15.6568C41.3197 15.1384 43.9062 18.2943 42.9019 21.2848L42.6968 21.8954C42.033 23.8721 42.8293 26.1348 44.6 27.3029V27.3029C47.3871 29.1414 47.4599 33.2982 44.7337 34.9412L44.5536 35.0498C42.8092 36.1011 42.0583 38.3046 42.7427 40.3634L42.9237 40.9079C43.9644 44.0383 41.4451 47.0065 38.3496 46.2972V46.2972C36.3456 45.838 34.3946 46.9497 33.7532 48.9162L33.6179 49.3311C32.6312 52.3561 28.7486 52.8621 26.7994 50.2196V50.2196C25.5373 48.5086 23.2813 48.0035 21.5812 49.0513V49.0513C18.9556 50.6695 15.4947 48.5194 15.5032 45.2754L15.5044 44.8305C15.5099 42.7216 14.0337 40.8426 12.0265 40.4037V40.4037C8.92596 39.7259 7.48972 35.872 9.41874 33.4065L9.75425 32.9777C11.0229 31.3561 10.9991 28.9791 9.69678 27.2457L9.56236 27.0668C7.52706 24.3577 8.86928 20.5177 12.0288 20.0105V20.0105C14.036 19.6883 15.4714 17.9253 15.4592 15.7972L15.4555 15.1399C15.437 11.9204 18.8135 10.0995 21.4769 11.8926V11.8926C23.2138 13.062 25.4555 12.731 26.6839 11.1304V11.1304Z"
                      fill="currentColor"
                    />
                    <path
                      d="M21.3849 25.185C20.8649 25.185 20.4649 25.3984 20.1849 25.825C19.9316 26.2117 19.8049 26.7384 19.8049 27.405C19.8049 28.8717 20.3316 29.605 21.3849 29.605C22.4516 29.605 22.9849 28.8717 22.9849 27.405C22.9849 26.765 22.8516 26.2384 22.5849 25.825C22.3049 25.3984 21.9049 25.185 21.3849 25.185ZM21.3849 23.345C22.5849 23.345 23.4983 23.7384 24.1249 24.525C24.6849 25.2317 24.9649 26.1917 24.9649 27.405C24.9649 28.6184 24.6849 29.5717 24.1249 30.265C23.4983 31.065 22.5849 31.465 21.3849 31.465C20.1583 31.465 19.2383 31.065 18.6249 30.265C18.0783 29.5584 17.8049 28.605 17.8049 27.405C17.8049 26.1917 18.0783 25.2317 18.6249 24.525C19.2516 23.7384 20.1716 23.345 21.3849 23.345ZM31.8649 23.105L23.1249 38.865H20.9449L29.6649 23.105H31.8649ZM31.4249 32.365C30.3716 32.365 29.8449 33.105 29.8449 34.585C29.8449 35.2384 29.9783 35.7584 30.2449 36.145C30.5249 36.585 30.9183 36.805 31.4249 36.805C32.4916 36.805 33.0249 36.065 33.0249 34.585C33.0249 33.105 32.4916 32.365 31.4249 32.365ZM31.4249 30.505C32.6383 30.505 33.5583 30.8984 34.1849 31.685C34.7449 32.3917 35.0249 33.3584 35.0249 34.585C35.0249 35.7984 34.7449 36.7517 34.1849 37.445C33.5583 38.2317 32.6383 38.625 31.4249 38.625C30.2249 38.625 29.3116 38.2317 28.6849 37.445C28.1516 36.7517 27.8849 35.7984 27.8849 34.585C27.8849 33.345 28.1516 32.3784 28.6849 31.685C29.3116 30.8984 30.2249 30.505 31.4249 30.505Z"
                      fill="white"
                    />
                  </svg>
                </div>
              </Popper>
              <span class="text-xs">=</span>
              <span
                class="font-bold text-sm text-green-400 dark:text-green-600"
              >
                {{
                  totalPrice.toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  })
                }}
              </span>
            </template>
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
      </div>

      <input
        class="search-products-input bg-base-200 text-white dark:text-black"
        type="text"
        placeholder="Buscar..."
        v-model="filters.query"
      />
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
                      {{ formatCurrency(prd.price, prd.currency) }}
                    </p>

                    <p v-if="getDiscount(prd) > 0" class="discount-percentage">
                      - {{ formatDiscount(getDiscount(prd)) }}%
                    </p>

                    <p v-if="getDiscount(prd) > 0" class="discounted-price">
                      {{
                        formatCurrency(calculateFinalPrice(prd), prd.currency)
                      }}
                    </p>
                  </div>

                  <p v-if="getQuantity(prd) > 0" class="price-line">
                    - x {{ getQuantity(prd) }} =
                    <a class="price-total">
                      {{
                        formatCurrency(
                          calculateFinalPrice(prd) * getQuantity(prd),
                          prd.currency,
                        )
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

              <Popper
                v-if="getQuantity(prd) > 0"
                class="discount-input-popper"
                :hover="true"
                arrow
                placement="left"
              >
                <template #content>
                  <main class="discount-input-tooltip">
                    <div v-if="!prd.discountable" class="text-xs">
                      Desconto não permitido para este produto
                    </div>
                    <div v-else class="flex flex-col gap-1">
                      <div class="text-xs">Desconto habilitado</div>
                      <div class="text-xs">
                        Máximo:
                        <span class="font-bold text-orange-400"
                          >{{ prd.max_discount || 100 }}%</span
                        >
                      </div>
                    </div>
                  </main>
                </template>
                <div class="discount-input-wrapper-animated">
                  <input
                    :value="getDiscountInputValue(prd)"
                    @input="(e) => handleDiscountInput(prd, e)"
                    @focus="(e) => handleDiscountFocus(prd, e)"
                    @blur="() => handleDiscountBlur(prd)"
                    inputmode="decimal"
                    type="text"
                    :disabled="
                      !prd.discountable ||
                      shouldShowDepartmentBlocked(prd) ||
                      readonly
                    "
                    class="discount-input-compact"
                    :class="{ 'not-discountable': !prd.discountable }"
                    :placeholder="prd.discountable ? '0' : 'N/A'"
                  />
                  <span class="discount-symbol">%</span>
                </div>
              </Popper>
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
  /* padding-top: 0.25rem;
  padding-bottom: 0.25rem;
  padding-left: 0.375rem;
  padding-right: 0.375rem; */
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.search-products-input {
  width: 100%;
  font-size: 0.75rem;
  /* border-radius: 0.375rem; */
  padding: 0.5rem 0.5rem;
  border: none;
  transition: all 0.2s ease;
}

.search-products-input::placeholder {
  color: rgba(255, 255, 255, 0.5);
}

.search-products-input:focus {
  outline: none;
  background-color: rgba(255, 255, 255, 0.15);
  border-color: #22c55e;
  box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.1);
}

.dark .search-products-input {
  background-color: rgba(0, 0, 0, 0.1);
  border-color: rgba(0, 0, 0, 0.2);
}

.dark .search-products-input::placeholder {
  color: rgba(0, 0, 0, 0.5);
}

.dark .search-products-input:focus {
  background-color: rgba(0, 0, 0, 0.15);
  border-color: #22c55e;
  box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.1);
}

.list-products-list {
  flex: 1 1 0%;
  min-height: 0px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  overflow-x: hidden;
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
  padding: 0.375rem 0.625rem;
  font-size: 0.813rem;
  border-radius: 0.5rem;
  border-color: #22c55e;
  border-width: 1px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  gap: 0.5rem;
  box-shadow: 0 2px 8px rgba(34, 197, 94, 0.2);
}

.total-price-badge.with-proposal {
  padding: 0.25rem 0.25rem 0.25rem 0.625rem;
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

* {
  scrollbar-width: thin;
  scrollbar-color: #334155 transparent;
}

/* Discount Badge Styles */
.discount-badge {
  display: flex;
  align-items: center;
  transition: all 0.2s ease;
  cursor: pointer;
  margin-left: -6px;
  animation: bounce 3s infinite;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
  color: #f97316;
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
  max-width: 320px;
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
  max-height: 300px;
  overflow-y: auto;
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
  width: 4.77rem;
  animation: slideDown 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  transform-origin: top;
}

.discount-input-popper {
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

.discount-input-tooltip {
  border-radius: 0.5rem;
  padding: 0.5rem 0.75rem;
  color: white;
  font-size: 0.75rem;
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
  padding: 0 0.375rem;
  font-size: 0.7rem;
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

.discount-input-compact.not-discountable {
  background-color: #374151;
  border-color: #4b5563;
  color: #9ca3af;
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

.dark .discount-input-tooltip {
  background-color: #ffffff;
  color: #111827;
}

.dark .discount-tooltip-header {
  color: #d97706;
  border-bottom-color: #e5e7eb;
}

.dark .discount-product-card {
  background-color: #f3f4f6;
}

.dark .discount-product-card:hover {
  background-color: #e5e7eb;
}

.dark .product-img-placeholder {
  background-color: #ffffff;
  border-color: #d1d5db;
  color: #6b7280;
}

.dark .discount-product-name {
  color: #111827;
}

.dark .original-price {
  color: #6b7280;
}

.dark .discount-badge-mini {
  color: #ea580c;
  background-color: rgba(234, 88, 12, 0.15);
}

.dark .final-price {
  color: #059669;
}

.dark .discount-product-quantity {
  color: #4b5563;
}

.dark .discount-product-quantity .subtotal {
  color: #047857;
}

.dark .discount-popper {
  --popper-theme-background-color: #ffffff;
  --popper-theme-background-color-hover: #ffffff;
  --popper-theme-text-color: #111827;
  --popper-theme-border-color: #d1d5db;
}

.dark .discount-input-popper {
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

.discounted-price {
  font-size: 0.75rem;
  font-weight: 700;
}

.dark .discount-percentage {
  color: #f58f46;
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
