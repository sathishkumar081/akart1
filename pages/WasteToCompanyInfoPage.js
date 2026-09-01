import { getServiceThumbnail } from '../serviceThumbnails.js';

const process = [
  ['fa-clipboard-list', 'Farmer Lists Unsold Produce', 'Share eligible unsold produce and its available quantity.'],
  ['fa-magnifying-glass', 'AKart Reviews Submission', 'The details are reviewed for practical reuse and collection.'],
  ['fa-scale-balanced', 'Fair Buyback Evaluation', 'A buyback value is evaluated from the submitted produce.'],
  ['fa-truck', 'Produce Collected', 'Approved produce is scheduled for collection.'],
  ['fa-recycle', 'Organic Fertilizer / Agricultural Reuse', 'Suitable material is directed to composting or agricultural reuse.']
];

const benefits = [
  ['fa-chart-line', 'Reduce loss from unsold produce'],
  ['fa-hand-holding-dollar', 'Create an additional recovery opportunity'],
  ['fa-leaf', 'Reduce avoidable agricultural waste'],
  ['fa-arrows-rotate', 'Promote circular agriculture'],
  ['fa-seedling', 'Support responsible agricultural reuse']
];

export const render = () => {
  const image = getServiceThumbnail('waste-to-company');
  return `
    <main class="w2c-public-main">
      <section class="w2c-hero" aria-labelledby="w2c-title">
        <div class="w2c-hero-copy">
          <span class="clean-page-badge"><i class="fa-solid fa-recycle" aria-hidden="true"></i> Sustainable Farmer Support</span>
          <h1 id="w2c-title">Waste to Company</h1>
          <h2>Turning Unsold Produce into New Value</h2>
          <p>AKart helps farmers reduce losses by providing an alternative channel for eligible unsold produce. Collected produce can be redirected toward organic fertilizer production or suitable agricultural reuse.</p>
          <div class="clean-page-actions">
            <a href="#/farmer-dashboard/waste-to-company" class="btn btn-primary">List Unsold Produce</a>
            <button class="btn clean-outline-btn" type="button" data-scroll-to="w2c-process">Learn How It Works</button>
          </div>
        </div>
        <figure class="w2c-hero-image">
          <img src="${image.src}" alt="${image.alt}">
        </figure>
      </section>

      <section class="w2c-process-section" id="w2c-process" aria-labelledby="w2c-process-title">
        <div class="clean-section-heading">
          <span>THE PROCESS</span><h2 id="w2c-process-title">How Waste to Company works</h2>
          <p>A simple, considered path for eligible unsold produce.</p>
        </div>
        <div class="w2c-process-grid">
          ${process.map(([icon, title, text], index) => `
            <article class="w2c-process-card">
              <div class="clean-card-icon"><i class="fa-solid ${icon}" aria-hidden="true"></i></div>
              <span class="process-number">0${index + 1}</span>
              <h3>${title}</h3><p>${text}</p>
            </article>`).join('')}
        </div>
      </section>

      <section class="w2c-benefits-section" aria-labelledby="w2c-benefits-title">
        <div><span class="clean-page-badge">CIRCULAR AGRICULTURE</span><h2 id="w2c-benefits-title">Practical benefits for farmers and the farm system</h2></div>
        <ul class="w2c-benefits-list">
          ${benefits.map(([icon, text]) => `<li><i class="fa-solid ${icon}" aria-hidden="true"></i><span>${text}</span></li>`).join('')}
        </ul>
      </section>
    </main>`;
};

export const addEventListeners = () => {
  document.querySelector('[data-scroll-to="w2c-process"]')?.addEventListener('click', () => {
    document.getElementById('w2c-process')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
};
