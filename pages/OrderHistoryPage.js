import { getCurrentUser } from 'auth';
import { getOrders, getFarmerById } from 'store';

const escapeHtml = (value) => String(value ?? '').replace(/[&<>'"]/g, character => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
}[character]));

const statusDetails = (status) => {
  const normalized = String(status || 'Pending').toLowerCase();
  if (normalized === 'delivered') return { label: 'Delivered', className: 'delivered' };
  if (normalized === 'cancelled') return { label: 'Cancelled', className: 'cancelled' };
  if (normalized === 'shipped' || normalized === 'in transit' || normalized === 'in-transit') return { label: 'In Transit', className: 'in-transit' };
  return { label: 'Pending', className: 'pending' };
};

const paymentDetails = (status) => {
  const normalized = String(status || 'Pending').toLowerCase();
  return normalized === 'paid' || normalized === 'completed'
    ? { label: 'Paid', className: 'paid' }
    : normalized === 'cancelled' || normalized === 'failed'
      ? { label: 'Cancelled', className: 'cancelled' }
      : { label: 'Pending', className: 'pending' };
};

export const render = () => {
  const user = getCurrentUser();
  const orders = getOrders(user?.id).slice().reverse();
  const cards = orders.length ? orders.map(order => {
    const delivery = statusDetails(order.status);
    const payment = paymentDetails(order.paymentStatus);
    const date = order.createdAt ? new Date(order.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : '—';
    const items = (order.items || []).map(item => {
      const seller = getFarmerById(item.farmerId)?.name || 'AKart seller';
      return `<li><span><strong>${escapeHtml(item.name)}</strong><small>Seller: ${escapeHtml(seller)}</small></span><span>${escapeHtml(item.quantity)} × ${escapeHtml(item.unit || 'unit')}</span></li>`;
    }).join('');
    return `
      <article class="order-history-card">
        <header class="order-card-header">
          <div><span class="order-label">ORDER ID</span><h2>${escapeHtml(order.id)}</h2></div>
          <time datetime="${escapeHtml(order.createdAt || '')}">${date}</time>
        </header>
        <ul class="order-product-list">${items}</ul>
        <div class="order-card-meta">
          <div><span>Total Price</span><strong>₹${Number(order.total || 0).toFixed(2)}</strong></div>
          <div><span>Payment Status</span><b class="order-status ${payment.className}">${payment.label}</b></div>
          <div><span>Delivery Status</span><b class="order-status ${delivery.className}">${delivery.label}</b></div>
        </div>
        <div class="order-card-actions"><a class="btn btn-primary" href="#/ekart-logistics">Track Order</a></div>
      </article>`;
  }).join('') : `
      <section class="empty-orders-card">
        <i class="fa-solid fa-box-open" aria-hidden="true"></i>
        <h2>No orders yet</h2>
        <p>When you place an order, its payment and delivery updates will appear here.</p>
        <a class="btn btn-primary" href="#/products">Browse Products</a>
      </section>`;

  return `
    <main class="order-history-main">
      <div class="order-history-heading">
        <div><p class="dashboard-eyebrow">PURCHASE HISTORY</p><h1>My Orders</h1><p>Review your products, payments, and delivery updates.</p></div>
        <a href="#/customer-dashboard" class="order-back-link"><i class="fa-solid fa-arrow-left" aria-hidden="true"></i> Dashboard</a>
      </div>
      <div class="order-history-list">${cards}</div>
    </main>`;
};

export const addEventListeners = () => {};
