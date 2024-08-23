<template>
    <div v-if="modelValue" class="modal-overlay">
        <div class="modal-content">
            <header class="modal-header bg-base-200">
                <slot name="title"></slot>
                <button class="close-button" @click="closeModal"><svg class="w-6 h-6" aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                        <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M6 18 17.94 6M18 18 6.06 6" />
                    </svg>
                </button>
            </header>
            <div class="modal-body bg-base-300">
                <slot name="body"></slot>
            </div>
            <footer class="modal-footer bg-base-200">
                <slot name="footer"></slot>
            </footer>
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
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
}

.modal-content {
    width: 98%;
    max-width: 800px;
    max-height: 98%;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    display: flex;
    flex-direction: column;
    animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(-20px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.modal-header,
.modal-footer {
    padding: 0.8em;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.modal-body {
    padding: 1em;
    overflow-y: auto;
    flex-grow: 1;
    max-height: calc(100vh - 6em);
    /* Subtrai a altura do header e footer */
}

.close-button {
    background: none;
    border: none;
    font-size: 1.5em;
    cursor: pointer;
    transition: color 0.3s ease;
    @apply p-1 rounded-lg bg-gray-500/30 hover:bg-gray-500/50
}
</style>