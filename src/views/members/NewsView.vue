<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'

import { useAuthStore } from '@/stores/auth'
import { supabase } from '@/utils/supabase'

import PublicNavigation from '@/components/layout/PublicNavigation.vue'
import CreateAnnouncement from '../members/CreateAnnouncement.vue'

import Card from 'primevue/card'
import Button from 'primevue/button'

import { Newspaper, CalendarDays, Pin, Globe, LockKeyhole, RefreshCw } from 'lucide-vue-next'

interface Announcement {
  id: number
  title: string
  content: string
  is_public: boolean
  is_pinned: boolean
  created_at: string
  created_by: string | null
}

const auth = useAuthStore()
const route = useRoute()

const announcements = ref<Announcement[]>([])
const loading = ref(true)
const errorMessage = ref('')

// Only active members are allowed to see member-only news.
const isActiveMember = computed(() => !!auth.user && auth.profile?.membership_status === 'active')

const isAdmin = computed(() => isActiveMember.value && auth.profile?.role === 'admin')

// PublicNavigation is already rendered by the public layout.
const showPublicNavigation = computed(() => !route.path.startsWith('/members'))

const pageDescription = computed(() =>
  isActiveMember.value
    ? 'Här hittar du senaste nytt från klubben, information och meddelanden till våra medlemmar.'
    : 'Här hittar du senaste nytt och information från Ekeby Sportfiskeklubb.',
)

function formatDate(date: string) {
  return new Intl.DateTimeFormat('sv-SE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date))
}

async function fetchAnnouncements() {
  loading.value = true
  errorMessage.value = ''

  try {
    let query = supabase
      .from('announcements')
      .select('id, title, content, is_public, is_pinned, created_at, created_by')

    // Visitors and non-active users can only retrieve public announcements.
    if (!isActiveMember.value) {
      query = query.eq('is_public', true)
    }

    const { data, error } = await query
      .order('is_pinned', { ascending: false })
      .order('created_at', { ascending: false })

    if (error) throw error

    announcements.value = data ?? []
  } catch (error) {
    console.error('Could not fetch announcements:', error)
    errorMessage.value = 'Det gick inte att hämta nyheterna. Försök igen senare.'
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  await auth.initialize()

  if (auth.user && !auth.profile) {
    await auth.loadProfile()
  }

  await fetchAnnouncements()
})
</script>

<template>
  <div class="news-page">
    <PublicNavigation v-if="showPublicNavigation" />

    <main class="news-container">
      <!-- Page header -->
      <header class="news-header">
        <div class="header-icon">
          <Newspaper :size="27" />
        </div>

        <div class="header-content">
          <span class="eyebrow">EKEBY SPORTFISKEKLUBB</span>
          <h1>Nyheter</h1>
          <p>{{ pageDescription }}</p>
        </div>

        <div v-if="isAdmin" class="header-actions">
          <CreateAnnouncement @created="fetchAnnouncements" />
        </div>
      </header>

      <!-- Member information -->
      <div v-if="isActiveMember" class="access-info">
        <LockKeyhole :size="17" />
        <span>Du ser både offentliga nyheter och medlemsinformation.</span>
      </div>

      <div v-else class="access-info public-info">
        <Globe :size="17" />
        <span>Du visar offentliga nyheter. Logga in som medlem för att läsa all information.</span>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="loading-state">
        <i class="pi pi-spin pi-spinner"></i>
        <p>Hämtar nyheter...</p>
      </div>

      <!-- Error -->
      <div v-else-if="errorMessage" class="empty-state">
        <p>{{ errorMessage }}</p>
        <Button label="Försök igen" severity="secondary" outlined @click="fetchAnnouncements">
          <RefreshCw :size="16" />
        </Button>
      </div>

      <!-- No news -->
      <div v-else-if="announcements.length === 0" class="empty-state">
        <div class="empty-icon">
          <Newspaper :size="30" />
        </div>
        <h2>Inga nyheter ännu</h2>
        <p>Det finns inga publicerade nyheter att visa just nu.</p>
      </div>

      <!-- News list -->
      <section v-else class="announcements-section">
        <div class="section-heading">
          <div>
            <h2>Senaste nytt</h2>
            <p>{{ announcements.length }} publicerade nyheter</p>
          </div>

          <button class="refresh-button" @click="fetchAnnouncements">
            <RefreshCw :size="16" />
            Uppdatera
          </button>
        </div>

        <div class="announcement-list">
          <Card
            v-for="announcement in announcements"
            :key="announcement.id"
            class="announcement-card"
            :class="{ 'important-card': announcement.is_pinned }"
          >
            <template #content>
              <article>
                <div class="announcement-meta">
                  <div class="meta-left">
                    <span v-if="announcement.is_pinned" class="news-label pinned">
                      <Pin :size="13" />
                      Viktigt meddelande
                    </span>

                    <span class="news-label" :class="announcement.is_public ? 'public' : 'members'">
                      <Globe v-if="announcement.is_public" :size="13" />
                      <LockKeyhole v-else :size="13" />
                      {{ announcement.is_public ? 'Offentlig' : 'Endast medlemmar' }}
                    </span>
                  </div>

                  <span class="news-date">
                    <CalendarDays :size="14" />
                    {{ formatDate(announcement.created_at) }}
                  </span>
                </div>

                <h3>{{ announcement.title }}</h3>

                <p class="announcement-content">
                  {{ announcement.content }}
                </p>
              </article>
            </template>
          </Card>
        </div>
      </section>
    </main>
  </div>
</template>

<style scoped>
.news-page {
  min-height: 100vh;
  background: #f8faf8;
  color: #25332b;
}

.news-container {
  width: min(100% - 40px, 1000px);
  margin: 0 auto;
  padding: 65px 0 100px;
}

.news-header {
  display: flex;
  align-items: center;
  gap: 22px;
  margin-bottom: 35px;
}

.header-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 65px;
  height: 65px;
  flex-shrink: 0;
  color: #285b43;
  background: #eaf1eb;
  border-radius: 16px;
}

.header-content {
  flex: 1;
}

.eyebrow {
  color: #65816e;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.12em;
}

.news-header h1 {
  margin: 5px 0;
  font-size: 2.4rem;
  letter-spacing: -0.045em;
}

.news-header p {
  margin: 0;
  color: #718078;
  line-height: 1.6;
}

.access-info {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 15px 18px;
  margin-bottom: 35px;
  color: #285b43;
  background: #eaf1eb;
  border: 1px solid #dce8de;
  border-radius: 10px;
  font-size: 0.88rem;
}

.public-info {
  color: #536c5c;
  background: #f0f3f0;
  border-color: #e4e9e4;
}

.section-heading {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.section-heading h2 {
  margin: 0;
  font-size: 1.35rem;
}

.section-heading p {
  margin: 5px 0 0;
  color: #849087;
  font-size: 0.85rem;
}

.refresh-button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 9px 12px;
  color: #536c5c;
  background: white;
  border: 1px solid #e4e9e4;
  border-radius: 8px;
  cursor: pointer;
}

.announcement-list {
  display: flex;
  flex-direction: column;
  gap: 17px;
}

.announcement-card {
  background: #ffffff;
  color: black;
  border: 1px solid #e8ede8;
  border-left: 4px solid transparent;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgb(30 55 38 / 4%);
  transition:
    box-shadow 0.2s ease,
    transform 0.2s ease;
}

.announcement-card :deep(.p-card-body) {
  padding: 26px 28px;
}

.announcement-card :deep(.p-card-content) {
  padding: 0;
}

/* Important announcements */
.announcement-card.important-card {
  border-left-color: #d69a32;
  background: #ffffff;
}

.announcement-card.important-card .news-label.pinned {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  color: #805713;
  background: #fff3d6;
  border: 1px solid #f3dfb2;
  border-radius: 6px;
  padding: 5px 9px;
  font-size: 0.72rem;
  font-weight: 700;
}

.announcement-meta,
.meta-left {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
}

.announcement-meta {
  justify-content: space-between;
  margin-bottom: 17px;
}

.news-label {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 5px 9px;
  border-radius: 6px;
  font-size: 0.72rem;
  font-weight: 600;
}

.news-label.pinned {
  color: #86651e;
  background: #fbf3dc;
}

.news-label.public {
  color: #376b4c;
  background: #eaf3ec;
}

.news-label.members {
  color: #596a87;
  background: #edf0f7;
}

.news-date {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: #89938c;
  font-size: 0.8rem;
}

.announcement-card h3 {
  margin: 0 0 13px;
  font-size: 1.3rem;
  letter-spacing: -0.02em;
}

.announcement-content {
  margin: 0;
  color: #66746b;
  font-size: 0.96rem;
  line-height: 1.85;
  white-space: pre-line;
  overflow-wrap: anywhere;
}

.loading-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 260px;
  padding: 35px;
  text-align: center;
  background: white;
  border: 1px solid #e8ede8;
  border-radius: 14px;
}

.loading-state {
  color: #718078;
}

.empty-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 60px;
  height: 60px;
  color: #66836e;
  background: #edf3ee;
  border-radius: 50%;
}

.empty-state h2 {
  margin: 18px 0 5px;
  font-size: 1.2rem;
}

.empty-state p {
  color: #849087;
  line-height: 1.6;
}

@media (max-width: 650px) {
  .news-container {
    width: min(100% - 32px, 1000px);
    padding-top: 40px;
  }

  .news-header {
    align-items: flex-start;
    flex-wrap: wrap;
    gap: 15px;
  }

  .header-icon {
    width: 52px;
    height: 52px;
  }

  .news-header h1 {
    font-size: 2rem;
  }

  .header-actions {
    width: 100%;
  }

  .announcement-card :deep(.p-card-body) {
    padding: 20px;
  }

  .announcement-meta {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>
