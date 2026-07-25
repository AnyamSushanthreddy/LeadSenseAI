import React from 'react';
import { formatINR } from '../services/scoringEngine';
import { MapPin, Zap, Clock, ShieldCheck, ArrowRight, Trash2, Phone } from 'lucide-react';

export default function LeadCards({ leads, onSelectLead, onDeleteLead }) {
  if (!leads || leads.length === 0) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
        <p style={{ fontSize: '1.1rem', fontWeight: 500 }}>No leads match the selected filter criteria.</p>
      </div>
    );
  }

  const getPriorityBadgeClass = (priority) => {
    if (priority === 'High') return 'badge-high';
    if (priority === 'Medium') return 'badge-medium';
    return 'badge-low';
  };

  const getScoreColor = (score) => {
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
    <div className="cards-grid">
      {leads.map((lead) => (
        <div key={lead.id} className="lead-card" onClick={() => onSelectLead(lead)}>
          <div className="lead-card-header">
            <div className="lead-card-profile">
              <img src={lead.avatar} alt={lead.name} className="user-avatar" style={{ width: 44, height: 44 }} />
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{lead.name}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  {lead.occupation} • <span style={{ color: 'var(--accent-primary)' }}>{lead.id}</span>
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '3px' }}>
                  <Phone size={10} /> {lead.phone || 'No phone'}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div className="lead-card-score">
                <div className="lead-card-score-val" style={{ color: getScoreColor(lead.leadScore) }}>
                  {lead.leadScore}
                </div>
                <span className={`badge ${getPriorityBadgeClass(lead.priority)}`} style={{ marginTop: '4px' }}>
                  {lead.priority}
                </span>
              </div>

              <button
                className="icon-btn"
                style={{ width: 30, height: 30, color: '#EF4444', borderColor: 'rgba(239, 68, 68, 0.3)', padding: 0 }}
                onClick={(e) => handleDelete(e, lead)}
                title="Delete Client Account"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>

          <div className="lead-card-body">
            <div className="card-stat-item">
              <span className="card-stat-label">Budget</span>
              <span className="card-stat-val">{formatINR(lead.budget)}</span>
            </div>

            <div className="card-stat-item">
              <span className="card-stat-label">Conv. Prob</span>
              <span className="card-stat-val" style={{ color: 'var(--accent-primary)' }}>
                {lead.conversionProbability}
              </span>
            </div>

            <div className="card-stat-item">
              <span className="card-stat-label">Location</span>
              <span className="card-stat-val">
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent((lead.slvProject || 'SLV') + ' ' + lead.preferredLocation)}`}
                  target="_blank"
                  rel="noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  style={{ color: '#4285F4', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '3px', fontWeight: 600 }}
                  title="Open location in Google Maps"
                >
                  <MapPin size={12} style={{ color: '#EA4335' }} /> {lead.preferredLocation} ↗
                </a>
              </span>
            </div>

            <div className="card-stat-item">
              <span className="card-stat-label">Timeline</span>
              <span className="card-stat-val" style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                <Clock size={12} /> {lead.moveInTimeline}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', margin: '0.5rem 0 1rem 0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>
              <span>4-D Score Balance</span>
              <span>Int:{lead.intentScore} | Aff:{lead.affordabilityScore} | Loc:{lead.locationFitScore} | Rdy:{lead.readinessScore}</span>
            </div>
            <div style={{ display: 'flex', height: 4, borderRadius: 2, overflow: 'hidden', background: 'var(--bg-input)' }}>
              <div style={{ width: `${lead.intentScore / 4}%`, background: 'var(--dim-intent)' }} />
              <div style={{ width: `${lead.affordabilityScore / 4}%`, background: 'var(--dim-affordability)' }} />
              <div style={{ width: `${lead.locationFitScore / 4}%`, background: 'var(--dim-location)' }} />
              <div style={{ width: `${lead.readinessScore / 4}%`, background: 'var(--dim-readiness)' }} />
            </div>
          </div>

          <div className="lead-card-next-action">
            <Zap size={14} />
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
              {lead.recommendedNextAction}
            </span>
            <ArrowRight size={14} />
          </div>
        </div>
      ))}
    </div>
  );
}
