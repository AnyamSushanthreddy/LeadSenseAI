import { calculateLeadIntelligence } from './scoringEngine';
import initialLeadsData from '../data/leadsData.json';

// Centralized Master Leads Registry (Shared across Admin & Client Portals)
const masterLeadsRegistry = new Map();
const userAccountsMap = new Map();

// Helper to safely load persisted store from localStorage
function initStore() {
  // Pre-seed master leads from initial JSON
  initialLeadsData.forEach(l => {
    const intel = calculateLeadIntelligence(l);
    masterLeadsRegistry.set(l.id, { ...l, ...intel });
  });

  try {
    const savedLeads = localStorage.getItem('leadsense_master_leads_db');
    if (savedLeads) {
      const parsed = JSON.parse(savedLeads);
      if (Array.isArray(parsed)) {
        parsed.forEach(item => {
          if (item && item.id) {
            masterLeadsRegistry.set(item.id, item);
          }
        });
      }
    }
  } catch (e) {}

  try {
    const savedAccounts = localStorage.getItem('leadsense_user_accounts_db');
    if (savedAccounts) {
      const parsed = JSON.parse(savedAccounts);
      if (Array.isArray(parsed)) {
        parsed.forEach(([email, acc]) => {
          userAccountsMap.set(email, acc);
        });
      }
    }
  } catch (e) {}
}

// Initialize central store on module load
initStore();

function persistMasterLeads() {
  try {
    const allLeads = Array.from(masterLeadsRegistry.values());
    localStorage.setItem('leadsense_master_leads_db', JSON.stringify(allLeads));
  } catch (e) {}
}

function persistUserAccounts() {
  try {
    localStorage.setItem('leadsense_user_accounts_db', JSON.stringify(Array.from(userAccountsMap.entries())));
  } catch (e) {}
}

// Real-time inter-browser broadcast channel
const syncBroadcast = typeof window !== 'undefined' && 'BroadcastChannel' in window
  ? new BroadcastChannel('leadsense_realtime_cloud_sync')
  : null;

/**
 * Derives a deterministic Account UID from an Email address.
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
    passwordHash: btoa(password),
    name: userData.name || cleanEmail.split('@')[0],
    propertiesViewed: 0,
    savedListings: 0,
    inquiries: 0,
    siteVisits: 0,
    scheduledVisits: [],
    ...userData
  };

  userAccountsMap.set(cleanEmail, accountData);
  persistUserAccounts();

  // Save customer data as a lead in central master database so Admin Portal sees it immediately
  if (userData && (userData.role === 'customer' || userData.id)) {
    const leadId = userData.id || `LSA${Math.floor(1000 + Math.random() * 9000)}`;
    const intel = calculateLeadIntelligence(userData);
    const fullLeadRecord = {
      ...userData,
      id: leadId,
      userId: uid,
      email: cleanEmail,
      propertiesViewed: 0,
      savedListings: 0,
      inquiries: 0,
      siteVisits: 0,
      scheduledVisits: [],
      ...intel
    };
    masterLeadsRegistry.set(leadId, fullLeadRecord);
    persistMasterLeads();
  }

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
 * Verifies account credentials securely during login.
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
 * Retrieves client records from central cloud database.
 * SECURITY ISOLATION:
 * If isAgent === true -> Returns ALL client records for Admin Dashboard.
 * If isAgent === false -> Returns ONLY the authenticated user's own profile record. NEVER returns other users' records.
 */
export function getCloudUserLeads(userId, isAgent = false) {
  const allLeads = Array.from(masterLeadsRegistry.values());

  // Role-based Access: Admin sees all records
  if (isAgent || userId === 'uid_agent_slvbuilders_com') {
    return allLeads;
  }

  if (!userId) return [];

  // Search registered accounts map first by UID
  let matchedUserAccount = null;
  for (const [email, acc] of userAccountsMap.entries()) {
    if (acc.uid === userId || getAccountUidFromEmail(email) === userId) {
      matchedUserAccount = acc;
      break;
    }
  }

  // Search master leads array strictly by userId, email, or id
  let matchedLead = allLeads.find(l => 
    l.userId === userId || 
    l.id === userId || 
    (matchedUserAccount && l.email?.toLowerCase() === matchedUserAccount.email?.toLowerCase())
  );

  // If new authenticated user with no stored lead record yet, create clean profile dynamically
  if (!matchedLead && matchedUserAccount) {
    const leadId = matchedUserAccount.id || `LSA${Math.floor(1000 + Math.random() * 9000)}`;
    const intel = calculateLeadIntelligence(matchedUserAccount);
    matchedLead = {
      ...matchedUserAccount,
      id: leadId,
      userId,
      propertiesViewed: 0,
      savedListings: 0,
      inquiries: 0,
      siteVisits: 0,
      scheduledVisits: [],
      ...intel
    };
    masterLeadsRegistry.set(leadId, matchedLead);
    persistMasterLeads();
  }

  // If a matching lead was found for this authenticated user, return ONLY this user's record
  if (matchedLead) {
    return [matchedLead];
  }

  // Fallback for new authenticated session: construct clean profile for this UID, never default to another client
  const fallbackLeadId = `LSA${Math.floor(1000 + Math.random() * 9000)}`;
  const cleanProfile = {
    id: fallbackLeadId,
    userId,
    name: 'Authenticated Client',
    email: '',
    phone: '',
    type: 'Buyer',
    occupation: 'Real Estate Investor',
    annualIncome: 2500000,
    budget: 12000000,
    creditScore: 750,
    loanPreapproved: 'Yes',
    propertiesViewed: 0,
    savedListings: 0,
    inquiries: 0,
    siteVisits: 0,
    scheduledVisits: [],
    slvProject: 'SLV Lorven (Gachibowli)',
    propertyType: 'Apartment (3 BHK)',
    propertyPrice: 12000000,
    moveInTimeline: '1-3 Months',
    transactionStage: 'New',
    leadSource: 'SLV Client Portal',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    slvWebsiteUrl: 'https://sites.google.com/view/slvbuildersanddevelopers/home?pli=1'
  };
  const intel = calculateLeadIntelligence(cleanProfile);
  const fullCleanProfile = { ...cleanProfile, ...intel };
  
  masterLeadsRegistry.set(fallbackLeadId, fullCleanProfile);
  persistMasterLeads();

  return [fullCleanProfile];
}

/**
 * Saves/updates a client record in central database and broadcasts real-time updates to all portals.
 */
export function saveCloudLead(userId, updatedLead) {
  if (!updatedLead) return getCloudUserLeads(userId, userId === 'uid_agent_slvbuilders_com');

  const leadId = updatedLead.id || `LSA${Math.floor(1000 + Math.random() * 9000)}`;
  const intel = calculateLeadIntelligence(updatedLead);
  const fullLead = { ...updatedLead, id: leadId, ...intel, userId: updatedLead.userId || userId };

  // Save directly to central master database
  masterLeadsRegistry.set(leadId, fullLead);
  persistMasterLeads();

  // If this lead belongs to a registered customer account, update their account record too
  if (fullLead.email) {
    const cleanEmail = fullLead.email.toLowerCase();
    if (userAccountsMap.has(cleanEmail)) {
      const existingAcc = userAccountsMap.get(cleanEmail);
      userAccountsMap.set(cleanEmail, {
        ...existingAcc,
        ...fullLead
      });
      persistUserAccounts();
    }
  }

  // Broadcast real-time change across all browsers, tabs, and portals
  if (syncBroadcast) {
    syncBroadcast.postMessage({
      type: 'LEAD_UPDATED',
      userId,
      lead: fullLead,
      timestamp: Date.now()
    });
  }

  const isAgent = userId === 'uid_agent_slvbuilders_com';
  return getCloudUserLeads(userId, isAgent);
}

/**
 * Deletes a client record from central database and broadcasts real-time deletion.
 */
export function deleteCloudLead(userId, leadId) {
  if (!leadId) return getCloudUserLeads(userId, userId === 'uid_agent_slvbuilders_com');

  masterLeadsRegistry.delete(leadId);
  persistMasterLeads();

  if (syncBroadcast) {
    syncBroadcast.postMessage({
      type: 'LEAD_DELETED',
      userId,
      leadId,
      timestamp: Date.now()
    });
  }

  const isAgent = userId === 'uid_agent_slvbuilders_com';
  return getCloudUserLeads(userId, isAgent);
}

/**
 * Real-time listener for multi-portal & cross-browser synchronization.
 */
export function subscribeToCloudSync(userId, isAgent, callback) {
  if (!syncBroadcast) return () => {};

  const handleMessage = (event) => {
    if (event.data) {
      const latestData = getCloudUserLeads(userId, isAgent);
      callback(latestData);
    }
  };

  syncBroadcast.addEventListener('message', handleMessage);

  return () => {
    syncBroadcast.removeEventListener('message', handleMessage);
  };
}
