// ================================================
// Firebase Configuration — NeoFair Salon
// ================================================
// Replace the placeholder values below with your
// actual Firebase project credentials from:
// https://console.firebase.google.com
// → Your Project → Project Settings → Your Apps → SDK setup
// ================================================

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc, updateDoc, setDoc, query, orderBy, serverTimestamp } from 'firebase/firestore';
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
 * @param {{ fullName: string, phoneNumber: string, dateOfBirth: string, gender: string, membershipId: string, registrationDate: string }} memberData
 * @returns {Promise<string>} The new document ID or fallback ID
 */
export async function saveMember(memberData) {
  const localId = saveToLocalStorage(memberData);

  try {
    const docRef = await addDoc(collection(db, 'members'), {
      ...memberData,
      joinedAt: serverTimestamp(),
      membershipTier: memberData.membershipTier || 'Neon',
      status: memberData.status || 'active',
    });
    return docRef.id;
  } catch (err) {
    return localId;
  }
}

function saveToLocalStorage(memberData) {
  try {
    const existing = JSON.parse(localStorage.getItem('neofair_members') || '[]');
    const newMember = {
      id: memberData.id || 'mem_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      ...memberData,
      joinedAt: memberData.registrationDate || new Date().toISOString(),
      membershipTier: memberData.membershipTier || 'Neon',
      status: memberData.status || 'active',
    };
    existing.push(newMember);
    localStorage.setItem('neofair_members', JSON.stringify(existing));
    return newMember.id;
  } catch (e) {
    return 'mem_' + Date.now();
  }
}

/**
 * Fetch all registered members from Firestore and LocalStorage fallback
 * @returns {Promise<Array<Object>>} Merged array of member records
 */
export async function getMembers() {
  const memberMap = new Map();

  // 1. Fetch from LocalStorage
  try {
    const local = JSON.parse(localStorage.getItem('neofair_members') || '[]');
    local.forEach(item => {
      const key = item.membershipId || item.id || item.phoneNumber;
      if (key) memberMap.set(key, item);
    });
  } catch (e) {}

  // 2. Fetch from Firestore (if accessible)
  try {
    const q = query(collection(db, 'members'), orderBy('joinedAt', 'desc'));
    const snapshot = await getDocs(q);
    snapshot.forEach(docSnap => {
      const data = docSnap.data();
      const item = {
        id: docSnap.id,
        fullName: data.fullName || data.name || 'Anonymous',
        phoneNumber: data.phoneNumber || data.phone || 'N/A',
        dateOfBirth: data.dateOfBirth || data.dob || 'N/A',
        gender: data.gender || 'Not specified',
        membershipId: data.membershipId || `NEON-${docSnap.id.slice(0, 6)}`,
        registrationDate: data.registrationDate || (data.joinedAt?.toDate ? data.joinedAt.toDate().toISOString() : new Date().toISOString()),
        membershipTier: data.membershipTier || 'Neon',
        status: data.status || 'active',
      };
      const key = item.membershipId || item.id || item.phoneNumber;
      memberMap.set(key, item);
    });
  } catch (e) {
    // Firestore rules or offline fallback
  }

  // Convert map to array
  const membersList = Array.from(memberMap.values());

  // Sort descending by registration date
  return membersList.sort((a, b) => {
    const dateA = new Date(a.registrationDate || a.joinedAt || 0);
    const dateB = new Date(b.registrationDate || b.joinedAt || 0);
    return dateB - dateA;
  });
}

/**
 * Update member record in Firestore and LocalStorage
 * @param {string} memberId Document ID or MembershipId
 * @param {Object} updatedFields Fields to update
 */
export async function updateMember(memberId, updatedFields) {
  // Update LocalStorage
  try {
    const local = JSON.parse(localStorage.getItem('neofair_members') || '[]');
    const updated = local.map(m => {
      if (m.id === memberId || m.membershipId === memberId) {
        return { ...m, ...updatedFields };
      }
      return m;
    });
    localStorage.setItem('neofair_members', JSON.stringify(updated));
  } catch (e) {}

  // Update Firestore
  try {
    const docRef = doc(db, 'members', memberId);
    await updateDoc(docRef, updatedFields);
  } catch (e) {
    // Fallback try setDoc with merge if doc does not exist
    try {
      const docRef = doc(db, 'members', memberId);
      await setDoc(docRef, updatedFields, { merge: true });
    } catch (err) {}
  }
}

/**
 * Delete member record by ID or MembershipId
 * @param {string} memberId 
 */
export async function deleteMember(memberId) {
  // Delete from localStorage
  try {
    const local = JSON.parse(localStorage.getItem('neofair_members') || '[]');
    const filtered = local.filter(m => m.id !== memberId && m.membershipId !== memberId);
    localStorage.setItem('neofair_members', JSON.stringify(filtered));
  } catch (e) {}

  // Delete from Firestore
  try {
    await deleteDoc(doc(db, 'members', memberId));
  } catch (e) {}
}

/**
 * Delete all stored members (Admin function)
 */
export async function clearAllMembers() {
  localStorage.setItem('neofair_members', JSON.stringify([]));
  // Note: Firestore bulk delete is restricted client-side for safety
}


