<template>
  <div class="base-input column full">
    <p class="text-terciary text-bold q-mb-xs">
      {{ label }}
    </p>

    <q-input
      :dense="dense"
      :outlined="outlined"
      v-model="model"
      class="full-width"
      mask="##/##/####"
      :rules="rules"
      :hint="hint"
      hide-bottom-space
    >
      <template v-slot:append>
        <q-icon
          name="event"
          class="cursor-pointer"
        >
          <q-popup-proxy
            cover
            transition-show="scale"
            transition-hide="scale"
          >
            <q-date
              v-model="model"
              mask="DD/MM/YYYY"
              style="min-width: 320px"
              today-btn
            >
              <div class="row items-center justify-end q-gutter-x-sm">
                <q-btn
                  v-close-popup
                  label="Fechar"
                  color="red"
                  flat
                />
              </div>
            </q-date>
          </q-popup-proxy>
        </q-icon>
      </template>
    </q-input>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { QInputProps } from 'quasar'

const props = defineProps<{
  modelValue: string | null
  label: string
  type?: QInputProps['type']
  outlined?: boolean
  dense?: boolean
  mask?: string
  hint?: string
  rules?: QInputProps['rules']
  inputName?: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const model = computed({
  get: () => props.modelValue,
  set: (val: string) => emit('update:modelValue', val),
})
</script>
