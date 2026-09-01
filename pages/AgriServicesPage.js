import { getPublicAgriServices, getFarmerById } from 'store';
import { getServiceThumbnail, getFertilizerVisual } from '../serviceThumbnails.js';

const escapeHtml = (value) => String(value || '').replace(/[&<>'"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char]));

const serviceTypeFor = (type) => type === 'tractor' ? 'tractor-rentals' : type === 'drone' ? 'drone-rentals' : 'fertilizer-zone';

const renderServiceCard = (service, type) => {
  const farmer = getFarmerById(service.ownerId || service.sellerId);
  const serviceId = service.serviceId || serviceTypeFor(type);
  const thumbnail = type === 'fertilizer' ? getFertilizerVisual(service) : getServiceThumbnail(serviceId);
  const typeLabel = type === 'tractor' ? 'Tractor rental' : type === 'drone' ? 'Drone rental' : thumbnail.category || 'Agricultural input';
  return `
    <article class="agri-listing-card" data-service-id="${serviceId}">
      <img src="${thumbnail.src}" alt="${thumbnail.alt}" class="agri-listing-image" loading="lazy">
      <div class="agri-listing-body">
        <span class="agri-listing-type">${typeLabel}</span>
        ${type === 'tractor' && service.verified ? '<span class="verified-service-badge"><i class="fa-solid fa-shield-halved"></i> AKart Verified</span>' : ''}
        <h3>${escapeHtml(service.name)}</h3>
        ${service.description ? `<p>${escapeHtml(service.description)}</p>` : ''}
        <div class="agri-listing-details">
          <span><i class="fa-solid fa-indian-rupee-sign" aria-hidden="true"></i> ${escapeHtml(service.price)}</span>
          ${service.quantity ? `<span><i class="fa-solid fa-box" aria-hidden="true"></i> ${escapeHtml(service.quantity)}</span>` : ''}
          ${service.location ? `<span><i class="fa-solid fa-location-dot" aria-hidden="true"></i> ${escapeHtml(service.location)}</span>` : ''}
        </div>
        <p class="agri-provider">Provider: ${escapeHtml(service.sellerName || farmer?.name || 'AKart provider')}</p>
        <button class="btn btn-primary contact-owner-btn">Contact Owner</button>
      </div>
    </article>`;
};

const overviewCards = [
  ['tractor-rentals', 'Tractor Rentals', 'Reliable farm equipment for field preparation and seasonal work.', '#/tractor-rentals', 'fa-tractor'],
  ['drone-rentals', 'Drone Rentals', 'Agricultural spraying and monitoring support when you need it.', '#/drone-services', 'fa-helicopter'],
  ['fertilizer-zone', 'Fertilizer Zone', 'Nutrients, compost, and soil inputs for crop care.', '#/fertilizer-store', 'fa-seedling'],
  ['waste-to-company', 'Waste to Company', 'A responsible route for eligible unsold produce.', '#/waste-to-company-info', 'fa-recycle']
];

export const render = () => {
  const services = getPublicAgriServices();
  return `
    <main class="agri-services-main">
      <section class="agri-services-heading">
        <span class="clean-page-badge"><i class="fa-solid fa-wheat-awn" aria-hidden="true"></i> AKART SERVICES</span>
        <h1>Agricultural Services</h1>
        <p>Practical farm services and quality inputs from one clean, easy-to-use place.</p>
      </section>
      <section class="agri-overview-grid" aria-label="Agricultural service categories">
        ${overviewCards.map(([id, title, text, href, icon]) => {
          const image = getServiceThumbnail(id);
          return `<a href="${href}" class="agri-overview-card" data-service-id="${id}">
            <img src="${image.src}" alt="${image.alt}" loading="lazy">
            <div><span class="clean-card-icon"><i class="fa-solid ${icon}" aria-hidden="true"></i></span><h2>${title}</h2><p>${text}</p><span class="agri-overview-link">Explore <i class="fa-solid fa-arrow-right" aria-hidden="true"></i></span></div>
          </a>`;
        }).join('')}
      </section>
      <section class="agri-marketplace" aria-labelledby="agri-marketplace-title">
        <div class="clean-section-heading"><span>AVAILABLE NOW</span><h2 id="agri-marketplace-title">Find the service you need</h2></div>
        <nav class="services-nav" aria-label="Service listing categories">
          <button class="btn service-tab-btn active" data-tab="tractors">Tractor Rentals</button>
          <button class="btn service-tab-btn" data-tab="drones">Drone Rentals</button>
          <button class="btn service-tab-btn" data-tab="fertilizers">Fertilizer Zone</button>
        </nav>
        <div id="tractors" class="service-content active"><div class="agri-listing-grid">${services.tractors.map(s => renderServiceCard(s, 'tractor')).join('')}</div></div>
        <div id="drones" class="service-content"><div class="agri-listing-grid">${services.drones.map(s => renderServiceCard(s, 'drone')).join('')}</div></div>
        <div id="fertilizers" class="service-content"><div class="agri-listing-grid">${services.fertilizers.map(s => renderServiceCard(s, 'fertilizer')).join('')}</div></div>
      </section>
    </main>`;
};

export const addEventListeners = () => {
  const tabs = document.querySelectorAll('.service-tab-btn');
  const contents = document.querySelectorAll('.agri-marketplace > .service-content');
  tabs.forEach(tab => tab.addEventListener('click', () => {
    tabs.forEach(item => item.classList.remove('active'));
    tab.classList.add('active');
    contents.forEach(content => content.classList.toggle('active', content.id === tab.dataset.tab));
  }));
  document.querySelectorAll('.contact-owner-btn').forEach(button => button.addEventListener('click', () => { window.location.hash = '/contact-support'; }));
  const path = location.hash.replace('#', '') || '/';
  if (path.includes('tractor')) document.querySelector('[data-tab="tractors"]')?.click();
  if (path.includes('drone')) document.querySelector('[data-tab="drones"]')?.click();
};
