/**
 * Contact Search Composable
 *
 * Manages contact search, pagination, and infinite loading logic
 */
import { ref, watch, onUnmounted } from "vue";
import api from "~/utils/api.js";
import { contact_url } from "~/utils/systemUrls.js";
import { normalizeString } from "./useContactMergeValidation.js";

export function useContactSearch(excludeContactId) {
  // State
  const searchTerm = ref("");
  const candidates = ref([]);
  const candidatesLoading = ref(false);
  const page = ref(1);
  const nextPage = ref(null);
  const infiniteKey = ref(0);

  // Internal state
  let searchDebounceTimer = null;
  let requestToken = 0;

  // ========== API FUNCTIONS ==========
  const buildUrl = (queryParams = {}) => {
    const params = new URLSearchParams();
    Object.entries(queryParams).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== "") {
        params.append(key, value);
      }
    });
    return `${contact_url}?${params.toString()}`;
  };

  const fetchCandidates = async (resetList = false) => {
    const currentToken = ++requestToken;

    if (resetList) {
      page.value = 1;
      candidates.value = [];
      nextPage.value = null;
      infiniteKey.value++;
    }

    candidatesLoading.value = true;

    try {
      const response = await api.get(
        buildUrl({
          page: page.value,
          query: searchTerm.value || undefined,
        }),
      );

      if (currentToken !== requestToken) return;

      const payload = response?.data;
      const results = Array.isArray(payload)
        ? payload
        : Array.isArray(payload?.results)
          ? payload.results
          : [];

      nextPage.value = payload?.next || null;
      const currentId = normalizeString(
        excludeContactId?.value || excludeContactId,
      );

      const filtered = results.filter((candidate) => {
        const candidateId = normalizeString(candidate?.id);
        return candidateId && candidateId !== currentId;
      });

      if (resetList || page.value === 1) {
        candidates.value = filtered;
      } else {
        candidates.value = [...candidates.value, ...filtered];
      }
    } catch (error) {
      if (currentToken !== requestToken) return;
      console.error("Erro ao buscar contatos:", error);
      candidates.value = resetList ? [] : candidates.value;
    } finally {
      if (currentToken === requestToken) {
        candidatesLoading.value = false;
      }
    }
  };

  const loadMoreCandidates = async (state) => {
    if (!nextPage.value) {
      state.complete();
      return;
    }

    page.value++;

    try {
      await fetchCandidates(false);
      if (nextPage.value) {
        state.loaded();
      } else {
        state.complete();
      }
    } catch (error) {
      console.error("Erro ao carregar mais contatos:", error);
      state.complete();
    }
  };

  const resetSearch = () => {
    searchTerm.value = "";
    candidates.value = [];
    page.value = 1;
    nextPage.value = null;
    requestToken++;
    clearTimeout(searchDebounceTimer);
  };

  // Watch search term with debounce
  watch(searchTerm, () => {
    clearTimeout(searchDebounceTimer);
    searchDebounceTimer = setTimeout(() => {
      fetchCandidates(true);
    }, 350);
  });

  // Cleanup
  onUnmounted(() => {
    clearTimeout(searchDebounceTimer);
    requestToken++;
  });

  return {
    // State
    searchTerm,
    candidates,
    candidatesLoading,
    page,
    nextPage,
    infiniteKey,

    // Methods
    fetchCandidates,
    loadMoreCandidates,
    resetSearch,
  };
}
