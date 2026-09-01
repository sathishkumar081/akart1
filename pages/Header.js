import { logout } from 'auth';
import { getCart } from 'store';
import { t } from 'i18n';

const defaultLanguage = 'en';

const escapeHtml = (value) => String(value || '').replace(/[&<>'"]/g, character => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
}[character]));

const renderLanguageSelector = (id) => {
    const saved = localStorage.getItem('kissan_lang') || defaultLanguage;
    return `
        <select id="${id}" aria-label="Language selector" class="lang-select">
            <option value="en" ${saved === 'en' ? 'selected' : ''}>English</option>
            <option value="hi" ${saved === 'hi' ? 'selected' : ''}>हिंदी</option>
            <option value="te" ${saved === 'te' ? 'selected' : ''}>తెలుగు</option>
            <option value="ta" ${saved === 'ta' ? 'selected' : ''}>தமிழ்</option>
        </select>
    `;
};

const NAV_ITEMS = [
    { href: '#/', key: 'nav.home' },
    { href: '#/products', key: 'nav.products' },
    { href: '#/agri-services', key: 'nav.services' },
    { href: '#/about', key: 'nav.about' },
    { href: '#/waste-to-company-info', key: 'nav.waste' },
    { href: '#/blog', key: 'nav.blog' },
    { href: '#/contact-support', key: 'nav.contact' }
];

const renderCartIcon = (user) => {
    if (user && user.role === 'customer') {
        const cart = getCart();
        const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
        return `
            <a href="#/cart" class="cart-icon" title="${t('nav.cart', 'Cart')}" aria-label="${t('nav.cart', 'Cart')}">
                <i class="fa-solid fa-cart-shopping cart-emoji" aria-hidden="true"></i>
                ${itemCount > 0 ? `<span class="cart-count">${itemCount}</span>` : ''}
            </a>
        `;
    }
    return '';
};

export const render = (user) => {
    const isFarmer = user && user.role === 'farmer';
    const isCustomer = user && user.role === 'customer';
    const isAdmin = user && user.role === 'admin';
    const name = escapeHtml(user?.name || user?.email?.split('@')[0] || 'Account');
    const avatar = escapeHtml(user?.photoURL || 'assets/default-avatar.png');

    const navLinks = NAV_ITEMS.map(item => `
        <li><a href="${item.href}" class="nav-link">${t(item.key, item.key)}</a></li>
    `).join('');

    const authButton = user
        ? (isFarmer
            ? `<a href="#/farmer-dashboard" class="btn btn-primary btn-nav">Farmer Dashboard</a>`
            : isAdmin
                ? `<a href="#/admin-dashboard" class="btn btn-primary btn-nav">Admin Dashboard</a>`
                : `<a href="#/customer-dashboard" class="btn btn-primary btn-nav">${t('nav.dashboard', 'Dashboard')}</a>`)
        : `<a href="#/login" class="btn btn-primary btn-nav">${t('nav.login', 'Login')}</a>`;

    const profile = user && !isAdmin ? `
        <a href="#/${isFarmer ? 'farmer-dashboard' : 'customer-dashboard'}" class="header-profile" aria-label="${name} profile">
            <img src="${avatar}" alt="" onerror="this.onerror=null;this.src='assets/default-avatar.png';">
            <span>Hi, ${name}</span>
        </a>` : '';

    const desktopActions = `
        ${renderLanguageSelector('lang-select')}
        ${profile}
        ${renderCartIcon(user)}
        ${authButton}
        ${user ? `<button id="logout-btn" class="btn btn-danger btn-nav" title="${t('nav.logout', 'Logout')}" aria-label="${t('nav.logout', 'Logout')}"><i class="fa-solid fa-right-from-bracket" aria-hidden="true"></i></button>` : ''}
    `;

    const mobileMenu = `
        <div class="mobile-menu" id="mobile-menu">
            <ul class="mobile-nav-list">
                ${NAV_ITEMS.map(item => `<li><a href="${item.href}" class="nav-link">${t(item.key, item.key)}</a></li>`).join('')}
                ${isCustomer ? `<li><a href="#/cart" class="nav-link"><i class="fa-solid fa-cart-shopping" aria-hidden="true"></i> ${t('nav.cart', 'Cart')}</a></li>` : ''}
            </ul>
            <div class="mobile-actions">
                ${renderLanguageSelector('lang-select-mobile')}
                ${profile}
                ${renderCartIcon(user)}
                ${authButton}
                ${user ? `<button id="logout-btn-mobile" class="btn btn-danger btn-nav">${t('nav.logout', 'Logout')}</button>` : ''}
            </div>
        </div>
    `;

    return `
        <header class="main-header">
            <div class="container header-inner">
                <a href="#/" class="logo" aria-label="AKart Home">
                    <span class="logo-icon"><i class="fa-solid fa-leaf" aria-hidden="true"></i></span>
                    <span class="logo-text">AK<span>art</span></span>
                </a>
                <nav class="main-nav" aria-label="Main navigation">
                    <ul>${navLinks}</ul>
                </nav>
                <div class="header-actions">
                    ${desktopActions}
                    <button class="hamburger" id="hamburger-btn" aria-label="Open menu" aria-expanded="false" aria-controls="mobile-menu"><i class="fa-solid fa-bars" aria-hidden="true"></i></button>
                </div>
            </div>
            ${mobileMenu}
        </header>
    `;
};

export const addHeaderListeners = () => {
    // Desktop logout
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
            await logout();
            window.location.hash = '/';
        });
    }
    // Mobile logout
    const logoutBtnMobile = document.getElementById('logout-btn-mobile');
    if (logoutBtnMobile) {
        logoutBtnMobile.addEventListener('click', async () => {
            await logout();
            window.location.hash = '/';
        });
    }

    // Hamburger toggles the mobile menu
    const hamburgerBtn = document.getElementById('hamburger-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    if (hamburgerBtn && mobileMenu) {
        hamburgerBtn.addEventListener('click', () => {
            const open = mobileMenu.classList.toggle('open');
            hamburgerBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
        });
        mobileMenu.addEventListener('click', (e) => {
            if (e.target.closest('a')) {
                mobileMenu.classList.remove('open');
                hamburgerBtn.setAttribute('aria-expanded', 'false');
            }
        });
    }

    // Update cart count when cart changes
    window.addEventListener('cart-updated', () => {
        document.querySelectorAll('.cart-icon').forEach(cartIcon => {
            const cart = getCart();
            const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
            let badge = cartIcon.querySelector('.cart-count');
            if (itemCount > 0) {
                if (!badge) {
                    badge = document.createElement('span');
                    badge.className = 'cart-count';
                    cartIcon.appendChild(badge);
                }
                badge.textContent = itemCount;
            } else if (badge) {
                badge.remove();
            }
        });
    });

    // Language selector(s) — desktop and mobile share the same handler
    const applyLang = async (select) => {
        const i18n = await import('i18n');
        localStorage.setItem('kissan_lang', select.value);
        await i18n.setLocale(select.value);
        i18n.applyTranslations();
        window.dispatchEvent(new Event('language-changed'));
    };
    const selects = [...document.querySelectorAll('.lang-select')];
    selects.forEach(select => {
        select.addEventListener('change', () => applyLang(select));
    });
    // Sync mobile selector when desktop changes and vice-versa
    selects.forEach(select => {
        select.addEventListener('change', () => {
            selects.forEach(other => { if (other !== select) other.value = select.value; });
        });
    });
    (async () => {
        const i18n = await import('i18n');
        await i18n.setLocale(localStorage.getItem('kissan_lang') || 'en');
        i18n.applyTranslations();
    })();
};
