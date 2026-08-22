import React, { useState } from 'react';
import { Lock, ShieldCheck, CheckCircle2, AlertCircle, Eye, EyeOff, KeyRound } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from './ToastNotification';

export const FirstTimePasswordModal: React.FC = () => {
  const { user, changePassword } = useAuth();
  const { showToast } = useToast();
  
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!user || !user.mustChangePassword) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match. Please re-type correctly.');
      return;
    }

    setIsSubmitting(true);
    try {
      await changePassword(newPassword);
      showToast('success', '🔐 Password Updated!', 'Your new personal password has been activated. Welcome to your portal!', 4500);
    } catch (err: any) {
      setError(err.message || 'Failed to update password. Please try again.');
      showToast('error', '❌ Error', err.message || 'Failed to update password', 5000);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop" style={{ zIndex: 9999, backdropFilter: 'blur(6px)', background: 'rgba(15, 23, 42, 0.75)' }}>
      <div className="modal-content" style={{ maxWidth: '480px', borderRadius: '18px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)' }}>
        <div className="modal-header" style={{ background: 'linear-gradient(135deg, #0f766e 0%, #0d9488 100%)', color: '#ffffff', borderTopLeftRadius: '18px', borderTopRightRadius: '18px', padding: '1.25rem 1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: 'rgba(255, 255, 255, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <KeyRound size={22} color="#ffffff" />
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
                First-Time Sign In Setup
              </h3>
              <p style={{ fontSize: '0.78rem', color: 'rgba(255, 255, 255, 0.85)', marginTop: '0.2rem', margin: 0 }}>
                Set your private, permanent password
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ padding: '1.5rem' }}>
            <div style={{
              background: 'var(--primary-50)',
              border: '1px solid var(--primary-100)',
              borderRadius: '12px',
              padding: '0.85rem 1rem',
              marginBottom: '1.25rem',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.65rem'
            }}>
              <ShieldCheck size={20} color="var(--primary-600)" style={{ flexShrink: 0, marginTop: '0.1rem' }} />
              <div style={{ fontSize: '0.8rem', color: 'var(--primary-900)', lineHeight: 1.45 }}>
                Welcome <strong>{user.name}</strong> ({user.flatNumber && user.flatNumber !== 'N/A' ? `Flat ${user.flatNumber}` : user.email})! Your account was registered by society administration. Please create your own confidential password to secure your personal ledger & bills.
              </div>
            </div>

            {error && (
              <div style={{
                background: '#fff1f2',
                border: '1px solid #fecdd3',
                color: '#be123c',
                padding: '0.65rem 0.85rem',
                borderRadius: '8px',
                fontSize: '0.8rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginBottom: '1.1rem'
              }}>
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            <div className="form-group" style={{ marginBottom: '1.1rem' }}>
              <label className="form-label" style={{ fontWeight: 700, fontSize: '0.825rem' }}>
                New Secure Password *
              </label>
              <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}>
                  <Lock size={17} />
                </div>
                <input
                  type={showPass ? 'text' : 'password'}
                  className="form-input"
                  placeholder="At least 6 characters"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  required
                  minLength={6}
                  autoFocus
                  style={{ paddingLeft: '2.5rem', paddingRight: '2.5rem' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
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
                  {showPass ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '0.5rem' }}>
              <label className="form-label" style={{ fontWeight: 700, fontSize: '0.825rem' }}>
                Confirm New Password *
              </label>
              <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}>
                  <Lock size={17} />
                </div>
                <input
                  type={showPass ? 'text' : 'password'}
                  className="form-input"
                  placeholder="Re-type new password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                  style={{ paddingLeft: '2.5rem' }}
                />
              </div>
            </div>
          </div>

          <div className="modal-footer" style={{ padding: '1rem 1.5rem', background: '#f8fafc', borderBottomLeftRadius: '18px', borderBottomRightRadius: '18px' }}>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}
              style={{
                width: '100%',
                padding: '0.8rem',
                fontSize: '0.925rem',
                fontWeight: 700,
                background: 'linear-gradient(135deg, #0f766e 0%, #0d9488 100%)',
                boxShadow: '0 4px 12px rgba(13, 148, 136, 0.25)'
              }}
            >
              {isSubmitting ? 'Activating Security...' : 'Save Password & Enter Dashboard'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
