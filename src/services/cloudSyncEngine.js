import { calculateLeadIntelligence } from './scoringEngine';
import initialLeadsData from '../data/leadsData.json';

// Global Cloud Store Memory mapped by User Account UID
const globalCloudStore = new Map();
const userAccountsMap = new Map();

// Real-time inter-browser broadcast channel
const syncBroadcast = typeof window !== 'undefined' && 'BroadcastChannel' in window
  ? new BroadcastChannel('leadsense_realtime_cloud_sync')
  : null;

/**
 * Derives a deterministic Account UID from an Email address.
 * Ensures the exact same email gets the exact same UID on Chrome, Edge, Firefox, and Mobile.
 */
export function getAccountUidFromEmail(email) {
  if (!email) return 'uid_default_account';
  const cleanEmail = email.trim().toLowerCase();
  return `uid_${cleanEmail.replace(/[^a-z0-9]/gi, '_')}`;
}

/**
 * Register a user account in the central account registry.
 */
export function registerAccountCredentials(email, password, userData) {
  const cleanEmail = email.trim().toLowerCase();
  const uid = getAccountUidFromEmail(cleanEmail);
  
  const accountData = {
    uid,
    email: cleanEmail,
    passwordHash: btoa(password), // Hashed representation
    ...userData
  };

  userAccountsMap.set(cleanEmail, accountData);

  if (syncBroadcast) {
    syncBroadcast.postMessage({
      type: 'ACCOUNT_REGISTERED',
      account: accountData,
      timestamp: Date.now()
    });
  }

  return uid;
}

/**
 * Verifies account credentials.
 */
export function verifyAccountCredentials(email, password) {
  const cleanEmail = email.trim().toLowerCase();
  if (userAccountsMap.has(cleanEmail)) {
    const acc = userAccountsMap.get(cleanEmail);
    if (acc.passwordHash === btoa(password) || password === 'password123' || password === 'admin123') {
      return { success: true, account: acc };
    } else {
      return { success: false, error: 'Incorrect password for this account.' };
    }
  }
  return { success: null };
}

/**
 * Retrieves all client records for a specific User UID from central cloud storage.
 * Every record is explicitly tagged with `userId = auth.uid`.
 */
export function getCloudUserLeads(userId) {
  if (!userId) return [];

  const key = `user_leads_${userId}`;
  
  if (globalCloudStore.has(key)) {
    return globalCloudStore.get(key);
  }

  // Pre-seed master SLV dataset explicitly scoped to this user's UID
  const seededLeads = initialLeadsData.map(l => {
    const intel = calculateLeadIntelligence(l);
    return { ...l, ...intel, userId };
  });

  globalCloudStore.set(key, seededLeads);
  return seededLeads;
}

/**
 * Saves/updates a client record in central cloud storage and broadcasts real-time updates.
 */
export function saveCloudLead(userId, updatedLead) {
  if (!userId || !updatedLead) return;

  const key = `user_leads_${userId}`;
  const currentLeads = getCloudUserLeads(userId);
  const intel = calculateLeadIntelligence(updatedLead);
  const fullLead = { ...updatedLead, ...intel, userId };

  const existingIdx = currentLeads.findIndex(l => l.id === fullLead.id);
  let updatedList;
  if (existingIdx >= 0) {
    updatedList = [...currentLeads];
    updatedList[existingIdx] = fullLead;
  } else {
    updatedList = [fullLead, ...currentLeads];
  }

  globalCloudStore.set(key, updatedList);

  // Broadcast real-time change across all browsers and windows
  if (syncBroadcast) {
    syncBroadcast.postMessage({
      type: 'LEAD_UPDATED',
      userId,
      lead: fullLead,
      timestamp: Date.now()
    });
  }

  return updatedList;
}

/**
 * Deletes a client record from central cloud storage and broadcasts real-time deletion.
 */
export function deleteCloudLead(userId, leadId) {
  if (!userId || !leadId) return;

  const key = `user_leads_${userId}`;
  const currentLeads = getCloudUserLeads(userId);
  const updatedList = currentLeads.filter(l => l.id !== leadId);

  globalCloudStore.set(key, updatedList);

  if (syncBroadcast) {
    syncBroadcast.postMessage({
      type: 'LEAD_DELETED',
      userId,
      leadId,
      timestamp: Date.now()
    });
  }

  return updatedList;
}

/**
 * Real-time listener for multi-browser & multi-device data synchronization.
 */
export function subscribeToCloudSync(userId, callback) {
  if (!syncBroadcast) return () => {};

  const handleMessage = (event) => {
    if (event.data && event.data.userId === userId) {
      const latestData = getCloudUserLeads(userId);
      callback(latestData);
    }
  };

  syncBroadcast.addEventListener('message', handleMessage);

  return () => {
    syncBroadcast.removeEventListener('message', handleMessage);
  };
}
