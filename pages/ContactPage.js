export const render = () => `
    <main>
        <div class="page-header"><h1 data-i18n="contact.title">Contact Support</h1></div>
        <div class="contact-container">
            <div class="contact-info">
                <h2 data-i18n="contact.getInTouch">Get in Touch</h2>
                <p>We're here to help! Reach out to us through any of the following channels.</p>
                <ul>
                    <li><strong data-i18n="contact.email">Email</strong>: service@akart.com</li>
                    <li><strong data-i18n="contact.hours">Hours</strong>: 9:00 AM – 7:00 PM IST</li>
                </ul>
                <a href="https://wa.me/919440617324" target="_blank" class="btn whatsapp-btn" aria-label="WhatsApp">
                    <img src="asset%20whatsapp-icon.png" alt="WhatsApp">
                    <span data-i18n="contact.whatsapp">Chat on WhatsApp</span>
                </a>
            </div>
            <div class="form-container contact-form">
                <h2 data-i18n="contact.formTitle">Send us a Message</h2>
                <form id="contact-form">
                    <div class="form-group">
                        <label for="name" data-i18n="contact.name">Name</label>
                        <input type="text" id="name" required>
                    </div>
                    <div class="form-group">
                        <label for="email" data-i18n="contact.email">Email</label>
                        <input type="email" id="email" required>
                    </div>
                    <div class="form-group">
                        <label for="category" data-i18n="contact.category">Category</label>
                        <select id="category" required>
                            <option value="farmer" data-i18n="contact.category.farmer">Farmer</option>
                            <option value="customer" data-i18n="contact.category.customer">Customer</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="message" data-i18n="contact.message">Your Message</label>
                        <textarea id="message" required></textarea>
                    </div>
                    <button type="submit" class="btn btn-primary" data-i18n="contact.submit">Submit</button>
                </form>
            </div>
        </div>
    </main>
`;

export const addEventListeners = () => {
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const store = await import('store');
            const submission = {
                name: document.getElementById('name').value,
                email: document.getElementById('email').value,
                category: document.getElementById('category').value,
                message: document.getElementById('message').value
            };
            store.addContactSubmission(submission);
            alert('Thank you for your message! We will get back to you soon.');
            contactForm.reset();
        });
    }
};
