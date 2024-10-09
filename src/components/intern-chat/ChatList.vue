<template>
  <div class="attendants-container">
    <!-- Campo de busca -->
    <input v-model="searchQuery" class="search-input bg-base-300 border-b border-base-200" placeholder="Pesquise entre os atendentes..." />

    <!-- Lista de atendentes -->
    <ul class="atendentes-list bg-base-300">
      <!-- Mensagem de ausência de atendentes -->
      <li v-if="filteredAtendentes.length === 0" class="empty-message bg-base-200">
        {{ atendentes.length === 0 ? 'Não há atendentes disponíveis' : 'Não há atendentes com esse nome' }}
      </li>

      <!-- Itens da lista de atendentes -->
      <li v-for="att in filteredAtendentes" :key="att.id" @click="selectAtendente(att)"
        :class="['atendente-item', att.isMoved ? 'moved' : '']"
        class="border-b even:bg-base-300 bg-blue-400/10 border-base-200 hover:bg-base-200 relative">
        <!-- Informações principais do atendente -->
        <main class="atendente-main">
          <Avatar :url="att.photo" />
          <span class="atendente-name">{{ att.name }}</span>
        </main>

        <!-- Indicador de status -->
        <footer class="flex items-center gap-4">
          <span v-if="att.internal_chat.unread > 0" class="message-indicator">{{ att.internal_chat.unread }}</span>
          <div :class="['status-indicator', getStatusClass(att.login_status)]"></div>
        </footer>

        <!-- Indicador de "conversar" no hover -->
        <div class="hover-action">
          Conversar
        </div>
      </li>

    </ul>
    <!-- Footer fixo -->
    <footer class="chat-footer bg-base-200 rounded-b-xl">
    </footer>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import Avatar from './Avatar.vue'
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
.atendente-item {
  transition: transform 0.3s ease, background-color 0.3s ease;
}

.atendente-item.moved {
  animation: highlight 0.8s ease-in-out;
}

@keyframes highlight {
  0% {
    background-color: rgba(59, 130, 246, 0.2);
  }

  100% {
    background-color: transparent;
  }
}

.attendants-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

.search-input {
  width: 100%;
  padding: 0.75rem;
  border-radius: 16px 16px 0 0;
  outline: none;
}

.search-input:focus {
  border-color: #3b82f6;
}

/* Lista de atendentes ocupa o espaço disponível */
.atendentes-list {
  flex-grow: 1;
  /* Faz a lista ocupar o espaço restante */
  list-style: none;
  overflow-y: auto;
  /* Habilita rolagem se houver muitos atendentes */
  height: 100%;
}

.atendentes-list .empty-message {
  padding: 1rem;
}

/* Itens da lista de atendentes */
/* Itens da lista de atendentes */
.atendente-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem;
  cursor: pointer;
  transition: background-color 0.3s ease;
  position: relative;
  overflow: hidden;
  padding-right: 1rem;
}

/* Efeito de hover */
.atendente-item:hover {
  background-color: rgba(59, 130, 246, 0.2);
}

/* Indicador "Conversar" no hover */
.hover-action {
  position: absolute;
  right: -100px;
  top: 50%;
  transform: translateY(-50%);
  background-color: #3b82f6;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  transition: right 0.3s ease;
  white-space: nowrap;
}

/* Animação ao passar o mouse */
.atendente-item:hover .hover-action {
  right: 10px;
}

/* Indicador de mensagens não lidas */
.message-indicator {
  background-color: rgb(34 197 94);
  color: white;
  padding: 0.5rem;
  padding-top: 0px;
  padding-bottom: 0px;
  border-radius: 9999px;
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

/* Footer fixo no final */
.chat-footer {
  padding: 0.6rem;
  text-align: center;
  color: white;
  /* Fixo na parte inferior */
}

/* Botões da navbar */
.nav-button {
  background: none;
  border: none;
  color: white;
  font-size: 1rem;
  cursor: pointer;
  padding: 0.5rem 1rem;
}

.nav-button:hover {
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 8px;
}
</style>
