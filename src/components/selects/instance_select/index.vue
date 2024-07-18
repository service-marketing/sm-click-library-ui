<script setup>
import { ref } from 'vue';
const open = ref(false)
const selectedInstance = ref(null)
const props = defineProps({
    token: String,
    type: String,
    webhooks: Boolean,
})
</script>
<template>
    <main class="w-full relative text-white">
        <div @click="open = !open" class="rounded-lg shadow shadow-gray-900 bg-base-300 p-2 px-4 text-center">
            <div class="flex cursor-pointer justify-between items-center">
                <p class="w-full select-none"><span v-if="!selectedInstance">Instâncias disponíveis</span> <span
                        v-else>{{
            selectedInstance }}</span></p>
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
            class="rounded-lg absolute top-10 w-full z-20 text-sm mt-2 shadow shadow-gray-900 bg-base-300 p-2">
            <ul class="gap-2 flex flex-col">
                <li v-for="inst, index in 5" class="bg-base-100/50 hover:bg-base-100 cursor-pointer w-full  rounded-lg">
                    <main @click="selectedInstance = inst, open = false"
                        class="flex p-2 justify-between gap-2 divide-x-2 divide-gray-500 w-full">
                        <div class="flex w-full items-center px-2 gap-3 justify-between">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" class="w-5 h-5 text-green-400"
                                viewBox="0 0 16 16">
                                <path
                                    d="M13.601 2.326A7.854 7.854 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.933 7.933 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.898 7.898 0 0 0 13.6 2.326zM7.994 14.521a6.573 6.573 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.557 6.557 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592zm3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.729.729 0 0 0-.529.247c-.182.198-.691.677-.691 1.654 0 .977.71 1.916.81 2.049.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232z" />
                            </svg>
                            <p>Instância {{ index + 1 }}</p>
                            <svg class="w-5 h-5 text-red-200 bg-red-500/80 p-[3px] rounded-full" aria-hidden="true"
                                xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none"
                                viewBox="0 0 24 24">
                                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"
                                    stroke-width="2" d="M6 18 17.94 6M18 18 6.06 6" />
                            </svg>
                            <svg class="w-5 h-5 text-red-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"
                                width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                                <path fill-rule="evenodd"
                                    d="M18.458 3.11A1 1 0 0 1 19 4v16a1 1 0 0 1-1.581.814L12 16.944V7.056l5.419-3.87a1 1 0 0 1 1.039-.076ZM22 12c0 1.48-.804 2.773-2 3.465v-6.93c1.196.692 2 1.984 2 3.465ZM10 8H4a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h6V8Zm0 9H5v3a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-3Z"
                                    clip-rule="evenodd" />
                            </svg>
                        </div>
                        <div class="flex w-full px-2 justify-center">
                            +55 (11) 9234-6438
                        </div>
                    </main>
                </li>
            </ul>
        </nav>
    </main>
</template>