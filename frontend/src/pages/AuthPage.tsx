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
  AlertCircle,
  Eye,
  EyeOff,
  UserCheck,
  Shield
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/ToastNotification';

export const AuthPage: React.FC = () => {
  const { login, register } = useAuth();
  const { showToast } = useToast();
  const [tab, setTab] = useState<'login' | 'signup'>('login');
  
  // Login form state
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // Signup form state
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupFlat, setSignupFlat] = useState('');
  const [signupPhone, setSignupPhone] = useState('');
  const [signupRole, setSignupRole] = useState<'resident' | 'admin'>('admin');
  
  // Status states
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!loginIdentifier.trim() || !loginPassword.trim()) {
      setError('Please enter both Email/Flat Number and Password.');
      return;
    }

    setIsSubmitting(true);

    try {
      await login(loginIdentifier.trim(), loginPassword);
      showToast('success', '✅ Login Successful!', `Welcome back! Opening your portal...`, 3500);
    } catch (err: any) {
      const errMsg = err.message || 'Login failed. Please verify your credentials.';
      setError(errMsg);
      showToast('error', '❌ Login Failed', errMsg, 5000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!signupName.trim() || !signupEmail.trim() || !signupPassword.trim()) {
      setError('Full Name, Email Address, and Password are required.');
      showToast('warning', '⚠️ Missing Fields', 'Please fill in all required fields.', 4000);
      return;
    }

    if (signupPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setIsSubmitting(true);

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
      showToast('success', '✅ Registration Successful!', `Welcome ${signupName.trim()}! Your account has been created.`, 4000);
    } catch (err: any) {
      const errMsg = err.message || 'Registration failed. Please try again.';
      setError(errMsg);
      showToast('error', '❌ Registration Failed', errMsg, 5000);
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
        maxWidth: '1020px',
        background: '#ffffff',
        borderRadius: '24px',
        boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.18), 0 0 0 1px rgba(15, 23, 42, 0.05)',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
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
                  Housing Society Financial Transparency Platform
                </span>
              </div>
            </div>

            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, lineHeight: 1.3, marginBottom: '1.25rem', color: '#f8fafc' }}>
              Real-Time Financial Visibility & Audit-Ready Governance
            </h2>

            <p style={{ fontSize: '0.9rem', color: '#cbd5e1', lineHeight: 1.6, marginBottom: '2.5rem' }}>
              A modern cooperative accounting portal for housing societies. Real-time expense ledgers, monthly maintenance dues collection, statutory reserve funds tracking, and instant certified receipts.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                <div style={{ background: 'rgba(16, 185, 129, 0.2)', padding: '0.4rem', borderRadius: '8px' }}>
                  <ShieldCheck size={18} color="#34d399" />
                </div>
                <span style={{ fontSize: '0.875rem', color: '#e2e8f0', fontWeight: 500 }}>
                  Role-Based Access for Managing Committee & Resident Members
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                <div style={{ background: 'rgba(14, 165, 233, 0.2)', padding: '0.4rem', borderRadius: '8px' }}>
                  <FileText size={18} color="#38bdf8" />
                </div>
                <span style={{ fontSize: '0.875rem', color: '#e2e8f0', fontWeight: 500 }}>
                  Certified PDF Maintenance Receipts & Audit Balance Sheets
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                <div style={{ background: 'rgba(245, 158, 11, 0.2)', padding: '0.4rem', borderRadius: '8px' }}>
                  <TrendingUp size={18} color="#fbbf24" />
                </div>
                <span style={{ fontSize: '0.875rem', color: '#e2e8f0', fontWeight: 500 }}>
                  Statutory Sinking Fund & Emergency Reserve Allocations
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
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#f1f5f9' }}>Co-op Housing Society Ltd.</div>
              <div style={{ fontSize: '0.725rem', color: '#94a3b8' }}>Real-time Digital Ledger System</div>
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

        {/* Right Side: Auth Forms */}
        <div style={{ padding: '3rem 2.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
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
                Register New Account
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
                <div style={{ marginBottom: '1.25rem' }}>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#334155', marginBottom: '0.4rem' }}>
                    Email Address or Flat Number
                  </label>
                  <div style={{ position: 'relative' }}>
                    <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}>
                      <Mail size={18} />
                    </div>
                    <input
                      type="text"
                      placeholder="e.g. yourname@example.com or flat A-101"
                      value={loginIdentifier}
                      onChange={e => setLoginIdentifier(e.target.value)}
                      required
                      autoFocus
                      style={{
                        width: '100%',
                        padding: '0.75rem 0.75rem 0.75rem 2.5rem',
                        fontSize: '0.875rem',
                        border: '1px solid #cbd5e1',
                        borderRadius: '10px',
                        outline: 'none',
                        transition: 'border 0.2s',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#334155', marginBottom: '0.4rem' }}>
                    Password
                  </label>
                  <div style={{ position: 'relative' }}>
                    <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}>
                      <Lock size={18} />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your secure password"
                      value={loginPassword}
                      onChange={e => setLoginPassword(e.target.value)}
                      required
                      style={{
                        width: '100%',
                        padding: '0.75rem 2.5rem 0.75rem 2.5rem',
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
                    padding: '0.85rem',
                    background: 'linear-gradient(135deg, #0f766e 0%, #0d9488 100%)',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '10px',
                    fontWeight: 700,
                    fontSize: '0.95rem',
                    cursor: isSubmitting ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    boxShadow: '0 4px 12px rgba(13, 148, 136, 0.25)',
                    transition: 'transform 0.15s ease, opacity 0.15s ease'
                  }}
                >
                  {isSubmitting ? 'Signing in...' : (
                    <>
                      <span>Sign In to Society Portal</span>
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
                      placeholder="e.g. Rajesh Sharma"
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
                      Flat / Unit No. (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. A-101"
                      value={signupFlat}
                      onChange={e => setSignupFlat(e.target.value)}
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
                    placeholder="e.g. admin@society.com"
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
                      placeholder="+91 98000 00000"
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
                      Account Role *
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
                      <option value="admin">Managing Committee (Admin / Treasurer)</option>
                      <option value="resident">Resident Member / Owner</option>
                    </select>
                  </div>
                </div>

                <div style={{ marginBottom: '1.25rem' }}>
                  <label style={{ display: 'block', fontSize: '0.775rem', fontWeight: 600, color: '#334155', marginBottom: '0.3rem' }}>
                    Create Password * (min 6 characters)
                  </label>
                  <input
                    type="password"
                    placeholder="Choose a secure password"
                    value={signupPassword}
                    onChange={e => setSignupPassword(e.target.value)}
                    required
                    minLength={6}
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
                    padding: '0.85rem',
                    background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '10px',
                    fontWeight: 700,
                    fontSize: '0.95rem',
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
                      <span>Create Account & Enter Portal</span>
                      <UserCheck size={18} />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
