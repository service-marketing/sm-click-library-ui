import { defineStore } from "pinia";
import api from "~/utils/api";
import { getInstances, stateInstance } from "~/utils/systemUrls";

export const usePatchStore = defineStore("PatchStore", {
  state: () => ({
    patchNotes: null,
    future_patchs: null,
    latest_patchs: null,
    suggestion: "",
    skeletonLoader: false,
    loaderBtnSuggestion: false,
    suggestionSent: false,
    errorSent: false,
  }),
  actions: {
    async getPatchNotes(system) {
      this.skeletonLoader = true;
      try {
        const resFuture = await api.get(
          "https://8c921c4e-8185-44ed-aa7d-71c64f6174ee.mock.pstmn.io/v1/api/patch-notes/attendance"
          //   `/v1/api/services/updates/history?system=${system}&type=future&page=1&page_size=10`
        );
        console.log(resFuture.data);
        this.future_patchs = resFuture.data;
        this.latest_patchs = resFuture.data;
      } catch (error) {
        console.error(error);
      } finally {
        this.skeletonLoader = false;
      }
    },
    async sendSuggestions() {
      this.loaderBtnSuggestion = true;
      try {
        if (!this.suggestion) {
          this.errorSent = true;
          return;
        }
        this.errorSent = false;
        await new Promise((resolve) => setTimeout(resolve, 2000));
        this.suggestionSent = true;
        console.log(this.suggestion);
      } catch (error) {
        console.error(error);
      } finally {
        this.loaderBtnSuggestion = false;
      }
    },
    resetPatchStates() {
      this.suggestionSent = false;
      this.errorSent = false;
      this.suggestion = "";
    },
  },
});
