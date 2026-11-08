import React, { useState, useEffect } from 'react';
import {
  Settings as SettingsIcon,
  Key,
  Shield,
  Save,
  CheckCircle2,
  AlertCircle,
  Clock,
  Activity,
  Cpu,
  Sparkles,
  Cloud
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Common/Toast';
import { schedulerAPI } from '../services/api';

export const Settings = () => {
  const { user, updateUserSettings } = useAuth();
  const { addToast } = useToast();

  // Settings State
  const [enableDisclosure, setEnableDisclosure] = useState(
    user?.settings?.enableAffiliateDisclosure ?? false
  );
  const [disclosure, setDisclosure] = useState(
    user?.settings?.defaultAffiliateDisclosure ||
      'Affiliate link – I may earn a commission from qualifying purchases at no extra cost to you.'
  );
  const [callToAction, setCallToAction] = useState(user?.settings?.defaultCallToAction || 'Visit Site');
  const [publishingInterval, setPublishingInterval] = useState(user?.settings?.defaultPublishingInterval || 60);
  const [timezone, setTimezone] = useState(user?.settings?.timezone || 'UTC');

  // Custom API Keys State
  const [pinterestClientId, setPinterestClientId] = useState('');
  const [pinterestClientSecret, setPinterestClientSecret] = useState('');
  const [cloudinaryCloudName, setCloudinaryCloudName] = useState('');
  const [cloudinaryApiKey, setCloudinaryApiKey] = useState('');
  const [cloudinaryApiSecret, setCloudinaryApiSecret] = useState('');
  const [geminiApiKey, setGeminiApiKey] = useState('');
  const [openaiApiKey, setOpenAIKey] = useState('');

  const [saving, setSaving] = useState(false);
  const [schedulerHealth, setSchedulerHealth] = useState(null);

  useEffect(() => {
    const fetchHealth = async () => {
      try {
        const res = await schedulerAPI.getHealth();
        if (res.data?.success) {
          setSchedulerHealth(res.data);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchHealth();
  }, []);

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        settings: {
          enableAffiliateDisclosure: enableDisclosure,
          defaultAffiliateDisclosure: disclosure,
          defaultCallToAction: callToAction,
          defaultPublishingInterval: Number(publishingInterval),
          timezone,
        },
        apiKeys: {
          ...(pinterestClientId ? { pinterestClientId } : {}),
          ...(pinterestClientSecret ? { pinterestClientSecret } : {}),
          ...(cloudinaryCloudName ? { cloudinaryCloudName } : {}),
          ...(cloudinaryApiKey ? { cloudinaryApiKey } : {}),
          ...(cloudinaryApiSecret ? { cloudinaryApiSecret } : {}),
          ...(geminiApiKey ? { geminiApiKey } : {}),
          ...(openaiApiKey ? { openaiApiKey } : {}),
        },
      };

      await updateUserSettings(payload);
      addToast('Settings updated successfully!', 'success');
    } catch (err) {
      addToast('Failed to save settings.', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
          Platform Settings & API Configurations
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Configure affiliate disclosures, Pinterest App credentials, Cloudinary permanent storage, and background automation preferences.
        </p>
      </div>

      {/* 24/7 Scheduler Status Card */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600">
            <Cpu className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
                Background Automation Engine: {schedulerHealth?.engine || 'Persistent Agenda Worker'}
              </h4>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400">
                Online 24/7
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Scheduled tasks persist in MongoDB and automatically execute hourly even when your browser is closed.
            </p>
          </div>
        </div>

        <div className="text-xs text-slate-500 dark:text-slate-400 shrink-0">
          Server Time: <span className="font-mono font-bold text-slate-700 dark:text-slate-200">{new Date().toUTCString()}</span>
        </div>
      </div>

      <form onSubmit={handleSaveSettings} className="space-y-6">
        {/* Affiliate Disclosure & Defaults */}
        <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <Shield className="w-5 h-5 text-rose-500" /> Affiliate Compliance & Defaults
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Affiliate disclosure is <b>optional</b>. Use the compulsory button to toggle whether disclosure text is automatically appended to pin descriptions.
              </p>
            </div>

            {/* Compulsory Toggle Switch */}
            <div className="flex items-center gap-3 shrink-0">
              <div className="text-right">
                <div className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">
                  Compulsory Disclosure
                </div>
                <div className={`text-[10px] font-bold ${enableDisclosure ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}>
                  {enableDisclosure ? 'ON (Compulsory: Posting text)' : 'OFF (Optional: No text)'}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEnableDisclosure(!enableDisclosure)}
                className={`relative inline-flex h-7 w-14 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-rose-500/20 ${
                  enableDisclosure ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-slate-700'
                }`}
                role="switch"
                aria-checked={enableDisclosure}
              >
                <span
                  className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                    enableDisclosure ? 'translate-x-7' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Affiliate Disclosure Text {enableDisclosure ? '(Compulsory Mode Active)' : '(Optional Mode – Omitted)'}
              </label>
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                enableDisclosure
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700'
              }`}>
                {enableDisclosure ? '✓ Will Post to Every Pin' : '✕ Will NOT Post to Pins'}
              </span>
            </div>
            <input
              type="text"
              value={disclosure}
              disabled={!enableDisclosure}
              onChange={(e) => setDisclosure(e.target.value)}
              className={`w-full px-3.5 py-2.5 rounded-xl border text-sm transition focus:ring-2 focus:ring-rose-500 focus:outline-none ${
                enableDisclosure
                  ? 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white'
                  : 'border-slate-200/60 dark:border-slate-800 bg-slate-100/60 dark:bg-slate-800/40 text-slate-400 cursor-not-allowed'
              }`}
              placeholder="e.g. Affiliate link – I may earn a commission from qualifying purchases."
            />
            <p className="text-[11px] text-slate-400 mt-1">
              {enableDisclosure
                ? '✓ Compulsory button is ON: this exact text will be automatically appended to every generated pin description.'
                : '✕ Compulsory button is OFF: disclosure text will NOT be posted to pins.'}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Default Call to Action
              </label>
              <input
                type="text"
                value={callToAction}
                onChange={(e) => setCallToAction(e.target.value)}
                placeholder="Visit Site"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-rose-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Default Interval (minutes)
              </label>
              <input
                type="number"
                value={publishingInterval}
                onChange={(e) => setPublishingInterval(e.target.value)}
                min={15}
                max={1440}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-rose-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Pinterest Developer App Keys */}
        <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
            <Key className="w-5 h-5 text-rose-500" /> Pinterest Developer App Credentials
          </h3>
          <p className="text-xs text-slate-400">
            Obtained from <a href="https://developers.pinterest.com/apps/" target="_blank" rel="noreferrer" className="text-rose-600 hover:underline">developers.pinterest.com/apps</a>.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Pinterest App Client ID
              </label>
              <input
                type="text"
                value={pinterestClientId}
                onChange={(e) => setPinterestClientId(e.target.value)}
                placeholder="e.g. 1509823487..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-rose-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Pinterest Client Secret
              </label>
              <input
                type="password"
                value={pinterestClientSecret}
                onChange={(e) => setPinterestClientSecret(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-rose-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Cloudinary Permanent Storage */}
        <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
            <Cloud className="w-5 h-5 text-blue-500" /> Cloudinary Storage (Stores 1000×1500 Images)
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Cloud Name
              </label>
              <input
                type="text"
                value={cloudinaryCloudName}
                onChange={(e) => setCloudinaryCloudName(e.target.value)}
                placeholder="my-cloud-name"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-rose-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                API Key
              </label>
              <input
                type="text"
                value={cloudinaryApiKey}
                onChange={(e) => setCloudinaryApiKey(e.target.value)}
                placeholder="API Key"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-rose-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                API Secret
              </label>
              <input
                type="password"
                value={cloudinaryApiSecret}
                onChange={(e) => setCloudinaryApiSecret(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-rose-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* AI Model API Keys */}
        <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" /> AI Provider API Keys (Optional)
          </h3>
          <p className="text-xs text-slate-400">
            PinPilot AI automatically uses its built-in engine if external keys are not provided.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Google Gemini API Key
              </label>
              <input
                type="password"
                value={geminiApiKey}
                onChange={(e) => setGeminiApiKey(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-rose-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                OpenAI API Key
              </label>
              <input
                type="password"
                value={openaiApiKey}
                onChange={(e) => setOpenAIKey(e.target.value)}
                placeholder="sk-..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-rose-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-sm shadow-xl shadow-rose-500/25 transition active:scale-95 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save Settings'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
