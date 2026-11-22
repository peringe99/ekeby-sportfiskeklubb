<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowRight, LogOut, Menu as MenuIcon } from 'lucide-vue-next'
import Menu from 'primevue/menu'
import { useAuthStore } from '@/stores/auth'
import logo from '@/assets/images/ekeby_logo.png'

const auth = useAuthStore()
const router = useRouter()
const mobileMenuRef = ref(null)

const accountButtonText = computed(() => (auth.user ? 'Min sida' : 'Logga in'))

const mobileMenu = computed(() => [
  { label: 'Hem', command: () => router.push('/') },
  { label: 'Nyheter', url: '/#aktiviteter' },
  { label: 'Fångster', command: () => router.push('/fangster') },
  { label: 'Om klubben', command: () => router.push('/about') },
  { label: accountButtonText.value, command: goToAccount },
  { label: 'Logga ut', command: logout },
])

function goToAccount() {
  router.push(auth.user ? '/members' : '/login')
}

async function logout() {
  await auth.logout()
  router.push('/login')
}
</script>

<template>
  <header class="navbar">
    <div class="nav-inner">
      <RouterLink to="/" class="brand">
        <img :src="logo" alt="Ekeby Sportfiskeklubb" class="brand-logo" />
        <span>
          <strong>Ekeby</strong>
          <small>SPORTFISKEKLUBB</small>
        </span>
      </RouterLink>

      <nav class="nav-links">
        <RouterLink to="/">Hem</RouterLink>
        <RouterLink to="/news">Nyheter</RouterLink>
        <RouterLink to="/fangster">Fångster</RouterLink>
        <RouterLink to="/about">Om klubben</RouterLink>
      </nav>
      <button class="login-button" @click="goToAccount">
        {{ accountButtonText }}
        <ArrowRight :size="16" />
      </button>
      <button class="logout-button" @click="logout">
        <LogOut :size="16" />
        Logga ut
      </button>
      <button
        class="mobile-menu-button"
        type="button"
        aria-label="Öppna meny"
        @click="mobileMenuRef?.toggle($event)"
      >
        <MenuIcon :size="20" />
      </button>
      <Menu ref="mobileMenuRef" :model="mobileMenu" popup />
    </div>
  </header>
</template>

<style scoped>
.navbar {
  height: 82px;
  background: #fff;
  border-bottom: 1px solid #edf0ec;
}

.nav-inner {
  max-width: 1240px;
  height: 100%;
  margin: auto;
  padding: 0 35px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.brand {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 11px;
  color: #254a34;
  text-decoration: none;
}

.brand strong,
.brand small {
  display: block;
}

.brand strong {
  font-size: 17px;
  letter-spacing: -0.4px;
}

.brand small {
  color: #849287;
  font-size: 9px;
  letter-spacing: 1.6px;
  margin-top: 3px;
}

.brand-logo {
  width: 50px;
  height: 50px;
  object-fit: contain;
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 34px;
}

.nav-links a {
  color: #69766d;
  text-decoration: none;
  font-size: 13px;
  font-weight: 550;
  transition: color 0.2s;
  border: 2px solid transparent;
}

.nav-links a:hover,
.nav-links a.router-link-active {
  color: #315e40;
  border-bottom: 2px solid #315e40;
}

.login-button {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 17px;
  border: 1px solid #dfe8df;
  border-radius: 8px;
  background: white;
  color: #365b45;
  font-size: 12px;
  font-weight: 650;
  cursor: pointer;
}

.logout-button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 15px;
  border: 1px solid #e9eee9;
  border-radius: 8px;
  background: white;
  color: #647368;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: 0.2s;
}

.logout-button:hover {
  background: #f7f9f7;
  color: #b54747;
  border-color: #e8cccc;
}

.mobile-menu-button {
  display: none;
  align-items: center;
  justify-content: center;
  width: 42px;
  height: 42px;
  border: 1px solid #dfe8df;
  border-radius: 8px;
  background: white;
  color: #365b45;
  cursor: pointer;
}

@media (max-width: 750px) {
  .nav-inner {
    padding: 0 20px;
  }

  .nav-links,
  .login-button,
  .logout-button {
    display: none;
  }

  .mobile-menu-button {
    display: flex;
  }
}

@media (max-width: 420px) {
  .brand small {
    font-size: 8px;
  }
}
</style>
