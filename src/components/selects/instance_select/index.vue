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
        default: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzIxNzMzMjg3LCJpYXQiOjE3MjE2NDY4ODcsImp0aSI6ImUyZDQ3NDUxMThjYTQ1ZjA4YjkzZGY1YTViYWQ0Yzk3IiwidXNlcl9pZCI6IjYyNGRmZTIzLTkyZDAtNDNmMS04MDYxLWEyMzIxZjJiNWViYiJ9.sWCrBDEbR8GVD8X4EyzDzULWL6MhaeCPYWR2SMs-dLU',
    },
    type: String,
    webhooks: Boolean,
    client: {
        type: String,
        default: '624dfe23-92d0-43f1-8061-a2321f2b5ebb',
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

const emit = defineEmits(['update:modelValue']);

const instances = ref(null);

async function getInstances() {
    try {
        let url = props.url;
        let status_url = props.status_url;
        let params = `?client=${props.client}`;
        if (props.type) params += `&type=${props.type}`;
        if (props.webhooks) params += `&webhooks=${props.webhooks}`;

        const response = await axios.get(`${url}`, {
            headers: {
                Authorization: `Bearer ${props.token}`,
            },
        });
        instances.value = response.data.results;
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
        });
    } catch (err) {
        console.log(err);
    }
    getLoading.value = false
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
});
</script>
<template>
    <main class="w-full relative text-white">
        <div @click="open = !open" :class="{'rounded-b-none' : open}" class="rounded-lg shadow shadow-gray-900 bg-base-300 p-2 px-4 text-center">
            <div class="flex cursor-pointer justify-between items-center">
                <p class="w-full select-none">
                <div v-if="!getLoading">
                    <span v-if="!selectedInstance">{{ instances ? instances.length : 'Sem' }} Instâncias
                        disponíveis</span>
                    <span class="flex items-center  gap-2" v-else>
                        <header class="flex gap-3 items-center flex-shrink-0">
                            <svg v-if="selectedInstance.type === 'whatsapp-qrcode'" xmlns="http://www.w3.org/2000/svg"
                                fill="currentColor" class="w-[18px] h-[18px] text-green-400" viewBox="0 0 16 16">
                                <path
                                    d="M13.601 2.326A7.854 7.854 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.933 7.933 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.898 7.898 0 0 0 13.6 2.326zM7.994 14.521a6.573 6.573 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.557 6.557 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592zm3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.729.729 0 0 0-.529.247c-.182.198-.691.677-.691 1.654 0 .977.71 1.916.81 2.049.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232z" />
                            </svg>
                            <svg v-if="selectedInstance.status === false"
                                class="w-5 h-5 text-red-200 bg-red-500/80 p-[3px] rounded-full" aria-hidden="true"
                                xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none"
                                viewBox="0 0 24 24">
                                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"
                                    stroke-width="2" d="M6 18 17.94 6M18 18 6.06 6" />
                            </svg>
                            <svg v-else-if="selectedInstance.status === true" class="w-5 h-5 text-green-500"
                                aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24"
                                fill="currentColor" viewBox="0 0 24 24">
                                <path fill-rule="evenodd"
                                    d="M2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10S2 17.523 2 12Zm13.707-1.293a1 1 0 0 0-1.414-1.414L11 12.586l-1.793-1.793a1 1 0 0 0-1.414 1.414l2.5 2.5a1 1 0 0 0 1.414 0l4-4Z"
                                    clip-rule="evenodd" />
                            </svg>
                            <div class="w-[18px] h-[18px] bg-purple-500 rounded-full"
                                v-else-if="selectedInstance.status === 'Offline'">
                            </div>
                        </header>
                        <div class="w-full">{{
            selectedInstance.name }}</div>
                    </span>
                </div>
                <div v-else class="flex items-center gap-2 justify-center"><svg aria-hidden="true" class="inline w-5 h-5 text-blue-300 animate-spin  fill-gray-600"
                        viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                            d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                            fill="currentColor" />
                        <path
                            d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                            fill="currentFill" />
                    </svg>Carregando instâncias...</div>
                </p>
                <footer class="flex items-center gap-2"><button @click="selectedInstance = null"><svg class="w-4 h-4"
                            aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none"
                            viewBox="0 0 24 24">
                            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M6 18 17.94 6M18 18 6.06 6" />
                        </svg></button>
                    <button>
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
            class="rounded-b-lg absolute top-8 w-full z-20 text-sm mt-2 shadow shadow-gray-900 bg-base-300 p-2">
            <ul class="gap-2 flex flex-col">
                <li v-if="instances.length > 0" v-for="inst, index in instances"
                    :class="selectedInstance && selectedInstance.id === inst.id ? 'bg-base-100/70' : 'bg-base-100/50'"
                    class="hover:bg-base-200/90 select-none cursor-pointer w-full rounded-lg">
                    <main @click="selectedInstance = inst, open = false"
                        class="flex p-2 justify-between gap-2 divide-x-2 divide-gray-500 w-full">
                        <div class="flex w-full items-center px-2 gap-3 justify-between">
                            <svg v-if="inst.type === 'whatsapp-qrcode'" xmlns="http://www.w3.org/2000/svg"
                                fill="currentColor" class="w-5 h-5 text-green-400" viewBox="0 0 16 16">
                                <path
                                    d="M13.601 2.326A7.854 7.854 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.933 7.933 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.898 7.898 0 0 0 13.6 2.326zM7.994 14.521a6.573 6.573 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.557 6.557 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592zm3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.729.729 0 0 0-.529.247c-.182.198-.691.677-.691 1.654 0 .977.71 1.916.81 2.049.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232z" />
                            </svg>
                            <p>{{ inst.name }} {{ index + 1 }}</p>
                            <div v-if="!inst.isLoading">
                                <figure v-if="inst.status === false" class="relative group">
                                    <svg class="w-5 h-5 text-red-200 bg-red-500/80 p-[3px] rounded-full"
                                        aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24"
                                        fill="none" viewBox="0 0 24 24">
                                        <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"
                                            stroke-width="2" d="M6 18 17.94 6M18 18 6.06 6" />
                                    </svg>
                                    <span
                                        class="shadow shadow-gray-700 absolute bg-red-500 px-3 font-semibold rounded-lg p-1 -top-8 -translate-x-11 group-hover:opacity-100 opacity-0">Desconectada</span>
                                </figure>
                                <figure v-else-if="inst.status === true" class="relative group">
                                    <svg class="w-5 h-5 text-green-500" aria-hidden="true"
                                        xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor"
                                        viewBox="0 0 24 24">
                                        <path fill-rule="evenodd"
                                            d="M2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10S2 17.523 2 12Zm13.707-1.293a1 1 0 0 0-1.414-1.414L11 12.586l-1.793-1.793a1 1 0 0 0-1.414 1.414l2.5 2.5a1 1 0 0 0 1.414 0l4-4Z"
                                            clip-rule="evenodd" />
                                    </svg>
                                    <span
                                        class="shadow shadow-gray-700 absolute bg-green-500 px-3 font-semibold rounded-lg p-1 -top-8 -translate-x-9 group-hover:opacity-100 opacity-0">Conectado</span>
                                </figure>
                                <figure v-else-if="inst.status === 'Offline'" class="relative group">
                                    <div class="w-4 h-4 bg-purple-500 rounded-full">
                                        <span
                                            class="shadow shadow-gray-700 absolute bg-purple-500 px-3 font-semibold rounded-lg p-1 -top-8 -translate-x-9 group-hover:opacity-100 opacity-0">Indefinido</span>
                                    </div>
                                </figure>
                            </div>
                            <div v-else> <svg aria-hidden="true"
                                    class="inline w-4 h-4 text-blue-300 animate-spin  fill-gray-600"
                                    viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path
                                        d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                                        fill="currentColor" />
                                    <path
                                        d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                                        fill="currentFill" />
                                </svg></div>

                            <svg :class="inst.webhooks ? 'text-green-500' : 'text-red-600'" class="w-5 h-5 "
                                aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24"
                                fill="currentColor" viewBox="0 0 24 24">
                                <path fill-rule="evenodd"
                                    d="M18.458 3.11A1 1 0 0 1 19 4v16a1 1 0 0 1-1.581.814L12 16.944V7.056l5.419-3.87a1 1 0 0 1 1.039-.076ZM22 12c0 1.48-.804 2.773-2 3.465v-6.93c1.196.692 2 1.984 2 3.465ZM10 8H4a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h6V8Zm0 9H5v3a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-3Z"
                                    clip-rule="evenodd" />
                            </svg>
                        </div>
                        <div class="flex w-full px-2 justify-center">
                            {{ inst.telephone }}
                        </div>
                    </main>
                </li>
                <div v-else class="p-4"> Sem instâncias disponíveis</div>
            </ul>
        </nav>
    </main>
</template>