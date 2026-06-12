// ============================================================
// NK Dairy Products — Auth Logic
// Uses Firebase Authentication for Google Sign-In
// Email login/register: no password (email-only)
// ============================================================

document.addEventListener('DOMContentLoaded', function () {
    const loginForm    = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');

    if (loginForm)    loginForm.addEventListener('submit', handleLogin);
    if (registerForm) registerForm.addEventListener('submit', handleRegister);
});

// ── Google Sign-In via Firebase ───────────────────────────────
function signInWithGoogle() {
    // Check if Firebase is available
    if (typeof firebase === 'undefined') {
        showMessage('Firebase not configured yet. Please follow the setup guide.', 'error');
        return;
    }

    const provider = new firebase.auth.GoogleAuthProvider();
    provider.addScope('email');
    provider.addScope('profile');

    firebase.auth().signInWithPopup(provider)
        .then(function(result) {
            const googleUser = result.user;

            const userObj = {
                name    : googleUser.displayName,
                email   : googleUser.email,
                phone   : googleUser.phoneNumber || '',
                picture : googleUser.photoURL,
                provider: 'google'
            };

            // Save to local users list
            const users = JSON.parse(localStorage.getItem('users')) || [];
            const exists = users.find(u => u.email === userObj.email);
            if (!exists) {
                users.push({ fullname: userObj.name, email: userObj.email, phone: userObj.phone, provider: 'google' });
                localStorage.setItem('users', JSON.stringify(users));
            }

            loginSuccess(userObj);
        })
        .catch(function(error) {
            if (error.code === 'auth/popup-closed-by-user') {
                showMessage('Google Sign-In cancelled.', 'error');
            } else if (error.code === 'auth/popup-blocked') {
                showMessage('Popup was blocked. Please allow popups for this site.', 'error');
            } else {
                showMessage('Google Sign-In failed: ' + error.message, 'error');
                console.error('Google Sign-In error:', error);
            }
        });
}

// ── Handle Email Login (no password) ─────────────────────────
function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('email').value.trim();
    if (!email) return;

    const users = JSON.parse(localStorage.getItem('users')) || [];
    const user  = users.find(u => u.email === email);

    if (user) {
        loginSuccess({
            name    : user.fullname,
            email   : user.email,
            phone   : user.phone || '',
            picture : user.picture || '',
            provider: user.provider || 'email'
        });
    } else {
        showMessage('No account found with this email. Please sign up first.', 'error');
        setTimeout(() => { window.location.href = 'register.html'; }, 2000);
    }
}

// ── Handle Email Register (no password) ──────────────────────
function handleRegister(e) {
    e.preventDefault();
    const fullname = document.getElementById('fullname').value.trim();
    const email    = document.getElementById('email').value.trim();
    const phone    = document.getElementById('phone').value.trim();

    const users = JSON.parse(localStorage.getItem('users')) || [];

    if (users.some(u => u.email === email)) {
        showMessage('Email already registered! Redirecting to login...', 'error');
        setTimeout(() => { window.location.href = 'login.html'; }, 1800);
        return;
    }

    const newUser = { fullname, email, phone, provider: 'email' };
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));

    loginSuccess({ name: fullname, email, phone, picture: '', provider: 'email' });
}

// ── Shared: Save user & redirect ─────────────────────────────
function loginSuccess(user) {
    localStorage.setItem('user', JSON.stringify({
        name    : user.name,
        email   : user.email,
        phone   : user.phone   || '',
        picture : user.picture || '',
        provider: user.provider || 'email'
    }));

    const greeting = user.provider === 'google'
        ? `Signed in with Google as ${user.name} ✓`
        : `Welcome, ${user.name}! ✓`;

    showMessage(greeting, 'success');

    setTimeout(() => {
        const redirectTo = localStorage.getItem('redirectAfterAuth');
        if (redirectTo) {
            localStorage.removeItem('redirectAfterAuth');
            window.location.href = redirectTo;
        } else {
            const cart = JSON.parse(localStorage.getItem('cart')) || [];
            window.location.href = cart.length > 0 ? 'cart.html' : 'index.html';
        }
    }, 1200);
}

// ── Toast notification ────────────────────────────────────────
function showMessage(message, type) {
    document.querySelectorAll('.auth-toast').forEach(el => el.remove());

    const toast = document.createElement('div');
    toast.className = 'auth-toast';
    toast.style.cssText = `
        position: fixed;
        top: 80px;
        left: 50%;
        transform: translateX(-50%) translateY(-20px);
        padding: 14px 28px;
        border-radius: 10px;
        color: white;
        font-weight: 600;
        font-size: 0.95rem;
        z-index: 10000;
        opacity: 0;
        transition: all 0.3s ease;
        box-shadow: 0 8px 24px rgba(0,0,0,0.2);
        max-width: 420px;
        text-align: center;
        ${type === 'success'
            ? 'background: linear-gradient(135deg, #22c55e, #16a34a);'
            : 'background: linear-gradient(135deg, #ef4444, #dc2626);'}
    `;
    toast.textContent = message;
    document.body.appendChild(toast);

    requestAnimationFrame(() => {
        toast.style.opacity = '1';
        toast.style.transform = 'translateX(-50%) translateY(0)';
    });

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(-50%) translateY(-20px)';
        setTimeout(() => toast.remove(), 300);
    }, 3500);
}
