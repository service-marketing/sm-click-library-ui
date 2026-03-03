<script setup>
import { formatCurrency } from "~/utils/currencyUtils.js";

const props = defineProps({
  product: {
    type: Object,
    required: true,
  },
  quantity: {
    type: Number,
    default: 0,
  },
  discount: {
    type: Number,
    default: 0,
  },
  // Para exibir badge de incorporado
  incorporated: {
    type: Boolean,
    default: false,
  },
  // Modo compacto (sem foto, apenas info)
  compact: {
    type: Boolean,
    default: false,
  },
});

const formatDiscount = (value) => {
  const num = Number(value);
  if (!Number.isFinite(num)) return "0,00";
  return num.toFixed(2).replace(".", ",");
};

const calculateFinalPrice = () => {
  const price = getProductData()?.price || 0;
  const discount = props.discount || 0;
  return price * (1 - discount / 100);
};

const getProductData = () => {
  // Extrai dados do produto, considerando estrutura { product: {...} } ou direta
  return props.product?.product || props.product;
};
</script>

<template>
  <div
    class="product-list-item"
    :class="{ 'compact-mode': compact, 'has-quantity': quantity > 0 }"
  >
    <div v-if="!compact" class="product-photo-section">
      <img
        class="product-photo"
        v-if="getProductData().photo"
        :src="getProductData().photo"
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
    </div>

    <section
      class="product-info-section"
      :class="{ 'flex-1': !compact, 'w-full': compact }"
    >
      <div class="product-header">
        <p
          :class="[
            'products-and-services_badge dark:text-white flex-shrink-0',
            getProductData().recurrence,
          ]"
        >
          {{ getProductData().recurrence === "monthly" ? "Mensal" : "Único" }}
        </p>

        <p
          :title="getProductData().name"
          class="label-product-name"
          :class="quantity > 0 ? 'text-white dark:text-primary' : ''"
        >
          {{ getProductData().name }}
        </p>

        <span v-if="incorporated" class="incorporated-badge">+</span>
      </div>

      <span class="product-pricing">
        <div class="flex gap-1 items-center">
          <p
            class="text-xs font-semibold"
            :class="discount > 0 ? 'line-through opacity-60' : ''"
          >
            {{
              formatCurrency(getProductData().price, getProductData().currency)
            }}
          </p>

          <p v-if="discount > 0" class="discount-percentage">
            - {{ formatDiscount(discount) }}%
          </p>

          <p v-if="discount > 0" class="discounted-price">
            {{
              formatCurrency(calculateFinalPrice(), getProductData().currency)
            }}
          </p>
        </div>

        <p v-if="quantity > 0" class="price-line">
          - x {{ quantity }} =
          <a class="price-total">
            {{
              formatCurrency(
                calculateFinalPrice() * quantity,
                getProductData().currency,
              )
            }}
          </a>
        </p>
      </span>
    </section>
  </div>
</template>

<style scoped>
.product-list-item {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  width: 100%;
}

.product-list-item.compact-mode {
  flex-direction: column;
  align-items: flex-start;
  gap: 0.25rem;
}

.product-photo-section {
  flex-shrink: 0;
}

.product-photo {
  width: 2.25rem;
  height: 2.25rem;
  border-radius: 0.375rem;
  object-fit: cover;
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

.product-info-section {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  justify-content: space-between;
  min-width: 0;
}

.product-header {
  display: flex;
  align-items: center;
  gap: 0.375rem;
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

.products-and-services_badge {
  font-size: 0.625rem;
  line-height: 0.875rem;
  font-weight: 600;
  display: inline-flex;
  justify-content: center;
  align-items: center;
  border-radius: 0.375rem;
  padding: 0.125rem 0.375rem;
  height: fit-content;
  width: 3rem;
  transition: all 0.2s;
  text-transform: uppercase;
}

.products-and-services_badge.monthly {
  background-color: rgba(22, 163, 74, 0.2);
  color: #4ade80;
}

.products-and-services_badge.unique {
  background-color: rgba(54, 102, 240, 0.5);
  color: #93c5fd;
}

.dark .products-and-services_badge.monthly {
  background-color: rgba(22, 163, 74, 0.3);
  color: #16a34a;
}

.dark .products-and-services_badge.unique {
  background-color: rgba(54, 102, 240, 0.6);
  color: #1d4ed8;
}

.product-pricing {
  display: flex;
  gap: 0.25rem;
  align-items: center;
  flex-wrap: wrap;
}

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

.incorporated-badge {
  font-size: 0.6rem;
  font-weight: 700;
  color: rgb(74, 222, 128);
  background: rgba(34, 197, 94, 0.2);
  border-radius: 50%;
  width: 0.875rem;
  height: 0.875rem;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-left: auto;
}

.dark .incorporated-badge {
  background: rgba(34, 197, 94, 0.3);
  color: rgb(22, 163, 74);
}
</style>
