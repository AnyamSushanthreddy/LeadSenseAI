import React from 'react';
import { formatINR } from '../services/scoringEngine';
import { ArrowUpRight, CheckCircle2, Clock, MapPin, Zap, Trash2, Phone, Mail } from 'lucide-react';

export default function LeadTable({ leads, onSelectLead, onDeleteLead }) {
  if (!leads || leads.length === 0) {
    return (
      <div className="table-wrapper" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
        <p style={{ fontSize: '1.1rem', fontWeight: 500 }}>No leads match the selected filter criteria.</p>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)', marginTop: '0.5rem' }}>Try clearing filters or searching for another location/name.</p>
      </div>
    );
  }

  const getPriorityBadgeClass = (priority) => {
    if (priority === 'High') return 'badge-high';
    if (priority === 'Medium') return 'badge-medium';
    return 'badge-low';
  };

  const getScoreBarColor = (score) => {
    if (score >= 75) return 'var(--priority-high)';
    if (score >= 50) return 'var(--priority-medium)';
    return 'var(--priority-low)';
  };

  const handleDelete = (e, lead) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to delete client account for "${lead.name}" (${lead.id})?`)) {
      onDeleteLead(lead.id);
    }
  };

  return (
    <div className="table-wrapper">
      <table className="lead-table">
        <thead>
          <tr>
            <th>Rank</th>
            <th>Lead Profile</th>
            <th>Lead Score</th>
            <th>Conversion Prob.</th>
            <th>4-D Dimensions</th>
            <th>Budget & Location</th>
            <th>Readiness & Loan</th>
            <th>Recommended Action</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {leads.map((lead, idx) => (
            <tr key={lead.id} onClick={() => onSelectLead(lead)}>
              <td style={{ fontWeight: 700, color: 'var(--text-tertiary)', fontSize: '0.85rem' }}>
                #{idx + 1}
              </td>

              <td>
                <div className="lead-user-cell">
                  <img src={lead.avatar} alt={lead.name} className="user-avatar" />
                  <div>
                    <div className="user-info-name">{lead.name}</div>
                    <div className="user-info-sub">
                      {lead.occupation} • <span style={{ color: 'var(--accent-primary)', fontWeight: 600 }}>{lead.id}</span>
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                        <Phone size={10} /> {lead.phone || 'No phone'}
                      </span>
                      {lead.email && (
                        <a
                          href={`https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(lead.email)}&su=${encodeURIComponent('SLV Builders & Developers — Real Estate Consultation')}`}
                          target="_blank"
                          rel="noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          style={{ color: '#4285F4', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '3px', fontWeight: 600 }}
                          title="Open Gmail Composer"
                        >
                          <Mail size={10} /> {lead.email} ↗
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </td>

              <td>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <div className="score-pill">
                    <span className="score-number" style={{ color: getScoreBarColor(lead.leadScore) }}>
                      {lead.leadScore}
                    </span>
                    <div className="score-bar-bg">
                      <div
                        className="score-bar-fill"
                        style={{
                          width: `${lead.leadScore}%`,
                          background: getScoreBarColor(lead.leadScore)
                        }}
                      />
                    </div>
                  </div>
                  <span className={`badge ${getPriorityBadgeClass(lead.priority)}`} style={{ alignSelf: 'flex-start' }}>
                    <span className="badge-dot" />
                    {lead.priority} Priority
                  </span>
                </div>
              </td>

              <td>
                <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.95rem' }}>
                  {lead.conversionProbability}
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>
                  {lead.daysSinceLastActivity === 0 ? 'Active Today' : `${lead.daysSinceLastActivity}d ago`}
                </div>
              </td>

              <td>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px', fontSize: '0.72rem' }}>
                  <span style={{ color: 'var(--dim-intent)' }}>INT: {lead.intentScore}</span>
                  <span style={{ color: 'var(--dim-affordability)' }}>AFF: {lead.affordabilityScore}</span>
                  <span style={{ color: 'var(--dim-location)' }}>LOC: {lead.locationFitScore}</span>
                  <span style={{ color: 'var(--dim-readiness)' }}>RDY: {lead.readinessScore}</span>
                </div>
              </td>

              <td>
                <div style={{ fontWeight: 600 }}>{formatINR(lead.budget)}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '3px' }}>
                  <MapPin size={12} /> {lead.preferredLocation} ({lead.propertyType})
                </div>
              </td>

              <td>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', fontSize: '0.78rem' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Clock size={12} style={{ color: 'var(--text-tertiary)' }} />
                    {lead.moveInTimeline}
                  </span>
                  <span style={{
                    color: lead.loanPreapproved === 'Yes' ? 'var(--priority-high)' : 'var(--text-tertiary)',
                    fontWeight: lead.loanPreapproved === 'Yes' ? 600 : 400
                  }}>
                    {lead.loanPreapproved === 'Yes' ? 'Pre-Approved' : 'Pending Pre-App'}
                  </span>
                </div>
              </td>

              <td>
                <div
                  className="lead-card-next-action"
                  style={{ cursor: 'pointer' }}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectLead(lead);
                  }}
                >
                  <Zap size={14} />
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '140px' }}>
                    {lead.recommendedNextAction}
                  </span>
                  <ArrowUpRight size={14} style={{ marginLeft: 'auto' }} />
                </div>
              </td>

              <td>
                <button
                  className="icon-btn"
                  style={{ color: '#EF4444', borderColor: 'rgba(239, 68, 68, 0.3)' }}
                  onClick={(e) => handleDelete(e, lead)}
                  title="Delete Client Account"
                >
                  <Trash2 size={16} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
