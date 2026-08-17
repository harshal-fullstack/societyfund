import React, { useState } from 'react';
import { X, LogIn, Key, User, Home, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const { login } = useAuth();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      await login(identifier, password);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Invalid Flat Number or Email credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '440px' }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <LogIn size={20} color="var(--primary-600)" />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>Resident / Committee Login</h3>
          </div>
          <button onClick={onClose} style={{ color: 'var(--text-muted)' }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && (
              <div style={{
                background: '#fff1f2',
                border: '1px solid #fecdd3',
                color: '#be123c',
                padding: '0.65rem 0.85rem',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.78rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginBottom: '1rem'
              }}>
                <AlertCircle size={15} />
                <span>{error}</span>
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Flat Number or Email Address</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. B-201 or resident@greenwood.com"
                value={identifier}
                onChange={e => setIdentifier(e.target.value)}
                required
                autoFocus
              />
              <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                Any society resident can enter their flat number (e.g. <code>A-101</code>, <code>B-301</code>)
              </p>
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password"
                className="form-input"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
              <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                Default demo pass: <code>password123</code>
              </p>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Verifying...' : 'Sign In'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
