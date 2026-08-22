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
  UserCheck,
  PlusCircle,
  Trash2,
  X,
  KeyRound,
  Copy,
  Check,
  ShieldAlert
} from 'lucide-react';
import { api } from '../services/api';
import { Flat } from '../types';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/ToastNotification';

export const Members: React.FC = () => {
  const { role } = useAuth();
  const { showToast } = useToast();
  const [flats, setFlats] = useState<Flat[]>([]);
  const [selectedWing, setSelectedWing] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Add Flat Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newFlatNo, setNewFlatNo] = useState('');
  const [newWing, setNewWing] = useState('A');
  const [newFloor, setNewFloor] = useState('1');
  const [newOwnerName, setNewOwnerName] = useState('');
  const [newResidentName, setNewResidentName] = useState('');
  const [newResidentType, setNewResidentType] = useState<'owner' | 'tenant'>('owner');
  const [newPhone, setNewPhone] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newSqFt, setNewSqFt] = useState('1200');
  const [newMaintenance, setNewMaintenance] = useState('4500');
  const [newParking, setNewParking] = useState('');
  const [newInitialPass, setNewInitialPass] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  // Created Credentials Modal State
  const [credentialsModal, setCredentialsModal] = useState<{
    flatNumber: string;
    residentName: string;
    email: string;
    temporaryPassword: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  // Reset Password Modal State
  const [resetModalFlat, setResetModalFlat] = useState<Flat | null>(null);
  const [customResetPass, setCustomResetPass] = useState('');
  const [isResetting, setIsResetting] = useState(false);

  // Edit Modal State
  const [editingFlat, setEditingFlat] = useState<Flat | null>(null);
  const [editResidentName, setEditResidentName] = useState('');
  const [editOwnerName, setEditOwnerName] = useState('');
  const [editResidentType, setEditResidentType] = useState<'owner' | 'tenant'>('owner');
  const [editPhone, setEditPhone] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editMaintenance, setEditMaintenance] = useState('');
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

  const handleFlatNoChange = (val: string) => {
    setNewFlatNo(val);
    if (val.trim()) {
      const clean = val.trim().toUpperCase().replace(/[^a-zA-Z0-9]/g, '');
      setNewInitialPass(`Pass@${clean}`);
      const wingMatch = val.match(/^([A-Za-z]+)/);
      if (wingMatch) setNewWing(wingMatch[1].toUpperCase());
      const floorMatch = val.match(/(\d+)/);
      if (floorMatch) setNewFloor(floorMatch[1][0] || '1');
    }
  };

  const handleAddFlat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFlatNo.trim() || !newResidentName.trim()) {
      showToast('warning', '⚠️ Incomplete Form', 'Please enter Flat Number and Resident/Owner Name.', 3500);
      return;
    }

    setIsAdding(true);
    try {
      const cleanFlat = newFlatNo.trim().toUpperCase();
      const tempPass = (newInitialPass && newInitialPass.trim()) || `Pass@${cleanFlat.replace(/[^a-zA-Z0-9]/g, '')}`;

      const res = await api.createFlat({
        flatNumber: cleanFlat,
        wing: newWing,
        floor: Number(newFloor) || 1,
        ownerName: (newOwnerName || newResidentName).trim(),
        residentName: newResidentName.trim(),
        residentType: newResidentType,
        contactNumber: newPhone.trim(),
        email: newEmail.trim(),
        squareFeet: Number(newSqFt) || 1200,
        monthlyMaintenance: Number(newMaintenance) || 4500,
        parkingSlot: newParking.trim() || `P-${cleanFlat}`,
        initialPassword: tempPass
      });

      showToast('success', '✅ Flat & Resident Account Created', `Flat ${res.flat.flatNumber} added with temporary credentials!`, 4000);
      setFlats(prev => [...prev, res.flat]);
      setIsAddModalOpen(false);

      // Open Credentials popup for admin to copy/share
      setCredentialsModal({
        flatNumber: cleanFlat,
        residentName: newResidentName.trim(),
        email: newEmail.trim() || `${cleanFlat.toLowerCase().replace(/[^a-z0-9]/g, '')}@society.com`,
        temporaryPassword: tempPass
      });

      // Reset form
      setNewFlatNo('');
      setNewOwnerName('');
      setNewResidentName('');
      setNewPhone('');
      setNewEmail('');
      setNewParking('');
      setNewInitialPass('');
    } catch (err: any) {
      showToast('error', '❌ Failed to Add Flat', err.message || 'Error creating flat', 5000);
    } finally {
      setIsAdding(false);
    }
  };

  const handleAdminResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetModalFlat) return;

    setIsResetting(true);
    try {
      const res = await api.adminResetPassword({
        flatNumber: resetModalFlat.flatNumber,
        email: resetModalFlat.email,
        temporaryPassword: customResetPass.trim() || undefined
      });

      showToast('success', '🔐 Temporary Password Reset', `New temporary password set for Flat ${resetModalFlat.flatNumber}`, 4000);
      setResetModalFlat(null);

      // Show credentials modal
      setCredentialsModal({
        flatNumber: resetModalFlat.flatNumber,
        residentName: resetModalFlat.residentName,
        email: res.email || resetModalFlat.email || `${resetModalFlat.flatNumber}@society.com`,
        temporaryPassword: res.temporaryPassword
      });
    } catch (err: any) {
      showToast('error', '❌ Reset Failed', err.message || 'Failed to reset password', 5000);
    } finally {
      setIsResetting(false);
    }
  };

  const copyCredentialsText = () => {
    if (!credentialsModal) return;
    const text = `🏢 SocietyFund Portal - Resident Login Details\n━━━━━━━━━━━━━━━━━━━━\n🏠 Flat No: ${credentialsModal.flatNumber}\n👤 Resident: ${credentialsModal.residentName}\n📧 Login Email/ID: ${credentialsModal.email}\n🔑 Temporary Password: ${credentialsModal.temporaryPassword}\n🌐 Portal Link: ${window.location.origin}\n━━━━━━━━━━━━━━━━━━━━\n⚠️ Note: Please sign in with this temporary password. You will be prompted to set your own secure permanent password upon first login.`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    showToast('success', '📋 Copied!', 'Resident login details copied to clipboard.', 3000);
    setTimeout(() => setCopied(false), 2500);
  };

  const openEditModal = (flat: Flat) => {
    setEditingFlat(flat);
    setEditResidentName(flat.residentName);
    setEditOwnerName(flat.ownerName);
    setEditResidentType(flat.residentType);
    setEditPhone(flat.contactNumber);
    setEditEmail(flat.email);
    setEditMaintenance(String(flat.monthlyMaintenance));
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFlat) return;

    setIsUpdating(true);
    try {
      const res = await api.updateResident(editingFlat.flatNumber, {
        residentName: editResidentName.trim(),
        ownerName: editOwnerName.trim(),
        residentType: editResidentType,
        contactNumber: editPhone.trim(),
        email: editEmail.trim(),
        monthlyMaintenance: Number(editMaintenance) || editingFlat.monthlyMaintenance
      });

      setFlats(prev => prev.map(f => f.flatNumber === res.flat.flatNumber ? res.flat : f));
      showToast('success', '✅ Updated', `Details updated for Flat ${editingFlat.flatNumber}`, 3000);
      setEditingFlat(null);
    } catch (err: any) {
      showToast('error', '❌ Update Failed', err.message || 'Failed to update resident', 5000);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteFlat = async (flatNumber: string) => {
    if (!window.confirm(`Are you sure you want to remove Flat ${flatNumber} from the society roster?`)) return;

    try {
      await api.deleteFlat(flatNumber);
      setFlats(prev => prev.filter(f => f.flatNumber !== flatNumber));
      showToast('success', '🗑️ Flat Removed', `Flat ${flatNumber} has been removed.`, 3000);
    } catch (err: any) {
      showToast('error', '❌ Deletion Failed', err.message || 'Failed to delete flat', 5000);
    }
  };

  const wings = Array.from(new Set(flats.map(f => f.wing).filter(Boolean))).sort();

  const filtered = flats.filter((flat) => {
    const matchesWing = selectedWing === 'all' || flat.wing === selectedWing;
    const matchesSearch =
      flat.flatNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      flat.residentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      flat.ownerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      flat.email.toLowerCase().includes(searchQuery.toLowerCase());
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

        {role === 'admin' && (
          <button className="btn btn-primary" onClick={() => setIsAddModalOpen(true)}>
            <PlusCircle size={16} />
            <span>Add New Flat / Unit</span>
          </button>
        )}
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
            {wings.map(w => (
              <button
                key={w}
                className={`tab-btn ${selectedWing === w ? 'active' : ''}`}
                onClick={() => setSelectedWing(w)}
              >
                Wing {w} ({flats.filter(f => f.wing === w).length})
              </button>
            ))}
          </div>

          <div style={{ position: 'relative', width: '280px' }}>
            <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Search resident, email or flat..."
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
                  <td colSpan={9} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                    <Home size={32} style={{ margin: '0 auto 0.75rem', opacity: 0.5 }} />
                    <p style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-secondary)' }}>No Flats Registered Yet</p>
                    <p style={{ fontSize: '0.8rem', marginTop: '0.25rem' }}>
                      {role === 'admin'
                        ? 'Click "Add New Flat / Unit" above to register society apartments and member roster.'
                        : 'No flat units found in society directory.'}
                    </p>
                  </td>
                </tr>
              ) : (
                filtered.map((flat) => (
                  <tr key={flat.flatNumber}>
                    <td style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                      {flat.flatNumber}
                    </td>
                    <td style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                      Wing {flat.wing || 'A'} • Floor {flat.floor || 1}
                    </td>
                    <td>
                      <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{flat.residentName}</div>
                      {flat.residentType === 'tenant' && flat.ownerName && flat.ownerName !== flat.residentName && (
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
                        {flat.contactNumber && (
                          <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--text-secondary)' }}>
                            <Phone size={11} /> {flat.contactNumber}
                          </span>
                        )}
                        {flat.email && (
                          <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--text-muted)' }}>
                            <Mail size={11} /> {flat.email}
                          </span>
                        )}
                        {!flat.contactNumber && !flat.email && (
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>Not provided</span>
                        )}
                      </div>
                    </td>
                    <td className="mono-num" style={{ fontSize: '0.8125rem' }}>
                      {flat.squareFeet || 1200} sq ft
                    </td>
                    <td className="mono-num" style={{ fontWeight: 600 }}>
                      ₹{(flat.monthlyMaintenance || 0).toLocaleString()}
                    </td>
                    <td>
                      {(flat.balanceDue || 0) > 0 ? (
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
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.4rem' }}>
                          <button
                            className="btn btn-outline btn-sm"
                            style={{ color: '#0f766e', borderColor: '#ccfbf1', background: '#f0fdfa' }}
                            onClick={() => {
                              setResetModalFlat(flat);
                              setCustomResetPass(`Pass@${flat.flatNumber.replace(/[^a-zA-Z0-9]/g, '')}`);
                            }}
                            title="Generate / Reset Temporary Password for Resident"
                          >
                            <KeyRound size={13} />
                            <span>Reset Pass</span>
                          </button>
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => openEditModal(flat)}
                            title="Edit flat details"
                          >
                            <Edit2 size={13} />
                            <span>Edit</span>
                          </button>
                          <button
                            className="btn btn-outline btn-sm"
                            style={{ color: '#be123c', borderColor: '#fecdd3' }}
                            onClick={() => handleDeleteFlat(flat.flatNumber)}
                            title="Delete flat"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add New Flat Modal */}
      {isAddModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsAddModalOpen(false)}>
          <div className="modal-content" style={{ maxWidth: '540px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <Home size={20} color="var(--primary-600)" />
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>Add New Flat / Unit</h3>
              </div>
              <button onClick={() => setIsAddModalOpen(false)} style={{ color: 'var(--text-muted)' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddFlat}>
              <div className="modal-body">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem', marginBottom: '0.85rem' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Flat No *</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. A-101"
                      value={newFlatNo}
                      onChange={e => handleFlatNoChange(e.target.value)}
                      required
                      autoFocus
                    />
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Wing</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="A"
                      value={newWing}
                      onChange={e => setNewWing(e.target.value.toUpperCase())}
                    />
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Floor</label>
                    <input
                      type="number"
                      className="form-input"
                      placeholder="1"
                      value={newFloor}
                      onChange={e => setNewFloor(e.target.value)}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.85rem' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Resident Name *</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Amit Desai"
                      value={newResidentName}
                      onChange={e => setNewResidentName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Occupancy Type</label>
                    <select
                      className="form-input"
                      value={newResidentType}
                      onChange={e => setNewResidentType(e.target.value as any)}
                    >
                      <option value="owner">Owner Occupant</option>
                      <option value="tenant">Tenant / Renter</option>
                    </select>
                  </div>
                </div>

                {newResidentType === 'tenant' && (
                  <div className="form-group" style={{ marginBottom: '0.85rem' }}>
                    <label className="form-label">Owner Name</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Owner's full name"
                      value={newOwnerName}
                      onChange={e => setNewOwnerName(e.target.value)}
                    />
                  </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.85rem' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Contact Phone</label>
                    <input
                      type="tel"
                      className="form-input"
                      placeholder="+91 98000 00000"
                      value={newPhone}
                      onChange={e => setNewPhone(e.target.value)}
                    />
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Email Address (Login ID)</label>
                    <input
                      type="email"
                      className="form-input"
                      placeholder="resident@example.com"
                      value={newEmail}
                      onChange={e => setNewEmail(e.target.value)}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.85rem' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Area (Sq Ft)</label>
                    <input
                      type="number"
                      className="form-input"
                      value={newSqFt}
                      onChange={e => setNewSqFt(e.target.value)}
                    />
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Monthly Maintenance (₹)</label>
                    <input
                      type="number"
                      className="form-input"
                      value={newMaintenance}
                      onChange={e => setNewMaintenance(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.85rem' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Parking Slot (Optional)</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. P-A01"
                      value={newParking}
                      onChange={e => setNewParking(e.target.value)}
                    />
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <KeyRound size={13} color="var(--primary-600)" />
                      <span>Initial Temp Password</span>
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Pass@A101"
                      value={newInitialPass}
                      onChange={e => setNewInitialPass(e.target.value)}
                    />
                  </div>
                </div>

                <div style={{
                  background: '#f8fafc',
                  border: '1px dashed #cbd5e1',
                  borderRadius: '8px',
                  padding: '0.65rem 0.85rem',
                  fontSize: '0.75rem',
                  color: '#64748b',
                  lineHeight: 1.4
                }}>
                  💡 <strong>Auto Resident Setup:</strong> An account with temporary credentials will be created immediately. When the resident logs in for the first time, they will be prompted to set their own permanent password.
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsAddModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={isAdding}>
                  {isAdding ? 'Adding Flat & Generating Login...' : 'Register Flat Unit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Generated Resident Credentials Modal */}
      {credentialsModal && (
        <div className="modal-backdrop" onClick={() => setCredentialsModal(null)}>
          <div className="modal-content" style={{ maxWidth: '480px', borderRadius: '16px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header" style={{ background: '#f0fdfa', borderBottom: '1px solid #ccfbf1' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <CheckCircle2 size={22} color="#0d9488" />
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f766e', margin: 0 }}>
                    Resident Login Credentials
                  </h3>
                  <p style={{ fontSize: '0.75rem', color: '#115e59', margin: 0 }}>
                    Share these initial credentials with the resident
                  </p>
                </div>
              </div>
              <button onClick={() => setCredentialsModal(null)} style={{ color: 'var(--text-muted)' }}>
                <X size={20} />
              </button>
            </div>

            <div className="modal-body" style={{ padding: '1.5rem' }}>
              <div style={{
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '1.25rem',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
                marginBottom: '1.25rem'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.6rem', marginBottom: '0.6rem' }}>
                  <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Flat Unit:</span>
                  <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0f172a' }}>Flat {credentialsModal.flatNumber}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.6rem', marginBottom: '0.6rem' }}>
                  <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Resident Name:</span>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a' }}>{credentialsModal.residentName}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.6rem', marginBottom: '0.6rem' }}>
                  <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Login Email / ID:</span>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0d9488' }}>{credentialsModal.email}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Temporary Password:</span>
                  <span style={{
                    fontSize: '0.95rem',
                    fontWeight: 800,
                    color: '#e11d48',
                    fontFamily: 'monospace',
                    background: '#fff1f2',
                    padding: '0.2rem 0.5rem',
                    borderRadius: '6px'
                  }}>
                    {credentialsModal.temporaryPassword}
                  </span>
                </div>
              </div>

              <div style={{
                background: '#eff6ff',
                border: '1px solid #bfdbfe',
                borderRadius: '8px',
                padding: '0.75rem 1rem',
                fontSize: '0.775rem',
                color: '#1e40af',
                lineHeight: 1.45
              }}>
                🔒 <strong>First-Time Password Update:</strong> When <strong>{credentialsModal.residentName}</strong> logs in using this temporary password, the portal will immediately ask them to create their own secure permanent password.
              </div>
            </div>

            <div className="modal-footer" style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                type="button"
                className="btn btn-secondary"
                style={{ flex: 1 }}
                onClick={() => setCredentialsModal(null)}
              >
                Close
              </button>
              <button
                type="button"
                className="btn btn-primary"
                style={{ flex: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}
                onClick={copyCredentialsText}
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
                <span>{copied ? 'Copied to Clipboard!' : 'Copy Credentials'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Admin Reset Password Modal */}
      {resetModalFlat && (
        <div className="modal-backdrop" onClick={() => setResetModalFlat(null)}>
          <div className="modal-content" style={{ maxWidth: '440px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <KeyRound size={20} color="var(--primary-600)" />
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Reset Password - Flat {resetModalFlat.flatNumber}</h3>
              </div>
              <button onClick={() => setResetModalFlat(null)} style={{ color: 'var(--text-muted)' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAdminResetPassword}>
              <div className="modal-body">
                <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', marginBottom: '1rem', lineHeight: 1.45 }}>
                  Set a new temporary password for <strong>{resetModalFlat.residentName}</strong> (Flat {resetModalFlat.flatNumber}). The resident will be prompted to change it when they next log in.
                </p>

                <div className="form-group" style={{ marginBottom: '0.85rem' }}>
                  <label className="form-label">Temporary Password *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={customResetPass}
                    onChange={e => setCustomResetPass(e.target.value)}
                    placeholder="e.g. Pass@A202"
                    required
                    autoFocus
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setResetModalFlat(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={isResetting}>
                  {isResetting ? 'Resetting...' : 'Set Temporary Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Resident Modal */}
      {editingFlat && (
        <div className="modal-backdrop" onClick={() => setEditingFlat(null)}>
          <div className="modal-content" style={{ maxWidth: '480px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Edit Flat {editingFlat.flatNumber}</h3>
              <button onClick={() => setEditingFlat(null)} style={{ color: 'var(--text-muted)' }}>
                <X size={20} />
              </button>
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
                  <label className="form-label">Owner Name</label>
                  <input
                    type="text"
                    className="form-input"
                    value={editOwnerName}
                    onChange={e => setEditOwnerName(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Occupant Type</label>
                  <select
                    className="form-input"
                    value={editResidentType}
                    onChange={e => setEditResidentType(e.target.value as any)}
                  >
                    <option value="owner">Owner</option>
                    <option value="tenant">Tenant</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Contact Phone</label>
                  <input
                    type="text"
                    className="form-input"
                    value={editPhone}
                    onChange={e => setEditPhone(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input
                    type="email"
                    className="form-input"
                    value={editEmail}
                    onChange={e => setEditEmail(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Monthly Maintenance Share (₹)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={editMaintenance}
                    onChange={e => setEditMaintenance(e.target.value)}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setEditingFlat(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={isUpdating}>
                  {isUpdating ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
