import React, { useState, useEffect } from 'react';
import {
  SlidersHorizontal,
  Building,
  PlusCircle,
  Trash2,
  Lock,
  Save,
  Download,
  ShieldCheck,
  CheckCircle2,
  Layers,
  Landmark
} from 'lucide-react';
import { api } from '../services/api';
import { CategoryBudget, SocietyInfo } from '../types';
import { useAuth } from '../context/AuthContext';

export const AdminControls: React.FC = () => {
  const { role } = useAuth();
  const [categories, setCategories] = useState<CategoryBudget[]>([]);
  const [societyInfo, setSocietyInfo] = useState<SocietyInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // New Category Form
  const [newCatName, setNewCatName] = useState('');
  const [newCatType, setNewCatType] = useState<'income' | 'expense'>('expense');
  const [newCatBudget, setNewCatBudget] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');
  const [isAddingCat, setIsAddingCat] = useState(false);

  // Society Info Form
  const [societyName, setSocietyName] = useState('');
  const [regNo, setRegNo] = useState('');
  const [address, setAddress] = useState('');
  const [fy, setFy] = useState('');
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [ifsc, setIfsc] = useState('');
  const [branch, setBranch] = useState('');
  const [isSavingInfo, setIsSavingInfo] = useState(false);

  const fetchData = async () => {
    try {
      const [cats, info] = await Promise.all([
        api.getCategories(),
        api.getSocietyInfo()
      ]);
      setCategories(cats);
      setSocietyInfo(info);
      setSocietyName(info.societyName);
      setRegNo(info.registrationNumber);
      setAddress(info.address);
      setFy(info.financialYear);
      setBankName(info.bankName);
      setAccountNumber(info.accountNumber);
      setIfsc(info.ifscCode);
      setBranch(info.branch);
    } catch (e) {
      console.error('Failed to load admin controls', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName) return;

    setIsAddingCat(true);
    try {
      const created = await api.createCategory({
        name: newCatName,
        type: newCatType,
        monthlyBudget: Number(newCatBudget || 0),
        description: newCatDesc,
        color: newCatType === 'income' ? '#10b981' : '#4f46e5'
      });
      setCategories(prev => [...prev, created]);
      setNewCatName('');
      setNewCatBudget('');
      setNewCatDesc('');
    } catch (err: any) {
      alert(err.message || 'Failed to add category');
    } finally {
      setIsAddingCat(false);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!window.confirm('Delete this financial category?')) return;
    try {
      await api.deleteCategory(id);
      setCategories(prev => prev.filter(c => c._id !== id));
    } catch (err: any) {
      alert(err.message || 'Failed to delete category');
    }
  };

  const handleSaveSocietyInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingInfo(true);
    try {
      const updated = await api.updateSocietyInfo({
        societyName,
        registrationNumber: regNo,
        address,
        financialYear: fy,
        bankName,
        accountNumber,
        ifscCode: ifsc,
        branch
      });
      setSocietyInfo(updated);
      alert('Society settings & banking information updated successfully.');
    } catch (err: any) {
      alert(err.message || 'Failed to update society info');
    } finally {
      setIsSavingInfo(false);
    }
  };

  if (role !== 'admin') {
    return (
      <div className="page-body" style={{ textAlign: 'center', padding: '4rem 0' }}>
        <div style={{ maxWidth: '420px', margin: '0 auto', background: 'var(--bg-surface)', padding: '2rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-light)' }}>
          <Lock size={36} color="var(--primary-600)" style={{ margin: '0 auto 1rem auto' }} />
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>Managing Committee Only</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
            Administrative financial controls, category budget creation, and bank accounts configuration are restricted to Committee Members.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-body">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Admin Financial Controls</h1>
          <p className="page-subtitle">
            Manage financial categories, budget thresholds, society legal entity registration, and masked banking credentials
          </p>
        </div>
      </div>

      <div className="grid-2">
        {/* Section 1: Financial Categories & Budget Allocations */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">Financial Categories & Budgets</h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                Defined accounting heads for income tracking and expense allocation
              </p>
            </div>
            <span className="badge badge-info">{categories.length} Categories</span>
          </div>

          {/* Add Category Form */}
          <form onSubmit={handleAddCategory} style={{ background: 'var(--bg-surface-subtle)', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem' }}>
            <h4 style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--text-primary)' }}>
              Add New Financial Category
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
              <div>
                <label className="form-label">Category Name</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Solar Panel AMC"
                  value={newCatName}
                  onChange={e => setNewCatName(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="form-label">Type</label>
                <select
                  className="form-select"
                  value={newCatType}
                  onChange={e => setNewCatType(e.target.value as any)}
                >
                  <option value="expense">Expense</option>
                  <option value="income">Income</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
              <div>
                <label className="form-label">Monthly Budget (₹ INR)</label>
                <input
                  type="number"
                  className="form-input"
                  placeholder="e.g. 15000"
                  value={newCatBudget}
                  onChange={e => setNewCatBudget(e.target.value)}
                />
              </div>
              <div>
                <label className="form-label">Description</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Brief description"
                  value={newCatDesc}
                  onChange={e => setNewCatDesc(e.target.value)}
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-sm" disabled={isAddingCat}>
              <PlusCircle size={14} />
              <span>{isAddingCat ? 'Adding...' : 'Add Category'}</span>
            </button>
          </form>

          {/* Categories List */}
          <div style={{ maxHeight: '350px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {categories.map((cat) => (
              <div
                key={cat._id || cat.name}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '0.75rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-light)',
                  background: 'var(--bg-surface)'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                    <span className={`badge ${cat.type === 'income' ? 'badge-paid' : 'badge-danger'}`} style={{ fontSize: '0.65rem' }}>
                      {cat.type.toUpperCase()}
                    </span>
                    <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>{cat.name}</span>
                  </div>
                  <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                    Budget: <strong className="mono-num">₹{cat.monthlyBudget.toLocaleString()}/mo</strong> • {cat.description || 'General Ledger'}
                  </p>
                </div>
                <button
                  onClick={() => handleDeleteCategory(cat._id || cat.name)}
                  style={{ color: 'var(--danger-solid)', padding: '0.35rem', borderRadius: 'var(--radius-sm)' }}
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Section 2: Society Entity & Masked Banking Configuration */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">Society Profile & Bank Details</h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                Official registration details and designated maintenance bank account
              </p>
            </div>
            <Landmark size={18} color="var(--primary-600)" />
          </div>

          <form onSubmit={handleSaveSocietyInfo}>
            <div className="form-group">
              <label className="form-label">Registered Society Name</label>
              <input
                type="text"
                className="form-input"
                value={societyName}
                onChange={e => setSocietyName(e.target.value)}
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div className="form-group">
                <label className="form-label">Registration Number</label>
                <input
                  type="text"
                  className="form-input"
                  value={regNo}
                  onChange={e => setRegNo(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Financial Year</label>
                <input
                  type="text"
                  className="form-input"
                  value={fy}
                  onChange={e => setFy(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Society Registered Address</label>
              <input
                type="text"
                className="form-input"
                value={address}
                onChange={e => setAddress(e.target.value)}
                required
              />
            </div>

            {/* Banking Details */}
            <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '1rem', marginTop: '1rem' }}>
              <h4 style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--text-primary)' }}>
                Designated Society Bank Account (Auto-Masked for Residents)
              </h4>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div className="form-group">
                  <label className="form-label">Bank Name</label>
                  <input
                    type="text"
                    className="form-input"
                    value={bankName}
                    onChange={e => setBankName(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Bank Account Number</label>
                  <input
                    type="text"
                    className="form-input"
                    value={accountNumber}
                    onChange={e => setAccountNumber(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div className="form-group">
                  <label className="form-label">IFSC Code</label>
                  <input
                    type="text"
                    className="form-input"
                    value={ifsc}
                    onChange={e => setIfsc(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Branch</label>
                  <input
                    type="text"
                    className="form-input"
                    value={branch}
                    onChange={e => setBranch(e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
              <button type="submit" className="btn btn-primary" disabled={isSavingInfo}>
                <Save size={15} />
                <span>{isSavingInfo ? 'Saving Changes...' : 'Save Society Configuration'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
