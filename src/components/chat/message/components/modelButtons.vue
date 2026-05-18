<script setup>
import { computed } from "vue";

const props = defineProps({
    items: { type: Array, required: true },
    rowClass: { type: String, default: "" },
    roundedClassLast: { type: String, default: "rounded-b-md" },
    iconMode: { type: String, default: "emoji" }
});

const normalized = computed(() =>
    (props.items || []).map((b) => ({
        type: b?.type || "QUICK_REPLY",
        text: b?.text || "",
        phone: b?.phone_number ?? b?.phone ?? null,
        url: b?.url ?? null
    }))
);

function Icon({ type }) {
    if (props.iconMode === "emoji") {
        if (type === "PHONE_NUMBER") return "📞";
        if (type === "URL") return "🔗";
        return "⚡";
    }
    if (type === "PHONE_NUMBER") {
        return `<svg class="size-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24"><path d="M7.978 4a2.553 2.553 0 0 0-1.926.877C4.233 6.7 3.699 8.751 4.153 10.814c.44 1.995 1.778 3.893 3.456 5.572 1.68 1.679 3.577 3.018 5.57 3.459 2.062.456 4.115-.073 5.94-1.885a2.556 2.556 0 0 0 .001-3.861l-1.21-1.21a2.689 2.689 0 0 0-3.802 0l-.617.618a.806.806 0 0 1-1.14 0l-1.854-1.855a.807.807 0 0 1 0-1.14l.618-.62a2.692 2.692 0 0 0 0-3.803l-1.21-1.211A2.555 2.555 0 0 0 7.978 4Z"/></svg>`;
    }
    if (type === "URL") {
        return `<svg class="size-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24"><path fill-rule="evenodd" d="M11.403 5H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-6.403a3.01 3.01 0 0 1-1.743-1.612l-3.025 3.025A3 3 0 1 1 9.99 9.768l3.025-3.025A3.01 3.01 0 0 1 11.403 5Z" clip-rule="evenodd"/><path fill-rule="evenodd" d="M13.232 4a1 1 0 0 1 1-1H20a1 1 0 0 1 1 1v5.768a1 1 0 1 1-2 0V6.414l-6.182 6.182a1 1 0 0 1-1.414-1.414L17.586 5h-3.354a1 1 0 0 1-1-1Z" clip-rule="evenodd"/></svg>`;
    }
    if (type === "QUICK_REPLY") {
        return `<svg class="size-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24"><path d="M14.502 7.046h-2.5v-.928a2.122 2.122 0 0 0-1.199-1.954 1.827 1.827 0 0 0-1.984.311L3.71 8.965a2.2 2.2 0 0 0 0 3.24L8.82 16.7a1.829 1.829 0 0 0 1.985.31 2.121 2.121 0 0 0 1.199-1.959v-.928h1a2.025 2.025 0 0 1 1.999 2.047V19a1 1 0 0 0 1.275.961 6.59 6.59 0 0 0 4.662-7.22 6.593 6.593 0 0 0-6.437-5.695Z"/></svg>`;
    }
    return `<svg class="size-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/></svg>`;
}
</script>

<template>
    <div v-if="normalized.length" class="flex flex-col">
        <div
            v-for="(btn, idx) in normalized"
            :key="idx"
            :class="[
                'flex items-center border-b dark:border-gray-300 border-gray-700 justify-center gap-2 bg-base-200 px-2 py-1 text-center hover:bg-base-100',
                'text-sky-300 dark:text-sky-700',
                rowClass,
                { [roundedClassLast]: idx === normalized.length - 1 }
            ]"
        >
            <span v-if="iconMode === 'emoji'">{{ Icon({ type: btn.type }) }}</span>
            <span v-else v-html="Icon({ type: btn.type })"></span>
            <a
                v-if="btn.type === 'URL'"
                :href="btn.url"
                target="_blank"
                rel="noopener noreferrer"
                :title="btn.url"
                class="w-full truncate sm:whitespace-normal hover:underline"
            >
                {{ btn.text ? btn.text : "Abrir link" }}
            </a>
            <p v-else class="w-full">{{ btn.text ? btn.text : "Insira o texto..." }}</p>
        </div>
    </div>
</template>
