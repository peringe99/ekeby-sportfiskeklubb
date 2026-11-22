<script setup lang="ts">
import { useRouter } from 'vue-router'
import { ArrowRight, Fish, Waves, MapPin, Users, Newspaper, ChevronRight } from 'lucide-vue-next'
import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import PublicNavigation from '@/components/layout/PublicNavigation.vue'

const router = useRouter()

function goToLogin() {
  router.push('/login')
}

function goToAbout() {
  router.push('/about')
}

const auth = useAuthStore()

const isLoggedIn = computed(() => !!auth.user)

const accountButtonText = computed(() => (isLoggedIn.value ? 'Min sida' : 'Logga in'))

function goToAccount() {
  router.push(isLoggedIn.value ? '/members' : '/login')
}
</script>

<template>
  <main class="home-page">
    <PublicNavigation />

    <!-- Hero -->
    <section class="hero">
      <div class="hero-background"></div>

      <div class="hero-content">
        <div class="hero-eyebrow">
          <Waves :size="16" />
          EKEBY SPORTFISKEKLUBB
        </div>

        <h1>
          Gemenskap.
          <br />
          Natur.
          <span>Sportfiske.</span>
        </h1>

        <p>
          En förening för dig som älskar fisket, naturen och gemenskapen kring vattnet. Välkommen
          till Ekeby Sportfiskeklubb.
        </p>

        <div class="hero-actions">
          <button class="primary-button" @click="goToAbout">
            Upptäck klubben
            <ArrowRight :size="17" />
          </button>

          <button class="secondary-button" @click="goToLogin">
            <Users :size="17" />
            För medlemmar
          </button>
        </div>

        <div class="hero-location">
          <MapPin :size="15" />
          Ekeby Sportfiskeklubb
        </div>
      </div>

      <div class="hero-bottom">
        <span>EN FÖRENING FÖR FISKEINTRESSERADE</span>
        <span>SEDAN <strong>—</strong> </span>
      </div>
    </section>

    <!-- Introduction -->
    <section class="intro-section">
      <div class="intro-label">
        <span></span>
        VÄLKOMMEN TILL KLUBBEN
      </div>

      <div class="intro-grid">
        <h2>
          Mer än bara
          <span>fiske.</span>
        </h2>

        <div class="intro-text">
          <p>
            Sportfiske handlar om mer än fångsten. Det handlar om upplevelserna, kunskapen och
            människorna man möter längs vägen.
          </p>

          <p>
            Ekeby Sportfiskeklubb samlar människor med ett gemensamt intresse för sportfiske och
            livet kring våra vatten.
          </p>

          <button class="inline-link" @click="goToAbout">
            Läs mer om klubben
            <ChevronRight :size="17" />
          </button>
        </div>
      </div>
    </section>

    <!-- Values -->
    <section id="aktiviteter" class="values-section">
      <div class="section-header">
        <div>
          <div class="intro-label">
            <span></span>
            DET HÄR ÄR VI
          </div>
          <h2>Det som förenar oss.</h2>
        </div>
      </div>

      <div class="values-grid">
        <article class="value-card">
          <div class="value-icon">
            <Fish :size="23" />
          </div>
          <h3>Sportfiske</h3>
          <p>Ett gemensamt intresse för fisket, tekniken och upplevelserna vid vattnet.</p>
        </article>

        <article class="value-card">
          <div class="value-icon">
            <Users :size="23" />
          </div>
          <h3>Gemenskap</h3>
          <p>Träffa andra fiskeintresserade, utbyt erfarenheter och utvecklas tillsammans.</p>
        </article>

        <article class="value-card">
          <div class="value-icon">
            <Waves :size="23" />
          </div>
          <h3>Natur & vatten</h3>
          <p>Visa respekt för naturen och bidra till ett hållbart sportfiske.</p>
        </article>
      </div>
    </section>

    <!-- Member CTA -->
    <section class="member-cta">
      <div class="cta-content">
        <div class="intro-label">
          <span></span>
          FÖR MEDLEMMAR
        </div>

        <h2>
          {{ isLoggedIn ? 'Utforska klubbens innehåll.' : 'Allt för klubbens medlemmar.' }}
        </h2>

        <p>
          {{
            isLoggedIn
              ? 'Utforska klubbens nyheter, fångster, aktiviteter och medlemsinformation.'
              : 'Logga in för att ta del av klubbnyheter, aktiviteter, dokument och information.'
          }}
        </p>

        <button class="primary-button" @click="goToAccount">
          {{ isLoggedIn ? 'Utforska innehållet' : 'Logga in' }}
          <ArrowRight :size="17" />
        </button>
      </div>

      <div class="cta-decoration">
        <Newspaper :size="110" :stroke-width="0.8" />
      </div>
    </section>

    <!-- Footer -->
    <footer class="footer">
      <div class="footer-brand">
        <Fish :size="20" />
        <strong>Ekeby Sportfiskeklubb</strong>
      </div>

      <span>Sportfiske, natur och gemenskap.</span>

      <button class="login-button" @click="goToAccount">
        {{ accountButtonText }}
        <ArrowRight :size="16" />
      </button>

      <small>© {{ new Date().getFullYear() }} Ekeby Sportfiskeklubb</small>
    </footer>
  </main>
</template>

<style scoped>
.home-page {
  color: #263c30;
  background: #fafbf9;
  min-height: 100vh;
}

.login-button {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 17px;
  border: 1px solid #dfe8df;
  border-radius: 8px;
  background: white;
  color: #365b45;
  font-size: 12px;
  font-weight: 650;
  cursor: pointer;
}

/* Hero */
.hero {
  position: relative;
  min-height: 590px;
  display: flex;
  align-items: center;
  overflow: hidden;
  background: #203d30;
  color: white;
}

.hero-background {
  position: absolute;
  inset: 0;
  background:
    linear-gradient(
      90deg,
      rgb(15 39 28 / 91%) 0%,
      rgb(20 48 34 / 78%) 48%,
      rgb(20 48 34 / 28%) 100%
    ),
    url('https://images.unsplash.com/photo-1663637157615-69759105d1fe?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=NHwxMjA3fDA%3D')
      center 52% / cover no-repeat;
  transform: scale(1.02);
}

.hero-content {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 1240px;
  margin: auto;
  padding: 75px 35px 95px;
}

.hero-eyebrow {
  display: flex;
  align-items: center;
  gap: 9px;
  color: #c3d9c8;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 2px;
  margin-bottom: 25px;
}

.hero h1 {
  font-size: clamp(48px, 6vw, 76px);
  line-height: 1.05;
  letter-spacing: -3px;
  font-weight: 650;
  margin: 0;
}

.hero h1 span {
  color: #b9d5b9;
}

.hero-content > p {
  max-width: 480px;
  color: #d2ded5;
  font-size: 15px;
  line-height: 1.9;
  margin: 24px 0 30px;
}

.hero-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.primary-button,
.secondary-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 11px;
  padding: 15px 20px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 650;
  cursor: pointer;
  transition: 0.2s;
}

.primary-button {
  border: 1px solid #b8d2ba;
  background: #b8d2ba;
  color: #244631;
}

.primary-button:hover {
  background: #cce0cd;
  transform: translateY(-2px);
}

.secondary-button {
  border: 1px solid rgb(255 255 255 / 35%);
  background: rgb(255 255 255 / 8%);
  color: white;
}

.secondary-button:hover {
  background: rgb(255 255 255 / 16%);
}

.hero-location {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #b9cbbd;
  font-size: 11px;
  margin-top: 45px;
}

.hero-bottom {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-between;
  padding: 19px max(calc((100% - 1170px) / 2), 35px);
  border-top: 1px solid rgb(255 255 255 / 16%);
  color: #d0ddd2;
  font-size: 9px;
  letter-spacing: 1.6px;
}

/* Intro */
.intro-section {
  max-width: 1170px;
  margin: auto;
  padding: 105px 35px;
}

.intro-label {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #66836d;
  font-size: 10px;
  font-weight: 750;
  letter-spacing: 1.6px;
}

.intro-label span {
  width: 22px;
  height: 2px;
  background: #729779;
}

.intro-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 100px;
  margin-top: 30px;
}

.intro-grid h2 {
  color: #294533;
  font-size: clamp(39px, 5vw, 55px);
  line-height: 1.15;
  letter-spacing: -2px;
  margin: 0;
}

.intro-grid h2 span {
  color: #729779;
}

.intro-text p {
  color: #78857b;
  font-size: 14px;
  line-height: 1.9;
  margin: 0 0 17px;
}

.inline-link {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  margin-top: 12px;
  padding: 0;
  border: 0;
  background: transparent;
  color: #477453;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
}

/* Values */
.values-section {
  padding: 85px 35px 100px;
  background: #f0f4ef;
}

.section-header,
.values-grid {
  max-width: 1170px;
  margin-left: auto;
  margin-right: auto;
}

.section-header h2 {
  margin: 18px 0 0;
  color: #294533;
  font-size: 34px;
  letter-spacing: -1px;
}

.values-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-top: 38px;
}

.value-card {
  padding: 30px;
  border: 1px solid #e3eae1;
  border-radius: 13px;
  background: white;
}

.value-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 47px;
  height: 47px;
  border-radius: 12px;
  background: #edf4ed;
  color: #527a5d;
  margin-bottom: 22px;
}

.value-card h3 {
  margin: 0 0 10px;
  color: #304b38;
  font-size: 17px;
}

.value-card p {
  color: #829087;
  font-size: 13px;
  line-height: 1.8;
  margin: 0;
}

/* Member CTA */
.member-cta {
  position: relative;
  overflow: hidden;
  max-width: 1170px;
  margin: 100px auto;
  padding: 55px 60px;
  border-radius: 16px;
  background: #e9f0e8;
}

.cta-content {
  position: relative;
  z-index: 1;
  max-width: 550px;
}

.member-cta h2 {
  color: #294533;
  font-size: 36px;
  letter-spacing: -1px;
  line-height: 1.2;
  margin: 20px 0 13px;
}

.member-cta p {
  color: #78877b;
  font-size: 14px;
  line-height: 1.8;
  margin: 0 0 25px;
}

.cta-decoration {
  position: absolute;
  right: 75px;
  top: 50%;
  transform: translateY(-50%);
  color: rgb(72 112 79 / 12%);
}

/* Footer */
.footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 20px;
  padding: 30px max(calc((100% - 1170px) / 2), 35px);
  background: #203d30;
  color: #c8d7cb;
}

.footer-brand {
  display: flex;
  align-items: center;
  gap: 9px;
  font-size: 13px;
  color: white;
}

.footer > span {
  font-size: 11px;
  color: #b1c4b5;
}

.footer button {
  display: flex;
  align-items: center;
  gap: 7px;
  border: 0;
  background: transparent;
  color: white;
  font-size: 11px;
  cursor: pointer;
}

.footer small {
  width: 100%;
  padding-top: 17px;
  border-top: 1px solid rgb(255 255 255 / 15%);
  color: #91a99a;
  font-size: 10px;
}

/* Responsive */
@media (max-width: 750px) {
  .hero {
    min-height: 570px;
  }

  .hero-content {
    padding: 65px 25px 90px;
  }

  .hero h1 {
    letter-spacing: -2px;
  }

  .intro-section {
    padding: 75px 25px;
  }

  .intro-grid {
    grid-template-columns: 1fr;
    gap: 25px;
  }

  .values-section {
    padding: 70px 25px;
  }

  .values-grid {
    grid-template-columns: 1fr;
  }

  .member-cta {
    margin: 65px 20px;
    padding: 35px 27px;
  }

  .cta-decoration {
    right: -35px;
    opacity: 0.5;
  }

  .footer {
    padding: 30px 25px;
  }
}

@media (max-width: 420px) {
  .login-button {
    padding: 10px;
    font-size: 10px;
  }

  .hero h1 {
    font-size: 46px;
  }

  .hero-bottom {
    padding-left: 20px;
    padding-right: 20px;
    font-size: 8px;
  }
}
</style>
