// authication.js
// Signup + Login using the server API (/api/signup, /api/login, /api/me, /api/logout).
// No Firebase code or password handling in the browser. The server hashes passwords,
// talks to Firestore, and keeps the login session in an httpOnly cookie.

// ==========================================================
// CONFIGURATION
// ==========================================================

// Protected page served by server.js after login (protected/landing.html).
const LANDING_PAGE = "/dashboard";

// Login/signup page.
const LOGIN_PAGE = "/";


// ==========================================================
// API HELPER
// ==========================================================

async function api(path, options = {}) {

  const response = await fetch(path, {
    method: options.method || "GET",
    credentials: "same-origin",
    headers: { "Content-Type": "application/json" },
    body: options.body ? JSON.stringify(options.body) : undefined
  });

  let data = {};

  try {
    data = await response.json();
  } catch (_) {
    // Non-JSON response; keep data as {}.
  }

  return { ok: response.ok, status: response.status, data };
}


// ==========================================================
// CAPTCHA GENERATOR
// ==========================================================

function authNewCode(id) {

  const element = document.getElementById(id);

  if (element) {
    element.textContent =
      Math.random().toString(36).slice(2, 7).toUpperCase();
  }
}

// Used by inline HTML: onclick="authNewCode('authSCode')"
window.authNewCode = authNewCode;


// ==========================================================
// GET ELEMENTS
// ==========================================================

const tabSignup  = document.getElementById("authTabSignup");
const tabLogin   = document.getElementById("authTabLogin");
const signupForm = document.getElementById("authSignupForm");
const loginForm  = document.getElementById("authLoginForm");
const switchText = document.getElementById("authSwitchText");


// ==========================================================
// SESSION HELPERS
// ==========================================================

// Returns { userId, phone } if logged in, otherwise null.
async function getCurrentUser() {

  try {
    const { ok, data } = await api("/api/me");

    if (!ok || !data.authenticated) return null;

    return { isLoggedIn: true, userId: data.userId, phone: data.phone };

  } catch (error) {
    console.error("Session check error:", error);
    return null;
  }
}

window.getCurrentUser = getCurrentUser;


// On the login page: if already logged in, go straight to the dashboard.
async function checkExistingLogin() {

  const user = await getCurrentUser();

  if (user) {
    window.location.replace(LANDING_PAGE);
  }
}


// On other pages: if NOT logged in, go back to the login page.
// (The server already protects /dashboard; this is just a UX safety net.)
async function requireLogin() {

  const user = await getCurrentUser();

  if (!user) {
    window.location.replace(LOGIN_PAGE);
  }

  return user;
}

window.requireLogin = requireLogin;


// ==========================================================
// SHOW SIGNUP / SHOW LOGIN
// ==========================================================

function showSignup() {

  if (!signupForm || !loginForm) return;

  signupForm.classList.remove("auth-hidden");
  loginForm.classList.add("auth-hidden");

  if (tabSignup) tabSignup.classList.add("auth-active");
  if (tabLogin) tabLogin.classList.remove("auth-active");

  if (switchText) {
    switchText.innerHTML =
      'Already have an account? <a id="authToLogin">Log in</a>';

    const authToLogin = document.getElementById("authToLogin");
    if (authToLogin) authToLogin.onclick = showLogin;
  }
}

function showLogin() {

  if (!signupForm || !loginForm) return;

  loginForm.classList.remove("auth-hidden");
  signupForm.classList.add("auth-hidden");

  if (tabLogin) tabLogin.classList.add("auth-active");
  if (tabSignup) tabSignup.classList.remove("auth-active");

  if (switchText) {
    switchText.innerHTML =
      'Don\'t have an account? <a id="authToSignup">Sign up</a>';

    const authToSignup = document.getElementById("authToSignup");
    if (authToSignup) authToSignup.onclick = showSignup;
  }
}


// ==========================================================
// TAB EVENTS
// ==========================================================

if (tabSignup) tabSignup.onclick = showSignup;
if (tabLogin) tabLogin.onclick = showLogin;

const initialLoginLink = document.getElementById("authToLogin");
if (initialLoginLink) initialLoginLink.onclick = showLogin;


// ==========================================================
// SIGNUP
// ==========================================================

if (signupForm) {

  signupForm.addEventListener("submit", async function (e) {

    e.preventDefault();

    const msg = document.getElementById("authSMsg");

    const phone = document.getElementById("authSName").value.trim();
    const password = document.getElementById("authSpass").value;
    const confirmPassword = document.getElementById("authSPass").value;

    const captchaCode = document.getElementById("authSCode").textContent;
    const captchaInput = document
      .getElementById("authSCaptcha")
      .value.trim()
      .toUpperCase();

    // Password match
    if (password !== confirmPassword) {
      msg.className = "auth-msg auth-err";
      msg.textContent = "Passwords do not match.";
      return;
    }

    // Length (the server enforces this too)
    if (password.length < 8) {
      msg.className = "auth-msg auth-err";
      msg.textContent = "Password must contain at least 8 characters.";
      return;
    }

    // Captcha (UX only; it is not real bot protection)
    if (captchaInput !== captchaCode) {
      msg.className = "auth-msg auth-err";
      msg.textContent = "Incorrect code. Try again.";
      authNewCode("authSCode");
      document.getElementById("authSCaptcha").value = "";
      return;
    }

    msg.className = "auth-msg";
    msg.textContent = "Creating your account...";

    try {

      const { ok, data } = await api("/api/signup", {
        method: "POST",
        body: { phone, password }
      });

      if (!ok) {
        msg.className = "auth-msg auth-err";
        msg.textContent = data.error || "Unable to create account.";
        authNewCode("authSCode");
        return;
      }

      msg.className = "auth-msg auth-ok";
      msg.textContent = "Account created successfully!";

      signupForm.reset();
      authNewCode("authSCode");

      // Switch to the login form.
      setTimeout(showLogin, 1000);

    } catch (error) {

      console.error("Signup error:", error);

      msg.className = "auth-msg auth-err";
      msg.textContent = "Unable to reach the server. Please try again.";
      authNewCode("authSCode");
    }
  });
}


// ==========================================================
// LOGIN
// ==========================================================

if (loginForm) {

  loginForm.addEventListener("submit", async function (e) {

    e.preventDefault();

    const msg = document.getElementById("authLMsg");

    const phone = document.getElementById("authLEmail").value.trim();
    const password = document.getElementById("authLPass").value;

    const captchaCode = document.getElementById("authLCode").textContent;
    const captchaInput = document
      .getElementById("authLCaptcha")
      .value.trim()
      .toUpperCase();

    // Captcha
    if (captchaInput !== captchaCode) {
      msg.className = "auth-msg auth-err";
      msg.textContent = "Incorrect code. Try again.";
      authNewCode("authLCode");
      document.getElementById("authLCaptcha").value = "";
      return;
    }

    msg.className = "auth-msg";
    msg.textContent = "Logging in...";

    try {

      const { ok, data } = await api("/api/login", {
        method: "POST",
        body: { phone, password }
      });

      if (!ok) {
        msg.className = "auth-msg auth-err";
        msg.textContent = data.error || "Incorrect phone number or password.";
        authNewCode("authLCode");
        return;
      }

      msg.className = "auth-msg auth-ok";
      msg.textContent = "Login successful!";

      // The session cookie is already set by the server.
      setTimeout(() => {
        window.location.replace(LANDING_PAGE);
      }, 500);

    } catch (error) {

      console.error("Login error:", error);

      msg.className = "auth-msg auth-err";
      msg.textContent = "Something went wrong. Please try again.";
      authNewCode("authLCode");
    }
  });
}


// ==========================================================
// LOGOUT
// ==========================================================

async function logout() {

  try {
    await api("/api/logout", { method: "POST" });
  } catch (error) {
    console.error("Logout error:", error);
  }

  window.location.replace(LOGIN_PAGE);
}

window.logout = logout;


// ==========================================================
// SHOW PHONE NUMBER ON PAGES THAT HAVE <span id="phone-Owner">
// ==========================================================

const phoneOwner = document.getElementById("phone-Owner");

if (phoneOwner) {
  getCurrentUser().then((user) => {
    phoneOwner.textContent = user ? user.phone : "";
  });
}


// ==========================================================
// INITIALIZATION
// ==========================================================

// Only the login/signup page has these forms.
if (signupForm || loginForm) {
  checkExistingLogin();
}

if (document.getElementById("authSCode")) authNewCode("authSCode");
if (document.getElementById("authLCode")) authNewCode("authLCode");
