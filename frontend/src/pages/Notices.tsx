import React, { useState } from 'react';
import {
  Bell,
  Pin,
  Calendar,
  UserCheck,
  PlusCircle,
  X,
  FileText,
  AlertTriangle,
  Info,
  Wrench,
  Users
} from 'lucide-react';
import { initialNotices, Notice } from '../data/notices';
import { useAuth } from '../context/AuthContext';

export const Notices: React.FC = () => {
  const { role, user } = useAuth();
  const [notices, setNotices] = useState<Notice[]>(initialNotices);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // New Notice Form
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<'urgent' | 'maintenance' | 'meeting' | 'general'>('general');
  const [content, setContent] = useState('');

  const handleCreateNotice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) return;

    const newNotice: Notice = {
      id: `not_${Date.now()}`,
      title,
      date: new Date().toISOString().split('T')[0],
      category,
      issuedBy: `${user?.name || 'Managing Committee'}`,
      content,
      pinned: category === 'urgent'
    };

    setNotices([newNotice, ...notices]);
    setTitle('');
    setContent('');
    setIsCreateModalOpen(false);
  };

  const filteredNotices = notices.filter(
    n => selectedCategory === 'all' || n.category === selectedCategory
  );

  const getCategoryBadge = (cat: Notice['category']) => {
    switch (cat) {
      case 'urgent':
        return <span className="badge badge-danger"><AlertTriangle size={11} /> URGENT NOTICE</span>;
      case 'maintenance':
        return <span className="badge badge-info"><Wrench size={11} /> MAINTENANCE</span>;
      case 'meeting':
        return <span className="badge badge-primary"><Users size={11} /> SOCIETY MEETING</span>;
      default:
        return <span className="badge badge-general"><Info size={11} /> GENERAL CIRCULAR</span>;
    }
  };

  return (
    <div className="page-body">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Society Circulars & Notice Board</h1>
          <p className="page-subtitle">
            Official announcements, AGM notifications, maintenance schedules & community guidelines
          </p>
        </div>

        {role === 'admin' && (
          <button className="btn btn-primary" onClick={() => setIsCreateModalOpen(true)}>
            <PlusCircle size={16} />
            <span>Publish New Notice</span>
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {['all', 'urgent', 'maintenance', 'meeting', 'general'].map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            style={{
              padding: '0.4rem 0.85rem',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.78rem',
              fontWeight: 600,
              textTransform: 'capitalize',
              border: `1px solid ${selectedCategory === cat ? 'var(--primary-500)' : 'var(--border-medium)'}`,
              background: selectedCategory === cat ? 'var(--primary-50)' : 'var(--bg-surface)',
              color: selectedCategory === cat ? 'var(--primary-700)' : 'var(--text-secondary)',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            {cat === 'all' ? 'All Circulars' : `${cat} Notices`}
          </button>
        ))}
      </div>

      {/* Notices Grid */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {filteredNotices.map((notice) => (
          <div
            key={notice.id}
            className="card"
            style={{
              borderLeft: notice.pinned ? '4px solid var(--primary-600)' : notice.category === 'urgent' ? '4px solid var(--danger-solid)' : '1px solid var(--border-light)',
              padding: '1.25rem'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                {notice.pinned && (
                  <span style={{ color: 'var(--primary-600)', display: 'flex', alignItems: 'center', gap: '0.2rem', fontSize: '0.75rem', fontWeight: 700 }}>
                    <Pin size={14} /> Pinned
                  </span>
                )}
                {getCategoryBadge(notice.category)}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                <Calendar size={13} />
                <span>{new Date(notice.date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</span>
              </div>
            </div>

            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
              {notice.title}
            </h3>

            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '0.85rem' }}>
              {notice.content}
            </p>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-light)', paddingTop: '0.65rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <UserCheck size={14} color="var(--primary-600)" />
                <span>Issued by: <strong>{notice.issuedBy}</strong></span>
              </div>
              <span style={{ fontStyle: 'italic' }}>Greenwood Heights CHS</span>
            </div>
          </div>
        ))}
      </div>

      {/* Publish Notice Modal (Admin Only) */}
      {isCreateModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsCreateModalOpen(false)}>
          <div className="modal-content" style={{ maxWidth: '550px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <Bell size={20} color="var(--primary-600)" />
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Publish Society Notice</h3>
              </div>
              <button onClick={() => setIsCreateModalOpen(false)} style={{ color: 'var(--text-muted)' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateNotice}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Notice Title</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Lift Maintenance Schedule on Saturday"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select
                    className="form-select"
                    value={category}
                    onChange={e => setCategory(e.target.value as any)}
                  >
                    <option value="general">General Circular</option>
                    <option value="maintenance">Maintenance Work</option>
                    <option value="meeting">Society Meeting / AGM</option>
                    <option value="urgent">Urgent Notice</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Notice Content / Instructions</label>
                  <textarea
                    className="form-textarea"
                    rows={4}
                    placeholder="Write details for all residents..."
                    value={content}
                    onChange={e => setContent(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsCreateModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Publish to Notice Board
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
