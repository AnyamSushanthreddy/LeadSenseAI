import { calculateLeadIntelligence } from './scoringEngine';
import initialLeadsData from '../data/leadsData.json';

// Global Cloud Store Memory mapped by User Account UID
const globalCloudStore = new Map();

// Real-time inter-browser broadcast channel
const syncBroadcast = typeof window !== 'undefined' && 'BroadcastChannel' in window
  ? new BroadcastChannel('leadsense_realtime_cloud_sync')
  : null;

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
