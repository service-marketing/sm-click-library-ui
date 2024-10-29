<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { useDepartmentStore } from '~/stores/departmentStore';

const props = defineProps({
    department: { type: Array, default: null },
    modal_filter: { type: String, default: null },
    multiSelect: { type: Boolean, default: true },
    permissions: { type: Boolean, default: true }
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

// Atualiza departamentos selecionados
function updateSelectedDepartments() {
    if (props.department) {
        props.department.forEach((dep) => {
            const exists = departmentSelected.value.some(selected => selected.id === dep.id);
            if (!exists) {
                departmentSelected.value.push({ ...dep, selected: true });
            }
        });
    }
    emit('depart', departmentSelected.value);
}

// Seleção de departamentos
function selectDepartment(department) {
    const index = departmentSelected.value.findIndex(dep => dep.id === department.id);
    if (index !== -1) {
        department.selected = false;
        departmentSelected.value.splice(index, 1);
    } else {
        if (!props.multiSelect && departmentSelected.value.length > 0) {
            departmentSelected.value[0].selected = false;
            departmentSelected.value = [];
        }
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
    <div class="container">
        <div class="search-container relative">
            <div class="input-wrapper bg-base-100 border-b border-base-200" @click="open_select = !open_select"
                :class="{ 'expanded': open_select || departmentSelected.length > 0 }">
                <input v-model="searchInput" :placeholder="departmentSelected.length > 0
                    ? (multiSelect
                        ? `Selecionados: ${departmentSelected.length}`
                        : `Selecionado: ${departmentSelected[0].name}`)
                    : 'Pesquise por nome.'" class="search-input " />
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
                class="dropdown">
                <div class="department-list bg-base-300">
                    <div :class="{ 'two-columns': filteredDepartments.length > 4 }" class="grid-container">
                        <div v-for="department in filteredDepartments" :key="department.id"
                            :class="{ 'selected': department.selected }"
                            class="department-item line-clamp-1 bg-slate-500/20 hover:bg-teal-600">
                            <span @click="selectDepartment(department)" class="department-name w-full">{{
                                department.name }}</span>
                            <div v-if="multiSelect && permissions" style="width: 150px;">
                                <select v-model="department.permission"
                                    class="select-dropdown bg-base-300">
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
.container {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
}

.search-container {
    width: 100%;
}

.input-wrapper {
    padding: 10px;
    padding-left: 40px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.5);
    /* shadow-gray-900 */
    width: 100%;
    display: flex;
    /* border: 1px solid; */
    border-top-right-radius: 4px;
    border-top-left-radius: 4px;
    position: relative;
}

.search-input {
    width: 100%;
    border: none;
    outline: none;
    background: transparent;
    color: currentColor;
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
    position: absolute;
    top: 45px;
    width: 100%;
    max-height: 150px;
    overflow-y: auto;
    background-color: #e5e7eb;
    border-radius: 0 0 4px 4px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2);
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
    padding: 8px;
    cursor: pointer;
    width: 100%;
    align-items: center;
    display: flex;
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
    font-size: 0.875rem /* 14px */;
    line-height: 1.25rem /* 20px */;
}
</style>
