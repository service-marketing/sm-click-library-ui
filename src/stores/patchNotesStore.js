import { defineStore } from "pinia";
import api from "~/utils/api";
import { getInstances, stateInstance } from "~/utils/systemUrls";

export const usePatchStore = defineStore("PatchStore", {
  state: () => ({
    patchNotes: null,
    suggestion: "",
    skeletonLoader: false,
    loaderBtnSuggestion: false,
    suggestionSent: false,
    errorSent: false,
  }),
  actions: {
    async getPatchNotes() {
      this.skeletonLoader = true;
      try {
        const res = await api.get(
          "/v1/api/services/updates/history?system=manager&type=future&page=1&page_size=1"
        );
        this.patchNotes = res.data;
        console.log(this.patchNotes);
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
