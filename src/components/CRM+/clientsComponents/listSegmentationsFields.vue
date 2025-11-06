

<script setup>
import { ref, watch } from "vue";

const props = defineProps({
  // --- Lista que será exibida e já selecionada ---
  modelValue: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits(["update:modelValue"]);

const segmentationsFields = ref([...props.modelValue]);

watch(
  segmentationsFields,
  (newVal) => {
    emit("update:modelValue", newVal);
  },
  { deep: true }
);
</script>

<template>
  <div class="test-style p-2 h-full overflow-auto">
    <header
      class="text-start w-full items-center justify-between flex mb-2 px-1"
    >
      <p class="text-sm font-semibold">Campos Personalizados</p>
    </header>

    <div class="flex flex-col gap-2">
      <section v-for="field in segmentationsFields" :key="field.id">
        <div
          :class="[
            'flex gap-1  rounded-md',
            field.type === 'bool'
              ? 'flex-row items-center'
              : 'flex-col items-start',
          ]"
        >
          <template v-if="field.type === 'bool'">
            <input
              class="checkbox size-4 rounded-sm"
              type="checkbox"
              v-model="field.content"
            />
          </template>

          <p class="text-[10px] font-sans">{{ field.name }}:</p>

          <template v-if="field.type === 'string'">
            <input class="input_field" type="text" v-model="field.content" />
          </template>

          <template v-if="field.type === 'float'">
            <input class="input_field" type="number" v-model="field.content" />
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
              theme="bg-base-300 border-base-100"
              teleport-to="body"
            />
          </template>
        </div>
      </section>
    </div>
  </div>
</template>
    

<style scoped>
.input_field {
  @apply w-full text-xs bg-base-300 rounded-md p-3 outline-none border-none focus:outline-none focus:ring-0 focus:shadow-none placeholder:text-gray-500;
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
</style>