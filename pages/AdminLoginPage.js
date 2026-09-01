export const render = () => `
  <main>
    <div class="auth-page">
      <div class="auth-card" style="max-width:480px;">
        <div class="auth-brand">
          <span class="auth-logo">AK<span>art</span></span>
          <h1 class="auth-title">Admin Login</h1>
          <p class="auth-subtitle">Log in to manage AKart operations.</p>
        </div>
        <form id="admin-login-form">
          <div class="form-group">
            <label>Admin Email</label>
            <input id="admin-username" type="email" placeholder="Enter your admin email" autocomplete="username" required>
          </div>
          <div class="form-group">
            <label>Admin Password</label>
            <input id="admin-password" type="password" placeholder="Enter your admin password" autocomplete="current-password" required>
          </div>
          <button type="submit" class="btn btn-primary auth-submit">Login</button>
          <p id="admin-login-msg" class="auth-error" style="display:none;"></p>
        </form>
        <section class="demo-login-box" data-demo-only hidden>
          <strong>Demo Account</strong>
          <button type="button" id="demo-admin-login" class="btn btn-secondary">Login as Demo Admin</button>
        </section>
        <p class="auth-switch"><a href="#/login">Back to role selection</a></p>
      </div>
    </div>
  </main>
`;
export const addEventListeners = () => {
  const form = document.getElementById('admin-login-form');
  const msg = document.getElementById('admin-login-msg');
  const submit = async (email, password) => {
    try {
      const auth = await import('auth');
      await auth.login(email, password, 'admin');
      window.location.hash = '/admin-dashboard';
    } catch (error) {
      msg.textContent = error.message || 'Invalid admin credentials.';
      msg.style.display = 'block';
    }
  };
  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const u = document.getElementById('admin-username').value.trim();
    const p = document.getElementById('admin-password').value;
    await submit(u, p);
  });
  const demoMode = window.ENV?.AKART_DEMO_MODE === 'true' || ['localhost', '127.0.0.1'].includes(location.hostname);
  const demoBox = document.querySelector('[data-demo-only]');
  if (demoMode && demoBox) demoBox.hidden = false;
  document.getElementById('demo-admin-login')?.addEventListener('click', async event => {
    event.currentTarget.disabled = true;
    document.getElementById('admin-username').value = 'admin.demo@akart.local';
    document.getElementById('admin-password').value = 'Admin@123';
    await submit('admin.demo@akart.local', 'Admin@123');
    event.currentTarget.disabled = false;
  });
};
