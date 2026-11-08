import React from 'react';

export const StatusBadge = ({ status }) => {
  const configs = {
    published: {
      label: 'Published',
      classes: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800/60',
      dot: 'bg-emerald-500',
    },
    scheduled: {
      label: 'Scheduled',
      classes: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800/60',
      dot: 'bg-blue-500',
    },
    publishing: {
      label: 'Publishing...',
      classes: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800/60 animate-pulse',
      dot: 'bg-amber-500',
    },
    paused: {
      label: 'Paused',
      classes: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
      dot: 'bg-slate-400',
    },
    failed: {
      label: 'Failed',
      classes: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800/60',
      dot: 'bg-rose-500',
    },
    draft: {
      label: 'Draft',
      classes: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-400 dark:border-purple-800/60',
      dot: 'bg-purple-500',
    },
    active: {
      label: 'Active',
      classes: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800/60',
      dot: 'bg-emerald-500',
    },
    generating: {
      label: 'Generating...',
      classes: 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-400 dark:border-indigo-800/60 animate-pulse',
      dot: 'bg-indigo-500',
    },
    completed: {
      label: 'Completed',
      classes: 'bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950/40 dark:text-teal-400 dark:border-teal-800/60',
      dot: 'bg-teal-500',
    },
  };

  const config = configs[status] || {
    label: status,
    classes: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300',
    dot: 'bg-slate-400',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${config.classes}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  );
};
