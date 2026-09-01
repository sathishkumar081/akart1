import { navigate } from 'utils';

// Renders the shared login form. `presetRole` is used when arriving from the
// "Login as Farmer/Customer" links so the correct role is pre-selected.
const renderLoginForm = (presetRole = 'customer') => `
    <div class="auth-page">
      <div class="auth-card">
        <div class="auth-brand">
          <span class="auth-logo">AK<span>art</span></span>
          <h1 class="auth-title" data-i18n="login.title">Welcome back</h1>
          <p class="auth-subtitle" data-i18n="login.subtitle">Log in to continue to your account.</p>
        </div>

        <div class="role-login-grid" role="tablist" aria-label="Choose account type">
          <button type="button" class="role-login-card ${presetRole === 'customer' ? 'active' : ''}" data-role="customer"><i class="fa-solid fa-basket-shopping"></i><span>Customer Login</span></button>
          <button type="button" class="role-login-card ${presetRole === 'farmer' ? 'active' : ''}" data-role="farmer"><i class="fa-solid fa-wheat-awn"></i><span>Farmer Login</span></button>
          <a class="role-login-card" href="#/admin-login"><i class="fa-solid fa-shield-halved"></i><span>Admin Login</span></a>
        </div>

        <form id="login-form" data-role="${presetRole}" novalidate>
          <div class="form-group">
            <label for="email" data-i18n="login.email">Email or Phone</label>
            <input type="text" id="email" name="email" placeholder="Enter your email or phone number" autocomplete="username" required>
          </div>
          <div class="form-group">
            <label for="password" data-i18n="login.password">Password</label>
            <input type="password" id="password" name="password" placeholder="Enter your password" autocomplete="current-password" required>
            <a href="#" id="forgot-password" class="forgot-link" data-i18n="login.forgot">Forgot Password?</a>
          </div>
          <button type="submit" class="btn btn-primary auth-submit" data-i18n="login.submit">Login</button>
          <p id="login-error" class="auth-error" style="display:none;"></p>
          <p id="forgot-msg" class="auth-info" style="display:none;"></p>
        </form>

          <div class="social-divider"><span data-i18n="login.or">or continue with</span></div>
          <div class="social-buttons">
            <button type="button" class="social-btn google-btn" data-provider="google">
              <span class="social-icon" aria-hidden="true"><i class="fa-brands fa-google"></i></span>
              <span class="google-btn-text">Continue with Google</span>
            </button>
          </div>
        <p id="social-msg" class="auth-error" style="display:none;"></p>

        <section class="demo-login-box" data-demo-only hidden>
          <strong>Demo Accounts</strong>
          <div class="demo-login-actions">
            <button type="button" class="btn btn-secondary demo-login" data-demo-role="customer">Login as Demo Customer</button>
            <button type="button" class="btn btn-secondary demo-login" data-demo-role="farmer">Login as Demo Farmer</button>
            <a class="btn btn-secondary" href="#/admin-login">Login as Demo Admin</a>
          </div>
        </section>

        <p class="auth-switch"><span data-i18n="login.noAccount">Don't have an account?</span> <a href="#/register"><span data-i18n="login.noAccountLink">Create Account</span></a></p>
      </div>
    </div>
`;

export const renderInitial = () => `<main>${renderLoginForm('customer')}</main>`;

export const renderLogin = (role) => `<main>${renderLoginForm(role)}</main>`;

const showAuthRole = (role) => {
    document.querySelectorAll('.role-login-card[data-role]').forEach(tab => {
        tab.classList.toggle('active', tab.dataset.role === role);
    });
    const form = document.getElementById('login-form');
    if (form) form.dataset.role = role;
};

export const addEventListeners = () => {
    // Role toggle (Farmer / Customer) — both routes share this form.
    document.querySelectorAll('.role-login-card[data-role]').forEach(tab => {
        tab.addEventListener('click', () => showAuthRole(tab.dataset.role));
    });

    // Forgot password — no fake reset; point users to support for now.
    const forgot = document.getElementById('forgot-password');
    if (forgot) {
        forgot.addEventListener('click', (e) => {
            e.preventDefault();
            const msg = document.getElementById('forgot-msg');
            msg.textContent = 'Password reset link will be sent to your registered email. For immediate help, contact our support team.';
            msg.style.display = 'block';
        });
    }

    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const auth = await import('auth');
            const role = e.target.dataset.role;
            const identifier = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            try {
                const user = await auth.login(identifier, password, role);
                navigate(user.role === 'farmer' ? '/farmer-dashboard' : user.role === 'admin' ? '/admin-dashboard' : '/customer-dashboard');
            } catch (error) {
                const errorEl = document.getElementById('login-error');
                errorEl.textContent = error.message || 'Invalid credentials. Please check your details and try again.';
                errorEl.style.display = 'block';
            }
        });
    }

    const demoMode = window.ENV?.AKART_DEMO_MODE === 'true' || ['localhost', '127.0.0.1'].includes(location.hostname);
    const demoBox = document.querySelector('[data-demo-only]');
    if (demoMode && demoBox) demoBox.hidden = false;
    const demos = {
        customer: ['customer.demo@akart.local', 'Customer@123'],
        farmer: ['farmer.demo@akart.local', 'Farmer@123']
    };
    document.querySelectorAll('.demo-login').forEach(button => button.addEventListener('click', async () => {
        const role = button.dataset.demoRole;
        const [email, password] = demos[role];
        showAuthRole(role);
        document.getElementById('email').value = email;
        document.getElementById('password').value = password;
        button.disabled = true;
        try {
            const auth = await import('auth');
            await auth.login(email, password, role);
            navigate(role === 'farmer' ? '/farmer-dashboard' : '/customer-dashboard');
        } catch (error) {
            const errorEl = document.getElementById('login-error');
            errorEl.textContent = error.message || 'Demo login is unavailable.';
            errorEl.style.display = 'block';
            button.disabled = false;
        }
    }));

    // Google sign-in uses Firebase directly. The popup call is made from the
    // button handler; no timer or unrelated async work is scheduled first.
    const initSocial = async () => {
        const auth = await import('auth');
        const msg = document.getElementById('social-msg');
        const button = document.querySelector('.google-btn');
        if (!button || !msg) return;
        let busy = false;
        const report = (text) => { msg.textContent = text; msg.style.display = 'block'; };
        button.addEventListener('click', async () => {
            if (busy) return;
            busy = true;
            button.disabled = true;
            button.setAttribute('aria-busy', 'true');
            button.querySelector('.google-btn-text').textContent = 'Signing in with Google…';
            msg.style.display = 'none';
            try {
                const role = document.getElementById('login-form')?.dataset.role || 'customer';
                const user = await auth.signInWithGoogle(role);
                if (user?.redirecting) return;
                navigate(user.role === 'farmer' ? '/farmer-dashboard' : user.role === 'admin' ? '/admin-dashboard' : '/customer-dashboard');
            } catch (err) {
                report(await auth.getGoogleAuthErrorMessage(err));
            } finally {
                busy = false;
                button.disabled = false;
                button.removeAttribute('aria-busy');
                button.querySelector('.google-btn-text').textContent = 'Continue with Google';
            }
        });
    };
    initSocial();
};
