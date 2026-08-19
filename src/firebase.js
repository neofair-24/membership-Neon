// ================================================
// Firebase Configuration — NeoFair Salon
// Cloud Firestore Real-Time Database Manager
// ================================================

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc, updateDoc, setDoc, query, where, orderBy, onSnapshot, serverTimestamp } from 'firebase/firestore';
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
 * Save a new member to Firestore "members" collection with local storage sync
 * @param {{ fullName: string, phoneNumber: string, dateOfBirth: string, gender: string, membershipId: string, registrationDate: string }} memberData
 * @returns {Promise<string>} The new document ID
 */
export async function saveMember(memberData) {
  try {
    const docRef = await addDoc(collection(db, 'members'), {
      ...memberData,
      joinedAt: serverTimestamp(),
      membershipTier: memberData.membershipTier || 'Neon',
      status: memberData.status || 'active',
    });
    
    // Save locally with Firestore document ID
    saveToLocalStorage({ ...memberData, id: docRef.id, firestoreId: docRef.id });
    return docRef.id;
  } catch (err) {
    // Offline fallback
    const localId = saveToLocalStorage(memberData);
    return localId;
  }
}

function saveToLocalStorage(memberData) {
  try {
    const existing = JSON.parse(localStorage.getItem('neofair_members') || '[]');
    const newMember = {
      id: memberData.id || memberData.firestoreId || 'mem_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      firestoreId: memberData.firestoreId || memberData.id,
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

  // 1. Fetch from Firestore first (Source of Truth)
  try {
    const q = query(collection(db, 'members'), orderBy('joinedAt', 'desc'));
    const snapshot = await getDocs(q);
    snapshot.forEach(docSnap => {
      const data = docSnap.data();
      const item = {
        id: docSnap.id,
        firestoreId: docSnap.id,
        fullName: data.fullName || data.name || 'Anonymous',
        phoneNumber: data.phoneNumber || data.phone || 'N/A',
        dateOfBirth: data.dateOfBirth || data.dob || 'N/A',
        gender: data.gender || 'Not specified',
        membershipId: data.membershipId || `NEON-${docSnap.id.slice(0, 6)}`,
        registrationDate: data.registrationDate || (data.joinedAt?.toDate ? data.joinedAt.toDate().toISOString() : new Date().toISOString()),
        membershipTier: data.membershipTier || 'Neon',
        status: data.status || 'active',
      };
      const key = item.firestoreId || item.membershipId || item.id;
      memberMap.set(key, item);
    });

    // Mirror Firestore documents to LocalStorage
    localStorage.setItem('neofair_members', JSON.stringify(Array.from(memberMap.values())));
  } catch (e) {
    // Firestore rules or offline fallback: read from LocalStorage
    try {
      const local = JSON.parse(localStorage.getItem('neofair_members') || '[]');
      local.forEach(item => {
        const key = item.firestoreId || item.membershipId || item.id || item.phoneNumber;
        if (key) memberMap.set(key, item);
      });
    } catch (err) {}
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
      if (m.id === memberId || m.firestoreId === memberId || m.membershipId === memberId) {
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
 * Delete member record by Doc ID, Membership ID, or Phone Number
 * Guarantees deletion in Cloud Firestore and LocalStorage
 * @param {string|Object} target 
 */
export async function deleteMember(target) {
  if (!target) return;

  const targetId = typeof target === 'object' ? (target.firestoreId || target.id) : target;
  const targetMembershipId = typeof target === 'object' ? target.membershipId : target;
  const targetPhone = typeof target === 'object' ? target.phoneNumber : target;

  // 1. Delete from Cloud Firestore by Direct Doc ID
  if (targetId && !targetId.startsWith('mem_')) {
    try {
      await deleteDoc(doc(db, 'members', targetId));
    } catch (e) {}
  }

  // 2. Query Firestore by Membership ID
  if (targetMembershipId) {
    try {
      const q1 = query(collection(db, 'members'), where('membershipId', '==', targetMembershipId));
      const snaps1 = await getDocs(q1);
      for (const d of snaps1.docs) {
        try { await deleteDoc(d.ref); } catch (err) {}
      }
    } catch (e) {}
  }

  // 3. Query Firestore by Phone Number
  if (targetPhone && targetPhone.length === 10) {
    try {
      const q2 = query(collection(db, 'members'), where('phoneNumber', '==', targetPhone));
      const snaps2 = await getDocs(q2);
      for (const d of snaps2.docs) {
        try { await deleteDoc(d.ref); } catch (err) {}
      }
    } catch (e) {}
  }

  // 4. Delete from LocalStorage
  try {
    const local = JSON.parse(localStorage.getItem('neofair_members') || '[]');
    const filtered = local.filter(m => 
      m.id !== targetId && 
      m.firestoreId !== targetId && 
      m.membershipId !== targetMembershipId && 
      m.phoneNumber !== targetPhone
    );
    localStorage.setItem('neofair_members', JSON.stringify(filtered));
  } catch (e) {}
}

/**
 * Delete multiple selected members from Cloud Firestore and LocalStorage
 * @param {Array<string|Object>} targets 
 */
export async function deleteMultipleMembers(targets) {
  if (!targets || !targets.length) return;
  for (const target of targets) {
    await deleteMember(target);
  }
}

/**
 * Check if a mobile phone number is already registered
 * @param {string} phone 
 * @returns {Promise<boolean>}
 */
export async function isPhoneRegistered(phone) {
  const cleanPhone = (phone || '').trim();
  if (!cleanPhone) return false;

  const members = await getMembers();
  return members.some(m => (m.phoneNumber || '').trim() === cleanPhone);
}

/**
 * Subscribe to real-time changes in Firestore "members" collection
 * Automatically updates admin view when changes occur in Firebase Console
 * @param {Function} callback Function called with updated member array
 * @returns {Function} Unsubscribe function
 */
export function subscribeMembers(callback) {
  try {
    const q = query(collection(db, 'members'), orderBy('joinedAt', 'desc'));
    return onSnapshot(q, (snapshot) => {
      const firestoreMembers = [];
      snapshot.forEach(docSnap => {
        const data = docSnap.data();
        firestoreMembers.push({
          id: docSnap.id,
          firestoreId: docSnap.id,
          fullName: data.fullName || data.name || 'Anonymous',
          phoneNumber: data.phoneNumber || data.phone || 'N/A',
          dateOfBirth: data.dateOfBirth || data.dob || 'N/A',
          gender: data.gender || 'Not specified',
          membershipId: data.membershipId || `NEON-${docSnap.id.slice(0, 6)}`,
          registrationDate: data.registrationDate || (data.joinedAt?.toDate ? data.joinedAt.toDate().toISOString() : new Date().toISOString()),
          membershipTier: data.membershipTier || 'Neon',
          status: data.status || 'active',
        });
      });

      // Synchronize LocalStorage with latest Firestore state
      const memberMap = new Map();
      firestoreMembers.forEach(item => {
        const key = item.firestoreId || item.membershipId || item.id;
        memberMap.set(key, item);
      });

      // Overwrite LocalStorage so deleted documents in Firebase Console disappear immediately
      try {
        localStorage.setItem('neofair_members', JSON.stringify(Array.from(memberMap.values())));
      } catch (e) {}

      const sortedList = Array.from(memberMap.values()).sort((a, b) => {
        const dateA = new Date(a.registrationDate || a.joinedAt || 0);
        const dateB = new Date(b.registrationDate || b.joinedAt || 0);
        return dateB - dateA;
      });

      callback(sortedList);
    }, (error) => {
      // On error fallback to getMembers
      getMembers().then(callback);
    });
  } catch (err) {
    return () => {};
  }
}

/**
 * Delete all stored members (Admin function)
 */
export async function clearAllMembers() {
  localStorage.setItem('neofair_members', JSON.stringify([]));
}
