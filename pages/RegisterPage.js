import { navigate } from 'utils';

export const render = () => `
    <main>
      <div class="auth-page">
        <div class="auth-card">
          <div class="auth-brand">
            <span class="auth-logo">AK<span>art</span></span>
            <h1 class="auth-title" data-i18n="register.title">Create Account</h1>
            <p class="auth-subtitle" data-i18n="register.subtitle">Join as a farmer or customer and get started.</p>
          </div>

          <form id="register-form" novalidate>
            <div class="form-group">
              <label for="name" data-i18n="register.name">Full Name</label>
              <input type="text" id="name" name="name" placeholder="Enter your full name" autocomplete="name" required>
            </div>
            <div class="form-group">
              <label for="email" data-i18n="login.email">Email</label>
              <input type="email" id="email" name="email" placeholder="Enter your email" autocomplete="email" required>
            </div>
            <div class="form-group">
              <label for="phone" data-i18n="register.phone">Phone Number</label>
              <input type="tel" id="phone" name="phone" placeholder="Enter your phone number" autocomplete="tel" required>
            </div>
            <div class="form-group">
              <label for="password" data-i18n="login.password">Password</label>
              <input type="password" id="password" name="password" placeholder="Min. 8 characters" minlength="8" autocomplete="new-password" required>
            </div>
            <div class="form-group">
              <label for="confirm-password" data-i18n="register.confirm">Confirm Password</label>
              <input type="password" id="confirm-password" name="confirmPassword" placeholder="Re-enter your password" autocomplete="new-password" required>
            </div>
            <div class="form-group">
              <label for="role-customer">Register as a:</label>
              <div class="radio-group">
                <label><input id="role-customer" type="radio" name="role" value="customer" checked required> Customer</label>
                <label for="role-farmer"><input id="role-farmer" type="radio" name="role" value="farmer" required> Farmer</label>
              </div>
            </div>
            <div class="form-group" id="delivery-address-group" style="display:none;">
              <label for="delivery-address">Delivery/Farm Address</label>
              <textarea id="delivery-address" placeholder="Enter your full address. This will be used for deliveries and pickups."></textarea>
            </div>
            <button type="submit" class="btn btn-primary auth-submit" data-i18n="register.create">Create Account</button>
            <p id="register-error" class="auth-error" style="display:none;"></p>
            <p id="register-ok" class="auth-ok" style="display:none;"></p>
          </form>

          <div class="social-divider"><span data-i18n="register.or">or sign up with</span></div>
          <div class="social-buttons">
            <button type="button" class="social-btn google-btn" data-provider="google">
              <span class="social-icon" aria-hidden="true"><i class="fa-brands fa-google"></i></span>
              <span class="google-btn-text">Sign up with Google</span>
            </button>
          </div>
          <p id="social-msg" class="auth-error" style="display:none;"></p>

          <p class="auth-switch"><span data-i18n="register.already">Already have an account?</span> <a href="#/login"><span data-i18n="register.loginLink">Login</span></a></p>
        </div>
      </div>
    </main>
`;

export const addEventListeners = () => {
    const registerForm = document.getElementById('register-form');
    const deliveryAddressGroup = document.getElementById('delivery-address-group');
    const roleRadios = document.querySelectorAll('input[name="role"]');

    const toggleAddressField = () => {
        const selectedRole = document.querySelector('input[name="role"]:checked').value;
        if (selectedRole === 'farmer') {
            deliveryAddressGroup.style.display = 'block';
            document.getElementById('delivery-address').required = true;
        } else {
            deliveryAddressGroup.style.display = 'none';
            document.getElementById('delivery-address').required = false;
        }
    };

    roleRadios.forEach(radio => radio.addEventListener('change', toggleAddressField));

    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const errorEl = document.getElementById('register-error');
            const okEl = document.getElementById('register-ok');
            errorEl.style.display = 'none';
            okEl.style.display = 'none';

            const name = document.getElementById('name').value.trim();
            const email = document.getElementById('email').value.trim().toLowerCase();
            const phone = document.getElementById('phone').value.trim();
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirm-password').value;
            const role = document.querySelector('input[name="role"]:checked')?.value;
            const address = document.getElementById('delivery-address').value.trim();
            const i18n = await import('i18n');
            const showError = (message) => { errorEl.textContent = message; errorEl.style.display = 'block'; };
            if (!name || !email || !phone || !password || !confirmPassword || !role || (role === 'farmer' && !address)) {
                showError(i18n.t('error.required', 'Please fill in all required fields.'));
                return;
            }
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                showError(i18n.t('error.email', 'Please enter a valid email address.'));
                return;
            }
            if (phone.replace(/\D/g, '').length < 10) {
                showError(i18n.t('error.phone', 'Please enter a valid phone number.'));
                return;
            }
            if (password.length < 8) {
                showError(i18n.t('error.password', 'Password must be at least 8 characters.'));
                return;
            }
            if (password !== confirmPassword) {
                showError(i18n.t('error.passwordMatch', 'Passwords do not match. Please try again.'));
                return;
            }

            const userData = {
                name,
                email,
                password,
                phone,
                role: role,
                address: role === 'farmer' ? address : ''
            };

            try {
                const auth = await import('auth');
                await auth.register(userData);
                okEl.textContent = i18n.t('register.success', 'Registration successful! Redirecting to your dashboard…');
                okEl.style.display = 'block';
                setTimeout(() => navigate(role === 'farmer' ? '/farmer-dashboard' : '/customer-dashboard'), 300);
            } catch (error) {
                showError(error.code === 'DUPLICATE_EMAIL'
                    ? i18n.t('error.duplicateEmail', 'An account with this email already exists.')
                    : (error.message || 'Account creation failed. Please try again.'));
            }
        });
    }

    // Google sign-up creates a Firestore profile using the selected role. An
    // existing profile's role is always preserved by the auth service.
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
            button.querySelector('.google-btn-text').textContent = 'Signing up with Google…';
            msg.style.display = 'none';
            try {
                const role = document.querySelector('input[name="role"]:checked')?.value || 'customer';
                const user = await auth.signInWithGoogle(role);
                if (user?.redirecting) return;
                navigate(user.role === 'farmer' ? '/farmer-dashboard' : user.role === 'admin' ? '/admin-dashboard' : '/customer-dashboard');
            } catch (err) {
                report(await auth.getGoogleAuthErrorMessage(err));
            } finally {
                busy = false;
                button.disabled = false;
                button.removeAttribute('aria-busy');
                button.querySelector('.google-btn-text').textContent = 'Sign up with Google';
            }
        });
    };
    initSocial();

    // Initial check
    toggleAddressField();
};
