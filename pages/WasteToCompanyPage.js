import { getCurrentUser } from 'auth';

const escapeHtml = (value) => String(value || '').replace(/[&<>'"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char]));

export const render = async () => {
  const store = await import('store');
  const user = getCurrentUser();
  const products = store.getProductsByFarmer(user?.id);
  const records = store.getWasteToCompanyRecords(user?.id);
  const totalEarnings = records.filter(record => ['Collected','Processing','Sent for Organic Fertilizer','Sent for Agricultural/Seed Reuse'].includes(record.status)).reduce((sum, record) => sum + Number(record.buyback || 0), 0);
  const eligible = products.filter(product => product.quantity && Number.parseInt(product.quantity, 10) > 0);

  const productCards = eligible.map(product => {
    const estimate = Math.round(Number(product.price) * 0.75);
    return `<article class="w2c-product-card">
      <img src="${escapeHtml(product.imageUrl || 'assets/products/default.svg')}" alt="${escapeHtml(product.imageAlt || `${product.name} product`)}" loading="lazy">
      <div class="w2c-product-copy"><h3>${escapeHtml(product.name)}</h3><p>Listed price: ₹${escapeHtml(product.price)} / ${escapeHtml(product.unit || 'kg')}</p><p>Available quantity: ${escapeHtml(product.quantity)} ${escapeHtml(product.unit || 'kg')}</p></div>
      <div class="w2c-product-action"><span>Estimated review value</span><strong>₹${estimate}</strong><button class="btn btn-primary mark-unsold-btn" data-product-id="${escapeHtml(product.id)}" data-product-name="${escapeHtml(product.name)}" data-buyback="${estimate}">Submit for Review</button></div>
    </article>`;
  }).join('');

  const history = records.slice().reverse().map(record => `
    <li data-record-id="${escapeHtml(record.id)}"><div><strong>${escapeHtml(record.name)}</strong><span>${new Date(record.at).toLocaleDateString()} · ${escapeHtml(record.status || 'Pending Review')}</span></div><div><strong>₹${Number(record.buyback || 0).toLocaleString()}</strong><span>Original ₹${escapeHtml(record.originalPrice)}</span>${record.status==='Revised Price'?'<button class="btn btn-primary accept-waste-offer">Accept Offer</button>':''}</div></li>`).join('');

  return `
    <main class="w2c-manager-main">
      <section class="w2c-manager-heading">
        <div><span class="clean-page-badge"><i class="fa-solid fa-recycle" aria-hidden="true"></i> FARMER WORKSPACE</span><h1>Waste to Company</h1><p>Submit eligible unsold produce for review and track completed recovery transactions.</p></div>
        <a href="#/waste-to-company-info" class="clean-text-link">How it works <i class="fa-solid fa-arrow-right" aria-hidden="true"></i></a>
      </section>
      <section class="w2c-stats-grid" aria-label="Waste to Company summary">
        <article><i class="fa-solid fa-indian-rupee-sign" aria-hidden="true"></i><span>Total recovery value</span><strong>₹${totalEarnings.toLocaleString()}</strong></article>
        <article><i class="fa-solid fa-boxes-stacked" aria-hidden="true"></i><span>Completed submissions</span><strong>${records.length}</strong></article>
        <article><i class="fa-solid fa-leaf" aria-hidden="true"></i><span>Reuse focus</span><strong>Responsible</strong></article>
      </section>
      <section class="w2c-workspace-card" aria-labelledby="w2c-list-title">
        <div class="workspace-title"><div><span class="clean-section-kicker">ELIGIBLE PRODUCE</span><h2 id="w2c-list-title">List unsold produce</h2><p>Each submission is reviewed before a buyback decision is made.</p></div>${!products.length ? '<a href="#/post-ad" class="btn btn-primary">Add a Product</a>' : ''}</div>
        ${products.length ? (productCards || '<div class="w2c-empty"><i class="fa-solid fa-circle-check" aria-hidden="true"></i><h3>No eligible produce right now</h3><p>Your current listings do not have available quantity to submit.</p></div>') : '<div class="w2c-empty"><i class="fa-solid fa-box-open" aria-hidden="true"></i><h3>No products listed yet</h3><p>Add a product before submitting it for Waste to Company review.</p></div>'}
      </section>
      <section class="w2c-workspace-card" aria-labelledby="w2c-history-title">
        <div class="workspace-title"><div><span class="clean-section-kicker">ACTIVITY</span><h2 id="w2c-history-title">Transaction history</h2></div></div>
        ${records.length ? `<ul class="w2c-history-list">${history}</ul>` : '<div class="w2c-empty compact"><i class="fa-solid fa-receipt" aria-hidden="true"></i><p>Completed Waste to Company transactions will appear here.</p></div>'}
      </section>
    </main>`;
};

export const addEventListeners = () => {
  document.querySelectorAll('.accept-waste-offer').forEach(button=>button.addEventListener('click',async event=>{
    const id=event.currentTarget.closest('[data-record-id]').dataset.recordId;
    const store=await import('store'); const user=getCurrentUser(); store.acceptWasteOffer(id,user?.id); (await import('router')).handleRouteChange();
  }));
  document.querySelectorAll('.mark-unsold-btn').forEach(button => button.addEventListener('click', async event => {
    const target = event.currentTarget;
    const productId = target.dataset.productId;
    const name = target.dataset.productName;
    const buyback = target.dataset.buyback;
    if (!confirm(`Submit "${name}" for Waste to Company review with an estimated value of ₹${buyback}?`)) return;
    const store = await import('store');
    const actualBuyback = store.markProductUnsold(productId, 0.75);
    if (actualBuyback != null) {
      alert(`Your ${name} submission is pending admin review. Estimated value: ₹${actualBuyback}.`);
      (await import('router')).handleRouteChange();
    }
  }));
};
