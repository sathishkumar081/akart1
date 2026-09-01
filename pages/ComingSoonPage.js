import { renderBackButton, initBackButtons } from 'utils';

const titles = {
  '/orders': 'Track Orders',
  '/purchase-history': 'Purchase History'
};

export const render = async () => {
  const path = (window.location.hash.replace('#', '') || '/').split('?')[0];
  const title = titles[path] || 'Coming Soon';
  const backFallback = '/customer-dashboard';
  return `
    <main>
      <div class="back-nav">${renderBackButton(backFallback, '← Back to Dashboard')}</div>
      <div class="page-header"><h1>${title}</h1></div>
      <section class="ad-card" style="padding:2.5rem;text-align:center;">
        <i class="fas fa-hourglass-half" style="font-size:3.5rem;color:var(--primary-color);margin-bottom:1rem;"></i>
        <h2>Coming Soon</h2>
        <p style="max-width:520px;margin:0.75rem auto 1.5rem;">This feature is being prepared for you. Please check back shortly — your ${title.toLowerCase()} will appear here.</p>
        <a href="#/products" class="btn btn-primary">Continue Shopping</a>
      </section>
    </main>
  `;
};

export const addEventListeners = () => { initBackButtons(); };
