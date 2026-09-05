<template>
  <q-icon
    v-if="detalhes?.length"
    name="info"
    size="18px"
    color="blue-7"
    @mouseenter="hovered = true"
    @mouseleave="hovered = false"
  >
    <q-popup-proxy :model-value="hovered">
      <div
        class="column q-pa-md gap-xs"
        style="max-width: 400px"
      >
        <span
          v-for="detalhe in detalhes"
          :key="detalhe.id"
          class="text-grey-8"
        >
          {{ complementoLabel(detalhe) }}
        </span>
      </div>
    </q-popup-proxy>
  </q-icon>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { DetalheMovimento } from '@/types/processos/MovimentoProcesso'
import { complementoLabel } from '@/utils/movimento'

defineProps<{ detalhes?: DetalheMovimento[] }>()

const hovered = ref(false)
</script>
