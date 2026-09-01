// In-memory navigation history so "Back" can return to the immediately
// previous page/state instead of always jumping to Home.
const navStack = [];

export const navigate = (path) => {
    window.location.hash = path;
};

// Record a route change. The router calls this once a page has actually
// rendered (not for redirects), so the stack reflects real user navigation.
export const pushHistory = (path) => {
    const normalized = path || '/';
    if (navStack[navStack.length - 1] !== normalized) {
        navStack.push(normalized);
        if (navStack.length > 60) navStack.shift();
    }
};

// Return to the immediately previous page/state. Uses the native browser
// history when available, and falls back to our tracked stack otherwise.
export const goBack = (fallback = '/') => {
    // If the browser has prior history entries, honour them (this preserves
    // query params / state and matches the real "Back" behaviour).
    if (window.history.length > 1) {
        window.history.back();
        return;
    }
    navStack.pop();
    const prev = navStack[navStack.length - 1] || fallback;
    window.location.hash = prev;
};

// Clear the tracking stack (used on logout).
export const resetHistory = () => { navStack.length = 0; };

// Reusable, clearly-visible Back button. `fallback` is the route to go to
// when there is no browser history to step back through.
export const renderBackButton = (fallback = '/', label = '← Back') => {
    return `<button type="button" class="btn btn-back" data-back-fallback="${fallback}" aria-label="Go back to previous page">${label}</button>`;
};

// Attach a single delegated handler for all Back buttons on the page.
// Idempotent: buttons already bound are skipped, so calling this from both the
// router and individual pages is safe.
export const initBackButtons = () => {
    document.querySelectorAll('[data-back-fallback]:not([data-back-bound])').forEach(btn => {
        btn.dataset.backBound = '1';
        btn.addEventListener('click', () => {
            goBack(btn.getAttribute('data-back-fallback') || '/');
        });
    });
};
