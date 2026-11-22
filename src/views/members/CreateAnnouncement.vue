<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { supabase } from '@/utils/supabase'

import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import Textarea from 'primevue/textarea'
import Checkbox from 'primevue/checkbox'

import { Plus, Newspaper } from 'lucide-vue-next'

const emit = defineEmits<{
  (event: 'created'): void
}>()

const auth = useAuthStore()

const visible = ref(false)
const title = ref('')
const content = ref('')
const isPublic = ref(false)
const isPinned = ref(false)
const loading = ref(false)
const errorMessage = ref('')

const isAdmin = () => auth.profile?.role === 'admin'

function openDialog() {
  errorMessage.value = ''
  visible.value = true
}

function resetForm() {
  title.value = ''
  content.value = ''
  isPublic.value = false
  isPinned.value = false
  errorMessage.value = ''
}

async function publishAnnouncement() {
  if (!title.value.trim() || !content.value.trim()) {
    errorMessage.value = 'Fyll i både rubrik och innehåll.'
    return
  }

  if (!auth.user?.id) {
    errorMessage.value = 'Du måste vara inloggad för att publicera en nyhet.'
    return
  }

  loading.value = true
  errorMessage.value = ''

  try {
    const { error } = await supabase.from('announcements').insert({
      title: title.value.trim(),
      content: content.value.trim(),
      is_public: isPublic.value,
      is_pinned: isPinned.value,
      created_by: auth.user.id,
    })

    if (error) throw error

    resetForm()
    visible.value = false
    emit('created')
  } catch (error) {
    console.error('Failed to create announcement:', error)
    errorMessage.value =
      'Kunde inte publicera nyheten. Kontrollera dina behörigheter och försök igen.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div v-if="isAdmin()" class="create-announcement">
    <Button class="create-button" @click="openDialog">
      <Plus :size="18" />
      <span>Skapa nyhet</span>
    </Button>

    <Dialog
      v-model:visible="visible"
      modal
      header="Skapa en nyhet"
      :style="{ width: 'min(600px, 95vw)' }"
      :draggable="false"
    >
      <div class="announcement-form">
        <div class="form-intro">
          <div class="intro-icon">
            <Newspaper :size="22" />
          </div>
          <div>
            <h3>Ny information till medlemmarna</h3>
            <p>Fyll i informationen som du vill dela med klubben.</p>
          </div>
        </div>

        <div class="field">
          <label for="announcement-title">Rubrik</label>
          <InputText
            id="announcement-title"
            v-model="title"
            placeholder="Exempelvis: Kommande fisketräff"
            class="w-full"
            maxlength="150"
          />
        </div>

        <div class="field">
          <label for="announcement-content">Innehåll</label>
          <Textarea
            id="announcement-content"
            v-model="content"
            placeholder="Skriv din nyhet här..."
            rows="8"
            autoResize
            class="w-full"
          />
        </div>

        <div class="options">
          <label class="option">
            <Checkbox v-model="isPublic" binary />
            <span>
              <strong>Publik nyhet</strong>
              <small>Synlig även för besökare utan medlemskonto.</small>
            </span>
          </label>

          <label class="option">
            <Checkbox v-model="isPinned" binary />
            <span>
              <strong>Fäst nyheten</strong>
              <small>Markera nyheten som viktig.</small>
            </span>
          </label>
        </div>

        <p v-if="errorMessage" class="error-message">
          {{ errorMessage }}
        </p>
      </div>

      <template #footer>
        <Button
          label="Avbryt"
          severity="secondary"
          text
          :disabled="loading"
          @click="visible = false"
        />
        <Button label="Publicera nyhet" :loading="loading" @click="publishAnnouncement" />
      </template>
    </Dialog>
  </div>
</template>

<style scoped>
.create-announcement {
  display: flex;
  justify-content: flex-end;
}

.create-button {
  display: inline-flex;
  align-items: center;
  gap: 9px;
  padding: 11px 18px;
  background: #285b43;
  border: none;
  border-radius: 9px;
  color: white;
  font-weight: 600;
}

.create-button:hover {
  background: #183d2c;
}

.announcement-form {
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding-top: 10px;
}

.form-intro {
  display: flex;
  align-items: center;
  gap: 14px;
}

.intro-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 46px;
  height: 46px;
  flex-shrink: 0;
  color: #285b43;
  background: #edf3ee;
  border-radius: 12px;
}

.form-intro h3 {
  margin: 0 0 5px;
  font-size: 1rem;
}

.form-intro p {
  margin: 0;
  color: #718078;
  font-size: 0.85rem;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.field label {
  font-size: 0.9rem;
  font-weight: 600;
}

.w-full {
  width: 100%;
}

.options {
  display: flex;
  flex-direction: column;
  gap: 17px;
  padding: 18px;
  background: #f8faf8;
  border-radius: 10px;
}

.option {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  cursor: pointer;
}

.option span {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.option strong {
  font-size: 0.9rem;
}

.option small {
  color: #718078;
  font-size: 0.8rem;
}

.error-message {
  margin: 0;
  color: #c0392b;
  font-size: 0.9rem;
}
</style>
