<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { ChevronDown, MessageCircle, Send } from 'lucide-vue-next'
import Button from 'primevue/button'
import Textarea from 'primevue/textarea'
import { useAuthStore } from '@/stores/auth'
import { supabase } from '@/utils/supabase'

interface EventComment {
  id: string
  event_id: string
  author_name: string
  content: string
  created_at: string
}

const props = defineProps<{
  eventId: string
}>()

const auth = useAuthStore()
const comments = ref<EventComment[]>([])
const draft = ref('')
const loading = ref(true)
const submitting = ref(false)
const loadError = ref('')
const submitError = ref('')
const isActiveMember = computed(() => !!auth.user && auth.profile?.membership_status === 'active')

function formatCommentDate(date: string) {
  return new Intl.DateTimeFormat('sv-SE', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(date))
}

async function fetchComments() {
  loading.value = true
  loadError.value = ''

  try {
    const { data, error } = await supabase
      .from('event_comments')
      .select('id, event_id, author_name, content, created_at')
      .eq('event_id', props.eventId)
      .order('created_at', { ascending: true })

    if (error) throw error
    comments.value = data ?? []
  } catch (error) {
    console.error('Could not fetch event comments:', error)
    loadError.value = 'Det gick inte att hämta kommentarerna. Försök igen.'
  } finally {
    loading.value = false
  }
}

async function submitComment() {
  const content = draft.value.trim()
  if (!content) {
    submitError.value = 'Skriv en kommentar innan du skickar.'
    return
  }

  if (!auth.user?.id || !isActiveMember.value) {
    submitError.value = 'Du måste vara aktiv medlem för att kommentera.'
    return
  }

  submitting.value = true
  submitError.value = ''

  try {
    const { data, error } = await supabase
      .from('event_comments')
      .insert({
        event_id: props.eventId,
        user_id: auth.user.id,
        content,
      })
      .select('id, event_id, author_name, content, created_at')
      .single()

    if (error) throw error

    comments.value.push(data)
    draft.value = ''
  } catch (error) {
    console.error('Could not post event comment:', error)
    submitError.value = 'Kunde inte skicka kommentaren. Försök igen.'
  } finally {
    submitting.value = false
  }
}

onMounted(fetchComments)
</script>

<template>
  <details class="event-comments">
    <summary class="comments-summary" aria-label="Visa eller dölj kommentarer">
      <MessageCircle :size="17" />
      <span class="comments-title">Kommentarer</span>
      <span class="comment-count">{{ comments.length }}</span>
      <ChevronDown :size="17" class="disclosure-icon" />
    </summary>

    <div class="comments-content">
      <div v-if="loading" class="comments-state" aria-live="polite">Hämtar kommentarer...</div>
      <div v-else-if="loadError && comments.length === 0" class="comments-state error" role="alert">
        <span>{{ loadError }}</span>
        <button type="button" class="retry-button" @click="fetchComments">Försök igen</button>
      </div>
      <p v-else-if="comments.length === 0" class="comments-state">
        Inga kommentarer ännu. Ställ en fråga eller berätta om du kommer.
      </p>

      <ol v-else class="comment-list" aria-live="polite">
        <li v-for="comment in comments" :key="comment.id" class="comment">
          <div class="comment-meta">
            <strong>{{ comment.author_name }}</strong>
            <time :datetime="comment.created_at">{{ formatCommentDate(comment.created_at) }}</time>
          </div>
          <p>{{ comment.content }}</p>
        </li>
      </ol>

      <form v-if="isActiveMember" class="comment-form" @submit.prevent="submitComment">
        <label :for="`comment-${eventId}`">Lägg till en kommentar</label>
        <Textarea
          :id="`comment-${eventId}`"
          v-model="draft"
          placeholder="Ställ en fråga eller berätta om du kommer..."
          rows="3"
          autoResize
          maxlength="2000"
          class="comment-input"
        />
        <p v-if="submitError" class="error-message" role="alert">
          {{ submitError }}
        </p>
        <Button
          type="submit"
          label="Skicka kommentar"
          :loading="submitting"
          :disabled="!draft.trim()"
          class="submit-button"
        >
          <Send :size="15" />
        </Button>
      </form>
    </div>
  </details>
</template>

<style scoped>
.event-comments {
  margin-top: 20px;
  padding-top: 18px;
  border-top: 1px solid #e8ede8;
}

.comments-summary {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  color: #365b45;
  font-size: 0.95rem;
  font-weight: 650;
  list-style: none;
}

.comments-summary::-webkit-details-marker {
  display: none;
}

.comments-summary:focus-visible {
  border-radius: 4px;
  outline: 2px solid #285b43;
  outline-offset: 4px;
}

.comments-title {
  flex: 1;
}

.disclosure-icon {
  transition: transform 0.2s ease;
}

.event-comments[open] .disclosure-icon {
  transform: rotate(180deg);
}

.comments-content {
  display: grid;
  gap: 14px;
  padding-top: 14px;
}

.comment-count {
  display: inline-flex;
  min-width: 22px;
  height: 22px;
  align-items: center;
  justify-content: center;
  padding: 0 6px;
  border-radius: 999px;
  color: #536c5c;
  background: #edf3ee;
  font-size: 0.75rem;
}

.comments-state {
  margin: 0;
  color: #849087;
  font-size: 0.86rem;
}

.comments-state.error,
.error-message {
  color: #b42318;
}

.comments-state.error {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
}

.retry-button {
  padding: 4px 8px;
  border: 1px solid #e4e9e4;
  border-radius: 6px;
  color: #536c5c;
  background: #fff;
  cursor: pointer;
}

.comment-list {
  display: grid;
  gap: 12px;
  padding: 0;
  margin: 0;
  list-style: none;
}

.comment {
  padding: 12px 14px;
  border-radius: 8px;
  background: #f8faf8;
}

.comment-meta {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  justify-content: space-between;
  gap: 4px 12px;
  color: #536c5c;
  font-size: 0.82rem;
}

.comment-meta time {
  color: #89938c;
  font-size: 0.75rem;
}

.comment p {
  margin: 7px 0 0;
  color: #5e6c63;
  font-size: 0.9rem;
  line-height: 1.6;
  overflow-wrap: anywhere;
  white-space: pre-line;
}

.comment-form {
  display: grid;
  justify-items: end;
  gap: 9px;
}

.comment-form label {
  justify-self: start;
  color: #536c5c;
  font-size: 0.83rem;
  font-weight: 600;
}

.comment-input {
  width: 100%;
}

.error-message {
  justify-self: start;
  margin: 0;
  font-size: 0.85rem;
}

.submit-button {
  background: #285b43;
  border-color: #285b43;
}

@media (max-width: 550px) {
  .comment-meta {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>
