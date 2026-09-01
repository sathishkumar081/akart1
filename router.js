import { getCurrentUser, verifyCurrentSession } from 'auth';
import { navigate, pushHistory, initBackButtons } from 'utils';

// Import page components
import { render as renderHeader, addHeaderListeners } from 'pages/Header';
import { render as renderFooter } from 'pages/Footer';
import * as HomePage from 'pages/HomePage';
import * as LoginPage from 'pages/LoginPage';
import * as RegisterPage from 'pages/RegisterPage';
import * as ProductsPage from 'pages/ProductsPage';
import * as ContactPage from 'pages/ContactPage';
import * as FarmerDashboardPage from 'pages/FarmerDashboardPage';
import * as CustomerDashboardPage from 'pages/CustomerDashboardPage';
import * as PostAdPage from 'pages/PostAdPage';
import * as AgriServicesPage from 'pages/AgriServicesPage';
import * as NotFoundPage from 'pages/NotFoundPage';
import * as ContactSupportPage from 'pages/ContactSupportPage';
import * as FertilizerStorePage from 'pages/FertilizerStorePage';
import * as CartPage from './pages/CartPage.js';
import { setBackgroundFor } from './backgrounds.js';
import * as ManageListingsPage from 'pages/ManageListingsPage';
import * as ViewOrdersPage from 'pages/ViewOrdersPage';
import * as EarningsSummaryPage from 'pages/EarningsSummaryPage';
import * as WasteToCompanyPage from 'pages/WasteToCompanyPage';
import * as WasteToCompanyInfoPage from 'pages/WasteToCompanyInfoPage';
import * as AboutPage from 'pages/AboutPage';
import * as MissionPage from 'pages/MissionPage';
import * as BlogPage from 'pages/BlogPage';
import * as SustainabilityPage from 'pages/SustainabilityPage';
import * as CareersPage from 'pages/CareersPage';
import * as ThankYouPage from './pages/ThankYouPage.js';
import * as AdminLoginPage from './pages/AdminLoginPage.js';
import * as AdminDashboardPage from './pages/AdminDashboardPage.js';
import * as AdminEkartLogisticsPage from './pages/AdminEkartLogisticsPage.js';
import * as EkartLogisticsInfoPage from './pages/EkartLogisticsInfoPage.js';
import * as ComingSoonPage from 'pages/ComingSoonPage';
import * as OrderHistoryPage from './pages/OrderHistoryPage.js';

const app = document.getElementById('app');
let activeNav = null; // For mobile nav

const dashboardPathFor = (user) => user?.role === 'farmer'
    ? '/farmer-dashboard'
    : user?.role === 'admin'
        ? '/admin-dashboard'
        : '/customer-dashboard';

const pageTitleFor = (path) => {
    const titles = {
        '/': 'AKart',
        '/login': 'AKart | Customer Login', '/login/farmer': 'AKart | Farmer Login', '/login/customer': 'AKart | Customer Login', '/register': 'AKart | Register',
        '/products': 'AKart | Products', '/cart': 'AKart | Cart', '/orders': 'AKart | Orders', '/purchase-history': 'AKart | Orders',
        '/customer-dashboard': 'AKart | Customer Dashboard', '/farmer-dashboard': 'AKart | Farmer Dashboard',
        '/post-ad': 'AKart | Post an Ad', '/farmer-dashboard/manage-listings': 'AKart | Manage Listings',
        '/farmer-dashboard/view-orders': 'AKart | Farmer Orders', '/farmer-dashboard/tractor-rentals': 'AKart | Tractor Rentals',
        '/farmer-dashboard/drone-rentals': 'AKart | Drone Rentals',
        '/farmer-dashboard/fertilizer-zone': 'AKart | Fertilizer Store', '/farmer-dashboard/earnings-summary': 'AKart | Earnings',
        '/admin-login': 'AKart | Admin Login', '/admin-dashboard': 'AKart | Admin Dashboard',
        '/tractor-rentals': 'AKart | Tractor Rentals', '/tractor-booking': 'AKart | Tractor Rentals',
        '/drone-services': 'AKart | Drone Rentals', '/drone-rentals': 'AKart | Drone Rentals', '/drones': 'AKart | Drone Rentals',
        '/fertilizer-store': 'AKart | Fertilizer Store', '/waste-to-company-info': 'AKart | Waste to Company',
        '/farmer-dashboard/waste-to-company': 'AKart | Waste to Company', '/about': 'AKart | About Us',
        '/contact': 'AKart | Contact Support', '/contact-support': 'AKart | Contact Support', '/blog': 'AKart | Blog',
        '/agri-services': 'AKart | Services', '/mission': 'AKart | Mission', '/sustainability': 'AKart | Sustainability',
        '/careers': 'AKart | Careers', '/thank-you': 'AKart | Order Confirmation',
        '/ekart-logistics': 'AKart | Logistics', '/admin/ekart-logistics': 'AKart | Logistics'
    };
    return titles[path] || 'AKart';
};

const setPageMetadata = (path) => {
    const title = pageTitleFor(path);
    document.title = title;
    document.querySelectorAll('meta[property="og:title"], meta[name="twitter:title"]').forEach(meta => meta.setAttribute('content', title));
};

// --- ROUTER LOGIC ---

const routes = {
    '/': { render: HomePage.render, addEventListeners: HomePage.addEventListeners, auth: 'any' },
    '/login': { render: LoginPage.renderInitial, addEventListeners: LoginPage.addEventListeners, auth: false },
    '/login/farmer': { render: () => LoginPage.renderLogin('farmer'), addEventListeners: LoginPage.addEventListeners, auth: false },
    '/login/customer': { render: () => LoginPage.renderLogin('customer'), addEventListeners: LoginPage.addEventListeners, auth: false },
    '/register': { render: RegisterPage.render, addEventListeners: RegisterPage.addEventListeners, auth: false },
    '/products': { render: ProductsPage.render, addEventListeners: ProductsPage.addEventListeners, auth: 'any' },
    '/contact': { render: ContactPage.render, addEventListeners: ContactPage.addEventListeners, auth: 'any' },
    '/contact-support': { render: ContactSupportPage.render, addEventListeners: ContactSupportPage.addEventListeners, auth: 'any' },
    '/agri-services': { render: AgriServicesPage.render, addEventListeners: AgriServicesPage.addEventListeners, auth: 'any' },
    '/fertilizer-store': { render: FertilizerStorePage.render, addEventListeners: FertilizerStorePage.addEventListeners, auth: 'any' },
    '/cart': { render: CartPage.render, addEventListeners: CartPage.addEventListeners, auth: 'customer' },
    '/tractor-rentals': { render: AgriServicesPage.render, addEventListeners: AgriServicesPage.addEventListeners, auth: 'any' },
    '/drone-services': { render: AgriServicesPage.render, addEventListeners: AgriServicesPage.addEventListeners, auth: 'any' },
    '/drone-rentals': { render: AgriServicesPage.render, addEventListeners: AgriServicesPage.addEventListeners, auth: 'any' },
    '/tractor-booking': { render: AgriServicesPage.render, addEventListeners: AgriServicesPage.addEventListeners, auth: 'any' },
    '/drones': { render: AgriServicesPage.render, addEventListeners: AgriServicesPage.addEventListeners, auth: 'any' },
    '/orders': { render: OrderHistoryPage.render, addEventListeners: OrderHistoryPage.addEventListeners, auth: 'customer' },
    '/purchase-history': { render: OrderHistoryPage.render, addEventListeners: OrderHistoryPage.addEventListeners, auth: 'customer' },
    '/farmer-dashboard': { render: FarmerDashboardPage.render, addEventListeners: FarmerDashboardPage.addEventListeners, auth: 'farmer' },
    '/customer-dashboard': { render: CustomerDashboardPage.render, addEventListeners: CustomerDashboardPage.addEventListeners, auth: 'customer' },
    '/post-ad': { render: () => PostAdPage.render(), addEventListeners: PostAdPage.addEventListeners, auth: 'farmer' },
    '/edit-ad/:id': { render: (params) => PostAdPage.render(params.id), addEventListeners: PostAdPage.addEventListeners, auth: 'farmer' },
    '/farmer-dashboard/manage-listings': { render: ManageListingsPage.render, addEventListeners: ManageListingsPage.addEventListeners, auth: 'farmer' },
    '/farmer-dashboard/view-orders': { render: ViewOrdersPage.render, addEventListeners: ViewOrdersPage.addEventListeners, auth: 'farmer' },
    '/farmer-dashboard/tractor-rentals': { render: AgriServicesPage.render, addEventListeners: AgriServicesPage.addEventListeners, auth: 'farmer' },
    '/farmer-dashboard/drone-rentals': { render: AgriServicesPage.render, addEventListeners: AgriServicesPage.addEventListeners, auth: 'farmer' },
    '/farmer-dashboard/fertilizer-zone': { render: FertilizerStorePage.render, addEventListeners: FertilizerStorePage.addEventListeners, auth: 'farmer' },
    '/farmer-dashboard/earnings-summary': { render: EarningsSummaryPage.render, addEventListeners: EarningsSummaryPage.addEventListeners, auth: 'farmer' },
    '/farmer-dashboard/waste-to-company': { render: WasteToCompanyPage.render, addEventListeners: WasteToCompanyPage.addEventListeners, auth: 'farmer' },
    '/waste-to-company-info': { render: WasteToCompanyInfoPage.render, addEventListeners: WasteToCompanyInfoPage.addEventListeners, auth: 'any' },
    '/about': { render: AboutPage.render, addEventListeners: AboutPage.addEventListeners, auth: 'any' },
    '/mission': { render: MissionPage.render, addEventListeners: MissionPage.addEventListeners, auth: 'any' },
    '/blog': { render: BlogPage.render, addEventListeners: BlogPage.addEventListeners, auth: 'any' },
    '/sustainability': { render: SustainabilityPage.render, addEventListeners: SustainabilityPage.addEventListeners, auth: 'any' },
    '/careers': { render: CareersPage.render, addEventListeners: CareersPage.addEventListeners, auth: 'any' },
    '/thank-you': { render: ThankYouPage.render, addEventListeners: ThankYouPage.addEventListeners, auth: 'customer' },
    '/admin-login': { render: AdminLoginPage.render, addEventListeners: AdminLoginPage.addEventListeners, auth: false },
    '/admin-dashboard': { render: AdminDashboardPage.render, addEventListeners: AdminDashboardPage.addEventListeners, auth: 'admin' },
    '/admin/ekart-logistics': { render: AdminEkartLogisticsPage.render, addEventListeners: AdminEkartLogisticsPage.addEventListeners, auth: 'admin' },
    '/ekart-logistics': { render: EkartLogisticsInfoPage.render, addEventListeners: EkartLogisticsInfoPage.addEventListeners, auth: 'any' }
};

export const handleRouteChange = async () => {
    // Scroll to top on every page change
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    
    const user = getCurrentUser();
    let path = window.location.hash.replace('#', '') || '/';
    if(path.endsWith('/')) path = path.slice(0, -1);
    if(path === '') path = '/';
    setPageMetadata(path);

    const hasRoute = Object.keys(routes).some(routePath => {
        const regex = new RegExp(`^${routePath.replace(/:\w+/g, '([^/]+)')}$`);
        return regex.test(path);
    });

    // Force unauthenticated visitors to login first (except register or login routes)
    // Allow the new Landing/Home page to be publicly accessible
    const publicPaths = ['/', '/login', '/login/farmer', '/login/customer', '/register', '/products', '/agri-services', '/tractor-rentals', '/tractor-booking', '/drone-services', '/drone-rentals', '/drones', '/fertilizer-store', '/waste-to-company-info', '/contact-support', '/contact', '/about', '/mission', '/blog', '/sustainability', '/careers', '/admin-login', '/ekart-logistics'];
    if (!user && !publicPaths.includes(path) && hasRoute) {
        const navigate = (path) => { window.location.hash = path; };
        navigate('/login');
        return;
    }
    
    // Handle dynamic routes like /edit-ad/:id
    let params = {};
    const routeKey = Object.keys(routes).find(r => {
        const regex = new RegExp(`^${r.replace(/:\w+/g, '([^/]+)')}$`);
        if (!regex.test(path)) return false;

        if (r.includes(':')) {
            const pathParts = path.split('/');
            const routeParts = r.split('/');
            routeParts.forEach((part, i) => {
                if (part.startsWith(':')) {
                    params[part.substring(1)] = pathParts[i];
                }
            });
        }
        return true;
    });

    const route = routes[routeKey];
    
    if (!route) {
        app.innerHTML = renderHeader(user) + NotFoundPage.render() + renderFooter();
        addHeaderListeners();
        setBackgroundFor(path || '/');
        return;
    }

    // Authentication checks
    if (route.auth === false && user) {
        const navigate = (path) => { window.location.hash = path; };
        navigate(dashboardPathFor(user));
        return;
    }
    if (['customer', 'farmer', 'admin'].includes(route.auth) && (!user || user.role !== route.auth)) {
        const navigate = (path) => { window.location.hash = path; };
        navigate(route.auth === 'admin' ? '/admin-login' : '/login');
        return;
    }

    if (['customer', 'farmer', 'admin'].includes(route.auth)) {
        const verified = await verifyCurrentSession(route.auth);
        if (!verified) {
            window.location.hash = route.auth === 'admin' ? '/admin-login' : '/login';
            return;
        }
    }

    // Render page
    const content = await route.render(params, user);
    app.innerHTML = renderHeader(user) + content + renderFooter();
    const i18n = await import('i18n');
    i18n.applyTranslations(app);
    
    // Add event listeners
    addHeaderListeners();
    if (route.addEventListeners) {
        route.addEventListeners();
    }
    i18n.applyTranslations(app);
    // Wire up any Back buttons present on the page
    initBackButtons();
    // Record this successful navigation so "Back" returns to it
    pushHistory(path);
    updateActiveLink();
    
    // Set background for this path
    setBackgroundFor(path);
    
    // Ensure scroll to top after rendering
    setTimeout(() => window.scrollTo({ top: 0, left: 0, behavior: 'auto' }), 0);
};

const updateActiveLink = () => {
    const path = window.location.hash || '#/';
    document.querySelectorAll('.nav-link').forEach(link => {
        if (link.getAttribute('href') === path) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
};

export const initRouter = () => {
  window.addEventListener('hashchange', handleRouteChange);
  window.addEventListener('language-changed', handleRouteChange);
  window.addEventListener('products-updated', handleRouteChange);
  window.addEventListener('auth-state-changed', handleRouteChange);
  handleRouteChange(); // Initial load
};
