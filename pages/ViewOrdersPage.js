import { getCurrentUser } from 'auth';
import { getOrders, updateOrderStatus } from 'store';
import { renderBackButton } from 'utils';

export const render = () => {
  const user = getCurrentUser();
  const orders = getOrders().filter(order => order.items.some(item => item.farmerId === user?.id));
  const cards = orders.length ? orders.map(order => {
    const items = order.items.filter(item => item.farmerId === user.id);
    return `<article class="ad-card order-card" data-order-id="${order.id}">
      <h3>Order #${order.id}</h3><p>${items.map(item => `${item.name} × ${item.quantity} ${item.unit}`).join(', ')}</p>
      <p><strong>Total:</strong> ₹${items.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2)} · <strong>Status:</strong> <span class="status-badge">${order.status}</span></p>
      ${order.status !== 'Delivered' ? `<button class="btn btn-primary update-status-btn" data-status="${order.status === 'Pending' ? 'Shipped' : 'Delivered'}">Mark ${order.status === 'Pending' ? 'Shipped' : 'Delivered'}</button>` : ''}
    </article>`;
  }).join('') : '<p class="ad-card">No customer orders for your listings yet.</p>';
  return `<main><div class="back-nav">${renderBackButton('/farmer-dashboard', '← Back to Dashboard')}</div><div class="page-header"><h1>View Orders</h1></div><div id="orders-container">${cards}</div></main>`;
};

export const addEventListeners = () => {
  document.querySelectorAll('.update-status-btn').forEach(button => button.addEventListener('click', async event => {
    const card = event.currentTarget.closest('.order-card');
    const order = updateOrderStatus(card.dataset.orderId, event.currentTarget.dataset.status);
    if (order) (await import('router')).handleRouteChange();
  }));
};

