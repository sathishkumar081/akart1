import { initRouter } from 'router';
import { initializeStore } from 'store';
import { initStyles } from 'styles/manifest';
import { initializeAuthState } from 'auth';

// Initialize the mock backend, styles, and the router
document.addEventListener('DOMContentLoaded', async () => {
        const deferCss = false;

    await initializeStore();

    // Restore Firebase's persisted Google session before the router evaluates
    // protected routes. Email/password sessions continue to use the existing
    // local sessionStorage implementation.
    await initializeAuthState();

    (await import('store')).seedPayments?.();

    if (!deferCss) {
        await initStyles();
    } else {
        requestAnimationFrame(() => initStyles());
    }

    const i18n = await import('i18n');
    await i18n.setLocale(localStorage.getItem('kissan_lang') || 'en');

    initRouter();
    // Welcome popup (first visit)
    if (!localStorage.getItem('kissan_welcome_seen')) {
      const overlay = document.createElement('div');
      overlay.className = 'welcome-overlay';
      overlay.innerHTML = `
        <div class="welcome-card" role="dialog" aria-modal="true" aria-labelledby="welcomeTitle">
          <h3 id="welcomeTitle">🌾 ${i18n.t('welcome.title', 'Welcome to AKart')}</h3>
          <p>${i18n.t('welcome.text', 'Empowering Farmers, Connecting Customers, and Sustaining the Future. Please choose your language and continue.')}</p>
          <label for="welcome-lang" style="font-weight:700;margin-top:.5rem;">${i18n.t('welcome.language', 'Language')}</label>
          <select id="welcome-lang" class="welcome-select">
            <option value="en">English</option>
            <option value="hi">हिंदी</option>
            <option value="te">తెలుగు</option>
            <option value="ta">தமிழ்</option>
          </select>
          <button id="welcome-continue" class="btn btn-primary" style="margin-top:1rem;">${i18n.t('welcome.continue', 'Continue')}</button>
        </div>`;
      document.body.appendChild(overlay);
      document.body.style.overflow = 'hidden';
      document.getElementById('welcome-continue').addEventListener('click', async () => {
        const lang = document.getElementById('welcome-lang').value;
        localStorage.setItem('kissan_lang', lang);
        localStorage.setItem('kissan_welcome_seen', '1');
        await i18n.setLocale(lang);
        i18n.applyTranslations();
        window.dispatchEvent(new Event('language-changed'));
        overlay.remove();
        document.body.style.overflow = '';
      });
    }
});
