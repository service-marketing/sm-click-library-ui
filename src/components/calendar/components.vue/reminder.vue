<script setup>
import { ref, onMounted } from 'vue';
import DatePicker from '@vuepic/vue-datepicker';
const props = defineProps({
    currentChat: {
        type: Object,
        default: {
            id: null, contact: {
                segmentation_fields: []
            }
        }
    },
    theme: {
        type: Boolean,
        default: true,
    },
    date: Date,
    token: String
})
const config = ref({
    schedule: {
        time: props.date,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        type: 'unique'
    },
    title: '',
    content: '',
    type: 'reminders'
})
</script>

<template>
    <div class="container">
        <div class="form-group">
            <label for="contentInput">Horário</label>
            <DatePicker format="HH:mm" auto-apply="true" :time-picker="true" locale="pt-BR" cancel-text="Cancelar"
                select-text="Confirmar" :enable-time-picker="true" :min-date="new Date()" text-input :dark="theme"
                v-model="config.schedule.time">
                <template #clear-icon="{ clear }">
                </template>
            </DatePicker>
        </div>
        <div class="form-group">
            <label for="titleInput">Título</label>
            <input v-model="config.title" id="titleInput" placeholder="Remédio"
                class="input" />
        </div>
        <div class="form-group">
            <label for="contentInput">Conteúdo</label>
            <textarea v-model="config.content" id="contentInput"
                placeholder="Não esquecer do remédio de alzheimer" class="input bg-base-200" />
        </div>
        <div class="button-container">
            <button class="save-button">Salvar</button>
        </div>
    </div>
</template>

<style scoped>
.container {
    padding-top: 8px;
}

.form-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.input {
    width: 100%;
    outline: none;
    padding: 8px;
    border-radius: 4px;
    padding-left: 12px;/* Cor substituída pelo valor da sua variável CSS */
}

.button-container {
    padding-top: 8px;
}

.save-button {
    background-color: #38a169;
    width: 100%;
    padding: 8px 20px;
    border-radius: 4px;
    text-transform: uppercase;
    color: white;
    cursor: pointer;
    transition: background-color 0.3s ease;
}

.save-button:hover {
    background-color: #48bb78;
}
</style>
