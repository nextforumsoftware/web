<template>
  <q-badge
    rounded
    class="q-px-sm q-py-xs text-weight-bold"
    :color="settings.color"
    :text-color="settings.textColor"
    :label="settings.label"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import {
  getSituacaoParcelaSettings,
  type SituacaoParcelaEnum,
} from '@/types/financeiro/Honorario'

const props = defineProps<{
  situacao: SituacaoParcelaEnum
}>()

const settings = computed(() => getSituacaoParcelaSettings(props.situacao))
</script>
