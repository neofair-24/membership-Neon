// ================================================
// Firebase Configuration — NeoFair Salon
// ================================================
// Replace the placeholder values below with your
// actual Firebase project credentials from:
// https://console.firebase.google.com
// → Your Project → Project Settings → Your Apps → SDK setup
// ================================================

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { getAnalytics, isSupported } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: "AIzaSyAS5G0eEgOAVZHPKdCdiDDHbXbqivwQYnE",
  authDomain: "neofair-2a98a.firebaseapp.com",
  projectId: "neofair-2a98a",
  storageBucket: "neofair-2a98a.firebasestorage.app",
  messagingSenderId: "938135710519",
  appId: "1:938135710519:web:13f022bafe26e0fd7b08b2",
  measurementId: "G-TLYHMKCSHH"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);

// Initialize Analytics safely in supported environments
export let analytics = null;
isSupported().then((supported) => {
  if (supported) {
    analytics = getAnalytics(app);
  }
}).catch(() => {});

/**
 * Save a new member to Firestore "members" collection with local storage fallback
 * @param {{ name: string, phone: string, dob: string, dobFormatted: string, gender: string }} memberData
 * @returns {Promise<string>} The new document ID or fallback ID
 */
export async function saveMember(memberData) {
  // Always store in localStorage as guaranteed persistence
  saveToLocalStorage(memberData);

  try {
    const docRef = await addDoc(collection(db, 'members'), {
      ...memberData,
      joinedAt: serverTimestamp(),
      membershipTier: 'Neon Silver',   // Default tier on join
      status: 'active',
    });
    return docRef.id;
  } catch (err) {
    return 'local_' + Date.now();
  }
}

function saveToLocalStorage(memberData) {
  try {
    const existing = JSON.parse(localStorage.getItem('neofair_members') || '[]');
    existing.push({
      id: 'mem_' + Date.now(),
      ...memberData,
      joinedAt: new Date().toISOString(),
      membershipTier: 'Neon Silver',
      status: 'active',
    });
    localStorage.setItem('neofair_members', JSON.stringify(existing));
  } catch (e) {
    // Silent catch — zero console logging
  }
}
