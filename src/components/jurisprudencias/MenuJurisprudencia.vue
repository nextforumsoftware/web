<template>
  <q-btn icon="more_vert" flat round dense @click.stop>
    <q-menu>
      <q-list style="min-width: 160px">
        <q-item v-close-popup clickable @click="emit('onEdit')">
          <q-item-section avatar>
            <q-icon name="edit" color="primary" />
          </q-item-section>
          <q-item-section>Editar</q-item-section>
        </q-item>

        <q-item v-close-popup clickable @click="emit('onOpenSource')">
          <q-item-section avatar>
            <q-icon name="open_in_new" color="primary" />
          </q-item-section>
          <q-item-section>Abrir fonte</q-item-section>
        </q-item>

        <q-separator />

        <q-item v-close-popup clickable @click="emit('onDelete')">
          <q-item-section avatar>
            <q-icon name="delete" color="red-6" />
          </q-item-section>
          <q-item-section class="text-red-6">Excluir</q-item-section>
        </q-item>
      </q-list>
    </q-menu>
  </q-btn>
</template>

<script setup lang="ts">
defineProps<{
  favorito?: boolean
}>()

const emit = defineEmits<{
  (e: 'onEdit'): void
  (e: 'onOpenSource'): void
  (e: 'onDelete'): void
}>()
</script>
