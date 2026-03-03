<script setup>
import { computed, ref, watchEffect } from "vue";
import ProductListItem from "../../ProductListItem.vue";

const props = defineProps({
  parentContact: {
    type: Object,
    required: true,
  },
  childContact: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(["changes-count"]);

const showAllProducts = ref(false);

const productsComparison = computed(() => {
  const parentProducts = props.parentContact?.products || [];
  const childProducts = props.childContact?.products || [];

  const parentIds = new Set(
    parentProducts.map((product) => product.product?.id || product.id),
  );
  const keptFromParent = parentProducts;
  const incorporatedFromChild = childProducts.filter(
    (product) => !parentIds.has(product.product?.id || product.id),
  );
  const hasChanges = incorporatedFromChild.length > 0;
  const total = parentProducts.length + incorporatedFromChild.length;

  return {
    hasChanges,
    keptFromParent,
    incorporatedFromChild,
    total,
  };
});

watchEffect(() => {
  emit("changes-count", productsComparison.value.hasChanges ? 1 : 0);
});
</script>

<template>
  <div v-if="productsComparison.hasChanges" class="array-changes-section">
    <div class="array-changes-header">
      <svg class="size-3.5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M4 19v2c0 .5523.44772 1 1 1h14c.5523 0 1-.4477 1-1v-2H4Z" />
        <path
          fill-rule="evenodd"
          d="M9 3c0-.55228.44772-1 1-1h8c.5523 0 1 .44772 1 1v3c0 .55228-.4477 1-1 1h-2v1h2c.5096 0 .9376.38314.9939.88957L19.8951 17H4.10498l.90116-8.11043C5.06241 8.38314 5.49047 8 6.00002 8H12V7h-2c-.55228 0-1-.44772-1-1V3Z"
          clip-rule="evenodd"
        />
      </svg>
      <span class="array-changes-title">Produtos</span>
      <span class="array-changes-count">
        +{{ productsComparison.incorporatedFromChild.length }} incorporado{{
          productsComparison.incorporatedFromChild.length > 1 ? "s" : ""
        }}
      </span>
      <button
        class="expand-button"
        type="button"
        @click="showAllProducts = !showAllProducts"
      >
        {{
          showAllProducts
            ? "Ocultar"
            : `Ver todos (${productsComparison.total})`
        }}
        <svg
          class="size-3"
          :class="{ 'rotate-180': showAllProducts }"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fill-rule="evenodd"
            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
            clip-rule="evenodd"
          />
        </svg>
      </button>
    </div>

    <div class="products-list">
      <div
        v-for="product in productsComparison.incorporatedFromChild"
        :key="product.product?.id || product.id"
        class="product-wrapper product-wrapper--incorporated"
      >
        <ProductListItem
          :product="product"
          :quantity="product.quantity || 1"
          :discount="product.discount || 0"
          :incorporated="true"
        />
      </div>

      <template v-if="showAllProducts">
        <div
          v-for="product in productsComparison.keptFromParent"
          :key="product.product?.id || product.id"
          class="product-wrapper"
        >
          <ProductListItem
            :product="product"
            :quantity="product.quantity || 1"
            :discount="product.discount || 0"
          />
        </div>
      </template>
    </div>
  </div>
</template>
