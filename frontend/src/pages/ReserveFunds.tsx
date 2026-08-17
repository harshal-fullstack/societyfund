import React, { useState, useEffect } from 'react';
import {
  PiggyBank,
  Shield,
  Hammer,
  Sparkles,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  Info,
  SlidersHorizontal,
  CheckCircle2
} from 'lucide-react';
import { api } from '../services/api';
import { ReserveFund } from '../types';
import { FundAdjustModal } from '../components/FundAdjustModal';
import { useAuth } from '../context/AuthContext';

export const ReserveFunds: React.FC = () => {
  const { role } = useAuth();
  const [funds, setFunds] = useState<ReserveFund[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFundForAdjust, setSelectedFundForAdjust] = useState<ReserveFund | null>(null);

  const fetchFunds = async () => {
    try {
      const data = await api.getReserveFunds();
      setFunds(data);
    } catch (e) {
      console.error('Failed to load reserve funds', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFunds();
  }, []);

  const totalReserves = funds.reduce((sum, f) => sum + f.currentBalance, 0);
  const totalTarget = funds.reduce((sum, f) => sum + f.targetAmount, 0);

  const getFundIcon = (name: string) => {
    if (name.includes('Sinking')) return Shield;
    if (name.includes('Repair')) return Hammer;
    if (name.includes('Festival')) return Sparkles;
    return Layers;
  };

  return (
    <div className="page-body">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Reserve & Sinking Funds Tracker</h1>
          <p className="page-subtitle">
            Capital reserves maintained for long-term building structural integrity, exterior painting, and emergency repairs
          </p>
        </div>
      </div>

      {/* Aggregate Overview Card */}
      <div className="card" style={{ background: 'var(--primary-gradient)', color: '#ffffff', marginBottom: '1.75rem', padding: '1.75rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'rgba(255, 255, 255, 0.8)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Total Society Capital Reserves Accumulated
            </span>
            <h2 style={{ fontSize: '2.25rem', fontWeight: 800, marginTop: '0.25rem', letterSpacing: '-0.02em' }} className="mono-num">
              ₹{totalReserves.toLocaleString()}
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.85)', marginTop: '0.35rem' }}>
              Target Portfolio: ₹{totalTarget.toLocaleString()} ({Math.round((totalReserves / totalTarget) * 100)}% Fulfilled)
            </p>
          </div>

          <div style={{ background: 'rgba(255, 255, 255, 0.15)', backdropFilter: 'blur(8px)', padding: '0.75rem 1.25rem', borderRadius: 'var(--radius-lg)', border: '1px solid rgba(255, 255, 255, 0.2)' }}>
            <p style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.8)' }}>Fixed Deposits & Liquid Assets</p>
            <p style={{ fontSize: '1.1rem', fontWeight: 800, marginTop: '0.15rem' }}>100% Compliant</p>
          </div>
        </div>
      </div>

      {/* Individual Fund Cards */}
      <div className="grid-2">
        {funds.map((fund) => {
          const Icon = getFundIcon(fund.name);
          const percent = Math.min(Math.round((fund.currentBalance / fund.targetAmount) * 100), 100);

          return (
            <div key={fund._id} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: 'var(--radius-md)',
                      background: fund.color + '15',
                      color: fund.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Icon size={22} />
                    </div>
                    <div>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                        {fund.name}
                      </h3>
                      <span className="badge badge-info" style={{ fontSize: '0.7rem', marginTop: '0.2rem' }}>
                        {fund.monthlyAllocationPercentage}% Monthly Maintenance Share
                      </span>
                    </div>
                  </div>

                  {role === 'admin' && (
                    <button
                      className="btn btn-outline btn-sm"
                      onClick={() => setSelectedFundForAdjust(fund)}
                    >
                      <SlidersHorizontal size={13} />
                      <span>Adjust</span>
                    </button>
                  )}
                </div>

                <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '1.25rem' }}>
                  {fund.description}
                </p>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.5rem' }}>
                  <div>
                    <span style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)' }} className="mono-num">
                      ₹{fund.currentBalance.toLocaleString()}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: '0.35rem' }}>
                      / ₹{fund.targetAmount.toLocaleString()} Target
                    </span>
                  </div>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: fund.color }}>
                    {percent}% Funded
                  </span>
                </div>

                {/* Progress bar */}
                <div style={{ width: '100%', height: '8px', background: 'var(--bg-surface-subtle)', borderRadius: 'var(--radius-full)', overflow: 'hidden', border: '1px solid var(--border-light)' }}>
                  <div
                    style={{
                      width: `${percent}%`,
                      height: '100%',
                      background: fund.color,
                      borderRadius: 'var(--radius-full)'
                    }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.75rem', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  <span>Audited via SBI Term Deposit #8819</span>
                  <span>Last reconciled: {new Date(fund.lastUpdated).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Statutory Bye-laws Helper */}
      <div className="card" style={{ marginTop: '1rem', background: 'var(--bg-surface-subtle)', border: '1px solid var(--border-medium)' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
          <Info size={20} color="var(--primary-600)" style={{ flexShrink: 0, marginTop: '0.15rem' }} />
          <div>
            <h4 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Housing Society Statutory Reserve Fund Guidelines (Bye-Law 67 & 68)
            </h4>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.25rem', lineHeight: 1.5 }}>
              Under state cooperative housing laws, Sinking Funds must be maintained in fixed deposits or designated government securities and cannot be utilized for day-to-day administrative operational expenses without 2/3rd General Body Resolution.
            </p>
          </div>
        </div>
      </div>

      {/* Fund Adjustment Modal */}
      <FundAdjustModal
        fund={selectedFundForAdjust}
        onClose={() => setSelectedFundForAdjust(null)}
        onSuccess={() => fetchFunds()}
      />
    </div>
  );
};
