<template>
    <modal v-model="showModal">
        <template v-slot:title>
            <div v-if="currentEvent === null">Novo evento {{ getCurrentDay(date) }}</div>
            <div v-else>{{ currentEvent.title }} - {{ currentEvent.date.split('-').reverse().join('/') }} {{ currentEvent.hours
                }}</div>
        </template>
        <template v-slot:body>
            <main class="main-container">
                <div v-if="currentEvent === null" class="select-container">
                    <select v-model="selectedEvent" class="custom-select bg-base-100">
                        <option :value="event.type" v-for="event in eventsType" :key="event.type">
                            {{ event.name }}
                        </option>
                    </select>
                    <svg class="select-icon" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24"
                        height="24" fill="currentColor" viewBox="0 0 24 24">
                        <path fill-rule="evenodd"
                            d="M18.425 10.271C19.499 8.967 18.57 7 16.88 7H7.12c-1.69 0-2.618 1.967-1.544 3.271l4.881 5.927a2 2 0 0 0 3.088 0l4.88-5.927Z"
                            clip-rule="evenodd" />
                    </svg>
                </div>
                <reminder @close="showModal = false" :token="token" :date="date" @config="getConfig"
                    v-if="selectedEvent === 'reminders'" />
                <sheduledMessage :event="currentEvent" :currentChat="currentChat" @close="showModal = false"
                    :token="token" :date="date" v-else-if="selectedEvent === 'scheduled_messages'" />
            </main>
        </template>
    </modal>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue';
import modal from './eventsModal.vue';
import reminder from './reminder.vue';
import sheduledMessage from './sheduledMessage.vue';

const eventsType = [
    {
        type: 'scheduled_messages',
        name: 'Mensagens programadas'
    },
    {
        type: 'reminders',
        name: 'Lembrete'
    }
]

const selectedEvent = ref('reminders');

const eventConfig = ref(null);

const props = defineProps({
    modal: Boolean,
    date: Date,
    token: String,
    currentChat: Object,
    currentEvent: Object || null
});

onMounted(() => {
    if (props.currentEvent) {
        selectedEvent.value = props.currentEvent.function
    }
})

const emit = defineEmits(['close']);

function getCurrentDay(day) {
    console.log(day)
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
    eventConfig.value = value;
}
</script>

<style scoped>
.main-container {
    height: 100%;
}

.select-container {
    position: relative;
}

.custom-select {
    width: 100%;
    padding: 12px;
    cursor: pointer;
    border-radius: 4px;
    appearance: none;
    outline: none;
    font-size: 16px;
    border: none;
}

.select-icon {
    width: 20px;
    height: 20px;
    position: absolute;
    right: 12px;
    top: 50%;
    transform: translateY(-50%);
}
</style>
