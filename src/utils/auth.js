// ================================================================
// NeoFair Security Architecture — Admin Authentication Manager
// Controls login verification, session tokens, brute-force protection
// GitHub Security: Plaintext credentials do NOT exist in repository code!
// ================================================================

import { hashPassword, verifyPassword, generateSessionToken, DEFAULT_SALT, DEFAULT_PASS_HASH, DEFAULT_ID_HASH } from './crypto.js';

const STORAGE_ID_KEY      = 'neofair_admin_id';
const STORAGE_HASH_KEY    = 'neofair_admin_sec_hash';
const STORAGE_SALT_KEY    = 'neofair_admin_sec_salt';
const SESSION_TOKEN_KEY   = 'neofair_admin_session';
const SESSION_EXPIRY_KEY  = 'neofair_admin_expires';
const LOCKOUT_KEY         = 'neofair_admin_lockout';
const ATTEMPTS_KEY        = 'neofair_admin_attempts';

export const MAX_ATTEMPTS = 15;
const LOCKOUT_TIME_MS = 5 * 60 * 1000;  // 5 minutes lockout
const SESSION_TTL_MS = 15 * 60 * 1000; // 15 minutes session duration

/**
 * Returns stored admin ID (or default placeholder)
 */
export function getStoredAdminId() {
  return localStorage.getItem(STORAGE_ID_KEY) || 'admin';
}

/**
 * Returns stored password hash (or initial default hash)
 */
async function getStoredHash() {
  const customHash = localStorage.getItem(STORAGE_HASH_KEY);
  const customSalt = localStorage.getItem(STORAGE_SALT_KEY) || DEFAULT_SALT;

  if (customHash) {
    return { hash: customHash, salt: customSalt };
  }

  // Pre-computed PBKDF2 hash (100,000 iterations)
  return { hash: DEFAULT_PASS_HASH, salt: DEFAULT_SALT };
}

/**
 * Check if the login is currently locked due to too many failed attempts
 * @returns {{ isLocked: boolean, secondsRemaining: number }}
 */
export function checkLockoutStatus() {
  const lockoutUntil = parseInt(localStorage.getItem(LOCKOUT_KEY) || '0', 10);
  const now = Date.now();

  if (lockoutUntil > now) {
    const secondsRemaining = Math.ceil((lockoutUntil - now) / 1000);
    return { isLocked: true, secondsRemaining };
  }

  // Clear expired lockout
  if (lockoutUntil > 0 && lockoutUntil <= now) {
    localStorage.removeItem(LOCKOUT_KEY);
    localStorage.setItem(ATTEMPTS_KEY, '0');
  }

  return { isLocked: false, secondsRemaining: 0 };
}

/**
 * Get remaining login attempts before lockout
 */
export function getRemainingAttempts() {
  const attempts = parseInt(localStorage.getItem(ATTEMPTS_KEY) || '0', 10);
  return Math.max(0, MAX_ATTEMPTS - attempts);
}

/**
 * Perform Admin Login with encrypted ID & password verification
 * @param {string} adminId 
 * @param {string} password 
 * @returns {Promise<{ success: boolean, message: string, remainingAttempts?: number, lockoutSeconds?: number }>}
 */
export async function loginAdmin(adminId, password) {
  // 1. Check lockout status
  const lockout = checkLockoutStatus();
  if (lockout.isLocked) {
    return {
      success: false,
      message: `System locked due to security policy. Please wait ${lockout.secondsRemaining} seconds.`,
      lockoutSeconds: lockout.secondsRemaining
    };
  }

  // 2. Validate Admin ID via PBKDF2 hash verification
  let isIdValid = false;
  const customId = localStorage.getItem(STORAGE_ID_KEY);

  if (customId) {
    isIdValid = (adminId || '').trim().toLowerCase() === customId.toLowerCase();
  } else {
    // Verify against initial pre-computed PBKDF2 ID hash
    const inputIdHash = await hashPassword((adminId || '').trim().toLowerCase(), DEFAULT_SALT);
    isIdValid = inputIdHash === DEFAULT_ID_HASH;
  }

  // 3. Fetch stored hash & salt for password verification
  const { hash, salt } = await getStoredHash();
  const isPassValid = await verifyPassword(password, hash, salt);

  if (isIdValid && isPassValid) {
    // Reset failed attempts
    localStorage.setItem(ATTEMPTS_KEY, '0');
    localStorage.removeItem(LOCKOUT_KEY);

    // Create session token
    const token = generateSessionToken();
    const expiresAt = Date.now() + SESSION_TTL_MS;

    sessionStorage.setItem(SESSION_TOKEN_KEY, token);
    sessionStorage.setItem(SESSION_EXPIRY_KEY, expiresAt.toString());

    return { success: true, message: 'Authentication successful.' };
  }

  // 4. Failed attempt logic
  let attempts = parseInt(localStorage.getItem(ATTEMPTS_KEY) || '0', 10) + 1;
  localStorage.setItem(ATTEMPTS_KEY, attempts.toString());

  if (attempts >= MAX_ATTEMPTS) {
    const lockoutUntil = Date.now() + LOCKOUT_TIME_MS;
    localStorage.setItem(LOCKOUT_KEY, lockoutUntil.toString());
    return {
      success: false,
      message: 'Too many incorrect attempts! Access locked for 5 minutes.',
      lockoutSeconds: 300
    };
  }

  const remaining = MAX_ATTEMPTS - attempts;
  return {
    success: false,
    message: `Invalid Admin ID or Password. ${remaining} attempt${remaining === 1 ? '' : 's'} remaining.`,
    remainingAttempts: remaining
  };
}

/**
 * Check if admin is currently authenticated with a valid unexpired session
 * @returns {boolean}
 */
export function isAdminAuthenticated() {
  const token = sessionStorage.getItem(SESSION_TOKEN_KEY);
  const expiresAt = parseInt(sessionStorage.getItem(SESSION_EXPIRY_KEY) || '0', 10);

  if (!token || Date.now() > expiresAt) {
    logoutAdmin();
    return false;
  }

  // Refresh expiration on activity
  sessionStorage.setItem(SESSION_EXPIRY_KEY, (Date.now() + SESSION_TTL_MS).toString());
  return true;
}

/**
 * Logout admin and clear session tokens
 */
export function logoutAdmin() {
  sessionStorage.removeItem(SESSION_TOKEN_KEY);
  sessionStorage.removeItem(SESSION_EXPIRY_KEY);
}

/**
 * Change admin credentials (Admin ID & Password)
 * @param {string} currentPassword 
 * @param {string} newAdminId 
 * @param {string} newPassword 
 * @returns {Promise<{ success: boolean, message: string }>}
 */
export async function changeAdminCredentials(currentPassword, newAdminId, newPassword) {
  if (!isAdminAuthenticated()) {
    return { success: false, message: 'Session expired. Please log in again.' };
  }

  const { hash, salt } = await getStoredHash();
  const isValid = await verifyPassword(currentPassword, hash, salt);

  if (!isValid) {
    return { success: false, message: 'Current password is incorrect.' };
  }

  if (newPassword && newPassword.length < 6) {
    return { success: false, message: 'New password must be at least 6 characters long.' };
  }

  if (newAdminId && newAdminId.trim().length > 0) {
    localStorage.setItem(STORAGE_ID_KEY, newAdminId.trim());
  }

  if (newPassword && newPassword.trim().length >= 6) {
    const newSalt = `neofair_salt_${Date.now()}_${Math.random().toString(36).substring(2)}`;
    const newHash = await hashPassword(newPassword, newSalt);

    localStorage.setItem(STORAGE_HASH_KEY, newHash);
    localStorage.setItem(STORAGE_SALT_KEY, newSalt);
  }

  return { success: true, message: 'Admin security settings updated successfully!' };
}
