import { createRouter, createWebHistory } from 'vue-router'

import { useAuthStore } from '@/stores/auth'
import { updateSeo } from '@/utils/seo'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),

  routes: [
    {
      path: '/',
      component: () => import('@/views/HomeView.vue'),
      meta: {
        title: 'Ekeby Sportfiskeklubb – Gemenskap, natur och sportfiske',
        description:
          'En förening för dig som älskar fisket, naturen och gemenskapen kring vattnet. Välkommen till Ekeby Sportfiskeklubb.',
      },
    },
    {
      path: '/about',
      component: () => import('@/views/AboutView.vue'),
      meta: {
        title: 'Om Ekeby Sportfiskeklubb – Historia, fiske och gemenskap',
        description:
          'Lär känna Ekeby Sportfiskeklubb, vår historia sedan 1949, klubbens vatten i Vegeån och gemenskapen kring sportfisket.',
      },
    },
    {
      path: '/login',
      component: () => import('@/views/LoginView.vue'),
      meta: {
        title: 'Logga in | Ekeby Sportfiskeklubb',
        description: 'Logga in på Ekeby Sportfiskeklubb.',
        robots: 'noindex, nofollow',
      },
    },
    {
      path: '/accept-invitation',
      name: 'AcceptInvitation',
      component: () => import('@/views/auth/AcceptInvitationView.vue'),
      meta: {
        title: 'Aktivera medlemskonto | Ekeby Sportfiskeklubb',
        description: 'Aktivera ditt medlemskonto hos Ekeby Sportfiskeklubb.',
        robots: 'noindex, nofollow',
      },
    },
    {
      path: '/news',
      name: 'PublicNews',
      component: () => import('@/views/members/NewsView.vue'),
      meta: {
        title: 'Nyheter | Ekeby Sportfiskeklubb',
        description:
          'Läs senaste nytt, information och offentliga meddelanden från Ekeby Sportfiskeklubb.',
      },
    },
    {
      path: '/fangster',
      name: 'FishingReports',
      component: () => import('@/views/members/FishingReportsView.vue'),
      meta: {
        title: 'Fångster | Ekeby Sportfiskeklubb',
        description:
          'Se rapporterade fångster från Ekeby Sportfiskeklubb och läs om fisk, vikt, plats och fångstdatum.',
      },
    },
    {
      path: '/members',
      component: () => import('@/layouts/MemberLayout.vue'),
      meta: {
        requiresAuth: true,
        title: 'Medlemssidor | Ekeby Sportfiskeklubb',
        description: 'Medlemsinformation och innehåll för Ekeby Sportfiskeklubb.',
        robots: 'noindex, nofollow',
      },
      children: [
        {
          path: '',
          component: () => import('@/views/members/DashboardView.vue'),
          meta: {
            title: 'Min sida | Ekeby Sportfiskeklubb',
            description: 'Din medlemsöversikt hos Ekeby Sportfiskeklubb.',
          },
        },
        {
          path: 'reports',
          component: () => import('@/views/members/FishingReportsView.vue'),
          meta: {
            title: 'Medlemmarnas fångster | Ekeby Sportfiskeklubb',
            description: 'Fångstrapporter för medlemmar i Ekeby Sportfiskeklubb.',
          },
        },
        {
          path: 'news',
          name: 'MemberNews',
          component: () => import('@/views/members/NewsView.vue'),
          meta: {
            title: 'Medlemsnyheter | Ekeby Sportfiskeklubb',
            description: 'Nyheter och medlemsinformation för Ekeby Sportfiskeklubb.',
          },
        },
        {
          path: 'directory',
          name: 'MemberDirectory',
          component: () => import('@/views/members/MemberDirectoryView.vue'),
          meta: {
            title: 'Medlemsregister | Ekeby Sportfiskeklubb',
            description: 'Kontaktuppgifter till medlemmar i Ekeby Sportfiskeklubb.',
          },
        },
        {
          path: 'events',
          name: 'MemberEvents',
          component: () => import('@/views/members/MemberEventsView.vue'),
          meta: {
            title: 'Aktiviteter | Ekeby Sportfiskeklubb',
            description: 'Se aktiviteter och evenemang för medlemmar i Ekeby Sportfiskeklubb.',
          },
        },
      ],
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/',
    },
  ],
})

router.afterEach((to) => {
  updateSeo(to)
})

router.beforeEach(async (to) => {
  const auth = useAuthStore()

  await auth.initialize()

  if (to.meta.requiresAuth && !auth.user) {
    return '/'
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
