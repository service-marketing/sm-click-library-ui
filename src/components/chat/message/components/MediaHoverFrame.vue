<template>
    <div class="media-hover-frame">
        <svg class="media-corner media-corner-tl" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m19 9-7 7-7-7" />
        </svg>
        <svg class="media-corner media-corner-tr" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m19 9-7 7-7-7" />
        </svg>
        <svg class="media-corner media-corner-bl" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m19 9-7 7-7-7" />
        </svg>
        <svg class="media-corner media-corner-br" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m19 9-7 7-7-7" />
        </svg>
    </div>
</template>

<style scoped>
.media-hover-frame {
    @apply pointer-events-none absolute inset-0 bg-black/30 opacity-0 transition-opacity group-hover:opacity-100;
}

.media-corner {
    @apply absolute size-6 text-white;
}

.media-corner-tl {
    left: 0.5rem;
    top: 0.5rem;
    transform: rotate(135deg);
}

.media-corner-tr {
    right: 0.5rem;
    top: 0.5rem;
    transform: rotate(-135deg);
}

.media-corner-bl {
    bottom: 0.5rem;
    left: 0.5rem;
    transform: rotate(45deg);
}

.media-corner-br {
    bottom: 0.5rem;
    right: 0.5rem;
    transform: rotate(-45deg);
}
</style>
