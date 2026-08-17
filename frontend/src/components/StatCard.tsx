import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string;
  subtext?: string;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  icon: LucideIcon;
  iconBg?: string;
  iconColor?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtext,
  trend,
  icon: Icon,
  iconBg = 'var(--primary-50)',
  iconColor = 'var(--primary-600)'
}) => {
  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
        <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-muted)' }}>
          {title}
        </span>
        <div style={{
          width: '38px',
          height: '38px',
          borderRadius: 'var(--radius-md)',
          background: iconBg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: iconColor
        }}>
          <Icon size={20} />
        </div>
      </div>

      <div>
        <div style={{ fontSize: '1.625rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em', marginBottom: '0.25rem' }}>
          {value}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          {trend && (
            <span style={{
              fontSize: '0.72rem',
              fontWeight: 700,
              padding: '0.15rem 0.45rem',
              borderRadius: 'var(--radius-full)',
              background: trend.isPositive ? 'var(--success-bg)' : 'var(--danger-bg)',
              color: trend.isPositive ? 'var(--success-text)' : 'var(--danger-text)'
            }}>
              {trend.isPositive ? '↑' : '↓'} {trend.value}
            </span>
          )}
          {subtext && (
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              {subtext}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
