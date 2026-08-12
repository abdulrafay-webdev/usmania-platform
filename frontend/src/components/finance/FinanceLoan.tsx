'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { getFinanceLoans, createFinanceLoan, getFinanceLoanDetail, addFinanceLoanPayment, Loan, LoanPayment } from '@/lib/api';
import { Plus, Landmark, ChevronDown, ChevronUp, History, X, CheckCircle2, AlertCircle, ArrowDownRight, Sparkles } from 'lucide-react';

export default function FinanceLoan() {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);

  // Expanded Loan state
  const [expandedLoanId, setExpandedLoanId] = useState<string | null>(null);
  const [expandedLoanDetail, setExpandedLoanDetail] = useState<Loan | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // New Loan Modal State
  const [isLoanModalOpen, setIsLoanModalOpen] = useState(false);
  const [submittingLoan, setSubmittingLoan] = useState(false);
  const [loanErrorMsg, setLoanErrorMsg] = useState('');
  const [loanFormData, setLoanFormData] = useState({
    lender_name: '',
    amount_taken: '',
    date_taken: new Date().toISOString().split('T')[0],
    received_in_account: 'Cash' as 'Cash' | 'JazzCash' | 'Easypaisa' | 'Meezan Bank',
    purpose: '',
    notes: ''
  });

  // Repayment Modal State
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentLoanId, setPaymentLoanId] = useState<string | null>(null);
  const [submittingPayment, setSubmittingPayment] = useState(false);
  const [paymentErrorMsg, setPaymentErrorMsg] = useState('');
  const [paymentFormData, setPaymentFormData] = useState({
    amount_paid: '',
    date_paid: new Date().toISOString().split('T')[0],
    paid_from_account: 'Cash' as 'Cash' | 'JazzCash' | 'Easypaisa' | 'Meezan Bank',
    notes: ''
  });

  const fetchLoans = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getFinanceLoans();
      setLoans(data);
    } catch (err) {
      console.error('Failed to load loans', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLoans();
  }, [fetchLoans]);

  const handleToggleExpand = async (loanId: string) => {
    if (expandedLoanId === loanId) {
      setExpandedLoanId(null);
      setExpandedLoanDetail(null);
    } else {
      setExpandedLoanId(loanId);
      setLoadingDetail(true);
      try {
        const detail = await getFinanceLoanDetail(loanId);
        setExpandedLoanDetail(detail);
      } catch (err) {
        console.error('Failed to fetch loan detail', err);
      } finally {
        setLoadingDetail(false);
      }
    }
  };

  const handleCreateLoanSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loanFormData.lender_name.trim()) {
      setLoanErrorMsg('Lender name is required');
      return;
    }
    if (!loanFormData.amount_taken || parseFloat(loanFormData.amount_taken) <= 0) {
      setLoanErrorMsg('Please enter a valid loan amount');
      return;
    }

    setSubmittingLoan(true);
    setLoanErrorMsg('');
    try {
      await createFinanceLoan({
        lender_name: loanFormData.lender_name,
        amount_taken: parseFloat(loanFormData.amount_taken),
        date_taken: loanFormData.date_taken,
        received_in_account: loanFormData.received_in_account,
        purpose: loanFormData.purpose,
        notes: loanFormData.notes
      });
      setIsLoanModalOpen(false);
      setLoanFormData({
        lender_name: '',
        amount_taken: '',
        date_taken: new Date().toISOString().split('T')[0],
        received_in_account: 'Cash',
        purpose: '',
        notes: ''
      });
      fetchLoans();
    } catch (err: any) {
      setLoanErrorMsg(err.message || 'Failed to create loan record');
    } finally {
      setSubmittingLoan(false);
    }
  };

  const handleOpenPaymentModal = (loan: Loan) => {
    setPaymentLoanId(loan.id);
    setPaymentErrorMsg('');
    setPaymentFormData({
      amount_paid: '',
      date_paid: new Date().toISOString().split('T')[0],
      paid_from_account: 'Cash',
      notes: ''
    });
    setIsPaymentModalOpen(true);
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentLoanId) return;
    if (!paymentFormData.amount_paid || parseFloat(paymentFormData.amount_paid) <= 0) {
      setPaymentErrorMsg('Please enter a valid repayment amount');
      return;
    }

    setSubmittingPayment(true);
    setPaymentErrorMsg('');
    try {
      await addFinanceLoanPayment(paymentLoanId, {
        amount_paid: parseFloat(paymentFormData.amount_paid),
        date_paid: paymentFormData.date_paid,
        paid_from_account: paymentFormData.paid_from_account,
        notes: paymentFormData.notes
      });
      setIsPaymentModalOpen(false);
      fetchLoans();
      if (expandedLoanId === paymentLoanId) {
        const detail = await getFinanceLoanDetail(paymentLoanId);
        setExpandedLoanDetail(detail);
      }
    } catch (err: any) {
      setPaymentErrorMsg(err.message || 'Failed to record repayment');
    } finally {
      setSubmittingPayment(false);
    }
  };

  const totalRemainingLoans = loans.reduce((sum, item) => sum + (item.remaining_balance || 0), 0);

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-5 rounded-xl border border-gray-200 shadow-2xs">
        <div>
          <h2 className="text-lg font-bold font-serif text-[#145A32] flex items-center gap-2">
            <Landmark className="w-5 h-5 text-amber-700" /> Loans & Qarz-e-Hasna Management
          </h2>
          <p className="text-xs text-gray-500 font-medium">
            Track borrowed funds, account deposits, repayments, and remaining loan balances
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 bg-amber-50 border border-amber-300 rounded-lg text-xs font-bold text-amber-900">
            Active Loan Balance: <span className="font-mono text-sm">PKR {totalRemainingLoans.toLocaleString('en-PK')}</span>
          </div>

          <button
            onClick={() => {
              setLoanErrorMsg('');
              setIsLoanModalOpen(true);
            }}
            className="px-4 py-2 bg-[#145A32] hover:bg-[#0E4124] text-white text-xs font-bold rounded-lg shadow-sm transition-all flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>+ Record New Loan</span>
          </button>
        </div>
      </div>

      {/* Loans Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-2xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-[#145A32] border-t-transparent mb-3" />
            <p className="text-gray-500 text-sm">Loading loan records...</p>
          </div>
        ) : loans.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-gray-500 text-sm font-bold">No Loan Records Found</p>
            <p className="text-gray-400 text-xs mt-1">Record a new loan or qarz taken by the Trust.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#FAF5EA]/80 border-b border-gray-200 text-xs font-semibold text-[#145A32]">
                  <th className="py-3 px-4 w-8"></th>
                  <th className="py-3 px-4">Date Taken</th>
                  <th className="py-3 px-4">Lender / Creditor</th>
                  <th className="py-3 px-3">Deposit Account</th>
                  <th className="py-3 px-4">Amount Taken</th>
                  <th className="py-3 px-4">Total Paid</th>
                  <th className="py-3 px-4">Remaining Balance</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {loans.map((item) => {
                  const isExpanded = expandedLoanId === item.id;
                  return (
                    <React.Fragment key={item.id}>
                      <tr
                        onClick={() => handleToggleExpand(item.id)}
                        className={`hover:bg-gray-50/80 transition-colors cursor-pointer ${
                          isExpanded ? 'bg-[#FDF6E3]/30' : ''
                        }`}
                      >
                        <td className="py-3 px-4 text-gray-400">
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </td>
                        <td className="py-3 px-4 text-xs font-semibold text-gray-700">{item.date_taken}</td>
                        <td className="py-3 px-4">
                          <div className="font-bold text-gray-900">{item.lender_name}</div>
                          {item.purpose && <div className="text-[11px] text-gray-400">{item.purpose}</div>}
                        </td>
                        <td className="py-3 px-3">
                          <span className="inline-block px-2 py-0.5 bg-gray-100 text-gray-800 font-mono text-xs font-semibold rounded">
                            {item.received_in_account || 'Cash'}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-mono font-semibold text-gray-900">
                          PKR {item.amount_taken.toLocaleString('en-PK')}
                        </td>
                        <td className="py-3 px-4 font-mono font-semibold text-emerald-700">
                          PKR {(item.total_paid || 0).toLocaleString('en-PK')}
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-amber-800">
                          PKR {(item.remaining_balance || 0).toLocaleString('en-PK')}
                        </td>
                        <td className="py-3 px-3">
                          <span className={`inline-block px-2.5 py-0.5 text-xs font-bold rounded ${
                            item.status === 'Fully Paid'
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : 'bg-amber-50 text-amber-900 border border-amber-300'
                          }`}>
                            {item.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => handleOpenPaymentModal(item)}
                            className="px-3 py-1 bg-[#145A32] hover:bg-[#0E4124] text-white text-xs font-semibold rounded-lg shadow-2xs transition-colors inline-flex items-center gap-1"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>+ Add Repayment</span>
                          </button>
                        </td>
                      </tr>

                      {/* Expandable Repayment History Row */}
                      {isExpanded && (
                        <tr>
                          <td colSpan={9} className="bg-gray-50/90 p-4 border-b border-gray-200">
                            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs space-y-3">
                              <div className="flex items-center justify-between">
                                <h4 className="text-xs font-bold text-[#145A32] uppercase tracking-wider flex items-center gap-1.5">
                                  <History className="w-4 h-4" /> Repayment History for {item.lender_name}
                                </h4>
                                <span className="text-xs text-gray-500 font-medium">
                                  Linked repayments automatically create account debits
                                </span>
                              </div>

                              {loadingDetail ? (
                                <p className="text-xs text-gray-400 py-4 text-center">Loading payment history...</p>
                              ) : expandedLoanDetail?.payments && expandedLoanDetail.payments.length > 0 ? (
                                <table className="w-full text-left text-xs border-collapse">
                                  <thead>
                                    <tr className="bg-gray-100 border-b border-gray-200 text-gray-600 font-semibold">
                                      <th className="py-2 px-3">Date Paid</th>
                                      <th className="py-2 px-3">Paid From Account</th>
                                      <th className="py-2 px-3">Amount Paid (PKR)</th>
                                      <th className="py-2 px-3">Notes</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-gray-100">
                                    {expandedLoanDetail.payments.map((p) => (
                                      <tr key={p.id} className="hover:bg-gray-50">
                                        <td className="py-2 px-3 font-semibold text-gray-700">{p.date_paid}</td>
                                        <td className="py-2 px-3 font-mono font-medium text-gray-800">{p.paid_from_account}</td>
                                        <td className="py-2 px-3 font-mono font-bold text-emerald-700">
                                          + PKR {p.amount_paid.toLocaleString('en-PK')}
                                        </td>
                                        <td className="py-2 px-3 text-gray-500">{p.notes || '—'}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              ) : (
                                <p className="text-xs text-gray-400 text-center py-4">No repayments recorded for this loan yet.</p>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* New Loan Modal */}
      {isLoanModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="bg-[#145A32] text-white px-6 py-4 flex items-center justify-between">
              <h3 className="font-bold text-base font-serif flex items-center gap-2">
                <Landmark className="w-5 h-5 text-[#FDF6E3]" /> Record New Loan (Qarz-e-Hasna)
              </h3>
              <button onClick={() => setIsLoanModalOpen(false)} className="text-white/80 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {loanErrorMsg && (
              <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{loanErrorMsg}</span>
              </div>
            )}

            <form onSubmit={handleCreateLoanSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Lender / Creditor Name *</label>
                <input
                  type="text"
                  required
                  value={loanFormData.lender_name}
                  onChange={(e) => setLoanFormData({ ...loanFormData, lender_name: e.target.value })}
                  placeholder="Haji Abdul Rehman / Seth Mahmood"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#145A32]/20 focus:border-[#145A32]"
                />
              </div>

              {/* Account where loan is deposited */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Deposit Received In Account *</label>
                <select
                  value={loanFormData.received_in_account}
                  onChange={(e) => setLoanFormData({ ...loanFormData, received_in_account: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#145A32]/20 focus:border-[#145A32]"
                >
                  <option value="Cash">Cash Account</option>
                  <option value="JazzCash">JazzCash</option>
                  <option value="Easypaisa">Easypaisa</option>
                  <option value="Meezan Bank">Meezan Bank</option>
                </select>
                <span className="text-[11px] text-[#145A32] font-semibold mt-1 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-[#145A32]" />
                  Loan amount will automatically deposit into this account and increase Grand Total!
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Amount Taken (PKR) *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    step="any"
                    value={loanFormData.amount_taken}
                    onChange={(e) => setLoanFormData({ ...loanFormData, amount_taken: e.target.value })}
                    placeholder="100000"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-[#145A32]/20 focus:border-[#145A32]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Date Taken *</label>
                  <input
                    type="date"
                    required
                    value={loanFormData.date_taken}
                    onChange={(e) => setLoanFormData({ ...loanFormData, date_taken: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#145A32]/20 focus:border-[#145A32]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Loan Purpose (Optional)</label>
                <input
                  type="text"
                  value={loanFormData.purpose}
                  onChange={(e) => setLoanFormData({ ...loanFormData, purpose: e.target.value })}
                  placeholder="e.g. Madrasa building construction / Hostel renovation"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#145A32]/20 focus:border-[#145A32]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Notes (Optional)</label>
                <textarea
                  rows={2}
                  value={loanFormData.notes}
                  onChange={(e) => setLoanFormData({ ...loanFormData, notes: e.target.value })}
                  placeholder="e.g. Agreed payback timeline 6 months..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#145A32]/20 focus:border-[#145A32]"
                />
              </div>

              <div className="pt-3 border-t border-gray-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsLoanModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 text-xs font-medium rounded-lg hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingLoan}
                  className="px-5 py-2 bg-[#145A32] hover:bg-[#0E4124] text-white text-xs font-bold rounded-lg shadow-sm flex items-center gap-1.5 disabled:opacity-50"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{submittingLoan ? 'Saving...' : 'Save Loan Record'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Repayment Modal */}
      {isPaymentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-2xl w-full max-w-md overflow-hidden">
            <div className="bg-[#145A32] text-white px-6 py-4 flex items-center justify-between">
              <h3 className="font-bold text-base font-serif flex items-center gap-2">
                <ArrowDownRight className="w-5 h-5 text-[#FDF6E3]" /> Record Loan Repayment
              </h3>
              <button onClick={() => setIsPaymentModalOpen(false)} className="text-white/80 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {paymentErrorMsg && (
              <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{paymentErrorMsg}</span>
              </div>
            )}

            <form onSubmit={handlePaymentSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Repayment Amount (PKR) *</label>
                <input
                  type="number"
                  required
                  min="1"
                  step="any"
                  value={paymentFormData.amount_paid}
                  onChange={(e) => setPaymentFormData({ ...paymentFormData, amount_paid: e.target.value })}
                  placeholder="25000"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-[#145A32]/20 focus:border-[#145A32]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Paid From Account *</label>
                <select
                  value={paymentFormData.paid_from_account}
                  onChange={(e) => setPaymentFormData({ ...paymentFormData, paid_from_account: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#145A32]/20 focus:border-[#145A32]"
                >
                  <option value="Cash">Cash Account</option>
                  <option value="JazzCash">JazzCash</option>
                  <option value="Easypaisa">Easypaisa</option>
                  <option value="Meezan Bank">Meezan Bank</option>
                </select>
                <span className="text-[11px] text-[#145A32] font-semibold mt-1 block">
                  Auto-creates a linked DebitEntry to reduce account balance!
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Date Paid *</label>
                <input
                  type="date"
                  required
                  value={paymentFormData.date_paid}
                  onChange={(e) => setPaymentFormData({ ...paymentFormData, date_paid: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#145A32]/20 focus:border-[#145A32]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Notes (Optional)</label>
                <textarea
                  rows={2}
                  value={paymentFormData.notes}
                  onChange={(e) => setPaymentFormData({ ...paymentFormData, notes: e.target.value })}
                  placeholder="Installment payment #1..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#145A32]/20 focus:border-[#145A32]"
                />
              </div>

              <div className="pt-3 border-t border-gray-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsPaymentModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 text-xs font-medium rounded-lg hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingPayment}
                  className="px-5 py-2 bg-[#145A32] hover:bg-[#0E4124] text-white text-xs font-bold rounded-lg shadow-sm flex items-center gap-1.5 disabled:opacity-50"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{submittingPayment ? 'Saving...' : 'Record Repayment'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
