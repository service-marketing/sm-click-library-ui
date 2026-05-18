<script setup>
import { computed } from "vue";
import markDown from "./markDown.vue";
import MessageFileRenderer from "./MessageFileRenderer.vue";
import { useMessageContext } from "../messageContext.js";

const ctx = useMessageContext();

const props = defineProps({
    message: { type: Object, required: true }
});

const visibleItems = computed(() => (props.message?.items || []).slice(0, 4));
const hiddenItemsCount = computed(() => Math.max((props.message?.items?.length || 0) - 4, 0));

const isForwardActive = computed(() => ctx.forwardMode?.value?.active || false);

function isItemSelected(id) {
    if (!id) return false;
    return (ctx.forwardMode?.value?.selectedMessages || []).includes(id);
}

function toggleItemSelection(id) {
    if (!id || !ctx.forwardMode?.value) return;
    const selected = ctx.forwardMode.value.selectedMessages;
    const idx = selected.indexOf(id);
    if (idx > -1) {
        selected.splice(idx, 1);
    } else {
        selected.push(id);
    }
}

function togglePackageSelection() {
    if (!ctx.forwardMode?.value) return;
    const ids = (props.message.items || [])
        .map((it) => it.id)
        .filter((id) => id != null && id !== "");

    const selected = ctx.forwardMode.value.selectedMessages;
    const toRemove = ids.filter((id) => selected.includes(id));
    const toAdd = ids.filter((id) => !selected.includes(id));

    if (toRemove.length > toAdd.length) {
        ctx.forwardMode.value.selectedMessages = selected.filter((id) => !ids.includes(id));
    } else {
        ids.forEach((id) => {
            if (!selected.includes(id)) selected.push(id);
        });
    }
}

function buildRendererMessage(item) {
    return {
        id: item?.id,
        type: item?.type || item?.content?.type || "image",
        content: { ...item?.content }
    };
}

function openPackage(index) {
    ctx.viewImage(index, true, props.message);
}
</script>

<template>
    <div class="relative grid grid-cols-2 gap-[2px] text-white">
        <div v-if="isForwardActive" class="absolute left-1 top-1 z-10" @click.stop="togglePackageSelection">
            <div
                class="flex size-5 cursor-pointer items-center justify-center rounded border-2 transition-colors"
                :class="'border-gray-400 dark:bg-gray-500/60 dark:border-gray-600 hover:border-primary'"
            >
                <svg
                    v-if="(message.items || []).some((it) => isItemSelected(it.id))"
                    class="size-3.5 text-primary"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
                </svg>
            </div>
        </div>

        <template v-for="(item, i) in visibleItems" :key="item.id || i">
            <div
                :id="String(item.id || i)"
                class="group relative size-full max-h-[250px] cursor-pointer overflow-hidden rounded-lg"
                @click="openPackage(i)"
            >
                <MessageFileRenderer
                    :message="buildRendererMessage(item)"
                    variant="thumbnail"
                    :show-caption="false"
                    :interactive="false"
                />

                <button
                    v-if="isForwardActive"
                    aria-label="Selecionar mídia"
                    class="absolute left-1 top-1 z-10 flex size-5 cursor-pointer items-center justify-center rounded border-2 bg-black/40 transition-colors"
                    :class="isItemSelected(item.id) ? 'border-primary' : 'border-gray-400 hover:border-primary'"
                    @click.stop="toggleItemSelection(item.id)"
                >
                    <svg
                        v-if="isItemSelected(item.id)"
                        class="size-3.5 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
                    </svg>
                </button>

                <div
                    v-if="i === 3 && hiddenItemsCount > 0"
                    class="absolute inset-0 flex items-center justify-center bg-black/60 text-xl font-semibold text-white"
                >
                    +{{ hiddenItemsCount }}
                </div>

                <div
                    class="pointer-events-none absolute inset-0 bg-black/30 opacity-0 transition-opacity group-hover:opacity-100"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" class="absolute left-2 top-2 size-6" style="transform: rotate(135deg)"><path stroke-linecap="round" stroke-linejoin="round" d="m19 9-7 7-7-7" /></svg>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" class="absolute right-2 top-2 size-6" style="transform: rotate(-135deg)"><path stroke-linecap="round" stroke-linejoin="round" d="m19 9-7 7-7-7" /></svg>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" class="absolute bottom-2 left-2 size-6" style="transform: rotate(45deg)"><path stroke-linecap="round" stroke-linejoin="round" d="m19 9-7 7-7-7" /></svg>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" class="absolute bottom-2 right-2 size-6" style="transform: rotate(-45deg)"><path stroke-linecap="round" stroke-linejoin="round" d="m19 9-7 7-7-7" /></svg>
                </div>
            </div>
        </template>
    </div>

    <div v-if="message.content?.caption" class="pt-1">
        <markDown :content="message.content?.caption" />
    </div>
</template>
