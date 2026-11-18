<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'

import { House, Fish, CalendarDays, Newspaper, Users, LogOut } from 'lucide-vue-next'

const auth = useAuthStore()
const router = useRouter()

async function handleLogout() {
  const { error } = await auth.logout()

  if (!error) {
    router.push('/login')
  }
}

const navigation = [
  { label: 'Dashboard', path: '/members', icon: House },
  { label: 'Announcements', path: '/members/news', icon: Newspaper },
  { label: 'Fishing reports', path: '/members/reports', icon: Fish },
  { label: 'Events', path: '/members/events', icon: CalendarDays },
  { label: 'Members', path: '/members/directory', icon: Users },
]
</script>

<template>
  <div class="member-layout">
    <aside class="sidebar">
      <div class="brand">
        <Fish :size="24" />
        <span>Fishing Club</span>
      </div>

      <nav>
        <RouterLink
          v-for="item in navigation"
          :key="item.path"
          :to="item.path"
          class="nav-item"
          active-class="active"
          exact-active-class="exact-active"
        >
          <component :is="item.icon" :size="19" />
          {{ item.label }}
        </RouterLink>
      </nav>

      <div class="sidebar-footer">
        <span>{{ auth.profile?.full_name || auth.user?.email }}</span>

        <button @click="handleLogout">
          <LogOut :size="18" />
          Sign out
        </button>
      </div>
    </aside>

    <main class="main-content">
      <header class="topbar">
        <span>Member portal</span>
        <span>{{ auth.profile?.full_name }}</span>
      </header>

      <div class="page-content">
        <RouterView />
      </div>
    </main>
  </div>
</template>
