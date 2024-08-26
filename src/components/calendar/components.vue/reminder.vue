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
    <div class="space-y-2 pt-2">
        <div class="flex flex-col gap-2">
            <label for="contentInput">Horário</label>
            <DatePicker format="HH:mm" auto-apply="true" :time-picker="true" locale="pt-BR" cancel-text="Cancelar"
                select-text="Confirmar" :enable-time-picker="true" :min-date="new Date()" text-input :dark="theme"
                v-model="config.schedule.time">
                <template #clear-icon="{ clear }">
                </template>
            </DatePicker>
        </div>
        <div class="flex flex-col gap-2">
            <label for="titleInput">Título</label>
            <input v-model="config.title" id="titleInput" placeholder="Remédio"
                class="input bg-base-200" />
        </div>
        <div class="flex flex-col gap-2">
            <label for="contentInput">Conteúdo</label>
            <textarea v-model="config.content" id="contentInput"
                placeholder="Não esquecer do remédio de alzheimer" class="input bg-base-200" />
        </div>
        <div class="pt-2">
            <button class="bg-green-500 w-full hover:bg-green-400 p-2 px-5 rounded-md mx-auto uppercase">Salvar</button>
        </div>
    </div>
</template>

<style scoped>
.input {
    @apply w-full outline-none p-2 rounded px-3
}
</style>