import { ref, computed, readonly } from "vue";
import { useAwsWafSdk } from "./recaptchaSdks/aws_waf_sdk.js";
import { useGoogleSdk } from "./recaptchaSdks/google_sdk.js";

// --- Registra o provedor que será utilizado no recaptcha ---
const sdkInitializers = {
  awswaf: (config) => useAwsWafSdk(config),
  "aws-waf": (config) => useAwsWafSdk(config),
  google: (config) => useGoogleSdk(config),
  "google-recaptcha": (config) => useGoogleSdk(config),
};

let _activeProvider = null;

export function setupSdkConfig({ provider, ...config }) {
  const normalizedProvider = String(provider || "")
    .trim()
    .toLowerCase();
  const initSdk = sdkInitializers[normalizedProvider];

  if (!initSdk) {
    console.error("Provedor de SDK não suportado:", provider);
    _activeProvider = null;
    return;
  }

  _activeProvider = initSdk(config);
}

export function getActiveProvider() {
  return _activeProvider;
}
// -----------------------------------------------------------

// --- Constantes ---
const DELAY_MAP = {
  1: 0,
  2: 0,
  3: 1000,
  4: 3000,
  5: 5000,
};
const MAX_DELAY = 5000;
// ------------------

// --- SDK do CAPTCHA ---
export function useCaptchaProtection() {
  const attempts = ref(0);
  const captchaToken = ref("");
  const isDelayActive = ref(false);
  const delayRemaining = ref(0);
  const captchaSolved = ref(false);
  const backendRequiresCaptcha = ref(false);
  const isUserBlocked = ref(false);
  const sdkReady = ref(false);

  let delayTimer = null;

  const requiredDelay = computed(() => {
    return DELAY_MAP[attempts.value] ?? MAX_DELAY;
  });

  const captchaEnabled = computed(() => !!_activeProvider && sdkReady.value);

  // ---- Mount do SDK ----
  async function loadSdk() {
    if (!_activeProvider) return;
    await _activeProvider.loadSdk();
    sdkReady.value = _activeProvider.isReady();
  }

  // ---- Resgate do token invisível ----
  async function getInvisibleToken() {
    if (!_activeProvider) return "";

    await loadSdk();

    try {
      const token = await _activeProvider.getInvisibleToken();
      sdkReady.value = _activeProvider.isReady() && !!token;
      captchaToken.value = token;
      return token;
    } catch (error) {
      sdkReady.value = false;
      console.warn("[Captcha] Falha ao obter token invisível:", error);
      return "";
    }
  }

  // ---- Render do CAPTCHA visível ----
  function renderVisibleCaptcha(containerId) {
    return new Promise(async (resolve, reject) => {
      if (!_activeProvider) {
        reject(new Error("Captcha provider não configurado"));
        return;
      }

      await loadSdk();
      if (!_activeProvider.isReady()) {
        reject(new Error("Captcha SDK não está pronto"));
        return;
      }

      _activeProvider.renderCaptcha(containerId, {
        onSuccess: (token) => {
          sdkReady.value = _activeProvider.isReady();

          if (!token) {
            reject(new Error("Captcha retornou token vazio"));
            return;
          }

          captchaToken.value = token;
          captchaSolved.value = true;
          resolve(token);
        },
        onError: (error) => {
          sdkReady.value = _activeProvider.isReady();
          reject(error);
        },
      });
    });
  }

  // ---- Seta as tentativas de login ----
  function setAttempts(
    count,
    { requiresVisibleCaptcha = false, userBlocked = false } = {},
  ) {
    attempts.value = count;
    captchaSolved.value = false;
    backendRequiresCaptcha.value = requiresVisibleCaptcha;
    isUserBlocked.value = userBlocked;

    const delay = requiredDelay.value;
    if (delay > 0) {
      startDelay(delay);
    }
  }

  // ---- Reseta as tentativas de login ----
  function resetOnSuccess() {
    attempts.value = 0;
    captchaSolved.value = false;
    backendRequiresCaptcha.value = false;
    isUserBlocked.value = false;
    isDelayActive.value = false;
    delayRemaining.value = 0;
    if (delayTimer) {
      clearInterval(delayTimer);
      delayTimer = null;
    }
  }

  // ---- Inicia o delay para travar o botão de login ----
  function startDelay(durationMs) {
    isDelayActive.value = true;
    delayRemaining.value = Math.ceil(durationMs / 1000);

    if (delayTimer) clearInterval(delayTimer);

    delayTimer = setInterval(() => {
      delayRemaining.value--;
      if (delayRemaining.value <= 0) {
        isDelayActive.value = false;
        if (delayTimer) {
          clearInterval(delayTimer);
          delayTimer = null;
        }
      }
    }, 1000);
  }

  // ---- Cleanup do timer ----
  function cleanup() {
    if (delayTimer) {
      clearInterval(delayTimer);
      delayTimer = null;
    }
  }

  return {
    // Estado
    attempts: readonly(attempts),
    captchaToken: readonly(captchaToken),
    isDelayActive: readonly(isDelayActive),
    delayRemaining: readonly(delayRemaining),
    captchaSolved: readonly(captchaSolved),
    sdkReady: readonly(sdkReady),
    isUserBlocked: readonly(isUserBlocked),

    // Computeds
    requiredDelay,
    captchaEnabled,

    // Funções
    loadSdk,
    getInvisibleToken,
    renderVisibleCaptcha,
    setAttempts,
    resetOnSuccess,
    cleanup,
  };
}
