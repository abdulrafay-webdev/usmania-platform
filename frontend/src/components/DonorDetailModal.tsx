'use client';

import React, { useState, useEffect } from 'react';
import {
  DonorDetailResponse,
  DonorComment,
  getDonorDetail,
  addDonorComment,
  deleteDonorComment
} from '@/lib/api';
import {
  X,
  Heart,
  Calendar,
  Phone,
  Mail,
  MapPin,
  MessageSquare,
  Send,
  Trash2,
  Package,
  BadgePercent,
  Coins,
  Receipt,
  User,
  Clock,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

interface DonorDetailModalProps {
  donorId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onCommentsUpdated?: () => void;
}

export default function DonorDetailModal({
  donorId,
  isOpen,
  onClose,
  onCommentsUpdated
}: DonorDetailModalProps) {
  const [data, setData] = useState<DonorDetailResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Active Tab: 'comments' | 'cash' | 'kind'
  const [activeTab, setActiveTab] = useState<'comments' | 'cash' | 'kind'>('comments');

  // New Comment Form State
  const [authorName, setAuthorName] = useState('');
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [commentError, setCommentError] = useState('');

  useEffect(() => {
    if (isOpen && donorId) {
      loadDonorDetails(donorId);
      // Retrieve stored author name if previously used
      const savedAuthor = localStorage.getItem('last_comment_author');
      if (savedAuthor) setAuthorName(savedAuthor);
    } else {
      setData(null);
      setErrorMsg('');
      setCommentText('');
    }
  }, [isOpen, donorId]);

  const loadDonorDetails = async (id: string) => {
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await getDonorDetail(id);
      setData(res);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to load donor details');
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!donorId || !data) return;

    if (!authorName.trim()) {
      setCommentError('Please enter your name (Comment kis person nay add kiya)');
      return;
    }
    if (!commentText.trim()) {
      setCommentError('Comment text cannot be empty');
      return;
    }

    setSubmittingComment(true);
    setCommentError('');

    try {
      const newComment = await addDonorComment(donorId, {
        author_name: authorName.trim(),
        content: commentText.trim()
      });

      // Save author for quick future comments
      localStorage.setItem('last_comment_author', authorName.trim());

      setData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          comments: [newComment, ...prev.comments]
        };
      });

      setCommentText('');
      if (onCommentsUpdated) onCommentsUpdated();
    } catch (err: any) {
      setCommentError(err.message || 'Failed to post comment');
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!donorId || !confirm('Are you sure you want to delete this comment?')) return;
    try {
      await deleteDonorComment(donorId, commentId);
      setData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          comments: prev.comments.filter((c) => c.id !== commentId)
        };
      });
      if (onCommentsUpdated) onCommentsUpdated();
    } catch (err: any) {
      alert(err.message || 'Failed to delete comment');
    }
  };

  if (!isOpen || !donorId) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl border border-gray-200 shadow-2xl w-full max-w-4xl overflow-hidden my-8 animate-fadeIn">
        {/* Header */}
        <div className="bg-[#145A32] text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white hover:bg-white/10 p-1.5 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {loading ? (
            <div className="py-6 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-white border-t-transparent mb-2" />
              <p className="text-xs text-white/80">Loading donor profile...</p>
            </div>
          ) : data ? (
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-white shadow-inner">
                  <Heart className="w-7 h-7 text-[#FDF6E3] fill-[#FDF6E3]/30" />
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold font-serif leading-tight">
                      {data.donor.name}
                    </h2>
                    <span className="px-2.5 py-0.5 bg-[#FDF6E3] text-[#145A32] text-xs font-bold rounded-md border border-white/20">
                      {data.donor.category || 'Individual'}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-[#FDF6E3]/90 mt-1 font-medium">
                    {data.donor.contact && (
                      <span className="flex items-center gap-1">
                        <Phone className="w-3.5 h-3.5" /> {data.donor.contact}
                      </span>
                    )}
                    {data.donor.email && (
                      <span className="flex items-center gap-1">
                        <Mail className="w-3.5 h-3.5" /> {data.donor.email}
                      </span>
                    )}
                    {(data.donor.city || data.donor.address) && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" /> {data.donor.city || data.donor.address}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Quick lifetime metric badges */}
              <div className="flex items-center gap-2 bg-white/10 p-2.5 rounded-xl border border-white/15">
                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-white/70 block">
                    Total Cash Contribution
                  </span>
                  <span className="text-base font-bold text-[#FDF6E3] font-mono">
                    Rs. {data.total_cash_donated.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          ) : null}
        </div>

        {errorMsg ? (
          <div className="p-8 text-center text-red-600 bg-red-50 text-sm">
            <AlertCircle className="w-8 h-8 mx-auto mb-2 text-red-500" />
            <p>{errorMsg}</p>
          </div>
        ) : data ? (
          <div>
            {/* Metric Strip */}
            <div className="bg-[#FAF5EA] px-6 py-3 border-b border-[#145A32]/15 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-medium text-gray-700">
              <div className="flex items-center gap-2">
                <Coins className="w-4 h-4 text-[#145A32]" />
                <div>
                  <span className="text-gray-500 text-[11px] block">Cash Donations</span>
                  <span className="font-bold text-[#145A32]">{data.donations_count} times</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-blue-600" />
                <div>
                  <span className="text-gray-500 text-[11px] block">In-Kind Items</span>
                  <span className="font-bold text-blue-900">{data.kind_count} items</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <BadgePercent className="w-4 h-4 text-emerald-600" />
                <div>
                  <span className="text-gray-500 text-[11px] block">In-Kind Est. Value</span>
                  <span className="font-bold text-emerald-800 font-mono">
                    Rs. {data.total_kind_value.toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-amber-600" />
                <div>
                  <span className="text-gray-500 text-[11px] block">Recorded Comments</span>
                  <span className="font-bold text-amber-900">{data.comments.length} notes</span>
                </div>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex border-b border-gray-200 bg-white px-6">
              <button
                onClick={() => setActiveTab('comments')}
                className={`py-3 px-4 text-xs font-bold border-b-2 flex items-center gap-2 transition-colors ${
                  activeTab === 'comments'
                    ? 'border-[#145A32] text-[#145A32]'
                    : 'border-transparent text-gray-500 hover:text-gray-800'
                }`}
              >
                <MessageSquare className="w-4 h-4" />
                <span>Comments & Notes ({data.comments.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('cash')}
                className={`py-3 px-4 text-xs font-bold border-b-2 flex items-center gap-2 transition-colors ${
                  activeTab === 'cash'
                    ? 'border-[#145A32] text-[#145A32]'
                    : 'border-transparent text-gray-500 hover:text-gray-800'
                }`}
              >
                <Receipt className="w-4 h-4" />
                <span>Cash Receipts ({data.cash_donations.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('kind')}
                className={`py-3 px-4 text-xs font-bold border-b-2 flex items-center gap-2 transition-colors ${
                  activeTab === 'kind'
                    ? 'border-[#145A32] text-[#145A32]'
                    : 'border-transparent text-gray-500 hover:text-gray-800'
                }`}
              >
                <Package className="w-4 h-4" />
                <span>In-Kind Donations ({data.kind_donations.length})</span>
              </button>
            </div>

            {/* Tab Contents */}
            <div className="p-6 max-h-[55vh] overflow-y-auto space-y-6">
              {/* TAB 1: COMMENTS & REMARKS */}
              {activeTab === 'comments' && (
                <div className="space-y-6">
                  {/* Add New Comment Box */}
                  <form
                    onSubmit={handleAddComment}
                    className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#145A32] uppercase tracking-wider flex items-center gap-1.5">
                        <MessageSquare className="w-3.5 h-3.5" />
                        Add Follow-up Comment / Note (Donor Remarks)
                      </span>
                    </div>

                    {commentError && (
                      <div className="p-2.5 bg-red-50 text-red-700 text-xs rounded-lg border border-red-200 flex items-center gap-1.5">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>{commentError}</span>
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {/* Author Name Input */}
                      <div className="sm:col-span-1">
                        <label className="block text-[11px] font-bold text-gray-700 mb-1">
                          Comment Added By (آپ کا نام) <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            required
                            value={authorName}
                            onChange={(e) => setAuthorName(e.target.value)}
                            placeholder="e.g. Maulana Tariq / Admin"
                            className="w-full pl-7 pr-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#145A32]/20 focus:border-[#145A32] bg-white"
                          />
                          <User className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2.5" />
                        </div>
                      </div>

                      {/* Comment Input */}
                      <div className="sm:col-span-2">
                        <label className="block text-[11px] font-bold text-gray-700 mb-1">
                          Comment / Meeting Notes (تفصیل) <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={commentText}
                          onChange={(e) => setCommentText(e.target.value)}
                          placeholder="e.g. Spoke on phone, committed 50k donation before Ramadan..."
                          className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#145A32]/20 focus:border-[#145A32] bg-white"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end pt-1">
                      <button
                        type="submit"
                        disabled={submittingComment}
                        className="px-4 py-1.5 bg-[#145A32] hover:bg-[#0E4124] text-white text-xs font-bold rounded-lg shadow-xs transition-colors flex items-center gap-1.5 disabled:opacity-50"
                      >
                        {submittingComment ? (
                          <>
                            <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            <span>Posting...</span>
                          </>
                        ) : (
                          <>
                            <Send className="w-3.5 h-3.5" />
                            <span>Post Comment</span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>

                  {/* Comments Feed */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Previous Comments & Follow-up History
                    </h4>

                    {data.comments.length === 0 ? (
                      <div className="p-8 text-center bg-gray-50 rounded-xl border border-gray-200 text-gray-400 text-xs">
                        No comments recorded yet for this donor. Add the first remark above!
                      </div>
                    ) : (
                      <div className="space-y-2.5">
                        {data.comments.map((comment) => (
                          <div
                            key={comment.id}
                            className="p-3.5 bg-white rounded-xl border border-gray-200 shadow-2xs hover:border-[#145A32]/30 transition-all flex items-start justify-between gap-3"
                          >
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#FDF6E3] text-[#145A32] text-xs font-bold rounded border border-[#145A32]/20">
                                  <User className="w-3 h-3" />
                                  {comment.author_name}
                                </span>
                                <span className="text-[11px] text-gray-400 flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {new Date(comment.created_at).toLocaleString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </span>
                              </div>

                              <p className="text-xs text-gray-800 leading-relaxed font-medium pl-1">
                                {comment.content}
                              </p>
                            </div>

                            <button
                              onClick={() => handleDeleteComment(comment.id)}
                              className="text-gray-400 hover:text-red-600 p-1 rounded-md transition-colors"
                              title="Delete comment"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 2: CASH DONATION RECEIPTS */}
              {activeTab === 'cash' && (
                <div>
                  {data.cash_donations.length === 0 ? (
                    <div className="p-8 text-center bg-gray-50 rounded-xl border border-gray-200 text-gray-400 text-xs">
                      No cash donation receipts found in Finance module for this donor.
                    </div>
                  ) : (
                    <div className="overflow-x-auto border border-gray-200 rounded-xl">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-[#FAF5EA] text-[#145A32] font-bold border-b border-gray-200">
                          <tr>
                            <th className="py-2.5 px-3">Date</th>
                            <th className="py-2.5 px-3">Account</th>
                            <th className="py-2.5 px-3">Mode</th>
                            <th className="py-2.5 px-3">Purpose / Notes</th>
                            <th className="py-2.5 px-3 text-right">Amount (PKR)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {data.cash_donations.map((rec) => (
                            <tr key={rec.id} className="hover:bg-gray-50">
                              <td className="py-2.5 px-3 font-medium text-gray-800">{rec.date}</td>
                              <td className="py-2.5 px-3">
                                <span className="px-2 py-0.5 bg-gray-100 rounded text-gray-700 font-medium">
                                  {rec.account}
                                </span>
                              </td>
                              <td className="py-2.5 px-3 text-gray-600">{rec.mode}</td>
                              <td className="py-2.5 px-3 text-gray-600">{rec.purpose_note || '—'}</td>
                              <td className="py-2.5 px-3 text-right font-mono font-bold text-[#145A32]">
                                Rs. {rec.amount.toLocaleString()}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: IN-KIND DONATIONS */}
              {activeTab === 'kind' && (
                <div>
                  {data.kind_donations.length === 0 ? (
                    <div className="p-8 text-center bg-gray-50 rounded-xl border border-gray-200 text-gray-400 text-xs">
                      No in-kind physical donations recorded for this donor.
                    </div>
                  ) : (
                    <div className="overflow-x-auto border border-gray-200 rounded-xl">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-[#FAF5EA] text-[#145A32] font-bold border-b border-gray-200">
                          <tr>
                            <th className="py-2.5 px-3">Date</th>
                            <th className="py-2.5 px-3">Item Description</th>
                            <th className="py-2.5 px-3">Category</th>
                            <th className="py-2.5 px-3">Qty / Condition</th>
                            <th className="py-2.5 px-3 text-right">Est. Value (PKR)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {data.kind_donations.map((kd) => (
                            <tr key={kd.id} className="hover:bg-gray-50">
                              <td className="py-2.5 px-3 font-medium text-gray-800">{kd.date}</td>
                              <td className="py-2.5 px-3 font-semibold text-gray-900">{kd.item_name}</td>
                              <td className="py-2.5 px-3">
                                <span className="px-2 py-0.5 bg-blue-50 text-blue-800 rounded font-medium">
                                  {kd.category}
                                </span>
                              </td>
                              <td className="py-2.5 px-3 text-gray-600">
                                {kd.quantity} pcs ({kd.condition || 'New'})
                              </td>
                              <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-700">
                                {kd.estimated_value ? `Rs. ${kd.estimated_value.toLocaleString()}` : '—'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ) : null}

        {/* Modal Footer */}
        <div className="p-4 bg-gray-50 border-t border-gray-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white border border-gray-300 text-gray-700 text-xs font-semibold rounded-lg hover:bg-gray-100 transition-colors shadow-2xs"
          >
            Close Profile
          </button>
        </div>
      </div>
    </div>
  );
}
