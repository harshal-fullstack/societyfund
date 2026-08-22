import React, { useState, useEffect } from 'react';
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
  Users,
  Trash2
} from 'lucide-react';
import { api } from '../services/api';
import { Notice } from '../types';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/ToastNotification';

export const Notices: React.FC = () => {
  const { role, user } = useAuth();
  const { showToast } = useToast();
  const [notices, setNotices] = useState<Notice[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  // New Notice Form
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<'urgent' | 'maintenance' | 'meeting' | 'general'>('general');
  const [content, setContent] = useState('');

  const fetchNotices = async () => {
    try {
      const data = await api.getNotices();
      setNotices(data || []);
    } catch (e) {
      console.error('Failed to load notices', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotices();
  }, []);

  const handleCreateNotice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    setIsPublishing(true);
    try {
      const created = await api.createNotice({
        title: title.trim(),
        content: content.trim(),
        category,
        issuedBy: user?.name || 'Managing Committee',
        pinned: category === 'urgent',
        date: new Date().toISOString().split('T')[0]
      });

      setNotices(prev => [created, ...prev]);
      showToast('success', '📢 Notice Published', `Notice "${title}" published to notice board!`, 3500);
      setTitle('');
      setContent('');
      setIsCreateModalOpen(false);
    } catch (err: any) {
      showToast('error', '❌ Failed to Publish', err.message || 'Error publishing notice', 5000);
    } finally {
      setIsPublishing(false);
    }
  };

  const handleDeleteNotice = async (id: string) => {
    if (!window.confirm('Delete this circular from the notice board?')) return;

    try {
      await api.deleteNotice(id);
      setNotices(prev => prev.filter(n => n._id !== id && (n as any).id !== id));
      showToast('success', '🗑️ Notice Deleted', 'Circular removed successfully.', 3000);
    } catch (err: any) {
      showToast('error', '❌ Delete Failed', err.message || 'Failed to delete notice', 5000);
    }
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
        {isLoading ? (
          <div className="card" style={{ textAlign: 'center', padding: '2.5rem' }}>
            <p style={{ color: 'var(--text-muted)' }}>Loading society notices...</p>
          </div>
        ) : filteredNotices.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '3.5rem 1rem', color: 'var(--text-muted)' }}>
            <Bell size={32} style={{ margin: '0 auto 0.75rem', opacity: 0.4 }} />
            <p style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-secondary)' }}>No Circulars Published Yet</p>
            <p style={{ fontSize: '0.8rem', marginTop: '0.25rem' }}>
              {role === 'admin'
                ? 'Click "Publish New Notice" above to post an announcement for all members.'
                : 'There are no active notices on the notice board right now.'}
            </p>
          </div>
        ) : (
          filteredNotices.map((notice) => {
            const noticeId = notice._id || (notice as any).id || '';
            return (
              <div
                key={noticeId}
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

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      <Calendar size={13} />
                      <span>{new Date(notice.date || notice.createdAt || Date.now()).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                    </div>

                    {role === 'admin' && (
                      <button
                        onClick={() => handleDeleteNotice(noticeId)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--text-muted)',
                          cursor: 'pointer',
                          padding: '0.2rem'
                        }}
                        title="Delete Notice"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
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
                  <span style={{ fontStyle: 'italic' }}>Society Notice Board</span>
                </div>
              </div>
            );
          })
        )}
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
                  <label className="form-label">Notice Title *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Annual General Body Meeting (AGM) Notice"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    required
                    autoFocus
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select
                    className="form-input"
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
                  <label className="form-label">Notice Content / Details *</label>
                  <textarea
                    className="form-input"
                    rows={4}
                    placeholder="Write announcement details for all residents..."
                    value={content}
                    onChange={e => setContent(e.target.value)}
                    required
                    style={{ resize: 'vertical' }}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsCreateModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={isPublishing}>
                  {isPublishing ? 'Publishing...' : 'Publish to Notice Board'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
