import { getCurrentUser } from 'auth';
import { renderBackButton, initBackButtons } from 'utils';

export const render = async () => {
    const store = await import('store');
    const user = getCurrentUser();
    const products = store.getProductsByFarmer(user.id);
    
    const navigate = (path) => { window.location.hash = path; };

    const searchFilters = `
        <div class="filters-section" style="background: rgba(255,255,255,0.95); padding: 1.5rem; border-radius: 8px; margin-bottom: 2rem; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <div style="display: flex; gap: 1rem; flex-wrap: wrap; align-items: center;">
                <input type="text" id="search-products" placeholder="Search by product name..." style="flex: 1; min-width: 200px; padding: 0.5rem; border: 1px solid #ddd; border-radius: 4px;">
                <select id="filter-availability" style="padding: 0.5rem; border: 1px solid #ddd; border-radius: 4px;">
                    <option value="">All Products</option>
                    <option value="available">Available</option>
                    <option value="out-of-stock">Out of Stock</option>
                </select>
                <select id="filter-date" style="padding: 0.5rem; border: 1px solid #ddd; border-radius: 4px;">
                    <option value="">All Dates</option>
                    <option value="today">Today</option>
                    <option value="week">This Week</option>
                    <option value="month">This Month</option>
                </select>
            </div>
        </div>
    `;

    const productCards = products.map(p => `
        <div class="product-card" data-product-id="${p.id}" style="background: rgba(255,255,255,0.95); border-radius: 8px; padding: 1.5rem; box-shadow: 0 2px 10px rgba(0,0,0,0.1); margin-bottom: 1rem;">
            <div style="display: flex; gap: 1rem; align-items: start;">
                <img src="${p.imageUrl || 'assets/products/default.svg'}" alt="${p.imageAlt || `${p.name} product`}" style="width: 80px; height: 80px; object-fit: cover; border-radius: 4px;">
                <div style="flex: 1;">
                    <h3 style="margin: 0 0 0.5rem 0; color: #2a9d8f;">${p.name}</h3>
                    <p style="margin: 0 0 0.5rem 0; color: #666;"><strong>₹${p.price} / ${p.unit || 'unit'}</strong></p>
                    <p style="margin: 0 0 0.5rem 0; color: #666; font-size: 0.9rem;">${p.description || 'No description'}</p>
                    <p style="margin: 0; color: #888; font-size: 0.8rem;">Quantity: ${p.quantity || 'N/A'} | Location: ${p.location || 'Not specified'}</p>
                    <p style="margin:.45rem 0 0;"><span class="admin-status status-${String(p.status || 'approved').toLowerCase().replace(/[^a-z]+/g,'-')}">${p.status || 'Approved'}</span></p>
                </div>
                <div style="display: flex; gap: 0.5rem; flex-direction: column;">
                    <button class="btn btn-secondary edit-product-btn" data-product-id="${p.id}">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="btn btn-danger delete-product-btn" data-product-id="${p.id}">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                    <button class="btn btn-warning unsold-btn" data-product-id="${p.id}">
                        <i class="fas fa-recycle"></i> Mark Unsold
                    </button>
                </div>
            </div>
        </div>
    `).join('');

    return `
        <main>
            <div class="back-nav">${renderBackButton('/farmer-dashboard', '← Back to Dashboard')}</div>
            <div class="page-header">
                <h1><i class="fas fa-list-alt"></i> Manage Your Listings</h1>
                <a href="#/post-ad" class="btn btn-primary">
                    <i class="fas fa-plus"></i> Add New Product
                </a>
            </div>
            
            ${searchFilters}
            
            <div id="products-container">
                ${products.length > 0 ? productCards : `
                    <div style="text-align: center; padding: 3rem; background: rgba(255,255,255,0.95); border-radius: 8px;">
                        <i class="fas fa-box-open" style="font-size: 4rem; color: #ccc; margin-bottom: 1rem;"></i>
                        <h3 style="color: #666;">No products listed yet</h3>
                        <p style="color: #888;">Start by adding your first product for sale.</p>
                        <a href="#/post-ad" class="btn btn-primary">Add Your First Product</a>
                    </div>
                `}
            </div>
        </main>
    `;
};

export const addEventListeners = () => {
    initBackButtons();
    // Search and filter functionality
    const searchInput = document.getElementById('search-products');    const availabilityFilter = document.getElementById('filter-availability');
    const dateFilter = document.getElementById('filter-date');

    const filterProducts = () => {
        const searchTerm = searchInput?.value.toLowerCase() || '';
        const availabilityValue = availabilityFilter?.value || '';
        const dateValue = dateFilter?.value || '';
        
        document.querySelectorAll('.product-card').forEach(card => {
            const productName = card.querySelector('h3').textContent.toLowerCase();
            const matchesSearch = productName.includes(searchTerm);
            // Add more filtering logic here if needed
            card.style.display = matchesSearch ? 'block' : 'none';
        });
    };

    searchInput?.addEventListener('input', filterProducts);
    availabilityFilter?.addEventListener('change', filterProducts);
    dateFilter?.addEventListener('change', filterProducts);

    // Edit product buttons
    document.querySelectorAll('.edit-product-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const productId = e.target.closest('button').dataset.productId;
            const navigate = (path) => { window.location.hash = path; };
            navigate(`/edit-ad/${productId}`);
        });
    });

    // Delete product buttons
    document.querySelectorAll('.delete-product-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            if (confirm('Are you sure you want to delete this product?')) {
                const store = await import('store');
                const productId = e.target.closest('button').dataset.productId;
                store.deleteProduct(productId);
                // Refresh the page
                (await import('router')).handleRouteChange();
            }
        });
    });

    // Mark as unsold buttons
    document.querySelectorAll('.unsold-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const productId = e.target.closest('button').dataset.productId;
            const store = await import('store');
            const buyback = store.markProductUnsold(productId, 0.75);
            if (buyback != null) {
                alert(`Submitted for Waste to Company review. Estimated value: ₹${buyback}.`);
                (await import('router')).handleRouteChange();
            }
        });
    });
};
