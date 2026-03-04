<script setup>
/**
 * Wallet Card Component
 * Displays a single wallet relationship with attendant and department info.
 * Follows the same design pattern as contactCard in contactMerge.
 */
import { computed } from "vue";

const props = defineProps({
  wallet: {
    type: Object,
    required: true,
  },
  variant: {
    type: String,
    default: "default", // "default" | "primary"
  },
  showDate: {
    type: Boolean,
    default: true,
  },
});

const emit = defineEmits(["remove"]);

const attendantName = computed(
  () => props.wallet?.attendantName || "Atendente não informado",
);

const attendantPhoto = computed(() => props.wallet?.attendantPhoto || null);

const departmentName = computed(
  () => props.wallet?.departmentName || "Departamento não informado",
);

const updatedAt = computed(() => props.wallet?.updatedAt || null);

const avatarInitial = computed(() =>
  String(attendantName.value || "A")
    .trim()
    .charAt(0)
    .toUpperCase(),
);

const formatDate = (value) => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date);
};

const formattedDate = computed(() => formatDate(updatedAt.value));

const cardClasses = computed(() => {
  const classes = ["wallet-card", "bg-base-300"];
  if (props.variant === "primary") classes.push("wallet-card--primary");
  return classes;
});
</script>

<template>
  <article :class="cardClasses">
    <div class="wallet-card__main">
      <div class="wallet-card__avatar">
        <img
          v-if="attendantPhoto"
          :src="attendantPhoto"
          :alt="attendantName"
          class="wallet-card__photo"
          @error="(e) => (e.target.style.display = 'none')"
        />
        <span v-else class="wallet-card__initials">{{ avatarInitial }}</span>
      </div>

      <div class="wallet-card__info">
        <p class="wallet-card__name">{{ attendantName }}</p>
        <p class="wallet-card__department">{{ departmentName }}</p>
      </div>
    </div>

    <div class="wallet-card__meta">
      <span class="wallet-card__chip">Carteira</span>
      <p v-if="showDate && formattedDate" class="wallet-card__date">
        {{ formattedDate }}
      </p>
    </div>
  </article>
</template>

<style scoped>
.wallet-card {
  border-radius: 0.6rem;
  border: 1px solid rgb(148 163 184 / 0.2);
  padding: 0.75rem;
  display: flex;
  justify-content: space-between;
  gap: 0.75rem;
  align-items: center;
  transition: all 150ms ease;
}

.wallet-card:hover {
  border-color: rgb(148 163 184 / 0.35);
}

.wallet-card--primary {
  border-color: rgb(14 116 144 / 0.4);
  background: linear-gradient(
    135deg,
    rgb(14 116 144 / 0.1),
    rgb(8 145 178 / 0.05)
  );
}

.wallet-card__main {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  min-width: 0;
}

.wallet-card__avatar {
  width: 2.25rem;
  height: 2.25rem;
  border-radius: 9999px;
  flex-shrink: 0;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, rgb(8 145 178), rgb(14 116 144));
}

.wallet-card__photo {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.wallet-card__initials {
  color: rgb(255 255 255);
  font-size: 0.8rem;
  font-weight: 700;
}

.wallet-card__info {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
}

.wallet-card__name {
  font-size: 0.8125rem;
  line-height: 1.2;
  font-weight: 600;
  color: rgb(226 232 240);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.wallet-card__department {
  font-size: 0.75rem;
  line-height: 1;
  color: rgb(148 163 184);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.wallet-card__meta {
  text-align: right;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.25rem;
}

.wallet-card__chip {
  display: inline-flex;
  align-items: center;
  border-radius: 9999px;
  border: 1px solid rgb(45 212 191 / 0.35);
  background: rgb(20 184 166 / 0.13);
  color: rgb(153 246 228);
  font-size: 0.625rem;
  line-height: 0.875rem;
  font-weight: 700;
  padding: 0.15rem 0.5rem;
}

.wallet-card__date {
  font-size: 0.6875rem;
  line-height: 1;
  color: rgb(148 163 184);
}
</style>
