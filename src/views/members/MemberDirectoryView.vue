<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { Mail, RefreshCw, Users } from 'lucide-vue-next'
import { supabase } from '@/utils/supabase'

interface Member {
  full_name: string | null
  email: string
}

const members = ref<Member[]>([])
const loading = ref(true)
const errorMessage = ref('')

async function fetchMembers() {
  loading.value = true
  errorMessage.value = ''

  try {
    const { data, error } = await supabase.rpc('get_active_member_directory')

    if (error) throw error

    members.value = data ?? []
  } catch (error) {
    console.error('Could not fetch member directory:', error)
    errorMessage.value = 'Det gick inte att hämta medlemslistan. Försök igen senare.'
  } finally {
    loading.value = false
  }
}

onMounted(fetchMembers)
</script>

<template>
  <main class="directory-page">
    <header class="directory-header">
      <div class="header-icon">
        <Users :size="26" />
      </div>
      <div class="header-content">
        <span class="eyebrow">EKEBY SPORTFISKEKLUBB</span>
        <h1>Medlemmar</h1>
        <p>Hitta klubbens medlemmar och kontakta dem via e-post.</p>
      </div>
      <button class="refresh-button" type="button" :disabled="loading" @click="fetchMembers">
        <RefreshCw :size="16" />
        Uppdatera
      </button>
    </header>

    <div v-if="loading" class="state-card" aria-live="polite">
      <i class="pi pi-spin pi-spinner"></i>
      <p>Hämtar medlemmar...</p>
    </div>

    <div v-else-if="errorMessage" class="state-card error-state" role="alert">
      <p>{{ errorMessage }}</p>
      <button class="retry-button" type="button" @click="fetchMembers">Försök igen</button>
    </div>

    <div v-else-if="members.length === 0" class="state-card">
      <Users :size="30" />
      <h2>Inga medlemmar att visa</h2>
    </div>

    <section v-else class="member-grid" aria-label="Medlemslista">
      <article v-for="member in members" :key="member.email" class="member-card">
        <div class="member-icon">
          <Users :size="20" />
        </div>
        <div class="member-info">
          <h2>{{ member.full_name || 'Namn saknas' }}</h2>
          <a :href="`mailto:${member.email}`">
            <Mail :size="15" />
            {{ member.email }}
          </a>
        </div>
      </article>
    </section>
  </main>
</template>

<style scoped>
.directory-page {
  width: min(100%, 1100px);
  margin: 0 auto;
  padding: 12px 0 48px;
  color: #25332b;
}

.directory-header {
  display: flex;
  align-items: center;
  gap: 18px;
  margin-bottom: 28px;
}

.header-icon,
.member-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: #285b43;
  background: #eaf1eb;
  border-radius: 12px;
}

.header-icon {
  width: 58px;
  height: 58px;
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

.directory-header h1 {
  margin: 4px 0;
  font-size: 2rem;
  letter-spacing: -0.04em;
}

.directory-header p {
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

.member-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 330px), 1fr));
  gap: 14px;
}

.member-card,
.state-card {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 20px;
  background: #fff;
  border: 1px solid #e8ede8;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgb(30 55 38 / 4%);
}

.member-icon {
  width: 44px;
  height: 44px;
}

.member-info {
  min-width: 0;
}

.member-info h2 {
  margin: 0 0 7px;
  font-size: 1rem;
}

.member-info a {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  color: #38664b;
  font-size: 0.9rem;
  overflow-wrap: anywhere;
  text-decoration: none;
}

.member-info a:hover {
  text-decoration: underline;
}

.state-card {
  min-height: 200px;
  flex-direction: column;
  justify-content: center;
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
  .directory-header {
    align-items: flex-start;
    flex-wrap: wrap;
    gap: 14px;
  }

  .header-content {
    min-width: calc(100% - 75px);
  }

  .directory-header h1 {
    font-size: 1.8rem;
  }

  .refresh-button {
    margin-left: 72px;
  }
}
</style>
