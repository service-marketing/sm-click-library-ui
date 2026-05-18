<script setup>
import markDown from "./markDown.vue";
import ButtonList from "./modelButtons.vue";

const props = defineProps({
    message: { type: Object, required: true },
    from_me: Boolean
});

function getHeaderFileType(header) {
    if (typeof header !== "string") return null;
    try {
        const url = new URL(header);
        const ext = url.pathname.split(".").pop().toLowerCase();
        if (["jpeg", "jpg", "png"].includes(ext)) return "image";
        if (ext === "mp4") return "video";
        if (ext === "pdf") return "pdf";
        return null;
    } catch {
        return null;
    }
}

function isHttpsLink(value) {
    if (typeof value !== "string") return false;
    return /^https:\/\/[^\s/$.?#].[^\s]*$/i.test(value.trim());
}
</script>

<template>
    <div class="mt-[-19px]">
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            fill="currentColor"
            class="bi bi-meta size-4 rounded-full text-sky-300 dark:text-sky-500"
            viewBox="0 0 16 16"
        >
            <path
                fill-rule="evenodd"
                d="M8.217 5.243C9.145 3.988 10.171 3 11.483 3 13.96 3 16 6.153 16.001 9.907c0 2.29-.986 3.725-2.757 3.725-1.543 0-2.395-.866-3.924-3.424l-.667-1.123-.118-.197a54.944 54.944 0 0 0-.53-.877l-1.178 2.08c-1.673 2.925-2.615 3.541-3.923 3.541C1.086 13.632 0 12.217 0 9.973 0 6.388 1.995 3 4.598 3c.319 0 .625.039.924.122.31.086.611.22.913.407.577.359 1.154.915 1.782 1.714Zm1.516 2.224c-.252-.41-.494-.787-.727-1.133L9 6.326c.845-1.305 1.543-1.954 2.372-1.954 1.723 0 3.102 2.537 3.102 5.653 0 1.188-.39 1.877-1.195 1.877-.773 0-1.142-.51-2.61-2.87l-.937-1.565ZM4.846 4.756c.725.1 1.385.634 2.34 2.001A212.13 212.13 0 0 0 5.551 9.3c-1.357 2.126-1.826 2.603-2.581 2.603-.777 0-1.24-.682-1.24-1.9 0-2.602 1.298-5.264 2.846-5.264.091 0 .181.006.27.018Z"
            />
        </svg>
    </div>

    <main class="mt-1 flex flex-col gap-1 pb-3">
        <header v-if="message.template?.header" class="font-semibold">
            <template v-if="isHttpsLink(message.template.header)">
                <section class="flex-justify-center bg-base-300 rounded">
                    <img
                        v-if="getHeaderFileType(message.template.header) === 'image'"
                        :src="message.template.header"
                        class="max-h-96 w-auto rounded object-contain mx-auto"
                    />
                    <video
                        v-else-if="getHeaderFileType(message.template.header) === 'video'"
                        :src="message.template.header"
                        controls
                        class="max-h-96 w-auto rounded object-contain mx-auto"
                    ></video>
                    <embed
                        v-else-if="getHeaderFileType(message.template.header) === 'pdf'"
                        :src="message.template.header"
                        type="application/pdf"
                        class="w-full h-96 rounded mx-auto"
                    />
                </section>
            </template>
            <markDown v-else :content="message.template.header" />
        </header>

        <main v-if="message.template?.body">
            <markDown :content="message.template.body" />
        </main>

        <footer v-if="message.template?.footer" class="opacity-70">
            <markDown :content="message.template.footer" />
        </footer>
    </main>

    <ButtonList class="-mx-2" v-if="message.template?.buttons" :items="message.template.buttons" iconMode="svg" />
</template>
