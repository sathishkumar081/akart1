// Firebase-backed Google authentication.
//
// Firebase's web configuration is public client configuration, not a secret.
// This project is served as static files, so values can be supplied either by
// a Vite host (import.meta.env.VITE_*) or by the host runtime (window.ENV).

const FIREBASE_VERSION = '10.14.1';
const CONFIG_KEYS = [
    'apiKey',
    'authDomain',
    'projectId',
    'storageBucket',
    'messagingSenderId',
    'appId'
];

let firebaseModulesPromise;
let firebaseState;
let authStateListenerStarted = false;
let firstAuthStatePromise;
const profileOperations = new Map();
const DEFAULT_AVATAR = 'assets/default-avatar.png';

const runtimeEnv = () => {
    const viteEnv = import.meta.env || {};
    const hostEnv = typeof window !== 'undefined' ? (window.ENV || {}) : {};
    return { ...viteEnv, ...hostEnv };
};

export const getFirebaseConfig = () => {
    const env = runtimeEnv();
    const supplied = env.FIREBASE_CONFIG && typeof env.FIREBASE_CONFIG === 'object'
        ? env.FIREBASE_CONFIG
        : {};

    return {
        apiKey: supplied.apiKey || env.VITE_FIREBASE_API_KEY || env.FIREBASE_API_KEY || '',
        authDomain: supplied.authDomain || env.VITE_FIREBASE_AUTH_DOMAIN || env.FIREBASE_AUTH_DOMAIN || '',
        projectId: supplied.projectId || env.VITE_FIREBASE_PROJECT_ID || env.FIREBASE_PROJECT_ID || '',
        storageBucket: supplied.storageBucket || env.VITE_FIREBASE_STORAGE_BUCKET || env.FIREBASE_STORAGE_BUCKET || '',
        messagingSenderId: supplied.messagingSenderId || env.VITE_FIREBASE_MESSAGING_SENDER_ID || env.FIREBASE_MESSAGING_SENDER_ID || '',
        appId: supplied.appId || env.VITE_FIREBASE_APP_ID || env.FIREBASE_APP_ID || ''
    };
};

export const isFirebaseConfigured = () =>
    CONFIG_KEYS.every(key => String(getFirebaseConfig()[key] || '').trim().length > 0);

const firebaseError = (code, message = code) => {
    const error = new Error(message);
    error.code = code;
    return error;
};

const loadFirebaseModules = () => {
    if (!firebaseModulesPromise) {
        firebaseModulesPromise = Promise.all([
            import(`https://www.gstatic.com/firebasejs/${FIREBASE_VERSION}/firebase-app.js`),
            import(`https://www.gstatic.com/firebasejs/${FIREBASE_VERSION}/firebase-auth.js`),
            import(`https://www.gstatic.com/firebasejs/${FIREBASE_VERSION}/firebase-firestore.js`)
        ]).then(([app, auth, firestore]) => ({ app, auth, firestore }));
    }
    return firebaseModulesPromise;
};

const ensureFirebase = async () => {
    if (firebaseState) {
        if (firebaseState.error) throw firebaseState.error;
        return firebaseState;
    }
    if (!isFirebaseConfigured()) throw firebaseError('auth/firebase-not-configured');

    try {
        const modules = await loadFirebaseModules();
        const config = getFirebaseConfig();
        const { getApps, getApp, initializeApp } = modules.app;
        const app = getApps().length ? getApp() : initializeApp(config);
        const auth = modules.auth.getAuth(app);
        await modules.auth.setPersistence(auth, modules.auth.browserLocalPersistence);
        firebaseState = {
            app,
            auth,
            db: modules.firestore.getFirestore(app),
            modules
        };
        return firebaseState;
    } catch (error) {
        const wrapped = firebaseError(error?.code || 'auth/firebase-initialization-failed');
        firebaseState = { error: wrapped };
        throw wrapped;
    }
};

const profileFor = (firebaseUser, profile = {}) => ({
    id: firebaseUser.uid,
    uid: firebaseUser.uid,
    name: profile.name || firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'AKart user',
    email: profile.email || firebaseUser.email || '',
    photoURL: profile.photoURL || firebaseUser.photoURL || DEFAULT_AVATAR,
    role: profile.role === 'farmer' || profile.role === 'admin' ? profile.role : 'customer',
    provider: profile.provider || 'google',
    firebase: true,
    accountStatus: profile.accountStatus || profile.status || 'active'
});

const getOrCreateProfile = async (state, firebaseUser, requestedRole = 'customer') => {
    if (profileOperations.has(firebaseUser.uid)) return profileOperations.get(firebaseUser.uid);
    const operation = (async () => {
        const { doc, getDoc, setDoc, serverTimestamp } = state.modules.firestore;
        const ref = doc(state.db, 'users', firebaseUser.uid);
        const snapshot = await getDoc(ref);

        if (snapshot.exists()) {
            // Existing profile data, especially role, is authoritative. Do not
            // overwrite it with the role selected on a later login.
            return profileFor(firebaseUser, snapshot.data());
        }

        const role = requestedRole === 'farmer' ? 'farmer' : 'customer';
        const newProfile = {
            uid: firebaseUser.uid,
            name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'AKart user',
            email: firebaseUser.email || '',
            photoURL: firebaseUser.photoURL || DEFAULT_AVATAR,
            role,
            provider: 'google',
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        };
        await setDoc(ref, newProfile);
        return profileFor(firebaseUser, newProfile);
    })();
    profileOperations.set(firebaseUser.uid, operation);
    try {
        return await operation;
    } finally {
        profileOperations.delete(firebaseUser.uid);
    }
};

export const initializeFirebaseAuth = async (onStateChanged = () => {}) => {
    if (!isFirebaseConfigured()) return { configured: false };
    const state = await ensureFirebase();
    if (!authStateListenerStarted) {
        authStateListenerStarted = true;
        let redirectProfile = null;
        try {
            const redirectResult = await state.modules.auth.getRedirectResult(state.auth);
            if (redirectResult?.user) {
                const pendingRole = typeof sessionStorage !== 'undefined'
                    ? sessionStorage.getItem('kissan_google_pending_role') || 'customer'
                    : 'customer';
                redirectProfile = await getOrCreateProfile(state, redirectResult.user, pendingRole);
                if (typeof sessionStorage !== 'undefined') sessionStorage.removeItem('kissan_google_pending_role');
            }
        } catch (error) {
            onStateChanged(null, error);
        }
        firstAuthStatePromise = new Promise(resolve => {
            state.modules.auth.onAuthStateChanged(state.auth, async (firebaseUser) => {
                if (!firebaseUser) {
                    onStateChanged(null);
                    resolve();
                    return;
                }
                try {
                    if (redirectProfile && redirectProfile.uid === firebaseUser.uid) {
                        onStateChanged(redirectProfile);
                        resolve();
                        return;
                    }
                    const pendingRole = typeof sessionStorage !== 'undefined'
                        ? sessionStorage.getItem('kissan_google_pending_role') || 'customer'
                        : 'customer';
                    const profile = await getOrCreateProfile(state, firebaseUser, pendingRole);
                    if (typeof sessionStorage !== 'undefined') sessionStorage.removeItem('kissan_google_pending_role');
                    onStateChanged(profile);
                } catch (error) {
                    // A signed-in Firebase user without a readable profile must
                    // not receive a partial local session.
                    onStateChanged(null, error);
                } finally {
                    resolve();
                }
            });
        });
    }
    await firstAuthStatePromise;
    return { configured: true };
};

export const signInWithGoogle = async (requestedRole = 'customer') => {
    const state = await ensureFirebase();
    if (typeof sessionStorage !== 'undefined') {
        sessionStorage.setItem('kissan_google_pending_role', requestedRole === 'farmer' ? 'farmer' : 'customer');
    }
    const provider = new state.modules.auth.GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    try {
        const useRedirect = typeof window !== 'undefined'
            && (window.matchMedia?.('(max-width: 600px)')?.matches || window.matchMedia?.('(pointer: coarse)')?.matches);
        if (useRedirect) {
            await state.modules.auth.signInWithRedirect(state.auth, provider);
            return { redirecting: true };
        }
        const result = await state.modules.auth.signInWithPopup(state.auth, provider);
        const profile = await getOrCreateProfile(state, result.user, requestedRole);
        if (typeof sessionStorage !== 'undefined') sessionStorage.removeItem('kissan_google_pending_role');
        return { profile, firebaseUser: result.user };
    } catch (error) {
        // Do not leave a Firebase session active when profile creation failed.
        // A normal provider error is harmless; signOut is best-effort.
        if (error?.code === 'permission-denied' || error?.code === 'failed-precondition') {
            try { await state.modules.auth.signOut(state.auth); } catch {}
        }
        if (typeof sessionStorage !== 'undefined') sessionStorage.removeItem('kissan_google_pending_role');
        throw error;
    }
};

export const signOutFirebase = async () => {
    if (!isFirebaseConfigured()) return;
    const state = await ensureFirebase();
    await state.modules.auth.signOut(state.auth);
};

export const verifyFirebaseSession = async (requiredRole = null) => {
    const state = await ensureFirebase();
    const firebaseUser = state.auth.currentUser;
    if (!firebaseUser) return null;
    const ref = state.modules.firestore.doc(state.db, 'users', firebaseUser.uid);
    const snapshot = await state.modules.firestore.getDoc(ref);
    if (!snapshot.exists()) return null;
    const profile = profileFor(firebaseUser, snapshot.data());
    if (profile.accountStatus === 'suspended' || (requiredRole && profile.role !== requiredRole)) return null;
    if (requiredRole === 'admin') {
        const token = await state.modules.auth.getIdTokenResult(firebaseUser, true);
        if (token.claims.role !== 'admin' && token.claims.admin !== true) return null;
    }
    return profile;
};

export const googleAuthErrorMessage = (error) => {
    const code = String(error?.code || error?.message || '').toLowerCase();
    const messages = {
        'auth/firebase-not-configured': 'Google sign-in is not configured yet. Add the Firebase web configuration to this deployment.',
        'auth/firebase-initialization-failed': 'Google sign-in could not initialize. Check the Firebase web configuration.',
        'auth/popup-closed-by-user': 'Google sign-in was cancelled.',
        'auth/redirect-cancelled-by-user': 'Google sign-in was cancelled.',
        'auth/popup-blocked': 'Google sign-in was blocked by your browser. Please allow popups and try again.',
        'auth/cancelled-popup-request': 'Another Google sign-in request is already in progress.',
        'auth/account-exists-with-different-credential': 'An account with this email already uses email/password. Sign in with that method instead.',
        'auth/unauthorized-domain': 'Google sign-in is not configured for this website domain.',
        'auth/operation-not-allowed': 'Google sign-in is disabled in Firebase Authentication.',
        'auth/network-request-failed': 'A network error interrupted Google sign-in. Check your connection and try again.',
        'auth/invalid-api-key': 'Google sign-in has an invalid Firebase API key. Check the deployment configuration.',
        'auth/internal-error': 'Google sign-in encountered a temporary Firebase error. Please try again.',
        'auth/invalid-credential': 'Google sign-in returned an invalid credential. Please try again.',
        'auth/user-disabled': 'This Firebase account has been disabled. Contact AKart support.',
        'auth/too-many-requests': 'Too many sign-in attempts. Wait a moment and try again.',
        'permission-denied': 'Your Google account authenticated, but its AKart profile could not be saved. Check Firestore rules.'
    };
    return messages[code] || 'Google sign-in could not be completed. Please try again.';
};
