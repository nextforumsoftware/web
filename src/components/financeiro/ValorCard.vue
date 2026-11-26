<template>
  <q-card
    flat
    bordered
  >
    <q-card-section class="column gap-sm">
      <q-avatar
        rounded
        size="40px"
        font-size="22px"
        :icon="icon"
        :color="color"
        :text-color="textColor"
      />
      <div
        class="text-h6 text-weight-bold"
        :class="`text-${textColor}`"
      >
        {{ valor }}
      </div>
      <div class="text-weight-bold text-grey-9">{{ label }}</div>
      <div
        v-if="legenda"
        class="text-caption text-grey-7"
      >
        {{ legenda }}
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
defineProps<{
  label: string
  valor: string
  icon: string
  color: string
  textColor: string
  legenda?: string
}>()
</script>
