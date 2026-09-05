<template>
  <div class="base-select column full">
    <p class="text-terciary text-bold q-mb-xs">
      {{ label }}
    </p>

    <q-select
      v-model="model"
      class="full-width"
      :options="options"
      :outlined="outlined"
      :dense="dense"
      :rules="rules"
      :hint="hint"
      :option-value="optionValue"
      :option-label="optionLabel"
      :emit-value="emitValue"
      :map-options="mapOptions"
      :clearable="clearable"
      :multiple="multiple"
      :use-chips="useChips"
      hide-bottom-space
      :bg-color="bgColor"
    >
      <template v-if="$slots.append" #append>
        <slot name="append" />
      </template>

      <template v-if="$slots.prepend" #prepend>
        <slot name="prepend" />
      </template>

      <template v-if="$slots.option" #option="scope">
        <slot name="option" v-bind="scope" />
      </template>
    </q-select>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { QSelectProps } from 'quasar'

const props = withDefaults(
  defineProps<{
    modelValue: any
    label: string
    options: QSelectProps['options']
    outlined?: boolean
    dense?: boolean
    hint?: string
    rules?: QSelectProps['rules']
    optionValue?: string
    optionLabel?: string
    emitValue?: boolean
    mapOptions?: boolean
    clearable?: boolean
    multiple?: boolean
    useChips?: boolean
    bgColor?: string
  }>(),
  {
    outlined: true,
    dense: true,
    emitValue: true,
    mapOptions: true,
    clearable: false,
    multiple: false,
    useChips: false
  }
)

const emit = defineEmits<{
  (e: 'update:modelValue', value: any): void
}>()

const model = computed({
  get: () => props.modelValue,
  set: (val: any) => emit('update:modelValue', val)
})
</script>