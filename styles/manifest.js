export const cssModules = [
  './styles/base.css',
  './styles/header.css',
  './styles/forms.css',
  './styles/auth.css',
  './styles/hero.css',
  './styles/sections.css',
  './styles/products.css',
  './styles/modal.css',
  './styles/cart.css',
  './styles/services.css',
  './styles/dashboard.css',
  './styles/admin.css',
  './styles/contact.css',
  './styles/backgrounds.css',
  './styles/footer.css',
  './styles/responsive.css',
  './styles/home.css',
  './styles/white-audit.css'
];

export const preloadFirstN = 5;

export const injectIntoHead = true;

export async function initStyles() {
  const parent = injectIntoHead ? document.head : document.body;

  // Preload first N
  cssModules.slice(0, preloadFirstN).forEach(href => {
    const preload = document.createElement('link');
    preload.rel = 'preload';
    preload.as = 'style';
    preload.href = href;
    parent.appendChild(preload);
  });

  // Then load all as stylesheet
  for (const href of cssModules) {
    await appendStylesheet(href, parent);
  }
}

function appendStylesheet(href, parent) {
  return new Promise((resolve) => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    link.onload = () => resolve();
    // No-op on error to avoid blocking app
    link.onerror = () => resolve();
    parent.appendChild(link);
  });
}
