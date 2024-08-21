<template>
    <div class="calendar-container">
        <div class="calendar-header">
            <slot name="backButton"></slot>
            <button @click="prevMonth" class="calendar-button">
                <svg class="icon" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M5 12h14M5 12l4-4m-4 4 4 4" />
                </svg>
            </button>
            <div>
                <DatePicker :dark="theme" cancel-text="Cancelar" select-text="Selecionar" locale="pt-BR"
                    v-model="selectedDate" :format="dateFormatter" :only-month-picker="true" :month-picker="true"
                    @update:model-value="onDateChange">
                    <template #clear-icon="{ clear }">
                    </template>
                </DatePicker>
            </div>
            <button @click="nextMonth" class="calendar-button">
                <svg class="icon" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M19 12H5m14 0-4 4m4-4-4-4" />
                </svg>
            </button>
        </div>
        <div class="calendar">
            <div v-for="(day, index) in weekDays" :key="index" :class="{
                'rounded-tl': index === 0,
                'rounded-tr': index === weekDays.length - 1
            }" class="day-name">
                {{ day }}
            </div>
            <div v-for="(day, index) in daysInMonth" :key="day.date" :class="{
                'rounded-br': index === daysInMonth.length - 1
            }" class="day">
                <div class="date">{{ day.date.getDate() }}</div>
                <footer class="events-container">
                    <div v-for="event in day.events" :key="event.title" class="event" :class="event.tag">
                        <main class="event-main">
                            <Popper placement="top" class="dark:popper-light popper-dark" :hover="true"
                                :content="event.hours">
                                <svg class="event-icon" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"
                                    fill="currentColor" viewBox="0 0 24 24">
                                    <path fill-rule="evenodd"
                                        d="M2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10S2 17.523 2 12Zm11-4a1 1 0 1 0-2 0v4a1 1 0 0 0 .293.707l3 3a1 1 0 0 0 1.414-1.414L13 11.586V8Z"
                                        clip-rule="evenodd" />
                                </svg>
                            </Popper>
                            <p class="event-title">{{ event.title }}</p>
                        </main>
                    </div>
                </footer>
            </div>
        </div>
    </div>
</template>


<script setup>
import { ref } from 'vue';
import DatePicker from '@vuepic/vue-datepicker';
import './components.vue/calendar.css';
import '@vuepic/vue-datepicker/dist/main.css'
const props = defineProps({
    theme: {
        type: Boolean,
        default: true,
    }
})

// Lista dos meses (em português)
const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

// Data atual
const today = new Date();
const currentMonth = ref(today.getMonth());
const currentYear = ref(today.getFullYear());

// Data selecionada pelo DatePicker
const selectedDate = ref(new Date(currentYear.value, currentMonth.value));

const onDateChange = (date) => {
    if (date && typeof date.year === 'number' && typeof date.month === 'number') {
        currentMonth.value = date.month;
        currentYear.value = date.year;
        updateCalendar();
    } else {
        console.error('Data inválida selecionada:', date);
    }
};

// Pegando os dias da semana conforme a localização do usuário
const weekDays = new Array(7).fill(null).map((_, index) => {
    const date = new Date(2021, 0, index + 3); // 2021-01-03 é um domingo
    return new Intl.DateTimeFormat('pt-BR', { weekday: 'short' }).format(date);
});

const dateFormatter = (date) => {
    if (date instanceof Date) {
        const options = { month: 'long', year: 'numeric' };
        return new Intl.DateTimeFormat('pt-BR', options).format(date);
    } else {
        console.error('Data inválida fornecida ao formatador:', date);
        return '';
    }
};

const events = ref([
    { title: 'Meeting Alex', date: '2024-08-10', tag: 'blue', hours: '13:42:00', color: '#cce5ff' },
    { title: '1:1 João', date: '2024-08-10', tag: 'blue', hours: '13:42:00', color: '#cDe5ff' },
    { title: '1:1 João', date: '2024-08-10', tag: 'blue', hours: '13:42:00', color: '#6De5ff' },
]);

const generateCalendar = (year, month) => {
    const days = [];
    const startOfMonth = new Date(year, month, 1);
    const endOfMonth = new Date(year, month + 1, 0);

    for (let date = startOfMonth; date <= endOfMonth; date.setDate(date.getDate() + 1)) {
        days.push({
            date: new Date(date),
            events: getEventsForDate(new Date(date)),
        });
    }
    return days;
};

const getEventsForDate = (date) => {
    return events.value.filter(event => {
        const eventDate = new Date(event.date + 'T00:00:00'); // Força o uso de meia-noite no horário local
        const currentDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

        return eventDate.getTime() === currentDate.getTime();
    });
};

const daysInMonth = ref(generateCalendar(currentYear.value, currentMonth.value));

const updateCalendar = () => {
    daysInMonth.value = generateCalendar(currentYear.value, currentMonth.value);
};

const prevMonth = () => {
    if (currentMonth.value === 0) {
        currentMonth.value = 11;
        currentYear.value--;
    } else {
        currentMonth.value--;
    }
    selectedDate.value = { year: currentYear.value, month: currentMonth.value }; // Atualiza o selectedDate
    updateCalendar();
};

const nextMonth = () => {
    if (currentMonth.value === 11) {
        currentMonth.value = 0;
        currentYear.value++;
    } else {
        currentMonth.value++;
    }
    selectedDate.value = { year: currentYear.value, month: currentMonth.value }; // Atualiza o selectedDate
    updateCalendar();
};
</script>