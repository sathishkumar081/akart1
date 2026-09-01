import { getCurrentUser } from 'auth';
import { navigate, renderBackButton, initBackButtons } from 'utils';

const escapeHtml = (value) => String(value ?? '').replace(/[&<>'"]/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
}[c]));

const sel = (value, optionValue) => value === optionValue ? ' selected' : '';

export const render = async (productId = null) => {
    const store = await import('store');
    let product = { name: '', price: '', description: '', imageUrl: '', unit: '', category: 'crop', quantity: '', location: '', serviceType: '' };
    let title = 'Post a New Ad';

    if (productId) {
        const user = getCurrentUser();
        const products = user ? store.getProductsByFarmer(user.id) : [];
        product = products.find(p => p.id === productId) || product;
        title = 'Edit Your Ad';
    }

    const backFallback = productId ? '/farmer-dashboard/manage-listings' : '/farmer-dashboard';

    return `
      <main>
        <div class="back-nav">${renderBackButton(backFallback, '← Back')}</div>
        <div class="form-container post-ad-form" style="max-width: 720px; margin: 0 auto 2rem; padding: 2rem;">
          <h2>${title}</h2>
          <form id="post-ad-form" data-product-id="${productId || ''}">
            <div class="form-group">
                <label for="ad-category">Category</label>
                <select id="ad-category" required style="background-color: rgba(255,255,255,0.9); color: #000; font-weight: bold; padding: 0.75rem; border: none; border-radius: 6px; width: 100%;">
                    <option value="crop"${sel(product.category, 'crop')}>Crop / Produce</option>
                    <option value="equipment"${sel(product.category, 'equipment')}>Equipment</option>
                    <option value="agriservice"${sel(product.category, 'agriservice')}>AgriService (Rental)</option>
                </select>
            </div>
            <div class="form-group">
              <label for="product-name">Product/Service Name</label>
              <input id="product-name" type="text" placeholder="e.g., Tomato / Tractor Rental / Drone Spray" required value="${escapeHtml(product.name)}" style="background-color: rgba(255,255,255,0.9); color: #000; font-weight: bold; padding: 0.75rem; border: none; border-radius: 6px; width: 100%;">
            </div>
            <div class="form-group">
              <label for="product-quantity">Quantity</label>
              <input id="product-quantity" type="text" placeholder="e.g., 200 (leave blank for rentals)" value="${escapeHtml(product.quantity)}" style="background-color: rgba(255,255,255,0.9); color: #000; font-weight: bold; padding: 0.75rem; border: none; border-radius: 6px; width: 100%;">
            </div>
            <div class="form-group">
              <label for="product-unit">Unit</label>
              <select id="product-unit" required style="background-color: rgba(255,255,255,0.9); color: #000; font-weight: bold; padding: 0.75rem; border: none; border-radius: 6px; width: 100%;">
                <option value="">Select unit...</option>
                <option value="kg"${sel(product.unit, 'kg')}>kg</option>
                <option value="quintal"${sel(product.unit, 'quintal')}>quintal</option>
                <option value="liter"${sel(product.unit, 'liter')}>liter</option>
                <option value="day"${sel(product.unit, 'day')}>per day</option>
                <option value="dozen"${sel(product.unit, 'dozen')}>dozen</option>
                <option value="bag"${sel(product.unit, 'bag')}>bag</option>
                <option value="unit"${sel(product.unit, 'unit')}>unit</option>
              </select>
            </div>
            <div class="form-group">
              <label for="product-price">Price per unit</label>
              <input type="number" id="product-price" placeholder="e.g., 20" required value="${escapeHtml(product.price)}" style="background-color: rgba(255,255,255,0.9); color: #000; font-weight: bold; padding: 0.75rem; border: none; border-radius: 6px; width: 100%;">
            </div>
            <div class="form-group">
              <label for="service-type">Service Type (for rentals)</label>
              <select id="service-type" style="background-color: rgba(255,255,255,0.9); color: #000; font-weight: bold; padding: 0.75rem; border: none; border-radius: 6px; width: 100%;">
                <option value="">Select...</option>
                <option value="tractor"${sel(product.serviceType, 'tractor')}>Tractor</option>
                <option value="drone"${sel(product.serviceType, 'drone')}>Drone</option>
              </select>
            </div>
            <div class="form-group">
              <label for="state-select">Location</label>
              <select id="state-select" required style="background-color: rgba(255,255,255,0.9); color: #000; font-weight: bold; padding: 0.75rem; border: none; border-radius: 6px; width: 100%;">
                <option value="">Select State/UT...</option>
                <option>Andhra Pradesh</option><option>Arunachal Pradesh</option><option>Assam</option><option>Bihar</option>
                <option>Chhattisgarh</option><option>Goa</option><option>Gujarat</option><option>Haryana</option>
                <option>Himachal Pradesh</option><option>Jharkhand</option><option>Karnataka</option><option>Kerala</option>
                <option>Madhya Pradesh</option><option>Maharashtra</option><option>Manipur</option><option>Meghalaya</option>
                <option>Mizoram</option><option>Nagaland</option><option>Odisha</option><option>Punjab</option>
                <option>Rajasthan</option><option>Sikkim</option><option>Tamil Nadu</option><option>Telangana</option>
                <option>Tripura</option><option>Uttar Pradesh</option><option>Uttarakhand</option><option>West Bengal</option>
                <option>Andaman and Nicobar Islands</option><option>Chandigarh</option><option>Dadra and Nagar Haveli and Daman and Diu</option>
                <option>Delhi</option><option>Jammu and Kashmir</option><option>Ladakh</option><option>Lakshadweep</option><option>Puducherry</option>
              </select>
              <input id="district-input" type="text" placeholder="District / City (optional)" style="margin-top:0.5rem; background-color: rgba(255,255,255,0.9); color: #000; font-weight: bold; padding: 0.75rem; border: none; border-radius: 6px; width: 100%;">
              <button type="button" id="detect-gps" class="btn btn-secondary" style="margin-top:0.5rem; width: 100%; font-size: 1.1rem; padding: 1rem;">Auto-detect GPS</button>
            </div>
            <div class="form-group">
              <label for="images">Upload Images</label>
              <input type="file" id="images" accept="image/*" multiple style="background-color: rgba(255,255,255,0.9); color: #000; font-weight: bold; padding: 0.75rem; border: none; border-radius: 6px; width: 100%;">
            </div>
            <div class="form-group">
              <label for="product-description">Short Description</label>
              <textarea id="product-description" placeholder="e.g., Fresh organic tomatoes / 50HP tractor with plough" style="background-color: rgba(255,255,255,0.9); color: #000; font-weight: bold; padding: 0.75rem; border: none; border-radius: 6px; width: 100%;">${escapeHtml(product.description)}</textarea>
            </div>
            <button type="submit" class="btn btn-primary" style="width: 100%; margin-top: 1rem; font-size: 1.1rem; padding: 1rem;">${productId ? 'Update Ad' : 'Post Ad'}</button>
          </form>
        </div>
      </main>
    `;
};

export const addEventListeners = () => {
    const postAdForm = document.getElementById('post-ad-form');
    if (!postAdForm) return;
    initBackButtons();
    const gpsBtn = document.getElementById('detect-gps');
    if (gpsBtn) {
        gpsBtn.addEventListener('click', () => {
            navigator.geolocation?.getCurrentPosition(pos => {
                gpsBtn.textContent = `Detected: ${pos.coords.latitude.toFixed(3)}, ${pos.coords.longitude.toFixed(3)}`;
                gpsBtn.dataset.coords = `${pos.coords.latitude},${pos.coords.longitude}`;
            }, () => { gpsBtn.textContent = 'GPS unavailable'; });
        });
    }
    postAdForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const store = await import('store');
        const user = (await import('auth')).getCurrentUser();
        const name = document.getElementById('product-name').value.trim();
        const category = document.getElementById('ad-category').value;
        const quantity = document.getElementById('product-quantity').value.trim();
        const unit = document.getElementById('product-unit').value || 'unit';
        const price = document.getElementById('product-price').value;
        const desc = document.getElementById('product-description').value.trim();
        const state = document.getElementById('state-select').value;
        const district = document.getElementById('district-input').value.trim();
        const coords = document.getElementById('detect-gps')?.dataset.coords || '';
        const serviceType = document.getElementById('service-type').value;
        const files = Array.from(document.getElementById('images').files || []);
        let imageUrls = [];
        for (const file of files) {
            try { const url = await websim.upload(file); imageUrls.push(url); } catch(e) {}
        }
        const catalogProduct = store.getCatalogProduct?.(name);
        const primaryImage = imageUrls[0] || (catalogProduct?.imageUrl || ((category === 'agriservice' || category === 'equipment')
            ? (serviceType === 'drone' ? 'asset%20drone-1.png' : 'asset%20tractor-1.png')
            : 'assets/products/default.svg'));
        const location = [district, state].filter(Boolean).join(', ') || coords || '—';
        const editingId = postAdForm.dataset.productId || '';
        if (category === 'crop') {
            const payload = { name, price, unit, description: desc, imageUrl: primaryImage, images: imageUrls, quantity, location, farmerId: user.id };
            if (editingId) { await store.updateProduct(editingId, { ...payload, status:'Pending Review', reviewedAt:null }); }
            else { await store.addProduct(payload); }
            (await import('utils')).navigate('/farmer-dashboard');
        } else {
            const kind = serviceType === 'drone' ? 'drone' : 'tractor';
            const payload = { name, type: serviceType || undefined, price: `₹${price}/${unit}`, availability: 'Available', location, imageUrl: primaryImage, images: imageUrls, ownerId: user.id, description: desc, quantity };
            if (editingId) {
                const all = await import('store');
                const agri = all.getAgriServices();
                const group = kind === 'drone' ? 'drones' : 'tractors';
                const existing = agri[group].find(s => s.id === editingId);
                if (existing) Object.assign(existing, payload, { id: editingId, verificationStatus:kind==='tractor'?'Pending Inspection':'Pending Review', verified:false });
                localStorage.setItem('kissan_market_agri_services', JSON.stringify(agri));
                (await import('utils')).navigate('/farmer-dashboard/tractor-rentals');
            } else {
                store.addAgriService(kind, payload);
                (await import('utils')).navigate('/agri-services');
            }
        }
    });
};
