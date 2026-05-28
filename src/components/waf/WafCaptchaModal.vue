<template>
  <div v-if="isGoogleProvider && modelValue">
    <div
      ref="captchaContainerRef"
      :id="containerId"
      class="waf-captcha-body"
      :class="{ 'waf-hidden': loading }"
    />
  </div>

  <Teleport v-else to="body">
    <Transition name="waf-fade">
      <div @click="closeBlocked" v-if="modelValue" class="waf-overlay">
        <div class="waf-modal">
          <!-- Loading -->
          <div v-if="loading && !isBlocked" class="waf-loading">
            <svg class="waf-spinner" viewBox="0 0 24 24" fill="none">
              <circle
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                stroke-width="3"
                stroke-linecap="round"
                stroke-dasharray="31.4 31.4"
              />
            </svg>
            <span class="waf-loading-text">Carregando verificação…</span>
          </div>

          <!-- Título -->
          <span class="flex flex-col items-center py-3 text-black">
            <p class="text-lg font-semibold">
              Muitas tentativas de login simultâneas
            </p>
            <p class="text-sm">
              Por favor, complete a verificação para continuar
            </p>
          </span>

          <!-- Label de bloqueio -->
          <p v-if="isBlocked" class="text-sm text-red-500 text-center">
            <Vue3Lottie
              :animation-data="error_animate"
              :height="180"
              :width="180"
              :auto-play="true"
              :loop="true"
            />

            Sua conta está temporariamente bloqueada devido a muitas tentativas
            de login.
          </p>

          <!-- componente CAPTCHA -->
          <div
            v-else
            ref="captchaContainerRef"
            :id="containerId"
            class="waf-captcha-body"
            :class="{ 'waf-hidden': loading }"
          />
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, watch, nextTick, onBeforeUnmount, computed } from "vue";
import { getActiveProvider } from "../../composables/recaptcha/useRecaptcha";
import error_animate from "../../assets/lottieAnimates/error.json";

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  renderCaptcha: { type: Function, required: true },
  isBlocked: { type: Boolean, default: false },
  anchorEl: { type: Object, default: null },
});

const emit = defineEmits(["update:modelValue", "solved", "error"]);

const isGoogleProvider = computed(
  () => getActiveProvider()?.name === "google-recaptcha"
);

const containerId = `waf-captcha-${Math.random().toString(36).slice(2, 9)}`;
const captchaContainerRef = ref(null);
const loading = ref(true);
const hasError = ref(false);
const modalPosition = ref({});

let observer = null;

const closeBlocked = () => {
  if (!props.isBlocked) return;
  emit("update:modelValue", false);
};

function calcPosition() {
  if (!props.anchorEl) return;

  const el =
    props.anchorEl instanceof HTMLElement
      ? props.anchorEl
      : props.anchorEl?.$el ?? props.anchorEl?.value;

  if (!el || !el.getBoundingClientRect) return;

  const rect = el.getBoundingClientRect();
  const modalWidth = 200;
  let left = rect.left + rect.width / 2 - modalWidth / 2;
  left = Math.max(8, Math.min(left, window.innerWidth - modalWidth - 8));

  const spaceAbove = rect.top;
  const spaceBelow = window.innerHeight - rect.bottom;

  if (spaceAbove > spaceBelow) {
    modalPosition.value = {
      position: "fixed",
      left: `${left}px`,
      bottom: `${window.innerHeight - rect.top + 8}px`,
      width: `${modalWidth}px`,
    };
  } else {
    modalPosition.value = {
      position: "fixed",
      left: `${left}px`,
      top: `${rect.bottom + 8}px`,
      width: `${modalWidth}px`,
    };
  }
}

async function renderChallenge() {
  loading.value = true;
  hasError.value = false;

  await nextTick();

  const container = document.getElementById(containerId);
  if (container) container.innerHTML = "";

  try {
    await props.renderCaptcha(containerId);
    loading.value = false;
    emit("solved");
  } catch (err) {
    loading.value = false;
    hasError.value = true;
    emit("error", err);
  }
}

function observeContainer() {
  if (observer) observer.disconnect();

  const container = document.getElementById(containerId);
  if (!container) return;

  observer = new MutationObserver(() => {
    if (container.children.length > 0 && loading.value) {
      loading.value = false;
    }
  });

  observer.observe(container, { childList: true, subtree: true });
}

watch(
  () => props.modelValue,
  async (open) => {
    if (open) {
      calcPosition();
      await nextTick();
      observeContainer();
      await renderChallenge();
    } else {
      loading.value = true;
      hasError.value = false;
      if (observer) observer.disconnect();
    }
  }
);

onBeforeUnmount(() => {
  if (observer) observer.disconnect();
});
</script>

<style scoped>
.waf-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.35);
  backdrop-filter: blur(2px);
}

.waf-modal {
  z-index: 10000;
  min-width: 280px;
  max-width: 400px;
  border-radius: 12px;
  padding: 12px;
  background: #ffffff;
  border: 1px solid #374151;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.45),
    0 0 0 1px rgba(255, 255, 255, 0.05);
}

.waf-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 24px 0;
}

.waf-spinner {
  width: 32px;
  height: 32px;
  color: #22c55e;
  animation: waf-spin 0.8s linear infinite;
}

@keyframes waf-spin {
  to {
    transform: rotate(360deg);
  }
}

.waf-loading-text {
  font-size: 0.85rem;
  color: #a1a1aa;
}

.waf-captcha-body {
  display: flex;
  justify-content: center;
  border-radius: 8px;
  overflow: hidden;
}

.waf-hidden {
  width: 0;
  height: 0;
  overflow: hidden;
  position: absolute;
  opacity: 0;
  pointer-events: none;
}

/* Transition */
.waf-fade-enter-active,
.waf-fade-leave-active {
  transition: opacity 0.2s ease;
}
.waf-fade-enter-from,
.waf-fade-leave-to {
  opacity: 0;
}
</style>
