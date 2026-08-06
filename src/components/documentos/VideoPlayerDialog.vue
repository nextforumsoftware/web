<template>
  <q-dialog
    v-model="model"
    transition-show="fade"
    transition-hide="fade"
  >
    <q-card class="column no-wrap bg-black video-dialog-card">
      <div
        class="row items-center no-wrap q-px-md bg-grey-9 text-white"
        style="height: 56px; flex-shrink: 0; gap: 12px"
      >
        <div
          class="row items-center col no-wrap"
          style="min-width: 0"
        >
          <q-icon
            name="movie"
            size="20px"
            color="purple-4"
            class="q-mr-sm"
            style="flex-shrink: 0"
          />
          <span class="text-body2 ellipsis">{{ arquivo?.nome }}</span>
        </div>

        <div
          class="row items-center justify-end no-wrap"
          style="gap: 4px"
        >
          <q-btn
            dense
            flat
            round
            icon="download"
            size="sm"
            :disable="!videoUrl"
            @click="downloadFile"
          >
            <q-tooltip
              anchor="bottom middle"
              self="top middle"
              >Baixar</q-tooltip
            >
          </q-btn>

          <q-separator
            vertical
            dark
            inset
            class="q-mx-xs"
          />

          <q-btn
            dense
            flat
            round
            icon="close"
            size="sm"
            v-close-popup
            class="q-mr-lg"
          >
            <q-tooltip
              anchor="bottom middle"
              self="top middle"
              >Fechar</q-tooltip
            >
          </q-btn>
        </div>
      </div>

      <div
        class="col flex flex-center"
        style="overflow: hidden; position: relative"
      >
        <video
          v-if="videoUrl"
          :src="videoUrl"
          controls
          autoplay
          style="max-width: 100%; max-height: 100%"
        />

        <div
          v-else-if="loading"
          class="flex flex-center"
          style="height: 100%"
        >
          <div class="column items-center q-gutter-y-md">
            <q-spinner
              size="48px"
              color="primary"
            />
            <span class="text-grey-4">Carregando vídeo...</span>
          </div>
        </div>

        <div
          v-else
          class="flex flex-center"
          style="height: 100%"
        >
          <span class="text-grey-4">Não foi possível carregar o vídeo.</span>
        </div>
      </div>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import type { Arquivo } from '@/types/arquivos/Arquivo'

const props = defineProps<{
  modelValue: boolean
  arquivo: Arquivo | null
  videoUrl: string | null
  loading: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
}>()

const model = ref(props.modelValue)
watch(
  () => props.modelValue,
  (value) => (model.value = value),
)
watch(model, (value) => emit('update:modelValue', value))

function downloadFile() {
  if (!props.videoUrl || !props.arquivo) return
  const anchor = document.createElement('a')
  anchor.href = props.videoUrl
  anchor.download = props.arquivo.nome
  anchor.click()
}
</script>

<style scoped>
.video-dialog-card {
  width: 85vw;
  max-width: 85vw;
  height: 90vh;
}
</style>
