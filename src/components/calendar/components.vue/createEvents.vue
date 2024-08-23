<template>
    <modal v-model="showModal">
        <template v-slot:title>
            Novo evento {{ getCurrentDay(date) }}
        </template>
        <template v-slot:body>
            Este é o corpo do modal.
        </template>
        <template v-slot:footer>
            <button @click="showModal = false">Fechar</button>
        </template>
    </modal>
</template>
<script setup>
import { ref, computed, watch } from 'vue';
import modal from './eventsModal.vue';

const props = defineProps({
    modal: Boolean,
    date: Date
});

const emit = defineEmits(['close']);

function getCurrentDay(day) {
    const options = { day: 'numeric', month: 'long', year: 'numeric' };
    return day.toLocaleDateString('pt-BR', options);
}

const showModal = ref(props.modal);

// Watch para sincronizar showModal com props.modal
watch(() => props.modal, (newVal) => {
    showModal.value = newVal;
});

// Opcional: Watch para emitir evento quando showModal for alterado diretamente
watch(showModal, (newVal) => {
    if (!newVal) {
        emit('close');
    }
});
</script>
