import React, { useState } from 'react';
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
  Repeat
} from 'lucide-react';
import { useToast } from '../components/Common/Toast';

export const Instructions = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState('workflow');

  const copyText = (text) => {
    navigator.clipboard.writeText(text);
    addToast('Copied to clipboard!', 'success');
  };

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
      <div className="flex items-center gap-1.5 p-1.5 bg-slate-100 dark:bg-slate-800 rounded-2xl overflow-x-auto">
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
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 space-y-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">
                7-Point Post-Publish Verification Checklist
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Every published pin is audited against 7 compliance and operational criteria.
              </p>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex items-start gap-3">
              <span className="font-bold text-emerald-600 text-sm">1.</span>
              <div>
                <span className="font-bold text-slate-800 dark:text-slate-100 block">Affiliate Destination Link Validation</span>
                <span className="text-slate-500 dark:text-slate-400">Confirms the destination link on Pinterest matches your exact affiliate tracking URL.</span>
              </div>
            </div>
            <div className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex items-start gap-3">
              <span className="font-bold text-emerald-600 text-sm">2.</span>
              <div>
                <span className="font-bold text-slate-800 dark:text-slate-100 block">Official Pinterest Pin ID Confirmation</span>
                <span className="text-slate-500 dark:text-slate-400">Verifies that the Pinterest API v5 returned a live pin ID (`pinterest.com/pin/{id}`).</span>
              </div>
            </div>
            <div className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex items-start gap-3">
              <span className="font-bold text-emerald-600 text-sm">3.</span>
              <div>
                <span className="font-bold text-slate-800 dark:text-slate-100 block">Target Pinterest Board Binding</span>
                <span className="text-slate-500 dark:text-slate-400">Ensures the pin was placed in the selected board category.</span>
              </div>
            </div>
            <div className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex items-start gap-3">
              <span className="font-bold text-emerald-600 text-sm">4.</span>
              <div>
                <span className="font-bold text-slate-800 dark:text-slate-100 block">FTC Affiliate Disclosure Clause</span>
                <span className="text-slate-500 dark:text-slate-400">Checks for mandatory disclosure wording ("Affiliate link – I may earn a commission...").</span>
              </div>
            </div>
            <div className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex items-start gap-3">
              <span className="font-bold text-emerald-600 text-sm">5.</span>
              <div>
                <span className="font-bold text-slate-800 dark:text-slate-100 block">Vertical 1000×1500 (2:3) Creative Delivery</span>
                <span className="text-slate-500 dark:text-slate-400">Verifies that the high-resolution image loaded properly from Cloudinary CDN.</span>
              </div>
            </div>
            <div className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex items-start gap-3">
              <span className="font-bold text-emerald-600 text-sm">6.</span>
              <div>
                <span className="font-bold text-slate-800 dark:text-slate-100 block">SEO Tags & Keywords Indexing</span>
                <span className="text-slate-500 dark:text-slate-400">Ensures title is under 100 chars and high-volume Pinterest hashtags are attached.</span>
              </div>
            </div>
            <div className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex items-start gap-3">
              <span className="font-bold text-emerald-600 text-sm">7.</span>
              <div>
                <span className="font-bold text-slate-800 dark:text-slate-100 block">Next Scheduled Pin Armed</span>
                <span className="text-slate-500 dark:text-slate-400">Verifies that the next hourly post is queued and active in the MongoDB scheduler.</span>
              </div>
            </div>
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
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-2">
              <div className="font-bold text-slate-800 dark:text-slate-100">
                Mandatory Affiliate Disclosures:
              </div>
              <p className="text-slate-500">
                The FTC (Federal Trade Commission) and Pinterest require all pins with affiliate tracking links to clearly disclose the affiliate relationship.
              </p>
              <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-semibold text-rose-600 dark:text-rose-400">
                "Affiliate link – I may earn a commission from qualifying purchases at no extra cost to you."
              </div>
              <p className="text-[11px] text-slate-400">
                PinPilot AI automatically appends this statement to every generated description. You can customize the exact wording in Settings.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
