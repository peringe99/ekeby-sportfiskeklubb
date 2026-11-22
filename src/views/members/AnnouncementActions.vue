<script setup lang="ts">
import { ref } from 'vue'
import { supabase } from '@/utils/supabase'

import Button from 'primevue/button'
import Checkbox from 'primevue/checkbox'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import Textarea from 'primevue/textarea'

import { Pencil, Trash2 } from 'lucide-vue-next'

interface Announcement {
  id: number
  title: string
  content: string
  is_public: boolean
  is_pinned: boolean
}

const props = defineProps<{
  announcement: Announcement
}>()

const emit = defineEmits<{
  (event: 'changed'): void
}>()

const editVisible = ref(false)
const deleteVisible = ref(false)
const title = ref('')
const content = ref('')
const isPublic = ref(false)
const isPinned = ref(false)
const loading = ref(false)
const errorMessage = ref('')

function openEditor() {
  title.value = props.announcement.title
  content.value = props.announcement.content
  isPublic.value = props.announcement.is_public
  isPinned.value = props.announcement.is_pinned
  errorMessage.value = ''
  editVisible.value = true
}

function openDeleteDialog() {
  errorMessage.value = ''
  deleteVisible.value = true
}

async function updateAnnouncement() {
  if (!title.value.trim() || !content.value.trim()) {
    errorMessage.value = 'Fyll i både rubrik och innehåll.'
    return
  }

  loading.value = true
  errorMessage.value = ''

  try {
    const { data, error } = await supabase
      .from('announcements')
      .update({
        title: title.value.trim(),
        content: content.value.trim(),
        is_public: isPublic.value,
        is_pinned: isPinned.value,
      })
      .eq('id', props.announcement.id)
      .select('id')
      .maybeSingle()

    if (error) throw error
    if (!data) throw new Error('Announcement was not updated.')

    editVisible.value = false
    emit('changed')
  } catch (error) {
    console.error('Failed to update announcement:', error)
    errorMessage.value = 'Kunde inte spara ändringarna. Försök igen.'
  } finally {
    loading.value = false
  }
}

async function deleteAnnouncement() {
  loading.value = true
  errorMessage.value = ''

  try {
    const { data, error } = await supabase
      .from('announcements')
      .delete()
      .eq('id', props.announcement.id)
      .select('id')
      .maybeSingle()

    if (error) throw error
    if (!data) throw new Error('Announcement was not deleted.')

    deleteVisible.value = false
    emit('changed')
  } catch (error) {
    console.error('Failed to delete announcement:', error)
    errorMessage.value = 'Kunde inte ta bort nyheten. Försök igen.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="announcement-actions">
    <Button
      label="Redigera"
      severity="secondary"
      outlined
      size="small"
      aria-label="Redigera nyhet"
      @click="openEditor"
    >
      <Pencil :size="15" />
    </Button>
    <Button
      label="Ta bort"
      severity="danger"
      outlined
      size="small"
      aria-label="Ta bort nyhet"
      @click="openDeleteDialog"
    >
      <Trash2 :size="15" />
    </Button>
  </div>

  <Dialog
    v-model:visible="editVisible"
    modal
    header="Redigera nyhet"
    :style="{ width: 'min(600px, 95vw)' }"
    :draggable="false"
  >
    <div class="announcement-form">
      <div class="field">
        <label for="edit-announcement-title">Rubrik</label>
        <InputText id="edit-announcement-title" v-model="title" class="w-full" maxlength="150" />
      </div>

      <div class="field">
        <label for="edit-announcement-content">Innehåll</label>
        <Textarea
          id="edit-announcement-content"
          v-model="content"
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
            <small>Avmarkera om nyheten bara ska visas för medlemmar.</small>
          </span>
        </label>

        <label class="option">
          <Checkbox v-model="isPinned" binary />
          <span>
            <strong>Viktigt meddelande</strong>
            <small>Markera nyheten som viktig.</small>
          </span>
        </label>
      </div>

      <p v-if="errorMessage" class="error-message" role="alert">{{ errorMessage }}</p>
    </div>

    <template #footer>
      <Button
        label="Avbryt"
        severity="secondary"
        text
        :disabled="loading"
        @click="editVisible = false"
      />
      <Button label="Spara ändringar" :loading="loading" @click="updateAnnouncement" />
    </template>
  </Dialog>

  <Dialog
    v-model:visible="deleteVisible"
    modal
    header="Ta bort nyhet?"
    :style="{ width: 'min(450px, 95vw)' }"
    :draggable="false"
  >
    <p>Nyheten ”{{ announcement.title }}” tas bort permanent.</p>
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
        label="Ta bort nyheten"
        severity="danger"
        :loading="loading"
        @click="deleteAnnouncement"
      />
    </template>
  </Dialog>
</template>

<style scoped>
.announcement-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 20px;
}

.announcement-form {
  display: flex;
  flex-direction: column;
  gap: 22px;
  padding-top: 10px;
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
  color: #25332b;
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
