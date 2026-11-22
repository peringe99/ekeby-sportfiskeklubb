<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { ChevronDown, Fish, MapPin, Scale, RefreshCw } from 'lucide-vue-next'
import { useAuthStore } from '@/stores/auth'
import { supabase } from '@/utils/supabase'
import PublicNavigation from '@/components/layout/PublicNavigation.vue'

interface FishingReport {
  fish_type: string
  weight: number
  location: string
  description: string
  image_path: string | null
}

const imageBucket = 'fishing-report-images'
const maxImageSize = 5 * 1024 * 1024
const imageExtensions: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
}

const auth = useAuthStore()
const route = useRoute()

const reports = ref<FishingReport[]>([])
const fishType = ref('')
const weight = ref<number | null>(null)
const location = ref('')
const description = ref('')
const imageFile = ref<File | null>(null)
const imagePreview = ref('')
const imageInput = ref<HTMLInputElement | null>(null)
const isFormExpanded = ref(false)
const loading = ref(true)
const submitting = ref(false)
const errorMessage = ref('')
const submitError = ref('')
const successMessage = ref('')

const isActiveMember = computed(() => !!auth.user && auth.profile?.membership_status === 'active')
const showPublicNavigation = computed(() => !route.path.startsWith('/members'))

async function fetchReports() {
  loading.value = true
  errorMessage.value = ''

  try {
    const { data, error } = await supabase
      .from('fishing_reports')
      .select('fish_type, weight, location, description, image_path')

    if (error) throw error

    reports.value = data ?? []
  } catch (error) {
    console.error('Could not fetch fishing reports:', error)
    errorMessage.value = 'Det gick inte att hämta fångsterna. Försök igen senare.'
  } finally {
    loading.value = false
  }
}

function handleImageSelection(event: Event) {
  const input = event.currentTarget as HTMLInputElement
  const file = input.files?.[0]

  if (!file) return

  if (!imageExtensions[file.type] || file.size > maxImageSize) {
    clearImageSelection()
    submitError.value = 'Välj en JPG-, PNG- eller WebP-bild som är mindre än 5 MB.'
    return
  }

  if (imagePreview.value) URL.revokeObjectURL(imagePreview.value)
  imageFile.value = file
  imagePreview.value = URL.createObjectURL(file)
  submitError.value = ''
}

function clearImageSelection() {
  if (imagePreview.value) URL.revokeObjectURL(imagePreview.value)
  imageFile.value = null
  imagePreview.value = ''
  if (imageInput.value) imageInput.value.value = ''
}

function getPublicImageUrl(path: string) {
  return supabase.storage.from(imageBucket).getPublicUrl(path).data.publicUrl
}

async function addReport() {
  submitError.value = ''
  successMessage.value = ''
  const reportWeight = weight.value

  if (!isActiveMember.value || !auth.user) {
    submitError.value = 'Endast aktiva medlemmar kan lägga till fångster.'
    return
  }

  if (
    !fishType.value.trim() ||
    !location.value.trim() ||
    !description.value.trim() ||
    reportWeight === null ||
    !Number.isFinite(reportWeight) ||
    reportWeight <= 0
  ) {
    submitError.value = 'Fyll i alla fält och ange en vikt som är större än noll.'
    return
  }

  submitting.value = true
  let uploadedImagePath: string | null = null

  try {
    if (imageFile.value) {
      const extension = imageExtensions[imageFile.value.type]
      const imagePath = `${auth.user.id}/${crypto.randomUUID()}.${extension}`

      const { error: uploadError } = await supabase.storage
        .from(imageBucket)
        .upload(imagePath, imageFile.value, {
          cacheControl: '3600',
          contentType: imageFile.value.type,
          upsert: false,
        })

      if (uploadError) throw uploadError
      uploadedImagePath = imagePath
    }

    const { error } = await supabase.from('fishing_reports').insert({
      user_id: auth.user.id,
      fish_type: fishType.value.trim(),
      weight: reportWeight,
      location: location.value.trim(),
      description: description.value.trim(),
      image_path: uploadedImagePath,
    })

    if (error) throw error

    uploadedImagePath = null
    fishType.value = ''
    weight.value = null
    location.value = ''
    description.value = ''
    clearImageSelection()
    successMessage.value = 'Fångsten har lagts till.'
    await fetchReports()
  } catch (error) {
    console.error('Could not add fishing report:', error)
    if (uploadedImagePath) {
      const { error: cleanupError } = await supabase.storage
        .from(imageBucket)
        .remove([uploadedImagePath])

      if (cleanupError) {
        console.error('Could not remove the uploaded fishing report image:', cleanupError)
      }
    }
    submitError.value =
      'Det gick inte att lägga till fångsten. Kontrollera dina behörigheter och försök igen.'
  } finally {
    submitting.value = false
  }
}

onUnmounted(clearImageSelection)

onMounted(async () => {
  await auth.initialize()

  if (auth.user && !auth.profile) {
    await auth.loadProfile()
  }

  await fetchReports()
})
</script>

<template>
  <div class="catches-page">
    <PublicNavigation v-if="showPublicNavigation" />

    <main class="catches-container">
      <header class="catches-header">
        <div class="header-icon">
          <Fish :size="27" />
        </div>
        <div>
          <span class="eyebrow">EKEBY SPORTFISKEKLUBB</span>
          <h1>Fångster</h1>
          <p>Se klubbens fångster från vattnen runt omkring oss.</p>
        </div>
      </header>

      <section v-if="isActiveMember" class="report-form-card">
        <h2 class="form-toggle-heading">
          <button
            class="form-toggle-button"
            type="button"
            aria-controls="report-form"
            :aria-expanded="isFormExpanded"
            @click="isFormExpanded = !isFormExpanded"
          >
            <span class="form-toggle-text">
              <span class="form-toggle-title">Lägg till en fångst</span>
              <small>{{ isFormExpanded ? 'Dölj formuläret' : 'Visa formuläret' }}</small>
            </span>
            <ChevronDown :size="20" :class="{ expanded: isFormExpanded }" />
          </button>
        </h2>
        <form
          id="report-form"
          v-show="isFormExpanded"
          class="report-form"
          @submit.prevent="addReport"
        >
          <div class="form-grid">
            <label>
              Fiskart
              <input v-model="fishType" required maxlength="100" placeholder="Exempel: Gädda" />
            </label>

            <label>
              Vikt (kg)
              <input
                v-model.number="weight"
                required
                type="number"
                min="0.001"
                step="any"
                placeholder="Exempel: 2.4"
              />
            </label>

            <label class="full-width">
              Plats
              <input
                v-model="location"
                required
                maxlength="150"
                placeholder="Var fångades fisken?"
              />
            </label>

            <label class="full-width">
              Beskrivning
              <textarea
                v-model="description"
                required
                maxlength="2000"
                rows="4"
                placeholder="Berätta mer om fångsten..."
              ></textarea>
            </label>

            <label class="full-width">
              Bild (valfritt)
              <input
                ref="imageInput"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                @change="handleImageSelection"
              />
              <small>JPG, PNG eller WebP, max 5 MB.</small>
            </label>

            <div v-if="imagePreview" class="image-preview full-width">
              <img :src="imagePreview" alt="Förhandsvisning av vald fångstbild" />
              <button type="button" class="remove-image-button" @click="clearImageSelection">
                Ta bort bild
              </button>
            </div>
          </div>

          <p v-if="submitError" class="form-message error-message" role="alert">
            {{ submitError }}
          </p>
          <p v-if="successMessage" class="form-message success-message" role="status">
            {{ successMessage }}
          </p>

          <button class="submit-button" type="submit" :disabled="submitting">
            {{ submitting ? 'Sparar...' : 'Publicera fångst' }}
          </button>
        </form>
      </section>

      <section class="reports-section">
        <div class="section-heading">
          <div>
            <h2>Klubbens fångster</h2>
            <p>Fångsterna är synliga för alla.</p>
          </div>
          <button class="refresh-button" type="button" @click="fetchReports">
            <RefreshCw :size="16" />
            Uppdatera
          </button>
        </div>

        <div v-if="loading" class="empty-state" aria-live="polite">
          <i class="pi pi-spin pi-spinner"></i>
          <p>Hämtar fångster...</p>
        </div>

        <div v-else-if="errorMessage" class="empty-state" role="alert">
          <p>{{ errorMessage }}</p>
          <button class="submit-button" type="button" @click="fetchReports">Försök igen</button>
        </div>

        <div v-else-if="reports.length === 0" class="empty-state">
          <Fish :size="30" />
          <h3>Inga fångster ännu</h3>
          <p>Klubbens fångster visas här när de har publicerats.</p>
        </div>

        <div v-else class="report-list">
          <article v-for="(report, index) in reports" :key="index" class="report-card">
            <img
              v-if="report.image_path"
              class="report-image"
              :src="getPublicImageUrl(report.image_path)"
              :alt="`Bild på ${report.fish_type}`"
            />
            <div class="report-title">
              <div class="fish-icon">
                <Fish :size="20" />
              </div>
              <h3>{{ report.fish_type }}</h3>
            </div>
            <div class="report-details">
              <span><Scale :size="16" />{{ report.weight }} kg</span>
              <span><MapPin :size="16" />{{ report.location }}</span>
            </div>
            <p class="report-description">{{ report.description }}</p>
          </article>
        </div>
      </section>
    </main>
  </div>
</template>

<style scoped>
.catches-page {
  min-height: 100vh;
  background: #f8faf8;
  color: #25332b;
}

.catches-container {
  width: min(100% - 40px, 1000px);
  margin: 0 auto;
  padding: 55px 0 90px;
}

.catches-header {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 32px;
}

.header-icon,
.fish-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: #285b43;
  background: #eaf1eb;
  border-radius: 14px;
}

.header-icon {
  width: 62px;
  height: 62px;
}

.eyebrow {
  color: #65816e;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.12em;
}

.catches-header h1 {
  margin: 5px 0;
  font-size: 2.4rem;
  letter-spacing: -0.045em;
}

.catches-header p,
.section-heading p {
  margin: 0;
  color: #718078;
  line-height: 1.6;
}

.report-form-card,
.report-card,
.empty-state {
  background: #fff;
  border: 1px solid #e8ede8;
  border-radius: 14px;
  box-shadow: 0 2px 8px rgb(30 55 38 / 4%);
}

.report-form-card {
  padding: 25px;
  margin-bottom: 28px;
}

.report-form-card h2,
.section-heading h2 {
  margin: 0;
  font-size: 1.3rem;
}

.form-toggle-button {
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: space-between;
  padding: 0;
  border: 0;
  color: inherit;
  background: transparent;
  font: inherit;
  text-align: left;
  cursor: pointer;
}

.form-toggle-heading {
  margin: 0;
  font-size: 1.3rem;
}

.form-toggle-text {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.form-toggle-button small {
  color: #718078;
  font-size: 0.85rem;
}

.form-toggle-button svg {
  flex-shrink: 0;
  transition: transform 0.2s ease;
}

.form-toggle-button svg.expanded {
  transform: rotate(180deg);
}

.report-form {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 18px;
  margin-top: 20px;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 17px;
  width: 100%;
}

.form-grid label {
  display: flex;
  flex-direction: column;
  gap: 8px;
  font-size: 0.9rem;
  font-weight: 600;
}

.form-grid input,
.form-grid textarea {
  width: 100%;
  padding: 11px 12px;
  border: 1px solid #dfe7df;
  border-radius: 8px;
  color: #25332b;
  background: #fff;
  font: inherit;
  font-weight: 400;
}

.form-grid input[type='file'] {
  padding: 9px;
}

.form-grid small {
  color: #718078;
  font-size: 0.8rem;
  font-weight: 400;
}

.form-grid input:focus,
.form-grid textarea:focus {
  outline: 2px solid #9bb9a3;
  outline-offset: 1px;
}

.form-grid textarea {
  resize: vertical;
}

.full-width {
  grid-column: 1 / -1;
}

.form-message {
  margin: 0;
  font-size: 0.9rem;
}

.error-message {
  color: #b42318;
}

.success-message {
  color: #285b43;
}

.submit-button {
  padding: 11px 17px;
  border: 0;
  border-radius: 8px;
  color: #fff;
  background: #285b43;
  font: inherit;
  font-weight: 600;
  cursor: pointer;
}

.submit-button:hover:not(:disabled) {
  background: #183d2c;
}

.submit-button:disabled {
  opacity: 0.65;
  cursor: wait;
}

.section-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 15px;
  margin-bottom: 18px;
}

.section-heading p {
  margin-top: 5px;
  font-size: 0.88rem;
}

.refresh-button {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 9px 12px;
  border: 1px solid #e4e9e4;
  border-radius: 8px;
  color: #536c5c;
  background: #fff;
  font: inherit;
  cursor: pointer;
}

.report-list {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.report-card {
  padding: 22px;
}

.report-image {
  display: block;
  width: 100%;
  max-height: 260px;
  margin-bottom: 18px;
  border-radius: 10px;
  object-fit: cover;
}

.report-title {
  display: flex;
  align-items: center;
  gap: 12px;
}

.fish-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
}

.report-title h3 {
  margin: 0;
  font-size: 1.1rem;
}

.report-details {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin: 17px 0 12px;
  color: #536c5c;
  font-size: 0.88rem;
}

.report-details span {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.report-description {
  margin: 0;
  color: #718078;
  line-height: 1.65;
  overflow-wrap: anywhere;
  white-space: pre-line;
}

.image-preview {
  display: flex;
  align-items: flex-start;
  flex-direction: column;
  gap: 8px;
}

.image-preview img {
  display: block;
  max-width: 100%;
  max-height: 220px;
  border-radius: 10px;
  object-fit: contain;
}

.remove-image-button {
  padding: 0;
  border: 0;
  color: #536c5c;
  background: transparent;
  font: inherit;
  text-decoration: underline;
  cursor: pointer;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  min-height: 220px;
  padding: 30px;
  color: #718078;
  text-align: center;
}

.empty-state h3,
.empty-state p {
  margin: 0;
}

.empty-state h3 {
  color: #25332b;
}

@media (max-width: 650px) {
  .catches-container {
    width: min(100% - 32px, 1000px);
    padding-top: 40px;
  }

  .catches-header {
    align-items: flex-start;
    gap: 14px;
  }

  .header-icon {
    width: 52px;
    height: 52px;
  }

  .catches-header h1 {
    font-size: 2rem;
  }

  .form-grid,
  .report-list {
    grid-template-columns: 1fr;
  }

  .full-width {
    grid-column: auto;
  }

  .report-form-card {
    padding: 20px;
  }

  .section-heading {
    align-items: flex-start;
  }
}
</style>
