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
});

const emit = defineEmits(["update:modelValue"]);

const loading = ref(false);
const productsList = ref([]);

// --- Organiza a lista de produtos para exibir bloqueados ao final ---
const sortedProducts = computed(() => {
  return [...productsList.value].sort((a, b) => {
    const blockedA = shouldShowDepartmentBlocked(a);
    const blockedB = shouldShowDepartmentBlocked(b);
    if (blockedA === blockedB) return 0;
    return blockedA - blockedB;
  });
});

// --- Normaliza itens do parent para sempre ter { product, quantity } ---
function normalizeProducts(list) {
  if (!Array.isArray(list)) return [];
  return list.map((item) => {
    if (item && item.product) {
      return {
        product: { ...item.product },
        quantity: item.quantity ?? 0,
      };
    }
    return {
      product: { ...item },
      quantity: item.quantity ?? 0,
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
    return total + price * quantity;
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

      <section class="total-price-badge text-white">
        Valor total:
        {{
          totalPrice.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
          })
        }}
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
            class="flex w-full justify-between items-center py-1.5 relative"
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
                  class="size-8 rounded-md"
                  v-if="prd.photo"
                  :src="prd.photo"
                />

                <div class="empty-product-photo" v-else>
                  <svg
                    class="size-4"
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

              <section class="flex flex-col items-start">
                <p
                  :title="prd.name"
                  class="label-product-name"
                  :class="
                    getQuantity(prd) > 0 ? 'text-white dark:text-primary' : ''
                  "
                >
                  {{ prd.name }}
                </p>

                <span class="text-[10px] flex gap-1 items-center">
                  <p class="text-xs font-semibold font-sans">
                    R$
                    {{
                      prd.price.toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      })
                    }}
                  </p>

                  <p
                    v-if="getQuantity(prd) > 0"
                    class="font-sans text-primary text-white dark:text-primary font-semibold"
                  >
                    - x {{ getQuantity(prd) }} =
                    <a class="text-green-400 dark:text-[#14532d] font-semibold">
                      {{
                        (prd.price * getQuantity(prd)).toLocaleString("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        })
                      }}
                    </a>
                  </p>
                </span>
              </section>
            </div>

            <section class="flex flex-col gap-1 pr-2">
              <p
                :class="[
                  'text-xs font-semibold font-sans products-and-services_badge dark:text-white',
                  prd.recurrence,
                ]"
              >
                {{ prd.recurrence === "monthly" ? "Mensal" : "Único" }}
              </p>

              <div class="flex gap-1">
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
  width: 2rem;
  height: 2rem;
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
  max-width: 8rem;
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
  @apply inline-flex w-full justify-center items-center rounded-md px-1 py-1 text-[10px] font-medium hover:scale-105 transition-all;
}
.products-and-services_badge.monthly {
  @apply bg-green-600/20  text-green-400 hover:text-green-200;
}
.products-and-services_badge.unique {
  @apply bg-[#3666f0]/50  text-blue-200 hover:text-blue-100;
}

.total-price-badge {
  background-color: #14532d;
  padding: 0.375rem;
  font-size: 10px;
  border-radius: 0.375rem;
  border-color: #22c55e;
  border-width: 1px;
  width: 100%;
  margin-left: 0.125rem;
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
