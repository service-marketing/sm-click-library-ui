<script setup lang="ts">
import CallCard from "./CallCard.vue";

defineProps({
    content: {
        type: Object,
        required: true
    }
});
</script>

<template>
    <div class="call-message-container">
        <CallCard
            :call="content"
            :hide-message-button="true"
        />
    </div>
</template>

<style scoped>
.call-message-container {
    width: 100%;
    min-width: 285px;
}
</style>