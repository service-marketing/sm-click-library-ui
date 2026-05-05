let sdkLoaded = false;
let sdkLoadPromise = null;
let invisibleWidgetId = null;

export function useGoogleSdk({ siteKey, siteKeyVisible } = {}) {
  console.log("Iniciando integração com Google reCAPTCHA SDK");

  const getRecaptcha = () => window.grecaptcha?.enterprise;

  return {
    name: "google-recaptcha",

    async loadSdk() {
      if (sdkLoaded || !siteKey) return;
      if (sdkLoadPromise) return sdkLoadPromise;

      sdkLoadPromise = new Promise((resolve) => {
        const script = document.createElement("script");
        script.src = `https://www.google.com/recaptcha/enterprise.js?render=explicit`;
        script.defer = true;
        script.onload = () => {
          window.grecaptcha.enterprise.ready(() => {
            // Renderiza um widget invisível para a chave score-based
            const invisibleDiv = document.createElement("div");
            invisibleDiv.id = "__recaptcha_invisible";
            invisibleDiv.style.display = "none";
            document.body.appendChild(invisibleDiv);

            invisibleWidgetId = window.grecaptcha.enterprise.render(
              invisibleDiv,
              {
                sitekey: siteKey,
                size: "invisible",
              }
            );

            console.log("Google reCAPTCHA SDK carregado com sucesso");
            sdkLoaded = true;
            resolve();
          });
        };
        script.onerror = (err) => {
          console.log("Erro ao carregar o Google reCAPTCHA SDK:", err);
          sdkLoadPromise = null;
          resolve();
        };
        document.head.appendChild(script);
      });
      return sdkLoadPromise;
    },

    async getInvisibleToken() {
      const recaptcha = getRecaptcha();
      if (!recaptcha || !siteKey) return "";
      try {
        return await recaptcha.execute(invisibleWidgetId, { action: "login" });
      } catch {
        return "";
      }
    },

    renderCaptcha(containerId, { onSuccess, onError }) {
      const recaptcha = getRecaptcha();
      const container = document.getElementById(containerId);
      if (!container || !recaptcha) {
        onSuccess("");
        return;
      }
      container.innerHTML = "";

      const visibleKey = siteKeyVisible || siteKey;

      try {
        recaptcha.render(container, {
          sitekey: visibleKey,
          callback: onSuccess,
          "error-callback": onError,
        });
      } catch (err) {
        onError(err);
      }
    },

    isReady: () => sdkLoaded,
  };
}
