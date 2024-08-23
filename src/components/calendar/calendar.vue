<template>
    <div class="calendar-container text-white">
        <div class="calendar-header bg-base-300">
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
            <div v-for="(day, index) in weekDays" :key="index"
                class="day-name shadow shadow-black/90 dark:shadow-gray-400 bg-base-200 border border-base-100">
                {{ day }}
            </div>
            <div v-for="(day, index) in daysInMonth" :key="index" :class="{
                // 'rounded-br': index === daysInMonth.length - 1,
                'empty-day': !day.date,
                'prev-month-day': day.isPrevMonth,
                'next-month-day': day.isNextMonth
            }"
                class="day group h-full shadow shadow-black/90 dark:shadow-gray-400 bg-base-300 hover:bg-base-200 border border-base-200">
                <div class="date-container">
                    <div class="date">{{ day.date.getDate() }}</div>
                    <button @click="eventModal.modal = true, eventModal.date = day.date"
                        class="add-event-button hidden group-hover:inline-block"><svg class="w-5 h-5" aria-hidden="true"
                            xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M5 12h14m-7 7V5" />
                        </svg>
                    </button>
                </div>
                <footer @click="getCurrentDay(day)" v-if="day.events.length > 0"
                    class="events-container cursor-pointer">
                    <div v-for="event in day.events" :key="event.title" class="event">
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
    <eventsModal v-model="currentDay.seeEvents"> <template v-slot:title>
            {{ currentDay.date }}
        </template>
        <template v-slot:body>
            <main v-if="currentDay.events.length > 0" class="grid md:grid-cols-3 sm:grid-cols-2 gap-2">
                <div v-for="event in currentDay.events" :key="event.title" class="event">
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
            </main>
            <div v-else>Nenhum evento no dia selecionado</div>
        </template>
        <template v-slot:footer>
            <button @click="showModal = false">Fechar</button>
        </template>
    </eventsModal>
    <createEvents @close="closeEvent" :modal="eventModal.modal" :date="eventModal.date" />
</template>

<script setup>
import { ref, onMounted, triggerRef } from 'vue';
import axios from 'axios';
import DatePicker from '@vuepic/vue-datepicker';
import './components.vue/calendar.css';
import './components.vue/date.css'; // Importa o CSS do DatePicker
import eventsModal from './components.vue/eventsModal.vue';
import createEvents from './components.vue/createEvents.vue';
const currentDay = ref({
    seeEvents: false,
    events: null,
    date: new Date
})

const eventModal = ref({
    date: new Date,
    modal: false
})

function closeEvent(value) {
    eventModal.value.modal = value
}

function getCurrentDay(day) {
    currentDay.value.events = day.events;
    currentDay.value.seeEvents = true;

    const options = { day: 'numeric', month: 'long', year: 'numeric' };
    currentDay.value.date = day.date.toLocaleDateString('pt-BR', options);
}

const props = defineProps({
    theme: {
        type: Boolean,
        default: true,
    },
    token: {
        type: String,
        default: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzI0NTAyOTk2LCJpYXQiOjE3MjQ0MTY1OTYsImp0aSI6ImM5MzIyMmFmNTY3ZDQxY2NhYzAzNGY4ZjliNDkwYjQ1IiwidXNlcl9pZCI6IjYyNGRmZTIzLTkyZDAtNDNmMS04MDYxLWEyMzIxZjJiNWViYiJ9.IQKK_SXVAtYipHtzKaOEKycERm8GVkkzicQNtU1igAQ'
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

const events = ref([]);

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

const getTitleForFunction = (eventFunction) => {
    const functionTitleMap = {
        scheduled_messages: 'Mensagens Programadas',
        // Adicione outros mapeamentos conforme necessário
        another_function: 'Outro Título', // Exemplo
        default: 'Evento Desconhecido' // Caso a função não esteja mapeada
    };

    return functionTitleMap[eventFunction] || functionTitleMap['default'];
};

const fetchEvents = async (url = 'http://localhost:8000/v1/api/crm/event/') => {
    try {
        const response = await axios.get(url, {
            headers: {
                Authorization: `Bearer ${props.token}`,
            },
        });
        const data = response.data;

        const formattedEvents = data.results.map(event => ({
            ...event, // Inclui todas as propriedades do evento original
            title: getTitleForFunction(event.function), // Substitui ou adiciona o título
            date: event.params.schedule.time.split(' ')[0], // Extrai e substitui a data
            hours: event.params.schedule.time.split(' ')[1], // Extrai e substitui o horário
            color: '#cce5ff', // Adiciona ou substitui a cor conforme necessário
            tag: 'blue' // Adiciona ou substitui a tag conforme necessário
        }));

        events.value.push(...formattedEvents);

        // Se houver mais páginas, continue a buscar
        if (data.next) {
            await fetchEvents(data.next);
        }
    } catch (error) {
        console.error('Erro ao buscar eventos:', error);
    }
};

const getEventsForDate = (date) => {
    return events.value.filter(event => {
        const eventDate = new Date(event.date + 'T00:00:00'); // Força o uso de meia-noite no horário local
        const currentDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

        return eventDate.getTime() === currentDate.getTime();
    });
};

const generateCalendar = (year, month) => {
    const days = [];
    const startOfMonth = new Date(year, month, 1);
    const endOfMonth = new Date(year, month + 1, 0);

    // Dia da semana do primeiro dia do mês (0 = domingo, 1 = segunda, etc.)
    const startDayOfWeek = startOfMonth.getDay();

    // Obtém o último dia do mês anterior
    const prevMonthEnd = new Date(year, month, 0);
    const prevMonthDaysCount = prevMonthEnd.getDate();

    // Adiciona os últimos dias do mês anterior
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
        const date = new Date(year, month - 1, prevMonthDaysCount - i);
        days.push({
            date: date,
            events: getEventsForDate(date), // Associar eventos ao dia do mês anterior
            isPrevMonth: true, // Identificador para estilização diferente, se necessário
        });
    }

    // Adiciona os dias reais do mês
    for (let date = startOfMonth; date <= endOfMonth; date.setDate(date.getDate() + 1)) {
        days.push({
            date: new Date(date),
            events: getEventsForDate(new Date(date)),
            isPrevMonth: false,
            isNextMonth: false,
        });
    }

    // Adiciona os primeiros dias do próximo mês para completar a grade
    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
        const date = new Date(year, month + 1, i);
        days.push({
            date: date,
            events: getEventsForDate(date), // Associar eventos ao dia do próximo mês
            isNextMonth: true, // Identificador para estilização diferente, se necessário
        });
    }

    return days;
};


const daysInMonth = ref([]);

const updateCalendar = () => {
    daysInMonth.value = generateCalendar(currentYear.value, currentMonth.value);
};

// Carrega os eventos e atualiza o calendário na montagem do componente
onMounted(async () => {
    await fetchEvents();
    updateCalendar();
});

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
