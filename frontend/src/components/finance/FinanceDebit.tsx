'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  getFinanceDebit,
  createFinanceDebit,
  getFinanceAccountBalances,
  DebitEntry,
  AccountBalancesResponse
} from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import {
  Plus,
  Search,
  Calendar,
  ArrowDownRight,
  X,
  CheckCircle2,
  AlertTriangle,
  AlertCircle
} from 'lucide-react';

export default function FinanceDebit() {
  const { hasPermission, isCreateOnly } = useAuth();
  const canView = hasPermission('finance_debit', 'view');
  const canCreate = hasPermission('finance_debit', 'create');

  const [entries, setEntries] = useState<DebitEntry[]>([]);
  const [balances, setBalances] = useState<AccountBalancesResponse | null>(null);
  const [loading, setLoading] = useState(canView);

  // Filters
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [accountFilter, setAccountFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal & Success State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [createOnlySuccess, setCreateOnlySuccess] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    account: 'Cash' as 'Cash' | 'JazzCash' | 'Easypaisa' | 'Meezan Bank',
    amount: '',
    paid_to: '',
    purpose: ''
  });

  const fetchData = useCallback(async () => {
    if (!canView) return;
    setLoading(true);
    try {
      const [debData, balData] = await Promise.all([
        getFinanceDebit({
          date_from: dateFrom,
          date_to: dateTo,
          account: accountFilter,
          q: searchQuery
        }),
        getFinanceAccountBalances().catch(() => null)
      ]);
      setEntries(debData);
      if (balData) setBalances(balData);
    } catch (err) {
      console.error('Failed to load debit entries', err);
    } finally {
      setLoading(false);
    }
  }, [canView, dateFrom, dateTo, accountFilter, searchQuery]);

  useEffect(() => {
    if (canView) {
      fetchData();
    }
  }, [canView, fetchData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      setErrorMsg('Please enter a valid debit amount');
      return;
    }
    if (!formData.paid_to.trim()) {
      setErrorMsg('Paid To recipient name is required');
      return;
    }
    if (!formData.purpose.trim()) {
      setErrorMsg('Purpose is required');
      return;
    }

    setSubmitting(true);
    setErrorMsg('');
    try {
      await createFinanceDebit({
        date: formData.date,
        account: formData.account,
        amount: parseFloat(formData.amount),
        paid_to: formData.paid_to,
        purpose: formData.purpose
      });

      const successText = `Debit expense of PKR ${parseFloat(formData.amount).toLocaleString('en-PK')} paid to ${formData.paid_to} recorded successfully.`;

      setFormData({
        date: new Date().toISOString().split('T')[0],
        account: 'Cash',
        amount: '',
        paid_to: '',
        purpose: ''
      });

      if (canView) {
        setIsModalOpen(false);
        fetchData();
      } else {
        setCreateOnlySuccess(successText);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to record debit entry');
    } finally {
      setSubmitting(false);
    }
  };

  const selectedAccountBalance = balances?.accounts?.[formData.account] || 0;
  const isOverBalance = balances ? parseFloat(formData.amount || '0') > selectedAccountBalance : false;
  const totalDebitAmount = entries.reduce((sum, item) => sum + item.amount, 0);

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
                <ArrowDownRight className="w-5 h-5 text-red-300" />
              </div>
              <div>
                <h2 className="text-lg font-bold font-serif text-[#FDF6E3]">
                  New Debit / Expense Entry (نئے اخراجات کا اندراج)
                </h2>
                <p className="text-xs text-[#FDF6E3]/80">
                  Data Entry Operator Mode — Submit vouchers directly to the trust database
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
                  <span>Record Another Expense</span>
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
                    <label className="block font-bold text-gray-700 mb-1">Source Account *</label>
                    <select
                      value={formData.account}
                      onChange={(e) => setFormData({ ...formData, account: e.target.value as any })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-[#145A32]/20 focus:border-[#145A32]"
                    >
                      <option value="Cash">Cash (نقد)</option>
                      <option value="JazzCash">JazzCash</option>
                      <option value="Easypaisa">Easypaisa</option>
                      <option value="Meezan Bank">Meezan Bank</option>
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
                  <label className="block font-bold text-gray-700 mb-1">Amount (PKR) *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    step="any"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    placeholder="e.g. 12000"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs font-mono font-bold focus:ring-2 focus:ring-[#145A32]/20 focus:border-[#145A32]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Paid To / Recipient (جس کو رقم دی گئی) *</label>
                  <input
                    type="text"
                    required
                    value={formData.paid_to}
                    onChange={(e) => setFormData({ ...formData, paid_to: e.target.value })}
                    placeholder="e.g. Qari Bilal / K-Electric / Grocery Store"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-[#145A32]/20 focus:border-[#145A32]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Purpose / Expense Details (خرچ کی مد) *</label>
                  <textarea
                    rows={3}
                    required
                    value={formData.purpose}
                    onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                    placeholder="e.g. Monthly Teacher Salary / Electricity Bill / Student Ration"
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
                    <span>{submitting ? 'Submitting Debit...' : 'Submit Debit Entry'}</span>
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
            <ArrowDownRight className="w-5 h-5 text-red-600" /> Debit & Expenditure Registry
          </h2>
          <p className="text-xs text-gray-500 font-medium">
            Record all outgoing payments, teacher salaries, bills, groceries, and operational expenses
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 bg-red-50 border border-red-200 rounded-lg text-xs font-bold text-red-700">
            Filtered Debit: <span className="font-mono text-sm">PKR {totalDebitAmount.toLocaleString('en-PK')}</span>
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
              <span>+ New Debit Entry</span>
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
            placeholder="Search recipient, purpose..."
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

      {/* Debit Records Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-2xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-[#145A32] border-t-transparent mb-3" />
            <p className="text-gray-500 text-sm">Loading debit entries...</p>
          </div>
        ) : entries.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-gray-500 text-sm font-bold">No Debit Entries Found</p>
            <p className="text-gray-400 text-xs mt-1">Add a new expense or change your date filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#FAF5EA]/80 border-b border-gray-200 text-xs font-semibold text-[#145A32]">
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Paid To (Recipient)</th>
                  <th className="py-3 px-4">Account Used</th>
                  <th className="py-3 px-4">Amount (PKR)</th>
                  <th className="py-3 px-4">Purpose / Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {entries.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="py-3 px-4 text-xs font-semibold text-gray-700">{item.date}</td>
                    <td className="py-3 px-4 font-semibold text-gray-900">{item.paid_to}</td>
                    <td className="py-3 px-4">
                      <span className="inline-block px-2.5 py-0.5 bg-gray-100 text-gray-800 font-mono text-xs font-semibold rounded">
                        {item.account}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-red-600">
                      - PKR {item.amount.toLocaleString('en-PK')}
                    </td>
                    <td className="py-3 px-4 text-xs text-gray-600">{item.purpose}</td>
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
                <Plus className="w-5 h-5 text-[#FDF6E3]" /> Record New Expense / Debit
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-white/80 hover:text-white cursor-pointer"
              >
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
                  <label className="block text-xs font-bold text-gray-700 mb-1">Paid From Account *</label>
                  <select
                    value={formData.account}
                    onChange={(e) => setFormData({ ...formData, account: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#145A32]/20 focus:border-[#145A32]"
                  >
                    <option value="Cash">Cash Account</option>
                    <option value="JazzCash">JazzCash</option>
                    <option value="Easypaisa">Easypaisa</option>
                    <option value="Meezan Bank">Meezan Bank</option>
                  </select>
                  {balances && (
                    <p className="text-[11px] text-gray-500 mt-1 font-mono">
                      Balance: PKR {(balances.accounts[formData.account] || 0).toLocaleString('en-PK')}
                    </p>
                  )}
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
                <label className="block text-xs font-bold text-gray-700 mb-1">Debit Amount (PKR) *</label>
                <input
                  type="number"
                  required
                  min="1"
                  step="any"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  placeholder="e.g. 15000"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono font-bold focus:ring-2 focus:ring-[#145A32]/20 focus:border-[#145A32]"
                />
                {isOverBalance && (
                  <div className="flex items-center gap-1 text-amber-600 text-[11px] font-semibold mt-1">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Warning: Debit exceeds current available balance for this account!</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Paid To / Recipient Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.paid_to}
                  onChange={(e) => setFormData({ ...formData, paid_to: e.target.value })}
                  placeholder="e.g. Qari Bilal / K-Electric / Grocery Store"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#145A32]/20 focus:border-[#145A32]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Purpose / Expense Description *
                </label>
                <textarea
                  rows={2}
                  required
                  value={formData.purpose}
                  onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                  placeholder="e.g. Monthly Teacher Salary / Electricity Bill / Madrasa Maintenance"
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
                  <span>{submitting ? 'Recording...' : 'Record Debit'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
