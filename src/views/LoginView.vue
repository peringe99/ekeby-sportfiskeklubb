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
const isSubmitting = ref(false)

function getLoginErrorMessage(message: string) {
  const normalizedMessage = message?.toLowerCase() ?? ''

  if (normalizedMessage.includes('invalid login credentials')) {
    return 'E-postadressen eller lösenordet är felaktigt.'
  }

  if (normalizedMessage.includes('email not confirmed')) {
    return 'Du behöver bekräfta din e-postadress innan du kan logga in.'
  }

  if (normalizedMessage.includes('too many requests')) {
    return 'För många inloggningsförsök. Försök igen senare.'
  }

  return 'Det gick inte att logga in. Kontrollera dina uppgifter och försök igen.'
}

async function handleLogin() {
  if (isSubmitting.value) return

  errorMessage.value = ''
  isSubmitting.value = true

  try {
    const { error } = await auth.login(email.value, password.value)

    if (error) {
      errorMessage.value = getLoginErrorMessage(error.message)
      return
    }

    await router.push('/members')
  } catch (error) {
    console.error('Failed to log in:', error)
    errorMessage.value = 'Ett oväntat fel uppstod. Försök igen.'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <main class="login-page">
    <div class="login-wrapper">
      <!-- Welcome panel -->
      <section class="welcome-panel">
        <div class="welcome-content">
          <div class="club-logo">
            <span>ESK</span>
          </div>

          <div class="welcome-text">
            <span class="eyebrow">EKEBY SPORTFISKEKLUBB</span>
            <h1>Välkommen tillbaka.</h1>
            <p>
              Här hittar du klubbens nyheter, fångstrapporter och allt som händer i vår gemenskap.
            </p>
          </div>
        </div>

        <div class="panel-footer">
          <span>Grundad 1949</span>
          <span>Ekeby, Sverige</span>
        </div>
      </section>

      <!-- Login form -->
      <section class="form-panel">
        <div class="form-content">
          <div class="form-heading">
            <span class="eyebrow">FÖR MEDLEMMAR</span>
            <h2>Logga in</h2>
            <p>Ange dina inloggningsuppgifter för att komma åt medlemssidorna.</p>
          </div>

          <form @submit.prevent="handleLogin">
            <div class="form-field">
              <label for="email">E-postadress</label>
              <InputText
                id="email"
                v-model="email"
                type="email"
                placeholder="namn@exempel.se"
                autocomplete="username"
                required
                class="login-input"
              />
            </div>

            <div class="form-field">
              <label for="password">Lösenord</label>
              <Password
                v-model="password"
                inputId="password"
                placeholder="Ange ditt lösenord"
                autocomplete="current-password"
                :feedback="false"
                toggleMask
                required
                inputClass="login-input"
                class="password-field"
              />
            </div>

            <div v-if="errorMessage" class="error-message" role="alert">
              <span>{{ errorMessage }}</span>
            </div>

            <Button
              type="submit"
              label="Logga in"
              :loading="isSubmitting"
              :disabled="!email || !password || isSubmitting"
              class="login-button"
            />
          </form>

          <div class="form-footer">
            <span>Problem med att logga in?</span>
            <p>
              <a href="mailto:tupelo@telia.com">Kontakta en administratör i klubben</a> om du
              behöver hjälp.
            </p>
          </div>
        </div>
      </section>
    </div>
  </main>
</template>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 24px;
  background: #f3f5f2;
  font-family: inherit;
}

.login-wrapper {
  width: 100%;
  max-width: 1040px;
  min-height: 620px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  background: #ffffff;
  border-radius: 18px;
  overflow: hidden;
  box-shadow: 0 20px 70px rgb(30 55 38 / 9%);
}

/* Welcome panel */

.welcome-panel {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 52px;
  overflow: hidden;
  color: white;
  background:
    radial-gradient(ellipse at 15% 90%, rgb(117 151 105 / 22%), transparent 55%),
    linear-gradient(145deg, #183d2b 0%, #102d20 100%);
}

.welcome-panel::before,
.welcome-panel::after {
  content: '';
  position: absolute;
  border: 1px solid rgb(255 255 255 / 7%);
  border-radius: 50%;
  pointer-events: none;
}

.welcome-panel::before {
  width: 440px;
  height: 440px;
  right: -190px;
  bottom: -150px;
}

.welcome-panel::after {
  width: 320px;
  height: 320px;
  right: -130px;
  bottom: -90px;
}

.welcome-content {
  position: relative;
  z-index: 1;
}

.club-logo {
  width: 58px;
  height: 58px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 100px;
  border: 1px solid rgb(255 255 255 / 35%);
  border-radius: 50%;
  color: white;
  font-size: 16px;
  font-weight: 700;
  letter-spacing: 1px;
}

.eyebrow {
  display: block;
  margin-bottom: 16px;
  color: #a9c5a8;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 2px;
}

.welcome-text h1 {
  margin: 0 0 18px;
  font-size: clamp(36px, 4vw, 48px);
  font-weight: 600;
  letter-spacing: -1.8px;
  line-height: 1.1;
}

.welcome-text p {
  max-width: 340px;
  margin: 0;
  color: rgb(255 255 255 / 72%);
  font-size: 15px;
  line-height: 1.8;
}

.panel-footer {
  position: relative;
  z-index: 1;
  display: flex;
  justify-content: space-between;
  padding-top: 24px;
  border-top: 1px solid rgb(255 255 255 / 15%);
  color: rgb(255 255 255 / 55%);
  font-size: 12px;
  letter-spacing: 0.3px;
}

/* Form panel */

.form-panel {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 64px 60px;
}

.form-content {
  width: 100%;
  max-width: 350px;
}

.form-heading {
  margin-bottom: 42px;
}

.form-heading .eyebrow {
  color: #66876b;
}

.form-heading h2 {
  margin: 0 0 10px;
  color: #1b3022;
  font-size: 34px;
  font-weight: 650;
  letter-spacing: -1.2px;
}

.form-heading p {
  margin: 0;
  color: #818b82;
  font-size: 14px;
  line-height: 1.6;
}

/* Inputs */

.form-field {
  display: flex;
  flex-direction: column;
  gap: 9px;
  margin-bottom: 24px;
}

.form-field label {
  color: #35463a;
  font-size: 13px;
  font-weight: 600;
}

.login-input {
  width: 100%;
  height: 48px;
  padding: 0 15px;
  border: 1px solid #e1e7e0;
  border-radius: 8px;
  background: #fafbf9;
  color: #25382a;
  font-size: 14px;
  transition:
    border-color 0.2s,
    box-shadow 0.2s,
    background 0.2s;
}

.login-input::placeholder {
  color: #a8b0a8;
}

.login-input:focus {
  border-color: #537e5c;
  background: #ffffff;
  box-shadow: 0 0 0 3px rgb(83 126 92 / 10%);
  outline: none;
}

.password-field {
  width: 100%;
}

.password-field :deep(.p-password-input) {
  width: 100%;
}

.password-field :deep(.p-inputtext) {
  width: 100%;
  height: 48px;
  padding: 0 15px;
  border: 1px solid #e1e7e0;
  border-radius: 8px;
  background: #fafbf9;
  color: #25382a;
  font-size: 14px;
  transition:
    border-color 0.2s,
    box-shadow 0.2s;
}

.password-field :deep(.p-inputtext:focus) {
  border-color: #537e5c;
  background: #ffffff;
  box-shadow: 0 0 0 3px rgb(83 126 92 / 10%);
}

/* Button */

.login-button {
  width: 100%;
  height: 49px;
  margin-top: 8px;
  border: none;
  border-radius: 8px;
  background: #28583a;
  color: white;
  font-size: 14px;
  font-weight: 600;
  transition:
    background 0.2s,
    transform 0.2s;
}

.login-button:not(:disabled):hover {
  background: #1d452d;
  transform: translateY(-1px);
}

.login-button:disabled {
  opacity: 0.55;
}

/* Error */

.error-message {
  margin: 0 0 16px;
  padding: 12px 14px;
  border: 1px solid #f0d0d0;
  border-radius: 8px;
  background: #fff5f5;
  color: #b33d3d;
  font-size: 13px;
  line-height: 1.5;
}

/* Footer */

.form-footer {
  margin-top: 42px;
  padding-top: 24px;
  border-top: 1px solid #edf0ec;
  text-align: center;
}

.form-footer span {
  color: #536456;
  font-size: 12px;
  font-weight: 600;
}

.form-footer p {
  margin: 7px 0 0;
  color: #929b93;
  font-size: 12px;
  line-height: 1.5;
}

.form-footer a {
  color: #536456;
  text-underline-offset: 2px;
}

/* Responsive */

@media (max-width: 760px) {
  .login-page {
    padding: 20px 14px;
  }

  .login-wrapper {
    max-width: 460px;
    min-height: auto;
    grid-template-columns: 1fr;
  }

  .welcome-panel {
    min-height: 250px;
    padding: 30px;
  }

  .club-logo {
    width: 46px;
    height: 46px;
    margin-bottom: 35px;
    font-size: 13px;
  }

  .welcome-text h1 {
    font-size: 34px;
  }

  .welcome-text p {
    font-size: 13px;
  }

  .panel-footer {
    margin-top: 35px;
  }

  .form-panel {
    padding: 42px 30px;
  }

  .form-heading {
    margin-bottom: 32px;
  }
}
</style>
