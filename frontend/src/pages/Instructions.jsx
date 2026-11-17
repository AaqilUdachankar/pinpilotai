import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen,
  Sparkles,
  Link2,
  Clock,
  Share2,
  CheckCircle2,
  FileSpreadsheet,
  Cpu,
  ShieldCheck,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  HelpCircle,
  Copy,
  Zap,
  Repeat,
  Eye,
  Check,
  AlertCircle,
  Layers
} from 'lucide-react';
import { useToast } from '../components/Common/Toast';
import { pinAPI } from '../services/api';
import { PublishChecklistModal } from '../components/Pin/PublishChecklistModal';

export const Instructions = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState('workflow');

  // Interactive Checklist Simulator State
  const [simulatorMode, setSimulatorMode] = useState('published'); // 'published', 'scheduled', 'optional_disclosure'
  const [modalPin, setModalPin] = useState(null);
  const [realPins, setRealPins] = useState([]);
  const [selectedRealPinId, setSelectedRealPinId] = useState('');
  const [loadingRealPins, setLoadingRealPins] = useState(false);

  useEffect(() => {
    const fetchRealPins = async () => {
      try {
        setLoadingRealPins(true);
        const res = await pinAPI.getPins({ limit: 10 });
        if (res.data?.success && res.data.pins?.length > 0) {
          setRealPins(res.data.pins);
          setSelectedRealPinId(res.data.pins[0]._id);
        }
      } catch (err) {
        // Pins fetch fallback (silent in guide)
      } finally {
        setLoadingRealPins(false);
      }
    };
    fetchRealPins();
  }, []);

  const copyText = (text) => {
    navigator.clipboard.writeText(text);
    addToast('Copied to clipboard!', 'success');
  };

  // Sample data for interactive checklist simulator
  const samplePins = {
    published: {
      _id: 'demo_published_pin',
      title: 'The Ultimate TechPro Wireless Gaming Mouse Review & Setup',
      conceptIndex: 1,
      creativeConcept: { name: 'Product Showcase' },
      imageUrl: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=600&auto=format&fit=crop&q=80',
      affiliateUrl: 'https://amazon.com/dp/B08N5WRWNW?tag=pinpilot-demo-20',
      pinterestPinId: '109876543210987654',
      pinterestBoardId: '987654321012345678',
      publishingStatus: 'published',
      scheduledAt: new Date(Date.now() - 3600000).toISOString(),
      publishedAt: new Date().toISOString(),
      description: 'Looking for a precision ergonomic gaming mouse? Discover ultra-low latency, 4000 DPI tracking, and silent clicks. Affiliate link – I may earn a commission from qualifying purchases.',
      keywords: ['gaming mouse', 'wireless setup', 'desk accessories', 'pc gamer', 'tech finds'],
      publishChecklist: {
        affiliateLinkVerified: true,
        pinterestPinVerified: true,
        boardAttached: true,
        ftcDisclosurePresent: true,
        creativeDelivered: true,
        seoTagsIndexed: true,
        nextInQueueArmed: true,
        status: 'passed',
        notes: 'Pin ID #109876543210987654 verified live on Pinterest board. Destination confirmed.'
      },
    },
    scheduled: {
      _id: 'demo_scheduled_pin',
      title: 'Top 5 Standout Features of the Ergonomic Wireless Mouse',
      conceptIndex: 2,
      creativeConcept: { name: 'Top Features' },
      imageUrl: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=600&auto=format&fit=crop&q=80',
      affiliateUrl: 'https://amazon.com/dp/B08N5WRWNW?tag=pinpilot-demo-20',
      pinterestPinId: null,
      pinterestBoardId: '987654321012345678',
      publishingStatus: 'scheduled',
      scheduledAt: new Date(Date.now() + 3600000).toISOString(),
      publishedAt: null,
      description: 'A detailed look at the core specs and capabilities of this mouse. Affiliate link – I may earn a commission from qualifying purchases.',
      keywords: ['work from home', 'ergonomic setup', 'tech gadgets'],
      publishChecklist: {
        affiliateLinkVerified: true,
        pinterestPinVerified: false,
        boardAttached: true,
        ftcDisclosurePresent: true,
        creativeDelivered: true,
        seoTagsIndexed: true,
        nextInQueueArmed: true,
        status: 'pending',
        notes: 'Queued in 24/7 background scheduler. Arms automatically for hourly publishing.'
      },
    },
    optional_disclosure: {
      _id: 'demo_optional_disclosure_pin',
      title: 'Clean Minimalist Workstation Aesthetic & Wireless Peripherals',
      conceptIndex: 7,
      creativeConcept: { name: 'Minimal Aesthetic' },
      imageUrl: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=600&auto=format&fit=crop&q=80',
      affiliateUrl: 'https://target.com/affiliate-product-link',
      pinterestPinId: '109876543210987655',
      pinterestBoardId: '987654321012345678',
      publishingStatus: 'published',
      scheduledAt: new Date(Date.now() - 7200000).toISOString(),
      publishedAt: new Date().toISOString(),
      description: 'Clean aesthetics meet high utility. Seamlessly fits modern desks and minimalist creative workspaces.',
      keywords: ['minimal desk', 'aesthetic setup', 'workspace design'],
      campaignId: { appendAffiliateDisclosure: false },
      publishChecklist: {
        affiliateLinkVerified: true,
        pinterestPinVerified: true,
        boardAttached: true,
        ftcDisclosurePresent: true, // Passed because optional disclosure mode was selected
        creativeDelivered: true,
        seoTagsIndexed: true,
        nextInQueueArmed: true,
        status: 'passed',
        notes: 'Affiliate disclosure is set to Optional. Verified live on Pinterest with clean description.'
      },
    },
  };

  const currentSamplePin = samplePins[simulatorMode];

  const tabs = [
    { id: 'workflow', label: '1. Complete Workflow', icon: Sparkles },
    { id: 'autochain', label: '2. Auto-Chaining (Consecutive Hourly)', icon: Repeat },
    { id: 'checklist', label: '3. Post-Publish Checklist', icon: CheckCircle2 },
    { id: 'sheets', label: '4. Excel & Google Sheets', icon: FileSpreadsheet },
    { id: 'pinterest', label: '5. Pinterest API v5 Setup', icon: Share2 },
    { id: 'ai', label: '6. AI Keys & Quotas', icon: Cpu },
    { id: 'compliance', label: '7. FTC Affiliate Rules', icon: ShieldCheck },
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Page Header */}
      <div>
        <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
          PinPilot AI User Manual & Workflow Guide
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Everything you need to master 24/7 automated Pinterest affiliate marketing from a single URL to scheduled revenue.
        </p>
      </div>

      {/* Tabs Bar */}
      <div className="flex items-center gap-1.5 p-1.5 bg-slate-100 dark:bg-slate-800 rounded-2xl overflow-x-auto scrollbar-thin">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-white dark:bg-slate-700 text-rose-600 dark:text-rose-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Complete Workflow */}
      {activeTab === 'workflow' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 space-y-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-600">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">
                How PinPilot AI Works (The Complete Automated Pipeline)
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                From a single pasted affiliate link to 10 live pins on Pinterest.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
              <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black text-xs mb-3">
                1
              </div>
              <h4 className="font-bold text-sm text-slate-800 dark:text-slate-100 mb-1">
                Paste Affiliate Product URL
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Paste any link from Amazon Associates, Target, ShareASale, CJ, or custom vendors. Click "Analyze Product" to auto-extract features, pricing, and specs.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
              <div className="w-8 h-8 rounded-xl bg-rose-600 text-white flex items-center justify-center font-black text-xs mb-3">
                2
              </div>
              <h4 className="font-bold text-sm text-slate-800 dark:text-slate-100 mb-1">
                AI Synthesis (10 Unique Concepts)
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                The AI designs 10 visually different 1000×1500 vertical commercial creatives (Showcase, Top Features, Lifestyle, etc.) with SEO titles, hashtags, and FTC disclosures.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
              <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black text-xs mb-3">
                3
              </div>
              <h4 className="font-bold text-sm text-slate-800 dark:text-slate-100 mb-1">
                24/7 Autonomous Publishing
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Pins are queued in the persistent cloud queue to post hourly. You can turn off your PC—the cloud backend continues publishing on schedule!
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
            <button
              onClick={() => navigate('/create-campaign')}
              className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md shadow-rose-500/25 transition"
            >
              <span>Launch a Campaign Now</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Tab 2: Auto-Chaining Campaigns */}
      {activeTab === 'autochain' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 space-y-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600">
              <Repeat className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">
                Consecutive Campaign Stacking & Auto-Chaining Protocol
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Automatically detect previous product schedules and chain campaigns without overlap or gaps.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50 text-xs text-indigo-950 dark:text-indigo-200 leading-relaxed">
            <span className="font-bold">How it operates: </span>
            When you paste Product #1 and start it at <b>10:00 AM</b>, its 10 pins post consecutively every hour until <b>7:00 PM</b> (10:00 AM, 11:00 AM, 12:00 PM, 1:00 PM, 2:00 PM, 3:00 PM, 4:00 PM, 5:00 PM, 6:00 PM, 7:00 PM).<br /><br />
            When you create Product #2 with <b>Auto-Chain (Recommended)</b> selected, PinPilot AI automatically detects that Product #1's 10th post finishes at 7:00 PM. Product #2 will seamlessly start on the <b>11th hour at 8:00 PM</b>!
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-bold uppercase text-[10px]">
                  <th className="py-2.5">Post #</th>
                  <th>Product #1 (Gaming Mouse)</th>
                  <th>Product #2 (Standing Desk)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                <tr><td className="py-2 text-slate-400">Hour 1</td><td className="text-emerald-600 font-semibold">10:00 AM – Pin #1 (Showcase)</td><td className="text-slate-400">Queued in line</td></tr>
                <tr><td className="py-2 text-slate-400">Hour 2</td><td className="text-emerald-600 font-semibold">11:00 AM – Pin #2 (Features)</td><td className="text-slate-400">Queued in line</td></tr>
                <tr><td className="py-2 text-slate-400">...</td><td className="text-slate-500">Hourly Pins 3–9</td><td className="text-slate-400">...</td></tr>
                <tr className="bg-rose-50/30 dark:bg-rose-950/20"><td className="py-2 font-bold text-rose-600">Hour 10</td><td className="text-rose-600 font-bold">7:00 PM – Pin #10 (Ultimate Pick)</td><td className="text-indigo-600 font-bold">Armed in queue</td></tr>
                <tr className="bg-indigo-50/50 dark:bg-indigo-950/40"><td className="py-2 font-bold text-indigo-600">Hour 11</td><td className="text-slate-400">Product 1 Complete ✓</td><td className="text-indigo-600 font-extrabold">8:00 PM – Pin #1 (Showcase Starts!)</td></tr>
                <tr><td className="py-2 text-slate-400">Hour 12</td><td className="text-slate-400">-</td><td className="text-indigo-600 font-semibold">9:00 PM – Pin #2 (Features)</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Post-Publish Checklist */}
      {activeTab === 'checklist' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 space-y-8 shadow-sm">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">
                  7-Point Post-Publish Verification Checklist
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Interactive checklist studio: test simulated states, open the live modal, or audit your real pins.
                </p>
              </div>
            </div>

            <button
              onClick={() => setModalPin(currentSamplePin)}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-500/20 transition shrink-0 active:scale-95"
            >
              <Eye className="w-4 h-4" />
              <span>Launch Live Checklist Modal</span>
            </button>
          </div>

          {/* Interactive Simulation Studio */}
          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-500" /> Interactive Simulator Scenario
                </span>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Choose an audit state to see how the 7 compliance checks evaluate the pin.
                </p>
              </div>

              {/* State Switcher Pills */}
              <div className="flex flex-wrap items-center gap-1.5 p-1 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setSimulatorMode('published')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                    simulatorMode === 'published'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  ✓ Published (100% Passed)
                </button>
                <button
                  type="button"
                  onClick={() => setSimulatorMode('scheduled')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                    simulatorMode === 'scheduled'
                      ? 'bg-amber-600 text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  ⏳ Scheduled in Queue
                </button>
                <button
                  type="button"
                  onClick={() => setSimulatorMode('optional_disclosure')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                    simulatorMode === 'optional_disclosure'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  🛡 Optional Disclosure
                </button>
              </div>
            </div>

            {/* Simulated Pin Preview Card */}
            <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex flex-col md:flex-row items-start gap-4">
              <img
                src={currentSamplePin.imageUrl}
                alt=""
                className="w-16 h-24 rounded-xl object-cover bg-slate-100 dark:bg-slate-800 shrink-0"
              />
              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                    currentSamplePin.publishingStatus === 'published'
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                      : 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300'
                  }`}>
                    {currentSamplePin.publishingStatus}
                  </span>
                  <span className="text-xs font-bold text-slate-500">
                    Concept #{currentSamplePin.conceptIndex}: {currentSamplePin.creativeConcept.name}
                  </span>
                </div>
                <h4 className="font-extrabold text-sm text-slate-900 dark:text-white truncate">
                  {currentSamplePin.title}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                  {currentSamplePin.description}
                </p>
                <div className="pt-2 flex flex-wrap items-center gap-3 text-[11px] text-slate-400">
                  <span>Destination: <b className="text-slate-700 dark:text-slate-300">{currentSamplePin.affiliateUrl}</b></span>
                  {currentSamplePin.pinterestPinId && (
                    <span>Pin ID: <b className="text-rose-600">#{currentSamplePin.pinterestPinId}</b></span>
                  )}
                </div>
              </div>

              <div className="shrink-0 flex flex-col gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setModalPin(currentSamplePin)}
                  className="w-full flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 font-bold text-xs transition"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Inspect Checklist Modal</span>
                </button>
              </div>
            </div>
          </div>

          {/* Audit Real Pins Section */}
          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-rose-500" /> Audit One of Your Real Database Pins
                </span>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Select any pin created in your campaigns to inspect its real server checklist in real time.
                </p>
              </div>

              {realPins.length > 0 ? (
                <div className="flex items-center gap-2">
                  <select
                    value={selectedRealPinId}
                    onChange={(e) => setSelectedRealPinId(e.target.value)}
                    className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium text-slate-800 dark:text-slate-200 max-w-xs truncate"
                  >
                    {realPins.map((p) => (
                      <option key={p._id} value={p._id}>
                        #{p.conceptIndex || 1} - {p.title?.substring(0, 45)}... ({p.publishingStatus})
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => {
                      const found = realPins.find((p) => p._id === selectedRealPinId);
                      if (found) setModalPin(found);
                    }}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition shrink-0"
                  >
                    <span>Audit Pin</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => navigate('/create-campaign')}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-bold text-xs transition"
                >
                  <span>Launch Campaign to Generate Pins</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Detailed 7-Point Audit Breakdown */}
          <div className="space-y-3">
            <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
              The 7 Post-Publish Verification Checks (How PinPilot Audits Every Post)
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="p-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 space-y-1">
                <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-100">
                  <span className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center text-[11px] font-black">1</span>
                  <span>Destination Affiliate Link Validation</span>
                </div>
                <p className="text-slate-500 dark:text-slate-400 pl-7 text-[11px] leading-relaxed">
                  Confirms the Pinterest destination link points directly to your affiliate URL. When pinners click "Visit Site", they land straight on your commission link.
                </p>
              </div>

              <div className="p-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 space-y-1">
                <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-100">
                  <span className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center text-[11px] font-black">2</span>
                  <span>Official Pinterest API Confirmation</span>
                </div>
                <p className="text-slate-500 dark:text-slate-400 pl-7 text-[11px] leading-relaxed">
                  Validates that Pinterest API v5 accepted the upload and generated a permanent live Pin ID accessible at <span className="font-mono text-rose-500">pinterest.com/pin/{'{id}'}</span>.
                </p>
              </div>

              <div className="p-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 space-y-1">
                <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-100">
                  <span className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center text-[11px] font-black">3</span>
                  <span>Target Board Assignment</span>
                </div>
                <p className="text-slate-500 dark:text-slate-400 pl-7 text-[11px] leading-relaxed">
                  Confirms the pin was placed in the exact Pinterest category board selected by the user, organizing campaigns neatly.
                </p>
              </div>

              <div className="p-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 space-y-1">
                <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-100">
                  <span className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center text-[11px] font-black">4</span>
                  <span>FTC Affiliate Disclosure (Optional / Compulsory)</span>
                </div>
                <p className="text-slate-500 dark:text-slate-400 pl-7 text-[11px] leading-relaxed">
                  If compulsory mode is ON, checks that disclosure wording is appended. If compulsory mode is OFF, passes verification cleanly in optional mode without error.
                </p>
              </div>

              <div className="p-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 space-y-1">
                <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-100">
                  <span className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center text-[11px] font-black">5</span>
                  <span>Vertical 1000×1500 (2:3) Creative Delivery</span>
                </div>
                <p className="text-slate-500 dark:text-slate-400 pl-7 text-[11px] leading-relaxed">
                  Verifies that the vertical commercial image was uploaded to Cloudinary CDN and delivered in full resolution.
                </p>
              </div>

              <div className="p-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 space-y-1">
                <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-100">
                  <span className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center text-[11px] font-black">6</span>
                  <span>SEO Title & Pinterest Search Tags</span>
                </div>
                <p className="text-slate-500 dark:text-slate-400 pl-7 text-[11px] leading-relaxed">
                  Confirms high-intent commercial keywords and hashtags are indexed, maximizing organic Pinterest search visibility.
                </p>
              </div>

              <div className="p-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 space-y-1 md:col-span-2">
                <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-100">
                  <span className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center text-[11px] font-black">7</span>
                  <span>Next Hourly Scheduled Pin Armed in 24/7 Queue</span>
                </div>
                <p className="text-slate-500 dark:text-slate-400 pl-7 text-[11px] leading-relaxed">
                  Ensures the persistent Agenda background scheduler is active and has queued the subsequent hourly post. Even with your PC turned off, the queue triggers autonomously.
                </p>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
            <button
              onClick={() => navigate('/pins')}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs transition"
            >
              <span>View All Pins in Generated Pins</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => setModalPin(currentSamplePin)}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-500/20 transition active:scale-95"
            >
              <Eye className="w-4 h-4" />
              <span>Test Checklist Modal Now</span>
            </button>
          </div>
        </div>
      )}

      {/* Tab 4: Excel & Google Sheets */}
      {activeTab === 'sheets' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 space-y-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">
                Excel & Google Sheets Audit Reporting
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Download schedules and share clean spreadsheets with affiliate networks and clients.
              </p>
            </div>
          </div>

          <div className="space-y-4 text-xs text-slate-600 dark:text-slate-300">
            <p>
              PinPilot provides 1-click CSV exports matching all international spreadsheet standards:
            </p>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-2">
              <div className="font-bold text-slate-800 dark:text-slate-100">
                How to Open in Google Sheets in 30 Seconds:
              </div>
              <ol className="list-decimal pl-4 space-y-1 text-slate-500 dark:text-slate-400">
                <li>Click <b>Export to Excel / Google Sheets</b> on the Generated Pins page or Overview.</li>
                <li>Go to <a href="https://sheets.new" target="_blank" rel="noreferrer" className="text-rose-600 hover:underline">sheets.new</a> in your browser.</li>
                <li>Click <b>File &gt; Import &gt; Upload</b> and choose your downloaded CSV file.</li>
                <li>Choose "Replace spreadsheet" and click <b>Import data</b>.</li>
              </ol>
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: Pinterest API v5 Setup */}
      {activeTab === 'pinterest' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 space-y-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-pinterest text-white">
              <Share2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">
                Official Pinterest API v5 Setup Guide
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Step-by-step instructions to create an app and authorize your business account.
              </p>
            </div>
          </div>

          <div className="space-y-4 text-xs text-slate-600 dark:text-slate-300">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-3">
              <div className="font-bold text-slate-800 dark:text-slate-100">
                1. Create Your Pinterest Developer App:
              </div>
              <p className="text-slate-500">
                Go to <a href="https://developers.pinterest.com/apps/" target="_blank" rel="noreferrer" className="text-rose-600 font-bold hover:underline">developers.pinterest.com/apps</a> and click <b>Create app</b>.
              </p>

              <div className="font-bold text-slate-800 dark:text-slate-100 pt-2">
                2. Set the Redirect URI:
              </div>
              <div className="flex items-center justify-between p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-mono text-[11px]">
                <span>http://localhost:5000/api/pinterest/callback</span>
                <button
                  onClick={() => copyText('http://localhost:5000/api/pinterest/callback')}
                  className="p-1 hover:text-rose-600"
                  title="Copy"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="font-bold text-slate-800 dark:text-slate-100 pt-2">
                3. Required Scopes:
              </div>
              <span className="font-mono text-[11px] text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 px-2.5 py-1 rounded-lg border border-rose-200 dark:border-rose-900/60 inline-block">
                boards:read, boards:write, pins:read, pins:write, user_accounts:read
              </span>

              <div className="font-bold text-slate-800 dark:text-slate-100 pt-2">
                4. Paste in Settings & Authorize:
              </div>
              <p className="text-slate-500">
                Copy your <b>App ID</b> and <b>Secret Key</b> into PinPilot's Settings page. Then go to <b>Pinterest Accounts</b> and click <b>Connect Pinterest Account</b>.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 6: AI Keys & Quotas */}
      {activeTab === 'ai' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 space-y-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-600">
              <Cpu className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">
                AI Generation Keys, Quotas & Limits
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Understand how Gemini, OpenAI, and built-in synthesis work together.
              </p>
            </div>
          </div>

          <div className="space-y-4 text-xs text-slate-600 dark:text-slate-300">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-2">
              <div className="font-bold text-slate-800 dark:text-slate-100">
                Automatic Failover Engine:
              </div>
              <ul className="list-disc pl-4 space-y-1 text-slate-500">
                <li><b>Primary</b>: Google Gemini API (ultra-fast, high context).</li>
                <li><b>Secondary</b>: OpenAI GPT-4o-mini (if OpenAI API key is supplied).</li>
                <li><b>Built-in Fallback</b>: High-grade deterministic synthesis engine that requires <i>zero keys</i> and works 100% out-of-the-box!</li>
              </ul>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-2">
              <div className="font-bold text-slate-800 dark:text-slate-100">
                Live Quota Progress Bars:
              </div>
              <p className="text-slate-500">
                PinPilot tracks your daily request counts and token usage in real time. If your usage exceeds 85%, the bar turns amber; at 95%, it turns red and automatically switches to the secondary engine.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 7: FTC Affiliate Compliance */}
      {activeTab === 'compliance' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 space-y-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-600">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">
                FTC & Pinterest Affiliate Marketing Compliance
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Stay 100% compliant and protect your Pinterest Business account.
              </p>
            </div>
          </div>

          <div className="space-y-4 text-xs text-slate-600 dark:text-slate-300">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-3">
              <div className="font-bold text-slate-800 dark:text-slate-100">
                Affiliate Disclosures: Optional by Default with Compulsory Button Support
              </div>
              <p className="text-slate-500 dark:text-slate-400">
                Affiliate disclosures are <b>optional</b> in PinPilot AI. If your affiliate network or jurisdiction requires disclosure statements, you can turn ON the <b>Compulsory Disclosure</b> toggle button in Settings or while creating any individual campaign.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="p-3 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50">
                  <span className="font-bold text-emerald-700 dark:text-emerald-400 block mb-1">
                    ✓ When Compulsory Button is ON:
                  </span>
                  <span className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed block">
                    PinPilot automatically appends your customized disclosure statement to the end of every generated pin description.
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <span className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    ✕ When Compulsory Button is OFF:
                  </span>
                  <span className="text-slate-500 dark:text-slate-400 text-[11px] leading-relaxed block">
                    Descriptions post cleanly without appending any disclosure text, giving you complete flexibility.
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-semibold text-rose-600 dark:text-rose-400">
                Default Statement: "Affiliate link – I may earn a commission from qualifying purchases at no extra cost to you."
              </div>
              <p className="text-[11px] text-slate-400">
                You can configure and customize the exact disclosure wording anytime in the <b className="text-slate-700 dark:text-slate-300">Settings</b> page under "Affiliate Compliance & Defaults".
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Interactive Post-Publish Checklist Modal */}
      <PublishChecklistModal
        isOpen={!!modalPin}
        onClose={() => setModalPin(null)}
        pin={modalPin}
      />
    </div>
  );
};
