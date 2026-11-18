import { createRouter, createWebHistory } from 'vue-router'

import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),

  routes: [
    {
      path: '/',
      component: () => import('@/views/HomeView.vue'),
    },
    {
      path: '/about',
      component: () => import('@/views/AboutView.vue'),
    },
    {
      path: '/login',
      component: () => import('@/views/LoginView.vue'),
    },
    {
      path: '/accept-invitation',
      name: 'AcceptInvitation',
      component: () => import('@/views/auth/AcceptInvitationView.vue'),
    },
    {
      path: '/members',
      component: () => import('@/layouts/MemberLayout.vue'),
      meta: { requiresAuth: true },
      children: [
        {
          path: '',
          component: () => import('@/views/members/DashboardView.vue'),
        },
        {
          path: 'reports',
          component: () => import('@/views/members/FishingReportsView.vue'),
        },
        {
          path: 'news',
          name: 'MemberNews',
          component: () => import('@/views/members/NewsView.vue'),
        },
      ],
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/',
    },
  ],
})

router.beforeEach(async (to) => {
  const auth = useAuthStore()

  await auth.initialize()

  if (to.meta.requiresAuth && !auth.user) {
    return '/login'
  }

  if (auth.user && !auth.profile) {
    await auth.loadProfile()
  }

  if (to.meta.requiresAuth && auth.profile?.membership_status !== 'active') {
    await auth.logout()
    return '/login'
  }

  if (to.path === '/login' && auth.profile?.membership_status === 'active') {
    return '/members'
  }
})

export default router
