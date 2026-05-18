<script setup>
import { computed } from "vue";
import { useMessageContext } from "../messageContext.js";

const ctx = useMessageContext();

const props = defineProps({
    time: { type: String, default: "" },
    compact: { type: Boolean, default: false },
    status: { type: Object, default: null },
    phone: { type: String, default: "" }
});

const title = computed(() =>
    props.phone ? `${props.phone} pode ligar para você?` : "Este número pode ligar para você?"
);

const buttonLabel = computed(() => {
    if (!props.status) return "Definir preferências";
    const st = (props.status.status || "").toLowerCase();
    if (st === "reject") return "Agora não";
    const exp = props.status.expirate_at;
    if (exp === 0 || exp === "0") return "Permitir ligações";
    return `Permitir até ${new Date(exp * 1000).toLocaleDateString("pt-BR")}`;
});
</script>

<template>
    <div
        class="w-full overflow-hidden rounded-lg bg-base-200 dark:shadow-gray-800 text-start shadow-sm dark:border-base-100 dark:bg-base-300/70"
        :class="compact ? 'max-w-[320px]' : ''"
    >
        <div class="flex items-start gap-3 p-3 pb-2">
            <div
                class="flex size-9 min-h-9 min-w-9 items-center justify-center rounded-full bg-primary text-white"
                aria-hidden="true"
            >
                <svg xmlns="http://www.w3.org/2000/svg" class="size-5" viewBox="0 0 24 24" fill="currentColor">
                    <path
                        d="M6.62 10.79a15.053 15.053 0 006.59 6.59l2.2-2.2a1.003 1.003 0 01.94-.27c1.03.26 2.13.4 3.25.4.55 0 1 .45 1 1V21a1 1 0 01-1 1C10.07 22 2 13.93 2 3a1 1 0 011-1h3.69c.55 0 1 .45 1 1 0 1.12.14 2.22.4 3.25.07.34-.03.69-.27.94l-2.2 2.2z"
                    />
                </svg>
            </div>
            <div class="flex-1">
                <p class="text-[13px] font-semibold leading-5">
                    {{ title }}
                </p>
                <p class="mt-0.5 text-[12px] leading-4 opacity-80">
                    Você pode atualizar suas preferências quando quiser no perfil comercial.
                </p>
            </div>
        </div>

        <button
            disabled
            type="button"
            class="flex transition w-full items-center bg-emerald-500 hover:bg-emerald-600 justify-center gap-1.5 rounded-b-lg py-2.5 text-[13px] font-semibold text-white"
            @click="$emit('preferences')"
        >
            {{ buttonLabel }}
            <svg
                class="size-3"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                fill="none"
                viewBox="0 0 24 24"
            >
                <path
                    stroke="currentColor"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="m19 9-7 7-7-7"
                />
            </svg>
        </button>

        <div v-if="time" class="flex justify-end px-3 pb-1 pt-1 text-[11px] opacity-75">
            {{ time }}
        </div>
    </div>
</template>
