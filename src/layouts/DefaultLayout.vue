<template>
  <q-layout
    view="hHh LpR fFf"
    class="bg-grey-2"
  >
    <q-header class="bg-primary text-white">
      <q-toolbar style="height: 80px">
        <q-toolbar-title class="q-ml-lg text-bold"> NEXTFORUM </q-toolbar-title>

        <div
          class="row items-center"
          style="gap: 12px"
        >
          <span
            class="text-white"
            style="font-size: 14px; font-weight: 500"
            >{{ nameUserAuth }}</span
          >

          <q-btn
            flat
            round
            dense
            :padding="fotoUsuario ? '2px' : undefined"
            :icon="fotoUsuario ? undefined : 'account_circle'"
          >
            <div
              v-if="fotoUsuario"
              class="toolbar-avatar"
              :style="{ backgroundImage: `url(${fotoUsuario})` }"
            />
            <q-menu>
              <q-list style="min-width: 170px">
                <q-item
                  clickable
                  v-close-popup
                  :to="{ name: 'perfil' }"
                >
                  <q-item-section avatar>
                    <q-icon name="manage_accounts" />
                  </q-item-section>
                  <q-item-section>Meu perfil</q-item-section>
                </q-item>

                <q-separator />

                <q-item
                  clickable
                  v-close-popup
                  @click="logout"
                >
                  <q-item-section avatar>
                    <q-icon name="logout" />
                  </q-item-section>
                  <q-item-section>Sair</q-item-section>
                </q-item>
              </q-list>
            </q-menu>
          </q-btn>
        </div>
      </q-toolbar>
    </q-header>

    <q-drawer
      v-model="drawer"
      show-if-above
      :mini="miniState"
      :width="310"
      :mini-width="88"
      :breakpoint="599"
      bordered
      class="bg-primary text-white"
      @mouseenter="onMouseenter"
      @mouseleave="onMouseleave"
    >
      <q-scroll-area
        class="fit"
        :horizontal-thumb-style="{ opacity: '0' }"
      >
        <div class="drawer-wrapper">
          <div class="drawer-list">
            <q-btn
              v-for="item in menuItems"
              :key="item.route"
              :icon="item.icon"
              :label="miniState ? undefined : item.label"
              :class="{ active: currentRoute.startsWith(item.route) }"
              class="menu-button"
              flat
              no-caps
              :to="{ name: item.route }"
            />
          </div>
        </div>
      </q-scroll-area>
    </q-drawer>

    <q-page-container>
      <div
        class="q-pa-lg q-mx-auto"
        style="max-width: 1200px"
      >
        <router-view />
      </div>
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useNotification } from '@/composables/useNotification'
import { useAuthService } from '@/services/api/auth.service'
import { onMounted } from 'vue'

const authService = useAuthService()
const notification = useNotification()
const router = useRouter()
const route = useRoute()

const drawer = ref(false)
const miniState = ref(true)
const nameUserAuth = ref('Bem Vindo!')
const fotoUsuario = ref<string>('')
const hoverTimeout = ref<ReturnType<typeof setTimeout> | null>(null)

const currentRoute = computed(() => (route.name as string) ?? '')

const menuItems = [
  { icon: 'home', label: 'Home', route: 'home' },
  { icon: 'group', label: 'Clientes', route: 'clientes' },
  { icon: 'work', label: 'Processos', route: 'processos' },
  { icon: 'event_available', label: 'Prazos', route: 'prazos' },
  { icon: 'folders', label: 'Documentos', route: 'pastas' },
  { icon: 'task', label: 'Modelos de Petição', route: 'peticoes' },
  {
    icon: 'menu_book',
    label: 'Jurisprudência',
    route: 'jurisprudencia-biblioteca',
  },
  { icon: 'timeline', label: 'Timeline', route: 'timelines' },
  { icon: 'settings', label: 'Configurações', route: 'configuracoes-usuarios' },
]

function onMouseenter() {
  hoverTimeout.value = setTimeout(() => {
    miniState.value = false
  }, 200)
}

function onMouseleave() {
  if (hoverTimeout.value) {
    clearTimeout(hoverTimeout.value)
    hoverTimeout.value = null
  }
  miniState.value = true
}

async function fetchUsuario() {
  const response = await authService.refresh()
  nameUserAuth.value = response.user.nome
  fotoUsuario.value = response.user.fotoPerfil ?? ''
}

onMounted(fetchUsuario)

watch(() => route.name, fetchUsuario)

function logout() {
  try {
    authService.logout()
    router.push({ name: 'login' })
  } catch {
    notification.error('Erro ao fazer logout')
  }
}
</script>

<style scoped lang="scss">
.toolbar-avatar {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  border: 2px solid rgba(255, 255, 255, 0.5);
}

.drawer-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  height: 100%;
  padding: 12px;
}

.drawer-divider {
  width: 100%;
  height: 1px;
  background-color: rgba(255, 255, 255, 0.25);
  margin: 8px 0 16px;
}

.drawer-section-label {
  width: 100%;
  padding-left: 10px;
  margin-bottom: 4px;
  font-size: 10px;
  font-weight: 400;
  color: rgba(255, 255, 255, 0.7);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.drawer-list {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  gap: 4px;
}

.menu-button {
  width: 100%;
  height: 56px;
  color: white;
  border-radius: 16px;
  font-weight: 400;

  :deep(.q-btn__content) {
    justify-content: flex-start;
    gap: 6px;
    padding-left: 4px;
    flex-wrap: nowrap;

    .q-icon {
      flex-shrink: 0;
    }

    .block {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      min-width: 0;
    }
  }

  &.active {
    font-weight: 600;
    background-color: var(--q-secondary);
  }

  &:hover:not(.active) {
    background-color: rgba(255, 255, 255, 0.1);
  }
}
</style>
