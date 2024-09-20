<template>
  <div class="container">
    <!-- Campo de busca -->
    <input v-model="searchQuery" class="search-input bg-base-300 border-b border-base-200" placeholder="Antonio Jose" />

    <!-- Lista de atendentes -->
    <ul class="atendentes-list">
      <!-- Mensagem de ausência de atendentes -->
      <li v-if="filteredAtendentes.length === 0" class="empty-message bg-base-300">
        {{ atendentes.length === 0 ? 'Não há atendentes disponíveis' : 'Não há atendentes com esse nome' }}
      </li>

      <!-- Itens da lista de atendentes -->
      <li v-for="att in filteredAtendentes" :key="att.id" @click="selectAtendente(att)"
        class="atendente-item border-b bg-base-300 border-base-200 hover:bg-base-200">

        <!-- Informações principais do atendente -->
        <main class="atendente-main">
          <div v-if="!att.photo" class="atendente-photo-placeholder">
            <svg class="w-8 h-8 text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24"
              fill="currentColor" viewBox="0 0 24 24">
              <path fill-rule="evenodd"
                d="M12 2a7 7 0 0 0-7 7 3 3 0 0 0-3 3v2a3 3 0 0 0 3 3h1a1 1 0 0 0 1-1V9a5 5 0 1 1 10 0v7.083A2.919 2.919 0 0 1 14.083 19H14a2 2 0 0 0-2-2h-1a2 2 0 0 0-2 2v1a2 2 0 0 0 2 2h1a2 2 0 0 0 1.732-1h.351a4.917 4.917 0 0 0 4.83-4H19a3 3 0 0 0 3-3v-2a3 3 0 0 0-3-3 7 7 0 0 0-7-7Zm1.45 3.275a4 4 0 0 0-4.352.976 1 1 0 0 0 1.452 1.376 2.001 2.001 0 0 1 2.836-.067 1 1 0 1 0 1.386-1.442 4 4 0 0 0-1.321-.843Z"
                clip-rule="evenodd" />
            </svg>
          </div>
          <img v-else :src="att.photo" class="atendente-photo" />
          <span class="atendente-name">{{ att.name }}</span>
        </main>

        <!-- Indicador de status -->
        <footer class="flex items-center gap-4">
          <span v-if="att.unreadMessages > 0" style="background-color: rgb(34 197 94);color: white;padding: 0.5rem;padding-top: 0px;
    padding-bottom: 0px;border-radius: 9999px;
">{{ att.unreadMessages }}</span>
          <div :class="['status-indicator', getStatusClass(att.login_status)]"></div>
        </footer>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const props = defineProps({
  atendentes: { type: Array, required: true },
  attendant: { required: true }
});

const emit = defineEmits(['atendenteSelecionado']);

const searchQuery = ref('');

const selectAtendente = (atendente) => {
  emit('atendenteSelecionado', atendente);
};

const getStatusClass = (status) => {
  switch (status) {
    case 'Busy': return 'bg-red-500';
    case 'Online': return 'bg-green-500';
    case 'Away': return 'bg-yellow-500';
    case 'Offline': return 'bg-gray-500';
    default: return 'bg-purple-500';
  }
};

// Computed property para filtrar os atendentes
const filteredAtendentes = computed(() => {
  if (!searchQuery.value) {
    return props.atendentes.filter(att => att.id !== props.attendant.id);
  }
  return props.atendentes.filter(att =>
    att.name.toLowerCase().includes(searchQuery.value.toLowerCase()) && att.id !== props.attendant.id
  );
});
</script>

<style scoped>
/* Container com rolagem vertical e altura cheia */
.container {
  overflow-y: auto;
  height: 100%;
}

/* Estilo do input de busca */
.search-input {
  width: 100%;
  /* color: black; */
  padding: 0.75rem;
  border-radius: 16px 16px 0 0;
  outline: none;
}

.search-input:focus {
  border-color: #3b82f6;
}

/* Lista de atendentes */
.atendentes-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.atendentes-list .empty-message {
  padding: 0.5rem;
  /* color: #4b5563; */
  /* Cor cinza */
  /* background-color: white; */
}

/* Itens da lista de atendentes */
.atendente-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem;
  /* background-color: white; */
  /* color: #4b5563; */
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.atendente-item:hover {
  /* background-color: #ebf8ff; */
  /* Cor azul clara */
}

.atendente-main {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.atendente-photo-placeholder {
  width: 40px;
  height: 40px;
  background-color: #1e3a8a;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.atendente-photo {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #9ca3af;
  /* Cor cinza */
}

.atendente-name {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Indicador de status de login */
.status-indicator {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

/* Classes de status */
.status-online {
  background-color: #34d399;
  /* Verde para online */
}

.status-offline {
  background-color: #f87171;
  /* Vermelho para offline */
}

.status-away {
  background-color: #fbbf24;
  /* Amarelo para ausente */
}
</style>
