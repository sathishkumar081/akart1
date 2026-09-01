import { t } from 'i18n';

export const render = () => `
  <footer class="main-footer">
    <div class="container footer-grid">
      <section class="footer-col footer-brand">
        <a href="#/" class="logo" aria-label="AKart Home">
          <span class="logo-icon"><i class="fa-solid fa-leaf" aria-hidden="true"></i></span>
          <span class="logo-text">AK<span>art</span></span>
        </a>
        <p class="footer-tagline">${t('footer.tagline', 'Empowering farmers.<br>Serving customers.<br>Building a stronger farming community.')}</p>
        <div class="footer-social">
          <a href="https://facebook.com" target="_blank" rel="noopener" aria-label="Facebook"><i class="fa-brands fa-facebook-f" aria-hidden="true"></i></a>
          <a href="https://twitter.com" target="_blank" rel="noopener" aria-label="Twitter"><i class="fa-brands fa-x-twitter" aria-hidden="true"></i></a>
          <a href="https://instagram.com" target="_blank" rel="noopener" aria-label="Instagram"><i class="fa-brands fa-instagram" aria-hidden="true"></i></a>
          <a href="https://www.youtube.com" target="_blank" rel="noopener" aria-label="YouTube"><i class="fa-brands fa-youtube" aria-hidden="true"></i></a>
        </div>
      </section>

      <section class="footer-col">
        <h4 class="footer-h">${t('footer.farmers', 'For Farmers')}</h4>
        <ul class="footer-links">
          <li><a href="#/products">${t('footer.sell', 'Sell Your Produce')}</a></li>
          <li><a href="#/post-ad">${t('services.post.title', 'Post an Ad')}</a></li>
          <li><a href="#/tractor-rentals">${t('services.tractor.title', 'Tractor Rentals')}</a></li>
          <li><a href="#/drone-services">${t('services.drone.title', 'Drone Rentals')}</a></li>
          <li><a href="#/fertilizer-store">${t('services.fert.title', 'Fertilizer Store')}</a></li>
          <li><a href="#/waste-to-company-info">${t('nav.waste', 'Waste to Company')}</a></li>
        </ul>
      </section>

      <section class="footer-col">
        <h4 class="footer-h">${t('footer.customers', 'For Customers')}</h4>
        <ul class="footer-links">
          <li><a href="#/products">${t('footer.browse', 'Browse Products')}</a></li>
          <li><a href="#/orders">${t('footer.track', 'Track Orders')}</a></li>
          <li><a href="#/about">${t('how.title', 'How It Works')}</a></li>
          <li><a href="#/contact-support">${t('footer.payment', 'Payment & Refunds')}</a></li>
          <li><a href="#/contact-support">${t('footer.faq', 'FAQs')}</a></li>
        </ul>
      </section>

      <section class="footer-col">
        <h4 class="footer-h">${t('footer.explore', 'Explore')}</h4>
        <ul class="footer-links">
          <li><a href="#/about">${t('nav.about', 'About Us')}</a></li>
          <li><a href="#/mission">${t('footer.mission', 'Our Mission')}</a></li>
          <li><a href="#/blog">${t('nav.blog', 'Blog')}</a></li>
          <li><a href="#/careers">${t('footer.careers', 'Careers')}</a></li>
          <li><a href="#/contact-support">${t('nav.contact', 'Contact Us')}</a></li>
        </ul>
        <div class="footer-contact">
          <p><i class="fa-solid fa-envelope" aria-hidden="true"></i> <a href="mailto:service@akart.com">service@akart.com</a></p>
          <p><i class="fa-solid fa-phone" aria-hidden="true"></i> Customer Helpline: <a href="tel:9440617324">9440617324</a></p>
          <p><i class="fa-solid fa-phone" aria-hidden="true"></i> Farmer Helpline: <a href="tel:9440617324">9440617324</a></p>
        </div>
      </section>
    </div>
    <div class="footer-bottom">
      <div class="container footer-bottom-inner">
        <p>© 2026 AKart. All rights reserved.</p>
        <div class="footer-legal">
          <a href="#/">Privacy Policy</a>
          <a href="#/">Terms &amp; Conditions</a>
          <a href="#/">Refund Policy</a>
        </div>
      </div>
    </div>
  </footer>
`;
