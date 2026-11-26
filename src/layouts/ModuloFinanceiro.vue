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
        caption="Gestão"
        titulo="Financeira"
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
  {
    icon: 'request_quote',
    label: 'Contas a receber',
    route: '/app/financeiro',
  },
  {
    icon: 'handshake',
    label: 'Honorários',
    route: '/app/financeiro/honorarios',
  },
]
</script>
