'use client';

import React, { useState, useEffect } from 'react';
import {
  DonorListItem,
  getDonors,
  createDonor,
  updateDonor,
  deleteDonor,
  addDonorComment
} from '@/lib/api';
import DonorDetailModal from './DonorDetailModal';
import {
  Heart,
  Search,
  Plus,
  Phone,
  Mail,
  MapPin,
  MessageSquare,
  Eye,
  Pencil,
  Trash2,
  Coins,
  Package,
  Calendar,
  Sparkles,
  User,
  Users,
  CheckCircle2,
  AlertCircle,
  X,
  Send,
  Building,
  Filter
} from 'lucide-react';

export default function DonorDirectory() {
  const [donors, setDonors] = useState<DonorListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Modal State
  const [detailModalDonorId, setDetailModalDonorId] = useState<string | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Quick Comment Modal State
  const [quickCommentDonor, setQuickCommentDonor] = useState<DonorListItem | null>(null);
  const [quickAuthor, setQuickAuthor] = useState('');
  const [quickContent, setQuickContent] = useState('');
  const [submittingQuickComment, setSubmittingQuickComment] = useState(false);

  // Create / Edit Donor Modal State
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingDonor, setEditingDonor] = useState<DonorListItem | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    contact: '',
    email: '',
    address: '',
    city: 'Karachi',
    country: 'Pakistan',
    category: 'Individual',
    notes: ''
  });

  const loadDonors = async () => {
    setLoading(true);
    try {
      const data = await getDonors(searchQuery);
      setDonors(data);
    } catch (err) {
      console.error('Failed to load donors:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDonors();
  }, [searchQuery]);

  // Total Aggregates
  const totalDonorsCount = donors.length;
  const totalCashRaised = donors.reduce((sum, d) => sum + (d.total_cash_donated || 0), 0);
  const totalKindItems = donors.reduce((sum, d) => sum + (d.total_kind_donations || 0), 0);
  const totalCommentsCount = donors.reduce((sum, d) => sum + (d.comments_count || 0), 0);

  // Filtered Donors
  const filteredDonors = donors.filter((d) => {
    if (selectedCategory === 'All') return true;
    return d.category === selectedCategory;
  });

  // Handle Form Open (New or Edit)
  const handleOpenForm = (donor?: DonorListItem) => {
    if (donor) {
      setEditingDonor(donor);
      setFormData({
        name: donor.name,
        contact: donor.contact,
        email: donor.email,
        address: donor.address,
        city: donor.city || 'Karachi',
        country: donor.country || 'Pakistan',
        category: donor.category || 'Individual',
        notes: donor.notes || ''
      });
    } else {
      setEditingDonor(null);
      setFormData({
        name: '',
        contact: '',
        email: '',
        address: '',
        city: 'Karachi',
        country: 'Pakistan',
        category: 'Individual',
        notes: ''
      });
    }
    setFormError('');
    setIsFormModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError('');

    try {
      if (editingDonor) {
        await updateDonor(editingDonor.id, formData);
      } else {
        await createDonor(formData);
      }
      setIsFormModalOpen(false);
      loadDonors();
    } catch (err: any) {
      setFormError(err.message || 'Failed to save donor record');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteDonor = async (donor: DonorListItem) => {
    if (!confirm(`Are you sure you want to delete donor "${donor.name}"?`)) return;
    try {
      await deleteDonor(donor.id);
      loadDonors();
    } catch (err: any) {
      alert(err.message || 'Failed to delete donor');
    }
  };

  // Quick Comment Submit
  const handleQuickCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickCommentDonor) return;
    if (!quickAuthor.trim() || !quickContent.trim()) {
      alert('Please fill out author name and comment');
      return;
    }

    setSubmittingQuickComment(true);
    try {
      await addDonorComment(quickCommentDonor.id, {
        author_name: quickAuthor.trim(),
        content: quickContent.trim()
      });
      localStorage.setItem('last_comment_author', quickAuthor.trim());
      setQuickCommentDonor(null);
      setQuickContent('');
      loadDonors();
    } catch (err: any) {
      alert(err.message || 'Failed to add comment');
    } finally {
      setSubmittingQuickComment(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Donors */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block">
              Total Donors
            </span>
            <span className="text-2xl font-bold font-serif text-[#145A32] mt-1 block">
              {totalDonorsCount}
            </span>
            <span className="text-[11px] text-gray-400 font-medium">
              Registered & Active Donors
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-[#FDF6E3] text-[#145A32] flex items-center justify-center shadow-inner">
            <Heart className="w-6 h-6 fill-[#145A32]/20" />
          </div>
        </div>

        {/* Card 2: Total Cash Raised */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block">
              Lifetime Cash Raised
            </span>
            <span className="text-2xl font-bold font-mono text-emerald-800 mt-1 block">
              Rs. {totalCashRaised.toLocaleString()}
            </span>
            <span className="text-[11px] text-emerald-600 font-medium">
              From Finance Donation entries
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shadow-inner">
            <Coins className="w-6 h-6" />
          </div>
        </div>

        {/* Card 3: Total In-Kind Items */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block">
              In-Kind Items Donated
            </span>
            <span className="text-2xl font-bold font-serif text-blue-900 mt-1 block">
              {totalKindItems} items
            </span>
            <span className="text-[11px] text-blue-600 font-medium">
              Physical goods & equipment
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center shadow-inner">
            <Package className="w-6 h-6" />
          </div>
        </div>

        {/* Card 4: Total Comments Recorded */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block">
              Follow-up Comments
            </span>
            <span className="text-2xl font-bold font-serif text-amber-900 mt-1 block">
              {totalCommentsCount} notes
            </span>
            <span className="text-[11px] text-amber-700 font-medium">
              With author identity recorded
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shadow-inner">
            <MessageSquare className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Control Bar: Search, Category Filter, and Add Donor Button */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          {/* Search Box */}
          <div className="relative flex-1 min-w-[240px] max-w-md">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search donor name, phone, email..."
              className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-[#145A32]/20 focus:border-[#145A32]"
            />
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg border border-gray-200 text-xs font-bold">
            {['All', 'Individual', 'Corporate', 'Foundation', 'Regular'].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-md transition-all ${
                  selectedCategory === cat
                    ? 'bg-white text-[#145A32] shadow-xs'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Add Donor Button */}
        <button
          onClick={() => handleOpenForm()}
          className="px-4 py-2 bg-[#145A32] hover:bg-[#0E4124] text-white text-xs font-bold rounded-lg shadow-sm transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Register New Donor</span>
        </button>
      </div>

      {/* Donors Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-[#145A32] border-t-transparent mb-3" />
            <p className="text-gray-500 text-sm">Loading donors directory...</p>
          </div>
        ) : filteredDonors.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 rounded-full bg-[#FDF6E3] text-[#145A32] flex items-center justify-center mx-auto mb-3">
              <Heart className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-gray-800">No Donors Found</h3>
            <p className="text-gray-500 text-xs max-w-sm mx-auto mt-1">
              Donors recorded in Finance (Donation entries) or added manually will appear here automatically.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#FAF5EA]/80 border-b border-gray-200 text-[#145A32] font-bold">
                  <th className="py-3.5 px-4">Donor Name & Category</th>
                  <th className="py-3.5 px-4">Contact Info</th>
                  <th className="py-3.5 px-4">City / Location</th>
                  <th className="py-3.5 px-4 text-right">Cash Contribution</th>
                  <th className="py-3.5 px-4 text-center">In-Kind Items</th>
                  <th className="py-3.5 px-4 text-center">Comments & Notes</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredDonors.map((donor) => (
                  <tr key={donor.id} className="hover:bg-gray-50/80 transition-colors">
                    {/* Name & Category */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-[#FDF6E3] text-[#145A32] font-bold flex items-center justify-center text-xs shrink-0 border border-[#145A32]/20">
                          {donor.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold text-gray-900 text-sm">{donor.name}</div>
                          <span className="inline-block px-1.5 py-0.5 bg-gray-100 text-gray-600 text-[10px] font-semibold rounded mt-0.5">
                            {donor.category || 'Individual'}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Contact */}
                    <td className="py-3 px-4">
                      <div className="space-y-0.5">
                        {donor.contact ? (
                          <div className="font-medium text-gray-800 flex items-center gap-1">
                            <Phone className="w-3 h-3 text-[#145A32]" /> {donor.contact}
                          </div>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                        {donor.email && (
                          <div className="text-gray-500 text-[11px] flex items-center gap-1">
                            <Mail className="w-3 h-3 text-gray-400" /> {donor.email}
                          </div>
                        )}
                      </div>
                    </td>

                    {/* City / Location */}
                    <td className="py-3 px-4 text-gray-700">
                      {donor.city || donor.address ? (
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                          <span className="truncate max-w-[150px]">
                            {donor.city || donor.address}
                          </span>
                        </div>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>

                    {/* Cash Contribution */}
                    <td className="py-3 px-4 text-right">
                      {donor.total_cash_donated > 0 ? (
                        <div>
                          <span className="font-mono font-bold text-emerald-800 text-sm block">
                            Rs. {donor.total_cash_donated.toLocaleString()}
                          </span>
                          <span className="text-[10px] text-gray-400 block">
                            {donor.donations_count} receipts
                          </span>
                        </div>
                      ) : (
                        <span className="text-gray-400 font-mono">Rs. 0</span>
                      )}
                    </td>

                    {/* In-Kind Items */}
                    <td className="py-3 px-4 text-center">
                      {donor.total_kind_donations > 0 ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-800 text-xs font-semibold rounded-md border border-blue-200">
                          <Package className="w-3 h-3" />
                          {donor.total_kind_donations} items
                        </span>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>

                    {/* Comments Badge */}
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => {
                          setDetailModalDonorId(donor.id);
                          setIsDetailModalOpen(true);
                        }}
                        className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-bold transition-all ${
                          donor.comments_count > 0
                            ? 'bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100'
                            : 'bg-gray-50 text-gray-500 border border-gray-200 hover:bg-gray-100'
                        }`}
                        title="Click to view and add follow-up notes"
                      >
                        <MessageSquare className="w-3.5 h-3.5 text-amber-600" />
                        <span>{donor.comments_count} notes</span>
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {/* Quick Comment Button */}
                        <button
                          onClick={() => {
                            setQuickCommentDonor(donor);
                            setQuickAuthor(localStorage.getItem('last_comment_author') || '');
                            setQuickContent('');
                          }}
                          className="p-1.5 text-gray-600 hover:text-[#145A32] hover:bg-[#FDF6E3] rounded-lg transition-colors"
                          title="Quick Add Comment"
                        >
                          <MessageSquare className="w-4 h-4 text-[#145A32]" />
                        </button>

                        {/* Full Profile View */}
                        <button
                          onClick={() => {
                            setDetailModalDonorId(donor.id);
                            setIsDetailModalOpen(true);
                          }}
                          className="p-1.5 text-gray-600 hover:text-[#145A32] hover:bg-[#FDF6E3] rounded-lg transition-colors"
                          title="View Full Profile & History"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {/* Edit Record */}
                        <button
                          onClick={() => handleOpenForm(donor)}
                          className="p-1.5 text-gray-600 hover:text-[#145A32] hover:bg-[#FDF6E3] rounded-lg transition-colors"
                          title="Edit Donor Profile"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>

                        {/* Delete */}
                        <button
                          onClick={() => handleDeleteDonor(donor)}
                          className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete Donor"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ----------------- MODAL 1: FULL DONOR DETAIL & COMMENTS ----------------- */}
      <DonorDetailModal
        donorId={detailModalDonorId}
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setDetailModalDonorId(null);
        }}
        onCommentsUpdated={loadDonors}
      />

      {/* ----------------- MODAL 2: QUICK COMMENT MODAL ----------------- */}
      {quickCommentDonor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-2xl w-full max-w-lg overflow-hidden animate-fadeIn">
            <div className="bg-[#145A32] text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-[#FDF6E3]" />
                <h3 className="text-base font-bold font-serif">
                  Add Comment for {quickCommentDonor.name}
                </h3>
              </div>
              <button
                onClick={() => setQuickCommentDonor(null)}
                className="text-white/80 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleQuickCommentSubmit} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  Comment Added By (آپ کا نام / عہدہ) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={quickAuthor}
                  onChange={(e) => setQuickAuthor(e.target.value)}
                  placeholder="e.g. Maulana Tariq, Trustee, Office Admin"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#145A32]/20 focus:border-[#145A32]"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  Comment / Follow-up Notes (ریمارکس) <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  value={quickContent}
                  onChange={(e) => setQuickContent(e.target.value)}
                  placeholder="Enter remarks, commitment details, conversation summary..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#145A32]/20 focus:border-[#145A32]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setQuickCommentDonor(null)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingQuickComment}
                  className="px-5 py-2 bg-[#145A32] hover:bg-[#0E4124] text-white font-bold rounded-lg shadow-xs flex items-center gap-1.5 disabled:opacity-50"
                >
                  {submittingQuickComment ? 'Posting...' : 'Save Comment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ----------------- MODAL 3: REGISTER / EDIT DONOR MODAL ----------------- */}
      {isFormModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-2xl w-full max-w-xl overflow-hidden animate-fadeIn">
            <div className="bg-[#145A32] text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-[#FDF6E3]" />
                <h3 className="text-base font-bold font-serif">
                  {editingDonor ? `Edit Donor Profile (${editingDonor.name})` : 'Register New Donor'}
                </h3>
              </div>
              <button
                onClick={() => setIsFormModalOpen(false)}
                className="text-white/80 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="mx-6 mt-4 p-3 bg-red-50 text-red-700 text-xs rounded-lg border border-red-200 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block font-bold text-gray-700 mb-1">
                    Donor Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Seth Muhammad Usman"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#145A32]/20 focus:border-[#145A32]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Contact Phone</label>
                  <input
                    type="text"
                    value={formData.contact}
                    onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                    placeholder="0300-1234567"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#145A32]/20 focus:border-[#145A32]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="donor@example.com"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#145A32]/20 focus:border-[#145A32]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#145A32]/20 focus:border-[#145A32]"
                  >
                    <option value="Individual">Individual (انفرادی)</option>
                    <option value="Corporate">Corporate / Business (کاروباری ادارہ)</option>
                    <option value="Foundation">Foundation / Trust (ٹرسٹ)</option>
                    <option value="Regular">Regular / Monthly Donor (ماہانہ عطیہ دہندہ)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">City</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="Karachi"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#145A32]/20 focus:border-[#145A32]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-gray-700 mb-1">Address</label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Street, area or office address"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#145A32]/20 focus:border-[#145A32]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-gray-700 mb-1">General Notes</label>
                  <textarea
                    rows={2}
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Special instructions or background..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#145A32]/20 focus:border-[#145A32]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setIsFormModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="px-6 py-2 bg-[#145A32] hover:bg-[#0E4124] text-white font-bold rounded-lg shadow-sm flex items-center gap-2 disabled:opacity-50"
                >
                  {formLoading ? 'Saving...' : editingDonor ? 'Update Profile' : 'Register Donor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
