import { defineStore } from "pinia";
import api from "~/utils/api";
import { getInstances, stateInstance } from "~/utils/systemUrls";

export const useInstanceStore = defineStore("instance", {
  state: () => ({
    instances: [],
    count: null,
    loaded: false,
  }),
  actions: {
    async fetchInstances(query = "") {
      try {
        let nextPageUrl = `${getInstances}`;
        const response = await api.get(nextPageUrl);
        this.instances = response.data;
        // Atualizar status das instâncias
        await Promise.all(
          this.instances.map(async (key) => {
            key.isLoading = true;
            try {
              const statusResult = key.last_instance_status;
              if (
                statusResult === "DISCONNECTED" ||
                statusResult === "UNDEFINED"
              ) {
                key.status = false;
              } else {
                key.status = true;
              }
            } catch (err) {
              console.log(err)
              key.status = "Offline";
            }
            key.isLoading = false;
          }),
        );
        this.count = this.instances.length;
        this.loaded = true; // Marcar como carregado após a requisição ser concluída
      } catch (error) {
        console.log("Erro ao buscar instâncias:", error);
        this.loaded = true; // Mesmo em caso de erro, marcar como carregado para evitar loops de carregamento
      }
    },
    removeInstance(instanceId) {
      this.instances = this.instances.filter((inst) => inst.id !== instanceId);
      this.count = this.instances.length;
    },
    addInstance(instance) {
      const instanceIndex = this.instances.findIndex(
        (inst) => inst.id === instance.id,
      );

      if (instanceIndex !== -1) {
        this.instances[instanceIndex] = instance;
      } else {
        this.instances.push(instance);
      }
      this.count = this.instances.length;
    },
  },
});
