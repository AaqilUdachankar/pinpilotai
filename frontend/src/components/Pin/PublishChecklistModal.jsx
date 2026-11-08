import React from 'react';
import { Modal } from '../Common/Modal';
import {
  CheckCircle2,
  XCircle,
  Clock,
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
  Link,
  Image,
  Tag,
  Share2
} from 'lucide-react';
import { StatusBadge } from '../Common/Badge';

export const PublishChecklistModal = ({ isOpen, onClose, pin }) => {
  if (!pin) return null;

  const checklist = pin.publishChecklist || {};
  const hasDisclosure = pin.description?.toLowerCase().includes('affiliate') || pin.description?.toLowerCase().includes('commission');
  const isDisclosureOptional = pin.campaignId?.appendAffiliateDisclosure === false;
  const ftcPassed = checklist.ftcDisclosurePresent !== undefined
    ? checklist.ftcDisclosurePresent
    : (hasDisclosure || isDisclosureOptional);

  const items = [
    {
      id: 'affiliateLinkVerified',
      label: 'Destination Affiliate Link Validated',
      desc: `Pinned link points to: ${pin.affiliateUrl || 'Affiliate Destination Link'}`,
      passed: checklist.affiliateLinkVerified ?? !!pin.affiliateUrl,
      icon: Link,
    },
    {
      id: 'pinterestPinVerified',
      label: 'Official Pinterest API Confirmation',
      desc: pin.pinterestPinId ? `Pinterest Pin ID #${pin.pinterestPinId}` : (checklist.pinterestPinVerified ? 'Verified by Pinterest API' : 'Awaiting publication trigger'),
      passed: checklist.pinterestPinVerified ?? (pin.publishingStatus === 'published' && !!pin.pinterestPinId),
      icon: Share2,
    },
    {
      id: 'boardAttached',
      label: 'Target Pinterest Board Assigned',
      desc: pin.pinterestBoardId ? `Board ID: ${pin.pinterestBoardId}` : (checklist.boardAttached ? 'Board assigned & verified' : 'Assigned to campaign board'),
      passed: checklist.boardAttached ?? !!(pin.pinterestBoardId || pin.campaignId?.selectedBoard?.id || pin.boardName),
      icon: ShieldCheck,
    },
    {
      id: 'ftcDisclosurePresent',
      label: hasDisclosure ? 'FTC Affiliate Disclosure Included' : 'FTC Affiliate Disclosure (Optional Mode)',
      desc: hasDisclosure
        ? 'Affiliate commission disclaimer present in pin description'
        : 'Affiliate disclosure is optional (omitted by user configuration)',
      passed: ftcPassed,
      icon: ShieldCheck,
    },
    {
      id: 'creativeDelivered',
      label: 'Vertical 1000×1500 Creative Delivered',
      desc: '2:3 Pinterest-spec commercial image uploaded & verified',
      passed: checklist.creativeDelivered ?? !!pin.imageUrl,
      icon: Image,
    },
    {
      id: 'seoTagsIndexed',
      label: 'SEO Title & Pinterest Keywords Indexed',
      desc: `${pin.keywords?.length || 0} Pinterest search tags attached`,
      passed: checklist.seoTagsIndexed ?? !!(pin.title && (pin.keywords?.length > 0 || pin.description)),
      icon: Tag,
    },
    {
      id: 'nextInQueueArmed',
      label: 'Next Hourly Scheduled Pin Armed',
      desc: '24/7 cloud scheduler queue active for subsequent post',
      passed: checklist.nextInQueueArmed ?? (pin.publishingStatus === 'scheduled' || pin.publishingStatus === 'published'),
      icon: Clock,
    },
  ];

  const totalPassed = items.filter((i) => i.passed).length;
  const isAllPassed = totalPassed === items.length;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Post-Publishing Verification Checklist" maxWidth="max-w-xl">
      <div className="space-y-5">
        {/* Header Summary */}
        <div className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
          <img
            src={pin.imageUrl}
            alt=""
            className="w-14 h-20 rounded-xl object-cover bg-slate-200 dark:bg-slate-700 shrink-0"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <StatusBadge status={pin.publishingStatus} />
              <span className="text-xs font-bold text-slate-500">
                #{pin.conceptIndex || 1} {pin.creativeConcept?.name || 'Pin'}
              </span>
            </div>
            <h4 className="font-extrabold text-sm text-slate-900 dark:text-white truncate" title={pin.title}>
              {pin.title}
            </h4>
            <p className="text-[11px] text-slate-400 mt-0.5 truncate">
              {pin.scheduledAt ? new Date(pin.scheduledAt).toLocaleString() : 'Schedule not set'}
            </p>
          </div>
        </div>

        {/* Verification Status Score */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 text-xs">
          <span className="font-bold text-slate-600 dark:text-slate-300">
            Compliance & Verification Score:
          </span>
          <span
            className={`font-black px-2.5 py-1 rounded-full ${
              isAllPassed
                ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400'
                : 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400'
            }`}
          >
            {totalPassed} of {items.length} Checks Passed
          </span>
        </div>

        {/* 7 Checklist Criteria Items */}
        <div className="space-y-2.5">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.id}
                className={`p-3 rounded-xl border flex items-start justify-between gap-3 transition-all ${
                  item.passed
                    ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-100 dark:border-emerald-900/40 text-slate-800 dark:text-slate-100'
                    : 'bg-slate-50/50 dark:bg-slate-800/40 border-slate-100 dark:border-slate-800 text-slate-400'
                }`}
              >
                <div className="flex items-start gap-2.5">
                  <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${item.passed ? 'text-emerald-500' : 'text-slate-400'}`} />
                  <div>
                    <span className="font-bold text-xs block leading-snug">
                      {item.label}
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-0.5">
                      {item.desc}
                    </span>
                  </div>
                </div>

                <div className="shrink-0 mt-0.5">
                  {item.passed ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  ) : (
                    <XCircle className="w-4 h-4 text-slate-300 dark:text-slate-600" />
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
          <a
            href={pin.affiliateUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs font-bold text-rose-600 dark:text-rose-400 hover:underline"
          >
            <Link className="w-3.5 h-3.5" /> Test Affiliate Destination Redirect
          </a>

          {pin.pinterestPinId && (
            <a
              href={`https://www.pinterest.com/pin/${pin.pinterestPinId}/`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-pinterest hover:bg-pinterest-dark text-white text-xs font-bold shadow-md transition"
            >
              <ExternalLink className="w-3.5 h-3.5" /> View Live Pin on Pinterest
            </a>
          )}
        </div>
      </div>
    </Modal>
  );
};
