<script setup>
import { useMessageContext } from "../messageContext.js";

const ctx = useMessageContext();

defineProps({
    message: { type: Object, required: true },
    from_me: Boolean
});
</script>

<template>
    <div class="-mx-2">
        <div
            class="dark:sidebar header flex cursor-pointer items-center rounded-b-md p-2 px-3 text-white shadow-none dark:text-primary_alt dark:shadow-none dark:hover:bg-gray-100/80"
            @click="ctx.setListModal(true, message)"
        >
            <svg
                class="mr-2 size-5"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                fill="none"
                viewBox="0 0 24 24"
            >
                <path stroke="currentColor" stroke-linecap="round" stroke-width="2" d="M5 7h14M5 12h14M5 17h10" />
            </svg>
            {{ message.buttonText }}
        </div>
    </div>
</template>
