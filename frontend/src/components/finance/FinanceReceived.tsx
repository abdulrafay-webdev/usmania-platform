'use client';

import React, { useState, useEffect } from 'react';
import { ReceivedEntry, getFinanceReceived, createFinanceReceived } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import FinanceExcelExportModal from './FinanceExcelExportModal';
import {
  Plus,
  Search,
  Calendar,
  ArrowUpRight,
  Filter,
  CheckCircle2,
  AlertCircle,
  X,
  FileSpreadsheet,
  Building2,
  Lock
} from 'lucide-react';

export default function FinanceReceived() {
  const { hasPermission, isCreateOnly } = useAuth();
  const canView = hasPermission('finance_received', 'view');
  const canCreate = hasPermission('finance_received', 'create');

  const [entries, setEntries] = useState<ReceivedEntry[]>([]);
  const [loading, setLoading] = useState(canView);

  // Filters
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [entryTypeFilter, setEntryTypeFilter] = useState('');
  const [accountFilter, setAccountFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal / Success State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [createOnlySuccess, setCreateOnlySuccess] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    entry_type: 'Donation' as 'Income' | 'Donation',
    mode: 'Cash' as 'Cash' | 'Online',
    account: 'Cash' as 'Cash' | 'JazzCash' | 'Easypaisa' | 'Meezan Bank',
    amount: '',
    payer_name: '',
    payer_contact: '',
    payer_address: '',
    purpose_note: ''
  });

  const loadEntries = async () => {
    if (!canView) return;
    setLoading(true);
    try {
      const data = await getFinanceReceived({
        date_from: dateFrom || undefined,
        date_to: dateTo || undefined,
        entry_type: entryTypeFilter || undefined,
        account: accountFilter || undefined,
        q: searchQuery || undefined
      });
      setEntries(data);
    } catch (err) {
      console.error('Failed to load received entries', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (canView) {
      loadEntries();
    }
  }, [canView, dateFrom, dateTo, entryTypeFilter, accountFilter, searchQuery]);

  const handleModeChange = (mode: 'Cash' | 'Online') => {
    setFormData((prev) => ({
      ...prev,
      mode,
      account: mode === 'Cash' ? 'Cash' : 'Meezan Bank'
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.amount || Number(formData.amount) <= 0) {
      setErrorMsg('Please enter a valid amount');
      return;
    }
    if (!formData.payer_name.trim()) {
      setErrorMsg('Please enter payer / donor name');
      return;
    }

    setSubmitting(true);
    setErrorMsg('');

    try {
      const created = await createFinanceReceived({
        ...formData,
        amount: Number(formData.amount)
      });
      
      const successText = `Entry of PKR ${Number(formData.amount).toLocaleString('en-PK')} from ${formData.payer_name} recorded successfully.`;
      
      setFormData({
        date: new Date().toISOString().split('T')[0],
        entry_type: 'Donation',
        mode: 'Cash',
        account: 'Cash',
        amount: '',
        payer_name: '',
        payer_contact: '',
        payer_address: '',
        purpose_note: ''
      });

      if (canView) {
        setIsModalOpen(false);
        loadEntries();
      } else {
        setCreateOnlySuccess(successText);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to record received entry');
    } finally {
      setSubmitting(false);
    }
  };

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
                <ArrowUpRight className="w-5 h-5 text-[#FDF6E3]" />
              </div>
              <div>
                <h2 className="text-lg font-bold font-serif text-[#FDF6E3]">
                  New Received / Donation Entry (نئی وصولی / عطیہ)
                </h2>
                <p className="text-xs text-[#FDF6E3]/80">
                  Data Entry Operator Mode — Submit receipts directly to the trust database
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
                  <span>Record Another Entry</span>
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
                    <label className="block font-bold text-gray-700 mb-1">Entry Type *</label>
                    <select
                      value={formData.entry_type}
                      onChange={(e) => setFormData({ ...formData, entry_type: e.target.value as any })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-[#145A32]/20 focus:border-[#145A32]"
                    >
                      <option value="Donation">Donation (عطیہ)</option>
                      <option value="Income">Income (آمدنی)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Payment Mode *</label>
                    <select
                      value={formData.mode}
                      onChange={(e) => handleModeChange(e.target.value as any)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-[#145A32]/20 focus:border-[#145A32]"
                    >
                      <option value="Cash">Cash (نقد)</option>
                      <option value="Online">Online Transfer (بینک / آن لائن)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Target Account *</label>
                  {formData.mode === 'Cash' ? (
                    <input
                      type="text"
                      disabled
                      value="Cash Account"
                      className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-xs text-gray-700 font-semibold"
                    />
                  ) : (
                    <select
                      value={formData.account}
                      onChange={(e) => setFormData({ ...formData, account: e.target.value as any })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-[#145A32]/20 focus:border-[#145A32]"
                    >
                      <option value="JazzCash">JazzCash</option>
                      <option value="Easypaisa">Easypaisa</option>
                      <option value="Meezan Bank">Meezan Bank</option>
                    </select>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Amount (PKR) *</label>
                    <input
                      type="number"
                      required
                      min="1"
                      step="any"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      placeholder="e.g. 5000"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs font-mono font-bold focus:ring-2 focus:ring-[#145A32]/20 focus:border-[#145A32]"
                    />
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
                  <label className="block font-bold text-gray-700 mb-1">Payer / Donor Name (نام دینے والا) *</label>
                  <input
                    type="text"
                    required
                    value={formData.payer_name}
                    onChange={(e) => setFormData({ ...formData, payer_name: e.target.value })}
                    placeholder="e.g. Haji Muhammad Tariq"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-[#145A32]/20 focus:border-[#145A32]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Phone / Contact Number (رابطہ نمبر)</label>
                  <input
                    type="text"
                    value={formData.payer_contact}
                    onChange={(e) => setFormData({ ...formData, payer_contact: e.target.value })}
                    placeholder="0300-1234567"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-[#145A32]/20 focus:border-[#145A32]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Purpose / Note (تفصیل یا مد)</label>
                  <textarea
                    rows={2}
                    value={formData.purpose_note}
                    onChange={(e) => setFormData({ ...formData, purpose_note: e.target.value })}
                    placeholder="e.g. Monthly contribution / Zakat fund"
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
                    <span>{submitting ? 'Submitting Entry...' : 'Submit Received Entry'}</span>
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
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-5 rounded-xl border border-gray-200 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-200">
            <ArrowUpRight className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold font-serif text-[#145A32]">
              Received Entries (Income & Donations)
            </h2>
            <p className="text-xs text-gray-500 font-medium">
              Manage cash receipts, online donations, payer details & categorized funds
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Export Excel Button */}
          <button
            onClick={() => setIsExportModalOpen(true)}
            className="px-3.5 py-2 bg-white hover:bg-gray-50 text-[#145A32] border border-[#145A32]/30 text-xs font-bold rounded-lg shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer"
            title="Download Finance Excel report"
          >
            <FileSpreadsheet className="w-4 h-4 text-[#145A32]" />
            <span>Export Excel</span>
          </button>

          {canCreate && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 bg-[#145A32] hover:bg-[#0E4124] text-white text-xs font-semibold rounded-lg shadow-sm transition-all duration-150 flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ New Received Entry</span>
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
            placeholder="Search payer name, purpose, contact..."
            className="w-full pl-9 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:ring-2 focus:ring-[#145A32]/20 focus:border-[#145A32]"
          />
        </div>

        {/* Date From */}
        <div className="flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-gray-400" />
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="px-2.5 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-700 focus:ring-2 focus:ring-[#145A32]/20 focus:border-[#145A32]"
          />
        </div>

        {/* Date To */}
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-gray-400">to</span>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="px-2.5 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-700 focus:ring-2 focus:ring-[#145A32]/20 focus:border-[#145A32]"
          />
        </div>

        {/* Entry Type Filter */}
        <select
          value={entryTypeFilter}
          onChange={(e) => setEntryTypeFilter(e.target.value)}
          className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-medium text-gray-700 focus:ring-2 focus:ring-[#145A32]/20 focus:border-[#145A32]"
        >
          <option value="">All Types (Income & Donation)</option>
          <option value="Income">Income</option>
          <option value="Donation">Donation</option>
        </select>

        {/* Account Filter */}
        <select
          value={accountFilter}
          onChange={(e) => setAccountFilter(e.target.value)}
          className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-medium text-gray-700 focus:ring-2 focus:ring-[#145A32]/20 focus:border-[#145A32]"
        >
          <option value="">All Accounts</option>
          <option value="Cash">Cash</option>
          <option value="JazzCash">JazzCash</option>
          <option value="Easypaisa">Easypaisa</option>
          <option value="Meezan Bank">Meezan Bank</option>
        </select>
      </div>

      {/* Received Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-2xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-[#145A32] border-t-transparent mb-3" />
            <p className="text-gray-500 text-sm">Loading received entries...</p>
          </div>
        ) : entries.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-gray-500 text-sm font-bold">No Received Entries Found</p>
            <p className="text-gray-400 text-xs mt-1">Add a new entry or adjust your search filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#FAF5EA]/80 border-b border-gray-200 text-xs font-semibold text-[#145A32]">
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Payer / Donor</th>
                  <th className="py-3 px-3">Type</th>
                  <th className="py-3 px-3">Mode</th>
                  <th className="py-3 px-3">Account</th>
                  <th className="py-3 px-4">Amount (PKR)</th>
                  <th className="py-3 px-4">Purpose / Note</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {entries.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="py-3 px-4 text-xs font-semibold text-gray-700">{item.date}</td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-gray-900">{item.payer_name}</div>
                      {item.payer_contact && <div className="text-[11px] text-gray-400">{item.payer_contact}</div>}
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`inline-block px-2 py-0.5 text-xs font-bold rounded ${
                          item.entry_type === 'Donation'
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : 'bg-blue-50 text-blue-800 border border-blue-200'
                        }`}
                      >
                        {item.entry_type}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span className="text-xs text-gray-600 font-medium">{item.mode}</span>
                    </td>
                    <td className="py-3 px-3">
                      <span className="inline-block px-2 py-0.5 bg-gray-100 text-gray-800 font-mono text-xs rounded">
                        {item.account}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-emerald-700">
                      + PKR {item.amount.toLocaleString('en-PK')}
                    </td>
                    <td className="py-3 px-4 text-xs text-gray-600">{item.purpose_note || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* New Entry Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="bg-[#145A32] text-white px-6 py-4 flex items-center justify-between">
              <h3 className="font-bold text-base font-serif flex items-center gap-2">
                <Plus className="w-5 h-5 text-[#FDF6E3]" /> Record New Received Entry
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
                  <label className="block text-xs font-bold text-gray-700 mb-1">Entry Type *</label>
                  <select
                    value={formData.entry_type}
                    onChange={(e) => setFormData({ ...formData, entry_type: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#145A32]/20 focus:border-[#145A32]"
                  >
                    <option value="Donation">Donation</option>
                    <option value="Income">Income</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Payment Mode *</label>
                  <select
                    value={formData.mode}
                    onChange={(e) => handleModeChange(e.target.value as any)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#145A32]/20 focus:border-[#145A32]"
                  >
                    <option value="Cash">Cash</option>
                    <option value="Online">Online Transfer</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Target Account *</label>
                {formData.mode === 'Cash' ? (
                  <input
                    type="text"
                    disabled
                    value="Cash Account"
                    className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-sm text-gray-700 font-semibold"
                  />
                ) : (
                  <select
                    value={formData.account}
                    onChange={(e) => setFormData({ ...formData, account: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#145A32]/20 focus:border-[#145A32]"
                  >
                    <option value="JazzCash">JazzCash</option>
                    <option value="Easypaisa">Easypaisa</option>
                    <option value="Meezan Bank">Meezan Bank</option>
                  </select>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Amount (PKR) *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    step="any"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    placeholder="5000"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-[#145A32]/20 focus:border-[#145A32]"
                  />
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
                <label className="block text-xs font-bold text-gray-700 mb-1">Payer / Donor Name *</label>
                <input
                  type="text"
                  required
                  value={formData.payer_name}
                  onChange={(e) => setFormData({ ...formData, payer_name: e.target.value })}
                  placeholder="Haji Muhammad Tariq"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#145A32]/20 focus:border-[#145A32]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Payer Phone / Contact (Optional)</label>
                <input
                  type="text"
                  value={formData.payer_contact}
                  onChange={(e) => setFormData({ ...formData, payer_contact: e.target.value })}
                  placeholder="0300-1234567"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#145A32]/20 focus:border-[#145A32]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Purpose / Note (Optional)</label>
                <textarea
                  rows={2}
                  value={formData.purpose_note}
                  onChange={(e) => setFormData({ ...formData, purpose_note: e.target.value })}
                  placeholder="e.g. Monthly Zakat contribution for students..."
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
                  <span>{submitting ? 'Saving...' : 'Save Received Entry'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Finance Excel Export Modal */}
      <FinanceExcelExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
      />
    </div>
  );
}
