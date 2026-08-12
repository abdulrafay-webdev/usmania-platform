'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { getFinanceDebit, createFinanceDebit, getFinanceAccountBalances, DebitEntry, AccountBalancesResponse } from '@/lib/api';
import { Plus, Search, Calendar, ArrowDownRight, X, CheckCircle2, AlertTriangle, AlertCircle } from 'lucide-react';

export default function FinanceDebit() {
  const [entries, setEntries] = useState<DebitEntry[]>([]);
  const [balances, setBalances] = useState<AccountBalancesResponse | null>(null);
  const [loading, setLoading] = useState(true);

  // Filters
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [accountFilter, setAccountFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    account: 'Cash' as 'Cash' | 'JazzCash' | 'Easypaisa' | 'Meezan Bank',
    amount: '',
    paid_to: '',
    purpose: ''
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [debData, balData] = await Promise.all([
        getFinanceDebit({
          date_from: dateFrom,
          date_to: dateTo,
          account: accountFilter,
          q: searchQuery
        }),
        getFinanceAccountBalances()
      ]);
      setEntries(debData);
      setBalances(balData);
    } catch (err) {
      console.error('Failed to load debit entries', err);
    } finally {
      setLoading(false);
    }
  }, [dateFrom, dateTo, accountFilter, searchQuery]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

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
      setIsModalOpen(false);
      setFormData({
        date: new Date().toISOString().split('T')[0],
        account: 'Cash',
        amount: '',
        paid_to: '',
        purpose: ''
      });
      fetchData();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to record debit entry');
    } finally {
      setSubmitting(false);
    }
  };

  const selectedAccountBalance = balances?.accounts?.[formData.account] || 0;
  const isOverBalance = parseFloat(formData.amount || '0') > selectedAccountBalance;
  const totalDebitAmount = entries.reduce((sum, item) => sum + item.amount, 0);

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

          <button
            onClick={() => {
              setErrorMsg('');
              setIsModalOpen(true);
            }}
            className="px-4 py-2 bg-[#145A32] hover:bg-[#0E4124] text-white text-xs font-bold rounded-lg shadow-sm transition-all flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>+ New Debit Entry</span>
          </button>
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

      {/* Debit Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-2xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-[#145A32] border-t-transparent mb-3" />
            <p className="text-gray-500 text-sm">Loading debit entries...</p>
          </div>
        ) : entries.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-gray-500 text-sm font-bold">No Debit Entries Found</p>
            <p className="text-gray-400 text-xs mt-1">Add a new payment or adjust your search filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#FAF5EA]/80 border-b border-gray-200 text-xs font-semibold text-[#145A32]">
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Paid To</th>
                  <th className="py-3 px-3">Paid From Account</th>
                  <th className="py-3 px-4">Amount (PKR)</th>
                  <th className="py-3 px-4">Payment Purpose</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {entries.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="py-3 px-4 text-xs font-semibold text-gray-700">{item.date}</td>
                    <td className="py-3 px-4 font-semibold text-gray-900">{item.paid_to}</td>
                    <td className="py-3 px-3">
                      <span className="inline-block px-2 py-0.5 bg-gray-100 text-gray-800 font-mono text-xs rounded">
                        {item.account}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-red-600">
                      - PKR {item.amount.toLocaleString('en-PK')}
                    </td>
                    <td className="py-3 px-4 text-xs text-gray-600 font-medium">
                      {item.purpose}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* New Debit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="bg-[#145A32] text-white px-6 py-4 flex items-center justify-between">
              <h3 className="font-bold text-base font-serif flex items-center gap-2">
                <Plus className="w-5 h-5 text-[#FDF6E3]" /> Record New Debit Payment
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-white/80 hover:text-white">
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
              {/* Account Selection */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-gray-700">Paid From Account *</label>
                  <span className="text-[11px] font-mono text-[#145A32] font-semibold">
                    Current Balance: PKR {selectedAccountBalance.toLocaleString('en-PK')}
                  </span>
                </div>
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
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Amount */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Amount (PKR) *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    step="any"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    placeholder="25000"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-[#145A32]/20 focus:border-[#145A32]"
                  />
                </div>

                {/* Date */}
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

              {/* Soft Balance Overdraft Warning */}
              {isOverBalance && (
                <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl text-amber-900 text-xs flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block">Balance Overdraft Warning:</span>
                    Entered payment amount (PKR {parseFloat(formData.amount).toLocaleString('en-PK')}) exceeds current balance (PKR {selectedAccountBalance.toLocaleString('en-PK')}) in {formData.account}. You can still proceed if authorized.
                  </div>
                </div>
              )}

              {/* Paid To */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Paid To (Recipient / Vendor) *</label>
                <input
                  type="text"
                  required
                  value={formData.paid_to}
                  onChange={(e) => setFormData({ ...formData, paid_to: e.target.value })}
                  placeholder="Maulana Ahmad / K-Electric / Al-Madina Grocery"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#145A32]/20 focus:border-[#145A32]"
                />
              </div>

              {/* Purpose */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Payment Purpose *</label>
                <textarea
                  rows={2}
                  required
                  value={formData.purpose}
                  onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                  placeholder="e.g. Teacher salary for Ramadan month / Grocery for hostel students..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#145A32]/20 focus:border-[#145A32]"
                />
              </div>

              <div className="pt-3 border-t border-gray-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 text-xs font-medium rounded-lg hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg shadow-sm flex items-center gap-1.5 disabled:opacity-50"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{submitting ? 'Saving...' : 'Save Debit Entry'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
