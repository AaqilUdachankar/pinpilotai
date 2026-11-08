import React, { useState } from 'react';
import { Modal } from './Modal';
import { FileSpreadsheet, Download, ExternalLink, Check, Copy } from 'lucide-react';
import { pinAPI } from '../../services/api';
import { useToast } from './Toast';

export const ExportModal = ({ isOpen, onClose, campaignId = null, campaignName = '' }) => {
  const { addToast } = useToast();
  const [downloading, setDownloading] = useState(false);

  const handleDownloadExcel = async () => {
    setDownloading(true);
    try {
      const response = await pinAPI.exportCSV(campaignId);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      const dateStr = new Date().toISOString().slice(0, 10);
      link.setAttribute('download', `pinpilot-schedule-export-${dateStr}.csv`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);

      addToast('CSV spreadsheet downloaded! Opens in Excel or Google Sheets.', 'success');
      onClose();
    } catch (err) {
      addToast('Failed to export spreadsheet.', 'error');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Export Publishing Schedule & Performance" maxWidth="max-w-lg">
      <div className="space-y-5">
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/60 text-emerald-950 dark:text-emerald-200">
          <FileSpreadsheet className="w-8 h-8 text-emerald-600 shrink-0" />
          <div className="text-xs leading-relaxed">
            <span className="font-bold text-sm block mb-0.5">
              Microsoft Excel & Google Sheets Compatible (.CSV)
            </span>
            Exports complete audit log of all scheduled times, published dates, Pinterest Pin IDs, destination affiliate links, and impressions.
          </div>
        </div>

        {/* What is Included */}
        <div className="text-xs text-slate-600 dark:text-slate-300 space-y-2 bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
          <div className="font-bold text-slate-800 dark:text-white uppercase tracking-wider text-[11px] mb-1">
            Data Fields Included in Export:
          </div>
          <ul className="grid grid-cols-2 gap-1 text-[11px] text-slate-500 dark:text-slate-400">
            <li>✓ Campaign & Product Name</li>
            <li>✓ Concept # (1–10) & Visual Angle</li>
            <li>✓ Optimized Pin Title & Keywords</li>
            <li>✓ Scheduled Publish Date & Time</li>
            <li>✓ Actual Published Timestamp</li>
            <li>✓ Exact Destination Affiliate URL</li>
            <li>✓ Official Pinterest Pin ID & URL</li>
            <li>✓ Impressions & Outbound Clicks</li>
          </ul>
        </div>

        {/* 1-Click Action Buttons */}
        <div className="space-y-3 pt-2">
          <button
            onClick={handleDownloadExcel}
            disabled={downloading}
            className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm shadow-lg shadow-emerald-600/25 transition active:scale-95 disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>{downloading ? 'Preparing Spreadsheet...' : 'Download Excel / CSV File'}</span>
          </button>

          <a
            href="https://sheets.new"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/60 text-slate-700 dark:text-slate-200 font-bold text-xs transition"
          >
            <ExternalLink className="w-4 h-4 text-emerald-500" />
            <span>Open Google Sheets (sheets.new)</span>
          </a>
        </div>

        <p className="text-[11px] text-slate-400 text-center">
          Tip: To view in Google Sheets, open sheets.new, click <b>File &gt; Import &gt; Upload</b> and choose your downloaded CSV.
        </p>
      </div>
    </Modal>
  );
};
