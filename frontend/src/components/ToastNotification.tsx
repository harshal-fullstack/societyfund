import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { CheckCircle2, XCircle, AlertCircle, Info, X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastContextType {
  showToast: (type: ToastType, title: string, message?: string, duration?: number) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

const toastStyles: Record<ToastType, {
  bg: string;
  border: string;
  color: string;
  iconColor: string;
  progressColor: string;
  icon: React.ReactNode;
}> = {
  success: {
    bg: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
    border: '#86efac',
    color: '#14532d',
    iconColor: '#16a34a',
    progressColor: '#22c55e',
    icon: <CheckCircle2 size={20} />
  },
  error: {
    bg: 'linear-gradient(135deg, #fef2f2 0%, #fecdd3 100%)',
    border: '#fca5a5',
    color: '#7f1d1d',
    iconColor: '#dc2626',
    progressColor: '#ef4444',
    icon: <XCircle size={20} />
  },
  warning: {
    bg: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)',
    border: '#fcd34d',
    color: '#78350f',
    iconColor: '#d97706',
    progressColor: '#f59e0b',
    icon: <AlertCircle size={20} />
  },
  info: {
    bg: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
    border: '#93c5fd',
    color: '#1e3a5f',
    iconColor: '#2563eb',
    progressColor: '#3b82f6',
    icon: <Info size={20} />
  }
};

const ToastItem: React.FC<{ toast: Toast; onRemove: (id: string) => void }> = ({ toast, onRemove }) => {
  const style = toastStyles[toast.type];
  const duration = toast.duration || 4000;
  const [isExiting, setIsExiting] = useState(false);
  const [progress, setProgress] = useState(100);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();
  const startRef = useRef<number>(Date.now());
  const frameRef = useRef<number>();

  useEffect(() => {
    startRef.current = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startRef.current;
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(remaining);
      if (remaining > 0) {
        frameRef.current = requestAnimationFrame(animate);
      }
    };
    frameRef.current = requestAnimationFrame(animate);

    timerRef.current = setTimeout(() => {
      setIsExiting(true);
      setTimeout(() => onRemove(toast.id), 350);
    }, duration);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [duration, toast.id, onRemove]);

  const handleClose = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (frameRef.current) cancelAnimationFrame(frameRef.current);
    setIsExiting(true);
    setTimeout(() => onRemove(toast.id), 350);
  };

  return (
    <div
      style={{
        background: style.bg,
        border: `1.5px solid ${style.border}`,
        borderRadius: '14px',
        padding: '0.95rem 1.15rem',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '0.75rem',
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
        minWidth: '340px',
        maxWidth: '440px',
        position: 'relative',
        overflow: 'hidden',
        animation: isExiting
          ? 'toastSlideOut 0.35s ease-in forwards'
          : 'toastSlideIn 0.4s cubic-bezier(0.21, 1.02, 0.73, 1) forwards',
        transform: isExiting ? undefined : 'translateX(100%)',
        opacity: isExiting ? undefined : 0
      }}
    >
      {/* Icon */}
      <div style={{ color: style.iconColor, flexShrink: 0, marginTop: '1px' }}>
        {style.icon}
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontWeight: 700,
          fontSize: '0.875rem',
          color: style.color,
          lineHeight: 1.3,
          marginBottom: toast.message ? '0.2rem' : 0
        }}>
          {toast.title}
        </div>
        {toast.message && (
          <div style={{
            fontSize: '0.78rem',
            color: style.color,
            opacity: 0.8,
            lineHeight: 1.4
          }}>
            {toast.message}
          </div>
        )}
      </div>

      {/* Close button */}
      <button
        onClick={handleClose}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: style.color,
          opacity: 0.5,
          padding: '2px',
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          transition: 'opacity 0.15s'
        }}
        onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
        onMouseLeave={e => (e.currentTarget.style.opacity = '0.5')}
      >
        <X size={15} />
      </button>

      {/* Progress bar */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '3px',
        background: 'rgba(0,0,0,0.06)',
        borderRadius: '0 0 14px 14px',
        overflow: 'hidden'
      }}>
        <div style={{
          height: '100%',
          width: `${progress}%`,
          background: style.progressColor,
          borderRadius: '0 0 14px 14px',
          transition: 'none'
        }} />
      </div>
    </div>
  );
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const showToast = useCallback((type: ToastType, title: string, message?: string, duration?: number) => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    setToasts(prev => [...prev, { id, type, title, message, duration }]);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      {/* Toast Container - Fixed top-right */}
      {toasts.length > 0 && (
        <div
          style={{
            position: 'fixed',
            top: '1.25rem',
            right: '1.25rem',
            zIndex: 99999,
            display: 'flex',
            flexDirection: 'column',
            gap: '0.65rem',
            pointerEvents: 'auto'
          }}
        >
          {toasts.map(toast => (
            <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
          ))}
        </div>
      )}

      {/* Keyframe animations */}
      <style>{`
        @keyframes toastSlideIn {
          from {
            transform: translateX(120%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        @keyframes toastSlideOut {
          from {
            transform: translateX(0);
            opacity: 1;
          }
          to {
            transform: translateX(120%);
            opacity: 0;
          }
        }
      `}</style>
    </ToastContext.Provider>
  );
};
