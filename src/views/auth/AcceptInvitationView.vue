<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

import { supabase } from '@/utils/supabase'

import InputText from 'primevue/inputtext'
import Password from 'primevue/password'
import Button from 'primevue/button'
import Message from 'primevue/message'

import { Fish, CheckCircle2 } from 'lucide-vue-next'

const router = useRouter()

const loading = ref(true)
const submitting = ref(false)
const invitationValid = ref(false)

const email = ref('')
const password = ref('')
const confirmPassword = ref('')

const errorMessage = ref('')
const successMessage = ref('')

const passwordMismatch = computed(() => {
  return confirmPassword.value.length > 0 && password.value !== confirmPassword.value
})

onMounted(async () => {
  const params = new URLSearchParams(window.location.search)

  const tokenHash = params.get('token_hash')
  const type = params.get('type')

  if (!tokenHash || type !== 'invite') {
    errorMessage.value = 'Inbjudningslänken är ogiltig eller saknar information.'

    loading.value = false
    return
  }

  // Verify the invitation and establish a session.
  const { data, error } = await supabase.auth.verifyOtp({
    token_hash: tokenHash,
    type: 'invite',
  })

  if (error || !data.user) {
    errorMessage.value =
      'Inbjudningslänken har gått ut eller är ogiltig. Kontakta klubbens administratör för en ny inbjudan.'

    loading.value = false
    return
  }

  email.value = data.user.email ?? ''
  invitationValid.value = true

  // Remove the one-time token from the address bar.
  window.history.replaceState({}, document.title, window.location.pathname)

  loading.value = false
})

async function createAccount() {
  errorMessage.value = ''
  successMessage.value = ''

  if (password.value.length < 8) {
    errorMessage.value = 'Lösenordet måste innehålla minst 8 tecken.'
    return
  }

  if (password.value !== confirmPassword.value) {
    errorMessage.value = 'Lösenorden matchar inte.'
    return
  }

  submitting.value = true

  try {
    const { error } = await supabase.auth.updateUser({
      password: password.value,
    })

    if (error) {
      errorMessage.value = error.message
      return
    }

    successMessage.value = 'Ditt konto har skapats!'

    await router.replace('/members')
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <main class="invitation-page">
    <section class="invitation-card">
      <div class="invitation-brand">
        <div class="brand-icon">
          <Fish :size="28" />
        </div>

        <h1>Ekeby Sportfiskeklubb</h1>
        <span>MEDLEMSPORTAL</span>
      </div>

      <div v-if="loading" class="invitation-state">
        <i class="pi pi-spin pi-spinner" />
        <p>Verifierar din inbjudan...</p>
      </div>

      <template v-else-if="invitationValid">
        <div class="invitation-heading">
          <div class="success-icon">
            <CheckCircle2 :size="30" />
          </div>

          <h2>Välkommen till klubben!</h2>

          <p>Din inbjudan är verifierad. Skapa ett lösenord för att aktivera ditt medlemskonto.</p>
        </div>

        <form @submit.prevent="createAccount">
          <div class="form-field">
            <label>E-postadress</label>

            <InputText :modelValue="email" disabled class="w-full" />
          </div>

          <div class="form-field">
            <label>Välj lösenord</label>

            <Password
              v-model="password"
              placeholder="Minst 8 tecken"
              toggleMask
              :feedback="true"
              class="w-full"
              inputClass="w-full"
            />
          </div>

          <div class="form-field">
            <label>Bekräfta lösenord</label>

            <Password
              v-model="confirmPassword"
              placeholder="Upprepa lösenordet"
              :feedback="false"
              toggleMask
              class="w-full"
              inputClass="w-full"
            />
          </div>

          <Message v-if="errorMessage" severity="error" :closable="false">
            {{ errorMessage }}
          </Message>

          <Message v-if="successMessage" severity="success" :closable="false">
            {{ successMessage }}
          </Message>

          <Button
            type="submit"
            label="Skapa mitt konto"
            :loading="submitting"
            :disabled="passwordMismatch || !password || !confirmPassword"
            class="submit-button"
          />
        </form>
      </template>

      <div v-else class="invitation-state">
        <h2>Inbjudan kunde inte verifieras</h2>

        <Message severity="error" :closable="false">
          {{ errorMessage }}
        </Message>

        <p>Kontakta klubbens administratör för att få en ny inbjudningslänk.</p>
      </div>

      <footer>© {{ new Date().getFullYear() }} Ekeby Sportfiskeklubb</footer>
    </section>
  </main>
</template>

<style scoped>
.invitation-page {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 24px;
  background: #f4f7f4;
}

.invitation-card {
  width: 100%;
  max-width: 460px;
  padding: 40px;
  background: white;
  border: 1px solid #e5ebe6;
  border-radius: 16px;
  box-shadow: 0 12px 40px rgba(20, 50, 35, 0.06);
}

.invitation-brand {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 36px;
}

.brand-icon,
.success-icon {
  display: grid;
  place-items: center;
  width: 58px;
  height: 58px;
  border-radius: 16px;
  color: #245c46;
  background: #eaf2ec;
}

.invitation-brand h1 {
  margin: 14px 0 4px;
  font-size: 21px;
  color: #1c3c2d;
}

.invitation-brand span {
  font-size: 10px;
  letter-spacing: 2px;
  color: #84958a;
}

.invitation-heading {
  text-align: center;
  margin-bottom: 28px;
}

.success-icon {
  margin: 0 auto 18px;
}

.invitation-heading h2 {
  font-size: 25px;
  color: #1c3c2d;
  margin: 0 0 10px;
}

.invitation-heading p,
.invitation-state p {
  color: #738078;
  line-height: 1.6;
  font-size: 14px;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 20px;
}

.form-field label {
  font-size: 13px;
  font-weight: 600;
  color: #334b3d;
}

.submit-button {
  width: 100%;
  margin-top: 8px;
  background: #245c46;
  border-color: #245c46;
}

.invitation-state {
  text-align: center;
  padding: 20px 0;
}

.invitation-state h2 {
  color: #1c3c2d;
}

.invitation-card footer {
  border-top: 1px solid #edf0ed;
  margin-top: 32px;
  padding-top: 20px;
  text-align: center;
  font-size: 12px;
  color: #9aa59e;
}

.w-full {
  width: 100%;
}

@media (max-width: 500px) {
  .invitation-card {
    padding: 28px 22px;
  }
}
</style>
