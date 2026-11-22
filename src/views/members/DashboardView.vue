<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { supabase } from '@/utils/supabase'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'
import {
  ArrowRight,
  CalendarDays,
  Clock,
  Fish,
  MapPin,
  Newspaper,
  Users,
  FileText,
  Waves,
  CloudSun,
} from 'lucide-vue-next'

interface Announcement {
  id: string
  title: string
  content: string
  created_at: string
  is_pinned: boolean
}

interface UpcomingEvent {
  id: string
  title: string
  description: string
  event_date: string
  location: string
}

const auth = useAuthStore()
const router = useRouter()

const announcements = ref<Announcement[]>([])
const upcomingEvents = ref<UpcomingEvent[]>([])
const loadingNews = ref(true)
const loadingEvents = ref(true)
const eventError = ref('')

const firstName = computed(() => {
  const name = auth.profile?.full_name?.trim()
  return name ? name.split(' ')[0] : 'medlem'
})

const today = new Intl.DateTimeFormat('sv-SE', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
}).format(new Date())

async function fetchAnnouncements() {
  loadingNews.value = true

  const { data, error } = await supabase
    .from('announcements')
    .select('id, title, content, created_at, is_pinned')
    .order('is_pinned', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(3)

  if (error) {
    console.error('Could not fetch announcements:', error)
  } else {
    announcements.value = data ?? []
  }

  loadingNews.value = false
}

async function fetchUpcomingEvents() {
  loadingEvents.value = true
  eventError.value = ''

  try {
    const { data, error } = await supabase
      .from('events')
      .select('id, title, description, event_date, location')
      .gte('event_date', new Date().toISOString())
      .order('event_date', { ascending: true })
      .limit(3)

    if (error) throw error

    upcomingEvents.value = data ?? []
  } catch (error) {
    console.error('Could not fetch upcoming events:', error)
    eventError.value = 'Det gick inte att hämta aktiviteterna.'
  } finally {
    loadingEvents.value = false
  }
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat('sv-SE', {
    day: 'numeric',
    month: 'short',
  }).format(new Date(date))
}

function formatEventDate(date: string) {
  return new Intl.DateTimeFormat('sv-SE', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date))
}

function goTo(path: string) {
  router.push(path)
}

onMounted(() => {
  fetchAnnouncements()
  fetchUpcomingEvents()
})
</script>

<template>
  <div class="dashboard">
    <!-- Welcome -->
    <section class="welcome-section">
      <div class="welcome-content">
        <div class="welcome-eyebrow">
          <Waves :size="15" />
          EKEBY SPORTFISKEKLUBB
        </div>

        <h1>Välkommen tillbaka, {{ firstName }}!</h1>

        <p>Här hittar du det senaste från klubben och allt du behöver inför nästa fisketur.</p>

        <div class="welcome-date">
          <CalendarDays :size="15" />
          {{ today }}
        </div>
      </div>

      <div class="welcome-decoration">
        <Fish :size="150" :stroke-width="0.8" />
      </div>
    </section>

    <!-- Quick links -->
    <section class="quick-links">
      <button class="quick-link" @click="goTo('/members/news')">
        <span class="quick-icon green">
          <Newspaper :size="20" />
        </span>
        <span class="quick-text">
          <strong>Senaste nytt</strong>
          <small>Nyheter från klubben</small>
        </span>
        <ArrowRight :size="17" class="quick-arrow" />
      </button>

      <button class="quick-link" @click="goTo('/members/events')">
        <span class="quick-icon blue">
          <CalendarDays :size="20" />
        </span>
        <span class="quick-text">
          <strong>Aktiviteter</strong>
          <small>Se kommande aktiviteter</small>
        </span>
        <ArrowRight :size="17" class="quick-arrow" />
      </button>

      <button class="quick-link" @click="goTo('/members/directory')">
        <span class="quick-icon orange">
          <Users :size="20" />
        </span>
        <span class="quick-text">
          <strong>Medlemmar</strong>
          <small>Träffa klubbens medlemmar</small>
        </span>
        <ArrowRight :size="17" class="quick-arrow" />
      </button>

      <button class="quick-link" @click="goTo('/members/documents')">
        <span class="quick-icon purple">
          <FileText :size="20" />
        </span>
        <span class="quick-text">
          <strong>Dokument</strong>
          <small>Regler och information</small>
        </span>
        <ArrowRight :size="17" class="quick-arrow" />
      </button>
    </section>

    <!-- Main content -->
    <div class="dashboard-grid">
      <!-- Latest news -->
      <section class="content-card news-section">
        <div class="section-heading">
          <div>
            <span class="section-eyebrow">FRÅN KLUBBEN</span>
            <h2>Senaste nytt</h2>
          </div>

          <button class="text-link" @click="goTo('/news')">
            Alla nyheter
            <ArrowRight :size="15" />
          </button>
        </div>

        <div v-if="loadingNews" class="loading-state">Hämtar nyheter...</div>

        <div v-else-if="announcements.length === 0" class="empty-news">
          <Newspaper :size="25" />
          <p>Det finns inga nyheter publicerade ännu.</p>
        </div>

        <div v-else class="announcement-list">
          <article
            v-for="announcement in announcements"
            :key="announcement.id"
            class="announcement"
          >
            <div class="announcement-date">
              {{ formatDate(announcement.created_at) }}
            </div>

            <div class="announcement-content">
              <div class="announcement-title">
                {{ announcement.title }}
                <span v-if="announcement.is_pinned" class="pinned"> Viktigt </span>
              </div>

              <p>{{ announcement.content }}</p>
            </div>
          </article>
        </div>
      </section>

      <!-- Sidebar -->
      <aside class="sidebar">
        <!-- Upcoming events placeholder -->
        <section class="content-card events-card">
          <div class="section-heading">
            <div>
              <span class="section-eyebrow">PLANERA FRAMÅT</span>
              <h2>Kommande aktiviteter</h2>
            </div>
            <CalendarDays :size="19" class="heading-icon" />
          </div>

          <div v-if="loadingEvents" class="event-loading" aria-live="polite">
            <i class="pi pi-spin pi-spinner"></i>
            <span>Hämtar aktiviteter...</span>
          </div>

          <p v-else-if="eventError" class="event-error" role="alert">
            {{ eventError }}
          </p>

          <div v-else-if="upcomingEvents.length" class="upcoming-events">
            <article
              v-for="(event, index) in upcomingEvents"
              :key="event.id"
              class="upcoming-event"
            >
              <div class="upcoming-event-topline">
                <span class="upcoming-event-date">
                  <CalendarDays :size="14" />
                  {{ formatEventDate(event.event_date) }}
                </span>
                <span
                  class="event-status-pill"
                  :class="index === 0 ? 'event-status-next' : 'event-status-upcoming'"
                >
                  {{ index === 0 ? 'Nästa' : 'Kommande' }}
                </span>
              </div>
              <strong>{{ event.title }}</strong>
              <p>{{ event.description }}</p>
              <span class="upcoming-event-location">
                <MapPin :size="14" />
                {{ event.location }}
              </span>
            </article>
          </div>

          <div v-else class="placeholder-content">
            <div class="placeholder-icon">
              <MapPin :size="23" />
            </div>
            <strong>Inga aktiviteter att visa</strong>
            <p>Här kommer du kunna se fisketävlingar, klubbträffar och andra aktiviteter.</p>
          </div>

          <button class="full-width-link" @click="goTo('/members/events')">
            Visa alla aktiviteter
            <ArrowRight :size="15" />
          </button>
        </section>

        <!-- Club info -->
        <section class="club-card">
          <div class="club-card-icon">
            <Fish :size="22" />
          </div>

          <span class="section-eyebrow">EKEBY SPORTFISKEKLUBB</span>
          <h3>Gemenskap vid vattnet.</h3>
          <p>En plats för fiskeintresserade att dela erfarenheter, kunskap och fina stunder.</p>

          <div class="club-card-footer">
            <Waves :size="15" />
            Tillsammans vid vattnet
          </div>
        </section>
      </aside>
    </div>
  </div>
</template>

<style scoped>
.dashboard {
  max-width: 1200px;
  margin: 0 auto;
  padding: 12px 0 48px;
}

/* Welcome banner */
.welcome-section {
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 225px;
  padding: 38px 42px;
  border-radius: 18px;
  background: linear-gradient(115deg, #1d4935 0%, #326b4d 100%);
  color: white;
  margin-bottom: 25px;
}

.welcome-content {
  position: relative;
  z-index: 1;
  max-width: 600px;
}

.welcome-eyebrow {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #c3ddc9;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 1.7px;
  margin-bottom: 17px;
}

.welcome-section h1 {
  font-size: clamp(27px, 4vw, 36px);
  line-height: 1.2;
  letter-spacing: -1px;
  margin: 0 0 12px;
  font-weight: 650;
}

.welcome-section p {
  color: #d5e4d9;
  font-size: 14px;
  line-height: 1.7;
  max-width: 490px;
  margin: 0;
}

.welcome-date {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 23px;
  color: #d5e4d9;
  font-size: 12px;
  text-transform: capitalize;
}

.welcome-decoration {
  position: absolute;
  right: 55px;
  top: 50%;
  transform: translateY(-50%) rotate(-15deg);
  color: rgb(255 255 255 / 12%);
}

.welcome-decoration svg {
  width: 180px;
  height: 180px;
}

/* Quick links */
.quick-links {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 13px;
  margin-bottom: 30px;
}

.quick-link {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
  padding: 17px 15px;
  text-align: left;
  background: white;
  border: 1px solid #e9eee9;
  border-radius: 12px;
  cursor: pointer;
  transition: 0.2s ease;
}

.quick-link:hover {
  border-color: #b9cdbd;
  transform: translateY(-2px);
}

.quick-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  border-radius: 10px;
}

.quick-icon.green {
  background: #edf5ee;
  color: #477453;
}

.quick-icon.blue {
  background: #edf3f8;
  color: #527b9b;
}

.quick-icon.orange {
  background: #faf2e9;
  color: #a87842;
}

.quick-icon.purple {
  background: #f2eff8;
  color: #79649e;
}

.quick-text {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.quick-text strong {
  color: #304537;
  font-size: 13px;
  font-weight: 650;
}

.quick-text small {
  color: #8a958d;
  font-size: 11px;
  white-space: nowrap;
}

.quick-arrow {
  margin-left: auto;
  flex-shrink: 0;
  color: #a4afa6;
}

/* Main grid */
.dashboard-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.65fr) minmax(280px, 1fr);
  gap: 22px;
  align-items: start;
}

.sidebar {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.content-card {
  background: white;
  border: 1px solid #e9eee9;
  border-radius: 14px;
  padding: 25px;
}

.section-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 15px;
  margin-bottom: 22px;
}

.section-eyebrow {
  display: block;
  color: #72907a;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 1.3px;
  margin-bottom: 7px;
}

.section-heading h2 {
  margin: 0;
  color: #263c30;
  font-size: 19px;
  font-weight: 650;
  letter-spacing: -0.4px;
}

.text-link,
.full-width-link {
  display: flex;
  align-items: center;
  gap: 7px;
  border: none;
  background: transparent;
  color: #477453;
  font-size: 12px;
  font-weight: 650;
  white-space: nowrap;
  cursor: pointer;
}

.text-link:hover,
.full-width-link:hover {
  color: #244c34;
}

/* Announcements */
.announcement-list {
  display: flex;
  flex-direction: column;
}

.announcement {
  display: flex;
  gap: 20px;
  padding: 18px 0;
  border-top: 1px solid #eff2ef;
}

.announcement:first-child {
  border-top: none;
  padding-top: 0;
}

.announcement:last-child {
  padding-bottom: 0;
}

.announcement-date {
  flex-shrink: 0;
  width: 65px;
  padding-top: 2px;
  color: #829087;
  font-size: 11px;
  text-transform: capitalize;
}

.announcement-content {
  min-width: 0;
}

.announcement-title {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  color: #304537;
  font-size: 14px;
  font-weight: 650;
  margin-bottom: 7px;
}

.announcement-content p {
  color: #7c8980;
  font-size: 12px;
  line-height: 1.7;
  margin: 0;
  white-space: pre-line;
}

.pinned {
  display: inline-flex;
  align-items: center;
  background: #edf5ee;
  color: #477453;
  padding: 3px 7px;
  border-radius: 5px;
  font-size: 9px;
  font-weight: 700;
}

.loading-state,
.empty-news {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 10px;
  min-height: 160px;
  color: #87938a;
  font-size: 13px;
  text-align: center;
}

.empty-news p {
  margin: 0;
}

/* Events */
.heading-icon {
  color: #6b9276;
}

.placeholder-content {
  display: flex;
  align-items: center;
  flex-direction: column;
  text-align: center;
  padding: 15px 10px 23px;
}

.placeholder-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 13px;
  background: #edf5ee;
  color: #527a62;
  margin-bottom: 13px;
}

.placeholder-content strong {
  color: #405447;
  font-size: 13px;
}

.placeholder-content p {
  color: #89948c;
  font-size: 12px;
  line-height: 1.7;
  max-width: 230px;
  margin: 8px 0 0;
}

.event-loading,
.event-error {
  min-height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 9px;
  color: #87938a;
  font-size: 12px;
  text-align: center;
}

.event-error {
  color: #b42318;
}

.upcoming-events {
  display: flex;
  flex-direction: column;
}

.upcoming-event {
  display: flex;
  flex-direction: column;
  gap: 7px;
  padding: 13px 0;
  border-top: 1px solid #eff2ef;
}

.upcoming-event:first-child {
  padding-top: 0;
  border-top: 0;
}

.upcoming-event:last-child {
  padding-bottom: 20px;
}

.upcoming-event-date,
.upcoming-event-location {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: #6b8271;
  font-size: 11px;
}

.upcoming-event-topline {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.event-status-pill {
  display: inline-flex;
  align-items: center;
  padding: 4px 8px;
  border-radius: 999px;
  font-size: 10px;
  font-weight: 700;
  white-space: nowrap;
}

.event-status-next {
  color: #805713;
  background: #fff3d6;
}

.event-status-upcoming {
  color: #376b4c;
  background: #eaf3ec;
}

.upcoming-event strong {
  color: #405447;
  font-size: 13px;
}

.upcoming-event p {
  display: -webkit-box;
  margin: 0;
  overflow: hidden;
  color: #89948c;
  font-size: 12px;
  line-height: 1.6;
  overflow-wrap: anywhere;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
}

.full-width-link {
  justify-content: center;
  width: 100%;
  border-top: 1px solid #eff2ef;
  padding-top: 17px;
}

/* Club card */
.club-card {
  padding: 24px;
  border-radius: 14px;
  background: #edf3ed;
  color: #345640;
}

.club-card-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 42px;
  height: 42px;
  background: white;
  border-radius: 11px;
  margin-bottom: 20px;
}

.club-card .section-eyebrow {
  color: #72907a;
}

.club-card h3 {
  color: #2d4937;
  font-size: 21px;
  line-height: 1.3;
  letter-spacing: -0.5px;
  margin: 0 0 10px;
}

.club-card p {
  color: #718477;
  font-size: 12px;
  line-height: 1.8;
  margin: 0;
}

.club-card-footer {
  display: flex;
  align-items: center;
  gap: 7px;
  border-top: 1px solid #d9e5da;
  margin-top: 20px;
  padding-top: 15px;
  color: #66816e;
  font-size: 11px;
  font-weight: 600;
}

/* Responsive */
@media (max-width: 1050px) {
  .quick-links {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 750px) {
  .dashboard-grid {
    grid-template-columns: 1fr;
  }

  .welcome-section {
    padding: 30px 25px;
  }

  .welcome-decoration {
    right: -35px;
    opacity: 0.6;
  }
}

@media (max-width: 480px) {
  .quick-links {
    grid-template-columns: 1fr;
  }

  .quick-link {
    padding: 14px;
  }

  .content-card {
    padding: 20px;
  }

  .announcement {
    gap: 10px;
  }

  .announcement-date {
    width: 58px;
  }
}
</style>
