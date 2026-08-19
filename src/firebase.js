// ================================================
// Firebase Configuration — NeoFair Salon
// Cloud Firestore Real-Time Database Manager
// ================================================

import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
  setDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp
} from 'firebase/firestore';
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

// ─── Internal log helper (silenced in production via anti-inspector) ───
function _log(...args) {
  try { (window.__nfLog || Function.prototype)(...args); } catch (_) {}
}

/**
 * Save a new member to Firestore "members" collection with local storage sync
 */
export async function saveMember(memberData) {
  try {
    const docRef = await addDoc(collection(db, 'members'), {
      ...memberData,
      joinedAt: serverTimestamp(),
      membershipTier: memberData.membershipTier || 'Neon',
      status: memberData.status || 'active',
    });
    saveToLocalStorage({ ...memberData, id: docRef.id, firestoreId: docRef.id });
    return docRef.id;
  } catch (err) {
    _log('saveMember error', err);
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
 */
export async function getMembers() {
  const memberMap = new Map();

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
      memberMap.set(docSnap.id, item);
    });
    localStorage.setItem('neofair_members', JSON.stringify(Array.from(memberMap.values())));
  } catch (e) {
    _log('getMembers Firestore error, falling back to localStorage', e);
    try {
      const local = JSON.parse(localStorage.getItem('neofair_members') || '[]');
      local.forEach(item => {
        const key = item.firestoreId || item.id || item.membershipId || item.phoneNumber;
        if (key) memberMap.set(key, item);
      });
    } catch (err) {}
  }

  return Array.from(memberMap.values()).sort((a, b) => {
    return new Date(b.registrationDate || b.joinedAt || 0) - new Date(a.registrationDate || a.joinedAt || 0);
  });
}

/**
 * Update member record in Firestore and LocalStorage
 */
export async function updateMember(memberId, updatedFields) {
  // Update LocalStorage first
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

  // Update Firestore — memberId here is the Firestore doc ID
  try {
    await updateDoc(doc(db, 'members', memberId), updatedFields);
  } catch (e) {
    _log('updateMember error', e);
    try {
      await setDoc(doc(db, 'members', memberId), updatedFields, { merge: true });
    } catch (err) {}
  }
}

/**
 * ✅ FIXED: Delete member record from Cloud Firestore by Firestore Document ID
 * Accepts either a member object { id, firestoreId, membershipId, phoneNumber }
 * or a plain string (Firestore doc ID)
 */
export async function deleteMember(target) {
  if (!target) return;

  // Resolve the Firestore document ID
  const firestoreDocId = typeof target === 'object'
    ? (target.firestoreId || target.id)
    : target;

  const membershipId = typeof target === 'object' ? target.membershipId : null;
  const phoneNumber  = typeof target === 'object' ? target.phoneNumber : null;

  let deletedFromFirestore = false;

  // STEP 1: Try direct doc delete by Firestore document ID (fastest & most reliable)
  if (firestoreDocId && !firestoreDocId.startsWith('mem_')) {
    try {
      await deleteDoc(doc(db, 'members', firestoreDocId));
      _log('✅ Deleted from Firestore by docId:', firestoreDocId);
      deletedFromFirestore = true;
    } catch (err) {
      _log('⚠️ Direct deleteDoc failed:', err.code, err.message);
    }
  }

  // STEP 2: Fallback — query by membershipId if direct delete failed
  if (!deletedFromFirestore && membershipId) {
    try {
      const q = query(collection(db, 'members'), where('membershipId', '==', membershipId));
      const snap = await getDocs(q);
      for (const d of snap.docs) {
        await deleteDoc(d.ref);
        _log('✅ Deleted from Firestore by membershipId:', membershipId, 'docId:', d.id);
        deletedFromFirestore = true;
      }
    } catch (err) {
      _log('⚠️ Delete by membershipId failed:', err.code, err.message);
    }
  }

  // STEP 3: Fallback — query by phoneNumber if still not deleted
  if (!deletedFromFirestore && phoneNumber && /^[6-9]\d{9}$/.test(phoneNumber)) {
    try {
      const q = query(collection(db, 'members'), where('phoneNumber', '==', phoneNumber));
      const snap = await getDocs(q);
      for (const d of snap.docs) {
        await deleteDoc(d.ref);
        _log('✅ Deleted from Firestore by phoneNumber:', phoneNumber, 'docId:', d.id);
        deletedFromFirestore = true;
      }
    } catch (err) {
      _log('⚠️ Delete by phoneNumber failed:', err.code, err.message);
    }
  }

  if (!deletedFromFirestore) {
    _log('❌ Could not delete from Firestore. target was:', target);
  }

  // STEP 4: Always remove from LocalStorage regardless
  try {
    const local = JSON.parse(localStorage.getItem('neofair_members') || '[]');
    const filtered = local.filter(m =>
      m.id !== firestoreDocId &&
      m.firestoreId !== firestoreDocId &&
      (membershipId ? m.membershipId !== membershipId : true) &&
      (phoneNumber ? m.phoneNumber !== phoneNumber : true)
    );
    localStorage.setItem('neofair_members', JSON.stringify(filtered));
  } catch (e) {}

  return deletedFromFirestore;
}

/**
 * Delete multiple selected members from Cloud Firestore and LocalStorage
 */
export async function deleteMultipleMembers(targets) {
  if (!targets || !targets.length) return;
  const results = await Promise.allSettled(targets.map(t => deleteMember(t)));
  _log('deleteMultipleMembers results:', results);
}

/**
 * Check if a mobile phone number is already registered
 */
export async function isPhoneRegistered(phone) {
  const cleanPhone = (phone || '').trim();
  if (!cleanPhone) return false;

  // Check Firestore directly for most up-to-date result
  try {
    const q = query(collection(db, 'members'), where('phoneNumber', '==', cleanPhone));
    const snap = await getDocs(q);
    return !snap.empty;
  } catch (e) {
    // Fallback to local check
    const members = await getMembers();
    return members.some(m => (m.phoneNumber || '').trim() === cleanPhone);
  }
}

/**
 * Subscribe to real-time changes in Firestore "members" collection
 * Automatically updates admin view when changes occur in Firebase Console
 */
export function subscribeMembers(callback) {
  try {
    const q = query(collection(db, 'members'), orderBy('joinedAt', 'desc'));
    return onSnapshot(q, (snapshot) => {
      const members = [];
      snapshot.forEach(docSnap => {
        const data = docSnap.data();
        members.push({
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

      // Overwrite LocalStorage so Firebase Console deletions are reflected immediately
      try {
        localStorage.setItem('neofair_members', JSON.stringify(members));
      } catch (e) {}

      callback(members);
    }, (error) => {
      _log('subscribeMembers error:', error.code, error.message);
      getMembers().then(callback);
    });
  } catch (err) {
    _log('subscribeMembers init error:', err);
    return () => {};
  }
}

/**
 * Delete all stored members (Admin function)
 */
export async function clearAllMembers() {
  localStorage.setItem('neofair_members', JSON.stringify([]));
}
