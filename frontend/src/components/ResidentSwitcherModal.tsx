import React, { useState, useEffect } from 'react';
import { X, Users, Home, CheckCircle2, AlertCircle, Shield, ArrowRight } from 'lucide-react';
import { api } from '../services/api';
import { Flat } from '../types';
import { useAuth } from '../context/AuthContext';

interface ResidentSwitcherModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ResidentSwitcherModal: React.FC<ResidentSwitcherModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const { user, role, switchRole, switchFlat } = useAuth();
  const [flats, setFlats] = useState<Flat[]>([]);
  const [activeWing, setActiveWing] = useState<'all' | 'A' | 'B'>('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchFlats = async () => {
      try {
        const data = await api.getFlats();
        setFlats(data);
      } catch (e) {
        console.error('Failed to load flats', e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchFlats();
  }, []);

  const handleSelectResident = async (flatNumber: string) => {
    await switchFlat(flatNumber);
    onClose();
  };

  const handleSelectAdmin = async () => {
    await switchRole('admin');
    onClose();
  };

  const filteredFlats = flats.filter(f => activeWing === 'all' || f.wing === activeWing);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '780px' }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <Users size={20} color="var(--primary-600)" />
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>Society Resident Directory & Fast Login</h3>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
              Select any of the 16 society flats to test their personalized resident portal, dues, and payment history
            </p>
          </div>
          <button onClick={onClose} style={{ color: 'var(--text-muted)' }}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body" style={{ padding: '1.25rem' }}>
          {/* Quick Admin Option */}
          <div
            onClick={handleSelectAdmin}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.85rem 1.15rem',
              background: role === 'admin' ? 'var(--primary-50)' : 'var(--bg-surface-subtle)',
              border: `1.5px solid ${role === 'admin' ? 'var(--primary-500)' : 'var(--border-light)'}`,
              borderRadius: 'var(--radius-lg)',
              marginBottom: '1.25rem',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: 'var(--radius-full)',
                background: 'var(--primary-600)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Shield size={18} />
              </div>
              <div>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  Rajesh Sharma (Treasurer / Managing Committee)
                </h4>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Full administrative & audit privileges (record income, log vouchers, budget control)
                </p>
              </div>
            </div>

            {role === 'admin' ? (
              <span className="badge badge-primary">ACTIVE SESSION</span>
            ) : (
              <button className="btn btn-outline btn-sm">Switch to Admin</button>
            )}
          </div>

          {/* Wing Filter */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
              All 16 Society Resident Units:
            </span>
            <div style={{ display: 'flex', gap: '0.35rem' }}>
              <button
                className={`btn btn-sm ${activeWing === 'all' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setActiveWing('all')}
                style={{ padding: '0.2rem 0.6rem', fontSize: '0.72rem' }}
              >
                All Wings (16)
              </button>
              <button
                className={`btn btn-sm ${activeWing === 'A' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setActiveWing('A')}
                style={{ padding: '0.2rem 0.6rem', fontSize: '0.72rem' }}
              >
                Wing A (8)
              </button>
              <button
                className={`btn btn-sm ${activeWing === 'B' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setActiveWing('B')}
                style={{ padding: '0.2rem 0.6rem', fontSize: '0.72rem' }}
              >
                Wing B (8)
              </button>
            </div>
          </div>

          {/* Resident Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
            gap: '0.75rem',
            maxHeight: '360px',
            overflowY: 'auto',
            paddingRight: '0.25rem'
          }}>
            {filteredFlats.map((f) => {
              const isCurrent = role === 'resident' && user?.flatNumber === f.flatNumber;
              const hasDues = f.balanceDue > 0;

              return (
                <div
                  key={f.flatNumber}
                  onClick={() => handleSelectResident(f.flatNumber)}
                  style={{
                    padding: '0.85rem',
                    borderRadius: 'var(--radius-md)',
                    border: `1.5px solid ${isCurrent ? 'var(--primary-500)' : 'var(--border-light)'}`,
                    background: isCurrent ? 'var(--primary-50)' : 'var(--bg-surface)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                      <span style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--primary-700)' }}>
                        Flat {f.flatNumber}
                      </span>
                      <span className={`badge ${hasDues ? 'badge-overdue' : 'badge-paid'}`} style={{ fontSize: '0.65rem', padding: '0.15rem 0.4rem' }}>
                        {hasDues ? `₹${f.balanceDue.toLocaleString()} Due` : 'Paid'}
                      </span>
                    </div>

                    <h5 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.15rem' }}>
                      {f.residentName}
                    </h5>

                    <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                      {f.residentType === 'owner' ? 'Owner' : 'Tenant'} • Floor {f.floor} • {f.squareFeet} sq ft
                    </p>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.6rem', borderTop: '1px solid var(--border-light)', paddingTop: '0.45rem' }}>
                    <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                      Maint: <strong className="mono-num">₹{f.monthlyMaintenance.toLocaleString()}</strong>
                    </span>

                    {isCurrent ? (
                      <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--primary-600)', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                        <CheckCircle2 size={12} /> Logged In
                      </span>
                    ) : (
                      <span style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                        Login <ArrowRight size={11} />
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="modal-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Tip: Residents can also sign in by typing their Flat Number (e.g. <code>B-201</code>) and password <code>password123</code>.
          </span>
          <button className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
