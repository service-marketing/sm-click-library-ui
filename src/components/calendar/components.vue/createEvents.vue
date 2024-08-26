<template>
    <modal v-model="showModal">
        <template v-slot:title>
            Novo evento {{ getCurrentDay(date) }}
        </template>
        <template v-slot:body>
            <!-- <div>Eventos disponíveis:</div> -->
            <main class="h-full">
                <div class="relative">
                    <select v-model="selectedEvent"
                        class="w-full p-3 cursor-pointer rounded relative bg-base-100 custom-select">
                        <option :value="event.type" v-for="event in eventsType" :key="event.type">
                            {{ event.name }}
                        </option>
                    </select>
                    <svg class="w-5 h-5 absolute right-3 top-3.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"
                        width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                        <path fill-rule="evenodd"
                            d="M18.425 10.271C19.499 8.967 18.57 7 16.88 7H7.12c-1.69 0-2.618 1.967-1.544 3.271l4.881 5.927a2 2 0 0 0 3.088 0l4.88-5.927Z"
                            clip-rule="evenodd" />
                    </svg>
                </div>
                <reminder @close="showModal = false" :token="token" :date="date" @config="getConfig"
                    v-if="selectedEvent === 'reminders'" />
                <sheduledMessage :currentChat="currentChat" @close="showModal = false" :token="token" :date="date"
                    v-else-if="selectedEvent === 'sheduled_messages'" />
            </main>
        </template>
    </modal>
</template>

<script setup>
import { ref, watch } from 'vue';
import modal from './eventsModal.vue';
import reminder from './reminder.vue';
import sheduledMessage from './sheduledMessage.vue';

const eventsType = [
    {
        type: 'sheduled_messages',
        name: 'Mensagens programadas'
    },
    {
        type: 'reminders',
        name: 'Lembrete'
    }
]

const selectedEvent = ref('reminders')

const eventConfig = ref(null)

const props = defineProps({
    modal: Boolean,
    date: Date,
    token: String,
    currentChat: Object
});

const emit = defineEmits(['close']);

function getCurrentDay(day) {
    const options = { day: 'numeric', month: 'long', year: 'numeric' };
    return day.toLocaleDateString('pt-BR', options);
}

const showModal = ref(props.modal);

watch(() => props.modal, (newVal) => {
    showModal.value = newVal;
});

watch(showModal, (newVal) => {
    if (!newVal) {
        emit('close');
    }
});

function getConfig(value) {
    eventConfig.value = value
}
</script>

<style scoped>
.custom-select {
    appearance: none;
}
</style>
