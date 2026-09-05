<template>
  <q-scroll-area class="fit">
    <div class="menu-header">
      <div class="menu-title-container">
        <span
          v-if="caption"
          class="menu-caption"
          >{{ caption }}</span
        >
        <h1 class="menu-title">{{ titulo }}</h1>
      </div>
    </div>

    <q-list
      v-for="item in itensVisiveis"
      :key="item.route"
    >
      <q-item
        v-ripple
        clickable
        active-class="text-weight-bold text-primary"
        :active="isAtivo(item)"
        :disable="item.disabled"
        @click="onItem(item)"
      >
        <q-item-section
          avatar
          class="row items-center"
        >
          <q-icon
            :name="item.icon"
            size="24px"
          />
        </q-item-section>
        <q-item-section no-wrap>
          <q-item-label class="row items-center gap-sm">
            {{ item.label }}
            <q-badge
              v-if="item.novo"
              color="secondary"
              label="Novo"
            />
          </q-item-label>
        </q-item-section>
      </q-item>

      <div
        v-if="item.children"
        class="q-ml-sm"
      >
        <q-list
          v-for="child in item.children"
          :key="child.route"
          dense
        >
          <q-item
            v-if="!child.invisible"
            v-ripple
            clickable
            class="item-border"
            active-class="text-weight-bold text-primary"
            :active="isAtivo(child)"
            :disable="child.disabled || item.disabled"
            @click="onItem(child)"
          >
            <q-item-section
              avatar
              class="row items-center avatar-padding"
            >
              <q-icon
                name="remove"
                size="14px"
                class="text-grey-5"
              />
            </q-item-section>
            <q-item-section no-wrap>
              <q-item-label>{{ child.label }}</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </div>
    </q-list>

    <div class="bottom-padding" />
  </q-scroll-area>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

export interface MenuItem {
  label: string
  route: string
  icon?: string
  novo?: boolean
  disabled?: boolean
  invisible?: boolean
  children?: MenuItem[]
}

const props = defineProps<{
  titulo: string
  caption?: string
  itens: MenuItem[]
}>()

const route = useRoute()
const router = useRouter()

const itensVisiveis = computed(() =>
  props.itens.filter((item) => !item.invisible),
)

const rotaAtiva = computed(() => {
  const caminhos = props.itens.flatMap((item) => [
    item.route,
    ...(item.children ?? []).map((child) => child.route),
  ])

  const casados = caminhos.filter(
    (caminho) => route.path === caminho || route.path.startsWith(`${caminho}/`),
  )

  return casados.sort(
    (caminhoA, caminhoB) => caminhoB.length - caminhoA.length,
  )[0]
})

function isAtivo(item: MenuItem): boolean {
  if (rotaAtiva.value === item.route) return true

  return (item.children ?? []).some((child) => child.route === rotaAtiva.value)
}

function onItem(item: MenuItem) {
  const primeiroFilho = item.children?.find((child) => !child.invisible)
  router.push(primeiroFilho ? primeiroFilho.route : item.route)
}
</script>

<style scoped lang="scss">
:deep(.q-scrollarea__thumb) {
  width: 4px;
  opacity: 0.1;
  transition: opacity 0.3s;

  &:hover {
    opacity: 0.3;
  }
}

:deep(.q-scrollarea__bar) {
  width: 4px;
}

h1 {
  all: unset;
}

.menu-header {
  display: flex;
  flex-direction: row;
  gap: 8px;
  margin: 32px 32px 18px 32px;
}

.menu-title-container {
  display: flex;
  flex-direction: column;
}

.menu-caption {
  font-weight: 400;
  text-transform: uppercase;
  font-size: 10px;
  color: #757575;
}

.menu-title {
  font-weight: 700;
  font-size: 20px;
  color: #424242;
}

.item-border {
  border-radius: 15px 0px 0px 15px;
}

.avatar-padding {
  padding-right: 0px;
  padding-left: 12px;
}

.bottom-padding {
  padding-bottom: 18px;
}
</style>
