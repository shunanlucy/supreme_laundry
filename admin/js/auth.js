/**
 * The Supreme Laundry — Admin Authentication & Security Handler
 * Simple, robust PIN/Password protection stored locally
 */

const DEFAULT_ADMIN_PIN = "9007";
const PIN_STORAGE_KEY = "tsl_admin_pin";
const AUTH_SESSION_KEY = "tsl_admin_logged_in";

function initAuth() {
    const isAuthed = sessionStorage.getItem(AUTH_SESSION_KEY) === "true";
    const overlay = document.getElementById("adminAuthOverlay");
    
    if (isAuthed) {
        if (overlay) overlay.style.display = "none";
    } else {
        if (overlay) overlay.style.display = "flex";
        const pinInput = document.getElementById("authPinInput");
        if (pinInput) {
            pinInput.value = "";
            pinInput.focus();
        }
    }
}

function verifyAdminPin() {
    const pinInput = document.getElementById("authPinInput");
    if (!pinInput) return;

    const enteredPin = pinInput.value.trim();
    const currentValidPin = localStorage.getItem(PIN_STORAGE_KEY) || DEFAULT_ADMIN_PIN;

    // Allow default PIN (9007), fallback (admin123), or custom configured PIN
    if (enteredPin === currentValidPin || enteredPin === "admin123" || enteredPin === "9007") {
        sessionStorage.setItem(AUTH_SESSION_KEY, "true");
        const overlay = document.getElementById("adminAuthOverlay");
        if (overlay) overlay.style.display = "none";
        // Refresh admin dashboard
        if (typeof renderAdminDashboard === "function") {
            renderAdminDashboard();
        }
    } else {
        alert("Invalid Admin PIN! Default PIN is 9007.");
        pinInput.value = "";
        pinInput.focus();
    }
}

function adminLogout() {
    sessionStorage.removeItem(AUTH_SESSION_KEY);
    window.location.reload();
}

function changeAdminPin(newPin) {
    if (!newPin || newPin.length < 4) {
        alert("PIN must be at least 4 digits.");
        return false;
    }
    localStorage.setItem(PIN_STORAGE_KEY, newPin);
    alert("Admin PIN updated successfully!");
    return true;
}

// Auto-bind enter key on pin input
document.addEventListener("DOMContentLoaded", () => {
    initAuth();
    const pinInput = document.getElementById("authPinInput");
    if (pinInput) {
        pinInput.addEventListener("keyup", (e) => {
            if (e.key === "Enter") verifyAdminPin();
        });
    }
});
