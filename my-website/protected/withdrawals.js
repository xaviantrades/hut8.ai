import { initializeApp } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-app.js";
import {
  getFirestore,
  collection,
  getDocs,
  orderBy,
  query,
  doc,
    setDoc,
    increment,
    serverTimestamp,
    updateDoc, 
    arrayUnion,
    getDoc
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";

/* =========================================================
 * Config
 * ======================================================= */
const FIREBASE_CONFIG = {
  apiKey: "AIzaSyCywqYls2mJfY9maHRhsHRTP6OmPgC1Kf0",
  authDomain: "x-shopping-6611d.firebaseapp.com",
  projectId: "x-shopping-6611d",
  storageBucket: "x-shopping-6611d.firebasestorage.app",
  messagingSenderId: "177602183210",
  appId: "1:177602183210:web:011c708002426b37cb8353",
  measurementId: "G-QKLP9H1N9P"
};

const COLLECTION_NAME = "withdrawals";
const CONTAINER_ID = "withdraw-container";

/* =========================================================
 * Firebase init
 * ======================================================= */
const app = initializeApp(FIREBASE_CONFIG);
const db = getFirestore(app);
const withdrawalsCollection = collection(db, COLLECTION_NAME);




/* =========================================================
 * GET LOGGED IN USER INFORAMTION
 * ======================================================= */




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


//------------------
//AI BUYING LOGIC TO AI income
//////----------------

async function saveSelectedItemToFirestore(data) {

  try {

    // Get the currently logged-in user
    const userId = localStorage.getItem("userId");

    if (!userId) {
      console.log("No logged-in user found.");
      return false;
    }

    // ------------------------------------
    // Convert lock to number
    // Example:
    // "2 days"  -> 2
    // "7 days"  -> 7
    // "30 days" -> 30
    // ------------------------------------
    const lockDays = parseInt(String(data.lock).replace(/\D/g, ""), 10);

    if (isNaN(lockDays)) {
      console.log("Invalid lock value:", data.lock);
      return false;
    }

    // ------------------------------------
    // Calculate expiry
    // Current time + lock days
    // ------------------------------------
    const expiry = new Date();

    expiry.setDate(expiry.getDate() + lockDays);

    // ------------------------------------
    // Data to save
    // ------------------------------------
    const investmentData = {
      totalIncome: Number(data.totalIncome) || 0,

      type: data.type || "",

      lock: lockDays,

      expiry: expiry,

      createdAt: new Date()
    };

    // Current user's Firestore document
    const userRef = doc(db, "users", userId);

    // Add this investment without deleting existing ones
    await updateDoc(userRef, {
      investments: arrayUnion(investmentData)
    });

    console.log("Investment saved successfully:", investmentData);

    return true;

  } catch (error) {

    console.error("Error saving investment:", error);

    return false;
  }
}



// ==========================================
// GET CURRENT DEPOSIT AMOUNT
// (use like: const currentAmount = await getCurrentAmount();)
// ==========================================

async function getCurrentAmount() {

    const currentUser =
        getCurrentUser();

    if (
        !currentUser ||
        !currentUser.userId
    ) {

        console.error(
            "No logged-in user found."
        );

        return 0;
    }


    try {

        const userRef =
            doc(
                db,
                "users",
                currentUser.userId
            );


        const userSnap =
            await getDoc(userRef);


        if (userSnap.exists()) {

            return userSnap.data().amount || 0;
        }


        return 0;


    } catch (error) {

        console.error(
            "Error fetching deposit amount:",
            error
        );

        return 0;

    }

}



// CARD PAYMENT LOGICS POP UP 
function showPopup(text) {
    const popup = document.getElementById("allpopupText");

    popup.textContent = text;

    const overlay = document.getElementById("allpopupOverlay");

    overlay.style.display = "flex";
  

    // Hide popup after 3 seconds
    setTimeout(() => {
        overlay.style.display = "none";
    }, 8000);
}


// ==========================================
// DEDUCT FROM DEPOSIT AMOUNT
// (use like: const success = await deductAmount(20);)
// ==========================================

async function deductAmount(amountToDeduct) {

    const currentUser =
        getCurrentUser();

    if (
        !currentUser ||
        !currentUser.userId
    ) {

        console.error(
            "No logged-in user found."
        );

        return false;
    }


    const deductNumber =
        parseFloat(amountToDeduct);


    if (
        isNaN(deductNumber) ||
        deductNumber <= 0
    ) {

        console.error(
            "Invalid deduction amount:",
            amountToDeduct
        );

        return false;
    }


    try {

        // Check balance first so it never goes negative
        const currentAmount =
            await getCurrentAmount();


        if (currentAmount < deductNumber) {

            console.error(
                "Insufficient balance. Current:",
                currentAmount,
                "Requested:",
                deductNumber
            );
          

showPopup(`ERROR! UGX ${deductNumber} is more than your Account balance, Deposite Cash dear !!`);

            return false;
        }


        const userRef =
            doc(
                db,
                "users",
                currentUser.userId
            );


        await setDoc(

            userRef,

            {

                amount:
                    increment(-deductNumber),

                updatedAt:
                    serverTimestamp()

            },

            {

                merge: true

            }

        );


        console.log(
            "Deducted",
            deductNumber,
            "from balance."
        );


        return true;


    } catch (error) {

        console.error(
            "Error deducting amount:",
            error
        );

        return false;

    }

}

/* =====================================
   CONFIRM BUY
   ===================================== */
const confirmBuy = document.getElementById("confirmBuy");

if (confirmBuy) {
    confirmBuy.addEventListener("click", function () {

        if (!selectedRaffleNumber) {
            return;
        }

        if (typeof deductAmount === "function") {
            deductAmount(20000);
        }

        if (typeof showPopup === "function") {
            showPopup("UGX 20,000 will be deducted from your account shortly");
        }

    });
}













/* =========================================================
 * Helpers
 * ======================================================= */

/** Format a numeric value as "1,234.00". Falls back to the raw value. */
function formatMoney(value) {
  const number = Number(value);

  if (value === null || value === undefined || value === "" || Number.isNaN(number)) {
    return "—";
  }

  return number.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

/** Create an element with an optional class and text content. */
function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

/* =========================================================
 * Rendering
 * ======================================================= */

function createImage(imageUrl) {
  const wrapper = el("div", "withdraw-image");

  if (!imageUrl) return wrapper;

  const image = el("img");
  image.src = imageUrl;
  image.alt = "Withdrawal machine";
  image.loading = "lazy";

  // Drop the whole wrapper if the image fails, so no empty box is left behind.
  image.addEventListener("error", () => wrapper.remove());

  wrapper.appendChild(image);
  return wrapper;
}

function createInfo(data) {
  const info = el("div", "withdraw-info");

  info.append(
    el("h2", "withdraw-title", data.type || "Untitled"),
    el("p", "withdraw-line", `Lock: ${data.lock || "—"}`),
    el("p", "withdraw-descrip", `Description: ${data.descrip || "notes"}`),
    el("p", "withdraw-line", `Buy Price: ${formatMoney(data.price)}`),
    el("p", "withdraw-line", `Payout Income: ${formatMoney(data.totalIncome)}`)
  );

  return info;
}

/** Build one withdrawal card element. */
function createWithdrawalCard(data) {
  const card = el("article", "withdraw-card");
  card.append(createImage(data.imageUrl), createInfo(data));
  
  // NEW: Add a click listener that passes the specific item's data to our handler
  card.addEventListener("click", () => {
    handleCardClick(data);
  });
  
  return card;
}

/** Render a list of withdrawals into the container in one paint. */
function renderWithdrawals(container, items) {
  const fragment = document.createDocumentFragment();
  items.forEach((data) => fragment.appendChild(createWithdrawalCard(data)));

  container.replaceChildren(fragment);
}

function renderEmpty(container, text) {
  container.replaceChildren(el("p", "withdraw-empty", text));
}

/* =========================================================
 * Data access
 * ======================================================= */

async function fetchWithdrawals() {
  // Newest first; requires the createdAt field written by the admin form.
  const snapshot = await getDocs(
    query(withdrawalsCollection, orderBy("createdAt", "desc"))
  );

  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

/* =========================================================
 * Controller / Click Handler
 * ======================================================= */

/** 
 * NEW: Exposed function to handle the click event.
 * You can import this into another file, or modify it directly 
 * to trigger your UI screen layer.
 */
// Holds whichever card was most recently clicked
let selectedItem = null;


export function handleCardClick(data) {

  console.log("Card clicked! Here is the data:", data);

  selectedItem = data; // save the raw data for later use

  const title = document.getElementById("withdraw-title");
  const lock = document.getElementById("withdraw-lock");
  const price = document.getElementById("withdraw-price");
  const totalIncome = document.getElementById("withdraw-total-income");

  title.textContent = data.type || "Untitled";
  lock.textContent = `Lock: ${data.lock || "—"}`;
  price.textContent = `Pay: ${formatMoney(data.price)}`;
  totalIncome.textContent = `Get: ${formatMoney(data.totalIncome)}`;

}


// Attach ONCE — place this at the bottom of the file, outside handleCardClick
const placeAibuyBtn =
    document.getElementById("place-aibuy");

if (placeAibuyBtn) {

    placeAibuyBtn.addEventListener("click", async function () {

        if (!selectedItem) {
            console.error("No card selected.");
            return;
        }

        try {

            // --------------------------------
            // 1. Deduct the purchase amount
            // --------------------------------
            const success =
                await deductAmount(selectedItem.price);

            if (!success) {
                console.error("Amount deduction failed.");
                return;
            }

            console.log("Deducted successfully.");


            // --------------------------------
            // 2. Get logged-in user's ID
            // --------------------------------
            const userId =
                localStorage.getItem("userId");

            if (!userId) {
                console.error("No logged-in user found.");
                return;
            }


            // --------------------------------
            // 3. Convert lock to number
            // --------------------------------
            const lockDays =
                parseInt(
                    String(selectedItem.lock).replace(/\D/g, ""),
                    10
                );

            if (isNaN(lockDays)) {
                console.error(
                    "Invalid lock value:",
                    selectedItem.lock
                );
                return;
            }


            // --------------------------------
            // 4. Calculate expiry date
            // --------------------------------
            const expiry = new Date();

            expiry.setDate(
                expiry.getDate() + lockDays
            );


            // --------------------------------
            // 5. Create investment object
            // --------------------------------
            const investmentData = {

                type: selectedItem.type || "",

                price:
                    Number(selectedItem.price) || 0,

                totalIncome:
                    Number(selectedItem.totalIncome) || 0,

                lock: lockDays,

                expiry: expiry,

                createdAt: new Date()
            };


            // --------------------------------
            // 6. User Firestore document
            // --------------------------------
            const userRef =
                doc(db, "users", userId);


            // --------------------------------
            // 7. Add investment
            // --------------------------------
            await updateDoc(userRef, {

                investments:
                    arrayUnion(investmentData)

            });


            console.log(
                "Investment saved successfully:",
                investmentData
            );


            // --------------------------------
            // 8. Show success popup
            // --------------------------------
            showPopup(
                `UGX ${Number(selectedItem.price).toLocaleString()} will be deducted from your account shortly`
            );


        } catch (error) {

            console.error(
                "Buy/investment error:",
                error
            );

        }

    });

}


///////////////// --------------------------------------
// CHECKING AI INVESTMENT STATUS OF USER
// --------------------------------------

function checkExpiry(expiry) {

    if (!expiry) {
        console.log("No expiry date found.");
        return false;
    }

    const expiryDate = expiry.toDate
        ? expiry.toDate()
        : new Date(expiry);

    return new Date() >= expiryDate;
}


async function checkInvestmentExpiry() {

      const userId = localStorage.getItem("userId");

      if (!userId) {
          document.getElementById("status-message").innerText = "No logged-in user found.";
          return false;
      }

      try {

          const userRef = doc(db, "users", userId);

          const userSnap = await getDoc(userRef);

          if (!userSnap.exists()) {
              document.getElementById("status-message").innerText = "User document not found.";
              return false;
          }

          const userData = userSnap.data();

          const investments = userData.investments || [];

          document.getElementById("user-id").innerText = userId;
          document.getElementById("total-investments").innerText = investments.length;

          const container = document.getElementById("investments-container");
          container.innerHTML = ""; // clear previous results before writing new ones

          if (investments.length === 0) {
              document.getElementById("no-investments-message").innerText = "No investments found.";
              return true;
          } else {
              document.getElementById("no-investments-message").innerText = "";
          }

          investments.forEach((investment, index) => {

              const expired =
                  checkExpiry(investment.expiry);

              // Convert Firestore timestamps
              const expiryDate =
                  investment.expiry?.toDate
                      ? investment.expiry.toDate()
                      : investment.expiry
                          ? new Date(investment.expiry)
                          : null;

              const createdDate =
                  investment.createdAt?.toDate
                      ? investment.createdAt.toDate()
                      : investment.createdAt
                          ? new Date(investment.createdAt)
                          : null;

              const card = document.createElement("div");
card.className = "investment-card";

const title = document.createElement("h3");
title.className = "investment-title";
title.innerText = `INVESTMENT ${index + 1}`;
card.appendChild(title);

const typeEl = document.createElement("p");
typeEl.className = "investment-info";
typeEl.innerText = `AI Type: ${investment.type}`;
card.appendChild(typeEl);

const priceEl = document.createElement("p");
priceEl.className = "investment-info investment-price";
priceEl.innerText =
  `Price: UGX ${Number(investment.price || 0).toLocaleString()}`;
card.appendChild(priceEl);

const incomeEl = document.createElement("p");
incomeEl.className = "investment-info investment-profit";
incomeEl.innerText =
  `Profit: UGX ${Number(investment.totalIncome || 0).toLocaleString()}`;
card.appendChild(incomeEl);

const lockEl = document.createElement("p");
lockEl.className = "investment-info investment-lock";
lockEl.innerText = `Lock: ${investment.lock} days`;
card.appendChild(lockEl);

const createdEl = document.createElement("p");
createdEl.className = "investment-info investment-created";
createdEl.innerText =
  `Created At: ${createdDate ? createdDate.toLocaleString() : "N/A"}`;
card.appendChild(createdEl);

const expiryEl = document.createElement("p");
expiryEl.className = "investment-info investment-payout";
expiryEl.innerText =
  `Payout Date: ${expiryDate ? expiryDate.toLocaleString() : "N/A"}`;
card.appendChild(expiryEl);

const statusEl = document.createElement("p");
statusEl.className =
  `investment-status ${expired ? "status-paid" : "status-active"}`;

statusEl.innerText =
  `Status: ${expired ? "PAID OUT" : "NOT PAID OUT"}`;

card.appendChild(statusEl);

              // Show remaining time if still active
              if (!expired && expiryDate) {

                  const remaining =
                      expiryDate.getTime() - Date.now();

                  const remainingDays =
                      Math.floor(
                          remaining / (1000 * 60 * 60 * 24)
                      );

                  const remainingHours =
                      Math.floor(
                          (remaining % (1000 * 60 * 60 * 24)) /
                          (1000 * 60 * 60)
                      );

                  const remainingEl = document.createElement("p");
                  remainingEl.innerText = `Remaining: ${remainingDays} days, ${remainingHours} hours`;
                  card.appendChild(remainingEl);
              }

              container.appendChild(card);
          });

          document.getElementById("complete-message").innerText = "AI History Check is Complete";

          return true;

      } catch (err) {

          document.getElementById("error-message").innerText = "Error checking investments: " + err.message;
          return false;
      }
  }





async function loadWithdrawals() {
  const container = document.getElementById(CONTAINER_ID);

  if (!container) {
    console.error(`No element with id="${CONTAINER_ID}" was found.`);
    return;
  }

  renderEmpty(container, "Loading…");

  try {
    const withdrawals = await fetchWithdrawals();

    if (withdrawals.length === 0) {
      renderEmpty(container, "No withdrawal records found.");
      return;
    }

    renderWithdrawals(container, withdrawals);
  } catch (error) {
    console.error("Error loading withdrawal data from Firestore:", error);
    renderEmpty(container, "Could not load withdrawals. Please try again.");
  }
}

/* =========================================================
 * Start
 * ======================================================= */

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", loadWithdrawals);
} else {
  loadWithdrawals();
}

// Exporting handleCardClick alongside loadWithdrawals
export { loadWithdrawals };







// ===============================
// ADD / UPDATE USER BTC 

async function saveBTCBalance(btcBalance) {

    const currentUser = getCurrentUser();

    if (!currentUser || !currentUser.userId) {

        console.error("No logged-in user found.");

        return false;
    }

    try {

        const userRef = doc(
            db,
            "users",
            currentUser.userId
        );

        await updateDoc(
            userRef,
            {
                btcBalance: increment(
                    Number(btcBalance)
                )
            }
        );

        console.log(
            "BTC balance changed by:",
            btcBalance
        );

        return true;

    } catch (error) {

        console.error(
            "Error updating BTC balance:",
            error
        );

        return false;
    }
}


// ===============================================
// SAVE / SET INITIAL BTC PRICE
// ===============================================
async function saveInitialBTCPrice(price) {

    const currentUser = getCurrentUser();

    if (!currentUser || !currentUser.userId) {
        console.error("No logged-in user found.");
        return false;
    }

    const numericPrice = Number(price);

    if (!Number.isFinite(numericPrice) || numericPrice <= 0) {
        console.error("Invalid BTC price:", price);
        return false;
    }

    try {

        const userRef = doc(
            db,
            "users",
            currentUser.userId
        );

        await setDoc(
            userRef,
            {
                initialBTCPrice: numericPrice
            },
            {
                merge: true
            }
        );

        console.log(
            "Initial BTC price saved:",
            numericPrice
        );

        return true;

    } catch (error) {

        console.error(
            "Error saving initial BTC price:",
            error
        );

        return false;
    }
}


// ===============================================
// GET STORED INITIAL BTC PRICE
// ===============================================
async function getInitialBTCPrice() {

    const currentUser = getCurrentUser();

    if (!currentUser || !currentUser.userId) {
        console.error("No logged-in user found.");
        return null;
    }

    try {

        const userRef = doc(
            db,
            "users",
            currentUser.userId
        );

        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
            return null;
        }

        const data = userSnap.data();

        const storedPrice = Number(
            data.initialBTCPrice
        );

        if (
            !Number.isFinite(storedPrice) ||
            storedPrice <= 0
        ) {
            return null;
        }

        return storedPrice;

    } catch (error) {

        console.error(
            "Error getting initial BTC price:",
            error
        );

        return null;
    }
}


//----------------------------------------
//BTC LOGICS
//-------------------------------------------
document.addEventListener('DOMContentLoaded', async () => {
  const slider = document.getElementById('invest-slider');
  const displayBalance = document.getElementById('display-balance');
  const investAmount = document.getElementById('invest-amount');
  const investPercentageText = document.getElementById('invest-percentage-text');
  const buybtn = document.getElementById('buy-buttoncry');
  const coinamount =
        document.getElementById("selectedAmount");
// moved up, before the guard

  if (!slider || !displayBalance || !investAmount || !investPercentageText || !buybtn || !coinamount) {
    return;
  }

  const currentBalance = await getCurrentAmount();
  displayBalance.innerText = `${currentBalance.toLocaleString()} UGX`;

  let calculatedAmount = 0; // shared across updateInvestment and the click handler

  function updateInvestment() {
    const percentage = slider.value;
    calculatedAmount = (percentage / 100) * currentBalance; // no 'const' here
    investAmount.innerText = calculatedAmount.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
    investPercentageText.innerText = `${percentage}% of Balance`;
    slider.style.setProperty('--slider-progress', `${percentage}%`);
    coinamount.innerText = `${calculatedAmount.toLocaleString()} UGX`;
  }
  

  slider.addEventListener('input', updateInvestment);

  
//----------
  buybtn.addEventListener("click", async function () {
    if (calculatedAmount <= 0) {
      showPopup("Move the slider to choose an investment amount first.");
      return;
    }

    const success = await await saveBTCBalance(calculatedAmount);
    if (success) {
      showPopup(`UGX ${formatMoney(calculatedAmount)} will be deducted from your account shortly.`);
      deductAmount(calculatedAmount);
      // consider refreshing displayBalance here so the UI reflects the new total
    }
  });


//-------------

  
  updateInvestment();
});

// Helper function to allow users to click text markers (e.g., "25%", "50%") to jump the slider
function setSlider(value) {
  const slider = document.getElementById('invest-slider');
  if (slider) {
    slider.value = value;
    // Trigger the input event so updateInvestment runs automatically
    slider.dispatchEvent(new Event('input'));
  }
}



/// WITHDRAL LOGIC CODES ENJOY

(function () {
    const btn = document.getElementById("withdrawl-btn");
    const input1 = document.getElementById("inputcrypt");
    const input2 = document.getElementById("amountInput");

    // If this page doesn't contain the required HTML, do nothing.
    if (!btn || (!input1 && !input2)) {
        return;
    }

    btn.addEventListener("click", function () {

        // Safely get values
        const value1 = input1 ? input1.value.trim() : "";
        const value2 = input2 ? input2.value.trim() : "";

        // Convert to numbers only if something was entered
        const number1 = value1 !== "" && !isNaN(value1)
            ? Number(value1)
            : null;

        const number2 = value2 !== "" && !isNaN(value2)
            ? Number(value2)
            : null;

        // Pick whichever input contains a number
        let selectedNumber = null;

        if (number1 !== null) {
            selectedNumber = number1;
        } else if (number2 !== null) {
            selectedNumber = number2;
        }

        // Nothing valid was entered
        if (selectedNumber === null) {
            console.log("No valid number was entered.");
            return;
        }

        console.log("Selected number:", selectedNumber);


      const newnumber = selectedNumber + 30000;

      showPopup(`UGX ${newnumber} is the minimum amount required for withdraw`);
        // Your code continues here
        // Example:
        // sendToFirestore(selectedNumber);
    });

})();

console.log("Hi withdrawal logic js is running");




// ===============================
// GET USER BTC BALANCE
// ===============================
// ======================================================
// 1. GET USER BTC BALANCE
// ======================================================
async function getBTCBalance() {

    const currentUser = getCurrentUser();

    if (!currentUser || !currentUser.userId) {
        console.error("No logged-in user found.");
        return 0;
    }

    try {

        const userRef = doc(
            db,
            "users",
            currentUser.userId
        );

        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {

            return Number(
                userSnap.data().btcBalance
            ) || 0;
        }

        return 0;

    } catch (error) {

        console.error(
            "Error fetching BTC balance:",
            error
        );

        return 0;
    }
}


// ======================================================
// 2. VARIABLES THAT LOCK THE STARTING STATE
// ======================================================



// ======================================================
// 3. GET BTC PRICE FROM COINGECKO
// ======================================================
async function getBTCPrice() {

    try {

        const response = await fetch(
            "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd"
        );

        if (!response.ok) {
            throw new Error("BTC API request failed");
        }

        const data = await response.json();

        const btcPrice = Number(data?.bitcoin?.usd);

        if (!Number.isFinite(btcPrice) || btcPrice <= 0) {
            throw new Error("Invalid BTC price returned");
        }

        return btcPrice;

    } catch (error) {

        console.error(
            "Error getting BTC price:",
            error
        );

        return null;
    }
}


// ======================================================
// 4. INITIALIZE THE BTC CALCULATION
// ======================================================
// ===============================================
// INITIALIZE BTC PRICE LOGIC
// ===============================================
let lockedStartingPrice = null;
let lockedInitialAmount = null;

async function initializeBTCLogic() {

    // -------------------------------------------
    // GET USER BTC BALANCE
    // -------------------------------------------
    const btcBalance = await getBTCBalance();

    console.log(
        "BTC Balance:",
        btcBalance
    );

    lockedInitialAmount = btcBalance;


    // -------------------------------------------
    // CHECK FIRESTORE FOR EXISTING START PRICE
    // -------------------------------------------
    let storedStartingPrice =
        await getInitialBTCPrice();


    // -------------------------------------------
    // NO START PRICE YET
    // GET PRICE FROM API AND SAVE IT
    // -------------------------------------------
    if (storedStartingPrice === null) {

        const apiPrice = await getBTCPrice();

        if (apiPrice === null) {

            console.error(
                "Could not get BTC price from API."
            );

            return;
        }

        const saved =
            await saveInitialBTCPrice(apiPrice);

        if (!saved) {
            return;
        }

        storedStartingPrice = apiPrice;

        console.log(
            "New initial BTC price created:",
            storedStartingPrice
        );

    } else {

        // ---------------------------------------
        // EXISTING START PRICE
        // ---------------------------------------
        console.log(
            "Existing initial BTC price loaded:",
            storedStartingPrice
        );
    }


    // -------------------------------------------
    // LOCK IT IN MEMORY FOR THIS SESSION
    // -------------------------------------------
    lockedStartingPrice =
        storedStartingPrice;


    console.log(
        "LOCKED STARTING PRICE:",
        lockedStartingPrice
    );

    console.log(
        "LOCKED INITIAL AMOUNT:",
        lockedInitialAmount
    );


    // Run calculation
    await updateBTCValue();
}

// ======================================================
// 5. GET CURRENT PRICE AND CALCULATE NEW AMOUNT
// ======================================================
async function updateBTCValue() {

    // Make sure initialization happened
    if (
        lockedStartingPrice === null ||
        lockedInitialAmount === null
    ) {
        console.error(
            "BTC logic has not been initialized."
        );
        return;
    }

    // Get NEW price from API
    const currentPrice = await getBTCPrice();

    if (currentPrice === null) {
        return;
    }

    // ==================================================
    // YOUR EXISTING PRICE LOGIC
    // ==================================================

    const startPrice = lockedStartingPrice;
    const initialAmount = lockedInitialAmount;

    // Difference in BTC price
    const priceDifference =
        currentPrice - startPrice;

    // Price movement factor
    const factor =
        priceDifference / startPrice;

    // Keep your multiplier here
    const multiplier = 5;

    // Amount/value change
    const valueChange =
        initialAmount *
        factor *
        multiplier;

    // New BTC amount/value
    const newAmount =
        initialAmount +
        valueChange;

    // Difference between new amount and initial amount
    const balanceDifference =
        newAmount - initialAmount;


    // ==================================================
    // DISPLAY VALUES
    // ==================================================

    const resDiff =
        document.getElementById("res-difference");

    const resPerc =
        document.getElementById("res-percentage");

    const resValChange =
        document.getElementById("res-value-change");

    const resNewAmount =
        document.getElementById("res-new-amount");
    

    if (resDiff) {
        resDiff.innerText =
            priceDifference.toFixed(2);
    }

    if (resPerc) {
        resPerc.innerText =
            (factor * 100).toFixed(2) + "%";
    }

    if (resValChange) {
        resValChange.innerText =
            valueChange.toFixed(8);
    }

    if (resNewAmount) {
        resNewAmount.innerText =
    "UGX " + Number(newAmount).toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });

      

        if (newAmount < initialAmount) {

            resNewAmount.classList.add(
                "negative-value"
            );

            resNewAmount.style.color =
                "#dc2626";

        } else {

            resNewAmount.classList.remove(
                "negative-value"
            );

            resNewAmount.style.color =
                "lightgreen";
        }
    }


    // ==================================================
    // CONSOLE CHECK
    // ==================================================

    console.log("BTC START PRICE:", startPrice);
    console.log("BTC CURRENT PRICE:", currentPrice);

    console.log("INITIAL BTC BALANCE:", initialAmount);
    console.log("NEW BTC AMOUNT:", newAmount);

    console.log(
        "BTC BALANCE DIFFERENCE:",
        balanceDifference
    );


    // ==================================================
    // SEND DIFFERENCE TO YOUR FIRESTORE FUNCTION
    // ==================================================

    /*
       PUT YOUR EXISTING FIRESTORE FUNCTION HERE.

       Example:

       await saveBTCDifferenceToFirestore(
           balanceDifference
       );

    */

    // Example placeholder:
    // await saveBTCDifferenceToFirestore(balanceDifference);

}


// ======================================================
// 6. START THE SYSTEM ONCE
// ======================================================
initializeBTCLogic();


// ======================================================
// 7. KEEP CHECKING THE CURRENT BTC PRICE
// ======================================================
// Starting price NEVER changes.
// Only current price changes.
//
// 30 seconds is used here as an example.
// ======================================================

setInterval(
    updateBTCValue,
    30000
);

async function updateTotalAccountBalance() {
    const balanceElement = document.getElementById("totalAccountBalance");

    // Safe if the HTML element doesn't exist
    if (!balanceElement) return;

    try {
        const btcBalance = await getBTCBalance();
        const currentAmount = await getCurrentAmount();

        // Safely convert values to numbers
        const btc = Number(btcBalance) || 0;
        const amount = Number(currentAmount) || 0;

        // Add both balances
        const totalBalance = btc + amount;

        // Safe text output — does not use innerHTML
        balanceElement.textContent =
    `UGX ${Number(totalBalance).toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    })}`;


      

    } catch (error) {
        console.error("Failed to calculate total account balance:", error);

        // Safe fallback
        balanceElement.textContent = "UGX 0";
    }
}


updateTotalAccountBalance();
checkInvestmentExpiry();

async function processExpiredInvestments() {

    const userId = localStorage.getItem("userId");

    if (!userId) {
        console.log("No logged-in user found.");
        return false;
    }

    try {

        const userRef = doc(db, "users", userId);

        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
            console.log("User document not found.");
            return false;
        }

        const userData = userSnap.data();

        const investments = userData.investments || [];

        let expiredIncome = 0;
        let changed = false;

        // Check every investment
        investments.forEach((investment) => {

            const expired = checkExpiry(investment.expiry);

            /*
             * Only process:
             * 1. Expired investment
             * 2. Has not already been added to aiincome
             */
            if (expired && investment.incomeAdded !== true) {

                const income =
                    Number(investment.totalIncome) || 0;

                if (income > 0) {

                    expiredIncome += income;

                    // Mark this investment as already processed
                    investment.incomeAdded = true;

                    changed = true;
                }
            }
        });

        /*
         * Nothing new expired
         */
        if (expiredIncome <= 0) {

            console.log("No new expired investment income.");

            return true;
        }

        /*
         * Save the updated investments array
         * so the same investment cannot be added again.
         */
        if (changed) {

            await setDoc(
                userRef,
                {
                    investments: investments
                },
                {
                    merge: true
                }
            );
        }

        /*
         * Add the expired income to aiincome
         */
        const aiIncomeRef =
            doc(db, "aiincome", userId);

        await setDoc(
            aiIncomeRef,
            {
                totalIncome: increment(expiredIncome),
                updatedAt: new Date()
            },
            {
                merge: true
            }
        );

        console.log(
            `UGX ${expiredIncome.toLocaleString()} added to aiincome`
        );

        return true;

    } catch (error) {

        console.error(
            "Error processing expired investments:",
            error
        );

        return false;
    }
}


async function displayAIIncome() {

    const userId = localStorage.getItem("userId");

    if (!userId) {
        return;
    }

    try {

        const aiIncomeRef =
            doc(db, "aiincome", userId);

        const aiIncomeSnap =
            await getDoc(aiIncomeRef);

        let totalIncome = 0;

        if (aiIncomeSnap.exists()) {

            const data = aiIncomeSnap.data();

            totalIncome =
                Number(data.totalIncome) || 0;
        }

       const aiinocmu = document.getElementById("aiinocmu");
if (aiinocmu) aiinocmu.innerText = `UGX ${totalIncome.toLocaleString()}`;

const aiincomm = document.getElementById("aiincomm");
if (aiincomm) aiincomm.innerText = `UGX ${totalIncome.toLocaleString()}`;

const aiinocu = document.getElementById("aiinocu");
if (aiinocu) aiinocu.innerText = `UGX ${totalIncome.toLocaleString()}`;

    } catch (error) {

        console.error(
            "Error getting AI income:",
            error
        );

    }
}

async function initializeAIIncome() {

    // First process newly expired investments
    await processExpiredInvestments();

    // Then display the updated total
    await displayAIIncome();
}

initializeAIIncome();