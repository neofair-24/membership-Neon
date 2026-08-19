// ================================================================
// Neofair Security Architecture — Web Crypto API Encrypter & Hasher
// Uses native window.crypto.subtle for enterprise-grade security
// ================================================================

// Default security salt (used for key derivation)
export const DEFAULT_SALT = "neofair_salon_admin_salt_v2026_secure";

// Default pre-computed PBKDF2 hash for initial master credentials (100,000 iterations)
// Source code on GitHub ONLY stores cryptographically derived one-way hashes.
// Plain-text passwords NEVER exist in the source code.
export const DEFAULT_ID_HASH   = "9910100c1c3a060abf3976f0312ded42923d4c5a09f99f9d3098c41780f22c79";
export const DEFAULT_PASS_HASH = "aa450b491339a1bcbe7a45522a838e0389291b9fd42e0a3db46092e2956dca4e";

/**
 * Derives a hex string hash from a password using PBKDF2-HMAC-SHA256 with 100,000 iterations
 * @param {string} password 
 * @param {string} salt 
 * @returns {Promise<string>} Hex representation of derived key
 */
export async function hashPassword(password, salt = DEFAULT_SALT) {
  const encoder = new TextEncoder();
  const passwordBuffer = encoder.encode(password);
  const saltBuffer = encoder.encode(salt);

  // Import raw password as key material
  const baseKey = await window.crypto.subtle.importKey(
    'raw',
    passwordBuffer,
    { name: 'PBKDF2' },
    false,
    ['deriveBits', 'deriveKey']
  );

  // Derive bits using PBKDF2
  const derivedBits = await window.crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: saltBuffer,
      iterations: 100000,
      hash: 'SHA-256'
    },
    baseKey,
    256 // 256 bits
  );

  // Convert ArrayBuffer to Hex String
  const byteArray = new Uint8Array(derivedBits);
  return Array.from(byteArray)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Constant-time password verification helper
 * @param {string} password Input password
 * @param {string} storedHash Correct hex hash
 * @param {string} salt Salt used
 * @returns {Promise<boolean>} True if match
 */
export async function verifyPassword(password, storedHash, salt = DEFAULT_SALT) {
  if (!password || !storedHash) return false;
  const computedHash = await hashPassword(password, salt);
  return timingSafeEqual(computedHash, storedHash);
}

/**
 * Timing-safe string equality comparison
 */
function timingSafeEqual(a, b) {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

/**
 * Generates a cryptographically secure random session token (256-bit hex)
 * @returns {string} Hex token
 */
export function generateSessionToken() {
  const bytes = new Uint8Array(32); // 256 bits
  window.crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * AES-256-GCM Encryption for sensitive data backups
 * @param {string} plainText Data to encrypt (e.g. JSON string)
 * @param {string} secretKey Password or key
 * @returns {Promise<{ iv: string, cipherText: string }>} Encrypted payload
 */
export async function encryptData(plainText, secretKey) {
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(plainText);
  const saltBuffer = encoder.encode(DEFAULT_SALT);

  const baseKey = await window.crypto.subtle.importKey(
    'raw',
    encoder.encode(secretKey),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );

  const aesKey = await window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: saltBuffer,
      iterations: 100000,
      hash: 'SHA-256'
    },
    baseKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt']
  );

  const iv = window.crypto.getRandomValues(new Uint8Array(12)); // 96-bit IV
  const encryptedBuffer = await window.crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    aesKey,
    dataBuffer
  );

  return {
    iv: Array.from(iv).map(b => b.toString(16).padStart(2, '0')).join(''),
    cipherText: Array.from(new Uint8Array(encryptedBuffer)).map(b => b.toString(16).padStart(2, '0')).join('')
  };
}

/**
 * AES-256-GCM Decryption
 */
export async function decryptData(encryptedPayload, secretKey) {
  const encoder = new TextEncoder();
  const saltBuffer = encoder.encode(DEFAULT_SALT);

  const baseKey = await window.crypto.subtle.importKey(
    'raw',
    encoder.encode(secretKey),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );

  const aesKey = await window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: saltBuffer,
      iterations: 100000,
      hash: 'SHA-256'
    },
    baseKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['decrypt']
  );

  const iv = new Uint8Array(encryptedPayload.iv.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));
  const cipherText = new Uint8Array(encryptedPayload.cipherText.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));

  const decryptedBuffer = await window.crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    aesKey,
    cipherText
  );

  return new TextDecoder().decode(decryptedBuffer);
}
