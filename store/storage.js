export const KEYS = {
  USERS: 'kissan_market_users',
  PRODUCTS: 'kissan_market_products',
  AGRI_SERVICES: 'kissan_market_agri_services',
  CONTACTS: 'kissan_market_contact',
  CART: 'kissan_market_cart',
  W2C: 'kissan_market_waste_to_company',
  EARNINGS: 'kissan_market_earnings',
  PAYMENTS: 'kissan_market_payments',
  ORDERS: 'kissan_market_orders',
  FARMER_FLAGS: 'kissan_market_farmer_flags'
  ,ADMIN_DATA: 'kissan_market_admin_data'
  ,AUDIT_CACHE: 'kissan_market_audit_cache'
};

export const read = (key, storage = localStorage) => {
  try {
    const value = JSON.parse(storage.getItem(key) || '[]');
    return value ?? [];
  } catch (error) {
    console.error(`Unable to read stored data for ${key}.`, error);
    return [];
  }
};
export const write = (key, data, storage = localStorage) => storage.setItem(key, JSON.stringify(data));
export const readObj = (key) => JSON.parse(localStorage.getItem(key) || '{}');

let _room = null;
export function getRoom() {
  if (_room !== null) return _room;
  // The local preview/browser is also a supported runtime. Do not construct
  // the optional Websim socket outside its host frame; that produced noisy
  // console errors on every page and made failed remote writes look like app
  // failures.
  if (typeof window === 'undefined' || window.ENV?.ENABLE_WEBSIM_SOCKET !== 'true' || !window.websim || typeof window.WebsimSocket !== 'function') return null;
  try { _room = new window.WebsimSocket(); } catch (e) { _room = null; }
  return _room;
}
