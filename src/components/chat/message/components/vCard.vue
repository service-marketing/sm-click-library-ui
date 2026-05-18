<template>
    <div class="m-1 rounded-xl">
        <div class="flex items-center space-x-8">
            <div class="relative size-28 p-1 sm:mb-0">
                <img v-if="contact.photo" :src="contact.photo" class="rounded-xl object-cover" />
                <svg
                    v-else
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    class="rounded-xl border-2 border-primary bg-base-300 text-primary"
                >
                    <path
                        fill-rule="evenodd"
                        d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z"
                        clip-rule="evenodd"
                    />
                </svg>
            </div>
            <div class="flex-auto justify-evenly">
                <div class="flex items-center justify-between">
                    <div class="flex items-center">
                        <div class="flex flex-col">
                            <div class="line-clamp-1 w-full flex-none text-lg font-bold leading-none">
                                {{ contact.name }}
                            </div>
                            <div class="my-1 flex-auto">
                                <span>{{ contact.telephone }}</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="mt-8 flex w-full justify-center text-sm">
                    <button
                        class="-ml-3 rounded-full bg-green-400 px-5 py-2 text-xs font-medium tracking-wider text-white shadow-sm transition duration-300 ease-in hover:bg-green-500 hover:shadow-lg"
                        @click="ctx.showNewContact(contact.name, contact.telephone)"
                    >
                        Iniciar Conversa
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { useMessageContext } from "../messageContext.js";

const ctx = useMessageContext();

defineProps({
    contact: { type: Object, default: () => ({}) }
});
</script>
