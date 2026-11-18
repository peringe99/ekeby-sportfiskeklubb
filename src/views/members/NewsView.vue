<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { supabase } from '@/utils/supabase'
import { CalendarDays, Pin, Newspaper, RefreshCw } from 'lucide-vue-next'

interface Announcement {
  id: string
  title: string
  content: string
  is_public: boolean
  is_pinned: boolean
  created_at: string
  created_by: string | null
}

const announcements = ref<Announcement[]>([])
const loading = ref(true)
const errorMessage = ref('')

async function fetchAnnouncements() {
  loading.value = true
  errorMessage.value = ''

  const { data, error } = await supabase
    .from('announcements')
    .select('id, title, content, is_public, is_pinned, created_at, created_by')
    .order('is_pinned', { ascending: false })
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Could not fetch announcements:', error)
    errorMessage.value = 'Kunde inte hämta nyheterna. Försök igen.'
  } else {
    announcements.value = data ?? []
  }

  loading.value = false
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat('sv-SE', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(date))
}

onMounted(fetchAnnouncements)
</script>

<template>
  <div class="news-page">
    <header class="page-header">
      <div>
        <div class="eyebrow">
          <Newspaper :size="15" />
          KLUBBINFORMATION
        </div>

        <h1>Senaste nytt</h1>
        <p>Håll dig uppdaterad om vad som händer i Ekeby Sportfiskeklubb.</p>
      </div>

      <button class="refresh-button" :disabled="loading" @click="fetchAnnouncements">
        <RefreshCw :size="16" :class="{ spinning: loading }" />
        Uppdatera
      </button>
    </header>

    <div v-if="loading" class="loading-state">Hämtar senaste nytt...</div>

    <div v-else-if="errorMessage" class="error-state">
      {{ errorMessage }}
      <button @click="fetchAnnouncements">Försök igen</button>
    </div>

    <div v-else-if="announcements.length === 0" class="empty-state">
      <div class="empty-icon">
        <Newspaper :size="28" />
      </div>

      <h2>Inga nyheter ännu</h2>
      <p>När klubben publicerar nyheter och uppdateringar hittar du dem här.</p>
    </div>

    <div v-else class="news-list">
      <article
        v-for="announcement in announcements"
        :key="announcement.id"
        class="news-card"
        :class="{ pinned: announcement.is_pinned }"
      >
        <div class="news-meta">
          <span v-if="announcement.is_pinned" class="pinned-label">
            <Pin :size="13" />
            Viktigt
          </span>

          <span class="date">
            <CalendarDays :size="14" />
            {{ formatDate(announcement.created_at) }}
          </span>

          <span class="visibility-label">
            {{ announcement.is_public ? 'Offentlig nyhet' : 'Medlemsnyhet' }}
          </span>
        </div>

        <h2>{{ announcement.title }}</h2>

        <p class="news-content">{{ announcement.content }}</p>
      </article>
    </div>
  </div>
</template>

<style scoped>
.news-page {
  max-width: 1000px;
  margin: 0 auto;
  padding: 12px 0 48px;
}

.page-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 24px;
  margin-bottom: 36px;
}

.eyebrow {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #527a62;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 1.5px;
  margin-bottom: 12px;
}

.page-header h1 {
  margin: 0;
  color: #203b2e;
  font-size: clamp(30px, 4vw, 38px);
  font-weight: 700;
  letter-spacing: -1.2px;
}

.page-header p {
  color: #78847c;
  margin: 10px 0 0;
  font-size: 15px;
}

.refresh-button {
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 11px 16px;
  border: 1px solid #e2e9e3;
  border-radius: 9px;
  background: white;
  color: #365b45;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.refresh-button:hover {
  background: #f3f7f3;
}

.refresh-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.news-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.news-card {
  background: white;
  border: 1px solid #e9eee9;
  border-radius: 14px;
  padding: 25px 28px;
  transition:
    border-color 0.2s,
    box-shadow 0.2s;
}

.news-card:hover {
  border-color: #cbd9ce;
  box-shadow: 0 5px 20px rgb(30 60 40 / 4%);
}

.news-card.pinned {
  border-left: 3px solid #4c8060;
}

.news-meta {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 14px;
  margin-bottom: 17px;
  font-size: 12px;
}

.date {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #849087;
}

.pinned-label {
  display: flex;
  align-items: center;
  gap: 5px;
  color: #477453;
  font-weight: 700;
}

.visibility-label {
  color: #758078;
  background: #f2f5f2;
  padding: 5px 9px;
  border-radius: 20px;
}

.news-card h2 {
  margin: 0 0 12px;
  color: #263c30;
  font-size: 20px;
  font-weight: 650;
  letter-spacing: -0.3px;
}

.news-content {
  color: #68766d;
  font-size: 14px;
  line-height: 1.8;
  white-space: pre-line;
  margin: 0;
}

.loading-state,
.empty-state,
.error-state {
  background: white;
  border: 1px solid #e9eee9;
  border-radius: 14px;
  padding: 48px 24px;
  text-align: center;
  color: #78847c;
}

.empty-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 58px;
  height: 58px;
  background: #edf4ee;
  color: #527a62;
  border-radius: 16px;
  margin-bottom: 16px;
}

.empty-state h2 {
  color: #263c30;
  font-size: 18px;
  margin: 0 0 8px;
}

.empty-state p {
  margin: 0;
  font-size: 14px;
}

.error-state button {
  display: block;
  margin: 15px auto 0;
  border: none;
  background: none;
  color: #477453;
  font-weight: 600;
  cursor: pointer;
}

.spinning {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 600px) {
  .page-header {
    align-items: flex-start;
    flex-direction: column;
  }

  .news-card {
    padding: 21px;
  }
}
</style>
