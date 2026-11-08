import React, { useState } from 'react';
import { Modal } from '../Common/Modal';
import { Calendar, Clock } from 'lucide-react';

export const RescheduleModal = ({ isOpen, onClose, pin, onReschedule }) => {
  if (!pin) return null;

  const currentScheduled = pin.scheduledAt
    ? new Date(pin.scheduledAt).toISOString().slice(0, 16)
    : new Date().toISOString().slice(0, 16);

  const [scheduledAt, setScheduledAt] = useState(currentScheduled);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onReschedule(pin._id, new Date(scheduledAt).toISOString());
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Reschedule Publishing Time" maxWidth="max-w-md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
            Change the time when this pin will be automatically published to Pinterest by the cloud background worker.
          </p>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
            Select New Publishing Date & Time
          </label>
          <input
            type="datetime-local"
            value={scheduledAt}
            onChange={(e) => setScheduledAt(e.target.value)}
            required
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-rose-500 focus:outline-none"
          />
        </div>

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
            disabled={submitting}
            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow-md shadow-blue-500/20 disabled:opacity-50 transition active:scale-95"
          >
            <Clock className="w-4 h-4" />
            {submitting ? 'Updating...' : 'Update Schedule'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
