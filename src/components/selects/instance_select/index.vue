<script setup>
import { ref, onMounted, watch } from 'vue';
import axios from 'axios';

const open = ref(false);
const selectedInstance = ref(null);
const getLoading = ref(true)
const props = defineProps({
    modelValue: {
        type: Object,
        default: null,
    },
    token: {
        type: String,
        default: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzI0MjQwNDUwLCJpYXQiOjE3MjQxNTQwNTAsImp0aSI6IjFiMWY5YjU4NDFmYzQ4YjZhZTQxNzIxOTFlMDMxMDUzIiwidXNlcl9pZCI6IjYyNGRmZTIzLTkyZDAtNDNmMS04MDYxLWEyMzIxZjJiNWViYiJ9.-ETm-64tLM1HokxXNMSiQt9uCJyprugg95rVUJQa-vU',
    },
    type: {
        type: String,
        // default: 'whatsapp-api-official',
    },
    webhooks: {
        type: Boolean,
        default: undefined
    },
    url: {
        type: String,
        default: 'http://localhost:8000/v1/api/instances/instance/',
    },
    status_url: {
        type: String,
        default: 'http://localhost:8000/v1/api/instances/status_instance/',
    },
});

const emit = defineEmits(['update:modelValue', 'function']);

const instances = ref(null);

async function getInstances() {
    getLoading.value = true;
    try {
        let url = props.url;
        let status_url = props.status_url;
        let params = ``;

        const response = await axios.get(`${url}${params}`, {
            headers: {
                Authorization: `Bearer ${props.token}`,
            },
        });

        instances.value = response.data;

        instances.value.forEach(async (key) => {
            key.isLoading = true;
            try {
                const statusResponse = await axios.get(
                    `${status_url}?instance=${key.id}`,
                    { headers: { Authorization: `Bearer ${props.token}` } }
                );
                if (statusResponse.data.instance_status !== 'Disconnected') {
                    key.status = true;
                } else {
                    key.status = false;
                }
            } catch (err) {
                key.status = 'Offline';
            }
            key.isLoading = false;

            // Sincronize o status da instância selecionada
            if (selectedInstance.value && selectedInstance.value.id === key.id) {
                selectedInstance.value.status = key.status;
            }
        });
    } catch (err) {
        console.log(err);
    }
    getLoading.value = false;
}


function functionEmit(value) {
    selectedInstance.value = value
    emit('function', value)
}

watch(
    () => props.modelValue,
    (newValue) => {
        selectedInstance.value = newValue;
    },
    { immediate: true }
);

watch(selectedInstance, (newValue) => {
    emit('update:modelValue', newValue);
});

onMounted(async () => {
    await getInstances();

    // Caso haja uma instância já selecionada, atualize o status dela
    if (selectedInstance.value) {
        const selected = instances.value.find(inst => inst.id === selectedInstance.value.id);
        if (selected) {
            selectedInstance.value.status = selected.status;
        }
    }
});
function formatTelephone(number) {
    // Remove caracteres não numéricos
    number = number.replace(/\D/g, '');

    // Verifica se o número já tem o código do país
    if (number.length >= 12 && number.startsWith('55')) {
        // Número no formato internacional, começa com +55
        return '+' + number.slice(0, 2) + ' ' + number.slice(2, 4) + ' ' + number.slice(4, 9) + '-' + number.slice(9);
    } else if (number.length === 11) {
        // Número no formato nacional com DDD
        return '+55 ' + number.slice(0, 2) + ' ' + number.slice(2, 7) + '-' + number.slice(7);
    } else if (number.length === 10) {
        // Número no formato nacional sem DDD
        const ddd = number.slice(0, 2);
        const rest = number.slice(2);
        return '+55 ' + ddd + ' ' + rest.slice(0, 5) + '-' + rest.slice(5);
    } else {
        // Número inválido ou não suportado
        return number;
    }
}
</script>
<template>
    <main class="w-full relative text-current">
        <div :class="{ 'rounded-b-none': open }"
            class="rounded-lg shadow dark:shadow-gray-400 shadow-gray-900 dark:bg-base-100 bg-base-100 text-center">
            <div class="flex cursor-pointer justify-between items-center">
                <p @click="open = !open" class="w-full p-3 px-4 select-none">
                <div v-if="!getLoading">
                    <span v-if="!selectedInstance">{{ instances ? instances.length : 'Sem' }} Instâncias
                        disponíveis</span>
                    <span class="flex items-center  gap-2" v-else>
                        <header class="flex gap-3 items-center flex-shrink-0">
                            <svg v-if="selectedInstance.type === 'whatsapp-qrcode'" xmlns="http://www.w3.org/2000/svg"
                                fill="currentColor" class="w-5 h-5 text-green-400" viewBox="0 0 16 16">
                                <path
                                    d="M13.601 2.326A7.854 7.854 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.933 7.933 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.898 7.898 0 0 0 13.6 2.326zM7.994 14.521a6.573 6.573 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.557 6.557 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592zm3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.729.729 0 0 0-.529.247c-.182.198-.691.677-.691 1.654 0 .977.71 1.916.81 2.049.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232z" />
                            </svg>
                            <div class="relative" v-else-if="selectedInstance.type === 'whatsapp-api-official'">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor"
                                    class="w-5 h-5 text-green-400" viewBox="0 0 16 16">
                                    <path
                                        d="M13.601 2.326A7.854 7.854 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.933 7.933 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.898 7.898 0 0 0 13.6 2.326zM7.994 14.521a6.573 6.573 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.557 6.557 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592zm3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.729.729 0 0 0-.529.247c-.182.198-.691.677-.691 1.654 0 .977.71 1.916.81 2.049.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232z" />
                                </svg>
                                <svg style="color: #0081FB;" xmlns="http://www.w3.org/2000/svg" width="16" height="16"
                                    fill="currentColor"
                                    class="w-5 h-5 absolute -bottom-2 -right-2  rounded-full bi bi-meta"
                                    viewBox="0 0 16 16">
                                    <path fill-rule="evenodd"
                                        d="M8.217 5.243C9.145 3.988 10.171 3 11.483 3 13.96 3 16 6.153 16.001 9.907c0 2.29-.986 3.725-2.757 3.725-1.543 0-2.395-.866-3.924-3.424l-.667-1.123-.118-.197a54.944 54.944 0 0 0-.53-.877l-1.178 2.08c-1.673 2.925-2.615 3.541-3.923 3.541C1.086 13.632 0 12.217 0 9.973 0 6.388 1.995 3 4.598 3c.319 0 .625.039.924.122.31.086.611.22.913.407.577.359 1.154.915 1.782 1.714Zm1.516 2.224c-.252-.41-.494-.787-.727-1.133L9 6.326c.845-1.305 1.543-1.954 2.372-1.954 1.723 0 3.102 2.537 3.102 5.653 0 1.188-.39 1.877-1.195 1.877-.773 0-1.142-.51-2.61-2.87l-.937-1.565ZM4.846 4.756c.725.1 1.385.634 2.34 2.001A212.13 212.13 0 0 0 5.551 9.3c-1.357 2.126-1.826 2.603-2.581 2.603-.777 0-1.24-.682-1.24-1.9 0-2.602 1.298-5.264 2.846-5.264.091 0 .181.006.27.018Z" />
                                </svg>
                            </div>
                            <Popper v-if="selectedInstance && selectedInstance.status !== undefined" class="dark:popper-light popper-dark" :hover="true" placement="top">
                                <template #content>
                                    <main class="p-1 rounded text-sm px-3"
                                        :class="{ 'bg-red-500': selectedInstance.status === false, 'bg-green-500': selectedInstance.status === true, 'bg-purple-500': selectedInstance.status === 'Offline' }">
                                        <div class="my-auto text-center mx-auto group-hover:inline-block">
                                            {{ selectedInstance.status === true ? 'Conectada' : selectedInstance.status === false ?
            'Desconectada' :
            'Indefinida' }}
                                        </div>
                                    </main>
                                </template>
                                <div v-if="!selectedInstance.isLoading"
                                    :class="{ 'bg-red-500': selectedInstance.status === false, 'bg-green-500': selectedInstance.status === true, 'bg-purple-500': selectedInstance.status === 'Offline' }"
                                    class="text-xs w-5 h-5 py-1 shadow flex justify-start shadow-gray-900 dark:shadow-gray-400 rounded-full cursor-pointer transition-all duration-200 ease-in-out">
                                </div>
                                <div v-else class="flex justify-center">
                                    <div
                                        class="h-5 w-5 border-t-transparent border-solid animate-spin rounded-full border-white border-4">
                                    </div>
                                </div>
                            </Popper>
                        </header>
                        <div class="w-full">{{
            selectedInstance.name }}</div>
                    </span>
                </div>
                <div v-else class="flex items-center gap-2 justify-center"><svg aria-hidden="true"
                        class="inline w-5 h-5 text-blue-300 animate-spin  fill-gray-600" viewBox="0 0 100 101"
                        fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                            d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                            fill="currentColor" />
                        <path
                            d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                            fill="currentFill" />
                    </svg>Carregando instâncias...</div>
                </p>
                <footer class="flex px-4 items-center gap-2"><button @click="selectedInstance = null, open = false"><svg
                            class="w-4 h-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24"
                            fill="none" viewBox="0 0 24 24">
                            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M6 18 17.94 6M18 18 6.06 6" />
                        </svg></button>
                    <button @click="open = !open">
                        <svg :class="{ 'rotate-180': open }" class="w-4 h-4 ease-out transition" aria-hidden="true"
                            xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="m19 9-7 7-7-7" />
                        </svg>
                    </button>
                </footer>
            </div>
        </div>

        <nav v-if="open"
            class="absolute top-[48px] w-full z-20 text-sm ">
            <ul class="gap-2 rounded-b-lg flex overflow-y-auto p-2 shadow shadow-black dark:shadow-gray-400 bg-base-300  max-h-[200px] flex-col">
                <li v-if="instances.length > 0" v-for="inst, index in instances"
                    class="select-none cursor-pointer w-full">
                    <button
                        :class="selectedInstance && selectedInstance.id === inst.id ? 'bg-base-100' : 'bg-base-200 hover:bg-base-100'"
                        @click="selectedInstance = inst, open = false, functionEmit(inst)"
                        :disabled="selectedInstance && selectedInstance.id === inst.id || (type && inst.type !== type) || (webhooks !== undefined && webhooks !== inst.webhooks)"
                        class="flex rounded-md justify-between items-center p-2 px-1 w-full">
                        <div class="flex w-full items-center pl-2 gap-3">
                            <svg v-if="inst.type === 'whatsapp-qrcode'" xmlns="http://www.w3.org/2000/svg"
                                fill="currentColor" class="w-4 h-4 flex-shrink-0 text-green-400" viewBox="0 0 16 16">
                                <path
                                    d="M13.601 2.326A7.854 7.854 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.933 7.933 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.898 7.898 0 0 0 13.6 2.326zM7.994 14.521a6.573 6.573 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.557 6.557 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592zm3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.729.729 0 0 0-.529.247c-.182.198-.691.677-.691 1.654 0 .977.71 1.916.81 2.049.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232z" />
                            </svg>
                            <div class="relative" v-else-if="inst.type === 'whatsapp-api-official'">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor"
                                    class="w-4 h-4 flex-shrink-0 text-green-400" viewBox="0 0 16 16">
                                    <path
                                        d="M13.601 2.326A7.854 7.854 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.933 7.933 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.898 7.898 0 0 0 13.6 2.326zM7.994 14.521a6.573 6.573 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.557 6.557 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592zm3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.729.729 0 0 0-.529.247c-.182.198-.691.677-.691 1.654 0 .977.71 1.916.81 2.049.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232z" />
                                </svg>
                                <svg style="color: #0081FB;" xmlns="http://www.w3.org/2000/svg" width="16" height="16"
                                    fill="currentColor"
                                    class="w-4 h-4 absolute flex-shrink-0 -bottom-2 -right-2  rounded-full bi bi-meta"
                                    viewBox="0 0 16 16">
                                    <path fill-rule="evenodd"
                                        d="M8.217 5.243C9.145 3.988 10.171 3 11.483 3 13.96 3 16 6.153 16.001 9.907c0 2.29-.986 3.725-2.757 3.725-1.543 0-2.395-.866-3.924-3.424l-.667-1.123-.118-.197a54.944 54.944 0 0 0-.53-.877l-1.178 2.08c-1.673 2.925-2.615 3.541-3.923 3.541C1.086 13.632 0 12.217 0 9.973 0 6.388 1.995 3 4.598 3c.319 0 .625.039.924.122.31.086.611.22.913.407.577.359 1.154.915 1.782 1.714Zm1.516 2.224c-.252-.41-.494-.787-.727-1.133L9 6.326c.845-1.305 1.543-1.954 2.372-1.954 1.723 0 3.102 2.537 3.102 5.653 0 1.188-.39 1.877-1.195 1.877-.773 0-1.142-.51-2.61-2.87l-.937-1.565ZM4.846 4.756c.725.1 1.385.634 2.34 2.001A212.13 212.13 0 0 0 5.551 9.3c-1.357 2.126-1.826 2.603-2.581 2.603-.777 0-1.24-.682-1.24-1.9 0-2.602 1.298-5.264 2.846-5.264.091 0 .181.006.27.018Z" />
                                </svg>
                            </div>
                            <Popper class="dark:popper-light popper-dark" :hover="true" placement="top">
                                <template #content>
                                    <span>{{ type && inst.type !== type ? 'Não é possível utilizar esse tipo de Instância neste recurso' : webhooks === true ? 'Essa instância está com o Atendimento desabilitado' : 'Essa aplicação é somente para instâncias sem atendimento habilitado.' }}</span>
                                </template>
                                <svg v-if="(type && inst.type !== type) || (webhooks !== undefined && webhooks !== inst.webhooks)"
                                    class="w-6 h-6 flex-shrink-0" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"
                                    width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                                    <path fill-rule="evenodd"
                                        d="M8 10V7a4 4 0 1 1 8 0v3h1a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h1Zm2-3a2 2 0 1 1 4 0v3h-4V7Zm2 6a1 1 0 0 1 1 1v3a1 1 0 1 1-2 0v-3a1 1 0 0 1 1-1Z"
                                        clip-rule="evenodd" />
                                </svg>
                            </Popper>
                            <p class="w-full text-center">{{ inst.name }} </p>
                            <Popper class="dark:popper-light popper-dark" :hover="true" placement="top">
                                <template #content>
                                    <main class="p-1 rounded px-3"
                                        :class="{ 'bg-red-500': inst.status === false, 'bg-green-500': inst.status === true, 'bg-purple-500': inst.status === 'Offline' }">
                                        <div class="my-auto text-center mx-auto group-hover:inline-block">
                                            {{ inst.status === true ? 'Conectada' : inst.status === false ?
            'Desconectada' :
            'Indefinida' }}
                                        </div>
                                    </main>
                                </template>
                                <div v-if="!inst.isLoading"
                                    :class="{ 'bg-red-500': inst.status === false, 'bg-green-500': inst.status === true, 'bg-purple-500': inst.status === 'Offline' }"
                                    class="text-xs w-5 h-5 py-1 shadow flex justify-start shadow-gray-900 dark:shadow-gray-400 rounded-full cursor-pointer transition-all duration-200 ease-in-out">
                                </div>
                                <div v-else class="flex justify-center">
                                    <div
                                        class="h-5 w-5 border-t-transparent border-solid animate-spin rounded-full border-white border-4">
                                    </div>
                                </div>
                            </Popper>
                        </div>
                        <div
                            class="flex min-w-[50px] text-sm text-center items-center my-auto flex-shrink-0 px-1 justify-center">
                            <Popper v-if="inst.telephone" class="dark:popper-light popper-dark" :hover="true"
                                placement="top">
                                <template #content>
                                    <div> {{ inst.telephone ? `${inst.telephone}` : '' }}</div>
                                </template>
                                <svg class="w-6 h-6 " aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24"
                                    height="24" fill="currentColor" viewBox="0 0 24 24">
                                    <path
                                        d="M7.978 4a2.553 2.553 0 0 0-1.926.877C4.233 6.7 3.699 8.751 4.153 10.814c.44 1.995 1.778 3.893 3.456 5.572 1.68 1.679 3.577 3.018 5.57 3.459 2.062.456 4.115-.073 5.94-1.885a2.556 2.556 0 0 0 .001-3.861l-1.21-1.21a2.689 2.689 0 0 0-3.802 0l-.617.618a.806.806 0 0 1-1.14 0l-1.854-1.855a.807.807 0 0 1 0-1.14l.618-.62a2.692 2.692 0 0 0 0-3.803l-1.21-1.211A2.555 2.555 0 0 0 7.978 4Z" />
                                </svg>
                            </Popper>
                        </div>
                    </button>
                </li>
                <div v-else class="p-4"> Sem instâncias disponíveis</div>
            </ul>
        </nav>
    </main>
</template>
<style>
button[disabled] {
    opacity: 50;
    cursor: not-allowed;
}

.popper-dark {
    --popper-theme-background-color: #111B21;
    --popper-theme-background-color-hover: #111B21;
    --popper-theme-text-color: white;
    --popper-theme-border-width: 0px;
    --popper-theme-border-radius: 6px;
    --popper-theme-padding: 8px;
    --popper-theme-box-shadow: 0 6px 30px -6px rgba(0, 0, 0, 1);
}

.popper-light {
    --popper-theme-background-color: #ffffff;
    --popper-theme-background-color-hover: #ffffff;
    --popper-theme-text-color: #333333;
    --popper-theme-border-width: 1px;
    --popper-theme-border-style: solid;
    --popper-theme-border-color: #eeeeee;
    --popper-theme-border-radius: 6px;
    --popper-theme-padding: 10px;
    --popper-theme-box-shadow: 0 6px 30px -6px rgba(0, 0, 0, .60);
}
</style>