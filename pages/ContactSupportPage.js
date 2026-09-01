export const render = () => `
  <main>
    <div class="page-header"><h1 data-i18n="support.title">We’re Here to Help – AKart Support</h1></div>
    <section class="contact-container" style="align-items: stretch;">
      <div class="contact-info">
        <h2 data-i18n="support.quickInfo">Quick Info</h2>
        <ul>
          <li><i class="fa-solid fa-envelope" aria-hidden="true"></i> <strong data-i18n="contact.email">Email</strong>: service@akart.com</li>
          <li><i class="fa-solid fa-headset" aria-hidden="true"></i> <strong data-i18n="contact.hours">Helpline Hours</strong>: 9:00 AM – 7:00 PM (Mon–Sat)</li>
          <li><i class="fa-solid fa-phone" aria-hidden="true"></i> <strong>Farmer Helpline</strong>: <a href="tel:9440617324">9440617324</a></li>
          <li><i class="fa-solid fa-phone" aria-hidden="true"></i> <strong>Customer Helpline</strong>: <a href="tel:9440617324">9440617324</a></li>
          <li><i class="fa-solid fa-language" aria-hidden="true"></i> <strong data-i18n="support.languages">Languages</strong>: English, हिंदी, తెలుగు, தமிழ்</li>
        </ul>
        <div style="margin-top:1rem; display:flex; gap:0.5rem; flex-wrap:wrap;">
          <a href="https://facebook.com" target="_blank" rel="noopener" class="btn btn-secondary" aria-label="Facebook">
            <i class="fa-brands fa-facebook"></i> <span data-i18n="social.facebook">Facebook</span>
          </a>
          <a href="https://wa.me/919440617324" target="_blank" rel="noopener" class="btn btn-secondary" aria-label="WhatsApp">
            <i class="fa-brands fa-whatsapp"></i> <span data-i18n="social.whatsapp">WhatsApp</span>
          </a>
          <a href="https://instagram.com" target="_blank" rel="noopener" class="btn btn-secondary" aria-label="Instagram">
            <i class="fa-brands fa-instagram"></i> <span data-i18n="social.instagram">Instagram</span>
          </a>
        </div>
        <div style="margin-top:2rem;">
          <h2 data-i18n="support.faq">FAQ</h2>
          <details style="margin:0.5rem 0;"><summary data-i18n="faq.q1">How to register as a farmer?</summary><p data-i18n="faq.a1">Go to Login → Create Account → select Farmer, fill in details, and submit.</p></details>
          <details style="margin:0.5rem 0;"><summary data-i18n="faq.q2">How to rent a tractor?</summary><p data-i18n="faq.a2">Login as Farmer → Agri Services → Rent Tractors → Contact Owner.</p></details>
          <details style="margin:0.5rem 0;"><summary data-i18n="faq.q3">How to contact a seller?</summary><p data-i18n="faq.a3">Open Products → Contact Seller button on the product card to view seller details.</p></details>
          <details style="margin:0.5rem 0;"><summary data-i18n="faq.q4">How does the cart work?</summary><p data-i18n="faq.a4">Add items from Products. View and manage them in your Customer Dashboard cart.</p></details>
        </div>
      </div>
      <div class="form-container contact-form">
        <h2 data-i18n="support.formTitle">Support Request Form</h2>
        <form id="support-form" novalidate>
          <div class="form-group">
            <label for="s-name" data-i18n="contact.name">Name</label>
            <input type="text" id="s-name" required>
          </div>
          <div class="form-group">
            <label for="s-email" data-i18n="contact.email">Email</label>
            <input type="email" id="s-email" required>
          </div>
          <div class="form-group">
            <label for="s-type" data-i18n="contact.category">User Type</label>
            <select id="s-type" required>
              <option value="">Select...</option>
              <option value="farmer" data-i18n="contact.category.farmer">Farmer</option>
              <option value="customer" data-i18n="contact.category.customer">Customer</option>
            </select>
          </div>
          <div class="form-group">
            <label for="s-subject" data-i18n="support.subject">Subject</label>
            <input type="text" id="s-subject" required>
          </div>
          <div class="form-group">
            <label for="s-message" data-i18n="contact.message">Message</label>
            <textarea id="s-message" required></textarea>
          </div>
          <button type="submit" class="btn btn-primary" data-i18n="support.submit">Submit</button>
          <p id="support-success" style="display:none; margin-top:1rem; color: var(--secondary-color); font-weight:600;" data-i18n="support.thanks">
            Thank you for contacting us. Our support team will reach out to you shortly!
          </p>
        </form>
      </div>
    </section>
  </main>
`;

export const addEventListeners = () => {
  const form = document.getElementById('support-form');
  if (!form) return;
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('s-name').value.trim();
    const email = document.getElementById('s-email').value.trim();
    const type = document.getElementById('s-type').value;
    const subject = document.getElementById('s-subject').value.trim();
    const message = document.getElementById('s-message').value.trim();
    if (!name || !email || !type || !subject || !message) {
      alert('Please fill in all fields.');
      return;
    }
    const store = await import('store');
    store.addContactSubmission({ name, email, category: type, subject, message });
    const success = document.getElementById('support-success');
    success.style.display = 'block';
    form.reset();
  });
};
