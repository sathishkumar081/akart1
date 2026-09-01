const defaults = [
  { id:'EK101', customer:'Ramesh Kumar', farmer:'Suresh Reddy', product:'Tomatoes', qty:'—', location:'Hyderabad', status:'Delivered', date:'03 Oct 2025' },
  { id:'EK102', customer:'Kavya Sharma', farmer:'Gopal Naidu', product:'Onions', qty:'—', location:'Vijayawada', status:'Pending', date:'07 Oct 2025' },
  { id:'EK103', customer:'Kiran Patel', farmer:'Lakshmi Rao', product:'Groundnuts', qty:'—', location:'Bengaluru', status:'Not Dispatched', date:'—' },
  { id:'EK104', customer:'Sneha Gupta', farmer:'Rajesh Varma', product:'Bananas', qty:'—', location:'Chennai', status:'In Transit', date:'08 Oct 2025' },
  { id:'EK105', customer:'Anil Mehta', farmer:'Rani Devi', product:'Paddy Seeds', qty:'—', location:'Warangal', status:'Delivered', date:'04 Oct 2025' }
];
const KEY='kissan_admin_ekart';
const load = ()=>JSON.parse(localStorage.getItem(KEY)||'null')||defaults;
const save = (d)=>localStorage.setItem(KEY, JSON.stringify(d));
export const render = () => {
  const rows = load().map(r=>`
    <tr data-id="${r.id}">
      <td>${r.id}</td><td>${r.customer}</td><td>${r.farmer}</td><td>${r.product}</td>
      <td>${r.qty}</td><td>${r.location}</td>
      <td>
        <select class="lstatus">
          ${['Delivered','In Transit','Pending','Not Dispatched'].map(s=>`<option${s===r.status?' selected':''}>${s}</option>`).join('')}
        </select>
      </td>
      <td>${r.date}</td>
    </tr>
  `).join('');
  return `
  <main>
    <div class="page-header"><h1>Ekart Logistics</h1><button id="ekart-reset" class="btn btn-secondary">🔄 Reset</button></div>
    <div class="ad-card" style="overflow:auto;">
      <table style="width:100%;border-collapse:collapse">
        <thead><tr><th>Order ID</th><th>Customer</th><th>Farmer</th><th>Product</th><th>Quantity</th><th>Delivery Location</th><th>Status</th><th>Expected Delivery</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
  </main>
`;
};
export const addEventListeners = () => {
  document.querySelectorAll('.lstatus').forEach(sel=>{
    sel.addEventListener('change', async e=>{
      const id = e.target.closest('tr').dataset.id;
      try { (await import('auth')).recordAdminAction(`Updated legacy logistics to ${e.target.value}`, id); } catch {}
      const data = load().map(r=>r.id===id?{...r, status:e.target.value}:r);
      save(data);
    });
  });
  document.getElementById('ekart-reset')?.addEventListener('click',()=>{ save(defaults); (import('router')).then(r=>r.handleRouteChange()); });
};
