<template>
  <q-layout
    view="lHh Lpr lFf"
    container
  >
    <q-drawer
      v-model="drawer"
      show-if-above
      :width="260"
      :breakpoint="1050"
      bordered
      class="bg-white text-grey-8"
    >
      <LayoutMenu
        caption="Gestão de"
        titulo="Processos"
        :itens="itens"
      />
    </q-drawer>

    <q-page-container class="bg-grey-2">
      <div class="container">
        <q-btn
          v-if="$q.screen.lt.md"
          flat
          dense
          no-caps
          icon="menu"
          color="grey-7"
          label="Menu"
          class="q-mt-md q-ml-md"
          @click="drawer = !drawer"
        />

        <router-view />
      </div>
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useQuasar } from 'quasar'
import LayoutMenu, { type MenuItem } from '@/components/generic/LayoutMenu.vue'

const $q = useQuasar()

const drawer = ref(false)

const itens: MenuItem[] = [
  { icon: 'work', label: 'Processos', route: '/app/processos' },
  {
    icon: 'gavel',
    label: 'Movimentações',
    route: '/app/processos/movimentacoes',
    novo: true,
  },
  { icon: 'event_available', label: 'Prazos', route: '/app/processos/prazos' },
  { icon: 'timeline', label: 'Timelines', route: '/app/processos/timelines' },
]
</script>
