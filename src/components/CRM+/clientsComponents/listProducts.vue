<script setup>
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
});

const emit = defineEmits(["update:modelValue"]);

const loading = ref(false);
const productsList = ref([]);
const selectedProducts = ref([...props.modelValue]);
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

// Obtém a quantidade de um produto
const quantityMap = computed(() => {
  const map = {};
  selectedProducts.value.forEach((p) => {
    map[p.product.id] = p.quantity;
  });
  return map;
});

const getQuantity = (prd) => quantityMap.value[prd.id] || 0;

// Incrementa
const increaseQuantity = (prd) => {
  const found = selectedProducts.value.find((p) => p.product.id === prd.id);
  if (found) {
    found.quantity++;
  } else {
    selectedProducts.value.push({
      product: { ...prd },
      quantity: 1,
    });
  }
};

// Decrementa (sem deixar ir abaixo de 0)
const decreaseQuantity = (prd) => {
  const found = selectedProducts.value.find((p) => p.product.id === prd.id);
  if (!found) return;

  // Se ainda não existe, nada a fazer
  if (found.quantity > 0) {
    found.quantity--;
  } else {
    found.quantity = 0; // garante que nunca fique negativo
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
      mountUrl(crm_products, { page: page.value, ...params })
    );
    const { results, next, previous } = data;

    // Atualiza ponteiros de paginação
    nextPage.value = next;
    previousPage.value = previous;

    // Concatena somente em páginas > 1. Evita reset + duplicação.
    if (page.value === 1) {
      productsList.value = results;
    } else {
      // Evita duplicados caso API retorne algum repetido
      const existingIds = new Set(productsList.value.map((p) => p.id));
      const newOnes = results.filter((p) => !existingIds.has(p.id));
      productsList.value = [...productsList.value, ...newOnes];
    }

    // Prepara a próxima página (incrementa apenas se há próximo)
    if (nextPage.value) {
      page.value += 1;
    }
  } catch (error) {
    console.error("Erro ao buscar produtos:", error);
  }
};

onMounted(async () => {
  // Se allProducts já veio com dados, usamos ele direto
  if (props.allProducts && props.allProducts.results?.length > 0) {
    productsList.value = props.allProducts.results;
    nextPage.value = props.allProducts.next || null;
    previousPage.value = props.allProducts.previous || null;
    page.value = 2; // assume que já carregamos a primeira página
  } else {
    // Caso contrário, faz o fetch inicial
    await getProducts();
  }
});
watch(
  selectedProducts,
  (newVal) => {
    emit("update:modelValue", newVal);
  },
  { deep: true }
);

const isLoading = ref(false);

const loadMoreProducts = async (state) => {
  if (isLoading.value) return; // impede chamadas duplicadas
  isLoading.value = true;

  try {
    // Se não há próxima página já finaliza
    if (!nextPage.value) {
      state.complete();
      return;
    }

    await getProducts();

    // Depois de carregar, verifica novamente se ainda há próxima
    if (nextPage.value) {
      state.loaded();
    } else {
      state.complete();
    }
  } catch (error) {
    console.error("Erro ao carregar produtos:", error);
    state.complete();
  } finally {
    isLoading.value = false; // libera para a próxima chamada
  }
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
      itsSearching.value = !!query;
      loading.value = true;
      await getProducts({ query });
      loading.value = false;
    }, 500); // 500ms de atraso após parar de digitar
  },
  { deep: true }
);
</script>

<template>
  <div
    v-if="loading"
    class="flex items-center justify-center overflow-hidden h-svh"
  >
    <SimpleLoader />
  </div>

  <main v-else class="flex flex-col overflow-hidden">
    <header
      v-if="
        (productsList.length === 0 && itsSearching) ||
        (!itsSearching && productsList.length > 0)
      "
      class="sticky top-0 z-50 bg-base-300 py-1 px-1.5 flex gap-2"
    >
      <input
        class="w-full text-xs bg-base-300 rounded-md pt-1.5 outline-none border-none focus:outline-none focus:ring-0 focus:shadow-none"
        type="text"
        placeholder="Buscar..."
        v-model="filters.query"
      />

      <section class="total-price-badge">
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
      v-if="productsList.length > 0"
      class="flex-1 overflow-y-auto flex flex-col gap-2 px-2"
    >
      <ul
        class="w-full text-gray-500 list-none list-inside dark:text-gray-400 divide-y divide-base-200"
      >
        <li
          class="flex w-full justify-between items-center py-2"
          v-for="(prd, index) in productsList"
          :key="prd.id"
        >
          <div class="flex gap-2 items-center">
            <section>
              <img
                class="size-8 rounded-md"
                v-if="prd.photo"
                :src="prd.photo"
                alt=""
              />

              <div
                class="size-8 rounded-md flex items-center justify-center border border-base-200"
                v-else
              >
                <svg
                  class="w-6 h-6"
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
                class="text-xs text-start font-semibold truncate max-w-32"
                :class="getQuantity(prd) > 0 ? 'text-white' : ''"
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

                <p v-if="getQuantity(prd) > 0" class="font-sans text-primary">
                  - x{{ getQuantity(prd) }} =
                  {{
                    (prd.price * getQuantity(prd)).toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })
                  }}
                </p>
              </span>
            </section>
          </div>

          <section class="flex flex-col gap-1">
            <p
              :class="[
                'text-xs font-semibold font-sans products-and-services_badge',
                prd.recurrence,
              ]"
            >
              {{ prd.recurrence === "monthly" ? "Mensal" : "Único" }}
            </p>

            <div class="flex gap-1">
              <button
                class="bg-base-200 size-6 rounded-md flex items-center justify-center"
                @click="decreaseQuantity(prd)"
              >
                -
              </button>

              <p
                class="w-5 text-xs flex items-center justify-center font-semibold font-sans"
                :class="getQuantity(prd) > 0 ? 'text-white' : ''"
              >
                {{ getQuantity(prd) }}
              </p>

              <button
                class="bg-base-200 size-6 rounded-md flex items-center justify-center"
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
        class="p-3 bg-base-300"
      >
        <template #spinner>
          <section class="w-full justify-center items-center flex">
            <div
              class="size-4 animate-spin rounded-full border-4 border-solid border-white border-t-transparent"
            />
          </section>
        </template>
      </InfiniteLoading>
    </div>
  </main>

  <section
    v-if="!loading && productsList.length <= 0"
    class="h-full flex flex-col items-center justify-center"
  >
    <p class="text-gray-200 text-xs md:text-base font-sans">
      Nenhum item encontrado
    </p>
    <p
      v-if="!itsSearching"
      class="text-gray-200 text-[10px] md:text-xs font-sans"
    >
      Comece criando seu primeiro na aba <strong>Produtos</strong>
    </p>
  </section>
</template>

<style scoped>
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