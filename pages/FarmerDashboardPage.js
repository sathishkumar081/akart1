import { getCurrentUser } from 'auth';
import { handleRouteChange } from 'router';

export const render = async () => {
    const store = await import('store');
    const user = getCurrentUser();
    const products = store.getProductsByFarmer(user.id);
    
    const navigate = (path) => { window.location.hash = path; };

    const productCards = products.map(p => `
        <div class="ad-card">
            <h3>${p.name}</h3>
            <p>Price: ₹${p.price} / ${p.unit || 'unit'}</p>
            <div class="ad-card-actions">
                <button class="btn btn-secondary edit-ad-btn" data-product-id="${p.id}">Edit</button>
                <button class="btn btn-danger delete-ad-btn" data-product-id="${p.id}">Delete</button>
                <button class="btn btn-primary unsold-btn" data-product-id="${p.id}">Mark as Unsold</button>
            </div>
        </div>
    `).join('');

    return `
        <main>
            <div class="page-header"><h1>Farmer Dashboard</h1></div>
            <div class="dashboard-actions" style="display:flex; gap:0.75rem; flex-wrap:wrap;">
                <a href="#/post-ad" class="btn btn-primary">Post Your Ad</a>
                <a href="#/farmer-dashboard/manage-listings" class="btn btn-secondary">
                    <i class="fas fa-list-alt"></i> Manage Listings
                </a>
                <a href="#/farmer-dashboard/view-orders" class="btn btn-secondary">
                    <i class="fas fa-shopping-cart"></i> View Orders
                </a>
                <a href="#/farmer-dashboard/tractor-rentals" class="btn btn-secondary">
                    <i class="fas fa-tractor"></i> Tractor Rentals
                </a>
                <a href="#/farmer-dashboard/drone-rentals" class="btn btn-secondary">
                    <i class="fas fa-helicopter"></i> Drone Rentals
                </a>
                <a href="#/farmer-dashboard/fertilizer-zone" class="btn btn-secondary">
                    <i class="fas fa-seedling"></i> Fertilizer Zone
                </a>
                <a href="#/farmer-dashboard/earnings-summary" class="btn btn-secondary">
                    <i class="fas fa-chart-line"></i> Earnings Summary
                </a>
                <a href="#/farmer-dashboard/waste-to-company" class="btn btn-warning">
                    <i class="fas fa-recycle"></i> Waste to Company
                </a>
            </div>
            <h2>Your Posted Ads</h2>
            <div class="dashboard-grid">
                ${productCards.length > 0 ? productCards : "<p>You haven't posted any ads yet.</p>"}
            </div>
            <div style="margin-top: 2rem; background: var(--white); padding: 1.5rem; border-radius: var(--border-radius); box-shadow: var(--box-shadow);">
                <h3>Manage Account & Sales</h3>
                <p>Features to edit your profile, update bank/UPI info, and track sales are coming soon!</p>
                <p><strong>Total Earnings:</strong> ₹${store.getEarnings(user.id).toFixed(0)}</p>
            </div>
            <div class="ad-card" style="margin-top:1rem;">
              <h3>Waste to Company</h3>
              <p>Unsold items bought back at a fair price and repurposed sustainably.</p>
              <ul>
                ${store.getWasteToCompanyRecords(user.id).map(r=>`<li>${new Date(r.at).toLocaleString()} • ${r.name} — Buyback ₹${r.buyback} (${r.unit})</li>`).join('') || '<li>No records yet.</li>'}
              </ul>
            </div>
        </main>
    `;
};

export const addEventListeners = () => {
    document.querySelectorAll('.delete-ad-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            if (confirm('Are you sure you want to delete this ad?')) {
                const store = await import('store');
                const productId = e.target.dataset.productId;
                store.deleteProduct(productId);
                handleRouteChange(); // Refresh view
            }
        });
    });

    document.querySelectorAll('.edit-ad-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const productId = e.target.dataset.productId;
            const navigate = (path) => { window.location.hash = path; };
            navigate(`/edit-ad/${productId}`);
        });
    });

    document.querySelectorAll('.unsold-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const productId = e.target.dataset.productId;
            const store = await import('store');
            const buyback = store.markProductUnsold(productId, 0.75);
            if (buyback != null) {
                alert(`Your unsold item has been bought under Waste to Company for ₹${buyback}.`);
                (await import('router')).handleRouteChange();
            }
        });
    });
};
