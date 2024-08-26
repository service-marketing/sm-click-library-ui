<template>
    <div v-if="modelValue" class="modal-head text-white">
        <div class="modal-overlay"></div>
        <div class="modal_responsive">
            <div class="flex min-h-full items-center justify-center text-center">
                <div class="modal-size w-full">
                    <!-- Modal content -->
                    <div class="modal-background bg-base-200">
                        <header class="modal-title">
                            <slot name="title"></slot>
                            <button class="close-button" @click="closeModal">
                                <svg class="w-6 h-6" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24"
                                    height="24" fill="none" viewBox="0 0 24 24">
                                    <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"
                                        stroke-width="2" d="M6 18 17.94 6M18 18 6.06 6" />
                                </svg>
                            </button>
                        </header>
                        <div class="modal-body bg-base-300">
                            <slot name="body"></slot>
                        </div>
                        <footer class="modal-footer">
                            <slot name="footer"></slot>
                        </footer>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: "ModalComponent",
    props: {
        modelValue: {
            type: Boolean,
            required: true,
        },
    },
    methods: {
        closeModal() {
            this.$emit("update:modelValue", false);
        },
    },
};
</script>

<style scoped>
.modal_responsive {
    position: fixed;
    z-index: 10;
    inset: 0;
    overflow-y: auto;
}

.modal-overlay {
    background-color: rgba(0, 0, 0, 0.2);
    width: 100%;
    height: 100%;
    position: absolute;
}

.modal-size {
    position: relative;
    z-index: 50;
    width: 100%;
    max-width: 768px;
    margin-left: auto;
    margin-right: auto;
}

.modal-background {
    border-radius: 1rem;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.06);
    position: relative;
}

.modal-title {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem;
    padding-left: 1.25rem;
    padding-right: 1.25rem;
    border-top-left-radius: 1.5rem;
    border-top-right-radius: 1.5rem;
    font-size: 1.25rem;
}

.modal-body {
    max-height: calc(100vh);
    /* Ajuste conforme necessário */
    padding: 1em;
}

.modal-footer {
    padding: 1rem;
    display: flex;
    justify-content: flex-end;
    align-items: center;
}

.close-button {
    padding: 0.25rem;
    border-radius: 0.5rem;
    background-color: rgba(107, 114, 128, 0.3);
    cursor: pointer;
}

.close-button:hover {
    background-color: rgba(107, 114, 128, 0.5);
}

.modal-head {
    backdrop-filter: blur(2px);
    z-index: 50;
    position: fixed;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    display: flex;
    align-items: center;
    justify-content: center;
}
</style>