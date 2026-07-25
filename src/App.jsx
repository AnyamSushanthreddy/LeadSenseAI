import React, { useState, useEffect, useMemo } from 'react';
import initialLeadsData from './data/leadsData.json';
import { calculateLeadIntelligence } from './services/scoringEngine';
import Navbar from './components/Navbar';
import DashboardMetrics from './components/DashboardMetrics';
import AnalyticsCharts from './components/AnalyticsCharts';
import Toolbar from './components/Toolbar';
import LeadTable from './components/LeadTable';
import LeadCards from './components/LeadCards';
import LeadDetailModal from './components/LeadDetailModal';
import AddLeadModal from './components/AddLeadModal';
import LoginPage from './components/LoginPage';
import CustomerPortal from './components/CustomerPortal';
import { ChevronLeft, ChevronRight, Building2, ExternalLink } from 'lucide-react';
import './styles/App.css';

export default function App() {
  // Theme state
  const [theme, setTheme] = useState('dark');

  // Leads state initialized with localStorage persistence & dataset computed intelligence
  const [leads, setLeads] = useState(() => {
    try {
      const stored = localStorage.getItem('leadsense_custom_leads');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map(l => {
            const intel = calculateLeadIntelligence(l);
            return { ...l, ...intel };
          });
        }
      }
    } catch (e) {
      console.error('Failed to read stored leads from localStorage', e);
    }

    return initialLeadsData.map(l => {
      const intel = calculateLeadIntelligence(l);
      return { ...l, ...intel };
    });
  });

  // Auth User State with localStorage persistence (remembers active login session across refreshes)
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const stored = localStorage.getItem('leadsense_current_user');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Failed to read current user session from localStorage', e);
    }
    return null;
  });

  // Save leads to localStorage whenever leads state updates
  useEffect(() => {
    try {
      localStorage.setItem('leadsense_custom_leads', JSON.stringify(leads));
    } catch (e) {
      console.error('Failed to save leads to localStorage', e);
    }
  }, [leads]);

  // Save current user session to localStorage whenever auth state updates
  useEffect(() => {
    try {
      if (currentUser) {
        localStorage.setItem('leadsense_current_user', JSON.stringify(currentUser));
      } else {
        localStorage.removeItem('leadsense_current_user');
      }
    } catch (e) {
      console.error('Failed to save user session to localStorage', e);
    }
  }, [currentUser]);

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
        const query = searchTerm.toLowerCase();
        const matchName = l.name.toLowerCase().includes(query);
        const matchId = l.id.toLowerCase().includes(query);
        const matchLoc = l.preferredLocation.toLowerCase().includes(query);
        const matchOcc = l.occupation.toLowerCase().includes(query);
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
      if (sortBy === 'score_desc') return b.leadScore - a.leadScore;
      if (sortBy === 'conversion_desc') return (b.conversionProbabilityVal || parseInt(b.conversionProbability)) - (a.conversionProbabilityVal || parseInt(a.conversionProbability));
      if (sortBy === 'budget_desc') return b.budget - a.budget;
      if (sortBy === 'income_desc') return b.annualIncome - a.annualIncome;
      if (sortBy === 'recency_asc') return a.daysSinceLastActivity - b.daysSinceLastActivity;
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

  // Add Lead Handler
  const handleAddLead = (newLead) => {
    setLeads(prev => [newLead, ...prev]);
    setSelectedLead(newLead);
  };

  // Update Lead Handler (from Simulation or Edits)
  const handleUpdateLead = (updatedLead) => {
    setLeads(prev => prev.map(l => l.id === updatedLead.id ? updatedLead : l));
    setSelectedLead(updatedLead);
  };

  // Export CSV Handler
  const handleExportCSV = () => {
    const headers = [
      'Lead ID', 'Full Name', 'Type', 'Occupation', 'Annual Income (INR)',
      'Budget (INR)', 'Preferred Location', 'Matched SLV Project', 'Property Type',
      'Lead Score', 'Priority', 'Conversion Prob', 'Intent Score', 'Affordability Score',
      'Location Fit Score', 'Readiness Score', 'Move In Timeline', 'Loan Preapproved',
      'Recommended Action'
    ];

    const rows = filteredLeads.map(l => [
      l.id, `"${l.name}"`, l.type, `"${l.occupation}"`, l.annualIncome,
      l.budget, `"${l.preferredLocation}"`, `"${l.slvProject || ''}"`, `"${l.propertyType}"`, l.leadScore,
      l.priority, `"${l.conversionProbability}"`, l.intentScore, l.affordabilityScore,
      l.locationFitScore, l.readinessScore, `"${l.moveInTimeline}"`, l.loanPreapproved,
      `"${l.recommendedNextAction}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `SLV_Builders_LeadSense_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDeleteLead = (leadId) => {
    setLeads(prev => prev.filter(l => l.id !== leadId));
    if (selectedLead && selectedLead.id === leadId) {
      setSelectedLead(null);
    }
    if (currentUser && currentUser.role === 'customer' && currentUser.customerData && currentUser.customerData.id === leadId) {
      setCurrentUser(null);
    }
  };

  const handleUpdateCustomer = (updatedCustomer) => {
    setCurrentUser(prev => ({
      ...prev,
      customerData: updatedCustomer
    }));
    setLeads(prev => prev.map(l => l.id === updatedCustomer.id ? updatedCustomer : l));
  };

  // If user is not logged in -> Show Login Page
  if (!currentUser) {
    return (
      <LoginPage
        onLoginSuccess={(user) => setCurrentUser(user)}
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
          onLogout={() => setCurrentUser(null)}
        />
        <CustomerPortal
          customer={currentUser.customerData}
          onLogout={() => setCurrentUser(null)}
          onUpdateCustomer={handleUpdateCustomer}
          onDeleteCustomer={handleDeleteLead}
        />
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
        onLogout={() => setCurrentUser(null)}
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
