// server.js
const express = require("express");
const session = require("express-session");
const admin = require("firebase-admin");
const crypto = require("crypto");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 10000;

if (!process.env.SESSION_SECRET) {
  throw new Error("Missing SESSION_SECRET environment variable");
}

if (!process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
  throw new Error("Missing FIREBASE_SERVICE_ACCOUNT_JSON environment variable");
}

// Firebase Admin credentials belong on the server only.
const serviceAccount = JSON.parse(
  process.env.FIREBASE_SERVICE_ACCOUNT_JSON
);

admin.initializeApp({
  credential: admin.credential.cert({
    ...serviceAccount,
    private_key: serviceAccount.private_key?.replace(/\\n/g, "\n")
  })
});

const db = admin.firestore();

app.set("trust proxy", 1);
app.use(express.json({ limit: "20kb" }));
app.use(express.urlencoded({ extended: false }));

app.use(session({
  name: "site.sid",
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: 24 * 60 * 60 * 1000
  }
}));

// Serve your existing login page and public assets.
// Put index.html and authication.js inside public/.
app.use(express.static(path.join(__dirname, "public")));

// Existing accounts use SHA-256 hashes.
// Retain this temporarily for compatibility.
function hashPassword(password) {
  return crypto
    .createHash("sha256")
    .update(password, "utf8")
    .digest("hex");
}

function getUserDocumentId(phone) {
  return encodeURIComponent(phone.trim());
}

// Check the session on every protected page request.
function requireLogin(req, res, next) {
  if (!req.session.userId) {
    return res.redirect("/");
  }

  next();
}

// Return current authenticated session status.
app.get("/api/me", (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({
      authenticated: false
    });
  }

  res.set("Cache-Control", "no-store");

  res.json({
    authenticated: true,
    userId: req.session.userId,
    phone: req.session.phone
  });
});

// Signup.
app.post("/api/signup", async (req, res) => {
  try {
    const phone = String(req.body.phone || "").trim();
    const password = String(req.body.password || "");

    if (!phone || !password) {
      return res.status(400).json({
        error: "Phone number and password are required."
      });
    }

    if (phone.length > 30 || password.length > 128) {
      return res.status(400).json({
        error: "The submitted details are invalid."
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        error: "Password must contain at least 8 characters."
      });
    }

    const userId = getUserDocumentId(phone);
    const userRef = db.collection("users").doc(userId);

    const existingUser = await userRef.get();

    if (existingUser.exists) {
      return res.status(409).json({
        error: "An account with this phone number already exists."
      });
    }

    await userRef.create({
      phone,
      passwordHash: hashPassword(password),
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    res.status(201).json({
      success: true,
      message: "Account created successfully."
    });
  } catch (error) {
    console.error("Signup error:", error);

    res.status(500).json({
      error: "Unable to create the account."
    });
  }
});

// Login.
app.post("/api/login", async (req, res) => {
  try {
    const phone = String(req.body.phone || "").trim();
    const password = String(req.body.password || "");

    if (!phone || !password) {
      return res.status(400).json({
        error: "Phone number and password are required."
      });
    }

    const userId = getUserDocumentId(phone);

    const userRef = db.collection("users").doc(userId);
    const userSnap = await userRef.get();

    if (!userSnap.exists) {
      return res.status(401).json({
        error: "Incorrect phone number or password."
      });
    }

    const userData = userSnap.data();

    const submittedHash = hashPassword(password);

    const storedHash = String(userData.passwordHash || "");

    const hashesMatch =
      /^[a-f0-9]{64}$/i.test(storedHash) &&
      crypto.timingSafeEqual(
        Buffer.from(submittedHash, "hex"),
        Buffer.from(storedHash, "hex")
      );

    if (!hashesMatch) {
      return res.status(401).json({
        error: "Incorrect phone number or password."
      });
    }

    // Create a fresh session after verifying credentials.
    req.session.regenerate((error) => {
      if (error) {
        console.error("Session error:", error);

        return res.status(500).json({
          error: "Unable to create a login session."
        });
      }

      req.session.userId = userId;
      req.session.phone = userData.phone;

      req.session.save((saveError) => {
        if (saveError) {
          console.error("Session save error:", saveError);

          return res.status(500).json({
            error: "Unable to save your login session."
          });
        }

        res.set("Cache-Control", "no-store");

        res.json({
          success: true,
          message: "Login successful."
        });
      });
    });
  } catch (error) {
    console.error("Login error:", error);

    res.status(500).json({
      error: "Unable to process login."
    });
  }
});

// Protected dashboard: never expose this file through public static hosting.
// Protected landing page.
app.get("/dashboard", requireLogin, (req, res) => {
  res.set("Cache-Control", "no-store");

  res.sendFile(
    path.join(__dirname, "protected", "landing.html")
  );
});

// Serve other protected HTML pages.
app.get("/protected/:page", requireLogin, (req, res) => {
  const allowedPages = [
    "ai.html",
    "bitcoin-income.html",
    "chats.html",
    "crypto_payment_confirmation.html",
    "history.html",
    "payment_form_spinner_fixed.html",
    "raffle.html",
  "reffral.html",
  "user-account.html",
  "signup-login.html"
  ];

  const page = req.params.page;

  if (!allowedPages.includes(page)) {
    return res.status(404).send("Page not found");
  }

  res.set("Cache-Control", "no-store");

  res.sendFile(
    path.join(__dirname, "protected", page)
  );
});

// Logout.
app.post("/api/logout", (req, res) => {
  req.session.destroy((error) => {
    if (error) {
      return res.status(500).json({
        error: "Unable to log out."
      });
    }

    res.clearCookie("site.sid", {
      httpOnly: true,
      secure: true,
      sameSite: "lax"
    });

    res.json({ success: true });
  });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server listening on port ${PORT}`);
});