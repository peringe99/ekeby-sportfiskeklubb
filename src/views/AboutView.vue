<script setup lang="ts">
import PublicNavigation from '@/components/layout/PublicNavigation.vue'
import Card from 'primevue/card'
import Button from 'primevue/button'
import { CalendarDays, MapPin, Users, Wallet, Fish, Home, ArrowRight, Clock } from 'lucide-vue-next'
</script>

<template>
  <PublicNavigation />

  <main class="about-page">
    <!-- Hero -->
    <section class="about-hero">
      <div class="hero-content">
        <span class="eyebrow">
          <Fish :size="16" />
          Ekeby Sportfiskeklubb
        </span>

        <h1>
          Gemenskap kring
          <span>fisket sedan 1949.</span>
        </h1>

        <p>
          En förening för dig som uppskattar naturen, fisket och gemenskapen. Upptäck vår historia,
          våra vatten och vad det innebär att vara medlem i Ekeby Sportfiskeklubb.
        </p>

        <div class="hero-actions">
          <Button label="Bli medlem" icon="pi pi-arrow-right" iconPos="right" />
          <a href="#klubben" class="text-link">
            Läs mer om klubben
            <ArrowRight :size="16" />
          </a>
        </div>
      </div>

      <div class="hero-image">
        <img
          src="https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=1200&q=85"
          alt="Naturskön sjö omgiven av skog"
        />
        <div class="image-caption">
          <MapPin :size="16" />
          <span>Fiske och natur i fokus</span>
        </div>
      </div>
    </section>

    <!-- Quick facts -->
    <section class="facts-section">
      <div class="fact">
        <CalendarDays :size="23" />
        <div>
          <strong>1949</strong>
          <span>Klubben grundades</span>
        </div>
      </div>

      <div class="fact">
        <Users :size="23" />
        <div>
          <strong>60+</strong>
          <span>Medlemmar</span>
        </div>
      </div>

      <div class="fact">
        <Fish :size="23" />
        <div>
          <strong>Vegeån</strong>
          <span>Vårt klubbvatten</span>
        </div>
      </div>

      <div class="fact">
        <Home :size="23" />
        <div>
          <strong>Ekeby</strong>
          <span>Vår klubbstuga</span>
        </div>
      </div>
    </section>

    <!-- About -->
    <section id="klubben" class="story-section">
      <div class="story-image">
        <img
          src="https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1000&q=85"
          alt="Grönskande natur vid vatten"
        />
      </div>

      <div class="story-content">
        <span class="section-label">VÅR HISTORIA</span>
        <h2>En förening med traditioner och framtidstro</h2>

        <p>
          Ekeby Sportfiskeklubb startade redan 1949 och hade då 10 medlemmar som betalade 5 kronor i
          medlemsavgift. Klubben hade inga egna vatten utan fiskade gemensamt vid kusten och gjorde
          utflykter tillsammans.
        </p>

        <p>
          Sedan dess har mycket förändrats, men intresset för fisket och gemenskapen har alltid
          varit kärnan i föreningen. Numera arrenderar klubben delar av Vegeån, vilket ger våra
          medlemmar tillgång till fina fiskevatten.
        </p>

        <p>
          Med omkring 60 medlemmar fortsätter vi att utveckla klubben och skapa en plats där både
          nya och erfarna sportfiskare kan mötas.
        </p>
      </div>
    </section>

    <!-- Community -->
    <section class="community-section">
      <div class="community-content">
        <span class="section-label">MER ÄN BARA FISKE</span>
        <h2>Gemenskapen är en stor del av klubben</h2>

        <p>
          För oss handlar sportfiske om mer än att fånga fisk. Det handlar också om att komma ut i
          naturen, dela erfarenheter och skapa minnen tillsammans med andra.
        </p>

        <p>
          Under året finns det möjlighet att träffas, utbyta tips och erfarenheter och delta i
          aktiviteter tillsammans med andra klubbmedlemmar.
        </p>
      </div>

      <Card class="clubhouse-card">
        <template #header>
          <img
            src="https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8?auto=format&fit=crop&w=1000&q=85"
            alt="Mysig stuga i naturen"
          />
        </template>

        <template #title>
          <div class="card-title">
            <Home :size="20" />
            Vår klubbstuga
          </div>
        </template>

        <template #content>
          <p>
            På Bjerrings väg i Ekeby har klubben sin egen samlingsplats. Här finns ett litet kök,
            soffor och grill – en naturlig plats för medlemmar att träffas och umgås.
          </p>
          <div class="location-line">
            <MapPin :size="16" />
            Bjerrings väg, Ekeby
          </div>
        </template>
      </Card>
    </section>

    <!-- Membership -->
    <section class="membership-section">
      <div class="membership-heading">
        <span class="section-label">MEDLEMSKAP</span>
        <h2>Bli en del av gemenskapen</h2>
        <p>
          Vill du bli medlem och ta del av klubbens fiskevatten och aktiviteter? Här är våra
          nuvarande medlemsavgifter.
        </p>
      </div>

      <div class="membership-cards">
        <Card class="price-card">
          <template #title>Årsavgift</template>
          <template #content>
            <div class="price">600 kr</div>
            <p>Årlig medlemsavgift</p>
          </template>
        </Card>

        <Card class="price-card">
          <template #title>Inträdesavgift</template>
          <template #content>
            <div class="price">0 kr</div>
            <p>Ingen inträdesavgift</p>
          </template>
        </Card>

        <Card class="payment-card">
          <template #title>
            <div class="card-title">
              <Wallet :size="20" />
              Betalningsinformation
            </div>
          </template>
          <template #content>
            <span class="payment-label">Bankgiro</span>
            <strong class="bankgiro">848-2101</strong>
            <p>Ange ditt namn vid betalning.</p>
          </template>
        </Card>
      </div>
    </section>

    <!-- Footer CTA -->
    <section class="about-cta">
      <div>
        <span class="section-label">VÄLKOMMEN TILL OSS</span>
        <h2>Har du frågor om klubben?</h2>
        <p>
          Vi hjälper dig gärna med information om medlemskap, fiskevatten och föreningens
          verksamhet.
        </p>
      </div>

      <Button label="Kontakta klubben" icon="pi pi-arrow-right" iconPos="right" />
    </section>
  </main>
</template>

<style scoped>
.about-page {
  --green: #285b43;
  --green-dark: #183d2c;
  --green-light: #edf3ee;
  --text: #25332b;
  --muted: #718078;
  --surface: #ffffff;
  --background: #f8faf8;

  color: var(--text);
  background: var(--background);
  padding-bottom: 80px;
}

.about-hero,
.story-section,
.community-section,
.membership-section,
.about-cta,
.facts-section {
  max-width: 1180px;
  margin: 0 auto;
}

.about-hero {
  display: grid;
  grid-template-columns: 1fr 1fr;
  align-items: center;
  gap: 64px;
  padding: 90px 32px 70px;
}

.eyebrow,
.section-label {
  display: inline-flex;
  align-items: center;
  gap: 9px;
  color: var(--green);
  font-size: 0.76rem;
  font-weight: 700;
  letter-spacing: 0.12em;
}

.about-hero h1 {
  margin: 24px 0;
  font-size: clamp(2.8rem, 5vw, 4.4rem);
  line-height: 1.08;
  letter-spacing: -0.055em;
  font-weight: 750;
}

.about-hero h1 span {
  display: block;
  color: var(--green);
}

.about-hero p,
.story-content p,
.community-content p {
  color: var(--muted);
  font-size: 1.05rem;
  line-height: 1.85;
}

.hero-actions {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 26px;
  margin-top: 32px;
}

.text-link {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: var(--green);
  font-weight: 600;
  text-decoration: none;
}

.text-link:hover {
  gap: 12px;
}

.hero-image,
.story-image {
  position: relative;
  overflow: hidden;
  border-radius: 18px;
}

.hero-image img {
  display: block;
  width: 100%;
  height: 440px;
  object-fit: cover;
}

.image-caption {
  position: absolute;
  bottom: 18px;
  left: 18px;
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 11px 15px;
  color: white;
  background: rgb(20 35 26 / 75%);
  border-radius: 8px;
  font-size: 0.85rem;
}

.facts-section {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  padding: 0 32px;
}

.fact {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 25px 20px;
  background: white;
  border: 1px solid #e9eee9;
  border-radius: 12px;
}

.fact > svg {
  flex-shrink: 0;
  color: var(--green);
}

.fact div {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.fact strong {
  font-size: 1.1rem;
}

.fact span {
  color: var(--muted);
  font-size: 0.82rem;
}

.story-section {
  display: grid;
  grid-template-columns: 0.9fr 1.1fr;
  align-items: center;
  gap: 75px;
  padding: 120px 32px;
}

.story-image img {
  display: block;
  width: 100%;
  height: 470px;
  object-fit: cover;
}

.story-content h2,
.community-content h2,
.membership-heading h2,
.about-cta h2 {
  margin: 18px 0;
  font-size: clamp(2rem, 3.5vw, 2.8rem);
  line-height: 1.15;
  letter-spacing: -0.04em;
}

.community-section {
  display: grid;
  grid-template-columns: 1fr 0.85fr;
  align-items: center;
  gap: 75px;
  padding: 70px 32px;
  background: var(--green-light);
  border-radius: 18px;
}

.community-content {
  padding: 30px;
}

.clubhouse-card {
  overflow: hidden;
  border-radius: 14px;
}

.clubhouse-card :deep(.p-card-body) {
  padding: 24px;
}

.clubhouse-card :deep(.p-card-title) {
  font-size: 1.2rem;
}

.clubhouse-card :deep(.p-card-content) {
  padding-top: 0;
}

.clubhouse-card img {
  display: block;
  width: 100%;
  height: 220px;
  object-fit: cover;
}

.card-title {
  display: flex;
  align-items: center;
  gap: 10px;
}

.card-title svg {
  color: var(--green);
}

.clubhouse-card p,
.payment-card p,
.price-card p {
  color: var(--muted);
  line-height: 1.7;
}

.location-line {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 18px;
  color: var(--green);
  font-size: 0.9rem;
  font-weight: 600;
}

.membership-section {
  padding: 120px 32px 90px;
}

.membership-heading {
  max-width: 620px;
  margin-bottom: 40px;
}

.membership-heading p {
  color: var(--muted);
  line-height: 1.8;
}

.membership-cards {
  display: grid;
  grid-template-columns: 1fr 1fr 1.3fr;
  gap: 18px;
}

.price-card,
.payment-card {
  border: 1px solid #e9eee9;
  border-radius: 14px;
}

.price-card :deep(.p-card-body),
.payment-card :deep(.p-card-body) {
  padding: 28px;
}

.price-card :deep(.p-card-title),
.payment-card :deep(.p-card-title) {
  font-size: 1rem;
}

.price {
  margin: 12px 0 4px;
  color: var(--green);
  font-size: 2.5rem;
  font-weight: 750;
  letter-spacing: -0.05em;
}

.price-card p,
.payment-card p {
  margin-bottom: 0;
  font-size: 0.9rem;
}

.payment-label {
  display: block;
  margin-top: 12px;
  color: var(--muted);
  font-size: 0.85rem;
}

.bankgiro {
  display: block;
  margin-top: 5px;
  font-size: 1.8rem;
  letter-spacing: 0.03em;
}

.about-cta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 40px;
  margin-top: 20px;
  padding: 55px 50px;
  color: white;
  background: var(--green-dark);
  border-radius: 18px;
}

.about-cta .section-label {
  color: #b9d4c2;
}

.about-cta h2 {
  margin-bottom: 12px;
}

.about-cta p {
  max-width: 570px;
  margin: 0;
  color: #d1dfd5;
  line-height: 1.7;
}

@media (max-width: 850px) {
  .about-hero,
  .story-section,
  .community-section {
    grid-template-columns: 1fr;
    gap: 35px;
  }

  .about-hero {
    padding-top: 55px;
  }

  .facts-section {
    grid-template-columns: repeat(2, 1fr);
  }

  .story-section {
    padding: 80px 32px;
  }

  .community-section {
    margin: 0 20px;
    padding: 25px;
  }

  .membership-cards {
    grid-template-columns: 1fr 1fr;
  }

  .payment-card {
    grid-column: span 2;
  }

  .about-cta {
    margin-right: 20px;
    margin-left: 20px;
  }
}

@media (max-width: 550px) {
  .about-hero {
    padding: 45px 20px;
  }

  .about-hero h1 {
    font-size: 2.7rem;
  }

  .hero-image img {
    height: 300px;
  }

  .facts-section {
    grid-template-columns: 1fr 1fr;
    padding: 0 20px;
    gap: 10px;
  }

  .fact {
    padding: 18px 12px;
    gap: 10px;
  }

  .fact span {
    font-size: 0.75rem;
  }

  .story-section {
    padding: 70px 20px;
  }

  .story-image img {
    height: 300px;
  }

  .community-section {
    margin: 0 12px;
    padding: 12px;
  }

  .community-content {
    padding: 15px;
  }

  .membership-section {
    padding: 80px 20px;
  }

  .membership-cards {
    grid-template-columns: 1fr;
  }

  .payment-card {
    grid-column: auto;
  }

  .about-cta {
    flex-direction: column;
    align-items: flex-start;
    margin: 0 12px;
    padding: 35px 25px;
  }
}
</style>
