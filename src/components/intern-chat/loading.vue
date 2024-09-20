<template>
    <div class="loading">
        <svg class="spinner" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
        </svg>
    </div>
</template>

<style>
.loading {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
}

.spinner {
    animation: spin 1s linear infinite;
    height: 32px;
    width: 32px;
    color: #2162e4;
}

/* Animação de rotação */
@keyframes spin {
    0% {
        transform: rotate(0deg);
    }

    100% {
        transform: rotate(360deg);
    }
}
</style>