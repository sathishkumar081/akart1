import { getCurrentUser } from 'auth';
import { getFarmerById } from 'store';
import { t, applyTranslations } from 'i18n';

const sellerModal = (product, farmer) => {
    const existing = document.getElementById('contact-seller-overlay');
    const overlay = existing || document.createElement('div');
    overlay.id = 'contact-seller-overlay';
    overlay.className = 'modal-overlay active';
    overlay.innerHTML = `
      <div class="modal-card" role="dialog" aria-modal="true" aria-labelledby="sellerModalTitle">
        <h3 id="sellerModalTitle">${t('seller.title', 'Seller Details')}</h3>
        <p><strong>${t('seller.name', 'Name:')}</strong> ${farmer?.name || '—'}</p>
        <p><strong>${t('seller.location', 'Location:')}</strong> ${farmer?.address || '—'}</p>
        <p><strong>${t('seller.products', 'Products Sold:')}</strong> ${product.name}</p>
        <p class="seller-notice">${t('seller.notice', 'Contact information will be provided after order placement.')}</p>
        <button id="closeSellerModal" class="btn btn-primary">${t('btn.close', 'Close')}</button>
      </div>`;
    if (!existing) document.body.appendChild(overlay);
    overlay.querySelector('#closeSellerModal').addEventListener('click', () => overlay.remove());
    overlay.addEventListener('click', event => { if (event.target === overlay) overlay.remove(); }, { once: true });
};

export const render = async () => {
    const store = await import('store');
    const products = store.getProducts();
    const productCards = products.map(product => {
        const farmer = getFarmerById(product.farmerId);
        const rating = farmer?.id === 'farmer1' ? 4.6 : farmer?.id === 'farmer2' ? 4.4 : 4.5;
        return `
          <article class="product-card animate-on-scroll">
            <div class="product-image-container">
              <img src="${product.imageUrl}" alt="${product.imageAlt || `${product.name} product`}" class="product-image" loading="lazy">
            </div>
            <div class="product-info">
              <h3>${product.name}</h3>
              <p class="product-description">${product.description}</p>
              <p class="product-price">₹${product.price} / ${product.unit}</p>
              <div class="product-seller">
                <p><strong>${t('seller.name', 'Seller:')}</strong> ${farmer?.name || '—'}</p>
                <p><small>${farmer?.address || '—'} · ${'★'.repeat(Math.round(rating))}${'☆'.repeat(5 - Math.round(rating))} (${rating.toFixed(1)})</small></p>
              </div>
              <button class="btn btn-primary add-to-cart-btn" data-product-id="${product.id}" data-i18n="btn.addToCart">${t('btn.addToCart', 'Add to Cart')}</button>
              <button class="btn btn-secondary contact-seller-btn" data-product-id="${product.id}" data-i18n="btn.contactSeller">${t('btn.contactSeller', 'Contact Seller')}</button>
            </div>
          </article>`;
    }).join('');
    return `<main><div class="page-header"><h1 data-i18n="products.title">${t('products.title', 'Products')}</h1></div><div class="product-grid">${productCards}</div></main>`;
};

export const addEventListeners = async () => {
    const store = await import('store');
    const { navigate } = await import('utils');
    const products = store.getProducts();
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
        if (entry.isIntersecting) { entry.target.classList.add('in-view'); observer.unobserve(entry.target); }
    }), { threshold: 0.2 });
    document.querySelectorAll('.animate-on-scroll').forEach(card => observer.observe(card));

    document.querySelectorAll('.add-to-cart-btn').forEach(button => button.addEventListener('click', event => {
        const user = getCurrentUser();
        if (!user || user.role !== 'customer') {
            alert(t('error.customerCart', 'Please log in as a customer to add items to your cart.'));
            navigate('/login/customer');
            return;
        }
        const product = products.find(item => item.id === event.currentTarget.dataset.productId);
        if (!product) return;
        store.addToCart(product.id);
        alert(t('cart.added', `${product.name} added to cart.`));
    }));

    document.querySelectorAll('.contact-seller-btn').forEach(button => button.addEventListener('click', event => {
        const product = products.find(item => item.id === event.currentTarget.dataset.productId);
        if (product) sellerModal(product, getFarmerById(product.farmerId));
    }));
    applyTranslations();
};

