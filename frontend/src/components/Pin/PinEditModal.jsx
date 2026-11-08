import React, { useState } from 'react';
import { Modal } from '../Common/Modal';
import { Save, AlertCircle, Sparkles } from 'lucide-react';

export const PinEditModal = ({ isOpen, onClose, pin, onSave }) => {
  if (!pin) return null;

  const [title, setTitle] = useState(pin.title || '');
  const [description, setDescription] = useState(pin.description || '');
  const [callToAction, setCallToAction] = useState(pin.callToAction || 'Visit Site');
  const [affiliateUrl, setAffiliateUrl] = useState(pin.affiliateUrl || '');
  const [keywords, setKeywords] = useState(pin.keywords?.join(', ') || '');
  const [hashtags, setHashtags] = useState(pin.hashtags?.join(', ') || '');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave(pin._id, {
        title,
        description,
        callToAction,
        affiliateUrl,
        keywords: keywords.split(',').map((k) => k.trim()).filter(Boolean),
        hashtags: hashtags.split(',').map((h) => h.trim()).filter(Boolean),
      });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="AI Content Editor – Modify Pin Details" maxWidth="max-w-3xl">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Pin Title (Pinterest max 100 chars)
            </label>
            <span className={`text-[11px] font-semibold ${title.length > 90 ? 'text-amber-500' : 'text-slate-400'}`}>
              {title.length}/100
            </span>
          </div>
          <input
            type="text"
            value={title}
            maxLength={100}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-rose-500 focus:outline-none"
          />
        </div>

        {/* Description */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              SEO Pin Description (Pinterest max 800 chars)
            </label>
            <span className={`text-[11px] font-semibold ${description.length > 750 ? 'text-amber-500' : 'text-slate-400'}`}>
              {description.length}/800
            </span>
          </div>
          <textarea
            rows={4}
            value={description}
            maxLength={800}
            onChange={(e) => setDescription(e.target.value)}
            required
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-rose-500 focus:outline-none"
          />
          <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
            <AlertCircle className="w-3 h-3 text-amber-500 shrink-0" />
            Make sure to maintain proper affiliate disclosure for FTC compliance.
          </p>
        </div>

        {/* Affiliate Destination Link */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
            Destination Affiliate URL (Official Link Attached to Pin)
          </label>
          <input
            type="url"
            value={affiliateUrl}
            onChange={(e) => setAffiliateUrl(e.target.value)}
            required
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-rose-500 focus:outline-none"
          />
        </div>

        {/* Two Columns: CTA & Keywords */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              Call to Action
            </label>
            <input
              type="text"
              value={callToAction}
              onChange={(e) => setCallToAction(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-rose-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              Keywords (comma-separated)
            </label>
            <input
              type="text"
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-rose-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Hashtags */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
            Hashtags (comma-separated, e.g. #HomeDecor, #AffiliatePick)
          </label>
          <input
            type="text"
            value={hashtags}
            onChange={(e) => setHashtags(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-rose-500 focus:outline-none"
          />
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-sm font-medium transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold shadow-md shadow-rose-500/20 disabled:opacity-50 transition active:scale-95"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving Changes...' : 'Save Pin Details'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
