const CURRENT_USER_KEY = 'kissan_market_user';
const SESSION_TOKEN_KEY = 'akart_session_token';

// Firebase uses browser-local persistence. Keep the legacy email/password
// session in the same durable browser storage so all UI surfaces can read one
// persisted identity after a refresh, language change, or route change.
const readStoredUser = () => localStorage.getItem(CURRENT_USER_KEY) || sessionStorage.getItem(CURRENT_USER_KEY);

const publicUser = (user) => {
    if (!user) return null;
    const { password, ...safeUser } = user;
    return safeUser;
};

// Accepts an email OR phone number as the identifier so the login screen can
// offer a single "Email / Phone" field while preserving all existing accounts.
const api = async (path, options = {}) => {
    const token = localStorage.getItem(SESSION_TOKEN_KEY);
    const response = await fetch(path, {
        ...options,
        headers: { 'content-type': 'application/json', ...(token ? { authorization: `Bearer ${token}` } : {}), ...(options.headers || {}) }
    });
    const body = await response.json().catch(() => ({}));
    if (!response.ok) throw Object.assign(new Error(body.error || 'Authentication request failed.'), { status: response.status, code: body.code });
    return body;
};

export const login = async (identifier, password, role) => {
    const result = await api('/api/auth/login', { method: 'POST', body: JSON.stringify({ email: identifier, password, role }) });
    localStorage.setItem(SESSION_TOKEN_KEY, result.token);
    setCurrentUser(result.user);
    window.dispatchEvent(new Event('auth-state-changed'));
    return result.user;
};

export const register = async profile => {
    await api('/api/auth/register', { method: 'POST', body: JSON.stringify(profile) });
    return login(profile.email, profile.password, profile.role);
};

export const logout = () => {
    api('/api/auth/logout', { method: 'POST', body: '{}' }).catch(() => undefined);
    localStorage.removeItem(SESSION_TOKEN_KEY);
    localStorage.removeItem(CURRENT_USER_KEY);
    sessionStorage.removeItem(CURRENT_USER_KEY);
    return import('./firebase-auth.js')
        .then(({ signOutFirebase }) => signOutFirebase())
        .catch(() => undefined);
};

export const verifyCurrentSession = async (requiredRole = null) => {
    const current = getCurrentUser();
    if (!current) return null;
    // Firebase profiles continue to rely on Firebase's persisted auth state;
    // backend email/password sessions are verified on every protected route.
    if (current.firebase) {
        try {
            const { verifyFirebaseSession } = await import('./firebase-auth.js');
            const verified = await verifyFirebaseSession(requiredRole);
            if (!verified) { clearCurrentUser(); return null; }
            setCurrentUser(verified);
            return verified;
        } catch { clearCurrentUser(); return null; }
    }
    if (!localStorage.getItem(SESSION_TOKEN_KEY)) { clearCurrentUser(); return null; }
    try {
        const { user } = await api('/api/auth/session');
        if (requiredRole && user.role !== requiredRole) return null;
        setCurrentUser(user);
        return user;
    } catch {
        localStorage.removeItem(SESSION_TOKEN_KEY);
        clearCurrentUser();
        return null;
    }
};

export const recordAdminAction = async (action, targetId, notes = '') =>
    api('/api/admin/audit', { method: 'POST', body: JSON.stringify({ action, targetId, notes }) });

export const setAccountStatus = async (userId, status) =>
    api('/api/admin/user-status', { method: 'POST', body: JSON.stringify({ userId, status }) });

export const getAuditLogs = async () => (await api('/api/admin/audit')).logs || [];

export const getCurrentUser = () => {
    const user = readStoredUser();
    try { return user ? JSON.parse(user) : null; } catch { return null; }
};

export const setCurrentUser = (user) => {
    if (user) {
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(publicUser(user)));
        // Clean up sessions written by earlier versions of the app.
        sessionStorage.removeItem(CURRENT_USER_KEY);
        import('store').then(store => store.upsertUserProfile?.(publicUser(user))).catch(() => undefined);
    }
};

export const clearCurrentUser = () => {
    localStorage.removeItem(CURRENT_USER_KEY);
    sessionStorage.removeItem(CURRENT_USER_KEY);
};

export const initializeAuthState = async () => {
    try {
        const { initializeFirebaseAuth } = await import('./firebase-auth.js');
        return await initializeFirebaseAuth((user, error) => {
            const current = getCurrentUser();
            // Firebase's unauthenticated state must not erase the existing
            // email/password session, which is intentionally kept in the
            // legacy local auth store. It only clears a Firebase-backed user.
            if (user) setCurrentUser(user);
            else if (current?.firebase) clearCurrentUser();
            if (error && current?.firebase) clearCurrentUser();
            window.dispatchEvent(new Event('auth-state-changed'));
        });
    } catch (error) {
        // Firebase is optional until its public web config is supplied. Keep
        // email/password auth fully usable when it is not configured.
        console.warn('Firebase auth initialization unavailable:', error?.code || error);
        return { configured: false, error };
    }
};

export const signInWithGoogle = async (role = 'customer') => {
    const { signInWithGoogle: firebaseGoogleSignIn } = await import('./firebase-auth.js');
    const result = await firebaseGoogleSignIn(role);
    setCurrentUser(result.profile);
    return result.profile;
};

export const getGoogleAuthErrorMessage = async (error) => {
    const { googleAuthErrorMessage } = await import('./firebase-auth.js');
    return googleAuthErrorMessage(error);
};
