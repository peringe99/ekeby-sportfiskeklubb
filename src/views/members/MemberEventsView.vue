<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { CalendarDays, MapPin, RefreshCw } from 'lucide-vue-next'
import { useAuthStore } from '@/stores/auth'
import { supabase } from '@/utils/supabase'
import CreateEvent from './CreateEvent.vue'
import EventComments from './EventComments.vue'

interface ClubEvent {
  id: string
  title: string
  description: string
  event_date: string
  location: string
}

const events = ref<ClubEvent[]>([])
const loading = ref(true)
const errorMessage = ref('')
const auth = useAuthStore()
const isAdmin = computed(
  () =>
    !!auth.user && auth.profile?.membership_status === 'active' && auth.profile?.role === 'admin',
)
const nextEventId = computed(
  () =>
    events.value.find((event) => new Date(event.event_date).getTime() >= Date.now())?.id ?? null,
)

function getEventStatus(event: ClubEvent) {
  if (new Date(event.event_date).getTime() < Date.now()) return 'passed'
  return event.id === nextEventId.value ? 'next' : 'upcoming'
}

function getEventStatusLabel(event: ClubEvent) {
  const status = getEventStatus(event)
  if (status === 'passed') return 'Passerad'
  if (status === 'next') return 'Nästa aktivitet'
  return 'Kommande'
}

function formatEventDate(date: string) {
  return new Intl.DateTimeFormat('sv-SE', {
    dateStyle: 'long',
    timeStyle: 'short',
  }).format(new Date(date))
}

async function fetchEvents() {
  loading.value = true
  errorMessage.value = ''

  try {
    const { data, error } = await supabase
      .from('events')
      .select('id, title, description, event_date, location')
      .order('event_date', { ascending: true })

    if (error) throw error

    const now = Date.now()
    events.value = (data ?? []).sort((first, second) => {
      const firstDate = new Date(first.event_date).getTime()
      const secondDate = new Date(second.event_date).getTime()
      const firstPassed = firstDate < now
      const secondPassed = secondDate < now

      if (firstPassed !== secondPassed) return firstPassed ? 1 : -1
      return firstPassed ? secondDate - firstDate : firstDate - secondDate
    })
  } catch (error) {
    console.error('Could not fetch events:', error)
    errorMessage.value = 'Det gick inte att hämta aktiviteterna. Försök igen senare.'
  } finally {
    loading.value = false
  }
}

onMounted(fetchEvents)
</script>

<template>
  <main class="events-page">
    <header class="events-header">
      <div class="header-icon">
        <CalendarDays :size="26" />
      </div>
      <div class="header-content">
        <span class="eyebrow">EKEBY SPORTFISKEKLUBB</span>
        <h1>Aktiviteter</h1>
        <p>Se klubbens aktiviteter och kommande evenemang.</p>
      </div>
      <div v-if="isAdmin" class="header-actions">
        <CreateEvent @created="fetchEvents" />
      </div>
      <button class="refresh-button" type="button" :disabled="loading" @click="fetchEvents">
        <RefreshCw :size="16" />
        Uppdatera
      </button>
    </header>

    <div v-if="loading" class="state-card" aria-live="polite">
      <i class="pi pi-spin pi-spinner"></i>
      <p>Hämtar aktiviteter...</p>
    </div>

    <div v-else-if="errorMessage" class="state-card error-state" role="alert">
      <p>{{ errorMessage }}</p>
      <button class="retry-button" type="button" @click="fetchEvents">Försök igen</button>
    </div>

    <div v-else-if="events.length === 0" class="state-card">
      <CalendarDays :size="30" />
      <h2>Inga aktiviteter ännu</h2>
      <p>När nya aktiviteter läggs till visas de här.</p>
    </div>

    <section v-else class="event-list" aria-label="Aktiviteter">
      <article v-for="event in events" :key="event.id" class="event-card">
        <div class="event-topline">
          <div class="event-date">
            <CalendarDays :size="17" />
            <time :datetime="event.event_date">{{ formatEventDate(event.event_date) }}</time>
          </div>
          <span class="status-pill" :class="`status-${getEventStatus(event)}`">
            {{ getEventStatusLabel(event) }}
          </span>
        </div>
        <h2>{{ event.title }}</h2>
        <p class="event-description">{{ event.description }}</p>
        <div class="event-location">
          <MapPin :size="16" />
          {{ event.location }}
        </div>
        <EventComments :event-id="event.id" />
      </article>
    </section>
  </main>
</template>

<style scoped>
.events-page {
  width: min(100%, 1100px);
  margin: 0 auto;
  padding: 12px 0 48px;
  color: #25332b;
}

.events-header {
  display: flex;
  align-items: center;
  gap: 18px;
  margin-bottom: 28px;
}

.header-icon {
  display: flex;
  width: 58px;
  height: 58px;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  color: #285b43;
  background: #eaf1eb;
  border-radius: 12px;
}

.header-content {
  flex: 1;
}

.header-actions {
  flex-shrink: 0;
}

.eyebrow {
  color: #65816e;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.12em;
}

.events-header h1 {
  margin: 4px 0;
  font-size: 2rem;
  letter-spacing: -0.04em;
}

.events-header p {
  margin: 0;
  color: #718078;
}

.refresh-button,
.retry-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 9px 12px;
  border: 1px solid #e4e9e4;
  border-radius: 8px;
  color: #536c5c;
  background: #fff;
  font: inherit;
  cursor: pointer;
}

.refresh-button:disabled {
  opacity: 0.6;
  cursor: wait;
}

.event-list {
  display: grid;
  gap: 16px;
}

.event-card,
.state-card {
  background: #fff;
  border: 1px solid #e8ede8;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgb(30 55 38 / 4%);
}

.event-card {
  padding: 22px 24px;
}

.event-date,
.event-location {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #536c5c;
  font-size: 0.9rem;
}

.event-topline {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.status-pill {
  display: inline-flex;
  align-items: center;
  padding: 5px 9px;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 650;
  white-space: nowrap;
}

.status-next {
  color: #805713;
  background: #fff3d6;
}

.status-upcoming {
  color: #376b4c;
  background: #eaf3ec;
}

.status-passed {
  color: #66746b;
  background: #f0f2f0;
}

.event-card h2 {
  margin: 13px 0 8px;
  font-size: 1.25rem;
}

.event-description {
  margin: 0 0 16px;
  color: #718078;
  line-height: 1.65;
  overflow-wrap: anywhere;
  white-space: pre-line;
}

.state-card {
  display: flex;
  min-height: 200px;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 24px;
  color: #718078;
  text-align: center;
}

.state-card p,
.state-card h2 {
  margin: 0;
}

.state-card h2 {
  color: #25332b;
  font-size: 1.15rem;
}

.error-state {
  color: #b42318;
}

@media (max-width: 650px) {
  .events-header {
    align-items: flex-start;
    flex-wrap: wrap;
    gap: 14px;
  }

  .header-content {
    min-width: calc(100% - 75px);
  }

  .events-header h1 {
    font-size: 1.8rem;
  }

  .header-actions {
    width: 100%;
    margin-left: 72px;
  }

  .refresh-button {
    margin-left: 72px;
  }

  .event-card {
    padding: 18px;
  }

  .event-topline {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>
