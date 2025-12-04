<template>
  <div class="call-history-container">
    <!-- Loading state -->
    <div v-if="loading" class="call-history-loading">
      <svg
        class="call-history-loading-spinner"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          class="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          stroke-width="4"
        />
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
      </svg>
      <span class="call-history-loading-text">Carregando ligações...</span>
    </div>

    <!-- Error state -->
    <div v-else-if="error" class="call-history-error">
      {{ error }}
    </div>

    <!-- Empty state -->
    <div v-else-if="calls.length === 0" class="call-history-empty">
      Nenhuma ligação registrada nesta conversa
    </div>

    <!-- Calls list -->
    <div v-else class="call-history-list">
      <CallCard
        v-for="call in calls"
        :key="call.id"
        :call="call"
        :on-message-click="handleMessageClick"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from "vue";
import CallCard from "./CallCard.vue";
import api from "~/utils/api";
import { callsUrl } from "../../utils/systemUrls";

const props = defineProps({
  chatId: {
    type: [String, Number],
    required: true,
  },
  callsApiUrl: {
    type: String,
    required: false,
    default: callsUrl,
  },
  onMessageClick: {
    type: Function,
    required: false,
    default: null,
  },
});

const loading = ref(false);
const error = ref(null);
const calls = ref([]);

onMounted(() => {
  fetchCalls();
});

watch(
  () => props.chatId,
  () => {
    fetchCalls();
  },
);

async function fetchCalls() {
  if (!props.chatId) return;

  loading.value = true;
  error.value = null;

  try {
    const response = await api.get(
      `${props.callsApiUrl}?chat_id=${props.chatId}`,
    );
    calls.value = response.data.results || response.data || [];
  } catch (err) {
    console.error("Erro ao buscar ligações:", err);
    error.value =
      err.response?.data?.message || "Erro ao carregar o histórico de ligações";
  } finally {
    loading.value = false;
  }
}

function handleMessageClick(call) {
  if (props.onMessageClick) {
    props.onMessageClick(call);
  }
}

</script>

<style scoped>
/* CallHistory.vue - Scoped Styles */
.call-history-container {
  width: 100%;
}

.call-history-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.call-history-loading-spinner {
  width: 1.5rem;
  height: 1.5rem;
  animation: spin 1s linear infinite;
}

.call-history-loading-text {
  color: rgb(107, 114, 128);
  margin-left: 0.5rem;
}

.call-history-error {
  padding: 1rem;
  text-align: center;
  font-size: 0.875rem;
  color: rgb(239, 68, 68);
}

.call-history-empty {
  padding: 1rem;
  text-align: center;
  font-size: 0.875rem;
  opacity: 0.7;
}

.call-history-list {
  max-height: 300px;
  overflow: auto;
  padding: 0.5rem;
}

.call-history-list > * + * {
  margin-top: 0.375rem;
}

/* Animações */
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
