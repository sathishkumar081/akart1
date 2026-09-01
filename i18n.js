export let currentLocale = 'en';
let dict = {};
const cache = {};
const supported = new Set(['en', 'te', 'hi', 'ta']);

async function load(locale) {
  if (!cache[locale]) {
    try {
      const res = await fetch(`./locales/${locale}.json`);
      cache[locale] = res.ok ? await res.json() : {};
    } catch {
      cache[locale] = {};
    }
  }
  return cache[locale];
}

export async function setLocale(locale) {
  currentLocale = supported.has(locale) ? locale : 'en';
  dict = await load(currentLocale);
  if (currentLocale !== 'en') await load('en');
  // Set html lang/dir for accessibility
  document.documentElement.lang = currentLocale;
  document.documentElement.dir = 'ltr';
}

export function t(key, fallback = '') {
  return dict[key] ?? cache.en?.[key] ?? (fallback || key);
}

export function applyTranslations(root = document) {
  root.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    const text = t(key);
    if (text) el.textContent = text;
  });
}
