import React, { useState } from 'react';
import { Sparkles, Building2, ExternalLink, ShieldCheck, User, Lock, ArrowRight, CheckCircle2, UserPlus, Phone, Briefcase, DollarSign, MapPin } from 'lucide-react';
import { calculateLeadIntelligence } from '../services/scoringEngine';

export default function LoginPage({ onLoginSuccess, onRegisterUser, leads }) {
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'register'
  const [role, setRole] = useState('agent'); // 'agent' or 'customer'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // Register Form State
  const [registerData, setRegisterData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: 'customer',
    type: 'Buyer',
    occupation: 'Software Executive',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    annualIncome: 3000000,
    creditScore: 780,
    budget: 15000000,
    preferredLocation: 'Gachibowli',
    slvProject: 'SLV Lorven (Gachibowli)',
    propertyType: 'Apartment (3 BHK)',
    propertyPrice: 13500000,
    propertiesViewed: 10,
    savedListings: 4,
    inquiries: 2,
    siteVisits: 1,
    loanPreapproved: 'Yes',
    moveInTimeline: '1-3 Months',
    transactionStage: 'New',
    leadSource: 'SLV Website Portal',
    daysSinceLastActivity: 0
  });

  const handleLogin = (e) => {
    e.preventDefault();
    setError('');

    const inputClean = email.trim().toLowerCase();

    if (role === 'agent') {
      if (inputClean === 'agent@slvbuilders.com' || inputClean === 'agent' || inputClean === 'admin' || password === 'admin123') {
        onLoginSuccess({
          role: 'agent',
          name: 'SLV Lead Intelligence Director',
          email: 'agent@slvbuilders.com',
          avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80'
        });
      } else {
        setError('Invalid Agent credentials. Please sign in with agent@slvbuilders.com and password admin123.');
      }
    } else {
      // Flexible matching: check by Email, Phone Number, Name, or Lead ID!
      let customer = leads.find(l => 
        (l.email && l.email.toLowerCase() === inputClean) ||
        (l.phone && l.phone.replace(/[^0-9]/g, '').includes(inputClean.replace(/[^0-9]/g, ''))) ||
        (l.id && l.id.toLowerCase() === inputClean) ||
        (l.name && l.name.toLowerCase().includes(inputClean))
      );

      if (customer) {
        onLoginSuccess({
          role: 'customer',
          customerData: customer
        });
      } else {
        // Auto-create customer session for new browser login so user is never blocked
        const newId = `LSA${Math.floor(1000 + Math.random() * 9000)}`;
        const autoCustomer = {
          id: newId,
          name: email.includes('@') ? email.split('@')[0] : email,
          email: email.includes('@') ? email : `${email.replace(/\s+/g, '').toLowerCase()}@gmail.com`,
          phone: '+91 9876543210',
          type: 'Buyer',
          occupation: 'Executive Client',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
          annualIncome: 2500000,
          creditScore: 780,
          budget: 12000000,
          preferredLocation: 'Gachibowli',
          slvProject: 'SLV Lorven (Gachibowli)',
          propertyType: 'Apartment (3 BHK)',
          propertyPrice: 11000000,
          propertiesViewed: 8,
          savedListings: 3,
          inquiries: 2,
          siteVisits: 1,
          loanPreapproved: 'Yes',
          moveInTimeline: '1-3 Months',
          transactionStage: 'New',
          leadSource: 'SLV Website Portal',
          daysSinceLastActivity: 0,
          slvWebsiteUrl: 'https://sites.google.com/view/slvbuildersanddevelopers/home?pli=1'
        };
        const intel = calculateLeadIntelligence(autoCustomer);
        const fullCustomer = { ...autoCustomer, ...intel };

        if (onRegisterUser) {
          onRegisterUser(fullCustomer);
        }

        onLoginSuccess({
          role: 'customer',
          customerData: fullCustomer
        });
      }
    }
  };

  const handleRegister = (e) => {
    e.preventDefault();
    setError('');

    if (!registerData.name.trim() || !registerData.email.trim()) {
      setError('Please fill in your Name and Email address.');
      return;
    }

    if (registerData.role === 'agent') {
      const newAgent = {
        role: 'agent',
        name: registerData.name,
        email: registerData.email,
        avatar: registerData.avatar || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80'
      };
      onLoginSuccess(newAgent);
    } else {
      // Calculate AI Score for new customer
      const newId = `LSA${Math.floor(1000 + Math.random() * 9000)}`;
      const avatar = registerData.avatar || `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80`;
      const phone = registerData.phone || `+91 98${Math.floor(10000000 + Math.random() * 90000000)}`;

      const rawCustomer = {
        ...registerData,
        id: newId,
        avatar,
        phone,
        slvWebsiteUrl: 'https://sites.google.com/view/slvbuildersanddevelopers/home?pli=1'
      };

      const intel = calculateLeadIntelligence(rawCustomer);
      const fullCustomer = { ...rawCustomer, ...intel };

      if (onRegisterUser) {
        onRegisterUser(fullCustomer);
      }

      onLoginSuccess({
        role: 'customer',
        customerData: fullCustomer
      });
    }
  };

  return (
    <div className="login-page-container">
      <div className="login-card" style={{ maxWidth: authMode === 'register' ? '560px' : '480px' }}>
        {/* SLV Builders & Developers Header Banner */}
        <div className="slv-login-header">
          <div className="slv-brand-badge">
            <Building2 size={24} />
          </div>
          <div>
            <h1 className="slv-brand-title">SLV BUILDERS & DEVELOPERS</h1>
            <p className="slv-brand-sub">Powered by LeadSense-AI Lead Intelligence</p>
          </div>
        </div>

        <div className="slv-link-bar">
          <span>Official Developer Partner</span>
          <a
            href="https://sites.google.com/view/slvbuildersanddevelopers/home?pli=1"
            target="_blank"
            rel="noopener noreferrer"
            className="slv-external-link"
          >
            Visit SLV Website <ExternalLink size={12} />
          </a>
        </div>

        {/* Auth Mode Toggle (Sign In vs Create Account) */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border-subtle)', marginBottom: '1.25rem' }}>
          <button
            type="button"
            onClick={() => { setAuthMode('login'); setError(''); }}
            style={{
              flex: 1,
              padding: '0.6rem',
              background: 'transparent',
              border: 'none',
              borderBottom: authMode === 'login' ? '2px solid var(--accent-primary)' : '2px solid transparent',
              color: authMode === 'login' ? 'var(--text-primary)' : 'var(--text-tertiary)',
              fontWeight: 700,
              fontSize: '0.9rem',
              cursor: 'pointer'
            }}
          >
            Sign In to Account
          </button>
          <button
            type="button"
            onClick={() => { setAuthMode('register'); setError(''); }}
            style={{
              flex: 1,
              padding: '0.6rem',
              background: 'transparent',
              border: 'none',
              borderBottom: authMode === 'register' ? '2px solid var(--accent-primary)' : '2px solid transparent',
              color: authMode === 'register' ? 'var(--text-primary)' : 'var(--text-tertiary)',
              fontWeight: 700,
              fontSize: '0.9rem',
              cursor: 'pointer'
            }}
          >
            Create New Account
          </button>
        </div>

        {/* SIGN IN FORM */}
        {authMode === 'login' && (
          <>
            <div className="login-role-tabs">
              <button
                type="button"
                className={`role-tab-btn ${role === 'agent' ? 'active' : ''}`}
                onClick={() => { setRole('agent'); setError(''); }}
              >
                <ShieldCheck size={16} />
                <span>Agent / Broker Portal</span>
              </button>

              <button
                type="button"
                className={`role-tab-btn ${role === 'customer' ? 'active' : ''}`}
                onClick={() => { setRole('customer'); setError(''); }}
              >
                <User size={16} />
                <span>Customer Portal</span>
              </button>
            </div>

            <form onSubmit={handleLogin} style={{ marginTop: '1.25rem' }}>
              {error && <div className="login-error-box">{error}</div>}

              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label>{role === 'agent' ? 'Agent Business Email' : 'Email / Phone / Lead ID / Name'}</label>
                <div style={{ position: 'relative' }}>
                  <User size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
                  <input
                    type="text"
                    required
                    style={{ paddingLeft: '2.5rem' }}
                    placeholder={role === 'agent' ? 'agent@slvbuilders.com' : 'e.g. vivek.reddy@gmail.com or 9851992969'}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                <label>Password</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
                  <input
                    type="password"
                    style={{ paddingLeft: '2.5rem' }}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.75rem' }}>
                <span>Sign In to {role === 'agent' ? 'SLV Agent Console' : 'Customer Portal'}</span>
                <ArrowRight size={16} />
              </button>
            </form>
          </>
        )}

        {/* CREATE ACCOUNT FORM */}
        {authMode === 'register' && (
          <form onSubmit={handleRegister}>
            {error && <div className="login-error-box">{error}</div>}

            <div className="form-grid" style={{ marginTop: 0 }}>
              <div className="form-group">
                <label>Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rahul Sharma"
                  value={registerData.name}
                  onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Email Address *</label>
                <input
                  type="email"
                  required
                  placeholder="rahul@gmail.com"
                  value={registerData.email}
                  onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Phone Number *</label>
                <input
                  type="tel"
                  required
                  placeholder="+91 98765 43210"
                  value={registerData.phone}
                  onChange={(e) => setRegisterData({ ...registerData, phone: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Password *</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={registerData.password}
                  onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                />
              </div>

              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label>Profile Photo URL (Optional)</label>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <img
                    src={registerData.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                    alt="Preview"
                    style={{ width: 38, height: 38, borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--border-subtle)' }}
                  />
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/... or paste image URL"
                    value={registerData.avatar}
                    onChange={(e) => setRegisterData({ ...registerData, avatar: e.target.value })}
                    style={{ flex: 1 }}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Account Role</label>
                <select
                  value={registerData.role}
                  onChange={(e) => setRegisterData({ ...registerData, role: e.target.value })}
                >
                  <option value="customer">Customer / Buyer / Tenant</option>
                  <option value="agent">SLV Sales Agent</option>
                </select>
              </div>

              {registerData.role === 'customer' && (
                <>
                  <div className="form-group">
                    <label>Occupation</label>
                    <input
                      type="text"
                      placeholder="e.g. Software Engineer"
                      value={registerData.occupation}
                      onChange={(e) => setRegisterData({ ...registerData, occupation: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label>Annual Income (₹)</label>
                    <input
                      type="number"
                      value={registerData.annualIncome}
                      onChange={(e) => setRegisterData({ ...registerData, annualIncome: parseFloat(e.target.value) || 0 })}
                    />
                  </div>

                  <div className="form-group">
                    <label>Investment Budget (₹)</label>
                    <input
                      type="number"
                      value={registerData.budget}
                      onChange={(e) => setRegisterData({ ...registerData, budget: parseFloat(e.target.value) || 0 })}
                    />
                  </div>

                  <div className="form-group">
                    <label>Target SLV Project</label>
                    <select
                      value={registerData.slvProject}
                      onChange={(e) => setRegisterData({ ...registerData, slvProject: e.target.value })}
                    >
                      <option value="SLV Lorven (Gachibowli)">SLV Lorven (Gachibowli)</option>
                      <option value="SLV Paradise (HITECH City)">SLV Paradise (HITECH City)</option>
                      <option value="SLV Residency (Kondapur)">SLV Residency (Kondapur)</option>
                      <option value="SLV Green Meadows (Tellapur)">SLV Green Meadows (Tellapur)</option>
                      <option value="SLV Prime Heights (Financial District)">SLV Prime Heights (Financial District)</option>
                      <option value="SLV Signature Villas (Jubilee Hills)">SLV Signature Villas (Jubilee Hills)</option>
                    </select>
                  </div>
                </>
              )}
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.75rem', marginTop: '1.25rem' }}>
              <UserPlus size={16} />
              <span>Create Account & Compute AI Score</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
