import React, { useState, useEffect } from 'react';
import {
  Users,
  Building,
  Search,
  Phone,
  Mail,
  Edit2,
  CheckCircle2,
  AlertCircle,
  Home,
  UserCheck
} from 'lucide-react';
import { api } from '../services/api';
import { Flat } from '../types';
import { useAuth } from '../context/AuthContext';

export const Members: React.FC = () => {
  const { role } = useAuth();
  const [flats, setFlats] = useState<Flat[]>([]);
  const [selectedWing, setSelectedWing] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Edit Modal State
  const [editingFlat, setEditingFlat] = useState<Flat | null>(null);
  const [editResidentName, setEditResidentName] = useState('');
  const [editResidentType, setEditResidentType] = useState<'owner' | 'tenant'>('owner');
  const [editPhone, setEditPhone] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchFlats = async () => {
    try {
      const data = await api.getFlats();
      setFlats(data);
    } catch (e) {
      console.error('Failed to load flats roster', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFlats();
  }, []);

  const openEditModal = (flat: Flat) => {
    setEditingFlat(flat);
    setEditResidentName(flat.residentName);
    setEditResidentType(flat.residentType);
    setEditPhone(flat.contactNumber);
    setEditEmail(flat.email);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFlat) return;

    setIsUpdating(true);
    try {
      const res = await api.updateResident(editingFlat.flatNumber, {
        residentName: editResidentName,
        residentType: editResidentType,
        contactNumber: editPhone,
        email: editEmail
      });

      setFlats(prev => prev.map(f => f.flatNumber === res.flat.flatNumber ? res.flat : f));
      setEditingFlat(null);
    } catch (err: any) {
      alert(err.message || 'Failed to update resident');
    } finally {
      setIsUpdating(false);
    }
  };

  const filtered = flats.filter((flat) => {
    const matchesWing = selectedWing === 'all' || flat.wing === selectedWing;
    const matchesSearch =
      flat.flatNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      flat.residentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      flat.ownerName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesWing && matchesSearch;
  });

  return (
    <div className="page-body">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Flats & Member Directory</h1>
          <p className="page-subtitle">
            Roster of society apartments, ownership records, occupant directory, and maintenance share
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="card" style={{ marginBottom: '1.5rem', padding: '1rem 1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div className="tabs-container" style={{ margin: 0 }}>
            <button
              className={`tab-btn ${selectedWing === 'all' ? 'active' : ''}`}
              onClick={() => setSelectedWing('all')}
            >
              All Wings ({flats.length} Flats)
            </button>
            <button
              className={`tab-btn ${selectedWing === 'A' ? 'active' : ''}`}
              onClick={() => setSelectedWing('A')}
            >
              Wing A ({flats.filter(f => f.wing === 'A').length})
            </button>
            <button
              className={`tab-btn ${selectedWing === 'B' ? 'active' : ''}`}
              onClick={() => setSelectedWing('B')}
            >
              Wing B ({flats.filter(f => f.wing === 'B').length})
            </button>
          </div>

          <div style={{ position: 'relative', width: '280px' }}>
            <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Search resident or flat..."
              className="form-input"
              style={{ paddingLeft: '2.25rem', fontSize: '0.8125rem' }}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Flats Table */}
      <div className="card">
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Flat No</th>
                <th>Wing & Floor</th>
                <th>Resident Occupant</th>
                <th>Occupancy Type</th>
                <th>Contact</th>
                <th>Area (Sq Ft)</th>
                <th>Monthly Share (₹)</th>
                <th>Dues Balance</th>
                {role === 'admin' && <th style={{ textAlign: 'right' }}>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', padding: '2rem' }}>Loading flat directory...</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    No flats found matching query.
                  </td>
                </tr>
              ) : (
                filtered.map((flat) => (
                  <tr key={flat.flatNumber}>
                    <td style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                      {flat.flatNumber}
                    </td>
                    <td style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                      Wing {flat.wing} • Floor {flat.floor}
                    </td>
                    <td>
                      <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{flat.residentName}</div>
                      {flat.residentType === 'tenant' && (
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                          Owner: {flat.ownerName}
                        </div>
                      )}
                    </td>
                    <td>
                      <span className={`badge ${flat.residentType === 'owner' ? 'badge-primary' : 'badge-info'}`} style={{ fontSize: '0.7rem' }}>
                        {flat.residentType.toUpperCase()}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem', fontSize: '0.75rem' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--text-secondary)' }}>
                          <Phone size={11} /> {flat.contactNumber}
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--text-muted)' }}>
                          <Mail size={11} /> {flat.email}
                        </span>
                      </div>
                    </td>
                    <td className="mono-num" style={{ fontSize: '0.8125rem' }}>
                      {flat.squareFeet} sq ft
                    </td>
                    <td className="mono-num" style={{ fontWeight: 600 }}>
                      ₹{flat.monthlyMaintenance.toLocaleString()}
                    </td>
                    <td>
                      {flat.balanceDue > 0 ? (
                        <span className="badge badge-overdue">
                          ₹{flat.balanceDue.toLocaleString()} Due
                        </span>
                      ) : (
                        <span className="badge badge-paid">
                          Clear
                        </span>
                      )}
                    </td>
                    {role === 'admin' && (
                      <td style={{ textAlign: 'right' }}>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => openEditModal(flat)}
                        >
                          <Edit2 size={13} />
                          <span>Edit</span>
                        </button>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Resident Modal */}
      {editingFlat && (
        <div className="modal-backdrop" onClick={() => setEditingFlat(null)}>
          <div className="modal-content" style={{ maxWidth: '480px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Edit Resident - Flat {editingFlat.flatNumber}</h3>
              <button onClick={() => setEditingFlat(null)} style={{ color: 'var(--text-muted)' }}>✕</button>
            </div>
            <form onSubmit={handleUpdate}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Resident Name</label>
                  <input
                    type="text"
                    className="form-input"
                    value={editResidentName}
                    onChange={e => setEditResidentName(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Occupancy Type</label>
                  <select
                    className="form-select"
                    value={editResidentType}
                    onChange={e => setEditResidentType(e.target.value as any)}
                  >
                    <option value="owner">Owner Occupied</option>
                    <option value="tenant">Tenant Occupied</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Contact Phone Number</label>
                  <input
                    type="text"
                    className="form-input"
                    value={editPhone}
                    onChange={e => setEditPhone(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input
                    type="email"
                    className="form-input"
                    value={editEmail}
                    onChange={e => setEditEmail(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setEditingFlat(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={isUpdating}>
                  {isUpdating ? 'Saving...' : 'Save Updates'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
