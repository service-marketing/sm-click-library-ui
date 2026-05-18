<template>
    <div ref="videoContainer" class="video-container group relative shrink cursor-pointer" :class="containerClass">
        <svg
            class="absolute inset-0 z-50 m-auto size-[30%] text-gray-100 hover:opacity-70"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            fill="currentColor"
            viewBox="0 0 24 24"
        >
            <path
                fill-rule="evenodd"
                d="M8.6 5.2A1 1 0 0 0 7 6v12a1 1 0 0 0 1.6.8l8-6a1 1 0 0 0 0-1.6l-8-6Z"
                clip-rule="evenodd"
            />
        </svg>
        <template v-if="isLoading">
            <span class="flex justify-center bg-base-300 p-3" :class="loadingClass">
                <div class="loader m-auto size-12 rounded-full border-4 border-teal-600"></div>
            </span>
        </template>
        <template v-else-if="shouldLoad">
            <video :key="content" ref="videoRef" class="bg-base-300" :class="videoClass">
                <source :src="content" :type="content.type" />
                Seu navegador não suporta esse vídeo.
            </video>
        </template>
    </div>
</template>

<script>
export default {
    props: {
        content: { type: String, required: true },
        isCircle: { type: Boolean, default: false },
        compact: { type: Boolean, default: false }
    },
    computed: {
        containerClass() {
            if (this.isCircle) return "h-[150px] min-w-[150px]";
            if (this.compact) return "mx-auto h-auto w-auto max-w-full";
            return "h-[200px] w-full min-w-[200px]";
        },
        loadingClass() {
            if (this.isCircle) return "size-full rounded-full";
            if (this.compact) return "h-auto w-auto max-h-[300px] max-w-full rounded-xl";
            return "size-full rounded-xl";
        },
        videoClass() {
            if (this.isCircle) return "size-full rounded-full object-cover";
            if (this.compact) return "mx-auto h-auto w-auto max-h-[300px] max-w-full rounded-xl object-scale-down";
            return "size-full rounded-xl object-scale-down";
        }
    },
    data() {
        return { isLoading: true, shouldLoad: false };
    },
    mounted() {
        this.observer = new IntersectionObserver(this.onIntersection, {
            root: null,
            rootMargin: "0px",
            threshold: 0.5
        });
        this.observer.observe(this.$refs.videoContainer);
    },
    methods: {
        onIntersection(entries) {
            entries.forEach((entry) => {
                if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
                    this.shouldLoad = true;
                    this.isLoading = false;
                    this.observer.unobserve(this.$refs.videoContainer);
                }
            });
        }
    }
};
</script>
