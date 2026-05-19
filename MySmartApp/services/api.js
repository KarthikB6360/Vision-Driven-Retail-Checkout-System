// ==================================================
// AUTO DETECT BACKEND URL (AUTH + ML)
// ==================================================

// AUTH BACKEND (backend/app.py → port 5000)
let AUTH_LOCALHOST = "http://127.0.0.1:5000";
let AUTH_WIFI_IP = "http://172.20.254.39:5000"; // Change to your laptop IP

// ML BACKEND (backend/api/app.py → port 5001)
let ML_LOCALHOST = "http://127.0.0.1:5001";
let ML_WIFI_IP = "http://172.20.254.39:5001"; // Change to your laptop IP

// FINAL URLs USED BY APP
export const AUTH_BASE = __DEV__ ? AUTH_WIFI_IP : AUTH_LOCALHOST;
export const ML_BASE = __DEV__ ? ML_WIFI_IP : ML_LOCALHOST;

// ==================================================
// SAFE FETCH (JSON)
// ==================================================
async function safeFetch(url, options = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000); // 8 sec timeout

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeout);

    const json = await response.json().catch(() => null);

    return json || { status: "error", message: "Invalid server response" };
  } catch (err) {
    clearTimeout(timeout);

    if (err.name === "AbortError") {
      return { status: "error", message: "Request timed out" };
    }

    return { status: "error", message: "Server unreachable" };
  }
}

// ==================================================
// SAFE UPLOAD (FORM DATA → ML PREDICTION)
// ==================================================
async function safeUpload(url, formData) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);

  try {
    const response = await fetch(url, {
      method: "POST",
      body: formData,
      signal: controller.signal,
    });

    clearTimeout(timeout);

    const json = await response.json().catch(() => null);
    return json || { status: "error", message: "Invalid ML server response" };
  } catch (err) {
    clearTimeout(timeout);

    if (err.name === "AbortError") {
      return { status: "error", message: "Upload timed out" };
    }

    return { status: "error", message: "ML server unreachable" };
  }
}

// ==================================================
// AUTH API FUNCTIONS (PORT 5000)
// ==================================================

// SIGNUP
export async function signup(name, email, password) {
  return safeFetch(`${AUTH_BASE}/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password }),
  });
}

// LOGIN
export async function login(email, password) {
  return safeFetch(`${AUTH_BASE}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
}

// RESET PASSWORD
export async function resetPassword(email, newPassword) {
  return safeFetch(`${AUTH_BASE}/reset-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, newPassword }),
  });
}

// UPDATE PROFILE
export async function updateProfile(email, new_name, new_email) {
  return safeFetch(`${AUTH_BASE}/update-profile`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, new_name, new_email }),
  });
}

// USERS COUNT (ADMIN)
export async function getUsersCount() {
  return safeFetch(`${AUTH_BASE}/users-count`);
}

// ==================================================
// FIXED VERSION — ALL USERS (ADMIN)
// Prevents redirect to Login
// ALWAYS returns an array
// Supports backend in any format
// ==================================================
export async function getAllUsers() {
  const res = await safeFetch(`${AUTH_BASE}/users`);

  console.log("📌 getAllUsers API response:", res);

  // CASE 1: backend returns pure array
  if (Array.isArray(res)) return res;

  // CASE 2: backend returns { status: 'success', users: [...] }
  if (res?.users && Array.isArray(res.users)) return res.users;

  // CASE 3: unauthorized / invalid / error → do NOT redirect
  return [];
}

// ==================================================
// ML PREDICTION API FUNCTIONS (PORT 5001)
// ==================================================

// 1️⃣ SCAN PRODUCT (send image → YOLO)
export async function scanProduct(imageUri) {
  let formData = new FormData();

  formData.append("image", {
    uri: imageUri,
    name: "scan.jpg",
    type: "image/jpeg",
  });

  return safeUpload(`${ML_BASE}/predict`, formData);
}

// 2️⃣ GET PRODUCT CATALOG
export async function getCatalog() {
  return safeFetch(`${ML_BASE}/catalog`);
}

// 3️⃣ GET BARCODE IMAGE URL
export function barcodeImageURL(productId) {
  return `${ML_BASE}/barcode/${productId}`;
}
