// AKart uses a pure-white global canvas on every route. Imagery belongs inside
// bounded page sections, never behind the whole application.

const DASHBOARD_PATHS = new Set([
  '/customer-dashboard',
  '/orders',
  '/purchase-history'
]);

const CLEAN_AGRI_PATHS = new Set([
  '/waste-to-company-info',
  '/farmer-dashboard/waste-to-company',
  '/fertilizer-store',
  '/farmer-dashboard/fertilizer-zone',
  '/agri-services',
  '/tractor-rentals',
  '/tractor-booking',
  '/drone-services',
  '/drone-rentals',
  '/drones'
]);

// Kept as a compatibility export for any page that previously imported the
// rotator. Full-page background rotation is intentionally disabled.
export function BackgroundRotator() {
  return { destroy() {} };
}

export function setBackgroundFor(path = '/') {
  document.documentElement.style.backgroundColor = '#ffffff';
  document.body.style.backgroundColor = '#ffffff';
  document.body.style.backgroundImage = 'none';
  document.body.classList.remove('homepage-mode', 'clean-dashboard-mode', 'clean-agri-mode');

  if (path === '/') document.body.classList.add('homepage-mode');
  if (DASHBOARD_PATHS.has(path)) document.body.classList.add('clean-dashboard-mode');
  if (CLEAN_AGRI_PATHS.has(path)) document.body.classList.add('clean-agri-mode');

  document.querySelectorAll('.global-bg').forEach(background => background.remove());
}
