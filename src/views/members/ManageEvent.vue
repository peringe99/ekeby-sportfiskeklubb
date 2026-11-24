<script setup lang="ts">
import { computed, ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { supabase } from '@/utils/supabase'

import Button from 'primevue/button'
import DatePicker from 'primevue/datepicker'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import Textarea from 'primevue/textarea'

import { CalendarPlus, Pencil, Plus, Trash2 } from 'lucide-vue-next'

interface ClubEvent {
  id: string
  title: string
  description: string
  event_date: string
  location: string
}

const props = defineProps<{
  event?: ClubEvent
}>()

const emit = defineEmits<{
  (event: 'created'): void
  (event: 'changed'): void
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
const deleteVisible = ref(false)
const formIdPrefix = computed(() => `event-${props.event?.id ?? 'new'}`)

function openDialog() {
  errorMessage.value = ''
  if (props.event) {
    title.value = props.event.title
    description.value = props.event.description
    eventDate.value = new Date(props.event.event_date)
    location.value = props.event.location
  } else {
    resetForm()
  }
  visible.value = true
}

function openDeleteDialog() {
  errorMessage.value = ''
  deleteVisible.value = true
}

function resetForm() {
  title.value = ''
  description.value = ''
  eventDate.value = null
  location.value = ''
  errorMessage.value = ''
}

async function saveEvent() {
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
    errorMessage.value = 'Endast administratörer kan hantera aktiviteter.'
    return
  }

  loading.value = true

  try {
    const eventData = {
      title: title.value.trim(),
      description: description.value.trim(),
      event_date: eventDate.value.toISOString(),
      location: location.value.trim(),
    }

    if (props.event) {
      const { data, error } = await supabase
        .from('events')
        .update(eventData)
        .eq('id', props.event.id)
        .select('id')
        .maybeSingle()

      if (error) throw error
      if (!data) throw new Error('Event was not updated.')

      emit('changed')
    } else {
      const { error } = await supabase.from('events').insert(eventData)
      if (error) throw error

      emit('created')
    }

    visible.value = false
  } catch (error) {
    console.error('Failed to save event:', error)
    errorMessage.value =
      'Kunde inte spara aktiviteten. Kontrollera dina behörigheter och försök igen.'
  } finally {
    loading.value = false
  }
}

async function deleteEvent() {
  if (!isAdmin.value) {
    errorMessage.value = 'Endast administratörer kan hantera aktiviteter.'
    return
  }

  if (!props.event) {
    errorMessage.value = 'Välj en aktivitet att ta bort.'
    return
  }

  loading.value = true
  errorMessage.value = ''

  try {
    const { data, error } = await supabase
      .from('events')
      .delete()
      .eq('id', props.event.id)
      .select('id')
      .maybeSingle()

    if (error) throw error
    if (!data) throw new Error('Event was not deleted.')

    deleteVisible.value = false
    emit('changed')
  } catch (error) {
    console.error('Failed to delete event:', error)
    errorMessage.value = 'Kunde inte ta bort aktiviteten. Försök igen.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div v-if="isAdmin" class="create-event" :class="{ 'event-management-actions': event }">
    <Button class="create-button" :size="event ? 'small' : undefined" @click="openDialog">
      <Pencil v-if="event" :size="16" />
      <Plus v-else :size="18" />
      <span>{{ event ? 'Redigera aktivitet' : 'Skapa aktivitet' }}</span>
    </Button>
    <Button
      v-if="event"
      label="Ta bort"
      severity="danger"
      outlined
      size="small"
      class="delete-button"
      @click="openDeleteDialog"
    >
      <Trash2 :size="15" />
    </Button>

    <Dialog
      v-model:visible="visible"
      modal
      dismissableMask
      :header="event ? 'Redigera aktivitet' : 'Skapa en aktivitet'"
      :style="{
        width: 'min(600px, 95vw)',
        backgroundColor: '#fff',
        color: '#25332b',
        borderRadius: '14px',
        overflow: 'hidden',
      }"
      :draggable="false"
      :pt="{
        header: { style: { backgroundColor: '#fff', color: '#25332b' } },
        content: { style: { backgroundColor: '#fff', color: '#25332b' } },
        footer: { style: { backgroundColor: '#fff', color: '#25332b' } },
      }"
    >
      <div class="event-form">
        <div class="form-intro">
          <div class="intro-icon">
            <CalendarPlus :size="22" />
          </div>
          <div>
            <h3>{{ event ? 'Uppdatera aktiviteten' : 'Ny aktivitet för klubben' }}</h3>
            <p>
              {{
                event
                  ? 'Ändra informationen som visas för medlemmarna.'
                  : 'Fyll i informationen som ska visas för medlemmarna.'
              }}
            </p>
          </div>
        </div>

        <div class="field">
          <label :for="`${formIdPrefix}-title`">Rubrik</label>
          <InputText
            :id="`${formIdPrefix}-title`"
            v-model="title"
            placeholder="Exempelvis: Fisketräff vid sjön"
            class="w-full"
            maxlength="150"
          />
        </div>

        <div class="field">
          <label :for="`${formIdPrefix}-description`">Beskrivning</label>
          <Textarea
            :id="`${formIdPrefix}-description`"
            v-model="description"
            placeholder="Beskriv aktiviteten..."
            rows="6"
            autoResize
            class="w-full"
            maxlength="3000"
          />
        </div>

        <div class="field">
          <label :for="`${formIdPrefix}-date`">Datum och tid</label>
          <DatePicker
            v-model="eventDate"
            :inputId="`${formIdPrefix}-date`"
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
          <label :for="`${formIdPrefix}-location`">Plats</label>
          <InputText
            :id="`${formIdPrefix}-location`"
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
        <Button
          :label="event ? 'Spara ändringar' : 'Skapa aktivitet'"
          :loading="loading"
          @click="saveEvent"
        />
      </template>
    </Dialog>

    <Dialog
      v-model:visible="deleteVisible"
      modal
      header="Ta bort aktivitet?"
      :style="{ width: 'min(450px, 95vw)' }"
      :draggable="false"
    >
      <p>Aktiviteten ”{{ event?.title }}” och dess kommentarer tas bort permanent.</p>
      <p v-if="errorMessage" class="error-message" role="alert">{{ errorMessage }}</p>
      <template #footer>
        <Button
          label="Avbryt"
          severity="secondary"
          text
          :disabled="loading"
          @click="deleteVisible = false"
        />
        <Button
          label="Ta bort aktiviteten"
          severity="danger"
          :loading="loading"
          @click="deleteEvent"
        />
      </template>
    </Dialog>
  </div>
</template>

<style scoped>
.create-event {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
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

.delete-button {
  white-space: nowrap;
}

.event-management-actions .create-button,
.event-management-actions .delete-button {
  box-sizing: border-box;
  height: 40px;
  padding: 0 14px;
}

.event-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding-top: 10px;
  color: #25332b;
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

.event-form :deep(.p-inputtext),
.event-form :deep(.p-textarea) {
  background-color: #fff;
  color: #25332b;
}

.event-form :deep(.p-inputtext::placeholder),
.event-form :deep(.p-textarea::placeholder) {
  color: #849087;
}

.error-message {
  margin: 0;
  color: #b42318;
  font-size: 0.9rem;
}
</style>
