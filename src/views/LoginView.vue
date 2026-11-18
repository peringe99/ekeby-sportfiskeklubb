<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

import InputText from 'primevue/inputtext'
import Password from 'primevue/password'
import Button from 'primevue/button'

const auth = useAuthStore()
const router = useRouter()

const email = ref('')
const password = ref('')
const errorMessage = ref('')

async function handleLogin() {
  const { error } = await auth.login(email.value, password.value)

  if (error) {
    errorMessage.value = error.message
    return
  }

  router.push('/members')
}
</script>

<template>
  <div class="login-container">
    <h1>Member login</h1>

    <form @submit.prevent="handleLogin">
      <InputText v-model="email" type="email" placeholder="Email" />

      <Password v-model="password" placeholder="Password" :feedback="false" toggleMask />

      <Button type="submit" label="Log in" />

      <p v-if="errorMessage">
        {{ errorMessage }}
      </p>
    </form>
  </div>
</template>
