import React from 'react';
import {
  PieChart, Pie, Cell, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, Tooltip,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';
import { PieChart as PieIcon, BarChart3, MapPin, Zap } from 'lucide-react';

export default function AnalyticsCharts({ leads }) {
  if (!leads || leads.length === 0) return null;

  // 1. Priority Data
  const highCount = leads.filter(l => l.priority === 'High').length;
  const medCount = leads.filter(l => l.priority === 'Medium').length;
  const lowCount = leads.filter(l => l.priority === 'Low').length;

  const priorityData = [
    { name: 'High Priority', value: highCount, color: '#10B981' },
    { name: 'Medium Priority', value: medCount, color: '#F59E0B' },
    { name: 'Low Priority', value: lowCount, color: '#64748B' }
  ];

  // 2. 4-Dimension Radar / Average Data
  const avgIntent = Math.round(leads.reduce((a, l) => a + l.intentScore, 0) / leads.length);
  const avgAffordability = Math.round(leads.reduce((a, l) => a + l.affordabilityScore, 0) / leads.length);
  const avgLocation = Math.round(leads.reduce((a, l) => a + l.locationFitScore, 0) / leads.length);
  const avgReadiness = Math.round(leads.reduce((a, l) => a + l.readinessScore, 0) / leads.length);

  const dimensionData = [
    { subject: 'Intent', score: avgIntent, fullMark: 100 },
    { subject: 'Affordability', score: avgAffordability, fullMark: 100 },
    { subject: 'Location Fit', score: avgLocation, fullMark: 100 },
    { subject: 'Readiness', score: avgReadiness, fullMark: 100 }
  ];

  // 3. Location Breakdown Data
  const locationCounts = {};
  leads.forEach(l => {
    locationCounts[l.preferredLocation] = (locationCounts[l.preferredLocation] || 0) + 1;
  });

  const locationData = Object.keys(locationCounts)
    .map(loc => ({ location: loc, count: locationCounts[loc] }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-strong)',
          borderRadius: '8px',
          padding: '8px 12px',
          boxShadow: 'var(--shadow-md)',
          fontSize: '0.8rem'
        }}>
          <p style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{label || payload[0].name}</p>
          <p style={{ color: 'var(--accent-primary)', marginTop: '2px' }}>
            Count/Value: {payload[0].value}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="analytics-section">
      <div className="analytics-header">
        <div className="analytics-title">
          <Zap size={18} style={{ color: 'var(--accent-primary)' }} />
          <span>AI Lead Intelligence & Distribution Analytics</span>
        </div>
      </div>

      <div className="analytics-grid">
        {/* Chart 1: Priority Distribution Donut */}
        <div className="chart-card">
          <div className="chart-card-title">
            <span>Lead Priority Split</span>
            <PieIcon size={16} />
          </div>
          <div style={{ width: '100%', height: 200 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={priorityData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={75}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {priorityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', justifyContent: 'center', marginTop: '0.5rem', fontSize: '0.78rem' }}>
            {priorityData.map(p => (
              <div key={p.name} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: p.color }} />
                <span style={{ color: 'var(--text-secondary)' }}>{p.name} ({p.value})</span>
              </div>
            ))}
          </div>
        </div>

        {/* Chart 2: 4-Dimension Radar */}
        <div className="chart-card">
          <div className="chart-card-title">
            <span>Average Core Dimensions</span>
            <BarChart3 size={16} />
          </div>
          <div style={{ width: '100%', height: 220 }}>
            <ResponsiveContainer>
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={dimensionData}>
                <PolarGrid stroke="var(--border-subtle)" />
                <PolarAngleAxis dataKey="subject" stroke="var(--text-secondary)" tick={{ fontSize: 11 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="var(--text-tertiary)" tick={{ fontSize: 9 }} />
                <Radar name="Avg Score" dataKey="score" stroke="var(--accent-primary)" fill="var(--accent-primary)" fillOpacity={0.35} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Location Breakdown */}
        <div className="chart-card">
          <div className="chart-card-title">
            <span>Top Location Demand</span>
            <MapPin size={16} />
          </div>
          <div style={{ width: '100%', height: 220 }}>
            <ResponsiveContainer>
              <BarChart data={locationData} layout="vertical" margin={{ top: 5, right: 10, left: 20, bottom: 5 }}>
                <XAxis type="number" hide />
                <YAxis dataKey="location" type="category" stroke="var(--text-secondary)" tick={{ fontSize: 11 }} width={85} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" fill="var(--accent-primary)" radius={[0, 4, 4, 0]} barSize={14} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
