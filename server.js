export const schema = `
  CREATE TABLE IF NOT EXISTS akart_users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    phone TEXT,
    role TEXT NOT NULL CHECK(role IN ('customer','farmer','admin')),
    account_status TEXT NOT NULL DEFAULT 'active',
    address TEXT,
    password_salt TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    password_iterations INTEGER NOT NULL DEFAULT 100000,
    is_demo INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS akart_sessions (
    token_hash TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    expires_at TEXT NOT NULL,
    created_at TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS akart_audit_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    admin_id TEXT NOT NULL,
    action TEXT NOT NULL,
    target_id TEXT NOT NULL,
    notes TEXT,
    created_at TEXT NOT NULL
  );
  CREATE INDEX IF NOT EXISTS akart_sessions_user ON akart_sessions(user_id);
  CREATE INDEX IF NOT EXISTS akart_audit_created ON akart_audit_logs(created_at);
`;

const encoder = new TextEncoder();
const hex = bytes => [...new Uint8Array(bytes)].map(value => value.toString(16).padStart(2, '0')).join('');
const randomHex = size => {
  const bytes = new Uint8Array(size);
  crypto.getRandomValues(bytes);
  return hex(bytes);
};
const digest = async value => hex(await crypto.subtle.digest('SHA-256', encoder.encode(value)));
const passwordHash = async (password, salt, iterations = 100000) => {
  const material = await crypto.subtle.importKey('raw', encoder.encode(password), 'PBKDF2', false, ['deriveBits']);
  return hex(await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt: encoder.encode(salt), iterations }, material, 256));
};
const json = (body, status = 200) => Response.json(body, { status, headers: { 'cache-control': 'no-store' } });
const cleanEmail = value => String(value || '').trim().toLowerCase();
const publicUser = row => row ? ({
  id: row.id, uid: row.id, name: row.name, email: row.email, phone: row.phone || '', role: row.role,
  accountStatus: row.account_status, address: row.address || '', createdAt: row.created_at, demo: Boolean(row.is_demo), backend: true
}) : null;

const seedDemoUsers = async env => {
  const now = new Date().toISOString();
  const rows = [
    ['demo_customer', 'Demo Customer', 'customer.demo@akart.local', 'customer', 'akart-customer-demo-v1', '2d546bfd551e7a374caa95178ca126dd95e6ec70c4b4bee7f1aceac38fe1a047', 'Hyderabad, Telangana'],
    ['demo_farmer', 'Demo Farmer', 'farmer.demo@akart.local', 'farmer', 'akart-farmer-demo-v1', 'ca572982c60fa42dcd2a4563e687b66ad869a0acae5da473df8bf2c5dad43c6c', 'Guntur, Andhra Pradesh'],
    ['demo_admin', 'AKart Administrator', 'admin.demo@akart.local', 'admin', 'akart-admin-demo-v1', '9a487753a93395036e3d08365eb01e5a72627303fcc644dcb5b4b9b719985515', '']
  ];
  await env.DB.batch(rows.map(row => env.DB.prepare(
    `INSERT INTO akart_users
      (id,name,email,role,account_status,address,password_salt,password_hash,password_iterations,is_demo,created_at)
     VALUES (?,?,?,?,?,?,?,?,100000,1,?)
     ON CONFLICT(id) DO UPDATE SET name=excluded.name,email=excluded.email,role=excluded.role,
       address=excluded.address,password_salt=excluded.password_salt,password_hash=excluded.password_hash,
       password_iterations=100000,is_demo=1`
  ).bind(row[0], row[1], row[2], row[3], 'active', row[6], row[4], row[5], now)));
};

const bearerUser = async (request, env, requiredRole = null) => {
  const header = request.headers.get('authorization') || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  if (!token) return null;
  const tokenHash = await digest(token);
  const row = await env.DB.prepare(
    `SELECT u.* FROM akart_sessions s JOIN akart_users u ON u.id=s.user_id
     WHERE s.token_hash=? AND s.expires_at>? AND u.account_status='active'`
  ).bind(tokenHash, new Date().toISOString()).first();
  if (!row || (requiredRole && row.role !== requiredRole)) return null;
  return row;
};

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    await seedDemoUsers(env);

    if (request.method === 'POST' && url.pathname === '/api/auth/login') {
      const body = await request.json().catch(() => ({}));
      const email = cleanEmail(body.email);
      const role = String(body.role || '');
      const row = await env.DB.prepare('SELECT * FROM akart_users WHERE (email=? OR phone=?) AND role=?').bind(email, String(body.email || '').trim(), role).first();
      if (!row || row.account_status !== 'active') return json({ error: 'Invalid credentials or inactive account.' }, 401);
      const computed = await passwordHash(String(body.password || ''), row.password_salt, row.password_iterations);
      if (computed !== row.password_hash) return json({ error: 'Invalid credentials or inactive account.' }, 401);
      const token = randomHex(32);
      const expires = new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString();
      await env.DB.prepare('INSERT INTO akart_sessions(token_hash,user_id,expires_at,created_at) VALUES(?,?,?,?)')
        .bind(await digest(token), row.id, expires, new Date().toISOString()).run();
      return json({ token, expiresAt: expires, user: publicUser(row) });
    }

    if (request.method === 'POST' && url.pathname === '/api/auth/register') {
      const body = await request.json().catch(() => ({}));
      const email = cleanEmail(body.email);
      const role = body.role === 'farmer' ? 'farmer' : body.role === 'customer' ? 'customer' : '';
      const password = String(body.password || '');
      if (!role || !email || !String(body.name || '').trim() || password.length < 8) return json({ error: 'Valid name, email, role, and password are required.' }, 400);
      if (await env.DB.prepare('SELECT id FROM akart_users WHERE email=?').bind(email).first()) return json({ error: 'An account with this email already exists.', code: 'DUPLICATE_EMAIL' }, 409);
      const id = `${role}_${crypto.randomUUID()}`;
      const salt = randomHex(18);
      const hash = await passwordHash(password, salt);
      const now = new Date().toISOString();
      await env.DB.prepare(
        `INSERT INTO akart_users(id,name,email,phone,role,account_status,address,password_salt,password_hash,password_iterations,is_demo,created_at)
         VALUES(?,?,?,?,?,'active',?,?,?,100000,0,?)`
      ).bind(id, String(body.name).trim().slice(0, 100), email, String(body.phone || '').slice(0, 30), role, String(body.address || '').slice(0, 240), salt, hash, now).run();
      return json({ ok: true }, 201);
    }

    if (request.method === 'GET' && url.pathname === '/api/auth/session') {
      const user = await bearerUser(request, env);
      return user ? json({ user: publicUser(user) }) : json({ error: 'Session expired.' }, 401);
    }

    if (request.method === 'POST' && url.pathname === '/api/auth/logout') {
      const header = request.headers.get('authorization') || '';
      const token = header.startsWith('Bearer ') ? header.slice(7) : '';
      if (token) await env.DB.prepare('DELETE FROM akart_sessions WHERE token_hash=?').bind(await digest(token)).run();
      return json({ ok: true });
    }

    if (request.method === 'POST' && url.pathname === '/api/admin/audit') {
      const admin = await bearerUser(request, env, 'admin');
      if (!admin) return json({ error: 'Admin authorization required.' }, 403);
      const body = await request.json().catch(() => ({}));
      if (!body.action || !body.targetId) return json({ error: 'Action and target are required.' }, 400);
      await env.DB.prepare('INSERT INTO akart_audit_logs(admin_id,action,target_id,notes,created_at) VALUES(?,?,?,?,?)')
        .bind(admin.id, String(body.action).slice(0, 120), String(body.targetId).slice(0, 120), String(body.notes || '').slice(0, 500), new Date().toISOString()).run();
      return json({ ok: true });
    }

    if (request.method === 'POST' && url.pathname === '/api/admin/user-status') {
      const admin = await bearerUser(request, env, 'admin');
      if (!admin) return json({ error: 'Admin authorization required.' }, 403);
      const body = await request.json().catch(() => ({}));
      const accountStatus = body.status === 'suspended' ? 'suspended' : 'active';
      if (!body.userId || body.userId === admin.id) return json({ error: 'Invalid account target.' }, 400);
      const result = await env.DB.prepare('UPDATE akart_users SET account_status=? WHERE id=? AND role<>\'admin\'').bind(accountStatus, String(body.userId)).run();
      return json({ ok: true, updated: result.meta.changes });
    }

    if (request.method === 'GET' && url.pathname === '/api/admin/audit') {
      const admin = await bearerUser(request, env, 'admin');
      if (!admin) return json({ error: 'Admin authorization required.' }, 403);
      const { results } = await env.DB.prepare('SELECT * FROM akart_audit_logs ORDER BY created_at DESC LIMIT 50').all();
      return json({ logs: results });
    }

    return json({ error: 'Not found.' }, 404);
  }
};
