import { ref, computed, readonly } from "vue";

// --- Configuração injetável via setupWafProtection() ---
let _config = {
  integrationUrl: "",
  apiKey: "",
};

export function setupWafProtection({ integrationUrl, apiKey }) {
  _config = { ..._config, integrationUrl, apiKey };
}
// -------------------------------------------------------

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

// --- Estado singleton ---
let sdkLoaded = false;
let sdkLoadPromise = null;
// ------------------------

// --- Configuração do SDK ---
export function useWafProtection() {
  const attempts = ref(0);
  const wafToken = ref("");
  const isDelayActive = ref(false);
  const delayRemaining = ref(0);
  const captchaSolved = ref(false);
  const backendRequiresCaptcha = ref(false);
  const sdkReady = ref(sdkLoaded);

  let delayTimer = null;

  const requiredDelay = computed(() => {
    return DELAY_MAP[attempts.value] ?? MAX_DELAY;
  });

  const captchaRequired = computed(() => backendRequiresCaptcha.value);

  const isLoginBlocked = computed(
    () =>
      isDelayActive.value || (captchaRequired.value && !captchaSolved.value),
  );

  const wafEnabled = computed(() => !!_config.integrationUrl);

  // ---- Mount do SDK ----
  async function loadSdk() {
    if (sdkLoaded || !_config.integrationUrl) return;

    if (sdkLoadPromise) return sdkLoadPromise;

    sdkLoadPromise = new Promise((resolve) => {
      const script = document.createElement("script");
      script.type = "text/javascript";
      script.src = `${_config.integrationUrl}/jsapi.js`;
      script.defer = true;

      script.onload = () => {
        sdkLoaded = true;
        sdkReady.value = true;
        resolve();
      };

      script.onerror = () => {
        // console.error(
        //   "[WAF] Falha ao carregar jsapi.js — proteção WAF indisponível",
        // );
        sdkLoadPromise = null;
        resolve();
      };

      document.head.appendChild(script);
    });

    return sdkLoadPromise;
  }

  // ---- Resgate do token invisível ----
  async function getInvisibleToken() {
    if (!_config.integrationUrl) return "";

    await loadSdk();

    if (!window.AwsWafIntegration) return "";

    try {
      const token = await Promise.race([
        window.AwsWafIntegration.getToken(),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error("WAF getToken timeout")), 5000),
        ),
      ]);
      wafToken.value = token;
      return token;
    } catch (error) {
      console.warn("[WAF] Falha ao obter token invisível:", error);
      return "";
    }
  }

  // ---- Mount do componente de CAPTCHA ----
  function renderVisibleCaptcha(containerId) {
    return new Promise((resolve, reject) => {
      if (!window.AwsWafCaptcha) {
        // console.warn("[WAF] AwsWafCaptcha não disponível");
        captchaSolved.value = true;
        resolve("");
        return;
      }

      const container = document.getElementById(containerId);
      if (!container) {
        reject(new Error(`Container #${containerId} não encontrado`));
        return;
      }

      container.innerHTML = "";

      window.AwsWafCaptcha.renderCaptcha(container, {
        apiKey: _config.apiKey,
        onSuccess: (token) => {
          wafToken.value = token;
          captchaSolved.value = true;
          resolve(token);
        },
        onError: (error) => {
          // console.error("[WAF] Erro no CAPTCHA:", error);
          reject(error);
        },
        dynamicWidth: false,
        disableLanguageSelector: true,
        skipTitle: true,
      });
    });
  }

  // ---- Seta as tentativas de login ----
  function setAttempts(count, { requiresVisibleCaptcha = false } = {}) {
    attempts.value = count;
    captchaSolved.value = false;
    backendRequiresCaptcha.value = requiresVisibleCaptcha;

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
    wafToken: readonly(wafToken),
    isDelayActive: readonly(isDelayActive),
    delayRemaining: readonly(delayRemaining),
    captchaSolved: readonly(captchaSolved),
    sdkReady: readonly(sdkReady),

    // Computeds
    requiredDelay,
    captchaRequired,
    isLoginBlocked,
    wafEnabled,

    // Funções
    loadSdk,
    getInvisibleToken,
    renderVisibleCaptcha,
    setAttempts,
    resetOnSuccess,
    cleanup,
  };
}
