import { getCurrentUser, logout, recordAdminAction, getAuditLogs, setAccountStatus } from 'auth';

const esc = value => String(value ?? '—').replace(/[&<>'"]/g, char => ({ '&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;' }[char]));
const status = value => `<span class="admin-status status-${String(value || '').toLowerCase().replace(/[^a-z]+/g,'-')}">${esc(value || 'Pending')}</span>`;
const shortDate = value => value ? new Date(value).toLocaleDateString() : '—';
const btn = (label, action, kind = 'secondary') => `<button type="button" class="admin-action ${kind}" data-action="${action}">${label}</button>`;
const empty = text => `<div class="admin-empty">${esc(text)}</div>`;

const sidebar = unread => [
  ['overview','fa-chart-pie','Dashboard Overview'], ['products','fa-circle-check','Product Verification'],
  ['products','fa-store','Farmer Listings'], ['tractors','fa-tractor','Tractor Quality'],
  ['drones','fa-helicopter','Drone Services'], ['fertilizers','fa-flask','Fertilizer Quality'],
  ['payments','fa-credit-card','Payment Verification'], ['orders','fa-box','Orders'],
  ['customers','fa-users','Customers'], ['farmers','fa-wheat-awn','Farmers'],
  ['waste','fa-recycle','Waste to Company'], ['logistics','fa-truck','Logistics'],
  ['support','fa-headset','Complaints & Support'], ['analytics','fa-chart-line','Reports / Analytics'],
  ['settings','fa-gear','Settings']
].map(([target,icon,label], index) => `<button class="admin-nav-item${index===0?' active':''}" data-panel-target="${target}"><i class="fa-solid ${icon}"></i><span>${label}</span>${label==='Dashboard Overview'&&unread?`<b>${unread}</b>`:''}</button>`).join('');

export const render = async () => {
  const store = await import('store');
  store.seedPayments();
  const user = getCurrentUser();
  const users = store.getUsers();
  const products = store.getAllProducts();
  const payments = store.getPayments();
  const orders = store.getOrders();
  const services = store.getAgriServices();
  const waste = store.getAllWasteRecords();
  const adminData = store.getAdminData();
  const flags = JSON.parse(localStorage.getItem('kissan_market_farmer_flags') || '{}');
  const auditLogs = await getAuditLogs().catch(() => []);
  const farmers = users.filter(item => item.role === 'farmer');
  const customers = users.filter(item => item.role === 'customer');
  const pendingProducts = products.filter(item => ['Pending','Pending Review'].includes(item.status)).length;
  const unread = adminData.notifications.filter(item => item.unread).length;
  const pendingPayments = payments.filter(item => String(item.verificationStatus || item.status).includes('Pending')).length;
  const verifiedPayments = payments.filter(item => ['Successful','Manually Verified'].includes(item.verificationStatus || item.status)).length;

  const productRows = products.map(product => {
    const farmer = users.find(item => item.id === product.farmerId);
    return `<tr data-id="${esc(product.id)}">
      <td data-label="Product"><div class="admin-product"><img src="${esc(product.imageUrl || 'assets/products/default.svg')}" alt=""><div><strong>${esc(product.name)}</strong><small>${esc(product.description)}</small></div></div></td>
      <td data-label="Farmer">${esc(farmer?.name)}<small>${esc(product.location || farmer?.address)}</small></td>
      <td data-label="Details">${esc(product.category || 'Produce')}<small>${esc(product.quantity)} ${esc(product.unit)} · ₹${esc(product.price)}/${esc(product.unit)}</small></td>
      <td data-label="Posted">${shortDate(product.createdAt)}</td><td data-label="Status" class="row-status">${status(product.status || 'Approved')}</td>
      <td data-label="Quality"><details><summary>Review</summary><div class="quality-checks">
        ${['Image quality','Correct category','Price & unit','Description','Quantity','Freshness / harvest date','Seller information'].map(label=>`<label><input type="checkbox" checked> ${label}</label>`).join('')}
        <textarea class="admin-notes" placeholder="Optional admin notes">${esc(product.adminNotes || '')}</textarea>
      </div></details></td>
      <td data-label="Actions"><div class="admin-actions">${btn('Approve','product:Approved','primary')}${btn('Reject','product:Rejected','danger')}${btn('Changes','product:Changes Required')}${btn('Delete','product:Delete','danger')}${btn('Farmer','view-farmer')}</div></td>
    </tr>`;
  }).join('');

  const serviceRows = (items, kind) => items.map(item => {
    const isFert = kind === 'fertilizer';
    const details = isFert
      ? `${item.manufacturer || '—'} · ${item.quantity || '—'} · ${item.batchNumber || 'No batch'}<small>Mfg ${shortDate(item.manufacturingDate)} · Exp ${shortDate(item.expiryDate)} · ${item.certificationDocument ? 'Document attached' : 'No certification document'}</small>`
      : kind === 'tractor'
        ? `${item.brand || '—'} · ${item.model || item.name} · ${item.manufacturingYear || '—'}<small>${item.serviceCondition || 'Condition not supplied'} · Maintenance ${shortDate(item.lastMaintenanceDate)}</small>`
        : `${item.type || item.purpose || 'Agricultural drone'}<small>${item.coverage || 'Coverage not supplied'} · ${item.location || item.sellerLocation || '—'}</small>`;
    const actions = isFert
      ? `${btn('Verify',`${kind}:Verified`,'primary')}${btn('Documents',`${kind}:Needs Documentation`)}${btn('Reject',`${kind}:Rejected`,'danger')}${btn('Disable',`${kind}:Expired`,'danger')}`
      : kind === 'tractor'
        ? `${btn('Verify',`${kind}:Verified`,'primary')}${btn('More Info',`${kind}:Needs Information`)}${btn('Reject',`${kind}:Rejected`,'danger')}${btn('Suspend',`${kind}:Unavailable`,'danger')}`
        : `${btn('Verify',`${kind}:Verified`,'primary')}${btn('Changes',`${kind}:Changes Required`)}${btn('Reject',`${kind}:Rejected`,'danger')}`;
    return `<tr data-id="${esc(item.id)}"><td data-label="Listing"><div class="admin-product"><img src="${esc(item.imageUrl)}" alt=""><div><strong>${esc(item.name)}</strong><small>${esc(item.sellerName || users.find(user=>user.id===(item.ownerId||item.sellerId))?.name || 'Provider')}</small></div></div></td><td data-label="Details">${details}</td><td data-label="Price">${esc(item.price)}<small>${esc(item.availability || 'Available')}</small></td><td data-label="Status" class="row-status">${status(item.verificationStatus)}</td><td data-label="Actions"><div class="admin-actions">${actions}</div></td></tr>`;
  }).join('');

  const paymentRows = payments.map(item => `<tr data-id="${esc(item.id)}"><td data-label="Order"><strong>${esc(item.orderId || item.id)}</strong><small>${shortDate(item.createdAt)}</small></td><td data-label="Parties">${esc(item.customer)}<small>Seller: ${esc(item.seller)}</small></td><td data-label="Products">${esc(item.product)}</td><td data-label="Amount">₹${Number(item.amount || 0).toLocaleString()}<small>${esc(item.paymentMethod)}</small></td><td data-label="Reference">${esc(item.txnId)}</td><td data-label="Status" class="row-status">${status(item.verificationStatus || item.status)}</td><td data-label="Actions"><div class="admin-actions">${btn('Verify','payment:Manually Verified','primary')}${btn('Flag','payment:Flagged for Review')}${btn('Failed','payment:Failed','danger')}${btn('Refund','payment:Refunded')}</div><input class="inline-note" placeholder="Admin note"></td></tr>`).join('');

  const orderRows = orders.map(order => `<tr data-id="${esc(order.id)}"><td data-label="Order"><strong>${esc(order.id)}</strong><small>${shortDate(order.createdAt)}</small></td><td data-label="Customer">${esc(users.find(item=>item.id===order.customerId)?.name)}</td><td data-label="Products">${order.items.map(item=>`${esc(item.name)} × ${item.quantity}`).join('<br>')}</td><td data-label="Amount">₹${Number(order.total || 0).toLocaleString()}</td><td data-label="Payment">${status(order.paymentStatus)}</td><td data-label="Order status" class="row-status">${status(order.status)}</td><td data-label="Delivery">${status(order.deliveryStatus)}</td><td data-label="Actions"><div class="admin-actions">${btn('Processing','order:Processing','primary')}${btn('Flag','order:Flagged')}${btn('Resolve','order:Resolved')}</div></td></tr>`).join('');

  const customerRows = customers.map(item => {
    const customerOrders = orders.filter(order=>order.customerId===item.id);
    return `<tr data-id="${esc(item.id)}"><td data-label="Customer"><strong>${esc(item.name)}</strong><small>${esc(item.email)}</small></td><td data-label="Registered">${shortDate(item.createdAt)}</td><td data-label="Orders">${customerOrders.length}</td><td data-label="Purchases">₹${customerOrders.reduce((sum,o)=>sum+Number(o.total||0),0).toLocaleString()}</td><td data-label="Support">${adminData.complaints.filter(ticket=>ticket.submittedBy===item.name).length}</td><td data-label="Status" class="row-status">${status(flags[item.id]?.suspended?'Suspended':'Active')}</td><td data-label="Actions"><div class="admin-actions">${btn('View','profile:view')}${btn(flags[item.id]?.suspended?'Reactivate':'Suspend',flags[item.id]?.suspended?'user:Active':'user:Suspended',flags[item.id]?.suspended?'primary':'danger')}</div></td></tr>`;
  }).join('');
  const farmerRows = farmers.map(item => {
    const listings=products.filter(product=>product.farmerId===item.id); const farmerOrders=orders.filter(order=>order.items.some(line=>line.farmerId===item.id));
    return `<tr data-id="${esc(item.id)}"><td data-label="Farmer"><strong>${esc(item.name)}</strong><small>${esc(item.email)} · ${esc(item.address)}</small></td><td data-label="Registered">${shortDate(item.createdAt)}</td><td data-label="Listings">${listings.length}<small>${listings.filter(p=>p.status==='Approved').length} approved · ${listings.filter(p=>p.status==='Rejected').length} rejected</small></td><td data-label="Orders">${farmerOrders.length}</td><td data-label="Sales">₹${Number(store.getEarnings(item.id)||0).toLocaleString()}</td><td data-label="Rating">4.5</td><td data-label="Status" class="row-status">${status(flags[item.id]?.suspended?'Suspended':'Active')}</td><td data-label="Actions"><div class="admin-actions">${btn('Approve','user:Active','primary')}${btn(flags[item.id]?.suspended?'Reactivate':'Suspend',flags[item.id]?.suspended?'user:Active':'user:Suspended',flags[item.id]?.suspended?'primary':'danger')}${btn('Listings','show-products')}</div></td></tr>`;
  }).join('');

  const wasteRows = waste.map(item => `<tr data-id="${esc(item.id)}"><td data-label="Farmer">${esc(users.find(user=>user.id===item.farmerId)?.name)}</td><td data-label="Product"><strong>${esc(item.name)}</strong><small>${esc(item.quantity)} · ${esc(item.condition)}</small></td><td data-label="Value">₹${esc(item.originalPrice)}<small>Requested ₹${esc(item.requestedBuyback || item.buyback)}</small></td><td data-label="Submitted">${shortDate(item.at)}</td><td data-label="Status" class="row-status">${status(item.status)}</td><td data-label="Actions"><div class="admin-actions">${btn('Approve','waste:Approved','primary')}${btn('Reject','waste:Rejected','danger')}${btn('Revise','waste:Revised Price')}${btn('Collected','waste:Collected')}${btn('Processing','waste:Processing')}${btn('Fertilizer','waste:Sent for Organic Fertilizer')}${btn('Reuse','waste:Sent for Agricultural/Seed Reuse')}</div></td></tr>`).join('');
  const logisticsRows = adminData.logistics.map(item => `<tr data-id="${esc(item.id)}"><td data-label="Order"><strong>${esc(item.orderId)}</strong><small>${esc(item.trackingId)}</small></td><td data-label="Route">${esc(item.pickup)}<small>to ${esc(item.delivery)}</small></td><td data-label="Parties">${esc(item.customer)}<small>${esc(item.farmer)} · ${esc(item.product)}</small></td><td data-label="Partner">${esc(item.partner)}</td><td data-label="Status" class="row-status">${status(item.status)}</td><td data-label="Update"><select class="admin-select" data-logistics-status>${['Order Received','Assigned','Picked Up','In Transit','Out for Delivery','Delivered','Failed Delivery','Returned'].map(value=>`<option${value===item.status?' selected':''}>${value}</option>`).join('')}</select></td></tr>`).join('');
  const supportRows = adminData.complaints.map(item => `<tr data-id="${esc(item.id)}"><td data-label="Ticket"><strong>${esc(item.id)}</strong><small>${shortDate(item.createdAt)}</small></td><td data-label="From">${esc(item.submittedBy)}<small>${esc(item.role)}</small></td><td data-label="Category">${esc(item.category)}</td><td data-label="Issue">${esc(item.subject)}</td><td data-label="Status" class="row-status">${status(item.status)}</td><td data-label="Actions"><div class="admin-actions">${btn('Open','support:Open')}${btn('Respond','support:Responded','primary')}${btn('Resolve','support:Resolved','primary')}${btn('Close','support:Closed')}${btn('Escalate','support:Escalated','danger')}</div></td></tr>`).join('');

  const cards = [
    ['Customers',customers.length,'fa-users'],['Farmers',farmers.length,'fa-wheat-awn'],['Product Listings',products.length,'fa-boxes-stacked'],['Pending Products',pendingProducts,'fa-clock'],['Approved Products',products.filter(p=>p.status==='Approved').length,'fa-circle-check'],['Pending Payments',pendingPayments,'fa-credit-card'],['Verified Payments',verifiedPayments,'fa-shield'],['Active Orders',orders.filter(o=>!['Delivered','Cancelled'].includes(o.status)).length,'fa-cart-flatbed'],['Tractor Approvals',services.tractors.filter(s=>s.verificationStatus==='Pending Inspection').length,'fa-tractor'],['Fertilizer Approvals',services.fertilizers.filter(s=>s.verificationStatus==='Pending Verification').length,'fa-flask'],['Waste Requests',waste.filter(w=>w.status==='Pending Review').length,'fa-recycle'],['Active Deliveries',adminData.logistics.filter(l=>!['Delivered','Returned'].includes(l.status)).length,'fa-truck']
  ].map(([label,value,icon])=>`<article class="admin-metric"><i class="fa-solid ${icon}"></i><div><span>${label}</span><strong>${value}</strong></div></article>`).join('');

  const table = (head, rows) => `<div class="admin-table-wrap"><table class="admin-table"><thead><tr>${head.map(value=>`<th>${value}</th>`).join('')}</tr></thead><tbody>${rows || `<tr><td colspan="${head.length}">${empty('No records yet.')}</td></tr>`}</tbody></table></div>`;
  const panel = (id,title,subtitle,body,active=false) => `<section class="admin-panel${active?' active':''}" data-panel="${id}"><div class="admin-section-head"><div><h2>${title}</h2><p>${subtitle}</p></div></div>${body}</section>`;

  return `<main class="admin-shell">
    <header class="admin-topbar"><button id="admin-menu" aria-label="Open admin menu"><i class="fa-solid fa-bars"></i></button><div><span class="admin-wordmark">AKart</span><small>Central Control</small></div><div class="admin-top-actions"><button id="admin-notifications" title="Notifications"><i class="fa-regular fa-bell"></i>${unread?`<b>${unread}</b>`:''}</button><span>${esc(user?.name)}</span></div></header>
    <aside class="admin-sidebar" id="admin-sidebar"><div class="admin-sidebar-head"><strong>Management</strong><button id="admin-menu-close" aria-label="Close menu"><i class="fa-solid fa-xmark"></i></button></div><nav>${sidebar(unread)}</nav><button id="admin-logout" class="admin-logout"><i class="fa-solid fa-arrow-right-from-bracket"></i> Logout</button></aside>
    <div class="admin-overlay" id="admin-overlay"></div>
    <div class="admin-content"><p id="admin-feedback" class="admin-feedback" role="status" aria-live="polite"></p>
      ${panel('overview','Dashboard Overview','Live operational snapshot across AKart.',`<div class="admin-metrics">${cards}</div><div class="admin-chart-grid">${[['Orders',[3,5,4,7,6]],['Sales',[2,4,3,6,5]],['Payments',[5,3,6,4,7]],['Product approvals',[2,3,5,4,6]],['Delivery status',[1,4,6,5,7]]].map(([name,values])=>`<article class="admin-chart"><div><strong>${name}</strong><small>Last 5 periods</small></div><div class="mini-bars">${values.map(value=>`<i style="height:${value*11}px"></i>`).join('')}</div></article>`).join('')}</div><div class="admin-overview-grid"><article class="admin-card"><h3>Notifications <span>${unread} unread</span></h3>${adminData.notifications.map(note=>`<p><i class="fa-solid fa-circle"></i>${esc(note.text)}</p>`).join('')}</article><article class="admin-card"><h3>Recent admin activity</h3>${auditLogs.slice(0,5).map(log=>`<p><strong>${esc(log.action)}</strong> · ${esc(log.target_id)}<small>${new Date(log.created_at).toLocaleString()}</small></p>`).join('') || '<p>No audit actions recorded yet.</p>'}</article></div>`,true)}
      ${panel('products','Product Verification','Review farmer ads before they reach the public marketplace.',table(['Product','Farmer','Details','Posted','Status','Quality','Actions'],productRows))}
      ${panel('tractors','Tractor Quality','Inspection status is required before the AKart Verified badge appears.',table(['Listing','Vehicle details','Price / availability','Status','Actions'],serviceRows(services.tractors,'tractor')))}
      ${panel('drones','Drone Services','Verify purpose, coverage, provider, price, and availability.',table(['Listing','Service details','Price / availability','Status','Actions'],serviceRows(services.drones,'drone')))}
      ${panel('fertilizers','Fertilizer Quality','Expired products are disabled; certification is shown only when documentation exists.',table(['Listing','Safety details','Price','Status','Actions'],serviceRows(services.fertilizers,'fertilizer')))}
      ${panel('payments','Payment Verification','Payment-link orders stay pending until a transaction reference is checked.',`<div class="admin-warning"><i class="fa-solid fa-shield-halved"></i> Frontend success messages are not accepted as proof of payment.</div>${table(['Order','Customer / seller','Products','Amount','Reference','Status','Actions'],paymentRows)}`)}
      ${panel('orders','Orders','Monitor payment, fulfillment, and delivery status.',table(['Order','Customer','Products','Amount','Payment','Order status','Delivery','Actions'],orderRows))}
      ${panel('customers','Customers','Account and purchase summary without sensitive credentials.',table(['Customer','Registered','Orders','Purchases','Support','Status','Actions'],customerRows))}
      ${panel('farmers','Farmers','Review account, listing quality, orders, sales, and status.',table(['Farmer','Registered','Listings','Orders','Sales','Rating','Status','Actions'],farmerRows))}
      ${panel('waste','Waste to Company','Track review, revised offer, collection, and processing history.',table(['Farmer','Product','Value','Submitted','Status','Actions'],wasteRows))}
      ${panel('logistics','Logistics','Ekart delivery tracking from pickup through delivery or return.',table(['Order / tracking','Route','Parties','Partner','Status','Update'],logisticsRows))}
      ${panel('support','Complaints & Support','Customer and farmer tickets across all AKart services.',table(['Ticket','From','Category','Issue','Status','Actions'],supportRows))}
      ${panel('analytics','Reports / Analytics','Operational totals use current marketplace records.',`<div class="admin-metrics">${cards}</div><article class="admin-card"><h3>Approval health</h3><p>${pendingProducts} products await review. ${verifiedPayments} payments are verified and ${pendingPayments} await verification.</p></article>`)}
      ${panel('settings','Settings','Demo tools never affect real records.',`<article class="admin-card settings-card"><div><h3>Reset Demo Data</h3><p>Restore only records marked as demo. Real users, listings, orders, and payments are preserved.</p></div><button id="reset-demo" class="admin-action danger">Reset Demo Data</button></article>`)}
    </div>
  </main>`;
};

export const addEventListeners = async () => {
  const store = await import('store');
  const feedback = (message, error=false) => { const el=document.getElementById('admin-feedback'); if(el){ el.textContent=message; el.classList.toggle('error',error); window.scrollTo({top:0,behavior:'smooth'}); } };
  const audit = async (action,target,notes='') => { try { await recordAdminAction(action,target,notes); } catch { feedback('Your admin session expired. Please sign in again.',true); await logout(); location.hash='/admin-login'; throw new Error('Unauthorized'); } };
  const refresh = async () => (await import('router')).handleRouteChange();
  const openPanel = id => {
    document.querySelectorAll('.admin-panel').forEach(panel=>panel.classList.toggle('active',panel.dataset.panel===id));
    document.querySelectorAll('.admin-nav-item').forEach(item=>item.classList.toggle('active',item.dataset.panelTarget===id));
    document.getElementById('admin-sidebar')?.classList.remove('open'); document.getElementById('admin-overlay')?.classList.remove('active'); window.scrollTo(0,0);
  };
  document.querySelectorAll('[data-panel-target]').forEach(item=>item.addEventListener('click',()=>openPanel(item.dataset.panelTarget)));
  document.getElementById('admin-menu')?.addEventListener('click',()=>{ document.getElementById('admin-sidebar').classList.add('open'); document.getElementById('admin-overlay').classList.add('active'); });
  ['admin-menu-close','admin-overlay'].forEach(id=>document.getElementById(id)?.addEventListener('click',()=>{document.getElementById('admin-sidebar').classList.remove('open');document.getElementById('admin-overlay').classList.remove('active');}));
  document.getElementById('admin-logout')?.addEventListener('click',async()=>{ await logout(); location.hash='/admin-login'; });
  document.getElementById('admin-notifications')?.addEventListener('click',()=>openPanel('overview'));

  document.querySelectorAll('[data-action]').forEach(button=>button.addEventListener('click',async event=>{
    const row=event.currentTarget.closest('tr'); const id=row?.dataset.id; const [type,value]=event.currentTarget.dataset.action.split(':');
    if(!id) return;
    try {
      if(type==='product') {
        if(value==='Delete'){ if(!confirm('Delete this product listing?')) return; await audit('Deleted product',id); await store.deleteProduct(id); }
        else { const notes=row.querySelector('.admin-notes')?.value || ''; await audit(`${value} product`,id,notes); store.reviewProduct(id,{status:value,adminNotes:notes,qualityReview:{checked:true}}); }
      } else if(['tractor','drone','fertilizer'].includes(type)) {
        await audit(`${value} ${type} listing`,id); store.updateAgriService(type,id,{verificationStatus:value,verified:value==='Verified',availability:value==='Expired'||value==='Unavailable'?'Unavailable':undefined});
      } else if(type==='payment') { const note=row.querySelector('.inline-note')?.value || ''; const current=store.getPayments().find(item=>item.id===id); let reference=current?.txnId || ''; if(value==='Manually Verified'){ reference=prompt('Enter or confirm the transaction reference ID:',reference==='Awaiting reference'?'':reference)?.trim(); if(!reference){ feedback('A checked transaction reference is required for manual verification.',true); return; } } await audit(`${value} payment`,id,[reference?`Reference ${reference}`:'',note].filter(Boolean).join(' · ')); const payment=store.updatePayment(id,{status:value,verificationStatus:value,txnId:reference,adminNotes:note}); if(payment?.orderId) store.updateOrder(payment.orderId,{paymentStatus:value}); }
      else if(type==='order') { await audit(`${value} order`,id); store.updateOrder(id,{status:value}); }
      else if(type==='waste') { let changes={}; if(value==='Revised Price'){ const offer=prompt('Enter revised buyback value (₹):'); if(!offer) return; changes.buyback=Number(offer); } await audit(`${value} waste request`,id,changes.buyback?`Offer ₹${changes.buyback}`:''); store.updateWasteRecord(id,value,changes); }
      else if(type==='support') { await audit(`${value} support ticket`,id); store.updateAdminRecord('complaints',id,{status:value}); }
      else if(type==='user') { await audit(`${value} user account`,id); await setAccountStatus(id,value==='Suspended'?'suspended':'active').catch(error=>{ if(error.status!==404) throw error; }); const flags=JSON.parse(localStorage.getItem('kissan_market_farmer_flags')||'{}'); flags[id]={...(flags[id]||{}),suspended:value==='Suspended'}; localStorage.setItem('kissan_market_farmer_flags',JSON.stringify(flags)); }
      else if(event.currentTarget.dataset.action==='view-farmer'){ openPanel('farmers'); return; }
      else if(event.currentTarget.dataset.action==='show-products'){ openPanel('products'); return; }
      else if(event.currentTarget.dataset.action==='profile:view'){ feedback(`Profile ${id} opened in the customer management context.`); return; }
      await refresh();
    } catch(error){ if(error.message!=='Unauthorized') feedback(error.message || 'Action could not be completed.',true); }
  }));
  document.querySelectorAll('[data-logistics-status]').forEach(select=>select.addEventListener('change',async event=>{ const id=event.currentTarget.closest('tr').dataset.id; try{ await audit(`Updated delivery to ${event.currentTarget.value}`,id); store.updateAdminRecord('logistics',id,{status:event.currentTarget.value}); feedback('Delivery status updated.'); }catch{} }));
  document.getElementById('reset-demo')?.addEventListener('click',async()=>{ if(!confirm('Are you sure you want to reset demo data?')) return; try{ await audit('Reset demo data','demo-records'); store.resetDemoData(); await refresh(); }catch{} });
};
