import { defineStore } from "pinia";
import api from "~/utils/api";
import { getInstances, stateInstance } from "~/utils/systemUrls";

export const useInstanceStore = defineStore("instance", {
  state: () => ({
    instances: [],
    count: null,
  }),
  actions: {
    async fetchInstances(query = "") {
      try {
        this.instances = []; // Resetar a lista de instâncias
        let nextPageUrl = `${getInstances}`;
        const response = await api.get(nextPageUrl);
        this.instances = response.data;

        this.instances.forEach(async (key) => {
          key.isLoading = true;
          try {
            const statusPromises = await api.get(stateInstance(key.id));
            const statusResult =
              statusPromises.data.instance.last_instance_status;

            if (
              statusResult === "DISCONNECTED" ||
              statusResult === "UNDEFINED"
            ) {
              key.status = false;
            } else {
              key.status = true;
            }
          } catch (err) {
            key.status = "Offline";
          }
          key.isLoading = false;
        });
        this.count = this.instances.length;
      } catch (error) {
        console.log("Erro ao buscar departamentos:", error);
      }
    },
  },
});
