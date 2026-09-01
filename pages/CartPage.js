export const render = async () => {
  const { getProducts, getCart, updateCartItemQuantity, removeFromCart, clearCart } = await import('store');
  const { renderBackButton } = await import('utils');
  const products = getProducts();
  const cart = getCart();
  let total = 0;
  const items = cart.map(item => {
    const p = products.find(x => x.id === item.productId);
    if (!p) return '';
    const itemTotal = Number(p.price) * item.quantity; total += itemTotal;
    return `
      <div class="cart-item" data-product-id="${p.id}">
        <img src="${p.imageUrl}" alt="${p.imageAlt || `${p.name} product`}" class="cart-item-img" loading="lazy">
        <div class="cart-item-info"><h4>${p.name}</h4><p>Price: ₹${p.price} / ${p.unit||'unit'}</p></div>
        <div class="cart-item-quantity"><input type="number" class="quantity-input" value="${item.quantity}" min="1"></div>
        <div class="cart-item-price"><strong>₹${itemTotal.toFixed(2)}</strong></div>
        <div class="cart-item-remove"><button class="btn btn-danger remove-item-btn">&times;</button></div>
      </div>`;
  }).join('') || `<p><span data-i18n="cart.empty">Your cart is empty.</span> <a href="#/products"><span data-i18n="cart.startShopping">Start shopping!</span></a></p>`;
  return `
    <main>
      <div class="back-nav">${renderBackButton('/products', '← Back to Products')}</div>
      <div class="page-header"><h1 data-i18n="cart.title">Your Shopping Cart</h1></div>
      <div class="cart-section">
        <div id="cart-items">${items}</div>
        <div class="cart-summary"><h3><span data-i18n="cart.total">Total:</span> ₹${total.toFixed(2)}</h3>
          <button class="btn btn-primary checkout-btn" data-i18n="cart.checkout">Proceed to Checkout</button>
          <button class="btn pay-now-btn" id="pay-now-btn" data-i18n="pay.now">Complete Your Purchase with Razorpay</button>
        </div>
      </div>
    </main>`;
};
export const addEventListeners = async () => {
  const { updateCartItemQuantity, removeFromCart, getCart, createOrder, getProducts } = await import('store');
  const { getCurrentUser } = await import('auth');
  const { initBackButtons } = await import('utils');
  initBackButtons();
  const refresh = async () => { (await import('router')).handleRouteChange(); };
  document.querySelectorAll('.quantity-input').forEach(inp=>{
    inp.addEventListener('change', e=>{ const id=e.target.closest('.cart-item').dataset.productId; updateCartItemQuantity(id, parseInt(e.target.value,10)||1); refresh(); });
  });
  document.querySelectorAll('.remove-item-btn').forEach(btn=>{
    btn.addEventListener('click', e=>{ const id=e.target.closest('.cart-item').dataset.productId; removeFromCart(id); refresh(); });
  });
  document.querySelector('.checkout-btn')?.addEventListener('click', async ()=>{
    const user = getCurrentUser();
    const order = createOrder(user?.id, getCart(), getProducts());
    if (!order) return;
    (await import('store')).clearCart();
    window.location.hash = '/thank-you';
  });
  const payBtn = document.getElementById('pay-now-btn');
  if (payBtn) {
    const i18n = await import('i18n'); const { getCart } = await import('store');
    payBtn.addEventListener('click', () => {
      const cart = getCart();
      if (!cart || cart.length === 0) { alert(i18n.t('pay.empty',"Your cart is empty! Please add products before proceeding to payment.")); return; }
      alert(i18n.t('pay.redirecting',"Redirecting to Razorpay for Payment…"));
      window.location.href = "https://razorpay.me/@gslslsjshs";
    });
  }
};
