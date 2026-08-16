'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { getFinanceKindDonations, createFinanceKindDonation, KindDonation } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { Plus, Search, Gift, X, CheckCircle2, AlertCircle } from 'lucide-react';

export default function FinanceKindDonation() {
  const { hasPermission, isCreateOnly } = useAuth();
  const canView = hasPermission('finance_kind_donation', 'view');
  const canCreate = hasPermission('finance_kind_donation', 'create');

  const [donations, setDonations] = useState<KindDonation[]>([]);
  const [loading, setLoading] = useState(canView);

  // Filters
  const [categoryFilter, setCategoryFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal & Success State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [createOnlySuccess, setCreateOnlySuccess] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    item_name: '',
    category: 'Furniture',
    quantity: '1',
    estimated_value: '',
    donor_name: '',
    donor_contact: '',
    condition: 'New',
    notes: ''
  });

  const fetchDonations = useCallback(async () => {
    if (!canView) return;
    setLoading(true);
    try {
      const data = await getFinanceKindDonations({
        category: categoryFilter,
        q: searchQuery
      });
      setDonations(data);
    } catch (err) {
      console.error('Failed to load in-kind donations', err);
    } finally {
      setLoading(false);
    }
  }, [canView, categoryFilter, searchQuery]);

  useEffect(() => {
    if (canView) {
      fetchDonations();
    }
  }, [canView, fetchDonations]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.item_name.trim()) {
      setErrorMsg('Item name is required');
      return;
    }
    if (!formData.donor_name.trim()) {
      setErrorMsg('Donor name is required');
      return;
    }

    setSubmitting(true);
    setErrorMsg('');
    try {
      await createFinanceKindDonation({
        date: formData.date,
        item_name: formData.item_name,
        category: formData.category,
        quantity: parseInt(formData.quantity) || 1,
        estimated_value: formData.estimated_value ? parseFloat(formData.estimated_value) : 0,
        donor_name: formData.donor_name,
        donor_contact: formData.donor_contact,
        condition: formData.condition,
        notes: formData.notes
      });

      const successText = `In-kind donation '${formData.item_name}' from ${formData.donor_name} recorded successfully.`;

      setFormData({
        date: new Date().toISOString().split('T')[0],
        item_name: '',
        category: 'Furniture',
        quantity: '1',
        estimated_value: '',
        donor_name: '',
        donor_contact: '',
        condition: 'New',
        notes: ''
      });

      if (canView) {
        setIsModalOpen(false);
        fetchDonations();
      } else {
        setCreateOnlySuccess(successText);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to record in-kind donation');
    } finally {
      setSubmitting(false);
    }
  };

  const totalEstimatedValue = donations.reduce((sum, item) => sum + (item.estimated_value || 0), 0);

  // -------------------------------------------------------------
  // CREATE-ONLY MODE (e.g. Data Entry Operator: can_create && !can_view)
  // -------------------------------------------------------------
  if (!canView && canCreate) {
    return (
      <div className="max-w-2xl mx-auto space-y-6 animate-fadeIn">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="bg-[#145A32] text-white p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                <Gift className="w-5 h-5 text-[#FDF6E3]" />
              </div>
              <div>
                <h2 className="text-lg font-bold font-serif text-[#FDF6E3]">
                  New In-Kind Donation Entry (اشیاء برائے عطیہ)
                </h2>
                <p className="text-xs text-[#FDF6E3]/80">
                  Data Entry Operator Mode — Submit physical item donations directly to database
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 sm:p-8">
            {createOnlySuccess && (
              <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-3 animate-fadeIn">
                <div className="flex items-center gap-2 text-emerald-800 text-sm font-bold">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span>{createOnlySuccess}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setCreateOnlySuccess(null)}
                  className="px-4 py-2 bg-[#145A32] hover:bg-[#0E4124] text-white text-xs font-bold rounded-lg shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Record Another In-Kind Item</span>
                </button>
              </div>
            )}

            {errorMsg && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {!createOnlySuccess && (
              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Item Category (قسم) *</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-[#145A32]/20 focus:border-[#145A32]"
                    >
                      <option value="Furniture">Furniture (فرنیچر)</option>
                      <option value="Food">Food / Ration (راشن / خوراک)</option>
                      <option value="Books">Books & Quran (کتب و قرآن)</option>
                      <option value="Clothing">Clothing & Blankets (کپڑے / کمبل)</option>
                      <option value="Equipment">Equipment / Electronics (آلات)</option>
                      <option value="Other">Other (دیگر)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Date *</label>
                    <input
                      type="date"
                      required
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-[#145A32]/20 focus:border-[#145A32]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Item Name / Description (چیز کا نام) *</label>
                  <input
                    type="text"
                    required
                    value={formData.item_name}
                    onChange={(e) => setFormData({ ...formData, item_name: e.target.value })}
                    placeholder="e.g. 50 Ceiling Fans / 100 Blankets / 20 Bags Rice"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-[#145A32]/20 focus:border-[#145A32]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Quantity (تعداد) *</label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={formData.quantity}
                      onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs font-mono focus:ring-2 focus:ring-[#145A32]/20 focus:border-[#145A32]"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Estimated Value (PKR)</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.estimated_value}
                      onChange={(e) => setFormData({ ...formData, estimated_value: e.target.value })}
                      placeholder="e.g. 75000"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs font-mono focus:ring-2 focus:ring-[#145A32]/20 focus:border-[#145A32]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Donor Name (عطیہ دینے والے کا نام) *</label>
                    <input
                      type="text"
                      required
                      value={formData.donor_name}
                      onChange={(e) => setFormData({ ...formData, donor_name: e.target.value })}
                      placeholder="e.g. Sheikh Imran"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-[#145A32]/20 focus:border-[#145A32]"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Donor Contact Number</label>
                    <input
                      type="text"
                      value={formData.donor_contact}
                      onChange={(e) => setFormData({ ...formData, donor_contact: e.target.value })}
                      placeholder="0300-1234567"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-[#145A32]/20 focus:border-[#145A32]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Condition & Additional Notes</label>
                  <textarea
                    rows={2}
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="New in boxes / Used good condition / Allocated to Hostel Block B"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-[#145A32]/20 focus:border-[#145A32]"
                  />
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-3 bg-[#145A32] hover:bg-[#0E4124] text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{submitting ? 'Submitting Item...' : 'Submit In-Kind Donation'}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // STANDARD VIEW MODE (can_view = true)
  // -------------------------------------------------------------
  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-5 rounded-xl border border-gray-200 shadow-2xs">
        <div>
          <h2 className="text-lg font-bold font-serif text-[#145A32] flex items-center gap-2">
            <Gift className="w-5 h-5 text-emerald-600" /> In-Kind (Non-Cash) Donations Registry
          </h2>
          <p className="text-xs text-gray-500 font-medium">
            Track donated physical items (furniture, food bags, blankets, books, equipment)
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 bg-[#FDF6E3] border border-[#145A32]/20 rounded-lg text-xs font-bold text-[#145A32]">
            Est. Value: <span className="font-mono text-sm">~ PKR {totalEstimatedValue.toLocaleString('en-PK')}</span>
          </div>

          {canCreate && (
            <button
              onClick={() => {
                setErrorMsg('');
                setIsModalOpen(true);
              }}
              className="px-4 py-2 bg-[#145A32] hover:bg-[#0E4124] text-white text-xs font-bold rounded-lg shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ New Kind Donation</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search item name, donor name, notes..."
            className="w-full pl-9 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:ring-2 focus:ring-[#145A32]/20 focus:border-[#145A32]"
          />
        </div>

        {/* Category Filter */}
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-medium text-gray-700 focus:ring-2 focus:ring-[#145A32]/20 focus:border-[#145A32]"
        >
          <option value="">All Categories</option>
          <option value="Furniture">Furniture</option>
          <option value="Food">Food / Ration</option>
          <option value="Books">Books</option>
          <option value="Clothing">Clothing</option>
          <option value="Other">Other</option>
        </select>
      </div>

      {/* Donations Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-2xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-[#145A32] border-t-transparent mb-3" />
            <p className="text-gray-500 text-sm">Loading in-kind donations...</p>
          </div>
        ) : donations.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-gray-500 text-sm font-bold">No In-Kind Donations Found</p>
            <p className="text-gray-400 text-xs mt-1">Record items donated to the institution.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#FAF5EA]/80 border-b border-gray-200 text-xs font-semibold text-[#145A32]">
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Item Details</th>
                  <th className="py-3 px-3">Category</th>
                  <th className="py-3 px-3">Quantity</th>
                  <th className="py-3 px-4">Est. Value (PKR)</th>
                  <th className="py-3 px-4">Donor Name & Contact</th>
                  <th className="py-3 px-4">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {donations.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="py-3 px-4 text-xs font-semibold text-gray-700">{item.date}</td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-gray-900">{item.item_name}</div>
                      <div className="text-[11px] text-gray-400">Condition: {item.condition || 'New'}</div>
                    </td>
                    <td className="py-3 px-3">
                      <span className="inline-block px-2.5 py-0.5 bg-purple-50 border border-purple-200 text-purple-800 text-xs font-bold rounded">
                        {item.category}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono font-bold text-gray-800">{item.quantity}x</td>
                    <td className="py-3 px-4 font-mono font-bold text-emerald-700">
                      {item.estimated_value ? `~ PKR ${item.estimated_value.toLocaleString('en-PK')}` : '—'}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-gray-900">{item.donor_name}</div>
                      {item.donor_contact && <div className="text-[11px] text-gray-400">{item.donor_contact}</div>}
                    </td>
                    <td className="py-3 px-4 text-xs text-gray-600">{item.notes || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="bg-[#145A32] text-white px-6 py-4 flex items-center justify-between">
              <h3 className="font-bold text-base font-serif flex items-center gap-2">
                <Gift className="w-5 h-5 text-[#FDF6E3]" /> Record In-Kind Donation
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-white/80 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorMsg && (
              <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Item Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#145A32]/20 focus:border-[#145A32]"
                  >
                    <option value="Furniture">Furniture</option>
                    <option value="Food">Food / Ration</option>
                    <option value="Books">Books & Quran</option>
                    <option value="Clothing">Clothing & Blankets</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Date *</label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#145A32]/20 focus:border-[#145A32]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Item Name / Description *</label>
                <input
                  type="text"
                  required
                  value={formData.item_name}
                  onChange={(e) => setFormData({ ...formData, item_name: e.target.value })}
                  placeholder="e.g. 50 Ceiling Fans / 100 Blankets / 20 Bags Rice"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#145A32]/20 focus:border-[#145A32]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Quantity *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-[#145A32]/20 focus:border-[#145A32]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Estimated Value (PKR)</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.estimated_value}
                    onChange={(e) => setFormData({ ...formData, estimated_value: e.target.value })}
                    placeholder="e.g. 75000"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-[#145A32]/20 focus:border-[#145A32]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Donor Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.donor_name}
                    onChange={(e) => setFormData({ ...formData, donor_name: e.target.value })}
                    placeholder="e.g. Sheikh Imran"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#145A32]/20 focus:border-[#145A32]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Donor Contact Number</label>
                  <input
                    type="text"
                    value={formData.donor_contact}
                    onChange={(e) => setFormData({ ...formData, donor_contact: e.target.value })}
                    placeholder="0300-1234567"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#145A32]/20 focus:border-[#145A32]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Condition & Additional Notes</label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="New in boxes / Used good condition / Allocated to Hostel Block B"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#145A32]/20 focus:border-[#145A32]"
                />
              </div>

              <div className="pt-3 border-t border-gray-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 text-xs font-medium rounded-lg hover:bg-gray-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-[#145A32] hover:bg-[#0E4124] text-white text-xs font-bold rounded-lg shadow-sm flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{submitting ? 'Recording...' : 'Record Item'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
