import { t } from 'i18n';
import { getServiceThumbnail } from '../serviceThumbnails.js';
import { getCurrentUser } from 'auth';

// AKart — bright, modern AgriTech homepage

const u = (id, w = 900) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`;

// Hero image slideshow — 15 agriculture scenes
const heroSlides = [
  u('photo-1501004318641-b39e6451bec6', 1200),
  u('photo-1500382017468-9049fed747ef', 1200),
  u('photo-1474540412665-1cdae210ae6b', 1200),
  u('photo-1523987355523-c7b5b0dd90a7', 1200),
  u('photo-1595855759920-86582396756a', 1200),
  u('photo-1542838132-92c53300491e', 1200),
  u('photo-1560807707-8cc77767d783', 1200),
  u('photo-1589923188900-85dae523342b', 1200),
  u('photo-1574943320219-553eb213f72d', 1200),
  u('photo-1560493676-04071c5f467b', 1200),
  u('photo-1471193945509-9ad0617afabf', 1200),
  u('photo-1488459716781-31db52582fe9', 1200),
  u('photo-1568702846914-96b305d2aaeb', 1200),
  u('photo-1592982537447-7440770cbfc9', 1200),
  u('photo-1500937386664-56d1dfef3854', 1200)
];

const services = [
  {
    id: 'buy-fresh-produce',
    key: 'buy',
    titleKey: 'services.buy.title', descKey: 'services.buy.desc',
    href: '#/products'
  },
  {
    id: 'post-an-ad',
    key: 'post',
    titleKey: 'services.post.title', descKey: 'services.post.desc',
    href: '#/post-ad'
  },
  {
    id: 'tractor-rentals',
    key: 'tractor',
    titleKey: 'services.tractor.title', descKey: 'services.tractor.desc',
    href: '#/tractor-rentals'
  },
  {
    id: 'drone-rentals',
    key: 'drone',
    titleKey: 'services.drone.title', descKey: 'services.drone.desc',
    href: '#/drone-services'
  },
  {
    id: 'fertilizer-zone',
    key: 'fertilizer',
    titleKey: 'services.fert.title', descKey: 'services.fert.desc',
    href: '#/fertilizer-store'
  },
  {
    id: 'waste-to-company',
    key: 'waste',
    titleKey: 'services.waste.title', descKey: 'services.waste.desc',
    href: '#/waste-to-company-info'
  }
];

const howItWorks = [
  { icon: 'fa-user-plus', titleKey: 'how.step1.title', descKey: 'how.step1.desc' },
  { icon: 'fa-basket-shopping', titleKey: 'how.step2.title', descKey: 'how.step2.desc' },
  { icon: 'fa-truck-fast', titleKey: 'how.step3.title', descKey: 'how.step3.desc' }
];

const whyPoints = [
  'why.point1', 'why.point2', 'why.point3', 'why.point4'
];

const stats = [
  { value: '10K+', labelKey: 'stats.farmers', icon: 'fa-seedling' },
  { value: '50K+', labelKey: 'stats.customers', icon: 'fa-face-smile' },
  { value: '100+', labelKey: 'stats.products', icon: 'fa-carrot' },
  { value: '25+', labelKey: 'stats.cities', icon: 'fa-city' }
];

const w2cSteps = [
  'waste.step1', 'waste.step2', 'waste.step3', 'waste.step4', 'waste.step5'
];

const welcomeText = () => `🌱 ${t('home.welcome', 'Welcome to AKart — Empowering Farmers, Connecting Customers, Building a Stronger Farming Community!')}`;

export const render = () => {
  const user = getCurrentUser();
  const name = String(user?.name || user?.email?.split('@')[0] || 'there').replace(/[&<>'"]/g, character => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
  }[character]));
  const dashboardPath = user?.role === 'farmer' ? '/farmer-dashboard' : user?.role === 'admin' ? '/admin-dashboard' : '/customer-dashboard';
  const bannerDismissed = sessionStorage.getItem('homeBannerDismissed') === '1';
  const banner = bannerDismissed
    ? ''
    : `<div id="home-banner" class="welcome-banner2">
        <span class="banner-text">${welcomeText()}</span>
        <button id="home-banner-close" class="banner-close" aria-label="Dismiss announcement">×</button>
      </div>`;

  return `
    <main class="homepage">
      ${banner}

      <!-- HERO -->
      <section class="hero-section" aria-label="AKart hero">
        <div class="container hero-grid">
          <div class="hero-copy">
            <span class="hero-badge">🌱 ${t('home.badge', 'From Farm to Your Home')}</span>
            <h1 class="hero-title">${t('home.titleA', 'Empowering Farmers.')}<br><span>${t('home.titleB', 'Serving Freshness.')}</span></h1>
            <p class="hero-sub">${t('home.subtext', 'AKart is a digital bridge between farmers and customers, enabling direct trade, fair pricing, convenient agri-services, and a more sustainable agricultural ecosystem.')}</p>
            ${user ? `
              <div class="home-user-welcome">
                <span>Welcome back, ${name}</span>
                <a href="#${dashboardPath}" class="btn btn-primary btn-lg">Go to Dashboard</a>
              </div>` : `
              <div class="hero-actions">
                <a href="#/login/customer" class="btn btn-primary btn-lg">${t('cta.customerLogin', 'Login as Customer')}</a>
                <a href="#/login/farmer" class="btn btn-secondary btn-lg">${t('cta.farmerLogin', 'Login as Farmer')}</a>
                <a href="#/contact-support" class="btn btn-outline btn-lg">${t('nav.contact', 'Contact Support')}</a>
              </div>`}
            <div class="hero-stats">
              ${stats.map(s => `
                <div class="stat">
                  <i class="fa-solid ${s.icon}" aria-hidden="true"></i>
                  <div><strong>${s.value}</strong><span>${t(s.labelKey)}</span></div>
                </div>`).join('')}
            </div>
          </div>

          <div class="hero-media">
            <div class="hero-slider" id="hero-slider">
              <div class="hero-slide-layer" id="hero-layer-a"></div>
              <div class="hero-slide-layer" id="hero-layer-b"></div>
              <img class="hero-preloader" id="hero-preloader" alt="" aria-hidden="true">
            </div>
            <div class="hero-float-card">
              <i class="fa-solid fa-leaf" aria-hidden="true"></i>
              <div><strong>${t('home.fresh.title', 'Fresh & Healthy')}</strong><span>${t('home.fresh.text', 'Directly from trusted farmers to your home.')}</span></div>
            </div>
          </div>
        </div>
      </section>

      <!-- SERVICES -->
      <section class="home-section services-section" id="services">
        <div class="container">
          <div class="section-head">
            <span class="section-label">🌱 ${t('services.title', 'Our Services')}</span>
            <h2>${t('services.headline', 'Everything you need in one place')}</h2>
            <p>${t('services.subtitle', 'Explore our services designed to support farmers and deliver the best to our customers.')}</p>
          </div>
          <div class="services-grid home-services">
            ${services.map(s => {
              const thumbnail = getServiceThumbnail(s.id);
              return `
              <a href="${s.href}" class="service-card home-service-card animate-on-scroll" data-href="${s.href}" data-service-id="${s.id}">
                <div class="svc-img"><img src="${thumbnail.src}" alt="${thumbnail.alt}" loading="lazy"></div>
                <div class="svc-info">
                  <h3>${t(s.titleKey)}</h3>
                  <p>${t(s.descKey)}</p>
                  <span class="svc-link">${t('common.learnMore', 'Learn More')} <i class="fa-solid fa-arrow-right" aria-hidden="true"></i></span>
                </div>
              </a>`;
            }).join('')}
          </div>
        </div>
      </section>

      <!-- HOW IT WORKS -->
      <section class="home-section hiw-section" id="how">
        <div class="container">
          <div class="section-head">
            <span class="section-label">🌱 ${t('how.title', 'How It Works')}</span>
            <h2>${t('how.headline', 'Simple Steps to Get Started')}</h2>
          </div>
          <div class="hiw-steps">
            ${howItWorks.map((step, idx) => `
              <div class="hiw-step animate-on-scroll">
                <div class="hiw-icon"><i class="fa-solid ${step.icon}" aria-hidden="true"></i></div>
                <span class="hiw-num">0${idx + 1}</span>
                <h3>${t(step.titleKey)}</h3>
                <p>${t(step.descKey)}</p>
              </div>
              ${idx < howItWorks.length - 1 ? '<div class="hiw-arrow"><i class="fa-solid fa-arrow-right" aria-hidden="true"></i></div>' : ''}
            `).join('')}
          </div>
        </div>
      </section>

      <!-- WHY CHOOSE -->
      <section class="home-section why-section" id="why">
        <div class="container why-grid">
          <div class="why-copy animate-on-scroll">
            <span class="section-label">🌱 ${t('why.title', 'Why Choose AKart?')}</span>
            <h2>${t('why.title', 'Why Choose AKart?')}</h2>
            <ul class="why-list">
              ${whyPoints.map(key => `<li><i class="fa-solid fa-circle-check" aria-hidden="true"></i> ${t(key)}</li>`).join('')}
            </ul>
          </div>
          <div class="why-stats">
            ${stats.map(s => `
              <div class="why-stat animate-on-scroll">
                <strong>${s.value}</strong>
                <span>${t(s.labelKey)}</span>
              </div>`).join('')}
          </div>
        </div>
      </section>

      <!-- ABOUT -->
      <section class="home-section about-section" id="about">
        <div class="container about-grid">
          <div class="about-copy animate-on-scroll">
            <span class="section-label">🌱 ${t('about.title', 'About AKart')}</span>
            <h2>${t('about.title', 'About AKart')}</h2>
            <p>${t('about.text', 'AKart is a digital bridge between farmers and customers, helping farmers access markets directly while giving customers convenient access to fresh agricultural products and services.')}</p>
            <a href="#/about" class="btn btn-primary">${t('common.learnMore', 'Learn More')} <i class="fa-solid fa-arrow-right" aria-hidden="true"></i></a>
          </div>
          <div class="about-img animate-on-scroll">
            <img src="${u('photo-1500937386664-56d1dfef3854')}" alt="AKart farmland and community" loading="lazy">
          </div>
        </div>
      </section>

      <!-- WASTE TO COMPANY -->
      <section class="home-section w2c-section" id="waste">
        <div class="container w2c-grid">
          <div class="w2c-img animate-on-scroll">
            <img src="${u('photo-1592982537447-7440770cbfc9')}" alt="Sustainable farming and organic recycling" loading="lazy">
          </div>
          <div class="w2c-copy animate-on-scroll">
            <span class="section-label">🌱 ${t('waste.label', 'Sustainable Support for Farmers')}</span>
            <h2>${t('waste.title', 'Waste to Company')}</h2>
            <p>${t('waste.text', 'When farmers are unable to sell their produce, AKart provides an alternative channel through the Waste to Company initiative.')}</p>
            <ol class="w2c-steps">
              ${w2cSteps.map(key => `<li>${t(key)}</li>`).join('')}
            </ol>
            <a href="#/waste-to-company-info" class="btn btn-primary">${t('waste.learnMore', 'Learn More About Waste to Company')}</a>
          </div>
        </div>
      </section>

      <!-- CONTACT SUPPORT -->
      <section class="home-section contact-section" id="support">
        <div class="container contact-cta animate-on-scroll">
          <h2>${t('contact.teaserTitle', "Need Help? We're here for you.")}</h2>
          <p>${t('contact.teaserText', 'Our support team is available to assist you with any questions.')}</p>
          <a href="#/contact-support" class="btn btn-primary btn-lg">${t('nav.contact', 'Contact Support')}</a>
        </div>
      </section>
    </main>
  `;
};

export const addEventListeners = () => {
  // Welcome banner dismiss (session-based)
  const bannerClose = document.getElementById('home-banner-close');
  if (bannerClose) {
    bannerClose.addEventListener('click', () => {
      sessionStorage.setItem('homeBannerDismissed', '1');
      const banner = document.getElementById('home-banner');
      if (banner) banner.remove();
    });
  }

  // Hero image slideshow — cross-fade between two layers, preload next image
  const layerA = document.getElementById('hero-layer-a');
  const layerB = document.getElementById('hero-layer-b');
  const preloader = document.getElementById('hero-preloader');
  if (layerA && layerB) {
    let idx = 0;
    let active = 'a';
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const show = () => {
      const src = heroSlides[idx];
      const next = active === 'a' ? layerB : layerA;
      const current = active === 'a' ? layerA : layerB;
      // Preload before switching
      const pre = new Image();
      pre.onload = () => {
        next.style.backgroundImage = `url('${src}')`;
        next.classList.add('active');
        current.classList.remove('active');
      };
      pre.src = src;
      active = active === 'a' ? 'b' : 'a';
      idx = (idx + 1) % heroSlides.length;
    };
    // initial
    layerA.style.backgroundImage = `url('${heroSlides[0]}')`;
    layerA.classList.add('active');
    idx = 1;
    active = 'a';
    if (!reduced) setInterval(show, 3000);
    else show(); // show one static frame under reduced motion
  }

  // Scroll reveal
  const revealEls = document.querySelectorAll('.animate-on-scroll');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  revealEls.forEach(el => observer.observe(el));
};
