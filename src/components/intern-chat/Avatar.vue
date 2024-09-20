<template>
    <div
        class="avatar bg-[#404857] shadow shadow-gray-900 dark:shadow-gray-700 dark:bg-gray-300 text-gray-100 dark:text-gray-500">
        <svg style="padding-top: 0.5rem" v-if="!url" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
            stroke-width="1.5" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round"
                d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
        </svg>
        <img style="object-fit: scale-down;" v-else :src="url" />
    </div>
</template>

<script setup>
const props = defineProps({
    url: { type: String }
})

</script>

<style scoped>
.avatar {
    width: 40px;
    height: 40px;
    border-radius: 100%;
    overflow: hidden;
}
</style>