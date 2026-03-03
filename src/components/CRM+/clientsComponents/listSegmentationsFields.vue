<script setup>
import { nextTick, onMounted, ref, watch } from "vue";
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
const fieldsRoot = ref(null);

function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

function normalizeBool(value) {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value === 1;
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (["true", "1", "yes", "y", "sim"].includes(normalized)) return true;
    if (["false", "0", "no", "n", "nao", "não"].includes(normalized))
      return false;
  }
  return false;
}

function normalizeFields(fields) {
  if (!Array.isArray(fields)) return;
  fields.forEach((field) => {
    if (field?.type === "bool") {
      field.content = normalizeBool(field.content);
    }
  });
}

function hasFieldValue(value) {
  return value !== null && value !== undefined && String(value).trim() !== "";
}

function getFieldTypeTitle(type) {
  if (type === "string") return "texto";
  if (type === "float") return "número";
  if (type === "list") return "lista";
  return "Desconhecido";
}

function resizeTextarea(textareaEl) {
  if (!textareaEl) return;

  textareaEl.style.height = "auto";
  const minHeight =
    parseFloat(window.getComputedStyle(textareaEl).minHeight) || 0;
  textareaEl.style.height = `${Math.max(textareaEl.scrollHeight, minHeight)}px`;
}

function autoResizeTextarea(event) {
  resizeTextarea(event?.target);
}

function syncTextareasHeight() {
  if (!fieldsRoot.value) return;

  fieldsRoot.value
    .querySelectorAll("textarea.floating-textarea")
    .forEach((textareaEl) => resizeTextarea(textareaEl));
}

const getSegmentationsFields = async () => {
  try {
    loading.value = true;
    const response = await api.get(segmentation_field);
    segmentationsFields.value = response.data;
    normalizeFields(segmentationsFields.value);
    await nextTick();
    syncTextareasHeight();
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

  normalizeFields(segmentationsFields.value);
  nextTick(syncTextareasHeight);
});

watch(
  () => props.modelValue,
  (newVal) => {
    segmentationsFields.value = deepClone(newVal);
    normalizeFields(segmentationsFields.value);
    nextTick(syncTextareasHeight);
  },
  { deep: true },
);

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

  <div v-else-if="segmentationsFields.length > 0" ref="fieldsRoot">
    <header class="header-segmentation-fields bg-base-200">
      <p class="text-[13px] font-semibold">Campos Personalizados</p>
    </header>

    <div class="segmentation-fields-list">
      <section v-for="field in segmentationsFields" :key="field.id">
        <div
          :class="[
            'segmentation-field-row',
            field.type === 'bool'
              ? 'segmentation-field-row--bool'
              : 'segmentation-field-row--input',
          ]"
        >
          <template v-if="field.type === 'bool'">
            <label
              :for="'seg-label-' + field.id"
              class="bool-field bg-base-300 @apply shadow shadow-gray-900 dark:shadow-gray-400"
              title="verdadeiro/falso"
            >
              <span class="bool-field-title">{{ field.name }}</span>
              <input
                :id="'seg-label-' + field.id"
                class="bool-switch-input"
                type="checkbox"
                v-model="field.content"
              />
            </label>
          </template>

          <template v-else-if="field.type === 'list'" class="relative">
            <label
              :for="'seg-label-' + field.id"
              class="field-caption"
              :title="getFieldTypeTitle(field.type)"
            >
              {{ field.name }}
            </label>

            <SimpleSelect
              :id="'seg-label-' + field.id"
              v-model="field.content"
              :options="
                field.additional_info.list.options.map((option) => ({
                  value: option,
                  name: option,
                }))
              "
              placeholder="Selecione uma opção"
              :overlay="true"
              theme="bg-base-300 border-base-300"
            />
          </template>

          <template v-else>
            <div
              class="floating-control"
              :class="{ 'has-value': hasFieldValue(field.content) }"
            >
              <template v-if="field.type === 'string'">
                <textarea
                  :id="'seg-label-' + field.id"
                  class="floating-input bg-base-300 floating-textarea"
                  placeholder=" "
                  rows="1"
                  v-model="field.content"
                  @input="autoResizeTextarea"
                />
              </template>

              <template v-else-if="field.type === 'float'">
                <input
                  :id="'seg-label-' + field.id"
                  class="floating-input bg-base-300"
                  type="number"
                  step="any"
                  placeholder=" "
                  v-model="field.content"
                />
              </template>

              <label
                :for="'seg-label-' + field.id"
                class="floating-label"
                :title="getFieldTypeTitle(field.type)"
              >
                {{ field.name }}
              </label>
            </div>
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
  backdrop-filter: blur(6px);
}

.segmentation-field-row {
  width: 100%;
  border-radius: 0.65rem;
  background: transparent;
}

.segmentation-field-row--bool {
  padding: 0.25rem 0.2rem 0.2rem;
}

.segmentation-field-row--input {
  padding: 0.25rem 0.2rem 0.2rem;
}

.segmentation-fields-list {
  display: flex;
  flex-direction: column;
  gap: 0rem;
  padding: 0.1rem 0.35rem 0.5rem;
}

.bool-field {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.65rem;
  min-height: 2.9rem;
  padding: 0.62rem 0.75rem;
  cursor: pointer;
  user-select: none;
  @apply rounded-md;
}

.bool-field-title {
  font-size: 0.76rem;
  font-weight: 600;
  line-height: 1.2rem;
}

.bool-switch-input {
  width: 2.35rem;
  height: 1.35rem;
  border-radius: 9999px;
  background-color: rgb(71 85 105 / 0.82);
  appearance: none;
  cursor: pointer;
  transition:
    background-color 0.2s ease,
    border-color 0.2s ease;
  position: relative;
}

.bool-switch-input::before {
  content: "";
  position: absolute;
  top: 50%;
  left: 0.18rem;
  width: 0.9rem;
  height: 0.9rem;
  border-radius: 9999px;
  background-color: rgb(248 250 252 / 0.96);
  box-shadow: 0 1px 4px rgb(0 0 0 / 0.35);
  transform: translateY(-50%);
  transition: transform 0.2s ease;
}

.bool-switch-input:checked {
  border-color: rgb(20 184 166 / 0.52);
  background: linear-gradient(
    120deg,
    rgb(20 184 166 / 0.95),
    rgb(16 185 129 / 0.9)
  );
}

.bool-switch-input:checked::before {
  transform: translate(1rem, -50%);
}

.bool-switch-input:focus-visible {
  outline: 2px solid rgb(56 189 248 / 0.65);
  outline-offset: 2px;
}

.field-caption {
  display: block;
  margin-bottom: 0.35rem;
  padding-left: 0.35rem;
  font-size: 0.73rem;
  font-weight: 600;
}

.floating-control {
  width: 100%;
  position: relative;
}

.floating-input {
  width: 100%;
  outline: none;
  font-size: 0.8rem;
  line-height: 1.2rem;
  min-height: 2.9rem;
  padding: 1.1rem 0.75rem 0.48rem;
  border-style: none;
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease,
    background-color 0.2s ease;
  @apply rounded-md shadow shadow-gray-900 dark:shadow-gray-400;
}

.floating-input::placeholder {
  color: transparent;
}

.floating-input:focus {
  border-color: rgb(45 212 191 / 0.62);
  box-shadow: 0 0 0 3px rgb(45 212 191 / 0.14);
  border-style: none;
}

.floating-textarea {
  min-height: 2.9rem;
  height: auto;
  display: block;
  overflow-y: hidden;
  resize: none;
}

.floating-label {
  position: absolute;
  left: 0.62rem;
  top: 50%;
  transform: translateY(-50%);
  font-size: 0.76rem;
  line-height: 1rem;
  pointer-events: none;
  max-width: calc(100% - 1.2rem);
  overflow: hidden;
  text-overflow: ellipsis;
  opacity: 60%;
  white-space: nowrap;
  transition:
    top 0.18s ease,
    transform 0.18s ease,
    font-size 0.18s ease,
    color 0.18s ease,
    background-color 0.18s ease;
  padding: 0 0.2rem;
}

.floating-control.has-value .floating-label,
.floating-input:focus + .floating-label,
.floating-input:not(:placeholder-shown) + .floating-label {
  top: 0.26rem;
  transform: translateY(0);
  font-size: 0.64rem;
  border-radius: 0.25rem;
}

@media (max-width: 767px) {
  .segmentation-fields-list {
    padding: 0.48rem 0.45rem 0.42rem;
  }

  .segmentation-field-row--bool {
    padding: 0.4rem 0.15rem 0.18rem;
  }

  .segmentation-field-row--input {
    padding: 0.4rem 0.15rem 0.18rem;
  }
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
