<script setup>
import markDown from "./markDown.vue";
import { useMessageContext } from "../messageContext.js";

const ctx = useMessageContext();

defineProps({
    message: { type: Object, required: true },
    from_me: { type: Boolean, required: true }
});

function extractDomain(url) {
    try {
        return url.split("/")[2];
    } catch (e) {
        return url;
    }
}
</script>

<template>
    <div class="mx-auto">
        <main v-if="message.ad_info?.sourceUrl" class="mb-1 flex items-center opacity-95">
            <svg
                class="mr-2 size-5 rotate-90"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                fill="currentColor"
                viewBox="0 0 24 24"
            >
                <path
                    fill-rule="evenodd"
                    d="M12 2a1 1 0 0 1 .932.638l7 18a1 1 0 0 1-1.326 1.281L13 19.517V13a1 1 0 1 0-2 0v6.517l-5.606 2.402a1 1 0 0 1-1.326-1.281l7-18A1 1 0 0 1 12 2Z"
                    clip-rule="evenodd"
                />
            </svg>
            <p class="italic">Enviada via anúncio</p>
        </main>
        <div class="mb-2 overflow-hidden max-h-[400px] rounded-md bg-base-300 dark:shadow-gray-500 relative">
            <a
                v-if="message.ad_info?.sourceUrl"
                target="_blank"
                :href="message.ad_info.sourceUrl"
                :class="from_me ? 'header' : 'bg-gray-900/80 dark:bg-sky-100'"
                class="flex flex-col p-4 px-2 absolute bottom-0 w-full"
            >
                <p v-if="message.ad_info?.title" class="text-start">{{ message.ad_info.title }}</p>
                <p class="text-white font-normal hover:font-medium transition-all ease-in-out select-none">
                    {{ extractDomain(message.ad_info.sourceUrl) }}
                </p>
            </a>
            <img
                v-if="message.ad_info?.thumbnailUrl"
                class="mx-auto cursor-pointer object-scale-down"
                :src="message.ad_info.thumbnailUrl"
                @click="ctx.viewSingleImage(message.ad_info.thumbnailUrl)"
            />
        </div>
        <markDown :content="message.text" />
    </div>
</template>
