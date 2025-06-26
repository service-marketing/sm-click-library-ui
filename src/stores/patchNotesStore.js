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

        this.future_patchs = [
          {
            id: "f502e57d-9c3a-485e-99ef-179974bad802",
            system: "attendant",
            type: "future",
            title: "Dolor sit dolor elit amet.",
            description:
              "Lorem sit amet consectetur sit sit ipsum lorem ipsum amet sit sit ipsum ipsum consectetur. \n \n isso ai \n \n opaaa",
            flag: "improvement",
            tutorial: "https://smclick.com.br",
            launched_at: "2025-05-26",
          },
          {
            id: "270868d3-290b-4570-bdb3-54e7bddc492f",
            system: "attendant",
            type: "future",
            title: "Lorem dolor amet elit amet.",
            description:
              "Adipiscing consectetur consectetur consectetur ipsum lorem lorem elit sit sit amet lorem ipsum sit ipsum.",
            flag: "bug-fix",
            tutorial: "https://smclick.com.br",
            launched_at: "2025-05-26",
          },
          {
            id: "7e3c44cc-58c9-4933-ab29-a6589fceecda",
            system: "attendant",
            type: "future",
            title: "Elit adipiscing dolor sit elit.",
            description:
              "Consectetur ipsum consectetur adipiscing sit consectetur elit consectetur sit elit lorem dolor dolor consectetur sit.",
            flag: "new-feature",
            tutorial: null,
            launched_at: "2025-05-26",
          },
          {
            id: "fafc4f49-2a8f-451b-a28d-e9878e0f82f9",
            system: "attendant",
            type: "future",
            title: "Adipiscing sit consectetur lorem sit.",
            description:
              "Dolor sit consectetur elit sit elit elit dolor lorem adipiscing lorem dolor amet dolor lorem.",
            flag: "bug-fix",
            tutorial: "https://smclick.com.br",
            launched_at: "2025-05-27",
          },
          {
            id: "de7cdbbc-c193-45da-846f-9c40952e2995",
            system: "attendant",
            type: "future",
            title: "Consectetur lorem dolor adipiscing adipiscing.",
            description:
              "Amet dolor adipiscing elit amet elit dolor adipiscing dolor consectetur amet sit sit sit elit.",
            flag: "improvement",
            tutorial: "https://smclick.com.br",
            launched_at: "2025-05-28",
          },
          {
            id: "80c172f8-7b86-4fed-83bd-61d0d23b74d1",
            system: "attendant",
            type: "future",
            title: "Ipsum elit consectetur dolor consectetur.",
            description:
              "Lorem adipiscing elit lorem elit amet adipiscing elit amet lorem dolor lorem dolor elit dolor.",
            flag: "bug-fix",
            tutorial: "https://smclick.com.br",
            launched_at: "2025-05-29",
          },
          {
            id: "2e1ffd15-4fb7-4b09-9ddc-7be5f0483953",
            system: "attendant",
            type: "future",
            title: "Ipsum dolor elit adipiscing amet.",
            description:
              "Sit dolor amet elit ipsum sit sit sit sit ipsum amet ipsum elit lorem consectetur.",
            flag: "improvement",
            tutorial: null,
            launched_at: "2025-05-30",
          },
          {
            id: "a9291cf4-f085-4692-8b60-82c48b3f5b09",
            system: "attendant",
            type: "future",
            title: "Consectetur lorem sit consectetur sit.",
            description:
              "Dolor sit ipsum ipsum dolor consectetur consectetur adipiscing ipsum elit amet sit dolor elit consectetur.",
            flag: "new-feature",
            tutorial: null,
            launched_at: "2025-05-30",
          },
          {
            id: "55b77e42-f7c2-4d65-a39a-a8ef9ea65c14",
            system: "attendant",
            type: "future",
            title: "Sit lorem elit consectetur dolor.",
            description:
              "Consectetur sit amet lorem dolor consectetur adipiscing ipsum consectetur ipsum sit adipiscing amet lorem elit.",
            flag: "new-feature",
            tutorial: "https://smclick.com.br",
            launched_at: "2025-05-30",
          },
          {
            id: "24054755-c48d-4fac-aa7a-470bb2ebe1b8",
            system: "attendant",
            type: "future",
            title: "Amet adipiscing amet amet ipsum.",
            description:
              "Lorem ipsum lorem ipsum lorem elit lorem lorem adipiscing dolor adipiscing lorem lorem elit sit.",
            flag: "bug-fix",
            tutorial: "https://smclick.com.br",
            launched_at: "2025-05-30",
          },
        ];
        this.latest_patchs = resFuture.data;
      } catch (error) {
        console.error(error);
      } finally {
        this.skeletonLoader = false;
      }
    },
    resetPatchStates() {
      this.suggestionSent = false;
      this.errorSent = false;
      this.suggestion = "";
    },
  },
});
