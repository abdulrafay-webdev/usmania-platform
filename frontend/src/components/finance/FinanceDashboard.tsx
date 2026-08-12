'use client';

import React, { useEffect, useState } from 'react';
import { getFinanceDashboardSummary, DashboardSummaryResponse } from '@/lib/api';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  Scale,
  Building,
  CreditCard,
  Smartphone,
  Landmark,
  ArrowUpRight,
  ArrowDownRight,
  Gift,
  RefreshCw,
  AlertCircle
} from 'lucide-react';

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend
} from 'recharts';

export default function FinanceDashboard() {
  const [data, setData] = useState<DashboardSummaryResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSummary = async () => {
    setLoading(true);
    try {
      const summary = await getFinanceDashboardSummary();
      setData(summary);
    } catch (err) {
      console.error('Failed to load finance dashboard', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-12 text-center shadow-xs">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-[#145A32] border-t-transparent mb-3" />
        <p className="text-gray-500 text-sm">Loading Financial Insights & Analytics...</p>
      </div>
    );
  }

  if (!data) return null;

  // Colors for charts
  const PIE_COLORS = ['#145A32', '#0284C7', '#7C3AED', '#D97706'];
  const KIND_COLORS = ['#059669', '#2563EB', '#D97706', '#9333EA', '#6B7280'];

  return (
    <div className="space-y-6">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-gray-200 shadow-2xs">
        <div>
          <h2 className="text-lg font-bold font-serif text-[#145A32]">
            Financial Overview & Real-time Analytics
          </h2>
          <p className="text-xs text-gray-500 font-medium">
            Live balance calculation across 4 accounts, income vs debit analytics & loan metrics
          </p>
        </div>

        <button
          onClick={fetchSummary}
          className="px-3 py-1.5 bg-[#FAF5EA] hover:bg-[#FDF6E3] text-[#145A32] rounded-lg border border-[#145A32]/20 text-xs font-semibold flex items-center gap-1.5 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* 1. Account Balances Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Grand Total Card */}
        <div className="bg-gradient-to-br from-[#145A32] to-[#0E4124] text-white p-5 rounded-2xl shadow-md border border-[#145A32] lg:col-span-1 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-[#FDF6E3]/80">
              <span className="text-xs font-bold uppercase tracking-wider">Grand Total Balance</span>
              <Wallet className="w-5 h-5 text-[#FDF6E3]" />
            </div>
            <div className="text-2xl font-bold font-mono mt-2 text-[#FDF6E3]">
              PKR {data.grand_total_balance.toLocaleString('en-PK')}
            </div>
          </div>
          <span className="text-[11px] text-[#FDF6E3]/70 font-medium mt-3 block">
            Combined sum of all 4 active accounts
          </span>
        </div>

        {/* 4 Small Account Cards */}
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-emerald-800">
            <span className="text-xs font-bold text-gray-600">Cash Account</span>
            <Building className="w-4 h-4 text-emerald-700" />
          </div>
          <div className="text-lg font-bold font-mono text-gray-900 mt-2">
            PKR {(data.account_balances.Cash || 0).toLocaleString('en-PK')}
          </div>
          <div className="w-full bg-gray-100 rounded-full h-1.5 mt-2 overflow-hidden">
            <div className="bg-emerald-600 h-full rounded-full" style={{ width: '100%' }} />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-red-800">
            <span className="text-xs font-bold text-gray-600">JazzCash</span>
            <Smartphone className="w-4 h-4 text-red-600" />
          </div>
          <div className="text-lg font-bold font-mono text-gray-900 mt-2">
            PKR {(data.account_balances.JazzCash || 0).toLocaleString('en-PK')}
          </div>
          <div className="w-full bg-gray-100 rounded-full h-1.5 mt-2 overflow-hidden">
            <div className="bg-red-500 h-full rounded-full" style={{ width: '100%' }} />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-emerald-800">
            <span className="text-xs font-bold text-gray-600">Easypaisa</span>
            <CreditCard className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-lg font-bold font-mono text-gray-900 mt-2">
            PKR {(data.account_balances.Easypaisa || 0).toLocaleString('en-PK')}
          </div>
          <div className="w-full bg-gray-100 rounded-full h-1.5 mt-2 overflow-hidden">
            <div className="bg-emerald-500 h-full rounded-full" style={{ width: '100%' }} />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-blue-800">
            <span className="text-xs font-bold text-gray-600">Meezan Bank</span>
            <Landmark className="w-4 h-4 text-blue-700" />
          </div>
          <div className="text-lg font-bold font-mono text-gray-900 mt-2">
            PKR {(data.account_balances['Meezan Bank'] || 0).toLocaleString('en-PK')}
          </div>
          <div className="w-full bg-gray-100 rounded-full h-1.5 mt-2 overflow-hidden">
            <div className="bg-blue-600 h-full rounded-full" style={{ width: '100%' }} />
          </div>
        </div>
      </div>

      {/* 2. Today's Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
            <ArrowUpRight className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-gray-500 font-medium block">Today's Received</span>
            <span className="text-base font-bold text-emerald-700 font-mono">
              PKR {data.today_received.toLocaleString('en-PK')}
            </span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-red-50 text-red-700 flex items-center justify-center shrink-0">
            <ArrowDownRight className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-gray-500 font-medium block">Today's Debit</span>
            <span className="text-base font-bold text-red-600 font-mono">
              PKR {data.today_debit.toLocaleString('en-PK')}
            </span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#FDF6E3] text-[#145A32] flex items-center justify-center shrink-0 border border-[#145A32]/20">
            <Scale className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-gray-500 font-medium block">Today's Net Flow</span>
            <span className={`text-base font-bold font-mono ${data.today_net >= 0 ? 'text-[#145A32]' : 'text-red-600'}`}>
              PKR {data.today_net.toLocaleString('en-PK')}
            </span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-gray-500 font-medium block">Active Loan Remaining</span>
            <span className="text-base font-bold text-amber-800 font-mono">
              PKR {data.active_loan_remaining.toLocaleString('en-PK')}
            </span>
          </div>
        </div>
      </div>

      {/* 3. Recharts Section - Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Income vs Expense Area Chart (2 cols) */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-gray-900">Income vs Expense Trend (Last 30 Days)</h3>
              <p className="text-xs text-gray-500">Daily cash flow trajectory across all accounts</p>
            </div>
            <div className="flex items-center gap-4 text-xs font-semibold">
              <span className="flex items-center gap-1.5 text-[#145A32]">
                <span className="w-2.5 h-2.5 rounded-full bg-[#145A32]" /> Income
              </span>
              <span className="flex items-center gap-1.5 text-red-600">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500" /> Expense
              </span>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.chart_income_vs_expense} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#145A32" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#145A32" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#EF4444" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748B' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748B' }} />
                <Tooltip
                  formatter={(val: any) => [`PKR ${Number(val).toLocaleString('en-PK')}`]}
                  contentStyle={{ backgroundColor: '#FFFFFF', borderRadius: '8px', borderColor: '#CBD5E1', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="Income" stroke="#145A32" strokeWidth={2} fillOpacity={1} fill="url(#incomeGrad)" />
                <Area type="monotone" dataKey="Expense" stroke="#EF4444" strokeWidth={2} fillOpacity={1} fill="url(#expenseGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Account Balance Pie Chart */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs space-y-4">
          <div>
            <h3 className="text-sm font-bold text-gray-900">Account Balance Share</h3>
            <p className="text-xs text-gray-500">Distribution across 4 money accounts</p>
          </div>

          <div className="h-56 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.chart_account_pie}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {data.chart_account_pie.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(val: any) => [`PKR ${Number(val).toLocaleString('en-PK')}`]} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Custom Legend */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            {data.chart_account_pie.map((item, idx) => (
              <div key={item.name} className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }} />
                <span className="text-gray-600 truncate">{item.name}:</span>
                <span className="font-bold text-gray-900 font-mono">PKR {item.value.toLocaleString('en-PK')}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Received Split (Income vs Donation) */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs space-y-4">
          <div>
            <h3 className="text-sm font-bold text-gray-900">Received: Income vs Donation</h3>
            <p className="text-xs text-gray-500">Total split between regular income & donations</p>
          </div>

          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.chart_received_split} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="type" tick={{ fontSize: 11, fill: '#64748B' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748B' }} />
                <Tooltip formatter={(val: any) => [`PKR ${Number(val).toLocaleString('en-PK')}`]} />
                <Bar dataKey="amount" fill="#145A32" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Debit by Purpose / Top Spending */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs space-y-4">
          <div>
            <h3 className="text-sm font-bold text-gray-900">Top Debit Categories</h3>
            <p className="text-xs text-gray-500">Highest expenditure purposes</p>
          </div>

          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.chart_debit_categories} layout="vertical" margin={{ top: 0, right: 10, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E2E8F0" />
                <XAxis type="number" tick={{ fontSize: 10, fill: '#64748B' }} />
                <YAxis type="category" dataKey="category" tick={{ fontSize: 10, fill: '#64748B' }} width={80} />
                <Tooltip formatter={(val: any) => [`PKR ${Number(val).toLocaleString('en-PK')}`]} />
                <Bar dataKey="amount" fill="#DC2626" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Kind Donations Overview */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs space-y-4">
          <div>
            <h3 className="text-sm font-bold text-gray-900">In-Kind Donations Summary</h3>
            <p className="text-xs text-gray-500">Categorized non-cash items donated</p>
          </div>

          <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
            {data.chart_kind_donations.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-8">No in-kind donations recorded yet</p>
            ) : (
              data.chart_kind_donations.map((item, idx) => (
                <div key={item.category} className="p-2.5 bg-gray-50 rounded-lg border border-gray-100 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <Gift className="w-4 h-4 text-emerald-600" />
                    <div>
                      <span className="font-semibold text-gray-800">{item.category}</span>
                      <span className="text-gray-400 block text-[11px]">{item.count} item(s)</span>
                    </div>
                  </div>
                  <span className="font-mono font-bold text-[#145A32]">
                    ~ PKR {item.value.toLocaleString('en-PK')}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Row 3: Loan Widget & Recent Transactions Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Loan Overview Widget */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs space-y-4">
          <div>
            <h3 className="text-sm font-bold text-gray-900">Active Loans Repayment Tracker</h3>
            <p className="text-xs text-gray-500">Taken vs Repaid vs Remaining balance per loan</p>
          </div>

          <div className="space-y-4 max-h-64 overflow-y-auto pr-1">
            {data.loan_overviews.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-8">No loan records active</p>
            ) : (
              data.loan_overviews.map((l) => {
                const percent = Math.min(100, Math.round((l.total_paid / l.amount_taken) * 100)) || 0;
                return (
                  <div key={l.lender_name} className="p-3 bg-gray-50 rounded-xl border border-gray-200 space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold text-gray-800">
                      <span>{l.lender_name}</span>
                      <span className={l.status === 'Fully Paid' ? 'text-emerald-700' : 'text-amber-800'}>
                        {l.status}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-gray-500 font-mono">
                      <span>Taken: PKR {l.amount_taken.toLocaleString('en-PK')}</span>
                      <span>Paid: PKR {l.total_paid.toLocaleString('en-PK')}</span>
                      <span className="font-bold text-gray-900">Rem: PKR {l.remaining.toLocaleString('en-PK')}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                      <div className="bg-[#145A32] h-full rounded-full transition-all" style={{ width: `${percent}%` }} />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Recent Transactions Feed */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs space-y-4">
          <div>
            <h3 className="text-sm font-bold text-gray-900">Recent Financial Activity</h3>
            <p className="text-xs text-gray-500">Live stream of transactions across all modules</p>
          </div>

          <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
            {data.recent_transactions.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-8">No transactions recorded yet</p>
            ) : (
              data.recent_transactions.map((tx) => (
                <div key={tx.id} className="p-2.5 bg-gray-50 rounded-lg border border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold ${
                      tx.type === 'Received' ? 'bg-emerald-100 text-emerald-800' :
                      tx.type === 'Debit' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                    }`}>
                      {tx.type === 'Received' ? '+' : tx.type === 'Debit' ? '-' : 'K'}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-gray-900">{tx.title}</h4>
                      <p className="text-[11px] text-gray-500">{tx.sub} • {tx.date}</p>
                    </div>
                  </div>
                  <span className={`text-xs font-bold font-mono ${
                    tx.type === 'Received' ? 'text-emerald-700' :
                    tx.type === 'Debit' ? 'text-red-600' : 'text-blue-700'
                  }`}>
                    {tx.type === 'Received' ? '+' : tx.type === 'Debit' ? '-' : ''} PKR {tx.amount.toLocaleString('en-PK')}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
