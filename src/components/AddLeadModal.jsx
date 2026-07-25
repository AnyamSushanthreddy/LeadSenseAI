import React, { useState } from 'react';
import { X, Sparkles, UserPlus } from 'lucide-react';
import { calculateLeadIntelligence } from '../services/scoringEngine';

export default function AddLeadModal({ isOpen, onClose, onAddLead, locations }) {
  if (!isOpen) return null;

  const [formData, setFormData] = useState({
    name: '',
    occupation: 'Software Engineer',
    annualIncome: 2500000,
    creditScore: 750,
    budget: 12000000,
    preferredLocation: locations[0] || 'Gachibowli',
    propertyType: 'Apartment (3 BHK)',
    propertyPrice: 11000000,
    propertiesViewed: 12,
    savedListings: 4,
    inquiries: 2,
    siteVisits: 2,
    loanPreapproved: 'Yes',
    moveInTimeline: '1-3 Months',
    transactionStage: 'New',
    leadSource: 'Website Inquiry',
    daysSinceLastActivity: 1
  });

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    const newId = `LSA${Math.floor(1000 + Math.random() * 9000)}`;
    const avatar = `https://images.unsplash.com/photo-${1534528741775 + Math.floor(Math.random() * 1000)}?w=150&auto=format&fit=crop&q=80`;
    const email = `${formData.name.toLowerCase().replace(/\s+/g, '.')}@gmail.com`;
    const phone = `+91 98${Math.floor(10000000 + Math.random() * 90000000)}`;

    const rawLead = {
      ...formData,
      id: newId,
      avatar,
      email,
      phone,
      type: formData.budget > 4000000 ? 'Buyer' : 'Tenant'
    };

    const intel = calculateLeadIntelligence(rawLead);
    const fullLead = { ...rawLead, ...intel };

    onAddLead(fullLead);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="centered-modal" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div className="logo-badge" style={{ width: 32, height: 32 }}>
              <UserPlus size={18} />
            </div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 700 }}>
              Add New Buyer or Tenant
            </h2>
          </div>
          <button className="icon-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group">
              <label>Full Name *</label>
              <input type="text" name="name" required placeholder="e.g. Ramesh Kumar" value={formData.name} onChange={handleChange} />
            </div>

            <div className="form-group">
              <label>Occupation</label>
              <input type="text" name="occupation" placeholder="e.g. Business Owner" value={formData.occupation} onChange={handleChange} />
            </div>

            <div className="form-group">
              <label>Annual Income (₹)</label>
              <input type="number" name="annualIncome" value={formData.annualIncome} onChange={handleChange} />
            </div>

            <div className="form-group">
              <label>Budget (₹)</label>
              <input type="number" name="budget" value={formData.budget} onChange={handleChange} />
            </div>

            <div className="form-group">
              <label>Preferred Location</label>
              <select name="preferredLocation" value={formData.preferredLocation} onChange={handleChange}>
                {locations.map(loc => (
                  <option key={loc} value={loc}>{loc}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Property Type</label>
              <select name="propertyType" value={formData.propertyType} onChange={handleChange}>
                <option value="Apartment (2 BHK)">Apartment (2 BHK)</option>
                <option value="Apartment (3 BHK)">Apartment (3 BHK)</option>
                <option value="Villa">Villa</option>
                <option value="Penthouse">Penthouse</option>
                <option value="Plot">Plot</option>
              </select>
            </div>

            <div className="form-group">
              <label>Loan Pre-approved</label>
              <select name="loanPreapproved" value={formData.loanPreapproved} onChange={handleChange}>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>

            <div className="form-group">
              <label>Move-In Timeline</label>
              <select name="moveInTimeline" value={formData.moveInTimeline} onChange={handleChange}>
                <option value="Immediate">Immediate</option>
                <option value="1-3 Months">1-3 Months</option>
                <option value="3-6 Months">3-6 Months</option>
                <option value="6+ Months">6+ Months</option>
              </select>
            </div>
          </div>

          <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              <Sparkles size={16} />
              <span>Calculate AI Score & Create</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
