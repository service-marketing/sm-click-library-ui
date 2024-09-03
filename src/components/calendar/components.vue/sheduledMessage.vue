<script setup>
import { ref, nextTick, onMounted } from 'vue';
import DatePicker from '@vuepic/vue-datepicker';
import axios from 'axios';
import { notify } from 'notiwind';

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
    date: {
        type: Date,
        required: true
    },
    token: String,
    event: Object || null
});

const saveLoading = ref(false);
const emit = defineEmits(['close']);
const seeMethod = ref('post');

const config = ref({
    message: [{ type: 'text', content: '' }],
    schedule: {
        time: props.date,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        type: 'unique'
    },
    chat_id: props.currentChat.id || null
});

onMounted(() => {
    if (props.event) {
        config.value = props.event.params;
        seeMethod.value = 'patch';
        config.value.schedule.time = extractTimeFromDate(config.value.schedule.time);
    } else {
        const now = new Date();
        config.value.schedule.time = formatTime(now);
    }
});

const textareaRef = ref(null);

function extractTimeFromDate(dateInput) {
    const date = new Date(dateInput);
    return {
        hours: date.getHours(),
        minutes: date.getMinutes(),
        seconds: date.getSeconds()
    };
}

function formatTime(date) {
    return {
        hours: date.getHours(),
        minutes: date.getMinutes(),
        seconds: date.getSeconds()
    };
}

function addVar(variable) {
    config.value.message[0].content += ` {${variable.name}} `;
    nextTick(() => textareaRef.value.focus());
}

const fileInput = ref(null);

function selectFile() {
    fileInput.value.click();
}

function handleFileUpload(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            config.value.file = e.target.result;
            config.value.fileName = file.name;
        };
        reader.readAsDataURL(file);
    }
}

function mergeDateAndTime(originalDate, time) {
    const mergedDate = new Date(originalDate);
    mergedDate.setHours(time.hours, time.minutes, time.seconds || 0);
    const adjustedDate = new Date(mergedDate.getTime() - mergedDate.getTimezoneOffset() * 60000);
    return adjustedDate.toISOString().replace('T', ' ').slice(0, 16);
}
async function programMessage() {
    saveLoading.value = true;
    try {
        const sendConfig = JSON.parse(JSON.stringify(config.value));
        sendConfig.schedule.time = mergeDateAndTime(props.date, sendConfig.schedule.time);

        const response = await axios[seeMethod.value](`http://localhost:8000/v1/api/crm/event/scheduled_message/${config.value.event_id ? `${config.value.event_id}/` : ''}`, sendConfig, {
            headers: {
                Authorization: `Bearer ${props.token}`,
            },
        });
        notify({ group: "success", title: "Sucesso", text: response.data.message }, 2000);
        emit('close', false);
    } catch (e) {
        notify({ group: "error", title: 'Erro', text: e.response.data.message }, 2000);
    } finally {
        saveLoading.value = false;
    }
}
</script>

<template>
    <div class="container">
        <div class="form-group">
            <label for="contentInput">Horário</label>
            <DatePicker auto-apply="true" :time-picker="true" locale="pt-BR" cancel-text="Cancelar"
                select-text="Confirmar" :enable-time-picker="true"  text-input :dark="theme"
                v-model="config.schedule.time">
                <template #clear-icon="{ clear }"></template>
            </DatePicker>
        </div>
        <div class="form-group">
            <label for="contentInput">Conteúdo</label>
            <textarea id="sheduleMessageArea" ref="textareaRef" autofocus v-model="config.message[0].content"
                placeholder="Olá cliente, tudo bem?" class="input bg-base-200" />
        </div>
        <div v-if="currentChat.contact && currentChat.contact.segmentation_fields.length > 0"
            class="custom-fields-container border border-base-100">
            <div class="custom-fields-header bg-base-300">
                Campos personalizáveis disponíveis
                <Popper placement="top" :arrow="true" :hover="true" class="info" content="">
                    <svg class="info-icon" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor"
                        viewBox="0 0 24 24">
                        <path fill-rule="evenodd"
                            d="M2 12a10 10 0 1 1 20 0 10 10 0 0 1-20 0Zm9.4-5.5a1 1 0 1 0 0 2 1 1 0 1 0 0-2ZM10 10a1 1 0 1 0 0 2h1v3h-1a1 1 0 1 0 0 2h4a1 1 0 1 0 0-2h-1v-4c0-.6-.4-1-1-1h-2Z"
                            clip-rule="evenodd" />
                    </svg>
                    <template #content>
                        <p class="info-content">Ao enviar a mensagem para o
                            cliente o valor deste campo será substituído pelo valor correspondente
                            no momento do envio</p>
                    </template>
                </Popper>
            </div>
            <div class="custom-fields-list">
                <div @click="addVar(variable)"
                    v-for="variable in globalStore.messageStore.currentChat.contact.segmentation_fields" :key="variable"
                    class="custom-field bg-primary">
                    {{ variable.name }}
                </div>
            </div>
        </div>

        <div class="file-container bg-base-100" v-if="config.file">
            <p>{{ config.fileName }}</p>
            <div class="file-actions">
                <button @click="config.file = ''" class="file-remove-button">
                    <svg class="file-remove-icon" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24"
                        height="24" fill="currentColor" viewBox="0 0 24 24">
                        <path fill-rule="evenodd"
                            d="M8.586 2.586A2 2 0 0 1 10 2h4a2 2 0 0 1 2 2v2h3a1 1 0 1 1 0 2v12a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V8a1 1 0 0 1 0-2h3V4a2 2 0 0 1 .586-1.414ZM10 6h4V4h-4v2Zm1 4a1 1 0 1 0-2 0v8a1 1 0 1 0 2 0v-8Zm4 0a1 1 0 1 0-2 0v8a1 1 0 1 0 2 0v-8Z"
                            clip-rule="evenodd" />
                    </svg>
                </button>
            </div>
        </div>
        <div class="button-container">
            <button :disabled="saveLoading" @click="programMessage" class="save-button text-white">
                <div v-if="saveLoading"
                    class="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-e-transparent motion-reduce:animate-[spin_1.5s_linear_infinite] ">
                </div>Salvar
            </button>
        </div>
    </div>
</template>


<style scoped>
.container {
    padding-top: 8px;
    gap: 8px;
    display: flex;
    flex-direction: column;
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
    padding-left: 12px;
}

.custom-fields-container {
    padding: 8px 0;
    border-radius: 4px;
    box-shadow: 0px 1px 3px rgba(0, 0, 0, 0.1);
    position: relative;
}

.custom-fields-header {
    position: absolute;
    top: -12px;
    left: 12px;
    padding: 4px 8px;
    display: flex;
    align-items: center;
    gap: 4px;
}

.info-icon {
    width: 20px;
    height: 20px;
    color: var(--primary-color, #007bff);
}

.info-content {
    word-break: break-word;
    text-align: justify;
    max-width: 470px;
}

.custom-fields-list {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
}

.custom-field {
    color: white;
    cursor: pointer;
    padding: 4px 8px;
    border-radius: 4px;
}

.file-container {
    box-shadow: 0px 1px 3px rgba(0, 0, 0, 0.1);
    padding: 8px;
    border-radius: 4px;
    margin-top: 8px;
}

.file-actions {
    display: flex;
    justify-content: flex-end;
}

.file-remove-button {
    background-color: #e53e3e;
    color: white;
    padding: 4px;
    border-radius: 4px;
    cursor: pointer;
    transition: background-color 0.3s ease;
}

.file-remove-button:hover {
    background-color: #f56565;
}

.file-remove-icon {
    width: 20px;
    height: 20px;
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
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
}

.save-button:hover {
    background-color: #48bb78;
}
</style>
