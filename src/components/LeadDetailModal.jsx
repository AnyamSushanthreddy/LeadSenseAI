import React, { useState, useEffect } from 'react';
import { X, Sparkles, Phone, Mail, MessageSquare, Calendar, Zap, RefreshCw, CheckCircle2, AlertCircle, ArrowUpRight, TrendingUp, Camera, Check, Trash2 } from 'lucide-react';
import { formatINR, calculateLeadIntelligence } from '../services/scoringEngine';

export default function LeadDetailModal({ lead, onClose, onUpdateLead, onDeleteLead }) {
  if (!lead) return null;

  // Local state for Interactive "What-If" AI Simulator
  const [simLead, setSimLead] = useState({ ...lead });
  const [simIntelligence, setSimIntelligence] = useState(calculateLeadIntelligence(lead));
  const [simActive, setSimActive] = useState(false);
  const [isEditingPhoto, setIsEditingPhoto] = useState(false);
  const [photoInput, setPhotoInput] = useState(lead.avatar || '');

  useEffect(() => {
    setSimLead({ ...lead });
    setSimIntelligence(calculateLeadIntelligence(lead));
    setSimActive(false);
    setPhotoInput(lead.avatar || '');
    setIsEditingPhoto(false);
  }, [lead]);

  const handleSimChange = (field, value) => {
    const updated = { ...simLead, [field]: value };
    const newIntel = calculateLeadIntelligence(updated);
    setSimLead(updated);
    setSimIntelligence(newIntel);
    setSimActive(true);
  };

  const handleSavePhoto = (e) => {
    e.preventDefault();
    if (!photoInput.trim()) return;
    handleSimChange('avatar', photoInput.trim());
    setIsEditingPhoto(false);
  };

  const handleApplySim = () => {
    onUpdateLead({
      ...simLead,
      ...simIntelligence
    });
    setSimActive(false);
  };

  const handleDeleteClient = () => {
    if (window.confirm(`Are you sure you want to permanently delete the client account for "${simLead.name}" (${simLead.id})?`)) {
      if (onDeleteLead) {
        onDeleteLead(simLead.id);
      }
      onClose();
    }
  };

  const handleConfirmVisit = (e) => {
    e.preventDefault();
    if (!newVisitDate) return;

    const newVisitsCount = (simLead.siteVisits || 0) + 1;
    const updatedLead = { ...simLead, siteVisits: newVisitsCount };
    const newIntel = calculateLeadIntelligence(updatedLead);

    setSimLead(updatedLead);
    setSimIntelligence(newIntel);
    setScheduledVisits(prev => [
      ...prev,
      { date: newVisitDate, time: newVisitTime, project: newVisitProject, status: 'Confirmed' }
    ]);
    setIsScheduling(false);
    setVisitMsg(`VIP Visit scheduled for ${newVisitProject} on ${newVisitDate} at ${newVisitTime}!`);

    if (onUpdateLead) {
      onUpdateLead({ ...updatedLead, ...newIntel });
    }

    setTimeout(() => setVisitMsg(''), 6000);
  };

  const originalIntel = calculateLeadIntelligence(lead);
  const currentIntel = simIntelligence;
  const scoreDelta = currentIntel.leadScore - originalIntel.leadScore;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="drawer-content" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="drawer-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ position: 'relative' }}>
              <img src={simLead.avatar} alt={simLead.name} className="user-avatar" style={{ width: 56, height: 56 }} />
              <button
                onClick={() => setIsEditingPhoto(!isEditingPhoto)}
                title="Set/Update Profile Photo"
                style={{
                  position: 'absolute',
                  bottom: -2,
                  right: -2,
                  width: 22,
                  height: 22,
                  borderRadius: '50%',
                  background: 'var(--accent-primary)',
                  color: '#FFF',
                  border: '2px solid var(--bg-surface)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
              >
                <Camera size={11} />
              </button>
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 700 }}>
                  {simLead.name}
                </h2>
                <span className="logo-ai-tag">{simLead.type}</span>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                {simLead.occupation} • Phone: <strong style={{ color: 'var(--text-primary)' }}>{simLead.phone || 'N/A'}</strong> • ID: <span style={{ color: 'var(--accent-primary)', fontWeight: 600 }}>{simLead.id}</span>
              </p>
            </div>
          </div>

          <button className="icon-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Profile Photo Edit Bar */}
        {isEditingPhoto && (
          <form onSubmit={handleSavePhoto} style={{ background: 'var(--bg-app)', padding: '0.85rem', borderRadius: 'var(--radius-md)', marginBottom: '1rem', border: '1px solid var(--border-strong)' }}>
            <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
              Insert Profile Photo URL
            </label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="url"
                required
                placeholder="https://images.unsplash.com/..."
                value={photoInput}
                onChange={(e) => setPhotoInput(e.target.value)}
                style={{ flex: 1, background: 'var(--bg-input)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', padding: '0.4rem 0.6rem', fontSize: '0.82rem', color: 'var(--text-primary)' }}
              />
              <button type="submit" className="btn btn-primary" style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem' }}>
                <Check size={14} /> Save Photo
              </button>
              <button type="button" className="icon-btn" style={{ width: 32, height: 32 }} onClick={() => setIsEditingPhoto(false)}>
                <X size={14} />
              </button>
            </div>
          </form>
        )}

        {/* Action Triggers Row */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <a href={`tel:${simLead.phone}`} className="btn btn-primary" style={{ flex: 1, textDecoration: 'none' }}>
            <Phone size={14} /> Call Lead
          </a>
          <a href={`mailto:${simLead.email}`} className="btn btn-secondary" style={{ flex: 1, textDecoration: 'none' }}>
            <Mail size={14} /> Email
          </a>
          <a href={`https://wa.me/${simLead.phone?.replace(/[^0-9]/g, '')}`} target="_blank" rel="noreferrer" className="btn btn-secondary" style={{ flex: 1, textDecoration: 'none' }}>
            <MessageSquare size={14} /> WhatsApp
          </a>
          <button
            className="btn btn-secondary"
            style={{ flex: 1, borderColor: isScheduling ? 'var(--accent-primary)' : undefined, color: isScheduling ? 'var(--accent-primary)' : undefined }}
            onClick={() => setIsScheduling(!isScheduling)}
          >
            <Calendar size={14} /> {isScheduling ? 'Close Form' : 'Schedule Visit'}
          </button>
          <button
            className="btn btn-secondary"
            style={{ color: '#EF4444', borderColor: 'rgba(239, 68, 68, 0.3)' }}
            onClick={handleDeleteClient}
          >
            <Trash2 size={14} /> Delete
          </button>
        </div>

        {/* Visit Confirmation Alert Banner */}
        {visitMsg && (
          <div style={{ background: 'rgba(34, 197, 94, 0.15)', border: '1px solid rgba(34, 197, 94, 0.4)', borderRadius: 'var(--radius-md)', padding: '0.75rem 1rem', color: 'var(--priority-high)', fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.75rem' }}>
            <CheckCircle2 size={16} />
            <span>{visitMsg}</span>
          </div>
        )}

        {/* Interactive Schedule Visit Form */}
        {isScheduling && (
          <form onSubmit={handleConfirmVisit} style={{ background: 'var(--bg-app)', border: '1px solid var(--accent-primary)', borderRadius: 'var(--radius-md)', padding: '1rem', marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Calendar size={16} /> Schedule VIP Site Visit for {simLead.name}
            </div>

            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                Select SLV Project
              </label>
              <select
                required
                value={newVisitProject}
                onChange={(e) => setNewVisitProject(e.target.value)}
                className="custom-select"
                style={{ width: '100%', padding: '0.45rem 2rem 0.45rem 0.65rem', fontSize: '0.85rem' }}
              >
                {SLV_PROJECT_OPTIONS.map(proj => (
                  <option key={proj} value={proj}>{proj}</option>
                ))}
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                  Preferred Visit Date
                </label>
                <input
                  type="date"
                  required
                  value={newVisitDate}
                  onChange={(e) => setNewVisitDate(e.target.value)}
                  style={{ width: '100%', background: 'var(--bg-input)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', padding: '0.4rem 0.5rem', color: 'var(--text-primary)', fontSize: '0.85rem' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                  Preferred Time Slot
                </label>
                <select
                  value={newVisitTime}
                  onChange={(e) => setNewVisitTime(e.target.value)}
                  className="custom-select"
                  style={{ width: '100%', padding: '0.45rem 2rem 0.45rem 0.65rem', fontSize: '0.85rem' }}
                >
                  <option>10:00 AM</option>
                  <option>11:00 AM</option>
                  <option>12:00 PM</option>
                  <option>02:00 PM</option>
                  <option>03:00 PM</option>
                  <option>04:00 PM</option>
                  <option>05:00 PM</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', marginTop: '4px' }}>
              <button type="button" className="btn btn-secondary" style={{ fontSize: '0.8rem' }} onClick={() => setIsScheduling(false)}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" style={{ fontSize: '0.8rem' }}>
                <Calendar size={14} /> Confirm Visit
              </button>
            </div>
          </form>
        )}

        {/* Scheduled Site Visits List */}
        {scheduledVisits.length > 0 && (
          <div style={{ marginTop: '0.75rem', background: 'var(--bg-app)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '0.85rem' }}>
            <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Calendar size={13} style={{ color: 'var(--accent-primary)' }} />
              Scheduled Site Visits ({scheduledVisits.length})
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
              {scheduledVisits.map((visit, idx) => (
                <div key={idx} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', padding: '0.6rem 0.8rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{visit.project}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      {visit.date} at {visit.time}
                    </div>
                  </div>
                  <span className="badge badge-high" style={{ fontSize: '0.68rem' }}>{visit.status}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* AI Score Overview Box */}
        <div style={{
          background: 'var(--bg-app)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg)',
          padding: '1.25rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Overall AI Lead Score
            </span>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginTop: '4px' }}>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', fontWeight: 800, color: currentIntel.leadScore >= 75 ? 'var(--priority-high)' : currentIntel.leadScore >= 50 ? 'var(--priority-medium)' : 'var(--priority-low)' }}>
                {currentIntel.leadScore}
              </span>
              <span style={{ color: 'var(--text-tertiary)', fontSize: '1.1rem' }}>/ 100</span>
              {simActive && scoreDelta !== 0 && (
                <span className={`trend-pill ${scoreDelta > 0 ? 'trend-up' : 'trend-neutral'}`} style={{ marginLeft: '0.5rem' }}>
                  {scoreDelta > 0 ? `+${scoreDelta} pts` : `${scoreDelta} pts`}
                </span>
              )}
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Conversion Prob.
            </span>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', fontWeight: 700, color: 'var(--accent-primary)', marginTop: '2px' }}>
              {currentIntel.conversionProbability}
            </div>
            <span className={`badge badge-${currentIntel.priority.toLowerCase()}`} style={{ marginTop: '4px' }}>
              {currentIntel.priority} Priority
            </span>
          </div>
        </div>

        {/* AI Rationale & Next-Best Action */}
        <div className="ai-box">
          <div className="ai-box-title">
            <Sparkles size={16} />
            <span>AI Score Rationale & Next-Best Action</span>
          </div>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-primary)', lineHeight: '1.5' }}>
            {currentIntel.aiExplanation}
          </p>
          <div style={{
            background: 'var(--accent-glow)',
            border: '1px solid rgba(99, 102, 241, 0.3)',
            borderRadius: 'var(--radius-sm)',
            padding: '0.75rem',
            marginTop: '0.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            fontSize: '0.85rem',
            fontWeight: 600,
            color: 'var(--accent-primary)'
          }}>
            <Zap size={18} />
            <span>Action Required: {currentIntel.recommendedNextAction}</span>
          </div>
        </div>

        {/* 4 Core Dimensions Breakdown */}
        <div>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <TrendingUp size={16} style={{ color: 'var(--accent-primary)' }} />
            <span>4-Dimensional Intelligence Breakdown</span>
          </h3>

          <div className="dimension-bar-row">
            <div className="dimension-bar-meta">
              <span style={{ color: 'var(--dim-intent)', fontWeight: 600 }}>1. Intent Score ({currentIntel.intentScore}/100)</span>
              <span style={{ color: 'var(--text-tertiary)' }}>{simLead.propertiesViewed} Views • {simLead.siteVisits} Visits</span>
            </div>
            <div className="score-bar-bg" style={{ maxWidth: '100%', height: 8 }}>
              <div className="score-bar-fill" style={{ width: `${currentIntel.intentScore}%`, background: 'var(--dim-intent)' }} />
            </div>
          </div>

          <div className="dimension-bar-row">
            <div className="dimension-bar-meta">
              <span style={{ color: 'var(--dim-affordability)', fontWeight: 600 }}>2. Affordability Score ({currentIntel.affordabilityScore}/100)</span>
              <span style={{ color: 'var(--text-tertiary)' }}>Income: {formatINR(simLead.annualIncome)} • Credit: {simLead.creditScore}</span>
            </div>
            <div className="score-bar-bg" style={{ maxWidth: '100%', height: 8 }}>
              <div className="score-bar-fill" style={{ width: `${currentIntel.affordabilityScore}%`, background: 'var(--dim-affordability)' }} />
            </div>
          </div>

          <div className="dimension-bar-row">
            <div className="dimension-bar-meta">
              <span style={{ color: 'var(--dim-location)', fontWeight: 600 }}>3. Location Fit Score ({currentIntel.locationFitScore}/100)</span>
              <span style={{ color: 'var(--text-tertiary)' }}>{simLead.preferredLocation} ({simLead.propertyType})</span>
            </div>
            <div className="score-bar-bg" style={{ maxWidth: '100%', height: 8 }}>
              <div className="score-bar-fill" style={{ width: `${currentIntel.locationFitScore}%`, background: 'var(--dim-location)' }} />
            </div>
          </div>

          <div className="dimension-bar-row">
            <div className="dimension-bar-meta">
              <span style={{ color: 'var(--dim-readiness)', fontWeight: 600 }}>4. Readiness Score ({currentIntel.readinessScore}/100)</span>
              <span style={{ color: 'var(--text-tertiary)' }}>Timeline: {simLead.moveInTimeline} • Stage: {simLead.transactionStage}</span>
            </div>
            <div className="score-bar-bg" style={{ maxWidth: '100%', height: 8 }}>
              <div className="score-bar-fill" style={{ width: `${currentIntel.readinessScore}%`, background: 'var(--dim-readiness)' }} />
            </div>
          </div>
        </div>

        {/* Interactive What-If Simulator */}
        <div className="simulator-box">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600, fontSize: '0.9rem' }}>
              <RefreshCw size={16} style={{ color: 'var(--accent-primary)' }} />
              <span>Interactive "What-If" AI Score Simulator</span>
            </div>
            {simActive && (
              <button className="btn btn-primary" style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }} onClick={handleApplySim}>
                Save Simulation Changes
              </button>
            )}
          </div>

          <div className="sim-control-group">
            <div className="sim-slider-row">
              <label>Site Visits Attended ({simLead.siteVisits})</label>
              <input
                type="range"
                min="0"
                max="10"
                value={simLead.siteVisits}
                onChange={(e) => handleSimChange('siteVisits', parseInt(e.target.value))}
                style={{ width: '180px', accentColor: 'var(--accent-primary)' }}
              />
            </div>

            <div className="sim-slider-row">
              <label>Properties Viewed ({simLead.propertiesViewed})</label>
              <input
                type="range"
                min="1"
                max="50"
                value={simLead.propertiesViewed}
                onChange={(e) => handleSimChange('propertiesViewed', parseInt(e.target.value))}
                style={{ width: '180px', accentColor: 'var(--accent-primary)' }}
              />
            </div>

            <div className="sim-slider-row">
              <label>Loan Pre-Approval</label>
              <select
                className="custom-select"
                style={{ padding: '0.2rem 1.8rem 0.2rem 0.5rem', fontSize: '0.8rem' }}
                value={simLead.loanPreapproved}
                onChange={(e) => handleSimChange('loanPreapproved', e.target.value)}
              >
                <option value="Yes">Pre-Approved (Yes)</option>
                <option value="No">Pending (No)</option>
              </select>
            </div>

            <div className="sim-slider-row">
              <label>Client Phone Number</label>
              <input
                type="tel"
                value={simLead.phone || ''}
                onChange={(e) => handleSimChange('phone', e.target.value)}
                style={{ width: '180px', background: 'var(--bg-input)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', padding: '0.2rem 0.5rem', fontSize: '0.8rem', color: 'var(--text-primary)' }}
              />
            </div>

            <div className="sim-slider-row">
              <label>Move-In Timeline</label>
              <select
                className="custom-select"
                style={{ padding: '0.2rem 1.8rem 0.2rem 0.5rem', fontSize: '0.8rem' }}
                value={simLead.moveInTimeline}
                onChange={(e) => handleSimChange('moveInTimeline', e.target.value)}
              >
                <option value="Immediate">Immediate</option>
                <option value="1-3 Months">1-3 Months</option>
                <option value="3-6 Months">3-6 Months</option>
                <option value="6+ Months">6+ Months</option>
              </select>
            </div>
          </div>
        </div>

        {/* Detailed Profile Metrics */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', background: 'var(--bg-app)', padding: '1.25rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)', fontSize: '0.85rem' }}>
          <div>
            <span style={{ color: 'var(--text-tertiary)', fontSize: '0.75rem', textTransform: 'uppercase' }}>Budget</span>
            <div style={{ fontWeight: 600, marginTop: '2px' }}>{formatINR(simLead.budget)}</div>
          </div>
          <div>
            <span style={{ color: 'var(--text-tertiary)', fontSize: '0.75rem', textTransform: 'uppercase' }}>Target Property Price</span>
            <div style={{ fontWeight: 600, marginTop: '2px' }}>{formatINR(simLead.propertyPrice)}</div>
          </div>
          <div>
            <span style={{ color: 'var(--text-tertiary)', fontSize: '0.75rem', textTransform: 'uppercase' }}>Preferred Location</span>
            <div style={{ fontWeight: 600, marginTop: '2px' }}>{simLead.preferredLocation}</div>
          </div>
          <div>
            <span style={{ color: 'var(--text-tertiary)', fontSize: '0.75rem', textTransform: 'uppercase' }}>Property Type</span>
            <div style={{ fontWeight: 600, marginTop: '2px' }}>{simLead.propertyType}</div>
          </div>
          <div>
            <span style={{ color: 'var(--text-tertiary)', fontSize: '0.75rem', textTransform: 'uppercase' }}>Lead Source</span>
            <div style={{ fontWeight: 600, marginTop: '2px' }}>{simLead.leadSource}</div>
          </div>
          <div>
            <span style={{ color: 'var(--text-tertiary)', fontSize: '0.75rem', textTransform: 'uppercase' }}>Transaction Stage</span>
            <div style={{ fontWeight: 600, marginTop: '2px' }}>{simLead.transactionStage}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
