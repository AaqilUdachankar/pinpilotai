import React, { useEffect, useState } from 'react';
import { Sparkles, Cpu, AlertTriangle, CheckCircle2, Shield } from 'lucide-react';
import { authAPI } from '../../services/api';

export const ApiUsageBar = ({ compact = false }) => {
  const [usage, setUsage] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUsage = async () => {
    try {
      const res = await authAPI.getApiUsage();
      if (res.data?.success) {
        setUsage(res.data);
      }
    } catch (err) {
      console.error('Error fetching API usage:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsage();
  }, []);

  if (loading || !usage) return null;

  const gemini = usage.gemini || { percentage: 0, requestsCount: 0, limitRequests: 1500 };
  const openai = usage.openai || { percentage: 0, requestsCount: 0, limitRequests: 1000 };

  const getProgressColor = (pct) => {
    if (pct >= 90) return 'bg-rose-500';
    if (pct >= 70) return 'bg-amber-500';
    return 'bg-emerald-500';
  };

  if (compact) {
    return (
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 bg-slate-50 dark:bg-slate-800/60 p-2.5 sm:p-3 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 text-xs">
        <div className="flex items-center gap-1.5 shrink-0 font-bold text-slate-700 dark:text-slate-200">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>AI Quota:</span>
        </div>

        <div className="grid grid-cols-1 xs:grid-cols-2 gap-2 sm:gap-4 flex-1 w-full">
          {/* Gemini Bar */}
          <div className="min-w-0">
            <div className="flex justify-between text-[10px] text-slate-500 mb-0.5">
              <span className="truncate">Gemini: {gemini.requestsCount}/{gemini.limitRequests}</span>
              <span className="font-semibold shrink-0 ml-1">{gemini.percentage}%</span>
            </div>
            <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${getProgressColor(gemini.percentage)}`}
                style={{ width: `${gemini.percentage}%` }}
              />
            </div>
          </div>

          {/* OpenAI Bar */}
          <div className="min-w-0">
            <div className="flex justify-between text-[10px] text-slate-500 mb-0.5">
              <span className="truncate">OpenAI: {openai.requestsCount}/{openai.limitRequests}</span>
              <span className="font-semibold shrink-0 ml-1">{openai.percentage}%</span>
            </div>
            <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${getProgressColor(openai.percentage)}`}
                style={{ width: `${openai.percentage}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm p-4 sm:p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Cpu className="w-4 h-4 text-rose-500" />
          <h4 className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider">
            AI Generation API Quota & Usage Limits
          </h4>
        </div>
        <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md flex items-center gap-1">
          <CheckCircle2 className="w-3 h-3" /> Live Capacity Tracking
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Gemini API Progress Card */}
        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
          <div className="flex justify-between items-center mb-1.5">
            <div className="flex items-center gap-1.5 font-bold text-xs text-slate-800 dark:text-slate-100">
              <span>Google Gemini API</span>
              {gemini.hasCustomKey ? (
                <span className="text-[9px] bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 px-1.5 py-0.2 rounded font-mono">Custom Key</span>
              ) : (
                <span className="text-[9px] bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-1.5 py-0.2 rounded">Managed Tier</span>
              )}
            </div>
            <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
              {gemini.requestsCount} / {gemini.limitRequests} calls
            </span>
          </div>

          <div className="w-full h-2.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden p-0.5 mb-1.5">
            <div
              className={`h-full rounded-full transition-all duration-700 ${getProgressColor(gemini.percentage)}`}
              style={{ width: `${Math.max(gemini.percentage, 2)}%` }}
            />
          </div>

          <div className="flex justify-between text-[11px] text-slate-400">
            <span>{gemini.remaining} requests remaining today</span>
            <span className="font-semibold text-slate-600 dark:text-slate-300">{gemini.percentage}% used</span>
          </div>
        </div>

        {/* OpenAI API Progress Card */}
        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
          <div className="flex justify-between items-center mb-1.5">
            <div className="flex items-center gap-1.5 font-bold text-xs text-slate-800 dark:text-slate-100">
              <span>OpenAI API</span>
              {openai.hasCustomKey ? (
                <span className="text-[9px] bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 px-1.5 py-0.2 rounded font-mono">Custom Key</span>
              ) : (
                <span className="text-[9px] bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-1.5 py-0.2 rounded">Standard Tier</span>
              )}
            </div>
            <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
              {openai.requestsCount} / {openai.limitRequests} calls
            </span>
          </div>

          <div className="w-full h-2.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden p-0.5 mb-1.5">
            <div
              className={`h-full rounded-full transition-all duration-700 ${getProgressColor(openai.percentage)}`}
              style={{ width: `${Math.max(openai.percentage, 2)}%` }}
            />
          </div>

          <div className="flex justify-between text-[11px] text-slate-400">
            <span>{openai.remaining} requests remaining today</span>
            <span className="font-semibold text-slate-600 dark:text-slate-300">{openai.percentage}% used</span>
          </div>
        </div>
      </div>
    </div>
  );
};
