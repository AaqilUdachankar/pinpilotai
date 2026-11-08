import React, { useState } from 'react';
import {
  ExternalLink,
  Edit2,
  RefreshCw,
  Sparkles,
  Send,
  Calendar,
  Trash2,
  Clock,
  MoreVertical,
  CheckCircle,
  AlertTriangle,
  Layers,
  ClipboardCheck
} from 'lucide-react';
import { StatusBadge } from '../Common/Badge';

export const PinCard = ({
  pin,
  onEdit,
  onRegenerateImage,
  onRegenerateContent,
  onPublishNow,
  onReschedule,
  onDelete,
  onViewChecklist,
}) => {
  const [showMenu, setShowMenu] = useState(false);

  const formattedDate = pin.scheduledAt
    ? new Date(pin.scheduledAt).toLocaleString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : 'Not scheduled';

  const checklistPassed = pin.publishChecklist?.status === 'passed';

  return (
    <div className="group relative bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden">
      {/* 2:3 Pinterest Aspect Ratio Image Container */}
      <div className="relative aspect-[2/3] w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
        <img
          src={pin.imageUrl}
          alt={pin.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Concept Badge Overlay */}
        <div className="absolute top-3 left-3 z-10 flex flex-col gap-1">
          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-black/75 backdrop-blur-md text-white border border-white/20 shadow-sm">
            #{pin.conceptIndex || 1} {pin.creativeConcept?.name || 'Showcase'}
          </span>
        </div>

        {/* Status Badge Overlay */}
        <div className="absolute top-3 right-3 z-10 flex flex-col gap-1 items-end">
          <StatusBadge status={pin.publishingStatus} />
          {checklistPassed && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 backdrop-blur-md flex items-center gap-1">
              ✓ Verified
            </span>
          )}
        </div>

        {/* Quick Action Overlay on Hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-end p-4">
          <div className="flex items-center gap-2 mb-2">
            {pin.publishingStatus !== 'published' && (
              <button
                onClick={() => onPublishNow(pin)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-lg transition active:scale-95"
              >
                <Send className="w-3.5 h-3.5" /> Publish Now
              </button>
            )}
            <button
              onClick={() => onViewChecklist(pin)}
              className="p-2 rounded-xl bg-white/20 hover:bg-white/30 text-white backdrop-blur-md transition"
              title="Post-Publish Checklist"
            >
              <ClipboardCheck className="w-4 h-4 text-emerald-400" />
            </button>
            <button
              onClick={() => onEdit(pin)}
              className="p-2 rounded-xl bg-white/20 hover:bg-white/30 text-white backdrop-blur-md transition"
              title="Edit Pin Details"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => onReschedule(pin)}
              className="p-2 rounded-xl bg-white/20 hover:bg-white/30 text-white backdrop-blur-md transition"
              title="Reschedule"
            >
              <Calendar className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <h4 className="font-bold text-sm text-slate-900 dark:text-white line-clamp-2 leading-snug mb-1.5" title={pin.title}>
            {pin.title}
          </h4>

          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed mb-3">
            {pin.description}
          </p>

          {/* Destination Affiliate URL Badge */}
          <div className="mb-3 p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
            <span className="text-[11px] font-semibold text-slate-400 truncate max-w-[160px]">
              {pin.affiliateUrl}
            </span>
            <a
              href={pin.affiliateUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-bold text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1 shrink-0"
              title="Test destination affiliate redirect"
            >
              Visit <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          {/* Mobile Touch Action Row (Ensures mobile screens have full touch actions) */}
          <div className="flex sm:hidden items-center justify-between gap-1.5 mb-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            {pin.publishingStatus !== 'published' && (
              <button
                type="button"
                onClick={() => onPublishNow(pin)}
                className="flex-1 flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg bg-rose-600 active:bg-rose-700 text-white text-[11px] font-bold shadow-sm"
              >
                <Send className="w-3 h-3" /> Publish
              </button>
            )}
            <button
              type="button"
              onClick={() => onViewChecklist(pin)}
              className="flex items-center gap-1 py-1.5 px-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 text-[11px] font-bold"
              title="Audit Checklist"
            >
              <ClipboardCheck className="w-3 h-3" /> Checklist
            </button>
            <button
              type="button"
              onClick={() => onEdit(pin)}
              className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
              title="Edit Pin"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => onReschedule(pin)}
              className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
              title="Reschedule"
            >
              <Calendar className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Footer: Scheduled Time, Checklist & More Actions */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-medium text-[11px]">{formattedDate}</span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => onViewChecklist(pin)}
              className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-emerald-500 transition"
              title="View Publish Checklist"
            >
              <ClipboardCheck className="w-3.5 h-3.5" />
            </button>

            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition"
              >
                <MoreVertical className="w-4 h-4" />
              </button>

              {showMenu && (
                <>
                  <div
                    className="fixed inset-0 z-20"
                    onClick={() => setShowMenu(false)}
                  />
                  <div className="absolute right-0 bottom-full mb-1 z-30 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 py-1 text-xs">
                    <button
                      onClick={() => {
                        setShowMenu(false);
                        onViewChecklist(pin);
                      }}
                      className="w-full px-3 py-2 text-left hover:bg-slate-50 dark:hover:bg-slate-700/60 flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-semibold"
                    >
                      <ClipboardCheck className="w-3.5 h-3.5" /> Verification Checklist
                    </button>
                    <button
                      onClick={() => {
                        setShowMenu(false);
                        onEdit(pin);
                      }}
                      className="w-full px-3 py-2 text-left hover:bg-slate-50 dark:hover:bg-slate-700/60 flex items-center gap-2 text-slate-700 dark:text-slate-200"
                    >
                      <Edit2 className="w-3.5 h-3.5 text-slate-400" /> Edit Content
                    </button>
                    <button
                      onClick={() => {
                        setShowMenu(false);
                        onRegenerateImage(pin);
                      }}
                      className="w-full px-3 py-2 text-left hover:bg-slate-50 dark:hover:bg-slate-700/60 flex items-center gap-2 text-slate-700 dark:text-slate-200"
                    >
                      <RefreshCw className="w-3.5 h-3.5 text-indigo-500" /> Regenerate Image
                    </button>
                    <button
                      onClick={() => {
                        setShowMenu(false);
                        onRegenerateContent(pin);
                      }}
                      className="w-full px-3 py-2 text-left hover:bg-slate-50 dark:hover:bg-slate-700/60 flex items-center gap-2 text-slate-700 dark:text-slate-200"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Regenerate SEO
                    </button>
                    <button
                      onClick={() => {
                        setShowMenu(false);
                        onReschedule(pin);
                      }}
                      className="w-full px-3 py-2 text-left hover:bg-slate-50 dark:hover:bg-slate-700/60 flex items-center gap-2 text-slate-700 dark:text-slate-200"
                    >
                      <Calendar className="w-3.5 h-3.5 text-blue-500" /> Reschedule Time
                    </button>
                    {pin.publishingStatus !== 'published' && (
                      <button
                        onClick={() => {
                          setShowMenu(false);
                          onPublishNow(pin);
                        }}
                        className="w-full px-3 py-2 text-left hover:bg-slate-50 dark:hover:bg-slate-700/60 flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-semibold"
                      >
                        <Send className="w-3.5 h-3.5" /> Publish to Pinterest
                      </button>
                    )}
                    <div className="border-t border-slate-100 dark:border-slate-700 my-1" />
                    <button
                      onClick={() => {
                        setShowMenu(false);
                        onDelete(pin);
                      }}
                      className="w-full px-3 py-2 text-left hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-2 text-rose-600 dark:text-rose-400 font-medium"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Delete Pin
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
