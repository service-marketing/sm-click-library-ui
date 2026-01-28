<script setup>
const props = defineProps({
  item: {
    type: Object,
    required: true,
  },
  getProductId: {
    type: Function,
    required: true,
  },
});

const calculateFinalPrice = () => {
  return props.item.product.price * (1 - props.item.discount / 100);
};

const calculateSubtotal = () => {
  return calculateFinalPrice() * props.item.quantity;
};

const formatDiscount = (value) => {
  const num = Number(value);
  if (!Number.isFinite(num)) return "0";
  // Remove zeros desnecessários à direita após o ponto decimal
  return num % 1 === 0
    ? String(Math.floor(num))
    : num.toFixed(2).replace(/\.?0+$/, "");
};
</script>

<template>
  <li class="discount-product-card">
    <div class="discount-product-image">
      <img
        v-if="item.product.photo"
        :src="item.product.photo"
        class="product-img"
      />
      <div v-else class="product-img-placeholder">
        <svg
          class="size-3"
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
    <div class="discount-product-info">
      <div class="discount-product-header">
        <span class="discount-product-name">{{ item.product.name }}</span>
        <span class="discount-badge-mini"
          >-{{ formatDiscount(item.discount) }}%</span
        >
      </div>
      <div class="discount-product-row">
        <div class="discount-product-prices">
          <span class="original-price">{{
            item.product.price.toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL",
            })
          }}</span>
          <span class="final-price">{{
            calculateFinalPrice().toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL",
            })
          }}</span>
        </div>
        <div class="discount-product-quantity">
          <span class="qty-label">{{ item.quantity }}x</span>
          <span class="subtotal">{{
            calculateSubtotal().toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL",
            })
          }}</span>
        </div>
      </div>
    </div>
  </li>
</template>

<style scoped>
.discount-product-card {
  display: flex;
  gap: 0.5rem;
  padding: 0.375rem;
  border-radius: 0.375rem;
  background-color: #374151;
  transition: background-color 0.2s ease;
  align-items: center;
}

.discount-product-card:hover {
  background-color: #4b5563;
}

.discount-product-image {
  flex-shrink: 0;
}

.product-img {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 0.25rem;
  object-fit: cover;
}

.product-img-placeholder {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #1f2937;
  border: 1px solid #4b5563;
  color: #9ca3af;
}

.discount-product-info {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  flex: 1;
  min-width: 0;
}

.discount-product-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  justify-content: space-between;
}

.discount-product-name {
  font-size: 0.75rem;
  font-weight: 600;
  color: #e5e7eb;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
}

.discount-product-prices {
  display: flex;
  flex-direction: column;
  gap: 0.05rem;
  flex: 1;
  align-items: flex-start;
}

.discount-product-row {
  display: flex;
  gap: 1.5rem;
  align-items: center;
  width: 100%;
  justify-content: space-between;
}

.original-price {
  font-size: 0.6rem;
  color: #9ca3af;
  text-decoration: line-through;
}

.discount-badge-mini {
  font-size: 0.55rem;
  font-weight: 700;
  color: #f97316;
  background-color: rgba(249, 115, 22, 0.2);
  padding: 0.15rem 0.35rem;
  border-radius: 0.25rem;
  flex-shrink: 0;
}

.final-price {
  font-size: 0.75rem;
  font-weight: 700;
  color: #34d399;
}

.discount-product-quantity {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  font-size: 0.625rem;
  color: #d1d5db;
  gap: 0.05rem;
  white-space: nowrap;
}

.qty-label {
  font-weight: 600;
  color: #9ca3af;
  font-size: 0.625rem;
}

.discount-product-quantity .subtotal {
  font-weight: 700;
  color: #34d399;
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
</style>
