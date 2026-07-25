import React from 'react';
import { Sparkles, Sun, Moon, Plus, Download, Search, ExternalLink, LogOut, Building2 } from 'lucide-react';

export default function Navbar({
  theme,
  toggleTheme,
  searchTerm,
  setSearchTerm,
  onOpenAddModal,
  onExportCSV,
  currentUser,
  onLogout
}) {
  return (
    <nav className="navbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
        <a href="#" className="logo-group">
          <div className="logo-badge">
            <Sparkles size={20} />
          </div>
          <div className="logo-text">
            LeadSense<span style={{ color: 'var(--accent-primary)' }}>AI</span>
            <span className="logo-ai-tag">SLV Enterprise</span>
          </div>
        </a>

        {/* SLV Builders & Developers Official Website Link */}
        <div className="slv-nav-banner">
          <Building2 size={14} style={{ color: 'var(--accent-primary)' }} />
          <span>SLV Builders & Developers:</span>
          <a
            href="https://sites.google.com/view/slvbuildersanddevelopers/home?pli=1"
            target="_blank"
            rel="noopener noreferrer"
            className="slv-nav-link"
          >
            Official Website <ExternalLink size={12} />
          </a>
        </div>
      </div>

      <div className="nav-actions">
        {currentUser?.role === 'agent' && (
          <div className="nav-search">
            <Search size={16} />
            <input
              type="text"
              placeholder="Search leads, ID, location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        )}

        <button
          className="icon-btn"
          onClick={toggleTheme}
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {currentUser?.role === 'agent' && (
          <>
            <button className="btn btn-secondary" onClick={onExportCSV}>
              <Download size={16} />
              <span>Export CSV</span>
            </button>

            <button className="btn btn-primary" onClick={onOpenAddModal}>
              <Plus size={16} />
              <span>Add Lead</span>
            </button>
          </>
        )}

        {currentUser && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderLeft: '1px solid var(--border-subtle)', paddingLeft: '0.75rem' }}>
            <div style={{ fontSize: '0.78rem', textAlign: 'right' }}>
              <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                {currentUser.role === 'agent' ? currentUser.name : currentUser.customerData.name}
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--accent-primary)' }}>
                {currentUser.role === 'agent' ? 'SLV Director' : 'Client Account'}
              </div>
            </div>

            <button className="icon-btn" onClick={onLogout} title="Sign Out">
              <LogOut size={16} />
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
