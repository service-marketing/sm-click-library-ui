// providers/awsWafProvider.js
let sdkLoaded = false;
let sdkLoadPromise = null;
let sdkFailed = false;

const TOKEN_TIMEOUT_MS = 5000;

function timeoutAfter(ms) {
  return new Promise((_, rej) =>
    setTimeout(() => rej(new Error("timeout")), ms),
  );
}

function invalidateSdk(reason) {
  sdkLoaded = false;
  sdkFailed = true;

  if (reason) {
    console.warn("AWS WAF SDK indisponivel:", reason);
  }
}

async function requestToken() {
  try {
    const newToken = await Promise.race([
      window.AwsWafIntegration.getToken(),
      timeoutAfter(TOKEN_TIMEOUT_MS),
    ]);
    return newToken || "";
  } catch {
    return "";
  }
}

export function useAwsWafSdk({ integrationUrl, apiKey }) {
  console.log("Iniciando integração com AWS WAF SDK");
  return {
    name: "aws-waf",

    async loadSdk() {
      if (sdkFailed || sdkLoaded || !integrationUrl) return;
      if (sdkLoadPromise) return sdkLoadPromise;

      sdkLoadPromise = new Promise((resolve) => {
        const script = document.createElement("script");
        script.src = `${integrationUrl}/jsapi.js`;
        script.defer = true;
        script.onload = () => {
          console.log("AWS WAF SDK carregado com sucesso");
          sdkLoaded = true;
          resolve();
        };
        script.onerror = (err) => {
          console.log("Erro ao carregar AWS WAF SDK:", err);
          invalidateSdk(err);
          resolve();
        };
        document.head.appendChild(script);
      });
      return sdkLoadPromise;
    },

    async getInvisibleToken() {
      if (sdkFailed) return "";

      if (typeof window.AwsWafIntegration?.getToken !== "function") {
        return "";
      }

      return await requestToken();
    },

    renderCaptcha(containerId, { onSuccess, onError }) {
      if (sdkFailed) {
        onError(new Error("AWS WAF SDK indisponível (bloqueado pelo navegador)"));
        return;
      }

      const container = document.getElementById(containerId);
      if (
        !container ||
        typeof window.AwsWafCaptcha?.renderCaptcha !== "function"
      ) {
        invalidateSdk("AWS WAF captcha indisponivel para renderizacao");
        onError(new Error("AWS WAF captcha indisponível para renderização"));
        return;
      }

      container.innerHTML = "";

      try {
        window.AwsWafCaptcha.renderCaptcha(container, {
          apiKey,
          onSuccess: (...args) => {
            onSuccess(...args);
          },
          onError: (error) => {
            invalidateSdk(error);
            onError(error);
          },
          dynamicWidth: false,
          disableLanguageSelector: true,
          skipTitle: true,
        });
      } catch (error) {
        invalidateSdk(error);
        onError(error);
      }
    },

    isReady: () => sdkLoaded && !sdkFailed,
  };
}
