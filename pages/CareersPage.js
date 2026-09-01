export const render = () => `
<main>
  <div class="page-header"><h1>Careers at AKart</h1></div>
  <section class="ad-card" style="padding:1.25rem;">
    <h2>Why work with us?</h2>
    <ul style="margin-left:1rem;">
      <li> Be part of a fast-growing agri-tech platform.</li>
      <li> Make a real impact in the lives of farmers.</li>
      <li> Collaborative and innovative work culture.</li>
    </ul>
  </section>
  <section class="ad-card" style="margin-top:1rem;padding:1.25rem;">
    <h2>Current Opportunities</h2>
    <ul style="margin-left:1rem;">
      <li>Web Developers (Frontend/Backend)</li>
      <li>Marketing & Community Managers</li>
      <li>Sustainability Analysts</li>
      <li>Internships in Agri-Tech Research</li>
    </ul>
  </section>
  <section class="ad-card" style="margin-top:1rem;padding:1.25rem;">
    <h2>Apply Now</h2>
    <form id="career-form" class="form">
      <div class="form-group">
        <label for="c-name">Full Name</label>
        <input type="text" id="c-name" required>
      </div>
      <div class="form-group">
        <label for="c-email">Email</label>
        <input type="email" id="c-email" required>
      </div>
      <div class="form-group">
        <label for="c-role">Role Interested In</label>
        <select id="c-role" required>
          <option value="">Select</option>
          <option>Web Developer</option>
          <option>Marketing & Community</option>
          <option>Sustainability Analyst</option>
          <option>Internship</option>
        </select>
      </div>
      <div class="form-group">
        <label for="c-resume">Resume (PDF)</label>
        <input type="file" id="c-resume" accept=".pdf" required>
      </div>
      <button type="submit" class="btn btn-primary">Submit Application</button>
    </form>
  </section>
</main>
`;
export const addEventListeners = () => {
  const form = document.getElementById('career-form');
  if (!form) return;
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('c-name').value.trim();
    const email = document.getElementById('c-email').value.trim();
    const role = document.getElementById('c-role').value;
    const file = document.getElementById('c-resume').files[0];
    if (!file) return alert('Please attach your resume.');
    try {
      // simulate upload; in real app integrate backend
      alert('Application submitted successfully. Thank you, ' + name + '!');
      form.reset();
    } catch (err) {
      alert('Failed to submit. Please try again.');
    }
  });
};
