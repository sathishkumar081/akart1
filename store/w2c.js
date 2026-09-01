import { KEYS, read, write, readObj } from './storage.js';
import { getAllProducts } from './products.js';
import { addAdminNotification } from './admin.js';

export const markProductUnsold = (productId, rate = 0.75) => {
  const products = getAllProducts();
  const p = products.find(x => x.id === productId);
  if (!p) return null;
  const buyback = Math.round(Number(p.price) * rate);
  const w2c = JSON.parse(localStorage.getItem(KEYS.W2C) || '[]');
  w2c.push({ id: `w2c${Date.now()}`, demo:Boolean(p.demo || String(p.farmerId).startsWith('demo_')), productId, name: p.name, unit: p.unit, quantity:p.quantity || 1, farmerId: p.farmerId, originalPrice: Number(p.price), requestedBuyback:buyback, buyback, condition:'Unsold produce', status:'Pending Review', at: new Date().toISOString(), history:[{status:'Pending Review', at:new Date().toISOString(), actor:p.farmerId}] });
  write(KEYS.W2C, w2c);
  addAdminNotification('waste',`Waste to Company request: ${p.name}`,w2c.at(-1).id);
  return buyback;
};

export const getWasteToCompanyRecords = (farmerId) => (JSON.parse(localStorage.getItem(KEYS.W2C) || '[]').filter(r => r.farmerId === farmerId));
export const getAllWasteRecords = () => JSON.parse(localStorage.getItem(KEYS.W2C) || '[]');
export const updateWasteRecord = (id, status, changes = {}) => {
  const list = getAllWasteRecords().map(record => record.id === id ? { ...record, ...changes, status, history:[...(record.history || []), { status, at:new Date().toISOString(), actor:'admin' }] } : record);
  write(KEYS.W2C, list);
  return list.find(record => record.id === id) || null;
};
export const acceptWasteOffer = (id, farmerId) => {
  const list = getAllWasteRecords().map(record => record.id === id && record.farmerId === farmerId && record.status === 'Revised Price' ? { ...record, status:'Farmer Accepted', history:[...(record.history || []),{status:'Farmer Accepted',at:new Date().toISOString(),actor:farmerId}] } : record);
  write(KEYS.W2C,list);
  return list.find(record=>record.id===id) || null;
};
export const getEarnings = (farmerId) => (readObj(KEYS.EARNINGS)[farmerId] || 0);
