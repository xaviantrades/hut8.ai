

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

// ==========================================
// PUT YOUR FIREBASE CONFIG HERE
// ==========================================
const firebaseConfig = {
    apiKey: "AIzaSyCywqYls2mJfY9maHRhsHRTP6OmPgC1Kf0",
    authDomain: "x-shopping-6611d.firebaseapp.com",
    projectId: "x-shopping-6611d",
    storageBucket: "x-shopping-6611d.firebasestorage.app",
    messagingSenderId: "177602183210",
    appId: "1:177602183210:web:011c708002426b37cb8353",
    measurementId: "G-QKLP9H1N9P"
  };


// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Firestore database
const db = getFirestore(app);

// auth.js
// Custom Firestore Signup + Login Authentication
// ==========================================================



import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";


// ==========================================================
// CONFIGURATION
// ==========================================================

// Change this to the page you want users to enter after login.
const LANDING_PAGE = "landing.html";

// Change this to your login/signup page if needed.
const LOGIN_PAGE = "index.html";


// ==========================================================
// PASSWORD HASH
// ==========================================================
// Passwords are NOT stored as plain text.
// SHA-256 is used so the Firestore document contains only
// the password hash.
// ==========================================================

async function hashPassword(password) {

  const encoder = new TextEncoder();

  const data = encoder.encode(password);

  const hashBuffer = await crypto.subtle.digest(
    "SHA-256",
    data
  );

  const hashArray = Array.from(
    new Uint8Array(hashBuffer)
  );

  return hashArray
    .map(byte => byte.toString(16).padStart(2, "0"))
    .join("");
}


// ==========================================================
// CAPTCHA GENERATOR
// ==========================================================

function authNewCode(id) {

  const element = document.getElementById(id);

  if (element) {

    element.textContent =
      Math.random()
        .toString(36)
        .slice(2, 7)
        .toUpperCase();

  }
}


// Make it available to your inline HTML onclick:
// onclick="authNewCode('authSCode')"
window.authNewCode = authNewCode;


// ==========================================================
// GET ELEMENTS
// ==========================================================

const tabSignup =
  document.getElementById("authTabSignup");

const tabLogin =
  document.getElementById("authTabLogin");

const signupForm =
  document.getElementById("authSignupForm");

const loginForm =
  document.getElementById("authLoginForm");

const switchText =
  document.getElementById("authSwitchText");


// ==========================================================
// CHECK EXISTING LOGIN
// ==========================================================
// This runs when the authentication page is opened.
// If a previous login is saved, the user is redirected
// automatically without logging in again.
// ==========================================================

function checkExistingLogin() {

  const isLoggedIn =
    localStorage.getItem("isLoggedIn");

  if (isLoggedIn === "true") {

    window.location.replace(
      LANDING_PAGE
    );

  }
}


// ==========================================================
// REQUIRE LOGIN (for pages OTHER than the login/signup page)
// ==========================================================
// Call this on any page that should only be visible to logged-in
// users (landing.html, profile.html, etc). It checks the opposite
// condition from checkExistingLogin: if you are NOT logged in,
// you get sent back to the login page.
// ==========================================================

function requireLogin() {

  const isLoggedIn =
    localStorage.getItem("isLoggedIn");

  if (isLoggedIn !== "true") {

    window.location.replace(
      LOGIN_PAGE
    );

  }
}

// Make available to other JavaScript files / inline scripts.
window.requireLogin = requireLogin;


// ==========================================================
// SHOW SIGNUP
// ==========================================================

function showSignup() {

  if (!signupForm || !loginForm) return;

  signupForm.classList.remove("auth-hidden");

  loginForm.classList.add("auth-hidden");


  if (tabSignup) {
    tabSignup.classList.add("auth-active");
  }

  if (tabLogin) {
    tabLogin.classList.remove("auth-active");
  }


  if (switchText) {

    switchText.innerHTML =
      'Already have an account? <a id="authToLogin">Log in</a>';

    const authToLogin =
      document.getElementById("authToLogin");

    if (authToLogin) {
      authToLogin.onclick = showLogin;
    }
  }
}


// ==========================================================
// SHOW LOGIN
// ==========================================================

function showLogin() {

  if (!signupForm || !loginForm) return;

  loginForm.classList.remove("auth-hidden");

  signupForm.classList.add("auth-hidden");


  if (tabLogin) {
    tabLogin.classList.add("auth-active");
  }

  if (tabSignup) {
    tabSignup.classList.remove("auth-active");
  }


  if (switchText) {

    switchText.innerHTML =
      'Don\'t have an account? <a id="authToSignup">Sign up</a>';

    const authToSignup =
      document.getElementById("authToSignup");

    if (authToSignup) {
      authToSignup.onclick = showSignup;
    }
  }
}


// ==========================================================
// TAB EVENTS
// ==========================================================

if (tabSignup) {
  tabSignup.onclick = showSignup;
}

if (tabLogin) {
  tabLogin.onclick = showLogin;
}

const initialLoginLink =
  document.getElementById("authToLogin");

if (initialLoginLink) {
  initialLoginLink.onclick = showLogin;
}


// ==========================================================
// CREATE FIRESTORE USER
// ==========================================================

async function createUserAccount(phone, password) {

  phone = phone.trim();


  if (!phone || !password) {

    throw new Error(
      "Phone number and password are required."
    );

  }


  // Use encoded phone as Firestore document ID.
  const userId =
    encodeURIComponent(phone);


  const userRef =
    doc(db, "users", userId);


  // Check whether account already exists.
  const existingUser =
    await getDoc(userRef);


  if (existingUser.exists()) {

    throw new Error(
      "An account with this phone number already exists."
    );

  }


  // Hash password before saving.
  const passwordHash =
    await hashPassword(password);


  // Save user to Firestore.
  await setDoc(userRef, {

    phone: phone,

    passwordHash: passwordHash,

    createdAt: serverTimestamp()

  });


  return {

    success: true,

    userId: userId

  };

}


// ==========================================================
// SIGNUP
// ==========================================================

if (signupForm) {

  signupForm.addEventListener(
    "submit",
    async function (e) {

      e.preventDefault();


      const msg =
        document.getElementById("authSMsg");


      const phone =
        document.getElementById("authSName")
          .value
          .trim();


      const password =
        document.getElementById("authSpass")
          .value;


      const confirmPassword =
        document.getElementById("authSPass")
          .value;


      const captchaCode =
        document.getElementById("authSCode")
          .textContent;


      const captchaInput =
        document.getElementById("authSCaptcha")
          .value
          .trim()
          .toUpperCase();


      // ------------------------------------------
      // PASSWORD MATCH
      // ------------------------------------------

      if (password !== confirmPassword) {

        msg.className =
          "auth-msg auth-err";

        msg.textContent =
          "Passwords do not match.";

        return;

      }


      // ------------------------------------------
      // CAPTCHA
      // ------------------------------------------

      if (captchaInput !== captchaCode) {

        msg.className =
          "auth-msg auth-err";

        msg.textContent =
          "Incorrect code. Try again.";

        authNewCode("authSCode");

        document.getElementById(
          "authSCaptcha"
        ).value = "";

        return;

      }


      // ------------------------------------------
      // LOADING MESSAGE
      // ------------------------------------------

      msg.className =
        "auth-msg";

      msg.textContent =
        "Creating your account...";


      try {

        const result =
          await createUserAccount(
            phone,
            password
          );


        console.log(
          "User created:",
          result.userId
        );


        // ----------------------------------------
        // SUCCESS
        // ----------------------------------------

        msg.className =
          "auth-msg auth-ok";

        msg.textContent =
          "Account created successfully!";


        // Clear form.
        signupForm.reset();


        // Generate new CAPTCHA.
        authNewCode("authSCode");


        // ----------------------------------------
        // OPTIONAL:
        // Automatically switch to login
        // ----------------------------------------

        setTimeout(() => {

          showLogin();

        }, 1000);


      } catch (error) {

        console.error(
          "Signup error:",
          error
        );


        msg.className =
          "auth-msg auth-err";

        msg.textContent =
          error.message ||
          "Unable to create account.";


        authNewCode("authSCode");

      }

    }
  );

}


// ==========================================================
// LOGIN
// ==========================================================

if (loginForm) {

  loginForm.addEventListener(
    "submit",
    async function (e) {

      e.preventDefault();


      const msg =
        document.getElementById("authLMsg");


      const phone =
        document.getElementById("authLEmail")
          .value
          .trim();


      const password =
        document.getElementById("authLPass")
          .value;


      const captchaCode =
        document.getElementById("authLCode")
          .textContent;


      const captchaInput =
        document.getElementById("authLCaptcha")
          .value
          .trim()
          .toUpperCase();


      // ------------------------------------------
      // CAPTCHA CHECK
      // ------------------------------------------

      if (captchaInput !== captchaCode) {

        msg.className =
          "auth-msg auth-err";

        msg.textContent =
          "Incorrect code. Try again.";

        authNewCode("authLCode");

        document.getElementById(
          "authLCaptcha"
        ).value = "";

        return;

      }


      // ------------------------------------------
      // LOADING
      // ------------------------------------------

      msg.className =
        "auth-msg";

      msg.textContent =
        "Logging in...";


      try {

        // ----------------------------------------
        // FIND USER
        // ----------------------------------------

        const userId =
          encodeURIComponent(phone);


        const userRef =
          doc(db, "users", userId);


        const userSnap =
          await getDoc(userRef);


        // ----------------------------------------
        // USER NOT FOUND
        // ----------------------------------------

        if (!userSnap.exists()) {

          msg.className =
            "auth-msg auth-err";

          msg.textContent =
            "Incorrect phone number or password.";

          authNewCode("authLCode");

          return;

        }


        // ----------------------------------------
        // GET USER DATA
        // ----------------------------------------

        const userData =
          userSnap.data();


        // ----------------------------------------
        // HASH ENTERED PASSWORD
        // ----------------------------------------

        const enteredPasswordHash =
          await hashPassword(password);


        // ----------------------------------------
        // CHECK PASSWORD
        // ----------------------------------------

        if (
          enteredPasswordHash !==
          userData.passwordHash
        ) {

          msg.className =
            "auth-msg auth-err";

          msg.textContent =
            "Incorrect phone number or password.";

          authNewCode("authLCode");

          return;

        }


        // ========================================
        // LOGIN SUCCESS
        // ========================================

        // Save login state.
        localStorage.setItem(
          "isLoggedIn",
          "true"
        );


        // Save user ID.
        localStorage.setItem(
          "userId",
          userId
        );


        // Save phone.
        localStorage.setItem(
          "userPhone",
          userData.phone
        );


        // Store only non-sensitive user data.
        localStorage.setItem(
          "userData",
          JSON.stringify({
            phone: userData.phone
          })
        );


        // ----------------------------------------
        // SUCCESS MESSAGE
        // ----------------------------------------

        msg.className =
          "auth-msg auth-ok";

        msg.textContent =
          "Login successful!";


        // ----------------------------------------
        // REDIRECT
        // ----------------------------------------

        setTimeout(() => {

          window.location.replace(
            LANDING_PAGE
          );

        }, 500);


      } catch (error) {

        console.error(
          "Login error:",
          error
        );


        msg.className =
          "auth-msg auth-err";

        msg.textContent =
          "Something went wrong. Please try again.";

      }

    }
  );

}


// ==========================================================
// LOGOUT
// ==========================================================

function logout() {

  localStorage.removeItem(
    "isLoggedIn"
  );

  localStorage.removeItem(
    "userId"
  );

  localStorage.removeItem(
    "userPhone"
  );

  localStorage.removeItem(
    "userData"
  );


  window.location.replace(
    LOGIN_PAGE
  );

}


// Make logout available to HTML.
window.logout = logout;


// ==========================================================
// GET CURRENT USER
// ==========================================================

function getCurrentUser() {

  const isLoggedIn =
    localStorage.getItem("isLoggedIn");


  if (isLoggedIn !== "true") {
    return null;
  }


  const userData =
    JSON.parse(
      localStorage.getItem(
        "userData"
      ) || "{}"
    );


  return {

    isLoggedIn: true,

    userId:
      localStorage.getItem("userId"),

    phone:
      localStorage.getItem("userPhone"),

    ...userData

  };

}

// Make available to other JavaScript files.
window.getCurrentUser = getCurrentUser;
const phoneOwner = document.getElementById("phone-Owner");

if (phoneOwner) {
    phoneOwner.textContent = localStorage.getItem("userPhone") || "";
}

// ==========================================================
// INITIALIZATION
// ==========================================================

// Only skip-to-landing if we're actually on the login/signup page
// (i.e. this page has the forms). Other pages that load this same
// script — landing.html, profile.html, etc. — should call
// requireLogin() themselves instead. See note above requireLogin().
if (signupForm || loginForm) {
  checkExistingLogin();
}


// Generate CAPTCHA codes.
if (
  document.getElementById("authSCode")
) {
  authNewCode("authSCode");
}

if (
  document.getElementById("authLCode")
) {
  authNewCode("authLCode");
}