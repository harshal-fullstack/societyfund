import React, { useState } from 'react';
import {
  Building2,
  Lock,
  Mail,
  User,
  Phone,
  Home,
  CheckCircle2,
  ShieldCheck,
  FileText,
  TrendingUp,
  ArrowRight,
  Sparkles,
  AlertCircle,
  Eye,
  EyeOff,
  UserCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const AuthPage: React.FC = () => {
  const { login, register, switchRole } = useAuth();
  const [tab, setTab] = useState<'login' | 'signup'>('login');
  
  // Login form state
  const [loginIdentifier, setLoginIdentifier] = useState('admin@greenwood.com');
  const [loginPassword, setLoginPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  
  // Signup form state
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupFlat, setSignupFlat] = useState('A-301');
  const [signupPhone, setSignupPhone] = useState('');
  const [signupRole, setSignupRole] = useState<'resident' | 'admin'>('resident');
  
  // Status states
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setIsSubmitting(true);

    try {
      await login(loginIdentifier, loginPassword);
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setIsSubmitting(true);

    if (!signupName.trim() || !signupEmail.trim() || !signupPassword.trim()) {
      setError('Please fill in all required fields.');
      setIsSubmitting(false);
      return;
    }

    try {
      await register({
        name: signupName.trim(),
        email: signupEmail.trim(),
        password: signupPassword,
        flatNumber: signupFlat.trim(),
        phone: signupPhone.trim(),
        role: signupRole
      });
      setSuccessMsg('Account registered successfully! Accessing your portal...');
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickLogin = async (targetRole: 'admin' | 'resident', flatNo?: string) => {
    setError(null);
    setIsSubmitting(true);
    try {
      await switchRole(targetRole, flatNo);
    } catch (err: any) {
      setError('Quick login failed. Please try the regular login form.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'radial-gradient(ellipse at top left, #f8fafc 0%, #e2e8f0 50%, #cbd5e1 100%)',
      padding: '2rem 1rem',
      fontFamily: 'var(--font-sans, system-ui, -apple-system, sans-serif)'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '1080px',
        background: '#ffffff',
        borderRadius: '24px',
        boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.18), 0 0 0 1px rgba(15, 23, 42, 0.05)',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
        overflow: 'hidden'
      }}>
        {/* Left Side: Brand Showcase & Value Props */}
        <div style={{
          background: 'linear-gradient(145deg, #0f172a 0%, #1e293b 60%, #0f766e 100%)',
          color: '#ffffff',
          padding: '3rem 2.5rem',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          position: 'relative'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', marginBottom: '2rem' }}>
              <div style={{
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                width: '46px',
                height: '46px',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.35)'
              }}>
                <Building2 size={26} color="#ffffff" />
              </div>
              <div>
                <h1 style={{ fontSize: '1.45rem', fontWeight: 800, margin: 0, letterSpacing: '-0.02em', color: '#ffffff' }}>
                  SocietyFund
                </h1>
                <span style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 500 }}>
                  Housing Society Transparency Portal
                </span>
              </div>
            </div>

            <h2 style={{ fontSize: '1.85rem', fontWeight: 800, lineHeight: 1.25, marginBottom: '1.25rem', color: '#f8fafc' }}>
              Real-Time Financial Visibility & Audit-Ready Governance
            </h2>

            <p style={{ fontSize: '0.925rem', color: '#cbd5e1', lineHeight: 1.6, marginBottom: '2.5rem' }}>
              Empowering residential cooperative societies with automated maintenance invoicing, tamper-evident digital ledgers, live reserve fund monitoring, and single-click statutory balance sheets.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                <div style={{ background: 'rgba(16, 185, 129, 0.2)', padding: '0.4rem', borderRadius: '8px' }}>
                  <ShieldCheck size={18} color="#34d399" />
                </div>
                <span style={{ fontSize: '0.875rem', color: '#e2e8f0', fontWeight: 500 }}>
                  Role-Based Security (Admin, Treasurer & Resident Access)
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                <div style={{ background: 'rgba(14, 165, 233, 0.2)', padding: '0.4rem', borderRadius: '8px' }}>
                  <FileText size={18} color="#38bdf8" />
                </div>
                <span style={{ fontSize: '0.875rem', color: '#e2e8f0', fontWeight: 500 }}>
                  Instant Certified PDF Maintenance Receipts & Audit Statements
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                <div style={{ background: 'rgba(245, 158, 11, 0.2)', padding: '0.4rem', borderRadius: '8px' }}>
                  <TrendingUp size={18} color="#fbbf24" />
                </div>
                <span style={{ fontSize: '0.875rem', color: '#e2e8f0', fontWeight: 500 }}>
                  Live Sinking Fund & Emergency Reserve Allocations
                </span>
              </div>
            </div>
          </div>

          <div style={{
            marginTop: '2.5rem',
            paddingTop: '1.5rem',
            borderTop: '1px solid rgba(255, 255, 255, 0.12)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#f1f5f9' }}>Greenwood Heights CHS Ltd.</div>
              <div style={{ fontSize: '0.725rem', color: '#94a3b8' }}>Reg: BOM/HSG/10948/2018 | Navi Mumbai</div>
            </div>
            <span style={{
              background: 'rgba(16, 185, 129, 0.2)',
              color: '#34d399',
              fontSize: '0.7rem',
              fontWeight: 700,
              padding: '0.25rem 0.6rem',
              borderRadius: '999px',
              border: '1px solid rgba(52, 211, 153, 0.3)'
            }}>
              Active FY 2026-27
            </span>
          </div>
        </div>

        {/* Right Side: Auth Forms & Instant Demo Switcher */}
        <div style={{ padding: '3rem 2.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            {/* Tab Selector */}
            <div style={{
              display: 'flex',
              background: '#f1f5f9',
              padding: '0.35rem',
              borderRadius: '12px',
              marginBottom: '1.75rem'
            }}>
              <button
                type="button"
                onClick={() => { setTab('login'); setError(null); setSuccessMsg(null); }}
                style={{
                  flex: 1,
                  padding: '0.65rem',
                  borderRadius: '9px',
                  fontWeight: 700,
                  fontSize: '0.875rem',
                  border: 'none',
                  cursor: 'pointer',
                  background: tab === 'login' ? '#ffffff' : 'transparent',
                  color: tab === 'login' ? '#0f172a' : '#64748b',
                  boxShadow: tab === 'login' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
                  transition: 'all 0.2s ease'
                }}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => { setTab('signup'); setError(null); setSuccessMsg(null); }}
                style={{
                  flex: 1,
                  padding: '0.65rem',
                  borderRadius: '9px',
                  fontWeight: 700,
                  fontSize: '0.875rem',
                  border: 'none',
                  cursor: 'pointer',
                  background: tab === 'signup' ? '#ffffff' : 'transparent',
                  color: tab === 'signup' ? '#0f172a' : '#64748b',
                  boxShadow: tab === 'signup' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
                  transition: 'all 0.2s ease'
                }}
              >
                New Resident Registration
              </button>
            </div>

            {/* Error & Success Alerts */}
            {error && (
              <div style={{
                background: '#fff1f2',
                border: '1px solid #fecdd3',
                color: '#be123c',
                padding: '0.75rem 1rem',
                borderRadius: '10px',
                fontSize: '0.825rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
                marginBottom: '1.25rem'
              }}>
                <AlertCircle size={17} style={{ flexShrink: 0 }} />
                <span>{error}</span>
              </div>
            )}

            {successMsg && (
              <div style={{
                background: '#f0fdf4',
                border: '1px solid #bbf7d0',
                color: '#15803d',
                padding: '0.75rem 1rem',
                borderRadius: '10px',
                fontSize: '0.825rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
                marginBottom: '1.25rem'
              }}>
                <CheckCircle2 size={17} style={{ flexShrink: 0 }} />
                <span>{successMsg}</span>
              </div>
            )}

            {/* LOGIN FORM */}
            {tab === 'login' ? (
              <form onSubmit={handleLoginSubmit}>
                <div style={{ marginBottom: '1.15rem' }}>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#334155', marginBottom: '0.4rem' }}>
                    Flat Number or Registered Email
                  </label>
                  <div style={{ position: 'relative' }}>
                    <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}>
                      <Home size={18} />
                    </div>
                    <input
                      type="text"
                      placeholder="e.g. A-402, B-201 or admin@greenwood.com"
                      value={loginIdentifier}
                      onChange={e => setLoginIdentifier(e.target.value)}
                      required
                      style={{
                        width: '100%',
                        padding: '0.7rem 0.75rem 0.7rem 2.5rem',
                        fontSize: '0.875rem',
                        border: '1px solid #cbd5e1',
                        borderRadius: '10px',
                        outline: 'none',
                        transition: 'border 0.2s',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                  <span style={{ fontSize: '0.725rem', color: '#64748b', marginTop: '0.3rem', display: 'block' }}>
                    Tip: Enter your flat number (e.g. <code>A-101</code>, <code>A-402</code>, <code>B-201</code>) or email.
                  </span>
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                    <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#334155' }}>
                      Password
                    </label>
                    <span style={{ fontSize: '0.725rem', color: '#0f766e', fontWeight: 600 }}>
                      Demo: password123
                    </span>
                  </div>
                  <div style={{ position: 'relative' }}>
                    <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}>
                      <Lock size={18} />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter password"
                      value={loginPassword}
                      onChange={e => setLoginPassword(e.target.value)}
                      required
                      style={{
                        width: '100%',
                        padding: '0.7rem 2.5rem 0.7rem 2.5rem',
                        fontSize: '0.875rem',
                        border: '1px solid #cbd5e1',
                        borderRadius: '10px',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{
                        position: 'absolute',
                        right: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        color: '#94a3b8',
                        cursor: 'pointer',
                        padding: 0
                      }}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{
                    width: '100%',
                    padding: '0.8rem',
                    background: 'linear-gradient(135deg, #0f766e 0%, #0d9488 100%)',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '10px',
                    fontWeight: 700,
                    fontSize: '0.925rem',
                    cursor: isSubmitting ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    boxShadow: '0 4px 12px rgba(13, 148, 136, 0.25)',
                    transition: 'transform 0.15s ease, opacity 0.15s ease'
                  }}
                >
                  {isSubmitting ? 'Authenticating...' : (
                    <>
                      <span>Sign In to Dashboard</span>
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>
              </form>
            ) : (
              /* SIGNUP FORM */
              <form onSubmit={handleSignupSubmit}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem', marginBottom: '0.875rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.775rem', fontWeight: 600, color: '#334155', marginBottom: '0.3rem' }}>
                      Full Name *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Sunil Deshmukh"
                      value={signupName}
                      onChange={e => setSignupName(e.target.value)}
                      required
                      style={{
                        width: '100%',
                        padding: '0.65rem',
                        fontSize: '0.825rem',
                        border: '1px solid #cbd5e1',
                        borderRadius: '8px',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.775rem', fontWeight: 600, color: '#334155', marginBottom: '0.3rem' }}>
                      Flat / Unit No. *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. A-301"
                      value={signupFlat}
                      onChange={e => setSignupFlat(e.target.value)}
                      required
                      style={{
                        width: '100%',
                        padding: '0.65rem',
                        fontSize: '0.825rem',
                        border: '1px solid #cbd5e1',
                        borderRadius: '8px',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                </div>

                <div style={{ marginBottom: '0.875rem' }}>
                  <label style={{ display: 'block', fontSize: '0.775rem', fontWeight: 600, color: '#334155', marginBottom: '0.3rem' }}>
                    Email Address *
                  </label>
                  <input
                    type="email"
                    placeholder="e.g. sunil@example.com"
                    value={signupEmail}
                    onChange={e => setSignupEmail(e.target.value)}
                    required
                    style={{
                      width: '100%',
                      padding: '0.65rem',
                      fontSize: '0.825rem',
                      border: '1px solid #cbd5e1',
                      borderRadius: '8px',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem', marginBottom: '0.875rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.775rem', fontWeight: 600, color: '#334155', marginBottom: '0.3rem' }}>
                      Phone (Optional)
                    </label>
                    <input
                      type="tel"
                      placeholder="+91 98200 12345"
                      value={signupPhone}
                      onChange={e => setSignupPhone(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.65rem',
                        fontSize: '0.825rem',
                        border: '1px solid #cbd5e1',
                        borderRadius: '8px',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.775rem', fontWeight: 600, color: '#334155', marginBottom: '0.3rem' }}>
                      Account Role
                    </label>
                    <select
                      value={signupRole}
                      onChange={e => setSignupRole(e.target.value as any)}
                      style={{
                        width: '100%',
                        padding: '0.65rem',
                        fontSize: '0.825rem',
                        border: '1px solid #cbd5e1',
                        borderRadius: '8px',
                        outline: 'none',
                        background: '#ffffff',
                        boxSizing: 'border-box'
                      }}
                    >
                      <option value="resident">Resident Member</option>
                      <option value="admin">Managing Committee</option>
                    </select>
                  </div>
                </div>

                <div style={{ marginBottom: '1.25rem' }}>
                  <label style={{ display: 'block', fontSize: '0.775rem', fontWeight: 600, color: '#334155', marginBottom: '0.3rem' }}>
                    Password *
                  </label>
                  <input
                    type="password"
                    placeholder="Create a secure password"
                    value={signupPassword}
                    onChange={e => setSignupPassword(e.target.value)}
                    required
                    style={{
                      width: '100%',
                      padding: '0.65rem',
                      fontSize: '0.825rem',
                      border: '1px solid #cbd5e1',
                      borderRadius: '8px',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{
                    width: '100%',
                    padding: '0.8rem',
                    background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '10px',
                    fontWeight: 700,
                    fontSize: '0.925rem',
                    cursor: isSubmitting ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.25)'
                  }}
                >
                  {isSubmitting ? 'Registering Account...' : (
                    <>
                      <span>Complete Registration</span>
                      <UserCheck size={18} />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>

          {/* Quick Demo Access Bar */}
          <div style={{
            marginTop: '2rem',
            paddingTop: '1.5rem',
            borderTop: '1px dashed #cbd5e1'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.75rem' }}>
              <Sparkles size={16} color="#0f766e" />
              <span style={{ fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#475569' }}>
                Instant Evaluation Demo Access
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.5rem' }}>
              <button
                type="button"
                onClick={() => handleQuickLogin('admin')}
                style={{
                  padding: '0.55rem 0.65rem',
                  background: '#f8fafc',
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = '#0f766e')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = '#cbd5e1')}
              >
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0f172a' }}>👑 Committee Admin</div>
                <div style={{ fontSize: '0.675rem', color: '#64748b' }}>Treasurer (A-101)</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('resident', 'A-402')}
                style={{
                  padding: '0.55rem 0.65rem',
                  background: '#f8fafc',
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = '#0f766e')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = '#cbd5e1')}
              >
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0f172a' }}>🏡 Resident Owner</div>
                <div style={{ fontSize: '0.675rem', color: '#64748b' }}>Priya (Flat A-402)</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('resident', 'B-201')}
                style={{
                  padding: '0.55rem 0.65rem',
                  background: '#f8fafc',
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = '#0f766e')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = '#cbd5e1')}
              >
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0f172a' }}>🏢 Resident Tenant</div>
                <div style={{ fontSize: '0.675rem', color: '#64748b' }}>Vikram (Flat B-201)</div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
