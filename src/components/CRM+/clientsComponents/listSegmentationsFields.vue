<script setup>
import { onMounted, ref, watch } from "vue";
import { segmentation_field } from "~/utils/systemUrls.js";
import api from "~/utils/api.js";
import SimpleLoader from "../../loaders/simpleLoader.vue";

const props = defineProps({
  modelValue: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits(["update:modelValue"]);

const segmentationsFields = ref(deepClone(props.modelValue));
const loading = ref(false);

function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

const getSegmentationsFields = async () => {
  try {
    loading.value = true;
    const response = await api.get(segmentation_field);
    segmentationsFields.value = response.data;
  } catch (error) {
    console.error("Error fetching segmentation fields:", error);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  if (props.modelValue.length === 0) {
    getSegmentationsFields();
  }

  segmentationsFields.value.forEach((field) => {
    if (field.type === "bool") {
      field.content = field.content === "True" ? true : false;
    }
  });
});

watch(
  segmentationsFields,
  (newVal) => {
    if (JSON.stringify(newVal) !== JSON.stringify(props.modelValue)) {
      emit("update:modelValue", deepClone(newVal));
    }
  },
  { deep: true },
);
</script>

<template>
  <div
    v-if="loading"
    class="flex items-center justify-center overflow-hidden h-full"
  >
    <SimpleLoader />
  </div>

  <div v-else-if="segmentationsFields.length > 0">
    <header style="z-index: 9999" class="header-segmentation-fields">
      <p class="text-xs font-semibold">Campos Personalizados</p>
    </header>

    <div class="flex flex-col gap-2 p-2">
      <section v-for="field in segmentationsFields" :key="field.id">
        <div
          :class="[
            'flex w-full gap-1.5 rounded-md',
            field.type === 'bool'
              ? 'flex-row items-center'
              : 'flex-col items-start',
          ]"
        >
          <template v-if="field.type === 'bool'">
            <input
              :id="'seg-label-' + field.id"
              class="checkbox size-4 rounded-sm"
              type="checkbox"
              v-model="field.content"
            />
          </template>

          <label
            :for="'seg-label-' + field.id"
            class="text-xs text-[12px] font-sans font-semibold"
            :title="
              field.type === 'string'
                ? 'texto'
                : field.type === 'bool'
                  ? 'verdadeiro/falso'
                  : field.type === 'float'
                    ? 'número'
                    : field.type === 'list'
                      ? 'lista'
                      : 'Desconhecido'
            "
          >
            {{ field.name }}
          </label>

          <template v-if="field.type === 'string'">
            <textarea
              :id="'seg-label-' + field.id"
              placeholder="campo do tipo texto"
              class="input_field"
              type="text"
              v-model="field.content"
            />
          </template>

          <template v-if="field.type === 'float'">
            <input
              :id="'seg-label-' + field.id"
              placeholder="campo do tipo número"
              class="input_field"
              type="number"
              v-model="field.content"
            />
          </template>

          <template v-if="field.type === 'list'">
            <SimpleSelect
              v-model="field.content"
              :options="
                field.additional_info.list.options.map((option) => ({
                  value: option,
                  name: option,
                }))
              "
              placeholder="Selecione uma opção"
              theme="bg-base-300 border-base-100 text-white"
              teleport-to="body"
            />
          </template>
        </div>
      </section>
    </div>
  </div>

  <section
    v-else
    class="flex-1 justify-center items-center flex flex-col gap-2 h-full"
  >
    <p class="text-gray-200 text-xs md:text-base font-sans">
      Nenhum item encontrado
    </p>
    <p class="text-gray-200 text-[10px] md:text-xs font-sans">
      Comece criando seu primeiro na aba <strong>Campos Personalizados</strong>
    </p>
  </section>
</template>

<style scoped>
.header-segmentation-fields {
  position: sticky;
  background-color: #26343d;
  top: 0px;
  text-align: start;
  width: 100%;
  align-items: center;
  justify-content: space-between;
  display: flex;
  padding-left: 0.5rem;
  padding-right: 0.5rem;
  padding-top: 0.5rem;
  padding-bottom: 0.5rem;
}

.input_field {
  @apply w-full text-xs bg-base-300 rounded-md outline-none border-none focus:outline-none focus:ring-0 focus:shadow-none placeholder:text-gray-400 h-10 p-3;
}

::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, #334155, #1e293b);
  border-radius: 8px;
  transition: background 0.2s ease;
}

::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(180deg, #475569, #1e293b);
}

::-webkit-scrollbar-track {
  background: transparent;
}

/* Para Firefox */
* {
  scrollbar-width: thin;
  scrollbar-color: #334155 transparent;
}

/* Remove as setinhas do input type=number */
input[type="number"]::-webkit-outer-spin-button,
input[type="number"]::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

input[type="number"] {
  -moz-appearance: textfield; /* Remove no Firefox */
}
</style>
