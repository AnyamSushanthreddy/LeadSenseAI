import React from 'react';
import { Users, Zap, Award, TrendingUp, DollarSign } from 'lucide-react';
import { formatINR } from '../services/scoringEngine';

export default function DashboardMetrics({ leads }) {
  const totalLeads = leads.length;
  const highPriorityLeads = leads.filter(l => l.priority === 'High').length;
  const avgScore = totalLeads ? Math.round(leads.reduce((acc, l) => acc + l.leadScore, 0) / totalLeads) : 0;
  const avgConversion = totalLeads ? Math.round(leads.reduce((acc, l) => acc + (l.conversionProbabilityVal || parseInt(l.conversionProbability)), 0) / totalLeads) : 0;
  const totalPipeline = leads.reduce((acc, l) => acc + (l.budget || 0), 0);

  return (
    <div className="metrics-grid">
      <div className="metric-card">
        <div className="metric-card-top">
          <span className="metric-label">Total Leads</span>
          <div className="metric-icon">
            <Users size={18} />
          </div>
        </div>
        <div className="metric-value">{totalLeads}</div>
        <div className="metric-footer">
          <span className="trend-pill trend-up">
            <TrendingUp size={12} /> +14.2%
          </span>
          <span style={{ color: 'var(--text-tertiary)' }}>vs last month</span>
        </div>
      </div>

      <div className="metric-card">
        <div className="metric-card-top">
          <span className="metric-label">High Priority Leads</span>
          <div className="metric-icon" style={{ color: 'var(--priority-high)', background: 'var(--priority-high-bg)' }}>
            <Zap size={18} />
          </div>
        </div>
        <div className="metric-value" style={{ color: 'var(--priority-high)' }}>
          {highPriorityLeads}
        </div>
        <div className="metric-footer">
          <span className="trend-pill trend-up">
            {Math.round((highPriorityLeads / (totalLeads || 1)) * 100)}% of total
          </span>
          <span style={{ color: 'var(--text-tertiary)' }}>ready for closing</span>
        </div>
      </div>

      <div className="metric-card">
        <div className="metric-card-top">
          <span className="metric-label">Avg Lead Score</span>
          <div className="metric-icon" style={{ color: 'var(--accent-primary)', background: 'var(--accent-glow)' }}>
            <Award size={18} />
          </div>
        </div>
        <div className="metric-value">
          {avgScore}<span style={{ fontSize: '1.1rem', color: 'var(--text-tertiary)' }}>/100</span>
        </div>
        <div className="metric-footer">
          <span className="trend-pill trend-up">+4.5 pts</span>
          <span style={{ color: 'var(--text-tertiary)' }}>AI confidence high</span>
        </div>
      </div>

      <div className="metric-card">
        <div className="metric-card-top">
          <span className="metric-label">Avg Conversion Prob.</span>
          <div className="metric-icon" style={{ color: '#3B82F6', background: 'rgba(59,130,246,0.12)' }}>
            <TrendingUp size={18} />
          </div>
        </div>
        <div className="metric-value" style={{ color: '#3B82F6' }}>
          {avgConversion}%
        </div>
        <div className="metric-footer">
          <span className="trend-pill trend-up">+2.8%</span>
          <span style={{ color: 'var(--text-tertiary)' }}>conversion velocity</span>
        </div>
      </div>

      <div className="metric-card">
        <div className="metric-card-top">
          <span className="metric-label">Pipeline Value</span>
          <div className="metric-icon">
            <DollarSign size={18} />
          </div>
        </div>
        <div className="metric-value" style={{ fontSize: '1.5rem' }}>
          {formatINR(totalPipeline)}
        </div>
        <div className="metric-footer">
          <span className="trend-pill trend-neutral">Buyer & Tenant Capacity</span>
        </div>
      </div>
    </div>
  );
}
