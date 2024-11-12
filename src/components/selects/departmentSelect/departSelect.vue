<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { useDepartmentStore } from '~/stores/departmentStore';

const props = defineProps({
    department: { type: Array, default: null },
    modal_filter: { type: String, default: null },
    multiSelect: { type: Boolean, default: true },
    permissions: { type: Boolean, default: false },
    isVisible: { type: Boolean, default: true } 
});

// Observa a prop isVisible para limpar a seleção quando o componente ficar invisível
watch(() => props.isVisible, (newVal) => {
    if (!newVal) {
        clearSelectedAttendance(); // Limpa os itens selecionados quando o componente deixa de estar visível
    }
});

const emit = defineEmits(['depart']);
const departmentStore = useDepartmentStore();

const searchInput = ref(''); // Campo para o input de pesquisa

const departmentSelected = ref([]);
const open_select = ref(false);
const get_loading = ref(false);

// Computed property para filtrar departamentos pelo termo de busca
const filteredDepartments = computed(() => {
    if (!searchInput.value) return departmentStore.departments;
    return departmentStore.departments.filter(department =>
        department.name.toLowerCase().includes(searchInput.value.toLowerCase())
    );
});

onMounted(() => {
    clearSelectedDepartments()
    fetchDepartments();
});

// Watch para modal_filter e multiSelect
watch(
    () => props.modal_filter,
    () => {
        if (!props.modal_filter && props.multiSelect) {
            departmentStore.departments.forEach(department => {
                department.selected = false;
            });
            departmentSelected.value = [];
        }
    },
    { immediate: true }
);

// Função para buscar departamentos
async function fetchDepartments() {
    get_loading.value = true;

    // await departmentStore.fetchDepartments();
    updateSelectedDepartments();

    get_loading.value = false;
}

// Função para limpar a seleção de todos os departamentos
function clearSelectedDepartments() {
    departmentStore.departments.forEach(department => {
        department.selected = false;
    });
    departmentSelected.value = []; // Limpa o array de selecionados
}


// Atualiza departamentos selecionados
function updateSelectedDepartments() {
    if (props.department && props.department.length > 0) {
        props.department.forEach((dep) => {
            const departmentInStore = departmentStore.departments.find(d => d.id === dep.id);
            if (departmentInStore) {
                departmentInStore.selected = true;
                const exists = departmentSelected.value.some(selected => selected.id === dep.id);
                if (!exists) {
                    departmentSelected.value.push({ ...departmentInStore });
                }
            }
        });
    }
    emit('depart', departmentSelected.value);
}

// Seleção de departamentos
function selectDepartment(department) {
    const index = departmentSelected.value.findIndex(dep => dep.id === department.id);

    if (index !== -1) {
        // Se o departamento já está selecionado, desmarque-o
        department.selected = false;
        departmentSelected.value.splice(index, 1);
    } else {
        // Caso multiSelect esteja desativado ou haja departamentos pré-selecionados nas props
        if (!props.multiSelect || (props.department && props.department.length > 0)) {
            // Desmarcar todos os departamentos previamente selecionados
            departmentSelected.value.forEach(dep => {
                dep.selected = false;
            });
            departmentSelected.value = []; // Limpar os selecionados
        }
        
        // Adicionar o novo departamento como selecionado
        department.selected = true;
        departmentSelected.value.push(department);
    }
    emit('depart', departmentSelected.value);
}


// Remoção de departamentos selecionados
function eraseDepartment(department, index) {
    department.selected = false;
    departmentSelected.value.splice(index, 1);
    emit('depart', departmentSelected.value);
}
</script>

<template>
    <div class="depart-select-container ">
        <div class="search-container relative shadow shadow-gray-900 dark:shadow-gray-500">
            <div class="input-wrapper bg-base-300 border-b border-base-200" @click="open_select = !open_select"
                :class="{ 'expanded': open_select || departmentSelected.length > 0 }">
                <input v-model="searchInput" :placeholder="departmentSelected.length > 0
                    ? (multiSelect
                        ? `Selecionados: ${departmentSelected.length}`
                        : `Selecionado: ${departmentSelected[0].name}`)
                    : 'Pesquise por nome.'" class="select-depart-input" />
                <div class="icon-container">
                    <svg v-if="!get_loading" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                        stroke-width="1.5" stroke="currentColor" class="search-icon">
                        <path stroke-linecap="round" stroke-linejoin="round"
                            d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                    </svg>
                    <div v-else class="loader"></div>
                </div>
            </div>

            <main v-if="departmentSelected.length > 0 && multiSelect"
                class="selection-container bg-base-300 border-b border-base-200">
                <div v-for="(depart, index) in departmentSelected" :key="depart.id" class="selection-item">
                    {{ depart.name }}
                    <button @click="eraseDepartment(depart, index)" class="close-btn">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                            stroke="currentColor" class="close-icon">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            </main>

            <div :class="departmentSelected.length > 0 && multiSelect ? 'dropdown-expanded' : 'dropdown'"
                class="dropdown bg-base-300">
                <div class="department-list">
                    <div :class="{ 'two-columns': filteredDepartments.length > 4 }" class="grid-container">
                        <div v-for="department in filteredDepartments" :key="department.id"
                            :class="{ 'selected': department.selected }"
                            class="department-item line-clamp-1 bg-slate-500/20 hover:bg-teal-600">
                            <span @click="selectDepartment(department)" class="department-name h-full w-full">{{
                                department.name }}</span>
                            <div v-if="multiSelect && permissions" style="width: 150px;">
                                <select v-model="department.permission" class="select-dropdown bg-base-300">
                                    <option selected>normal</option>
                                    <option>supervisor</option>
                                    <!-- <option value="master">mestre</option> -->
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
                <div v-if="!get_loading && filteredDepartments.length === 0" class="no-departments bg-base-300">
                    Nenhum departamento disponível.
                </div>
                <div v-if="get_loading" class="loading-spinner">
                    <div class="loader"></div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.shadow {
    --tw-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
    --tw-shadow-colored: 0 1px 3px 0 var(--tw-shadow-color), 0 1px 2px -1px var(--tw-shadow-color);
    box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow);
}

.depart-select-container {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
}

.search-container {
    width: 100%;
    border-bottom-right-radius: 0.375rem /* 6px */;
    border-bottom-left-radius: 0.375rem /* 6px */;
}

.input-wrapper {
    padding: 10px;
    padding-left: 40px;
    /* box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2); */
    /* shadow-gray-900 */
    width: 100%;
    display: flex;
    /* border: 1px solid; */
    border-top-right-radius: 4px;
    border-top-left-radius: 4px;
    position: relative;
}

.select-depart-input {
    width: 100%;
    border: none;
    outline: none;
    background: transparent;
    color: currentColor;
    padding-top: 0px;
    padding-left: 0px;
    padding-right: 0px;
    padding-bottom: 0px;
}

.select-depart-input:focus {
    border: none;
    outline: none;
    @apply ring-0;
}

.ring-0 {
    --tw-ring-offset-shadow: var(--tw-ring-inset) 0 0 0 var(--tw-ring-offset-width) var(--tw-ring-offset-color);
    --tw-ring-shadow: var(--tw-ring-inset) 0 0 0 calc(0px + var(--tw-ring-offset-width)) var(--tw-ring-color);
    box-shadow: var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow, 0 0 #0000);
}

.icon-container {
    position: absolute;
    left: 10px;
    top: 11px;
    display: flex;
    align-items: center;
}

.search-icon {
    background-color: #14b8a6;
    color: white;
    padding: 4px;
    border-radius: 50%;
    width: 22px;
    height: 22px;
}

.selection-container {
    display: flex;
    gap: 6px;
    padding: 6px;
    width: 100%;
    overflow-y: auto;
    height: 48px;
}

.selection-item {
    display: flex;
    align-items: center;
    background-color: rgba(20, 184, 166, 0.8);
    padding: 5px 10px;
    border-radius: 4px;
    color: white;
}

.close-btn {
    margin-left: 8px;
    background-color: rgba(55, 65, 81, 0.3);
    border-radius: 4px;
    padding: 2px;
}

.close-icon {
    width: 16px;
    height: 16px;
}

.dropdown {
    width: 100%;
    max-height: 150px;
    overflow-y: auto;
    border-radius: 0 0 4px 4px;
    /* box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2); */
    padding-bottom: 3px;
}

.dropdown-expanded {
    top: 93px;
}

.department-list {
    display: flex;
    flex-direction: column;
    width: 100%;
}

.grid-container {
    display: grid;
    gap: 1px;
    width: 100%;
}

.two-columns {
    grid-template-columns: repeat(2, 1fr);
}

.department-item {
    /* padding: 8px; */
    cursor: pointer;
    width: 100%;
    align-items: center;
    display: flex;
}

.department-name {
    padding: 8px;
}

.selected {
    background-color: rgba(20, 184, 166, 0.8);
}

.infinite-loading {
    padding: 12px;
}

.no-departments {
    display: flex;
    justify-content: center;
    padding: 12px;
}

.loading-spinner {
    display: flex;
    justify-content: center;
    padding: 12px;
}

@keyframes loader-rotate {
    0% {
        transform: rotate(0);
    }

    100% {
        transform: rotate(360deg);
    }
}

.loader {
    width: 24px;
    height: 24px;
    border: 4px solid #14b8a6;
    border-right-color: transparent;
    border-radius: 50%;
    animation: loader-rotate 1s linear infinite;
}

.select-dropdown {
    cursor: pointer;
    text-transform: capitalize;
    appearance: none;
    text-align: center;
    border-radius: 0.3rem;
    padding-left: 0.20rem;
    padding: 0.20rem;
    width: 100%;
    font-size: 0.875rem
        /* 14px */
    ;
    line-height: 1.25rem
        /* 20px */
    ;
}
</style>
