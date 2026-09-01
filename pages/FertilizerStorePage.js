import { initBackButtons } from 'utils';
import { getFertilizerVisual } from '../serviceThumbnails.js';

const formatPackage = (value) => {
  const quantity = String(value || '').trim();
  if (!quantity) return 'Package details on request';
  return /(?:kg|litre|packet|bag)$/i.test(quantity) ? quantity : `${quantity} kg`;
};

export const render = async () => {
  const { getPublicAgriServices } = await import('store');
  const { renderBackButton } = await import('utils');
  const ferts = getPublicAgriServices().fertilizers || [];
  const cards = ferts.map(f => {
    const visual = getFertilizerVisual(f);
    return `
      <article class="fertilizer-card" data-fertilizer-id="${f.id}">
        <img src="${visual.src}" alt="${visual.alt}" class="fertilizer-card-image" loading="lazy">
        <div class="fertilizer-card-body">
          <span class="fertilizer-category">${visual.category}</span>
          <h2>${f.name}</h2>
          <p class="fertilizer-description">${f.description || 'Agricultural input supplied by a verified AKart provider.'}</p>
          <dl class="fertilizer-specs">
            <div><dt>Package</dt><dd>${formatPackage(f.quantity)}</dd></div>
            <div><dt>Price</dt><dd>${f.price}</dd></div>
            <div><dt>Seller / Provider</dt><dd>${f.sellerName || 'AKart provider'}</dd></div>
            <div><dt>Availability</dt><dd><span class="availability-badge">Available</span></dd></div>
          </dl>
          <a href="#/contact-support" class="btn btn-primary fertilizer-action">Contact Seller</a>
        </div>
      </article>`;
  }).join('');
  return `
    <main class="fertilizer-zone-main">
      <div class="clean-back-nav">${renderBackButton('/agri-services', '← Back to Services')}</div>
      <section class="fertilizer-zone-heading">
        <span class="clean-page-badge"><i class="fa-solid fa-seedling" aria-hidden="true"></i> AGRICULTURAL INPUTS</span>
        <h1>Fertilizer Zone</h1>
        <p>Quality agricultural inputs for healthier crops and better productivity.</p>
      </section>
      <section class="fertilizer-grid" aria-label="Fertilizer products">${cards}</section>
    </main>`;
};

export const addEventListeners = () => { initBackButtons(); };
