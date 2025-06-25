import { defineStore } from "pinia";
import api from "~/utils/api";
import { getInstances, stateInstance } from "~/utils/systemUrls";

export const usePatchStore = defineStore("PatchStore", {
  state: () => ({
    patchNotes: null,
  }),
  actions: {
    async getPatchNotes(query = "") {
      const res = await api.get(
        "https://8c921c4e-8185-44ed-aa7d-71c64f6174ee.mock.pstmn.io/v1/api/patch-notes/attendance"
      );
      this.patchNotes = res.data;
      console.log(this.patchNotes);
    },
  },
});
