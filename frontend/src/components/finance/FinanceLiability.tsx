'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  getFinanceLiabilities,
  createFinanceLiability,
  updateFinanceLiability,
  getFinanceLiabilityDetail,
  addFinanceLiabilityPayment,
  deleteFinanceLiability,
  exportFinanceExcel,
  Liability,
  LiabilityPayment
} from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import {
  Plus,
  Receipt,
  ChevronDown,
  ChevronUp,
  History,
  X,
  CheckCircle2,
  AlertCircle,
  ArrowDownRight,
  Sparkles,
  Calendar,
  DollarSign,
  Search,
  Filter,
  FileSpreadsheet,
  Trash2,
  Pencil,
  Clock,
  Building,
  CreditCard,
  FileText,
  AlertTriangle
} from 'lucide-react';

const CATEGORIES = [
  'Utility Bill',
  'Vendor / Supplier',
  'Maintenance / Construction',
  'Salary / Honorarium',
  'Stationery & Books',
  'Food & Ration',
  'Other'
];

const ACCOUNTS = ['Cash', 'JazzCash', 'Easypaisa', 'Meezan Bank'] as const;

export default function FinanceLiability() {
  const { hasPermission, isCreateOnly } = useAuth();

  const [liabilities, setLiabilities] = useState<Liability[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');

  // Expanded detail drawer
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [expandedDetail, setExpandedDetail] = useState<{
    liability: Liability;
    total_paid: number;
    remaining_balance: number;
    payments: LiabilityPayment[];
  } | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Create / Edit Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLiability, setEditingLiability] = useState<Liability | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    category: 'Utility Bill',
    amount_total: '',
    date_incurred: new Date().toISOString().split('T')[0],
    due_date: '',
    notes: ''
  });

  // Payment Modal State
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentLiability, setPaymentLiability] = useState<Liability | null>(null);
  const [submittingPayment, setSubmittingPayment] = useState(false);
  const [paymentErrorMsg, setPaymentErrorMsg] = useState('');
  const [paymentFormData, setPaymentFormData] = useState({
    amount_paid: '',
    date_paid: new Date().toISOString().split('T')[0],
    paid_from_account: 'Cash' as 'Cash' | 'JazzCash' | 'Easypaisa' | 'Meezan Bank',
    notes: ''
  });

  // Create-only operator success state
  const [createSuccessBanner, setCreateSuccessBanner] = useState(false);

  // Permission flags
  const canView = hasPermission('finance_liability', 'view');
  const canCreate = hasPermission('finance_liability', 'create');
  const canEdit = hasPermission('finance_liability', 'edit');
  const canDelete = hasPermission('finance_liability', 'delete');
  const isCreateOnlyMode = isCreateOnly('finance_liability');

  const fetchLiabilities = useCallback(async () => {
    if (!canView) return;
    setLoading(true);
    try {
      const data = await getFinanceLiabilities({
        search: searchQuery || undefined,
        category: selectedCategory !== 'All' ? selectedCategory : undefined,
        status: selectedStatus !== 'All' ? selectedStatus : undefined
      });
      setLiabilities(data);
    } catch (err) {
      console.error('Failed to load liabilities', err);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedCategory, selectedStatus, canView]);

  useEffect(() => {
    fetchLiabilities();
  }, [fetchLiabilities]);

  // Toggle detail view
  const handleToggleExpand = async (id: string) => {
    if (expandedId === id) {
      setExpandedId(null);
      setExpandedDetail(null);
    } else {
      setExpandedId(id);
      setLoadingDetail(true);
      try {
        const detail = await getFinanceLiabilityDetail(id);
        setExpandedDetail(detail);
      } catch (err) {
        console.error('Failed to load liability detail', err);
      } finally {
        setLoadingDetail(false);
      }
    }
  };

  // Open Create Modal
  const handleOpenCreateModal = () => {
    setEditingLiability(null);
    setFormData({
      title: '',
      category: 'Utility Bill',
      amount_total: '',
      date_incurred: new Date().toISOString().split('T')[0],
      due_date: '',
      notes: ''
    });
    setErrorMsg('');
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (lb: Liability) => {
    setEditingLiability(lb);
    setFormData({
      title: lb.title,
      category: lb.category || 'Utility Bill',
      amount_total: lb.amount_total.toString(),
      date_incurred: lb.date_incurred || new Date().toISOString().split('T')[0],
      due_date: lb.due_date || '',
      notes: lb.notes || ''
    });
    setErrorMsg('');
    setIsModalOpen(true);
  };

  // Save (Create or Update) Liability
  const handleSaveLiability = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setErrorMsg('Title / Bill details are required');
      return;
    }
    if (!formData.amount_total || parseFloat(formData.amount_total) <= 0) {
      setErrorMsg('Please enter a valid total payable amount');
      return;
    }

    setSubmitting(true);
    setErrorMsg('');
    try {
      if (editingLiability) {
        await updateFinanceLiability(editingLiability.id, {
          title: formData.title.trim(),
          category: formData.category,
          amount_total: parseFloat(formData.amount_total),
          date_incurred: formData.date_incurred,
          due_date: formData.due_date ? formData.due_date : undefined,
          notes: formData.notes.trim()
        });
      } else {
        await createFinanceLiability({
          title: formData.title.trim(),
          category: formData.category,
          amount_total: parseFloat(formData.amount_total),
          date_incurred: formData.date_incurred,
          due_date: formData.due_date ? formData.due_date : undefined,
          notes: formData.notes.trim()
        });
      }

      setIsModalOpen(false);
      if (isCreateOnlyMode) {
        setCreateSuccessBanner(true);
        setFormData({
          title: '',
          category: 'Utility Bill',
          amount_total: '',
          date_incurred: new Date().toISOString().split('T')[0],
          due_date: '',
          notes: ''
        });
      } else {
        fetchLiabilities();
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to save liability');
    } finally {
      setSubmitting(false);
    }
  };

  // Open Record Payment Modal
  const handleOpenPaymentModal = (lb: Liability) => {
    setPaymentLiability(lb);
    setPaymentFormData({
      amount_paid: lb.remaining_balance > 0 ? lb.remaining_balance.toString() : '',
      date_paid: new Date().toISOString().split('T')[0],
      paid_from_account: 'Cash',
      notes: ''
    });
    setPaymentErrorMsg('');
    setIsPaymentModalOpen(true);
  };

  // Submit Payment
  const handleSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentLiability) return;

    const amount = parseFloat(paymentFormData.amount_paid);
    if (isNaN(amount) || amount <= 0) {
      setPaymentErrorMsg('Please enter a valid payment amount');
      return;
    }

    setSubmittingPayment(true);
    setPaymentErrorMsg('');
    try {
      await addFinanceLiabilityPayment(paymentLiability.id, {
        amount_paid: amount,
        date_paid: paymentFormData.date_paid,
        paid_from_account: paymentFormData.paid_from_account,
        notes: paymentFormData.notes.trim()
      });

      setIsPaymentModalOpen(false);
      fetchLiabilities();
      if (expandedId === paymentLiability.id) {
        handleToggleExpand(paymentLiability.id); // refresh drawer
      }
    } catch (err: any) {
      setPaymentErrorMsg(err.message || 'Failed to record payment');
    } finally {
      setSubmittingPayment(false);
    }
  };

  // Delete Liability
  const handleDeleteLiability = async (lb: Liability) => {
    if (!window.confirm(`Are you sure you want to delete "${lb.title}" and its payment records?`)) return;
    try {
      await deleteFinanceLiability(lb.id);
      fetchLiabilities();
      if (expandedId === lb.id) {
        setExpandedId(null);
        setExpandedDetail(null);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to delete liability');
    }
  };

  // Summary Metrics
  const totalLiabilitiesAmount = liabilities.reduce((sum, lb) => sum + lb.amount_total, 0);
  const totalPaidAmount = liabilities.reduce((sum, lb) => sum + lb.total_paid, 0);
  const totalRemainingAmount = liabilities.reduce((sum, lb) => sum + lb.remaining_balance, 0);
  const activeCount = liabilities.filter((lb) => lb.status !== 'Fully Paid').length;

  // Render CREATE-ONLY mode for Operator
  if (isCreateOnlyMode) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-200 shadow-xs space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
            <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center border border-rose-200">
              <Receipt className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 font-serif">Record Liability / Payable Bill</h2>
              <p className="text-xs text-gray-500">Record a pending utility bill, vendor dues, or expense liability</p>
            </div>
          </div>

          {createSuccessBanner && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-emerald-800 text-xs">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span className="font-semibold">Liability recorded successfully!</span>
              </div>
              <button
                onClick={() => setCreateSuccessBanner(false)}
                className="font-bold underline text-emerald-900 hover:text-emerald-700 cursor-pointer"
              >
                + Record Another
              </button>
            </div>
          )}

          {errorMsg && (
            <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSaveLiability} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Liability / Bill Title *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. K-Electric Bill Jan 2026, Ration Supplier Al-Madina"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-[#145A32]/20 focus:border-[#145A32] outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-[#145A32]/20 focus:border-[#145A32] outline-none"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Total Amount Due (PKR) *
                </label>
                <input
                  type="number"
                  min="1"
                  step="any"
                  required
                  placeholder="0.00"
                  value={formData.amount_total}
                  onChange={(e) => setFormData({ ...formData, amount_total: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-gray-900 focus:bg-white focus:ring-2 focus:ring-[#145A32]/20 focus:border-[#145A32] outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Bill / Incurred Date
                </label>
                <input
                  type="date"
                  value={formData.date_incurred}
                  onChange={(e) => setFormData({ ...formData, date_incurred: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-[#145A32]/20 focus:border-[#145A32] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Due Date (Optional)
                </label>
                <input
                  type="date"
                  value={formData.due_date}
                  onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-[#145A32]/20 focus:border-[#145A32] outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Notes / Invoice Number / Contact Details
              </label>
              <textarea
                rows={3}
                placeholder="Reference number, bill consumer ID, vendor phone number, payment terms..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-[#145A32]/20 focus:border-[#145A32] outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 bg-[#145A32] hover:bg-[#0E4124] text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Saving Liability Entry...</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>Save Liability Record</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Header Card with Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-gray-200 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center border border-rose-200 shrink-0">
            <Receipt className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base sm:text-xl font-bold font-serif text-[#145A32] tracking-tight">
              Liabilities & Utility Bills (واجبات و بلز)
            </h1>
            <p className="text-[11px] sm:text-xs text-gray-500 font-medium">
              Manage electricity/gas bills, supplier dues, construction payables, and partial payment schedules
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto justify-end">
          <button
            onClick={() => exportFinanceExcel()}
            className="px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Download Complete Financial Statement Excel"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Excel Export</span>
          </button>

          {canCreate && (
            <button
              onClick={handleOpenCreateModal}
              className="px-4 py-2 bg-[#145A32] hover:bg-[#0E4124] text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ Add Liability / Bill</span>
            </button>
          )}
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs space-y-1">
          <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Total Incurred Bills</p>
          <p className="text-lg sm:text-2xl font-black font-mono text-gray-900">
            Rs {totalLiabilitiesAmount.toLocaleString()}
          </p>
          <p className="text-[10px] text-gray-400 font-medium">{liabilities.length} recorded items</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-emerald-200/80 shadow-2xs space-y-1 bg-gradient-to-b from-white to-emerald-50/20">
          <p className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">Total Paid So Far</p>
          <p className="text-lg sm:text-2xl font-black font-mono text-emerald-700">
            Rs {totalPaidAmount.toLocaleString()}
          </p>
          <p className="text-[10px] text-emerald-600 font-medium">
            {totalLiabilitiesAmount > 0 ? `${Math.round((totalPaidAmount / totalLiabilitiesAmount) * 100)}% settled` : '0%'}
          </p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-rose-200 shadow-2xs space-y-1 bg-gradient-to-b from-white to-rose-50/20">
          <p className="text-[11px] font-bold text-rose-700 uppercase tracking-wider">Remaining Balance to Pay</p>
          <p className="text-lg sm:text-2xl font-black font-mono text-rose-700">
            Rs {totalRemainingAmount.toLocaleString()}
          </p>
          <p className="text-[10px] text-rose-600 font-medium">Outstanding pending dues</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-amber-200 shadow-2xs space-y-1 bg-gradient-to-b from-white to-amber-50/20">
          <p className="text-[11px] font-bold text-amber-800 uppercase tracking-wider">Active / Pending Bills</p>
          <p className="text-lg sm:text-2xl font-black font-mono text-amber-800">{activeCount}</p>
          <p className="text-[10px] text-amber-700 font-medium">Unsettled accounts</p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by title, invoice number, vendor, or notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:bg-white focus:ring-2 focus:ring-[#145A32]/20 focus:border-[#145A32] outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:bg-white outline-none cursor-pointer"
          >
            <option value="All">All Categories</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:bg-white outline-none cursor-pointer"
          >
            <option value="All">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Partially Paid">Partially Paid</option>
            <option value="Fully Paid">Fully Paid</option>
          </select>
        </div>
      </div>

      {/* Liabilities List / Cards */}
      {loading ? (
        <div className="bg-white p-12 rounded-2xl border border-gray-200 text-center">
          <div className="w-8 h-8 border-3 border-[#145A32] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-gray-500 font-medium mt-3">Loading liabilities and payment records...</p>
        </div>
      ) : liabilities.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-gray-200 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-700 mx-auto flex items-center justify-center">
            <Receipt className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-gray-900 font-serif">No liabilities recorded yet</h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            Record electricity/gas bills, supplier payables, or construction dues to track payment progress.
          </p>
          {canCreate && (
            <button
              onClick={handleOpenCreateModal}
              className="px-4 py-2 bg-[#145A32] text-white text-xs font-bold rounded-xl shadow-xs hover:bg-[#0E4124] transition-all cursor-pointer inline-flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Add First Liability</span>
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {liabilities.map((lb) => {
            const isFullyPaid = lb.status === 'Fully Paid';
            const isPartiallyPaid = lb.status === 'Partially Paid';
            const percentPaid = lb.amount_total > 0 ? Math.min(100, Math.round((lb.total_paid / lb.amount_total) * 100)) : 0;
            const isExpanded = expandedId === lb.id;

            return (
              <div
                key={lb.id}
                className="bg-white rounded-2xl border border-gray-200/90 shadow-2xs overflow-hidden transition-all hover:border-gray-300"
              >
                <div className="p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  {/* Left: Title & Category & Dates */}
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="font-bold text-sm sm:text-base text-gray-900">{lb.title}</span>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 text-gray-700 border border-gray-200">
                        {lb.category}
                      </span>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                          isFullyPaid
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : isPartiallyPaid
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : 'bg-rose-50 text-rose-700 border-rose-200'
                        }`}
                      >
                        {lb.status}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-[11px] text-gray-500 font-medium flex-wrap">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-gray-400" />
                        Incurred: {lb.date_incurred}
                      </span>
                      {lb.due_date && (
                        <span className="flex items-center gap-1 text-amber-700 font-semibold">
                          <Clock className="w-3.5 h-3.5 text-amber-600" />
                          Due: {lb.due_date}
                        </span>
                      )}
                      {lb.notes && <span className="text-gray-400 italic">“{lb.notes}”</span>}
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full max-w-md pt-1">
                      <div className="flex items-center justify-between text-[10px] text-gray-500 mb-1">
                        <span>Paid: Rs {lb.total_paid.toLocaleString()}</span>
                        <span className="font-bold">{percentPaid}%</span>
                      </div>
                      <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-300 ${
                            isFullyPaid ? 'bg-emerald-600' : isPartiallyPaid ? 'bg-amber-500' : 'bg-gray-300'
                          }`}
                          style={{ width: `${percentPaid}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Middle: Amount & Remaining */}
                  <div className="flex md:flex-col items-center md:items-end justify-between w-full md:w-auto gap-1 border-t md:border-t-0 pt-3 md:pt-0 border-gray-100">
                    <div className="text-left md:text-right">
                      <p className="text-[10px] text-gray-400 font-bold uppercase">Total Due</p>
                      <p className="text-sm sm:text-base font-black font-mono text-gray-900">
                        Rs {lb.amount_total.toLocaleString()}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-[10px] text-gray-400 font-bold uppercase">Remaining</p>
                      <p
                        className={`text-sm sm:text-base font-black font-mono ${
                          lb.remaining_balance > 0 ? 'text-rose-600' : 'text-emerald-600'
                        }`}
                      >
                        Rs {lb.remaining_balance.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center gap-1.5 w-full md:w-auto justify-end border-t md:border-t-0 pt-3 md:pt-0 border-gray-100">
                    {!isFullyPaid && canCreate && (
                      <button
                        onClick={() => handleOpenPaymentModal(lb)}
                        className="px-3 py-1.5 bg-[#145A32] hover:bg-[#0E4124] text-white text-xs font-bold rounded-lg shadow-2xs flex items-center gap-1 cursor-pointer transition-colors"
                        title="Record payment towards this liability"
                      >
                        <CreditCard className="w-3.5 h-3.5" />
                        <span>Pay Bill</span>
                      </button>
                    )}

                    <button
                      onClick={() => handleToggleExpand(lb.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all flex items-center gap-1 cursor-pointer ${
                        isExpanded
                          ? 'bg-gray-100 text-gray-900 border-gray-300'
                          : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                      }`}
                      title="View payment history"
                    >
                      <History className="w-3.5 h-3.5 text-gray-500" />
                      <span>History</span>
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>

                    {canEdit && (
                      <button
                        onClick={() => handleOpenEditModal(lb)}
                        className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                        title="Edit Liability"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {canDelete && (
                      <button
                        onClick={() => handleDeleteLiability(lb)}
                        className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                        title="Delete Liability"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Expandable Payment History Drawer */}
                {isExpanded && (
                  <div className="bg-[#FAFBFD] p-4 sm:p-5 border-t border-gray-100 animate-in slide-in-from-top-2 duration-150">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
                        <History className="w-4 h-4 text-[#145A32]" />
                        <span>Payment History & Account Debits</span>
                      </h4>
                      {!isFullyPaid && canCreate && (
                        <button
                          onClick={() => handleOpenPaymentModal(lb)}
                          className="text-xs font-bold text-[#145A32] hover:underline cursor-pointer"
                        >
                          + Record Partial Payment
                        </button>
                      )}
                    </div>

                    {loadingDetail ? (
                      <div className="py-4 text-center text-xs text-gray-400">Loading payment ledger...</div>
                    ) : expandedDetail && expandedDetail.payments.length > 0 ? (
                      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 font-bold">
                            <tr>
                              <th className="p-3">Payment Date</th>
                              <th className="p-3">Paid From Account</th>
                              <th className="p-3">Amount Paid</th>
                              <th className="p-3">Notes / Receipt</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {expandedDetail.payments.map((pmt) => (
                              <tr key={pmt.id} className="hover:bg-gray-50/50">
                                <td className="p-3 font-medium text-gray-900">{pmt.date_paid}</td>
                                <td className="p-3">
                                  <span className="px-2 py-0.5 rounded-md bg-gray-100 text-gray-700 font-semibold text-[10px]">
                                    {pmt.paid_from_account}
                                  </span>
                                </td>
                                <td className="p-3 font-mono font-bold text-emerald-700">
                                  Rs {pmt.amount_paid.toLocaleString()}
                                </td>
                                <td className="p-3 text-gray-500 italic">{pmt.notes || '—'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="py-4 bg-white rounded-xl border border-dashed border-gray-200 text-center text-xs text-gray-400">
                        No payments recorded for this liability yet.
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* CREATE / EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-4 sm:p-5 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-rose-50/50 to-white">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center">
                  <Receipt className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-gray-900 text-sm sm:text-base font-serif">
                  {editingLiability ? 'Edit Liability / Bill' : 'Record New Liability / Bill'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveLiability} className="p-4 sm:p-6 space-y-4">
              {errorMsg && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Title / Payable Details *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. K-Electric Bill Jan 2026, Ration Supplier Al-Madina"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-[#145A32]/20 focus:border-[#145A32] outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-[#145A32]/20 focus:border-[#145A32] outline-none"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Total Amount Due (PKR) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="any"
                    required
                    placeholder="0.00"
                    value={formData.amount_total}
                    onChange={(e) => setFormData({ ...formData, amount_total: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-gray-900 focus:bg-white focus:ring-2 focus:ring-[#145A32]/20 focus:border-[#145A32] outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Bill / Incurred Date
                  </label>
                  <input
                    type="date"
                    value={formData.date_incurred}
                    onChange={(e) => setFormData({ ...formData, date_incurred: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-[#145A32]/20 focus:border-[#145A32] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Due Date (Optional)
                  </label>
                  <input
                    type="date"
                    value={formData.due_date}
                    onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-[#145A32]/20 focus:border-[#145A32] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Notes / Bill ID / Contact Details
                </label>
                <textarea
                  rows={2}
                  placeholder="Consumer number, supplier phone, delivery receipt..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-[#145A32]/20 focus:border-[#145A32] outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-[#145A32] hover:bg-[#0E4124] text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : editingLiability ? 'Update Liability' : 'Save Liability'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RECORD PAYMENT MODAL */}
      {isPaymentModalOpen && paymentLiability && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-4 sm:p-5 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-emerald-50/50 to-white">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <CreditCard className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-sm sm:text-base font-serif">Record Payment</h3>
                  <p className="text-[11px] text-gray-500 truncate max-w-[240px]">{paymentLiability.title}</p>
                </div>
              </div>
              <button
                onClick={() => setIsPaymentModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitPayment} className="p-4 sm:p-6 space-y-4">
              {paymentErrorMsg && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{paymentErrorMsg}</span>
                </div>
              )}

              <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-200 space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-500">Total Bill Amount:</span>
                  <span className="font-mono font-bold text-gray-900">
                    Rs {paymentLiability.amount_total.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Already Paid:</span>
                  <span className="font-mono font-bold text-emerald-700">
                    Rs {paymentLiability.total_paid.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between pt-1 border-t border-gray-200 font-bold">
                  <span className="text-rose-700">Remaining Balance:</span>
                  <span className="font-mono text-rose-700">
                    Rs {paymentLiability.remaining_balance.toLocaleString()}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Amount Paying Now (PKR) *
                </label>
                <input
                  type="number"
                  min="1"
                  step="any"
                  required
                  placeholder="0.00"
                  value={paymentFormData.amount_paid}
                  onChange={(e) => setPaymentFormData({ ...paymentFormData, amount_paid: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-emerald-800 focus:bg-white focus:ring-2 focus:ring-[#145A32]/20 focus:border-[#145A32] outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Payment Date
                  </label>
                  <input
                    type="date"
                    value={paymentFormData.date_paid}
                    onChange={(e) => setPaymentFormData({ ...paymentFormData, date_paid: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-[#145A32]/20 focus:border-[#145A32] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Paid From Account
                  </label>
                  <select
                    value={paymentFormData.paid_from_account}
                    onChange={(e) =>
                      setPaymentFormData({
                        ...paymentFormData,
                        paid_from_account: e.target.value as any
                      })
                    }
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-[#145A32]/20 focus:border-[#145A32] outline-none"
                  >
                    {ACCOUNTS.map((acc) => (
                      <option key={acc} value={acc}>
                        {acc}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Notes / Receipt Number (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Bank transaction ID, Paid via Cash voucher #124"
                  value={paymentFormData.notes}
                  onChange={(e) => setPaymentFormData({ ...paymentFormData, notes: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-[#145A32]/20 focus:border-[#145A32] outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsPaymentModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingPayment}
                  className="px-5 py-2 bg-[#145A32] hover:bg-[#0E4124] text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer disabled:opacity-50"
                >
                  {submittingPayment ? 'Processing...' : 'Confirm Payment & Log Expense'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
