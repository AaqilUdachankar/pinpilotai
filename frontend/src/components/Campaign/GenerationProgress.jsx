import React from 'react';
import {
  Search,
  FileText,
  Lightbulb,
  Image as ImageIcon,
  Sparkles,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const GenerationProgress = ({ campaign }) => {
  const navigate = useNavigate();

  const steps = [
    { id: 'analyzing', name: 'Analyzing affiliate URL', icon: Search },
    { id: 'extracting', name: 'Extracting product information', icon: FileText },
    { id: 'concepts', name: 'Generating 10 image concepts', icon: Lightbulb },
    { id: 'generating_images', name: 'Generating Pinterest images (1000×1500)', icon: ImageIcon },
    { id: 'generating_content', name: 'Creating SEO titles & descriptions', icon: Sparkles },
    { id: 'scheduling_pins', name: 'Preparing 24/7 publishing schedule', icon: Calendar },
    { id: 'ready', name: 'Campaign ready & scheduled', icon: CheckCircle2 },
  ];

  const currentStep = campaign?.generationProgress?.step || 'analyzing';
  const percentage = campaign?.generationProgress?.percentage || 20;
  const message = campaign?.generationProgress?.message || 'Processing campaign...';
  const isFailed = campaign?.campaignStatus === 'failed';
  const isReady = campaign?.campaignStatus === 'active' || campaign?.campaignStatus === 'completed' || currentStep === 'ready';

  const getStepStatus = (index) => {
    if (isFailed) return 'failed';
    if (isReady) return 'completed';

    // Map step key to index
    const stepOrder = ['analyzing', 'extracting', 'concepts', 'generating_images', 'generating_content', 'scheduling_pins', 'ready'];
    const currentIndex = stepOrder.indexOf(currentStep);

    if (index < currentIndex) return 'completed';
    if (index === currentIndex) return 'in_progress';
    return 'pending';
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl p-6 sm:p-8 max-w-3xl mx-auto">
      <div className="text-center mb-8">
        <div className="inline-flex p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 mb-3">
          <Sparkles className="w-8 h-8 animate-pulse" />
        </div>
        <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
          {isReady ? 'Campaign Successfully Created!' : 'Generating Autonomous Pinterest Campaign'}
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
          {message}
        </p>

        {/* Live Progress Bar */}
        <div className="mt-6 max-w-lg mx-auto">
          <div className="flex justify-between text-xs font-bold text-slate-500 mb-1.5">
            <span>Progress</span>
            <span>{percentage}%</span>
          </div>
          <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden p-0.5">
            <div
              className={`h-full rounded-full transition-all duration-700 ease-out ${
                isFailed ? 'bg-rose-500' : isReady ? 'bg-emerald-500' : 'bg-gradient-to-r from-rose-500 to-indigo-500 animate-pulse'
              }`}
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* 7-Step List */}
      <div className="space-y-3 max-w-md mx-auto mb-8">
        {steps.map((step, idx) => {
          const status = getStepStatus(idx);
          const Icon = step.icon;

          let badgeIcon = <div className="w-4 h-4 rounded-full border border-slate-300 dark:border-slate-700" />;
          let textClass = 'text-slate-400 dark:text-slate-500';

          if (status === 'completed') {
            badgeIcon = <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
            textClass = 'text-slate-700 dark:text-slate-200 font-medium';
          } else if (status === 'in_progress') {
            badgeIcon = <Loader2 className="w-5 h-5 text-rose-500 animate-spin" />;
            textClass = 'text-rose-600 dark:text-rose-400 font-bold';
          } else if (status === 'failed') {
            badgeIcon = <AlertCircle className="w-5 h-5 text-rose-500" />;
            textClass = 'text-rose-400';
          }

          return (
            <div
              key={step.id}
              className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                status === 'in_progress'
                  ? 'bg-rose-50/50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/60'
                  : 'border-slate-100 dark:border-slate-800/80 bg-slate-50/30 dark:bg-slate-800/30'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${status === 'in_progress' ? 'text-rose-500' : 'text-slate-400'}`} />
                <span className={`text-xs sm:text-sm ${textClass}`}>
                  {step.name}
                </span>
              </div>
              <div>{badgeIcon}</div>
            </div>
          );
        })}
      </div>

      {/* When Ready: CTA */}
      {isReady && (
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={() => navigate('/pins?campaignId=' + campaign._id)}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm shadow-lg shadow-rose-500/25 transition active:scale-95"
          >
            <span>View 10 Generated Pins</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => navigate('/calendar')}
            className="w-full sm:w-auto px-5 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold text-sm transition"
          >
            Check Publishing Calendar
          </button>
        </div>
      )}
    </div>
  );
};
