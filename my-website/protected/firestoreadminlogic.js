// ==========================================
// FIREBASE IMPORTS
// ==========================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";

import {
    getFirestore,
    doc,
    setDoc,
    increment,
    serverTimestamp,
    onSnapshot
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";


// ==========================================
// FIREBASE CONFIG
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


// ==========================================
// INITIALIZE FIREBASE
// ==========================================

const app = initializeApp(firebaseConfig);

const db = getFirestore(app);


// ==========================================
// GET CURRENT LOGGED-IN USER
// ==========================================

function getCurrentUser() {

    const isLoggedIn =
        localStorage.getItem("isLoggedIn");

    if (isLoggedIn !== "true") {
        return null;
    }

    let userData = {};

    try {

        userData = JSON.parse(
            localStorage.getItem("userData") || "{}"
        );

    } catch (error) {

        console.error(
            "Invalid userData in localStorage:",
            error
        );

    }

    return {

        isLoggedIn: true,

        userId:
            localStorage.getItem("userId"),

        phone:
            localStorage.getItem("userPhone"),

        ...userData

    };
}


// ==========================================

// ==========================================
// MOBILE MONEY
// ==========================================


        // -----------------------------
        // GET CURRENT USER
        // -----------------------------

      









async function processMomoPayment() {

    try {

        // -----------------------------
        // GET CURRENT USER
        // -----------------------------

        const currentUser = getCurrentUser();

        if (!currentUser || !currentUser.userId) {
            console.error("No logged-in user found.");
            return;
        }

        // -----------------------------
        // GET MOMO AMOUNT
        // -----------------------------
const savedmomoAmount =
    document.getElementById('amount')?.value
    ?.trim()
    .replace(/[^0-9]/g, "") || "";
      
        if (!savedmomoAmount) {
            console.error("No MOMO amount found.");
            return;
        }

        // -----------------------------
        // CONVERT TO NUMBER
        // (increment() requires a number, not a string)
        // -----------------------------

        const momoAmountNumber = parseFloat(savedmomoAmount);

        if (isNaN(momoAmountNumber) || momoAmountNumber <= 0) {
            console.error("Invalid MOMO amount:", savedmomoAmount);
            return;
        }

        // -----------------------------
        // GET PHONE
        // -----------------------------

        const phoneInput = document.getElementById("phone");

        const phone = phoneInput ? phoneInput.value.trim() : "";

        // -----------------------------
        // FIRESTORE USER DOCUMENT
        // users/{userId}
        // -----------------------------

        const userRef = doc(db, "users", currentUser.userId);

        // -----------------------------
        // SAVE TO FIRESTORE
        // (increment adds to the existing amount instead of overwriting it)
        // -----------------------------

        await setDoc(
            userRef,
            {
                phone: phone,
                amount: increment(Number(momoAmountNumber)),
                updatedAt: serverTimestamp()
            },
            {
                merge: true
            }
        );

        // -----------------------------
        // SUCCESS
        // -----------------------------

        console.log("Mobile money data successfully sent to Firestore.");

        console.log({
            userId: currentUser.userId,
            phone: phone,
            amountAdded: momoAmountNumber
        });

    } catch (error) {
        console.error("Error sending mobile money data to Firestore:", error);
    }

}


document.addEventListener('DOMContentLoaded',() => {
  console.log(
                    "marzpay logic reached:"
                );

const currentUse = getCurrentUser();

if (!currentUse || !currentUse.userId) {
    console.error("No logged-in user found.");
    
}

const userId = currentUse.userId;

const form = document.getElementById('paymentForm'),
          
          phone = document.getElementById('phone'),
          amount = document.getElementById('amount'),
          payBtn = document.getElementById('payBtn'),
          statusEl = document.getElementById('status'),
          details = document.getElementById('details'),
          referenceEl = document.getElementById('reference'),
          stateEl = document.getElementById('state');


const API_BASE = 'https://marzpay-api.investinginaionline.workers.dev';

    
    let timer = null,
        active = false;

    function message(t, c = '') {
      statusEl.textContent = t;
      statusEl.className = 'status ' + c;
    }

    function stop() {
      active = false;
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }
    }

    function busy(v) {
      payBtn.disabled = v;
      payBtn.textContent = v ? 'Processing...' : 'Pay Now';
    }

    payBtn.addEventListener('click', async e => {
      e.preventDefault();
      stop();
      

      const uid = userId;
      
        const ph = phone.value.trim();
    
              
          const amt = Number(amount.value);
      

      if (!uid) return message('Please enter your User ID.', 'error');
      if (!ph) return message('Please enter your mobile-money number.', 'error');
      if (!Number.isInteger(amt) || amt < 500 || amt > 10000000) {
        return message('Amount must be between UGX 500 and UGX 10,000,000.', 'error');
      }

      busy(true);
      message('Starting payment...', 'processing');

      try {
        const r = await fetch(API_BASE + '/collect-money', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: uid, phone: ph, amount: amt })
        });
        const d = await r.json();

        if (!r.ok || d.status !== 'success') {
          throw new Error(d.message || 'Payment could not be initiated.');
        }

        const t = d?.data?.transaction || {},
              ref = t.reference || d?.data?.reference || '';

        if (!ref) throw new Error('MarzPay did not return a reference.');

        referenceEl.textContent = ref;
        stateEl.textContent = t.status || 'processing';
        details.classList.remove('hidden');
        message('Payment request sent. Approve the MTN/Airtel prompt on your phone.', 'processing');

        poll(ref);
      } catch (err) {
        message(err.message || 'Unable to start payment.', 'error');
        busy(false);
      }
    });

    function poll(ref) {
      active = true;
      let n = 0;

      (async function check() {
        if (!active) return;
        n++;

        try {
          const r = await fetch(API_BASE + '/payment-status/' + encodeURIComponent(ref), { cache: 'no-store' }),
                d = await r.json();

          if (!r.ok || d.status !== 'success') {
            throw new Error(d.message || 'Status check failed.');
          }

          const p = d.data || {},
                s = p.status || 'processing';

          stateEl.textContent = s;

      if (s === 'paid') {
    stop();
    message('Payment successful.', 'success');
    
    try {
        await processMomoPayment();
    } catch(error) {
        console.error(error);
    }

    busy(false);
    return;
      }
          if (s === 'failed') {
            stop();
            message('Payment failed.', 'error');
            busy(false);
            return;
          }
          if (s === 'cancelled') {
            stop();
            message('Payment was cancelled.', 'error');
            busy(false);
            return;
          }

          message('Waiting for payment confirmation. Approve the prompt on your phone.', 'processing');

          if (n >= 60) {
            stop();
            message('Confirmation is taking longer than expected. Check the payment status before trying again.', 'processing');
            busy(false);
            return;
          }

          timer = setTimeout(check, 3000);
        } catch (err) {
          if (n >= 60) {
            stop();
            message('Unable to confirm the payment automatically. Check the payment status before retrying.', 'error');
            busy(false);
            return;
          }
          timer = setTimeout(check, 3000);
        }
      })();
    }
})

// ==========================================
// DISPLAY TOTAL DEPOSITED AMOUNT
// (live-updates whenever amount changes)
// ==========================================/

function displayTotalDeposited() {

    const currentUser =
        getCurrentUser();

    if (
        !currentUser ||
        !currentUser.userId
    ) {

        console.error(
            "No logged-in user found."
        );

        return;
    }


    // Change "total-deposited" to match
    // the id of the element in your HTML
    const totalEl =
        document.getElementById(
            "total-deposited"
        );

    if (!totalEl) {

      

        return;
    }


    const userRef =
        doc(
            db,
            "users",
            currentUser.userId
        );


    onSnapshot(

        userRef,

        (docSnap) => {

            if (docSnap.exists()) {

                const data =
                    docSnap.data();

                const total =
                    data.amount || 0;

                totalEl.textContent =
    `UGX ${Number(total).toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    })}`;

            } else {

                totalEl.textContent = "0.00";

            }

        },

        (error) => {

            console.error(
                "Error listening to total deposited:",
                error
            );

        }

    );

}


displayTotalDeposited();


console.log(
                    "ADMIN LOGI JS IS RUNNING:"
                );