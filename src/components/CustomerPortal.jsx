import React, { useState, useMemo } from 'react';
import {
  Building2, ExternalLink, Calendar, ShieldCheck, CheckCircle2, Clock, MapPin,
  Sparkles, Phone, MessageSquare, Award, ArrowUpRight, Heart, DollarSign, Camera, Check, X, Trash2, Edit2, Eye, ChevronDown, ChevronUp, Star
} from 'lucide-react';
import { formatINR, calculateLeadIntelligence } from '../services/scoringEngine';

const SLV_PROJECT_CATALOGUE = [
  {
    name: 'SLV Lorven',
    location: 'Miyapur, Hyderabad',
    mapUrl: 'https://www.google.com/maps/search/?api=1&query=SLV+Lorven+Miyapur+Hyderabad',
    type: '2 & 3 BHK Apartments',
    price: 6500000,
    area: '1,150 – 1,750 sq.ft',
    amenities: ['Swimming Pool', 'Gym', 'Clubhouse', 'Parking'],
    tag: 'Best Seller',
    tagClass: 'badge-high',
    completion: 'Ready to Move',
    image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400&auto=format&fit=crop&q=70'
  },
  {
    name: 'SLV Paradise',
    location: 'Jubilee Hills, Hyderabad',
    mapUrl: 'https://www.google.com/maps/search/?api=1&query=SLV+Paradise+Jubilee+Hills+Hyderabad',
    type: '3 & 4 BHK Luxury Apartments',
    price: 12000000,
    area: '1,800 – 2,800 sq.ft',
    amenities: ['Rooftop Garden', 'Gym', 'Concierge', 'EV Charging'],
    tag: 'Luxury',
    tagClass: 'badge-medium',
    completion: 'Dec 2025',
    image: 'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=400&auto=format&fit=crop&q=70'
  },
  {
    name: 'SLV Residency',
    location: 'Kukatpally, Hyderabad',
    mapUrl: 'https://www.google.com/maps/search/?api=1&query=SLV+Residency+Kukatpally+Hyderabad',
    type: '2 BHK Apartments',
    price: 4800000,
    area: '950 – 1,250 sq.ft',
    amenities: ['Play Area', 'Power Backup', 'Security', 'Lift'],
    tag: 'Affordable',
    tagClass: 'badge-low',
    completion: 'Ready to Move',
    image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&auto=format&fit=crop&q=70'
  },
  {
    name: 'SLV Green Meadows',
    location: 'Gachibowli, Hyderabad',
    mapUrl: 'https://www.google.com/maps/search/?api=1&query=SLV+Green+Meadows+Gachibowli+Hyderabad',
    type: '2 & 3 BHK Villas',
    price: 9500000,
    area: '1,600 – 2,400 sq.ft',
    amenities: ['Private Garden', 'Gym', 'Clubhouse', 'Solar Panels'],
    tag: 'Eco Living',
    tagClass: 'badge-medium',
    completion: 'Mar 2026',
    image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400&auto=format&fit=crop&q=70'
  },
  {
    name: 'SLV Prime Heights',
    location: 'Kondapur, Hyderabad',
    mapUrl: 'https://www.google.com/maps/search/?api=1&query=SLV+Prime+Heights+Kondapur+Hyderabad',
    type: '3 & 4 BHK Sky Residences',
    price: 15000000,
    area: '2,200 – 3,500 sq.ft',
    amenities: ['Sky Lounge', 'Infinity Pool', 'Smart Home', 'Helipad'],
    tag: 'Ultra Premium',
    tagClass: 'badge-high',
    completion: 'Jun 2026',
    image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=400&auto=format&fit=crop&q=70'
  },
  {
    name: 'SLV Signature Villas',
    location: 'Shamirpet, Hyderabad',
    mapUrl: 'https://www.google.com/maps/search/?api=1&query=SLV+Signature+Villas+Shamirpet+Hyderabad',
    type: '4 BHK Independent Villas',
    price: 22000000,
    area: '3,500 – 5,000 sq.ft',
    amenities: ['Private Pool', 'Home Theatre', 'Landscaped Garden', 'Staff Quarters'],
    tag: 'Signature',
    tagClass: 'badge-high',
    completion: 'Dec 2026',
    image: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=400&auto=format&fit=crop&q=70'
  }
];

export default function CustomerPortal({ customer, onLogout, onUpdateCustomer, onDeleteCustomer }) {
  const safeCustomer = customer || {
    id: 'LSA0001',
    name: 'Valued Client',
    email: 'client@slvbuilders.com',
    phone: '+91 9876543210',
    slvProject: 'SLV Lorven (Miyapur)',
    propertiesViewed: 3,
    siteVisits: 1,
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
  };

  const intel = calculateLeadIntelligence(safeCustomer);

  // Persistent Scheduled VIP Site Visits State
  const [scheduledVisits, setScheduledVisits] = useState(() => {
    const storageKey = `leadsense_visits_${safeCustomer.id}`;
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) return JSON.parse(stored);
    } catch (e) {}
    if (safeCustomer.scheduledVisits && Array.isArray(safeCustomer.scheduledVisits)) {
      return safeCustomer.scheduledVisits;
    }
    return [];
  });

  const [newVisitDate, setNewVisitDate] = useState('');
  const [newVisitProject, setNewVisitProject] = useState(customer.slvProject || 'SLV Lorven');
  const [newVisitTime, setNewVisitTime] = useState('11:00 AM');
  const [isScheduling, setIsScheduling] = useState(false);

  // Profile Photo Edit State
  const [isEditingPhoto, setIsEditingPhoto] = useState(false);
  const [newPhotoUrl, setNewPhotoUrl] = useState(customer.avatar || '');

  // Phone Number Edit State
  const [isEditingPhone, setIsEditingPhone] = useState(false);
  const [newPhone, setNewPhone] = useState(customer.phone || '');

  // Property Viewing Tracker State
  // viewedProjects: { projectName -> { count, lastViewed } }
  const [viewedProjects, setViewedProjects] = useState(() => {
    const storageKey = `leadsense_viewed_${customer.id}`;
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) return JSON.parse(stored);
    } catch (e) {}
    if (customer.propertiesViewed === 0) return {};
    return { [customer.slvProject]: { count: customer.propertiesViewed || 0, lastViewed: new Date().toISOString() } };
  });
  const [expandedProject, setExpandedProject] = useState(null);

  const totalViewed = Object.keys(viewedProjects).length;
  const totalViewCount = Object.values(viewedProjects).reduce((sum, p) => sum + (p.count || 0), 0);

  // Dynamic AI Prediction based on 4 Financial Metrics + Most Browsed Project + Most Site Visits
  const dynamicPrediction = useMemo(() => {
    let topBrowsed = null;
    let maxViews = 0;
    Object.entries(viewedProjects).forEach(([pName, data]) => {
      const cnt = data?.count || (typeof data === 'number' ? data : 1);
      if (cnt > maxViews) {
        maxViews = cnt;
        topBrowsed = pName;
      }
    });

    const visitCounts = {};
    if (Array.isArray(scheduledVisits)) {
      scheduledVisits.forEach(v => {
        const p = v.project || v.slvProject;
        if (p) visitCounts[p] = (visitCounts[p] || 0) + 1;
      });
    }

    let topVisited = null;
    let maxVisits = 0;
    Object.entries(visitCounts).forEach(([pName, cnt]) => {
      if (cnt > maxVisits) {
        maxVisits = cnt;
        topVisited = pName;
      }
    });

    let predicted = topVisited || topBrowsed || intel.predictedProject || 'SLV Lorven (Gachibowli)';

    return {
      predictedProject: predicted,
      topBrowsed: topBrowsed ? `${topBrowsed} (${maxViews} views)` : 'None browsed yet',
      topVisited: topVisited ? `${topVisited} (${maxVisits} visits)` : 'No site visits yet'
    };
  }, [viewedProjects, scheduledVisits, intel.predictedProject]);

  const handleViewProject = (projectName) => {
    const updated = {
      ...viewedProjects,
      [projectName]: {
        count: (viewedProjects[projectName]?.count || 0) + 1,
        lastViewed: new Date().toISOString()
      }
    };
    setViewedProjects(updated);
    setExpandedProject(expandedProject === projectName ? null : projectName);

    // Persist to localStorage
    const storageKey = `leadsense_viewed_${customer.id}`;
    try { localStorage.setItem(storageKey, JSON.stringify(updated)); } catch (e) {}

    // Update parent so agent sees updated propertiesViewed count
    const newTotalViewCount = Object.values(updated).reduce((sum, p) => sum + p.count, 0);
    if (onUpdateCustomer) {
      onUpdateCustomer({ ...customer, propertiesViewed: newTotalViewCount });
    }
  };

  const handleBookVisit = (e) => {
    e.preventDefault();
    if (!newVisitDate) return;

    const newVisits = [
      ...scheduledVisits,
      { date: newVisitDate, time: newVisitTime, project: newVisitProject, status: 'Confirmed' }
    ];
    setScheduledVisits(newVisits);

    // Save to localStorage
    const storageKey = `leadsense_visits_${customer.id}`;
    try { localStorage.setItem(storageKey, JSON.stringify(newVisits)); } catch (e) {}

    // Update parent state so agent sees updated visits & counts
    if (onUpdateCustomer) {
      onUpdateCustomer({
        ...customer,
        siteVisits: (customer.siteVisits || 0) + 1,
        scheduledVisits: newVisits
      });
    }

    setIsScheduling(false);
    setNewVisitDate('');
    setNewVisitProject(customer.slvProject || 'SLV Lorven');
    setNewVisitTime('11:00 AM');
  };

  const handleSavePhoto = (e) => {
    e.preventDefault();
    if (!newPhotoUrl.trim()) return;
    const updated = { ...customer, avatar: newPhotoUrl.trim() };
    if (onUpdateCustomer) onUpdateCustomer(updated);
    setIsEditingPhoto(false);
  };

  const handleSavePhone = (e) => {
    e.preventDefault();
    if (!newPhone.trim()) return;
    const updated = { ...customer, phone: newPhone.trim() };
    if (onUpdateCustomer) onUpdateCustomer(updated);
    setIsEditingPhone(false);
  };

  const handleDeleteMyAccount = () => {
    if (window.confirm("Are you sure you want to permanently delete your client account? This action cannot be undone.")) {
      if (onDeleteCustomer) onDeleteCustomer(customer.id);
    }
  };

  return (
    <div className="customer-portal-container">
      {/* Top SLV Partner Header */}
      <div className="slv-portal-banner">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div className="slv-brand-badge" style={{ width: 44, height: 44 }}>
            <Building2 size={24} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 700 }}>
                SLV BUILDERS & DEVELOPERS
              </h2>
              <span className="logo-ai-tag">Client Portal</span>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Official Customer Dossier • Partner Site:{' '}
              <a
                href={customer.slvWebsiteUrl}
                target="_blank"
                rel="noreferrer"
                style={{ color: 'var(--accent-primary)', textDecoration: 'none', fontWeight: 600 }}
              >
                sites.google.com/slvbuilders ↗
              </a>
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button className="btn btn-secondary" style={{ color: '#EF4444', borderColor: 'rgba(239, 68, 68, 0.3)' }} onClick={handleDeleteMyAccount}>
            <Trash2 size={14} /> Delete Account
          </button>
          <button className="btn btn-secondary" onClick={onLogout}>
            Logout Account
          </button>
        </div>
      </div>

      {/* Customer Profile Dossier */}
      <div className="customer-grid">
        {/* Left Column: Personal Dossier & AI Score */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="metric-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
              {/* Profile Avatar with Edit Photo Button */}
              <div style={{ position: 'relative' }}>
                <img src={customer.avatar} alt={customer.name} className="user-avatar" style={{ width: 68, height: 68 }} />
                <button
                  onClick={() => setIsEditingPhoto(!isEditingPhoto)}
                  title="Change Profile Photo"
                  style={{
                    position: 'absolute',
                    bottom: -2,
                    right: -2,
                    width: 26,
                    height: 26,
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
                  <Camera size={13} />
                </button>
              </div>

              <div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', fontWeight: 700 }}>
                  {customer.name}
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  {customer.occupation} • Lead ID: <span style={{ color: 'var(--accent-primary)', fontWeight: 600 }}>{customer.id}</span>
                </p>

                {/* Editable Phone Number Section */}
                {isEditingPhone ? (
                  <form onSubmit={handleSavePhone} style={{ display: 'flex', gap: '0.4rem', marginTop: '4px', alignItems: 'center' }}>
                    <input
                      type="tel"
                      required
                      value={newPhone}
                      onChange={(e) => setNewPhone(e.target.value)}
                      style={{ background: 'var(--bg-input)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', padding: '0.2rem 0.5rem', fontSize: '0.78rem', color: 'var(--text-primary)', width: '150px' }}
                    />
                    <button type="submit" className="btn btn-primary" style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}>
                      Save
                    </button>
                    <button type="button" className="icon-btn" style={{ width: 24, height: 24 }} onClick={() => setIsEditingPhone(false)}>
                      <X size={12} />
                    </button>
                  </form>
                ) : (
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-primary)', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Phone size={12} style={{ color: 'var(--accent-primary)' }} />
                    <span>{customer.phone || 'No phone added'}</span>
                    <button
                      onClick={() => { setNewPhone(customer.phone || ''); setIsEditingPhone(true); }}
                      style={{ background: 'none', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer', padding: 0 }}
                      title="Edit Phone Number"
                    >
                      <Edit2 size={12} />
                    </button>
                  </div>
                )}

                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '6px', flexWrap: 'wrap' }}>
                  <span className="badge badge-high">{customer.type}</span>
                </div>
              </div>
            </div>

            {/* Profile Photo Edit Bar */}
            {isEditingPhoto && (
              <form onSubmit={handleSavePhoto} style={{ background: 'var(--bg-app)', padding: '0.85rem', borderRadius: 'var(--radius-md)', marginBottom: '1rem', border: '1px solid var(--border-strong)' }}>
                <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                  Insert New Profile Photo URL
                </label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input
                    type="url"
                    required
                    placeholder="https://images.unsplash.com/... or image link"
                    value={newPhotoUrl}
                    onChange={(e) => setNewPhotoUrl(e.target.value)}
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

            {/* AI Predicted SLV Project Match Banner */}
            <div style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.12) 0%, rgba(16,185,129,0.08) 100%)', border: '1px solid var(--accent-primary)', borderRadius: 'var(--radius-md)', padding: '1rem', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Sparkles size={16} style={{ color: 'var(--accent-primary)' }} />
                  <span style={{ fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--accent-primary)' }}>
                    AI Predicted SLV Property Match
                  </span>
                </div>
                <span className="badge badge-high" style={{ padding: '0.2rem 0.5rem', fontSize: '0.72rem' }}>
                  {intel.conversionProbability} Match Confidence
                </span>
              </div>

              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                {dynamicPrediction.predictedProject}
              </h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.85rem' }}>
                Dynamic AI prediction calculated from your most browsed project, site visits done & 4 financial metrics:
              </p>

              {/* 4 Prediction Factors + Browsing/Visits Metrics */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem', background: 'var(--bg-app)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', fontSize: '0.78rem' }}>
                <div>
                  <span style={{ color: 'var(--text-tertiary)', fontSize: '0.7rem' }}>1. Annual Income</span>
                  <div style={{ fontWeight: 600, marginTop: '1px' }}>{formatINR(customer.annualIncome)}</div>
                </div>
                <div>
                  <span style={{ color: 'var(--text-tertiary)', fontSize: '0.7rem' }}>2. Max Investment Budget</span>
                  <div style={{ fontWeight: 600, marginTop: '1px' }}>{formatINR(customer.budget)}</div>
                </div>
                <div>
                  <span style={{ color: 'var(--text-tertiary)', fontSize: '0.7rem' }}>3. Credit Score</span>
                  <div style={{ fontWeight: 600, marginTop: '1px', color: 'var(--priority-high)' }}>{customer.creditScore}</div>
                </div>
                <div>
                  <span style={{ color: 'var(--text-tertiary)', fontSize: '0.7rem' }}>4. Bank Pre-Approval</span>
                  <div style={{ fontWeight: 600, marginTop: '1px', color: customer.loanPreapproved === 'Yes' ? 'var(--priority-high)' : 'var(--priority-medium)' }}>
                    {customer.loanPreapproved === 'Yes' ? 'Pre-Approved ✓' : 'Pending Verification'}
                  </div>
                </div>
                <div style={{ gridColumn: 'span 2', background: 'rgba(99,102,241,0.06)', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(99,102,241,0.2)', marginTop: '2px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ color: 'var(--text-tertiary)', fontSize: '0.72rem' }}>🔥 Most Browsed Project:</span>
                    <span style={{ fontWeight: 700, color: 'var(--accent-primary)' }}>{dynamicPrediction.topBrowsed}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-tertiary)', fontSize: '0.72rem' }}>📍 Most Site Visits Done:</span>
                    <span style={{ fontWeight: 700, color: 'var(--priority-high)' }}>{dynamicPrediction.topVisited}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* AI Match Meter Box */}
          <div className="ai-box">
            <div className="ai-box-title">
              <Sparkles size={16} />
              <span>Your Property AI Match Index</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', margin: '0.5rem 0' }}>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', fontWeight: 800, color: 'var(--priority-high)' }}>
                {intel.leadScore}
              </span>
              <span style={{ color: 'var(--text-tertiary)', fontSize: '1.1rem' }}>/ 100</span>
              <span className="trend-pill trend-up" style={{ marginLeft: 'auto' }}>
                {intel.conversionProbability} Match Confidence
              </span>
            </div>

            <p style={{ fontSize: '0.88rem', color: 'var(--text-primary)', lineHeight: '1.5' }}>
              {intel.aiExplanation}
            </p>

            <div style={{ background: 'var(--accent-glow)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(99,102,241,0.3)', marginTop: '0.5rem', fontSize: '0.82rem', fontWeight: 600, color: 'var(--accent-primary)' }}>
              Recommended Step: {intel.recommendedNextAction}
            </div>
          </div>

          {/* Browse All SLV Properties Card — Left Column */}
          <div className="metric-card">
            <div style={{ fontWeight: 700, fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <Star size={18} style={{ color: 'var(--accent-primary)' }} />
              <span>Browse All SLV Properties</span>
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)', marginBottom: '1rem' }}>
              Click on any project to view full details — your browsing activity is tracked automatically.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {SLV_PROJECT_CATALOGUE.map((proj) => {
                const isExpanded = expandedProject === proj.name;
                const isViewed = !!viewedProjects[proj.name];
                const isMatched = proj.name === dynamicPrediction.predictedProject || dynamicPrediction.predictedProject.includes(proj.name);
                return (
                  <div
                    key={proj.name}
                    style={{
                      background: 'var(--bg-app)',
                      border: `1px solid ${isMatched ? 'rgba(99,102,241,0.4)' : isViewed ? 'rgba(34,197,94,0.25)' : 'var(--border-subtle)'}`,
                      borderRadius: 'var(--radius-md)',
                      overflow: 'hidden',
                      cursor: 'pointer',
                      transition: 'border-color 0.2s ease'
                    }}
                  >
                    {/* Project Header Row — Click to expand */}
                    <div
                      onClick={() => handleViewProject(proj.name)}
                      style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.85rem' }}
                    >
                      <img
                        src={proj.image}
                        alt={proj.name}
                        style={{ width: 52, height: 52, borderRadius: 'var(--radius-sm)', objectFit: 'cover', flexShrink: 0 }}
                      />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                          <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{proj.name}</span>
                          <span className={`badge ${proj.tagClass}`}>{proj.tag}</span>
                          {isMatched && <span className="badge badge-high">✓ Your Match</span>}
                          {isViewed && !isMatched && <span style={{ fontSize: '0.68rem', color: 'var(--priority-high)' }}>✓ Viewed</span>}
                        </div>
                        <div style={{ fontSize: '0.75rem', marginTop: '2px' }}>
                          <a
                            href={proj.mapUrl}
                            target="_blank"
                            rel="noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            style={{ color: '#4285F4', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '3px', fontWeight: 600 }}
                            title="Open location on Google Maps"
                          >
                            <MapPin size={11} style={{ color: '#EA4335' }} /> {proj.location} ↗
                          </a>
                        </div>
                        <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--accent-primary)', marginTop: '2px' }}>{formatINR(proj.price)} onwards</div>
                      </div>
                      <div style={{ color: 'var(--text-tertiary)', flexShrink: 0 }}>{isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}</div>
                    </div>
                    {/* Expanded Project Details */}
                    {isExpanded && (
                      <div style={{ borderTop: '1px solid var(--border-subtle)', padding: '0.9rem 0.85rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem', fontSize: '0.8rem' }}>
                          <div>
                            <span style={{ color: 'var(--text-tertiary)', fontSize: '0.72rem', textTransform: 'uppercase' }}>Property Type</span>
                            <div style={{ fontWeight: 600, marginTop: '2px' }}>{proj.type}</div>
                          </div>
                          <div>
                            <span style={{ color: 'var(--text-tertiary)', fontSize: '0.72rem', textTransform: 'uppercase' }}>Area Range</span>
                            <div style={{ fontWeight: 600, marginTop: '2px' }}>{proj.area}</div>
                          </div>
                          <div>
                            <span style={{ color: 'var(--text-tertiary)', fontSize: '0.72rem', textTransform: 'uppercase' }}>Price</span>
                            <div style={{ fontWeight: 600, color: 'var(--accent-primary)', marginTop: '2px' }}>{formatINR(proj.price)}+</div>
                          </div>
                          <div>
                            <span style={{ color: 'var(--text-tertiary)', fontSize: '0.72rem', textTransform: 'uppercase' }}>Possession</span>
                            <div style={{ fontWeight: 600, marginTop: '2px' }}>{proj.completion}</div>
                          </div>
                        </div>
                        <div>
                          <span style={{ color: 'var(--text-tertiary)', fontSize: '0.72rem', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>Amenities</span>
                          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                            {proj.amenities.map(a => (
                              <span key={a} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: '4px', padding: '2px 8px', fontSize: '0.72rem', color: 'var(--text-secondary)' }}>{a}</span>
                            ))}
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <a href={proj.mapUrl} target="_blank" rel="noreferrer" className="btn btn-secondary" style={{ flex: 1, textDecoration: 'none', fontSize: '0.78rem', textAlign: 'center', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                            <MapPin size={13} style={{ color: '#EA4335' }} /> Google Map
                          </a>
                          <a href={customer.slvWebsiteUrl} target="_blank" rel="noreferrer" className="btn btn-secondary" style={{ flex: 1, textDecoration: 'none', fontSize: '0.78rem', textAlign: 'center', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                            <ExternalLink size={13} /> Official Site
                          </a>
                          <button className="btn btn-primary" style={{ flex: 1, fontSize: '0.78rem' }} onClick={() => { setNewVisitProject(proj.name); setIsScheduling(true); }}>
                            <Calendar size={13} /> Book Visit
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Viewing History, Schedule & Advisor */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

          {/* Property Activity Tracker Card — Live Data */}
          <div className="metric-card">
            <div style={{ fontWeight: 700, fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <Eye size={18} style={{ color: 'var(--accent-primary)' }} />
              <span>Property Browsing Activity</span>
            </div>

            {/* Live Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem', marginBottom: '1.1rem' }}>
              <div style={{ background: 'var(--bg-app)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '0.85rem', textAlign: 'center' }}>
                <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--accent-primary)', fontFamily: 'var(--font-display)' }}>
                  {totalViewed}
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', marginTop: '2px', textTransform: 'uppercase' }}>Projects Browsed</div>
              </div>
              <div style={{ background: 'var(--bg-app)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '0.85rem', textAlign: 'center' }}>
                <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--priority-high)', fontFamily: 'var(--font-display)' }}>
                  {totalViewCount}
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', marginTop: '2px', textTransform: 'uppercase' }}>Total Views</div>
              </div>
              <div style={{ background: 'var(--bg-app)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '0.85rem', textAlign: 'center' }}>
                <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--priority-medium)', fontFamily: 'var(--font-display)' }}>
                  {scheduledVisits.length}
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', marginTop: '2px', textTransform: 'uppercase' }}>Site Visits Done</div>
              </div>
            </div>

            {/* Properties Viewed by Client — Live list */}
            {Object.keys(viewedProjects).length > 0 && (
              <>
                <div style={{ marginBottom: '0.5rem', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Building2 size={13} /> Properties You've Viewed
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                  {Object.entries(viewedProjects)
                    .sort((a, b) => b[1].count - a[1].count)
                    .map(([name, data]) => {
                      const proj = SLV_PROJECT_CATALOGUE.find(p => p.name === name);
                      return (
                        <div key={name} style={{ background: 'var(--bg-app)', border: '1px solid rgba(34,197,94,0.25)', borderRadius: 'var(--radius-md)', padding: '0.65rem 0.85rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>{name}</div>
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '3px' }}>
                              <a
                                href={proj?.mapUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(name + ' Hyderabad')}`}
                                target="_blank"
                                rel="noreferrer"
                                style={{ color: '#4285F4', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '3px', fontWeight: 600 }}
                                title="Open location on Google Maps"
                              >
                                <MapPin size={10} style={{ color: '#EA4335' }} /> {proj?.location || customer.preferredLocation} ↗
                              </a>
                              • {proj?.type || customer.propertyType}
                            </div>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: '3px', justifyContent: 'flex-end' }}>
                              <Eye size={10} /> {data.count} view{data.count !== 1 ? 's' : ''}
                            </div>
                            <div style={{ fontSize: '0.68rem', color: 'var(--text-tertiary)', marginTop: '2px' }}>
                              {new Date(data.lastViewed).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </>
            )}
          </div>


          {/* Site Visits Schedule Card */}
          <div className="metric-card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <div style={{ fontWeight: 700, fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Calendar size={18} style={{ color: 'var(--accent-primary)' }} />
                <span>Scheduled VIP Site Visits</span>
              </div>

              <button className="btn btn-primary" style={{ padding: '0.35rem 0.65rem', fontSize: '0.78rem' }} onClick={() => setIsScheduling(!isScheduling)}>
                + Schedule Visit
              </button>
            </div>

            {isScheduling && (
              <form onSubmit={handleBookVisit} style={{ background: 'var(--bg-app)', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1rem', border: '1px solid var(--border-strong)', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                    Select SLV Project to Visit
                  </label>
                  <select
                    required
                    value={newVisitProject}
                    onChange={(e) => setNewVisitProject(e.target.value)}
                    className="custom-select"
                    style={{ width: '100%', padding: '0.45rem 2rem 0.45rem 0.65rem', fontSize: '0.85rem' }}
                  >
                    {SLV_PROJECT_CATALOGUE.map(proj => (
                      <option key={proj.name} value={proj.name}>{proj.name} ({proj.location})</option>
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

                <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                  <button type="button" className="btn btn-secondary" style={{ fontSize: '0.8rem' }} onClick={() => setIsScheduling(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary" style={{ fontSize: '0.8rem' }}>
                    <Calendar size={14} /> Confirm Visit
                  </button>
                </div>
              </form>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {scheduledVisits.map((visit, idx) => (
                <div key={idx} style={{ background: 'var(--bg-app)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ background: 'var(--priority-high-bg)', color: 'var(--priority-high)', padding: '8px', borderRadius: 'var(--radius-sm)' }}>
                      <Calendar size={16} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>{visit.project}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        {visit.date} at {visit.time}
                      </div>
                    </div>
                  </div>
                  <span className="badge badge-high">{visit.status}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Contact Sales Advisor Card */}
          <div className="metric-card" style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.08) 0%, rgba(59,130,246,0.04) 100%)' }}>
            <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.5rem', color: 'var(--accent-primary)' }}>
              Dedicated SLV Relationship Manager
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
              Have questions about floor plans, pricing discounts, or site visits? Contact your advisor directly.
            </p>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <a href="tel:+919876543210" className="btn btn-primary" style={{ flex: 1, textDecoration: 'none', fontSize: '0.8rem' }}>
                <Phone size={14} /> Call Manager
              </a>
              <a href="https://wa.me/919876543210" target="_blank" rel="noreferrer" className="btn btn-secondary" style={{ flex: 1, textDecoration: 'none', fontSize: '0.8rem' }}>
                <MessageSquare size={14} /> WhatsApp
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
