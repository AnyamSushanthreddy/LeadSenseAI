import React from 'react';
import { LayoutGrid, List, SlidersHorizontal, RotateCcw } from 'lucide-react';

export default function Toolbar({
  viewMode,
  setViewMode,
  priorityFilter,
  setPriorityFilter,
  locationFilter,
  setLocationFilter,
  loanFilter,
  setLoanFilter,
  timelineFilter,
  setTimelineFilter,
  sortBy,
  setSortBy,
  locations,
  onResetFilters
}) {
  return (
    <div className="toolbar-section">
      <div className="toolbar-top">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <SlidersHorizontal size={18} style={{ color: 'var(--text-secondary)' }} />
          <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>Smart Lead Filters & Sorting</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button
            className="btn btn-secondary"
            style={{ padding: '0.45rem 0.75rem', fontSize: '0.8rem' }}
            onClick={onResetFilters}
            title="Reset all filters"
          >
            <RotateCcw size={14} />
            <span>Reset</span>
          </button>

          <div className="view-toggle">
            <button
              className={`view-toggle-btn ${viewMode === 'table' ? 'active' : ''}`}
              onClick={() => setViewMode('table')}
              title="Table view"
            >
              <List size={16} />
              <span>Table</span>
            </button>
            <button
              className={`view-toggle-btn ${viewMode === 'cards' ? 'active' : ''}`}
              onClick={() => setViewMode('cards')}
              title="Grid Cards view"
            >
              <LayoutGrid size={16} />
              <span>Cards</span>
            </button>
          </div>
        </div>
      </div>

      <div className="filter-selects">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Priority</span>
          <select
            className="custom-select"
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
          >
            <option value="ALL">All Priorities</option>
            <option value="High">High Priority (75+)</option>
            <option value="Medium">Medium Priority (50-74)</option>
            <option value="Low">Low Priority (&lt;50)</option>
          </select>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Location</span>
          <select
            className="custom-select"
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
          >
            <option value="ALL">All Locations</option>
            {locations.map((loc) => (
              <option key={loc} value={loc}>{loc}</option>
            ))}
          </select>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Pre-Approval</span>
          <select
            className="custom-select"
            value={loanFilter}
            onChange={(e) => setLoanFilter(e.target.value)}
          >
            <option value="ALL">All Loan Statuses</option>
            <option value="Yes">Pre-Approved Only</option>
            <option value="No">Pending Pre-Approval</option>
          </select>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Move-In Timeline</span>
          <select
            className="custom-select"
            value={timelineFilter}
            onChange={(e) => setTimelineFilter(e.target.value)}
          >
            <option value="ALL">All Timelines</option>
            <option value="Immediate">Immediate</option>
            <option value="1-3 Months">1-3 Months</option>
            <option value="3-6 Months">3-6 Months</option>
            <option value="6+ Months">6+ Months</option>
          </select>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginLeft: 'auto' }}>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Sort By</span>
          <select
            className="custom-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={{ fontWeight: 600, borderColor: 'var(--accent-primary)' }}
          >
            <option value="score_desc">Lead Score (Highest First)</option>
            <option value="conversion_desc">Conversion Probability</option>
            <option value="budget_desc">Budget (Highest First)</option>
            <option value="income_desc">Annual Income</option>
            <option value="recency_asc">Most Recently Active</option>
          </select>
        </div>
      </div>
    </div>
  );
}
