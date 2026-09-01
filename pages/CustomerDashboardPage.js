import { getCurrentUser } from 'auth';
import { getCart, getOrders } from 'store';

const escapeHtml = (value) => String(value || '').replace(/[&<>'"]/g, character => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
}[character]));

export const render = () => {
    const user = getCurrentUser() || {};
    const name = escapeHtml(user.name || user.email || 'Customer');
    const email = escapeHtml(user.email || '');
    const photoURL = escapeHtml(user.photoURL || 'assets/default-avatar.png');
    const cartCount = getCart().reduce((total, item) => total + Number(item.quantity || 0), 0);
    const orderCount = getOrders(user.id).length;

    return `
        <main class="customer-dashboard-main">
            <section class="customer-dashboard-hero" aria-labelledby="customer-dashboard-title">
                <div>
                    <p class="dashboard-eyebrow">YOUR AKART ACCOUNT</p>
                    <h1 id="customer-dashboard-title">Welcome back, ${name}</h1>
                    <p>Manage your shopping, orders, and account in one place.</p>
                </div>
                <div class="customer-profile" aria-label="Signed-in customer profile">
                    <img src="${photoURL}" alt="" class="customer-profile-avatar" onerror="this.onerror=null;this.src='assets/default-avatar.png';">
                    <div><span class="customer-profile-label">Signed in as</span><strong>${name}</strong>${email ? `<small>${email}</small>` : ''}</div>
                </div>
            </section>

            <section class="customer-dashboard-grid" aria-label="Customer shortcuts">
                <a href="#/products" class="customer-action-card">
                    <span class="customer-card-icon"><i class="fa-solid fa-basket-shopping" aria-hidden="true"></i></span>
                    <span><strong>Browse Products</strong><small>Find fresh products from local farmers.</small></span>
                    <i class="fa-solid fa-arrow-right" aria-hidden="true"></i>
                </a>
                <a href="#/cart" class="customer-action-card">
                    <span class="customer-card-icon"><i class="fa-solid fa-cart-shopping" aria-hidden="true"></i></span>
                    <span><strong>My Cart</strong><small>${cartCount ? `${cartCount} item${cartCount === 1 ? '' : 's'} ready to review.` : 'Your cart is ready when you are.'}</small></span>
                    <i class="fa-solid fa-arrow-right" aria-hidden="true"></i>
                </a>
                <a href="#/orders" class="customer-action-card">
                    <span class="customer-card-icon"><i class="fa-solid fa-box" aria-hidden="true"></i></span>
                    <span><strong>My Orders</strong><small>${orderCount ? `View ${orderCount} order${orderCount === 1 ? '' : 's'} and delivery updates.` : 'View your order history and delivery updates.'}</small></span>
                    <i class="fa-solid fa-arrow-right" aria-hidden="true"></i>
                </a>
                <a href="#/contact-support" class="customer-action-card">
                    <span class="customer-card-icon"><i class="fa-solid fa-headset" aria-hidden="true"></i></span>
                    <span><strong>Contact Support</strong><small>Get help with an order or your account.</small></span>
                    <i class="fa-solid fa-arrow-right" aria-hidden="true"></i>
                </a>
            </section>

            <section class="customer-profile-card" aria-labelledby="profile-summary-title">
                <div class="customer-card-icon"><i class="fa-solid fa-user" aria-hidden="true"></i></div>
                <div>
                    <p class="dashboard-eyebrow">PROFILE</p>
                    <h2 id="profile-summary-title">${name}</h2>
                    ${email ? `<p>${email}</p>` : '<p>Your signed-in AKart customer account.</p>'}
                </div>
            </section>
        </main>
    `;
};

export const addEventListeners = () => {};
