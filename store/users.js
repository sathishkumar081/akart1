import { KEYS, read, write } from './storage.js';

export const getUsers = () => read(KEYS.USERS);
export const addUser = (userData) => {
  const { password, ...profileData } = userData || {};
  const users = getUsers();
  const email = String(profileData.email || '').trim().toLowerCase();
  const phone = String(profileData.phone || '').replace(/\D/g, '');
  if (users.find(u => String(u.email || '').trim().toLowerCase() === email)) {
    return { ok: false, code: 'DUPLICATE_EMAIL' };
  }
  if (phone && users.find(u => String(u.phone || '').replace(/\D/g, '') === phone)) {
    return { ok: false, code: 'DUPLICATE_PHONE' };
  }
  const newUser = {
    id: `${profileData.role}${Date.now()}`,
    ...profileData,
    name: String(profileData.name || '').trim(),
    email,
    phone,
    createdAt: new Date().toISOString()
  };
  users.push(newUser);
  write(KEYS.USERS, users);
  return { ok: true, user: newUser };
};
export const getFarmerById = (id) => getUsers().find(u => u.id === id && u.role === 'farmer');
export const upsertUserProfile = profile => {
  if (!profile?.id || !['customer','farmer','admin'].includes(profile.role)) return null;
  const safe = { ...profile }; delete safe.password;
  const users = getUsers(); const index = users.findIndex(user => user.id === safe.id || user.email === safe.email);
  if (index >= 0) users[index] = { ...users[index], ...safe };
  else users.push(safe);
  write(KEYS.USERS, users);
  return safe;
};
