<script setup lang="ts">
import PublicNavigation from '@/components/layout/PublicNavigation.vue'
</script>

<template>
  <PublicNavigation />
  <div class="member-layout">
    <main class="main-content">
      <div class="page-content">
        <RouterView />
      </div>
    </main>
  </div>
</template>
