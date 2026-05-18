<template>
    <div class="w-full content-wrap" v-html="markdownContent"></div>
</template>

<script>
export default {
    props: {
        content: {
            type: String,
            required: true
        }
    },
    computed: {
        markdownContent() {
            let content = this.content || "";

            const escapeHtml = (str) =>
                str
                    .replace(/&/g, "&amp;")
                    .replace(/</g, "&lt;")
                    .replace(/>/g, "&gt;")
                    .replace(/"/g, "&quot;")
                    .replace(/'/g, "&#39;");

            content = escapeHtml(content);

            // _texto_ -> <em>texto</em>
            content = content.replace(/(^|\s)_([^_\n]+?)_([)\].,!?;:"]|\s|$)/g, "$1<em>$2</em>$3");

            // *texto* -> <strong>texto</strong>
            content = content.replace(/\*([^*]+)\*/g, '<strong class="dark:font-semibold">$1</strong>');

            // ~texto~ -> <del>texto</del>
            content = content.replace(/~([^~]+)~/g, "<del>$1</del>");

            // ```texto``` -> <code>texto</code>
            content = content.replace(/```([^`]+)```/g, "<code>$1</code>");

            // links
            content = content.replace(
                /(http[s]?:\/\/[^\s]+)/g,
                '<a href="$1" target="_blank" class="dark:text-[#027eb5] text-[#17D7F1]" style="text-decoration: underline; cursor: alias;">$1</a>'
            );

            return content;
        }
    }
};
</script>

<style scoped>
.content-wrap {
    white-space: pre-wrap;
    overflow-wrap: anywhere;
    word-break: break-word;
    max-width: 100%;
    min-inline-size: 0;
}

.content-wrap code {
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
    background: rgba(127, 127, 127, 0.15);
    padding: 0 0.25rem;
    border-radius: 0.25rem;
}
</style>
