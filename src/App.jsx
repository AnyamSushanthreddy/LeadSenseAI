import React, { useState, useEffect, useMemo } from 'react';
import Navbar from './components/Navbar';
import DashboardMetrics from './components/DashboardMetrics';
import AnalyticsCharts from './components/AnalyticsCharts';
import Toolbar from './components/Toolbar';
import LeadCards from './components/LeadCards';
import LeadTable from './components/LeadTable';
import LeadDetailModal from './components/LeadDetailModal';
import AddLeadModal from './components/AddLeadModal';
import CustomerPortal from './components/CustomerPortal';
import LoginPage from './components/LoginPage';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import { calculateLeadIntelligence } from './services/scoringEngine';
import { getCloudUserLeads, saveCloudLead, deleteCloudLead, subscribeToCloudSync } from './services/cloudSyncEngine';
import { auth, onAuthStateChanged, signOut as firebaseSignOut } from './services/firebase';
import './styles/App.css';

export default function App() {
  // Theme state
  const [theme, setTheme] = useState('dark');

  // Auth User & Data Loading State
  const [currentUser, setCurrentUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [leads, setLeads] = useState([]);

  // Real-time Firebase Authentication listener & account data binding
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        const uid = firebaseUser.uid;
        const initialLeads = getCloudUserLeads(uid);
        const userSession = {
          uid,
          role: 'customer',
          name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Authenticated Account',
          email: firebaseUser.email || '',
          avatar: firebaseUser.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
          provider: firebaseUser.providerData[0]?.providerId || 'firebase',
          customerData: initialLeads[0] || null
        };
        
        setLeads(initialLeads);
        setCurrentUser(userSession);
      }
      setAuthLoading(false);
    });

    return () => unsubscribeAuth();
  }, []);

  // Subscribe to real-time database updates for active user session UID across all browsers & devices
  useEffect(() => {
    if (!currentUser || !currentUser.uid) return;

    const userUid = currentUser.uid;
    const initialLeads = getCloudUserLeads(userUid);
    setLeads(initialLeads);

    const unsubscribeSync = subscribeToCloudSync(userUid, (updatedLeads) => {
      setLeads(updatedLeads);
    });

    return () => unsubscribeSync();
  }, [currentUser?.uid]);

  // Login handler
  const handleLoginSuccess = (userSession) => {
    const userUid = userSession.uid || `uid_${Date.now()}`;
    const userWithUid = { ...userSession, uid: userUid };
    
    // Fetch and bind cloud data for this UID
    const cloudLeads = getCloudUserLeads(userUid);
    setLeads(cloudLeads);
    
    if (userWithUid.role === 'customer' && !userWithUid.customerData && cloudLeads.length > 0) {
      userWithUid.customerData = cloudLeads[0];
    }
    
    setCurrentUser(userWithUid);
  };

  const handleLogout = () => {
    try {
      firebaseSignOut(auth);
    } catch (e) {}
    setCurrentUser(null);
  };

  // Filter & Toolbar States
  const [searchTerm, setSearchTerm] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [locationFilter, setLocationFilter] = useState('ALL');
  const [loanFilter, setLoanFilter] = useState('ALL');
  const [timelineFilter, setTimelineFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('score_desc');
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'cards'

  // Modal States
  const [selectedLead, setSelectedLead] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 15;

  // Sync theme attribute on <html> element
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Distinct locations for filter dropdown
  const locations = useMemo(() => {
    const setLocs = new Set(leads.map(l => l.preferredLocation));
    return Array.from(setLocs).sort();
  }, [leads]);

  // Filter & Sort Logic
  const filteredLeads = useMemo(() => {
    return leads.filter(l => {
      // Search term (Name, ID, Occupation, Location)
      if (searchTerm.trim()) {
        const queryStr = searchTerm.toLowerCase();
        const matchName = l.name?.toLowerCase().includes(queryStr);
        const matchId = l.id?.toLowerCase().includes(queryStr);
        const matchLoc = l.preferredLocation?.toLowerCase().includes(queryStr);
        const matchOcc = l.occupation?.toLowerCase().includes(queryStr);
        if (!matchName && !matchId && !matchLoc && !matchOcc) return false;
      }

      // Priority Filter
      if (priorityFilter !== 'ALL' && l.priority !== priorityFilter) return false;

      // Location Filter
      if (locationFilter !== 'ALL' && l.preferredLocation !== locationFilter) return false;

      // Loan Filter
      if (loanFilter !== 'ALL' && l.loanPreapproved !== loanFilter) return false;

      // Timeline Filter
      if (timelineFilter !== 'ALL' && l.moveInTimeline !== timelineFilter) return false;

      return true;
    }).sort((a, b) => {
      if (sortBy === 'score_desc') return (b.leadScore || 0) - (a.leadScore || 0);
      if (sortBy === 'conversion_desc') return (b.conversionProbabilityVal || parseInt(b.conversionProbability || 0)) - (a.conversionProbabilityVal || parseInt(a.conversionProbability || 0));
      if (sortBy === 'budget_desc') return (b.budget || 0) - (a.budget || 0);
      if (sortBy === 'income_desc') return (b.annualIncome || 0) - (a.annualIncome || 0);
      if (sortBy === 'recency_asc') return (a.daysSinceLastActivity || 0) - (b.daysSinceLastActivity || 0);
      return 0;
    });
  }, [leads, searchTerm, priorityFilter, locationFilter, loanFilter, timelineFilter, sortBy]);

  // Reset current page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, priorityFilter, locationFilter, loanFilter, timelineFilter, sortBy]);

  // Pagination Slicing
  const totalPages = Math.ceil(filteredLeads.length / pageSize) || 1;
  const paginatedLeads = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredLeads.slice(start, start + pageSize);
  }, [filteredLeads, currentPage, pageSize]);

  // Reset Filters
  const handleResetFilters = () => {
    setSearchTerm('');
    setPriorityFilter('ALL');
    setLocationFilter('ALL');
    setLoanFilter('ALL');
    setTimelineFilter('ALL');
    setSortBy('score_desc');
  };

  // Centralized Real-time Add Lead Handler
  const handleAddLead = (newLead) => {
    const userUid = currentUser?.uid || 'master_default_uid';
    const updated = saveCloudLead(userUid, { ...newLead, userId: userUid });
    if (updated) setLeads(updated);
    setSelectedLead(newLead);
  };

  // Centralized Real-time Update Lead Handler
  const handleUpdateLead = (updatedLead) => {
    const userUid = currentUser?.uid || 'master_default_uid';
    const updated = saveCloudLead(userUid, { ...updatedLead, userId: userUid });
    if (updated) setLeads(updated);
    setSelectedLead(updatedLead);
  };

  // Centralized Real-time Delete Lead Handler
  const handleDeleteLead = (leadId) => {
    const userUid = currentUser?.uid || 'master_default_uid';
    const updated = deleteCloudLead(userUid, leadId);
    if (updated) setLeads(updated);
    if (selectedLead && selectedLead.id === leadId) {
      setSelectedLead(null);
    }
    if (currentUser && currentUser.role === 'customer' && currentUser.customerData && currentUser.customerData.id === leadId) {
      setCurrentUser(null);
    }
  };

  // Centralized Real-time Customer Profile Update Handler
  const handleUpdateCustomer = (updatedCustomer) => {
    const userUid = currentUser?.uid || 'master_default_uid';
    const updated = saveCloudLead(userUid, { ...updatedCustomer, userId: userUid });
    setCurrentUser(prev => ({
      ...prev,
      customerData: updatedCustomer
    }));
    if (updated) setLeads(updated);
  };

  // Render Loading State while auth and cloud database sync initialization takes place
  if (authLoading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'var(--bg-app)', color: 'var(--text-primary)' }}>
        <div style={{ width: 44, height: 44, border: '3px solid var(--border-subtle)', borderTopColor: 'var(--accent-primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <p style={{ marginTop: '1.25rem', fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
          Authenticating & Syncing Real-Time Cloud Database...
        </p>
      </div>
    );
  }

  // If user is not logged in -> Show Login Page
  if (!currentUser) {
    return (
      <LoginPage
        onLoginSuccess={handleLoginSuccess}
        onRegisterUser={(newUser) => handleAddLead(newUser)}
        leads={leads}
      />
    );
  }

  // If logged in as Customer -> Show Customer Portal
  if (currentUser.role === 'customer') {
    return (
      <div className="app-container">
        <Navbar
          theme={theme}
          toggleTheme={toggleTheme}
          currentUser={currentUser}
          onLogout={handleLogout}
        />
        <main className="main-content">
          <CustomerPortal
            customer={currentUser.customerData || leads[0]}
            onLogout={handleLogout}
            onUpdateCustomer={handleUpdateCustomer}
            onDeleteCustomer={handleDeleteLead}
          />
        </main>
      </div>
    );
  }

  // If logged in as Agent / Admin -> Show Full LeadSense-AI Dashboard
  return (
    <div className="app-container">
      <Navbar
        theme={theme}
        toggleTheme={toggleTheme}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        onOpenAddModal={() => setIsAddModalOpen(true)}
        onExportCSV={handleExportCSV}
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      <main className="main-content">
        <header className="dashboard-header">
          <div className="title-row">
            <div className="page-title">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <h1>SLV Builders & Developers Lead Intelligence</h1>
                <span className="logo-ai-tag">SLV Enterprise</span>
              </div>
              <p>
                AI-powered buyer & tenant conversion scoring across <strong>SLV Lorven</strong>, <strong>SLV Paradise</strong>, <strong>SLV Residency</strong> & <strong>SLV Green Meadows</strong>. Official Partner:{' '}
                <a
                  href="https://sites.google.com/view/slvbuildersanddevelopers/home?pli=1"
                  target="_blank"
                  rel="noreferrer"
                  style={{ color: 'var(--accent-primary)', textDecoration: 'none', fontWeight: 600 }}
                >
                  sites.google.com/slvbuilders ↗
                </a>
              </p>
            </div>
          </div>

          <DashboardMetrics leads={filteredLeads} />
        </header>

        <AnalyticsCharts leads={filteredLeads} />

        <Toolbar
          viewMode={viewMode}
          setViewMode={setViewMode}
          priorityFilter={priorityFilter}
          setPriorityFilter={setPriorityFilter}
          locationFilter={locationFilter}
          setLocationFilter={setLocationFilter}
          loanFilter={loanFilter}
          setLoanFilter={setLoanFilter}
          timelineFilter={timelineFilter}
          setTimelineFilter={setTimelineFilter}
          sortBy={sortBy}
          setSortBy={setSortBy}
          locations={locations}
          onResetFilters={handleResetFilters}
        />

        {viewMode === 'table' ? (
          <LeadTable
            leads={paginatedLeads}
            onSelectLead={(lead) => setSelectedLead(lead)}
            onDeleteLead={handleDeleteLead}
          />
        ) : (
          <LeadCards
            leads={paginatedLeads}
            onSelectLead={(lead) => setSelectedLead(lead)}
            onDeleteLead={handleDeleteLead}
          />
        )}

        {/* Pagination Controls */}
        <div className="pagination-bar">
          <div>
            Showing <strong style={{ color: 'var(--text-primary)' }}>
              {filteredLeads.length > 0 ? (currentPage - 1) * pageSize + 1 : 0}
            </strong> to <strong style={{ color: 'var(--text-primary)' }}>
              {Math.min(currentPage * pageSize, filteredLeads.length)}
            </strong> of <strong style={{ color: 'var(--text-primary)' }}>{filteredLeads.length}</strong> ranked SLV Builder leads
          </div>

          <div className="pagination-controls">
            <button
              className="btn btn-secondary"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              style={{ opacity: currentPage === 1 ? 0.4 : 1, padding: '0.4rem 0.8rem' }}
            >
              <ChevronLeft size={16} /> Previous
            </button>

            <span style={{ fontSize: '0.85rem', fontWeight: 600, padding: '0 0.5rem' }}>
              Page {currentPage} of {totalPages}
            </span>

            <button
              className="btn btn-secondary"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              style={{ opacity: currentPage === totalPages ? 0.4 : 1, padding: '0.4rem 0.8rem' }}
            >
              Next <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </main>

      {/* Modals & Slide-Over Drawers */}
      <LeadDetailModal
        lead={selectedLead}
        onClose={() => setSelectedLead(null)}
        onUpdateLead={handleUpdateLead}
        onDeleteLead={handleDeleteLead}
      />

      <AddLeadModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddLead={handleAddLead}
        locations={locations}
      />
    </div>
  );
}
