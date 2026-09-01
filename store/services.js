import { KEYS, read, write, getRoom } from './storage.js';
import { addAdminNotification } from './admin.js';

// Always return a well-formed collection. Protects every consumer (marketplace,
// Fertilizer Store, Waste to Company) from a partial or empty stored value,
// which previously crashed pages with "Cannot read properties of undefined".
export const getAgriServices = () => {
  const raw = read(KEYS.AGRI_SERVICES);
  if (raw && typeof raw === 'object' && !Array.isArray(raw)) {
    return { tractors: raw.tractors || [], drones: raw.drones || [], fertilizers: raw.fertilizers || [], ...raw };
  }
  return { tractors: [], drones: [], fertilizers: [] };
};
export const getPublicAgriServices = () => {
  const all = getAgriServices();
  return {
    ...all,
    tractors: all.tractors.filter(item => item.verificationStatus === 'Verified'),
    drones: all.drones.filter(item => item.verificationStatus === 'Verified'),
    fertilizers: all.fertilizers.filter(item => item.verificationStatus === 'Verified' && (!item.expiryDate || new Date(item.expiryDate) >= new Date()))
  };
};
export const addAgriService = (kind, data) => {
  const all = getAgriServices();
  const id = `${kind}${Date.now()}`;
  const entry = { id, ...data, createdAt: new Date().toISOString(), verificationStatus: kind === 'fertilizer' ? 'Pending Verification' : kind === 'tractor' ? 'Pending Inspection' : 'Pending Review', verified: false };
  if (kind === 'tractor') all.tractors.push(entry);
  else if (kind === 'drone') all.drones.push(entry);
  else if (kind === 'fertilizer' && all.fertilizers) all.fertilizers.push(entry);
  write(KEYS.AGRI_SERVICES, all);
  addAdminNotification(kind,`New ${kind} listing awaiting verification`,id);
  const room = getRoom(); if (room) try { room.collection('agri_service').create({ kind, ...entry }); } catch(e) {}
};

export const updateAgriService = (kind, id, changes) => {
  const all = getAgriServices();
  const key = kind === 'tractor' ? 'tractors' : kind === 'drone' ? 'drones' : 'fertilizers';
  all[key] = all[key].map(item => item.id === id ? { ...item, ...changes, reviewedAt: new Date().toISOString() } : item);
  write(KEYS.AGRI_SERVICES, all);
  return all[key].find(item => item.id === id) || null;
};
