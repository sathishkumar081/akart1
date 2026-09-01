import { KEYS, read, write, getRoom } from './storage.js';
import { catalogById, PRODUCT_CATALOG } from './catalog.js';
import { addAdminNotification } from './admin.js';

const DEFAULT_IMAGE = 'assets/products/default.svg';

const catalogMatch = (product) => {
  const canonical = catalogById[product.id] || PRODUCT_CATALOG.find(item =>
    item.name.toLowerCase() === String(product.name || '').trim().toLowerCase());
  if (!canonical) return { ...product, imageUrl: product.imageUrl || DEFAULT_IMAGE, imageAlt: product.imageAlt || `${product.name || 'Farm'} product` };
  return {
    ...product,
    name: canonical.name,
    price: canonical.price,
    unit: canonical.unit,
    description: canonical.description,
    imageUrl: canonical.imageUrl,
    imageAlt: canonical.imageAlt
  };
};

const allProducts = () => read(KEYS.PRODUCTS).map(catalogMatch);

export const getProducts = () => allProducts().filter(product => (product.status ?? 'Approved') === 'Approved');
export const getAllProducts = () => allProducts();
export const getProductById = (id) => getProducts().find(product => product.id === id) || null;
export const getCatalogProduct = (name) => PRODUCT_CATALOG.find(product => product.name.toLowerCase() === String(name || '').trim().toLowerCase()) || null;
export const getProductsByFarmer = (farmerId) => allProducts().filter(product => product.farmerId === farmerId);

export const addProduct = async (productData) => {
  const imageUrl = productData.imageUrl || DEFAULT_IMAGE;
  const newProduct = {
    ...productData,
    id: `prod${Date.now()}`,
    imageUrl,
    imageAlt: productData.imageAlt || `${productData.name || 'Farm'} product`,
    demo: Boolean(productData.demo || String(productData.farmerId || '').startsWith('demo_')),
    status: productData.status || 'Pending Review',
    createdAt: new Date().toISOString()
  };
  const room = getRoom();
  if (room) {
    try {
      const rec = await room.collection('product').create(newProduct);
      newProduct.id = rec.id;
    } catch (error) {
      console.warn('Remote product sync failed; keeping the local listing.', error);
    }
  }
  write(KEYS.PRODUCTS, [...allProducts(), newProduct]);
  addAdminNotification('product',`New farmer ad: ${newProduct.name}`,newProduct.id);
  window.dispatchEvent(new Event('products-updated'));
  return newProduct;
};

export const updateProduct = async (productId, updatedData) => {
  const products = allProducts().map(product => product.id === productId ? catalogMatch({ ...product, ...updatedData }) : product);
  write(KEYS.PRODUCTS, products);
  const room = getRoom();
  if (room) {
    try { await room.collection('product').update(productId, updatedData); }
    catch (error) { console.warn('Remote product update failed; local update retained.', error); }
  }
  window.dispatchEvent(new Event('products-updated'));
};

export const deleteProduct = async (productId) => {
  write(KEYS.PRODUCTS, allProducts().filter(product => product.id !== productId));
  const room = getRoom();
  if (room) {
    try { await room.collection('product').delete(productId); }
    catch (error) { console.warn('Remote product deletion failed; local deletion retained.', error); }
  }
  window.dispatchEvent(new Event('products-updated'));
};

export const setProductStatus = (productId, status) => {
  const products = allProducts().map(product => product.id === productId ? { ...product, status, reviewedAt: new Date().toISOString() } : product);
  write(KEYS.PRODUCTS, products);
  return products.find(product => product.id === productId) || null;
};

export const reviewProduct = (productId, review) => {
  const products = allProducts().map(product => product.id === productId ? {
    ...product, status: review.status || product.status, adminNotes: review.adminNotes ?? product.adminNotes,
    qualityReview: { ...(product.qualityReview || {}), ...(review.qualityReview || {}) }, reviewedAt: new Date().toISOString()
  } : product);
  write(KEYS.PRODUCTS, products);
  window.dispatchEvent(new Event('products-updated'));
  return products.find(product => product.id === productId) || null;
};
