<script setup>
import markDown from "./markDown.vue";

const props = defineProps({
    content: { type: Object, required: true }
});

const emit = defineEmits(["action"]);

const type = (props.content?.type || "").toLowerCase();
const headerText = props.content?.headers?.type === "text" ? props.content?.headers?.content || "" : "";
const bodyText = props.content?.body || "";

const icons = {
    voice_call: `<svg class="size-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24"><path d="M6.97825 3.99999c-.3729 0-.74128.08169-1.07926.23934-.32394.15109-.61243.36845-.84696.63786-1.81892 1.82189-2.35302 3.87423-1.89899 5.93671.43916 1.9949 1.77747 3.8929 3.45642 5.572 1.67897 1.6791 3.57614 3.0176 5.57034 3.4591 2.0612.4563 4.1141-.0726 5.9396-1.8853.2705-.2348.4888-.524.6405-.8489.1581-.3387.2401-.7081.2401-1.0819 0-.3739-.082-.7432-.2401-1.0819-.1516-.3247-.3696-.6137-.6398-.8483l-1.2098-1.2106c-.5043-.5041-1.1879-.7872-1.9007-.7872-.7128 0-1.3968.2835-1.9011.7876l-.6178.6181c-.1512.1513-.3563.2363-.5701.2363-.2138 0-.4189-.085-.5701-.2363l-1.85336-1.8545c-.15117-.1513-.23609-.3565-.23609-.5704 0-.214.08493-.4192.23613-.5705l.61812-.61851c.5037-.50461.7867-1.18868.7867-1.90191s-.2833-1.39767-.7871-1.90228L8.90499 4.8778c-.23462-.26969-.5233-.48727-.84749-.63847-.33798-.15765-.70636-.23934-1.07925-.23934Z"/><path fill-rule="evenodd" d="M18.0299 8.98132c0 .55229-.4477 1-1 .99999l-3.03-.00002c-.5522 0-1-.44772-1-1V5.99995c0-.55229.4478-1 1-1 .5523 0 1 .44771 1 1v.58112l3.3184-3.29111c.3921-.38892 1.0253-.38631 1.4142.00582.3889.39213.3863 1.02529-.0058 1.4142l-3.2984 3.27133h.6016c.5523.00001 1 .44773 1 1.00001Z" clip-rule="evenodd"/></svg>`,
    call_permission_request: `<svg class="size-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a7 7 0 0 0-7 7v3.382a2 2 0 0 1-.553 1.381l-1.31 1.366A1 1 0 0 0 3.7 17H20.3a1 1 0 0 0 .562-1.871l-1.31-1.366A2 2 0 0 1 19 12.382V9a7 7 0 0 0-7-7Z"/><path d="M9.75 20a2.25 2.25 0 0 0 4.5 0h-4.5Z"/></svg>`,
    quick_reply: `<svg class="size-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24"><path d="M14.502 7.046h-2.5v-.928a2.122 2.122 0 0 0-1.199-1.954 1.827 1.827 0 0 0-1.984.311L3.71 8.965a2.2 2.2 0 0 0 0 3.24L8.82 16.7a1.829 1.829 0 0 0 1.985.31 2.121 2.121 0 0 0 1.199-1.959v-.928h1a2.025 2.025 0 0 1 1.999 2.047V19a1 1 0 0 0 1.275.961 6.59 6.59 0 0 0 4.662-7.22 6.593 6.593 0 0 0-6.437-5.695Z"/></svg>`,
    url: `<svg class="size-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24"><path fill-rule="evenodd" d="M11.403 5H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-6.403a3.01 3.01 0 0 1-1.743-1.612l-3.025 3.025A3 3 0 1 1 9.99 9.768l3.025-3.025A3.01 3.01 0 0 1 11.403 5Z" clip-rule="evenodd"/><path fill-rule="evenodd" d="M13.232 4a1 1 0 0 1 1-1H20a1 1 0 0 1 1 1v5.768a1 1 0 1 1-2 0V6.414l-6.182 6.182a1 1 0 0 1-1.414-1.414L17.586 5h-3.354a1 1 0 0 1-1-1Z" clip-rule="evenodd"/></svg>`
};

function isHttpsLink(value) {
    if (typeof value !== "string") return false;
    return /^https:\/\/[^\s/$.?#].[^\s]*$/i.test(value.trim());
}

function resolveHeaderKind() {
    const h = props.content?.headers;
    if (!h) return { kind: null, value: "" };
    const rawType = String(h?.type || "").toLowerCase();
    const value = h?.content ?? h?.media ?? "";
    if (["text", "image", "video", "document"].includes(rawType)) return { kind: rawType, value };
    if (typeof value === "string" && isHttpsLink(value)) {
        try {
            const ext = new URL(value).pathname.split(".").pop()?.toLowerCase();
            if (["jpeg", "jpg", "png", "gif", "webp"].includes(ext)) return { kind: "image", value };
            if (["mp4", "mov", "webm"].includes(ext)) return { kind: "video", value };
            if (ext === "pdf") return { kind: "document", value };
        } catch {}
    }
    return { kind: "text", value };
}

const { kind: headerKind, value: headerValue } = resolveHeaderKind();

function onClick() {
    emit("action", { type, ...props.content });
}
</script>

<template>
    <div class="max-w-[360px]">
        <div v-if="content?.headers" class="p-1 pt-0">
            <template v-if="['image', 'video', 'document'].includes(headerKind) && isHttpsLink(headerValue)">
                <section class="rounded bg-base-300 p-1 flex justify-center">
                    <img v-if="headerKind === 'image'" :src="headerValue" class="max-h-96 max-w-full rounded object-contain" alt="header image" />
                    <video v-else-if="headerKind === 'video'" :src="headerValue" controls class="max-h-96 max-w-full rounded object-contain"></video>
                    <embed v-else-if="headerKind === 'document'" :src="headerValue" type="application/pdf" class="w-full h-96 rounded" />
                </section>
            </template>
            <template v-if="content.headers?.text">
                <p class="font-semibold text-[14px] leading-tight pt-3 px-1">
                    <markDown :content="content.headers.text" />
                </p>
            </template>
        </div>
        <div class="px-2 pb-2 pt-1">
            <p class="whitespace-pre-line text-[14px] leading-snug opacity-90">
                <markDown :content="bodyText" />
            </p>
        </div>
        <div v-if="content.footer" class="px-2 pb-2 pt-1">
            <p class="whitespace-pre-line text-[14px] leading-snug opacity-60">
                <markDown :content="content.footer" />
            </p>
        </div>
        <div v-for="(btn, index) in content.buttons" :key="btn.id || btn.type || btn.text" class="-mx-2">
            <button
                :class="[
                    'flex w-full items-center justify-center gap-2 border-t border-base-300 dark:border-gray-300 px-3 py-2.5 text-center text-sm font-medium text-sky-300 hover:bg-base-100/60 dark:text-primary_alt dark:hover:bg-gray-100/80 transition-colors',
                    index === content.buttons.length - 1 ? 'rounded-b-md' : ''
                ]"
                @click="onClick"
            >
                <span v-html="icons[btn.type?.toLowerCase()] || icons.quick_reply"></span>
                <span class="truncate">{{ btn.text || btn.display_text || 'Continuar' }}</span>
            </button>
        </div>
    </div>
</template>
