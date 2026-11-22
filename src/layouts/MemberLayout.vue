<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'

import PublicNavigation from '@/components/layout/PublicNavigation.vue'

const auth = useAuthStore()
</script>

<template>
  <PublicNavigation />
  <div class="member-layout">
    <main class="main-content">
      <header class="topbar">
        <span>{{ auth.profile?.full_name }}</span>
      </header>

      <div class="page-content">
        <RouterView />
      </div>
    </main>
  </div>
</template>
