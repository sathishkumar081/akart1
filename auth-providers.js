// Compatibility exports for older page integrations. Google authentication
// now lives in the Firebase-backed auth module; this file intentionally does
// not load a separate Google OAuth SDK or require a second client setting.
export {
    signInWithGoogle as googleSignIn,
    googleAuthErrorMessage,
    isFirebaseConfigured as isConfigured
} from './firebase-auth.js';
