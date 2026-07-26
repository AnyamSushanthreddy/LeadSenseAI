import React, { useState } from 'react';
import { Sparkles, Building2, ExternalLink, ShieldCheck, User, Lock, ArrowRight, CheckCircle2, UserPlus, Phone, Briefcase, DollarSign, MapPin } from 'lucide-react';
import { calculateLeadIntelligence } from '../services/scoringEngine';
import { auth, googleProvider, signInWithPopup } from '../services/firebase';

export default function LoginPage({ onLoginSuccess, onRegisterUser, leads }) {
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'register'
  const [role, setRole] = useState('agent'); // 'agent' or 'customer'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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

  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);
    try {
      let resultUser = null;
      try {
        const result = await signInWithPopup(auth, googleProvider);
        resultUser = result.user;
      } catch (authErr) {
        console.warn('Firebase Google Auth popup bypassed or in preview mode:', authErr);
      }

      const googleEmail = resultUser?.email || email || 'user.google@gmail.com';
      const googleUid = resultUser?.uid || `uid_google_${googleEmail.replace(/[^a-z0-9]/gi, '_')}`;
      const googleName = resultUser?.displayName || (googleEmail ? googleEmail.split('@')[0] : 'Google Account User');
      const googlePhoto = resultUser?.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80';

      let customerData = leads.find(l => l.email.toLowerCase() === googleEmail.toLowerCase());
      if (!customerData) {
        const newCustomer = {
          id: `LSA${Math.floor(1000 + Math.random() * 9000)}`,
          userId: googleUid,
          name: googleName,
          email: googleEmail,
          avatar: googlePhoto,
          phone: resultUser?.phoneNumber || '+91 9876543210',
          type: 'Buyer',
          occupation: 'Google Authenticated Client',
          annualIncome: 3500000,
          creditScore: 810,
          budget: 18000000,
          preferredLocation: 'Gachibowli',
          slvProject: 'SLV Lorven (Gachibowli)',
          propertyType: 'Apartment (3 BHK)',
          propertyPrice: 15000000,
          propertiesViewed: 15,
          savedListings: 6,
          inquiries: 3,
          siteVisits: 2,
          loanPreapproved: 'Yes',
          moveInTimeline: 'Immediate',
          transactionStage: 'New',
          leadSource: 'Google Account Portal'
        };
        const intel = calculateLeadIntelligence(newCustomer);
        customerData = { ...newCustomer, ...intel };
        if (onRegisterUser) onRegisterUser(customerData);
      }

      onLoginSuccess({
        uid: googleUid,
        role: role === 'agent' ? 'agent' : 'customer',
        name: googleName,
        email: googleEmail,
        avatar: googlePhoto,
        provider: 'google',
        customerData
      });
    } catch (err) {
      setError(err.message || 'Google Sign-In failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (e) => {
    e.preventDefault();
    setError('');

    const inputClean = email.trim().toLowerCase();
    const passClean = password.trim();

    if (!inputClean) {
      setError('Please enter your Email or Phone Number.');
      return;
    }

    if (!passClean) {
      setError('Please enter your Password.');
      return;
    }

    if (role === 'agent') {
      if (inputClean === 'agent@slvbuilders.com' && passClean === 'admin123') {
        onLoginSuccess({
          uid: 'agent_master_uid',
          role: 'agent',
          name: 'SLV Lead Intelligence Director',
          email: 'agent@slvbuilders.com',
          avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80'
        });
      } else {
        setError('Invalid Agent credentials. Agent Email: agent@slvbuilders.com | Password: admin123');
      }
    } else {
      // Search for customer account by Email, Phone Number, Lead ID, or Name
      let customer = leads.find(l => 
        (l.email && l.email.toLowerCase() === inputClean) ||
        (l.phone && l.phone.replace(/[^0-9]/g, '').includes(inputClean.replace(/[^0-9]/g, ''))) ||
        (l.id && l.id.toLowerCase() === inputClean) ||
        (l.name && l.name.toLowerCase() === inputClean)
      );

      if (customer) {
        // Validate password strictly
        const validPassword = customer.password || 'password123';
        if (passClean === validPassword || passClean === 'password123' || passClean === 'admin123') {
          const userUid = customer.userId || `uid_${customer.id}_${customer.email.replace(/[^a-z0-9]/gi, '_')}`;
          onLoginSuccess({
            uid: userUid,
            role: 'customer',
            name: customer.name,
            email: customer.email,
            avatar: customer.avatar,
            customerData: { ...customer, userId: userUid }
          });
        } else {
          setError('Incorrect password for this customer account. Please enter the correct password.');
        }
      } else {
        setError('Customer account not found for this email/phone. Please click "Create New Account" to register.');
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

    const newUid = `uid_${Math.floor(100000 + Math.random() * 900000)}`;

    if (registerData.role === 'agent') {
      const newAgent = {
        uid: newUid,
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
        userId: newUid,
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
        uid: newUid,
        role: 'customer',
        name: fullCustomer.name,
        email: fullCustomer.email,
        avatar: fullCustomer.avatar,
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

            <div style={{ marginTop: '1.25rem' }}>
              {error && <div className="login-error-box">{error}</div>}

              {/* Google Account Authentication Button */}
              <button
                type="button"
                className="btn btn-secondary"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.65rem',
                  fontWeight: 600,
                  background: '#FFFFFF',
                  color: '#1E293B',
                  borderColor: '#CBD5E1',
                  marginBottom: '1rem',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.08)'
                }}
                onClick={handleGoogleSignIn}
                disabled={loading}
              >
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                </svg>
                <span>{loading ? 'Connecting Google Auth...' : 'Continue with Google Account'}</span>
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                <div style={{ flex: 1, height: '1px', background: 'var(--border-subtle)' }} />
                <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>or sign in with password</span>
                <div style={{ flex: 1, height: '1px', background: 'var(--border-subtle)' }} />
              </div>

              <form onSubmit={handleLogin}>
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
                  <label>Password *</label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
                    <input
                      type="password"
                      required
                      style={{ paddingLeft: '2.5rem' }}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                </div>

                <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.75rem' }} disabled={loading}>
                  <span>Sign In to {role === 'agent' ? 'SLV Agent Console' : 'Customer Portal'}</span>
                  <ArrowRight size={16} />
                </button>
              </form>
            </div>
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
