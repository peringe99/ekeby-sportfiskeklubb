<script setup lang="ts">
import { computed, ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { supabase } from '@/utils/supabase'

import Button from 'primevue/button'
import DatePicker from 'primevue/datepicker'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import Textarea from 'primevue/textarea'

import { CalendarPlus, Plus } from 'lucide-vue-next'

const emit = defineEmits<{
  (event: 'created'): void
}>()

const auth = useAuthStore()
const isAdmin = computed(
  () =>
    !!auth.user && auth.profile?.membership_status === 'active' && auth.profile?.role === 'admin',
)

const visible = ref(false)
const title = ref('')
const description = ref('')
const eventDate = ref<Date | null>(null)
const location = ref('')
const loading = ref(false)
const errorMessage = ref('')

function openDialog() {
  errorMessage.value = ''
  visible.value = true
}

function resetForm() {
  title.value = ''
  description.value = ''
  eventDate.value = null
  location.value = ''
  errorMessage.value = ''
}

async function createEvent() {
  errorMessage.value = ''

  if (!title.value.trim() || !description.value.trim() || !location.value.trim()) {
    errorMessage.value = 'Fyll i rubrik, beskrivning och plats.'
    return
  }

  if (!eventDate.value || Number.isNaN(eventDate.value.getTime())) {
    errorMessage.value = 'Välj datum och tid för aktiviteten.'
    return
  }

  if (!isAdmin.value) {
    errorMessage.value = 'Endast administratörer kan skapa aktiviteter.'
    return
  }

  loading.value = true

  try {
    const { error } = await supabase.from('events').insert({
      title: title.value.trim(),
      description: description.value.trim(),
      event_date: eventDate.value.toISOString(),
      location: location.value.trim(),
    })

    if (error) throw error

    resetForm()
    visible.value = false
    emit('created')
  } catch (error) {
    console.error('Failed to create event:', error)
    errorMessage.value =
      'Kunde inte skapa aktiviteten. Kontrollera dina behörigheter och försök igen.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div v-if="isAdmin" class="create-event">
    <Button class="create-button" @click="openDialog">
      <Plus :size="18" />
      <span>Skapa aktivitet</span>
    </Button>

    <Dialog
      v-model:visible="visible"
      modal
      header="Skapa en aktivitet"
      :style="{ width: 'min(600px, 95vw)' }"
      :draggable="false"
    >
      <div class="event-form">
        <div class="form-intro">
          <div class="intro-icon">
            <CalendarPlus :size="22" />
          </div>
          <div>
            <h3>Ny aktivitet för klubben</h3>
            <p>Fyll i informationen som ska visas för medlemmarna.</p>
          </div>
        </div>

        <div class="field">
          <label for="event-title">Rubrik</label>
          <InputText
            id="event-title"
            v-model="title"
            placeholder="Exempelvis: Fisketräff vid sjön"
            class="w-full"
            maxlength="150"
          />
        </div>

        <div class="field">
          <label for="event-description">Beskrivning</label>
          <Textarea
            id="event-description"
            v-model="description"
            placeholder="Beskriv aktiviteten..."
            rows="6"
            autoResize
            class="w-full"
            maxlength="3000"
          />
        </div>

        <div class="field">
          <label for="event-date">Datum och tid</label>
          <DatePicker
            v-model="eventDate"
            inputId="event-date"
            dateFormat="dd/mm/yy"
            hourFormat="24"
            :manualInput="false"
            showIcon
            showButtonBar
            showTime
            class="w-full"
            inputClass="w-full"
          />
        </div>

        <div class="field">
          <label for="event-location">Plats</label>
          <InputText
            id="event-location"
            v-model="location"
            placeholder="Var hålls aktiviteten?"
            class="w-full"
            maxlength="150"
          />
        </div>

        <p v-if="errorMessage" class="error-message" role="alert">
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
        <Button label="Skapa aktivitet" :loading="loading" @click="createEvent" />
      </template>
    </Dialog>
  </div>
</template>

<style scoped>
.create-event {
  display: flex;
  justify-content: flex-end;
}

.create-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 9px;
  padding: 11px 18px;
  border: none;
  border-radius: 9px;
  color: #fff;
  background: #285b43;
  font-weight: 600;
  white-space: nowrap;
}

.create-button:hover {
  background: #183d2c;
}

.event-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding-top: 10px;
}

.form-intro {
  display: flex;
  align-items: center;
  gap: 14px;
}

.intro-icon {
  display: flex;
  width: 46px;
  height: 46px;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
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
  line-height: 1.5;
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

.error-message {
  margin: 0;
  color: #b42318;
  font-size: 0.9rem;
}
</style>
