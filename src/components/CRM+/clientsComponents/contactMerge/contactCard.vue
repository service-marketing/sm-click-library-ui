<script setup>
import { computed } from "vue";
import InstagramBadge from "../instagramBadge.vue";

const props = defineProps({
  contact: {
    type: Object,
    required: true,
  },
  mode: {
    type: String,
    default: "merge", // "merge" | "sidebar"
  },
  viewNumberPermission: {
    type: Boolean,
    default: false,
  },
  blockedTooltipText: {
    type: String,
    default: "Contato bloqueado - nao e possivel iniciar atendimento",
  },
  variant: {
    type: String,
    default: "default", // "default" | "primary" | "danger" | "selected"
  },
  size: {
    type: String,
    default: "normal", // "normal" | "large"
  },
  showBadge: {
    type: Boolean,
    default: false,
  },
  badgeText: {
    type: String,
    default: "",
  },
  selectable: {
    type: Boolean,
    default: false,
  },
  selected: {
    type: Boolean,
    default: false,
  },
  showDetails: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["select"]);

const normalizeDigits = (value) =>
  (value ?? "").toString().trim().replace(/\D/g, "");

const normalizeText = (value) => (value ?? "").toString().trim();

const formatPhoneNumber = (phone) => {
  const digits = normalizeDigits(phone);
  if (!digits) return "";

  if (digits.length === 11) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  }
  if (digits.length === 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }
  if (digits.length === 13 && digits.startsWith("55")) {
    return `+55 (${digits.slice(2, 4)}) ${digits.slice(4, 9)}-${digits.slice(9)}`;
  }
  return phone;
};

const getInitials = (name) => {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};

const isSidebarMode = computed(() => props.mode === "sidebar");
const isBlocked = computed(() => Boolean(props.contact?.blocked));
const hasPhoto = computed(() => Boolean(props.contact?.photo));
const hasPhone = computed(() => Boolean(props.contact?.telephone));
const hasInstagram = computed(() =>
  Boolean(props.contact?.instagram_user_name),
);
const hasTags = computed(() => props.contact?.tags?.length > 0);
const hasProducts = computed(
  () =>
    Array.isArray(props.contact?.products) && props.contact.products.length > 0,
);
const hasRating = computed(
  () =>
    props.contact?.rating !== null &&
    props.contact?.rating !== undefined &&
    props.contact?.rating !== "",
);

const initials = computed(() => getInitials(props.contact?.name));
const formattedPhone = computed(() =>
  formatPhoneNumber(props.contact?.telephone),
);

const sidebarDisplayName = computed(() => {
  const name = normalizeText(props.contact?.name);
  if (name) return name;

  const phone = normalizeText(props.contact?.telephone);
  if (props.viewNumberPermission && phone) return phone;

  return "Não disponível";
});

const displayName = computed(() => {
  if (isSidebarMode.value) return sidebarDisplayName.value;
  return props.contact?.name || "Sem nome";
});

const showSecondaryPhone = computed(() => {
  const name = normalizeText(props.contact?.name);
  const phone = normalizeText(props.contact?.telephone);
  return (
    isSidebarMode.value &&
    props.viewNumberPermission &&
    Boolean(name) &&
    Boolean(phone)
  );
});

const rootTag = computed(() => {
  if (!isSidebarMode.value && props.selectable) return "button";
  return "div";
});

const mergeCardClasses = computed(() => {
  const classes = ["merge-card", "bg-base-300"];

  if (props.selectable) classes.push("merge-card--selectable");
  if (props.selected) classes.push("merge-card--selected");
  if (props.variant === "primary") classes.push("merge-card--primary");
  if (props.variant === "danger") classes.push("merge-card--danger");

  return classes;
});

const sidebarCardClasses = computed(() => {
  const classes = [
    "group relative flex items-center gap-3 p-3 text-xs transition-all xl:text-sm",
  ];

  if (isBlocked.value) {
    classes.push("cursor-not-allowed opacity-60");
  } else {
    classes.push(
      "cursor-pointer hover:bg-base-100/50 dark:hover:bg-sky-300/20",
    );
  }

  return classes;
});

const rootClasses = computed(() => {
  if (isSidebarMode.value) return sidebarCardClasses.value;
  return mergeCardClasses.value;
});

const rootTitle = computed(() => {
  if (isSidebarMode.value && isBlocked.value) return props.blockedTooltipText;
  return undefined;
});

const avatarClasses = computed(() => {
  if (isSidebarMode.value)
    return "size-12 overflow-hidden rounded-full bg-slate-500/20";

  const classes = ["merge-card__avatar"];

  if (props.size === "large") classes.push("merge-card__avatar--lg");

  if (props.selected) {
    classes.push("merge-card__avatar--selected");
  } else if (props.variant === "primary") {
    classes.push("merge-card__avatar--primary");
  } else if (props.variant === "danger") {
    classes.push("merge-card__avatar--danger");
  }

  return classes;
});

const infoClasses = computed(() => {
  if (isSidebarMode.value) return "flex min-w-0 flex-1 flex-col gap-1";
  return "merge-card__info";
});

const avatarFallbackClasses = computed(() => {
  if (isSidebarMode.value) {
    return "flex h-full w-full items-center justify-center text-sm font-semibold text-slate-300 dark:text-gray-600";
  }
  return "merge-card__initials";
});

const avatarImageClasses = computed(() => {
  if (isSidebarMode.value) return "h-full w-full object-cover";
  return "merge-card__photo";
});

const onRootClick = () => {
  if (!isSidebarMode.value && props.selectable) {
    emit("select", props.contact);
  }
};
</script>

<template>
  <component
    :is="rootTag"
    :class="rootClasses"
    :title="rootTitle"
    @click="onRootClick"
  >
    <div class="relative shrink-0">
      <div :class="avatarClasses">
        <img
          v-if="hasPhoto"
          :src="contact.photo"
          :alt="contact.name"
          :class="avatarImageClasses"
          @error="(e) => (e.target.style.display = 'none')"
        />
        <span v-else :class="avatarFallbackClasses">{{ initials }}</span>
      </div>

      <span
        v-if="isSidebarMode && contact.outcome"
        class="absolute -bottom-1 -right-0.5 z-10 rounded-full bg-base-200 p-1"
      >
        <svg
          v-if="contact.outcome === 'won'"
          class="size-4 text-green-600"
          viewBox="0 0 20 20"
          fill="none"
        >
          <path
            d="M3.16666 6.37502C3.74962 6.37502 4.2222 6.85073 4.22222 7.43752V15.9375C4.22222 16.5243 3.74963 17 3.16666 17H1.05555C0.472588 17 0 16.5243 0 15.9375V7.43752C1.50967e-05 6.85073 0.472597 6.37502 1.05555 6.37502H3.16666Z"
            fill="currentColor"
          />
          <path
            d="M9.48143 1.4454C9.79496 -0.637173 11.5194 0.143216 11.5194 0.143216C13.863 1.75728 13.005 4.80783 12.2832 6.13118H17.4424C19.5307 6.65187 19.0768 8.34354 18.5887 9.12465C19.5056 10.7905 18.4191 11.7716 17.7609 12.0538C18.1175 13.7717 17.0601 14.4178 16.4869 14.5264C16.8944 16.4004 15.5533 16.9564 14.8314 17H10.436C8.49997 16.9999 6.19055 16.1753 5.27777 15.7632V7.368C9.03523 5.6108 9.09933 3.98356 9.48143 1.4454Z"
            fill="currentColor"
          />
        </svg>

        <svg
          v-else-if="contact.outcome === 'lost'"
          class="size-4 text-red-600"
          viewBox="0 0 20 15"
          fill="none"
        >
          <path
            d="M15.8333 10.625C15.2504 10.625 14.7778 10.1493 14.7778 9.56249L14.7778 1.0625C14.7778 0.475698 15.2504 1.57955e-06 15.8333 1.63051e-06L17.9444 1.81507e-06C18.5274 1.86603e-06 19 0.475698 19 1.0625L19 9.56249C19 10.1493 18.5274 10.625 17.9444 10.625L15.8333 10.625Z"
            fill="currentColor"
          />
          <path
            d="M9.51857 15.5546C9.20504 17.6372 7.48065 16.8568 7.48065 16.8568C5.13698 15.2427 5.99503 12.1922 6.71681 10.8688L1.55759 10.8688C-0.530671 10.3481 -0.0768444 8.65646 0.411319 7.87535C-0.50562 6.20951 0.580926 5.22844 1.23906 4.94622C0.882549 3.22832 1.93994 2.5822 2.51315 2.47363C2.10564 0.59965 3.44673 0.0436064 4.16864 6.1075e-07L8.56403 9.95007e-07C10.5 0.000138493 12.8095 0.824657 13.7222 1.23682L13.7222 9.632C9.96477 11.3892 9.90067 13.0164 9.51857 15.5546Z"
            fill="currentColor"
          />
        </svg>
      </span>

      <div
        v-if="isSidebarMode && isBlocked"
        class="absolute right-0 top-0 z-10 translate-x-1/4 -translate-y-1/4"
      >
        <div
          class="flex size-5 items-center justify-center rounded-md border border-red-600 bg-red-500/90 backdrop-blur-sm"
        >
          <svg
            class="size-3"
            xmlns="http://www.w3.org/2000/svg"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              fill-rule="evenodd"
              d="M8 10V7a4 4 0 1 1 8 0v3h1a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h1Zm2-3a2 2 0 1 1 4 0v3h-4V7Zm2 6a1 1 0 0 1 1 1v3a1 1 0 1 1-2 0v-3a1 1 0 0 1 1-1Z"
              clip-rule="evenodd"
            />
          </svg>
        </div>
      </div>
    </div>

    <div :class="infoClasses">
      <span
        v-if="isSidebarMode"
        class="truncate text-sm font-medium xl:text-base"
      >
        {{ displayName }}
      </span>
      <p v-else class="merge-card__name">{{ displayName }}</p>

      <!-- <template v-if="isSidebarMode">
        <div class="flex items-center gap-2">
          <span v-if="contact.description" class="truncate opacity-50">
            {{ contact.description }}
          </span>
          <span v-if="showSecondaryPhone" class="opacity-50">
            {{ contact.telephone }}
          </span>
        </div>
      </template> -->
      <!-- 
      <template v-else> -->
      <div v-if="hasPhone || hasInstagram" class="contact-inline-meta">
        <span v-if="hasPhone" class="contact-phone rt-transition">
          <span
            v-if="contact?.country && contact?.telephone"
            :class="` fi fi-${contact.country.toLowerCase()}`"
            class="text-xs size-[10px]"
          ></span>
          {{ formattedPhone }}
        </span>
        <InstagramBadge
          v-if="hasInstagram"
          :instagram-user-name="contact.instagram_user_name"
        />
      </div>

      <!-- <p
          v-if="showDetails && hasInstagram"
          class="merge-card__detail merge-card__detail--instagram"
        >
          <svg class="merge-card__icon" viewBox="0 0 24 24" fill="currentColor">
            <path
              d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"
            />
          </svg>
          @{{ contact.instagram_user_name }}
        </p> -->

      <!-- <div v-if="showDetails && hasTags" class="merge-card__tags">
          <span
            v-for="tag in contact.tags.slice(0, 3)"
            :key="tag.id"
            class="merge-card__tag"
            :style="{ backgroundColor: tag.color + '20', color: tag.color }"
          >
            {{ tag.name }}
          </span>
          <span
            v-if="contact.tags.length > 3"
            class="merge-card__tag merge-card__tag--more"
          >
            +{{ contact.tags.length - 3 }}
          </span>
        </div> -->
      <!-- </template> -->
    </div>

    <div
      v-if="isSidebarMode"
      class="flex shrink-0 flex-col items-center gap-2 text-xs xl:text-sm"
    >
      <div
        v-if="hasProducts"
        class="flex items-center gap-1 opacity-80"
        title="Quantidade de produtos vinculados"
      >
        <svg
          class="size-4 dark:text-primary_alt"
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <path
            fill="currentColor"
            d="M4 19v2c0 .5523.44772 1 1 1h14c.5523 0 1-.4477 1-1v-2H4Z"
          />
          <path
            fill="currentColor"
            fill-rule="evenodd"
            d="M9 3c0-.55228.44772-1 1-1h8c.5523 0 1 .44772 1 1v3c0 .55228-.4477 1-1 1h-2v1h2c.5096 0 .9376.38314.9939.88957L19.8951 17H4.10498l.90116-8.11043C5.06241 8.38314 5.49047 8 6.00002 8H12V7h-2c-.55228 0-1-.44772-1-1V3Z"
            clip-rule="evenodd"
          />
        </svg>
        <span class="font-semibold">
          {{ contact.products.length }}
        </span>
      </div>

      <div
        v-if="hasRating"
        class="flex items-center gap-1 opacity-80"
        title="Nota do contato"
      >
        <svg style="fill: #facc15" class="size-4" viewBox="0 0 20 20">
          <path
            d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"
          />
        </svg>
        <span class="font-semibold">
          {{ contact.rating }}
        </span>
      </div>
    </div>

    <div
      v-if="!isSidebarMode && showBadge && badgeText"
      class="merge-card__badge"
      :class="[`merge-card__badge--${variant}`]"
    >
      {{ badgeText }}
    </div>

    <div
      v-if="!isSidebarMode && selectable && selected"
      class="merge-card__check"
    >
      <svg class="size-5" fill="currentColor" viewBox="0 0 20 20">
        <path
          fill-rule="evenodd"
          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
          clip-rule="evenodd"
        />
      </svg>
    </div>
  </component>
</template>

<style scoped>
.merge-card {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.675rem 0.875rem;
  border-radius: 0.5rem;
  transition: all 0.15s ease;
  position: relative;
  width: 100%;
  text-align: left;
}

.merge-card--selectable {
  cursor: pointer;
}

.merge-card--selectable:hover {
  transform: translateY(-1px);
  @apply bg-base-100/50 dark:bg-sky-500/15;
}

.merge-card--selected {
  @apply bg-base-100/70 dark:bg-slate-300 border-green-500;
}

.merge-card--primary {
  border-color: rgba(34, 197, 94, 0.4);
}

.merge-card--danger {
  border-color: rgba(220, 38, 38, 0.4);
}

.merge-card__avatar {
  width: 2.75rem;
  height: 2.75rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(
    135deg,
    rgba(148, 163, 184, 0.15),
    rgba(148, 163, 184, 0.1)
  );
  font-weight: 600;
  font-size: 0.875rem;
  flex-shrink: 0;
  overflow: hidden;
  @apply text-opacity-60;
}

.merge-card__avatar--lg {
  width: 4rem;
  height: 4rem;
  font-size: 1.25rem;
}

.merge-card__avatar--primary {
  background: linear-gradient(
    135deg,
    rgba(34, 197, 94, 0.2),
    rgba(22, 163, 74, 0.15)
  );
  color: rgb(34, 197, 94);
}

.merge-card__avatar--danger {
  background: linear-gradient(
    135deg,
    rgba(220, 38, 38, 0.2),
    rgba(185, 28, 28, 0.15)
  );
  color: rgb(248, 113, 113);
}

.merge-card__avatar--selected {
  background: linear-gradient(
    135deg,
    rgba(14, 116, 144, 0.2),
    rgba(8, 145, 178, 0.15)
  );
  /* color: rgb(34, 211, 238); */
}

.merge-card__photo {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.merge-card__initials {
  line-height: 1;
}

.merge-card__info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.merge-card__name {
  font-weight: 600;
  font-size: 0.9375rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.merge-card__detail {
  font-size: 0.8125rem;
  opacity: 0.7;
  display: flex;
  align-items: center;
  gap: 0.375rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.merge-card__icon {
  width: 0.875rem;
  height: 0.875rem;
  flex-shrink: 0;
  opacity: 0.7;
}

.merge-card__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
  margin-top: 0.25rem;
}

.merge-card__tag {
  font-size: 0.6875rem;
  padding: 0.125rem 0.375rem;
  border-radius: 0.25rem;
  font-weight: 500;
}

.merge-card__tag--more {
  background: rgba(148, 163, 184, 0.15);
  color: rgb(148, 163, 184);
}

.merge-card__badge {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  font-size: 0.6875rem;
  font-weight: 600;
  padding: 0.125rem 0.5rem;
  border-radius: 0.25rem;
  text-transform: uppercase;
  letter-spacing: 0.02em;
}

.merge-card__badge--primary {
  background: rgba(34, 197, 94, 0.15);
  color: rgb(34, 197, 94);
}

.merge-card__badge--danger {
  background: rgba(220, 38, 38, 0.15);
  color: rgb(248, 113, 113);
}

.merge-card__badge--default {
  background: rgba(148, 163, 184, 0.15);
  color: rgb(148, 163, 184);
}

.merge-card__check {
  width: 1.5rem;
  height: 1.5rem;
  border-radius: 50%;
  background: linear-gradient(135deg, rgb(14, 116, 144), rgb(8, 145, 178));
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.merge-card__check svg {
  width: 1rem;
  height: 1rem;
}

.contact-phone {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.65rem;
  opacity: 0.6;
  font-weight: 500;
  border-radius: 0.25rem;
  flex-shrink: 0;
}

.contact-inline-meta {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  width: 100%;
  min-width: 0;
}

.ig-tooltip-card {
  padding: 0.35rem;
  border-radius: 0.75rem;
  backdrop-filter: blur(10px);
}

.ig-tooltip-head {
  display: flex;
  align-items: center;
  gap: 0.55rem;
}

.ig-tooltip-logo {
  width: 1rem;
  height: 1rem;
  flex-shrink: 0;
}

.ig-tooltip-head-text {
  min-width: 0;
}

.ig-tooltip-title {
  font-size: 0.72rem;
  font-weight: 700;
  line-height: 1.2;
  color: rgba(255, 255, 255, 0.95);
}

.ig-tooltip-handle {
  margin-top: 0.08rem;
  font-size: 0.7rem;
  font-weight: 500;
  line-height: 1.2;
  color: rgba(255, 255, 255, 0.9);
}

.ig-tooltip-divider {
  height: 1px;
  margin: 0.5rem 0 0.45rem;
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0.03),
    rgba(255, 255, 255, 0.14),
    rgba(255, 255, 255, 0.03)
  );
}

.ig-tooltip-description {
  font-size: 0.68rem;
  line-height: 1.35;
  color: rgba(255, 255, 255, 0.74);
}

.ig-tooltip-link {
  margin-top: 0.35rem;
  font-size: 0.67rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.6);
}
</style>
