import { useAuth } from '@/composables/useAuth'
import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: () => import('@/layouts/LoginLayout.vue'),
      meta: { requiresAuth: false },
      children: [
        {
          path: '',
          name: 'login',
          component: () => import('@/pages/auth/LoginPage.vue'),
        },
      ],
    },
    {
      path: '/app',
      component: () => import('@/layouts/DefaultLayout.vue'),
      children: [
        {
          path: '',
          redirect: { name: 'home' },
        },
        {
          path: 'home',
          name: 'home',
          component: () => import('@/pages/HomePage.vue'),
          meta: { requiresAuth: true },
        },
        {
          path: 'processos',
          component: () => import('@/layouts/ModuloProcessos.vue'),
          meta: { requiresAuth: true, modulo: true },
          children: [
            {
              path: '',
              name: 'processos',
              component: () => import('@/pages/processos/ProcessosPage.vue'),
            },
            {
              path: 'movimentacoes',
              name: 'processo-movimentacoes',
              component: () =>
                import('@/pages/processos/MovimentacoesPage.vue'),
            },
            {
              path: 'prazos',
              name: 'prazos',
              component: () => import('@/pages/prazos/PrazosPage.vue'),
            },
            {
              path: 'timelines',
              name: 'timelines',
              component: () => import('@/pages/timelines/TimelinesPage.vue'),
            },
            {
              path: 'timelines/:processoId',
              name: 'timeline-gestao',
              component: () =>
                import('@/pages/timelines/TimelineGestaoPage.vue'),
            },
            {
              path: 'novo',
              name: 'processo-form',
              component: () =>
                import('@/pages/processos/ProcessoCadastroEdicao.vue'),
            },
            {
              path: ':id',
              name: 'processo-view',
              component: () =>
                import('@/pages/processos/ProcessoCadastroEdicao.vue'),
            },
          ],
        },
        {
          path: 'prazos',
          redirect: { name: 'prazos' },
        },
        {
          path: 'financeiro',
          component: () => import('@/layouts/ModuloFinanceiro.vue'),
          meta: { requiresAuth: true, modulo: true },
          children: [
            {
              path: '',
              name: 'financeiro-contas-receber',
              component: () =>
                import('@/pages/financeiro/ContasReceberPage.vue'),
            },
            {
              path: 'honorarios',
              name: 'financeiro-honorarios',
              component: () => import('@/pages/financeiro/HonorariosPage.vue'),
            },
            {
              path: 'honorarios/:id',
              name: 'financeiro-honorario-view',
              component: () =>
                import('@/pages/financeiro/HonorarioDetalhePage.vue'),
            },
          ],
        },
        {
          path: 'clientes',
          name: 'clientes',
          component: () => import('@/pages/clientes/ClientesPage.vue'),
          meta: { requiresAuth: true },
        },
        {
          path: 'clientes/:id',
          name: 'cliente-view',
          component: () => import('@/pages/clientes/ClienteCadastroEdicao.vue'),
          meta: { requiresAuth: true },
        },
        {
          path: 'clientes/novo',
          name: 'cliente-form',
          component: () => import('@/pages/clientes/ClienteCadastroEdicao.vue'),
          meta: { requiresAuth: true },
        },
        {
          path: 'pastas',
          name: 'pastas',
          component: () => import('@/pages/pastas/PastasPage.vue'),
          meta: { requiresAuth: true },
        },
        {
          path: 'pastas/:id',
          name: 'arquivos',
          component: () => import('@/pages/arquivos/ArquivosPage.vue'),
          meta: { requiresAuth: true },
        },
        {
          path: 'peticoes',
          name: 'peticoes',
          component: () => import('@/pages/peticoes/PeticoesPage.vue'),
          meta: { requiresAuth: true },
        },
        {
          path: 'peticoes/novo',
          name: 'peticoes-form',
          component: () => import('@/pages/peticoes/PeticaoCadastroEdicao.vue'),
          meta: { requiresAuth: true },
        },
        {
          path: 'peticoes/:id',
          name: 'peticao-view',
          component: () => import('@/pages/peticoes/PeticaoCadastroEdicao.vue'),
          meta: { requiresAuth: true },
        },
        {
          path: 'jurisprudencia/biblioteca',
          name: 'jurisprudencia-biblioteca',
          component: () =>
            import('@/pages/jurisprudencias/BibliotecaJurisprudenciaPage.vue'),
          meta: { requiresAuth: true },
        },
        {
          path: 'jurisprudencia/biblioteca/novo',
          name: 'jurisprudencia-form',
          component: () =>
            import('@/pages/jurisprudencias/JurisprudenciaCadastroEdicao.vue'),
          meta: { requiresAuth: true },
        },
        {
          path: 'jurisprudencia/biblioteca/:id',
          name: 'jurisprudencia-view',
          component: () =>
            import('@/pages/jurisprudencias/JurisprudenciaCadastroEdicao.vue'),
          meta: { requiresAuth: true },
        },
        {
          path: 'timelines',
          redirect: { name: 'timelines' },
        },
        {
          path: 'timelines/:processoId',
          redirect: (to) => ({ name: 'timeline-gestao', params: to.params }),
        },
        {
          path: 'perfil',
          name: 'perfil',
          component: () => import('@/pages/auth/AlterarSenhaPage.vue'),
          meta: { requiresAuth: true },
        },
        {
          path: 'configuracoes/usuarios',
          name: 'configuracoes-usuarios',
          component: () =>
            import('@/pages/configuracoes/usuarios/UsuariosPage.vue'),
          meta: { requiresAuth: true },
        },
        {
          path: 'configuracoes/usuarios/novo',
          name: 'configuracoes-usuarios-novo',
          component: () =>
            import('@/pages/configuracoes/usuarios/UsuarioCadastroEdicao.vue'),
          meta: { requiresAuth: true },
        },
        {
          path: 'configuracoes/usuarios/:id',
          name: 'configuracoes-usuarios-editar',
          component: () =>
            import('@/pages/configuracoes/usuarios/UsuarioCadastroEdicao.vue'),
          meta: { requiresAuth: true },
        },
      ],
    },
    {
      path: '/timeline/publica/:processoId',
      name: 'timeline-publica',
      component: () => import('@/pages/timelines/TimelinePublicaPage.vue'),
      meta: { requiresAuth: false },
    },
    {
      path: '/:pathMatch(.*)*', // rota 404
      redirect: { name: 'login' },
    },
  ],
})

router.beforeEach((to, from) => {
  const token = localStorage.getItem('token')
  const hasToken = Boolean(token && token !== 'null' && token !== 'undefined')
  const requiresAuth = to.matched.some((record) => record.meta.requiresAuth)

  if (to.name === 'login' && requiresAuth) {
    return true
  }

  const auth = useAuth()
  const isTokenExpired = auth.isTokenExpire()

  if (requiresAuth && (!hasToken || isTokenExpired)) {
    if (isTokenExpired) {
      localStorage.removeItem('token')
    }
    return { name: 'login' }
  }

  if (!requiresAuth && hasToken && !isTokenExpired && to.name === 'login') {
    return { name: 'home' }
  }

  return true
})

export default router
