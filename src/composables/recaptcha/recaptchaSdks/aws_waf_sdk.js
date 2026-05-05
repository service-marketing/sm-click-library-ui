// providers/awsWafProvider.js
let sdkLoaded = false;
let sdkLoadPromise = null;

export function useAwsWafSdk({ integrationUrl, apiKey }) {
  console.log("Iniciando integração com AWS WAF SDK");
  return {
    name: "aws-waf",

    async loadSdk() {
      if (sdkLoaded || !integrationUrl) return;
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
          sdkLoadPromise = null;
          resolve();
        };
        document.head.appendChild(script);
      });
      return sdkLoadPromise;
    },

    async getInvisibleToken() {
      if (!window.AwsWafIntegration) return "";
      return Promise.race([
        window.AwsWafIntegration.getToken(),
        new Promise((_, rej) =>
          setTimeout(() => rej(new Error("timeout")), 5000),
        ),
      ]).catch(() => "");
    },

    renderCaptcha(containerId, { onSuccess, onError }) {
      const container = document.getElementById(containerId);
      if (!container || !window.AwsWafCaptcha) {
        onSuccess("");
        return;
      }
      container.innerHTML = "";
      window.AwsWafCaptcha.renderCaptcha(container, {
        apiKey,
        onSuccess,
        onError,
        dynamicWidth: false,
        disableLanguageSelector: true,
        skipTitle: true,
      });
    },

    isReady: () => sdkLoaded,
  };
}
