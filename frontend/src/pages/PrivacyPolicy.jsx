import React, { useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  Lock,
  Share2,
  Key,
  Database,
  Eye,
  CheckCircle2,
  ArrowLeft,
  Sun,
  Moon,
  ExternalLink,
  Sparkles,
  FileText,
  AlertTriangle,
  UserCheck,
  Server,
  Trash2,
  Mail
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

export const PrivacyPolicy = () => {
  const { isDark, toggleTheme } = useTheme();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const sections = [
    { id: 'overview', title: '1. Overview & Identity' },
    { id: 'data-collection', title: '2. Information We Collect' },
    { id: 'pinterest-api', title: '3. Pinterest API v5 & Scopes' },
    { id: 'security-encryption', title: '4. AES-256-GCM Encryption' },
    { id: 'affiliate-ftc', title: '5. Affiliate Marketing & FTC Compliance' },
    { id: 'ai-processing', title: '6. AI Content Generation' },
    { id: 'no-sharing', title: '7. Strict No-Sale & Sharing Policy' },
    { id: 'retention-deletion', title: '8. Data Retention & Revocation' },
    { id: 'user-rights', title: '9. GDPR, CCPA & Global Rights' },
    { id: 'cookies', title: '10. Cookies & Local Storage' },
    { id: 'contact', title: '11. Contact Information' },
  ];

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors duration-200">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-white/85 dark:bg-slate-900/85 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(isAuthenticated ? '/' : '/login')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700/80 rounded-xl transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{isAuthenticated ? 'Dashboard' : 'Sign In'}</span>
            </button>

            <div className="h-4 w-px bg-slate-200 dark:bg-slate-700 hidden sm:block" />

            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-rose-500 to-rose-600 flex items-center justify-center shadow-md shadow-rose-500/25 shrink-0">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="font-extrabold text-base tracking-tight text-slate-900 dark:text-white">
                PinPilot
                <span className="ml-1 text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400">
                  AI
                </span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={toggleTheme}
              title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              aria-label="Toggle Theme"
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
            </button>

            <NavLink
              to={isAuthenticated ? '/' : '/login'}
              className="px-3.5 py-1.5 text-xs font-semibold rounded-xl bg-rose-600 hover:bg-rose-700 text-white shadow-sm shadow-rose-500/25 transition"
            >
              {isAuthenticated ? 'Open App' : 'Get Started'}
            </NavLink>
          </div>
        </div>
      </header>

      {/* Hero Header */}
      <section className="border-b border-slate-200/80 dark:border-slate-800 bg-gradient-to-b from-white to-slate-50 dark:from-slate-900 dark:to-slate-950 py-12 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 text-xs font-semibold mb-4">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Official Privacy Policy & Data Protection Standard</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-4">
            PinPilot AI Privacy Policy
          </h1>

          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
            We believe in total transparency. Learn how PinPilot AI securely handles your Pinterest API tokens,
            campaign keywords, affiliate marketing links, and personal information with enterprise-grade encryption.
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3 text-xs text-slate-500 dark:text-slate-400 font-medium">
            <span className="flex items-center gap-1.5 px-3 py-1 bg-white dark:bg-slate-800/80 rounded-lg border border-slate-200 dark:border-slate-700">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              Effective Date: November 18, 2026
            </span>
            <span className="flex items-center gap-1.5 px-3 py-1 bg-white dark:bg-slate-800/80 rounded-lg border border-slate-200 dark:border-slate-700">
              <Lock className="w-3.5 h-3.5 text-rose-500" />
              AES-256-GCM Token Encryption
            </span>
            <span className="flex items-center gap-1.5 px-3 py-1 bg-white dark:bg-slate-800/80 rounded-lg border border-slate-200 dark:border-slate-700">
              <Share2 className="w-3.5 h-3.5 text-sky-500" />
              Pinterest API v5 Certified
            </span>
          </div>
        </div>
      </section>

      {/* Main Content Layout */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Sticky Table of Contents Sidebar */}
          <aside className="lg:col-span-4 xl:col-span-3">
            <div className="sticky top-24 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-1">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 px-2">
                Table of Contents
              </p>
              <nav className="space-y-0.5 text-xs">
                {sections.map((sec) => (
                  <button
                    key={sec.id}
                    onClick={() => scrollToSection(sec.id)}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50/70 dark:hover:bg-rose-950/30 transition truncate font-medium"
                  >
                    {sec.title}
                  </button>
                ))}
              </nav>

              <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-[11px] text-slate-500 dark:text-slate-400">
                  <p className="font-semibold text-slate-700 dark:text-slate-200 mb-1 flex items-center gap-1">
                    <Lock className="w-3 h-3 text-rose-500" /> Data Commitment
                  </p>
                  We never sell, rent, or trade your Pinterest data or personal information.
                </div>
              </div>
            </div>
          </aside>

          {/* Privacy Document Body */}
          <div className="lg:col-span-8 xl:col-span-9 space-y-10 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
            {/* Quick Principles Card Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-800/50">
                <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-bold text-sm mb-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  What PinPilot AI Does
                </div>
                <ul className="text-xs space-y-1.5 text-emerald-900/80 dark:text-emerald-200/80">
                  <li>• Encrypts your Pinterest API access tokens with AES-256-GCM.</li>
                  <li>• Publishes scheduled pins solely at times configured by you.</li>
                  <li>• Automatically appends proper FTC affiliate disclosures.</li>
                  <li>• Allows 1-click token wipeout and account disconnection.</li>
                </ul>
              </div>

              <div className="p-4 rounded-2xl bg-rose-50/60 dark:bg-rose-950/20 border border-rose-200/80 dark:border-rose-800/50">
                <div className="flex items-center gap-2 text-rose-700 dark:text-rose-400 font-bold text-sm mb-2">
                  <ShieldCheck className="w-4 h-4 shrink-0" />
                  What PinPilot AI NEVER Does
                </div>
                <ul className="text-xs space-y-1.5 text-rose-900/80 dark:text-rose-200/80">
                  <li>• We NEVER sell or monetize your Pinterest analytics or data.</li>
                  <li>• We NEVER access or read your private Pinterest direct messages.</li>
                  <li>• We NEVER post unauthorized or spam content to your boards.</li>
                  <li>• We NEVER share your affiliate earnings or campaign data.</li>
                </ul>
              </div>
            </div>

            {/* Section 1 */}
            <section id="overview" className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
              <div className="flex items-center gap-2 text-base font-bold text-slate-900 dark:text-white">
                <FileText className="w-5 h-5 text-rose-500" />
                <h2>1. Overview & Data Controller</h2>
              </div>
              <p>
                PinPilot AI ("PinPilot", "we", "us", or "our") provides an autonomous affiliate marketing and automated pin
                creation platform tailored for Pinterest marketers. This Privacy Policy outlines the specific mechanisms by
                which we collect, store, encrypt, process, and protect your information when you access our web application
                and cloud publishing worker services.
              </p>
              <p>
                For the purposes of applicable data protection regulations (including the EU General Data Protection Regulation
                2016/679 "GDPR" and the California Consumer Privacy Act "CCPA/CPRA"), PinPilot acts as the Data Controller
                regarding your account information, and as a Data Processor regarding your automated campaign assets and scheduled pins.
              </p>
            </section>

            {/* Section 2 */}
            <section id="data-collection" className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
              <div className="flex items-center gap-2 text-base font-bold text-slate-900 dark:text-white">
                <Database className="w-5 h-5 text-rose-500" />
                <h2>2. Information We Collect</h2>
              </div>
              <p>
                We only collect information necessary to fulfill our core automation, pin generation, and publishing features:
              </p>
              <div className="space-y-2 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
                  <span className="font-semibold text-slate-800 dark:text-slate-100">Account & Profile Information:</span>
                  <p className="mt-1 text-slate-600 dark:text-slate-300">
                    Your name, email address, password (stored strictly as salted bcrypt hashes), and optional avatar when you register
                    directly or authenticate via Google Sign-In OAuth.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
                  <span className="font-semibold text-slate-800 dark:text-slate-100">Pinterest Integration Credentials:</span>
                  <p className="mt-1 text-slate-600 dark:text-slate-300">
                    Pinterest OAuth 2.0 access tokens, refresh tokens, Pinterest username, account ID, and selected destination boards.
                    All tokens are encrypted at rest with military-grade AES-256-GCM.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
                  <span className="font-semibold text-slate-800 dark:text-slate-100">Campaign & Content Data:</span>
                  <p className="mt-1 text-slate-600 dark:text-slate-300">
                    Affiliate destination URLs (e.g., Amazon, ClickBank, ShareASale), campaign titles, target keywords, custom pin
                    templates, and AI-generated image/text variations you generate.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
                  <span className="font-semibold text-slate-800 dark:text-slate-100">Technical Diagnostic Logs:</span>
                  <p className="mt-1 text-slate-600 dark:text-slate-300">
                    IP address, browser type, and operating system collected in temporary server execution logs strictly for security monitoring,
                    rate-limiting defense, and debugging failed API requests.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 3 */}
            <section id="pinterest-api" className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
              <div className="flex items-center gap-2 text-base font-bold text-slate-900 dark:text-white">
                <Share2 className="w-5 h-5 text-rose-500" />
                <h2>3. Pinterest API v5 & Scopes Usage</h2>
              </div>
              <p>
                PinPilot interacts directly with Pinterest's official API v5 endpoint (<code className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-xs">api.pinterest.com/v5</code>).
                When connecting your Pinterest account, we request only the minimal permissions essential to schedule and publish pins:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs mt-3">
                <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
                  <span className="font-mono font-bold text-rose-600 dark:text-rose-400">boards:read</span>
                  <p className="mt-1 text-slate-600 dark:text-slate-300">
                    Enables PinPilot to list your boards so you can choose which board receives your scheduled pins.
                  </p>
                </div>

                <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
                  <span className="font-mono font-bold text-rose-600 dark:text-rose-400">boards:write</span>
                  <p className="mt-1 text-slate-600 dark:text-slate-300">
                    Allows PinPilot to create new topic-specific boards automatically if you choose the "Auto-create board" campaign setting.
                  </p>
                </div>

                <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
                  <span className="font-mono font-bold text-rose-600 dark:text-rose-400">pins:read</span>
                  <p className="mt-1 text-slate-600 dark:text-slate-300">
                    Allows PinPilot to verify published pin statuses and track repins/impressions for your analytics dashboard.
                  </p>
                </div>

                <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
                  <span className="font-mono font-bold text-rose-600 dark:text-rose-400">pins:write</span>
                  <p className="mt-1 text-slate-600 dark:text-slate-300">
                    Allows the 24/7 background worker to publish your scheduled pins (with title, media, description, and link).
                  </p>
                </div>

                <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 md:col-span-2">
                  <span className="font-mono font-bold text-rose-600 dark:text-rose-400">user_accounts:read</span>
                  <p className="mt-1 text-slate-600 dark:text-slate-300">
                    Displays your Pinterest profile username and avatar within the PinPilot dashboard to confirm active account pairing.
                  </p>
                </div>
              </div>

              <div className="mt-3 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>
                  <strong>Developer Term Compliance:</strong> PinPilot strictly adheres to Pinterest's Developer Terms of Service and
                  API Guidelines. We never aggregate or scrape non-authenticated user data, nor do we perform automated spam actions.
                </span>
              </div>
            </section>

            {/* Section 4 */}
            <section id="security-encryption" className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
              <div className="flex items-center gap-2 text-base font-bold text-slate-900 dark:text-white">
                <Lock className="w-5 h-5 text-rose-500" />
                <h2>4. AES-256-GCM Encryption Architecture</h2>
              </div>
              <p>
                We recognize that your Pinterest credentials and API tokens represent sensitive access rights. To guarantee maximum
                protection:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-xs">
                <li>
                  <strong>Authenticated Encryption at Rest:</strong> All Pinterest OAuth access tokens, refresh tokens, and sensitive client keys
                  are encrypted prior to database insertion using <strong>AES-256-GCM</strong> (Advanced Encryption Standard in Galois/Counter Mode)
                  with a unique 12-byte initialization vector (IV) and authentication tag per entry.
                </li>
                <li>
                  <strong>Zero Plaintext Storage:</strong> Even in the event of a database snapshot extraction, credentials cannot be decrypted
                  without the server's isolated master encryption key.
                </li>
                <li>
                  <strong>Transport Layer Security (TLS 1.3):</strong> All traffic between your browser and our servers, as well as outbound calls
                  to Pinterest and AI providers, is encrypted over TLS 1.3/HTTPS.
                </li>
                <li>
                  <strong>Password Hashing:</strong> User account passwords are treated with one-way bcrypt hashing using individual 10-round random salts.
                </li>
              </ul>
            </section>

            {/* Section 5 */}
            <section id="affiliate-ftc" className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
              <div className="flex items-center gap-2 text-base font-bold text-slate-900 dark:text-white">
                <Key className="w-5 h-5 text-rose-500" />
                <h2>5. Affiliate Marketing & FTC Compliance</h2>
              </div>
              <p>
                PinPilot AI is designed specifically for affiliate marketers (e.g. Amazon Associates, ClickBank, CJ Affiliate, Impact,
                Rakuten). We enforce transparency guidelines compliant with the United States Federal Trade Commission (FTC) 16 CFR § 255
                and international advertising disclosure laws:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-xs">
                <li>
                  <strong>Mandatory Disclosure Tags:</strong> PinPilot automatically includes compliant affiliate disclosure markers
                  (such as <code className="px-1 py-0.5 rounded bg-slate-100 dark:bg-slate-800">#affiliate</code>, <code className="px-1 py-0.5 rounded bg-slate-100 dark:bg-slate-800">#ad</code>, or custom partner notices)
                  within generated pin descriptions so consumers are explicitly informed before clicking.
                </li>
                <li>
                  <strong>Direct Link Validation:</strong> We do not cloaked or obfuscate destination URLs in a deceptive manner that violates Pinterest
                  or affiliate network policies.
                </li>
                <li>
                  <strong>User Responsibility:</strong> While PinPilot provides automation tools and disclosure presets, users remain
                  responsible for maintaining active compliance with their individual affiliate program terms of service.
                </li>
              </ul>
            </section>

            {/* Section 6 */}
            <section id="ai-processing" className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
              <div className="flex items-center gap-2 text-base font-bold text-slate-900 dark:text-white">
                <Sparkles className="w-5 h-5 text-rose-500" />
                <h2>6. AI Content Generation & Third-Party LLMs</h2>
              </div>
              <p>
                PinPilot AI utilizes leading generative AI models (such as OpenAI GPT-4o, DeepSeek, Google Gemini, and Unsplash API)
                to automate pin title generation, SEO copy creation, and image visual compositions:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-xs">
                <li>
                  <strong>Prompt Payloads:</strong> Only your product niche, product title, and target keywords are passed to the AI model
                  endpoints. We do not transmit your personal contact details, email address, or billing data to AI providers.
                </li>
                <li>
                  <strong>No Model Training on Private Data:</strong> Our AI provider integrations utilize enterprise API agreements where
                  prompts and inputs are expressly NOT utilized to train or fine-tune public foundation models.
                </li>
              </ul>
            </section>

            {/* Section 7 */}
            <section id="no-sharing" className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
              <div className="flex items-center gap-2 text-base font-bold text-slate-900 dark:text-white">
                <Eye className="w-5 h-5 text-rose-500" />
                <h2>7. Strict No-Sale & Sharing Policy</h2>
              </div>
              <p>
                We do not sell, rent, monetize, or trade your personal information, Pinterest data, or affiliate campaign details to any
                third-party data brokers, advertisers, or research agencies.
              </p>
              <p>
                Data is shared strictly with the trusted infrastructure providers required to operate our service:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs mt-2">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60">
                  <span className="font-semibold text-slate-900 dark:text-white">Cloud Hosting</span>
                  <p className="mt-1 text-slate-500 dark:text-slate-400">Database & server hosting (MongoDB Atlas, Railway, Render) with encrypted storage.</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60">
                  <span className="font-semibold text-slate-900 dark:text-white">Pinterest API</span>
                  <p className="mt-1 text-slate-500 dark:text-slate-400">Direct transmission to publish authorized pins to your designated boards.</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60">
                  <span className="font-semibold text-slate-900 dark:text-white">Google OAuth</span>
                  <p className="mt-1 text-slate-500 dark:text-slate-400">Authentication verification for seamless one-tap login.</p>
                </div>
              </div>
            </section>

            {/* Section 8 */}
            <section id="retention-deletion" className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
              <div className="flex items-center gap-2 text-base font-bold text-slate-900 dark:text-white">
                <Trash2 className="w-5 h-5 text-rose-500" />
                <h2>8. Data Retention & Revocation of Access</h2>
              </div>
              <p>
                You retain complete sovereignty over your data and access credentials:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-xs">
                <li>
                  <strong>Instant Disconnection:</strong> You can disconnect your Pinterest account at any time from the
                  <NavLink to="/pinterest-accounts" className="text-rose-600 dark:text-rose-400 font-semibold hover:underline ml-1">
                    Pinterest Accounts Settings
                  </NavLink>. Clicking "Disconnect" immediately and irreversibly wipes all stored OAuth tokens from our database.
                </li>
                <li>
                  <strong>Pinterest Direct Revocation:</strong> You can also revoke PinPilot's access at any moment directly from your
                  Pinterest account settings under <em>Apps & Security</em>.
                </li>
                <li>
                  <strong>Account Deletion:</strong> Upon user request or account termination, all campaigns, generated pins, and profile
                  records are permanently purged within 30 days.
                </li>
              </ul>
            </section>

            {/* Section 9 */}
            <section id="user-rights" className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
              <div className="flex items-center gap-2 text-base font-bold text-slate-900 dark:text-white">
                <UserCheck className="w-5 h-5 text-rose-500" />
                <h2>9. Your Rights (GDPR & CCPA/CPRA)</h2>
              </div>
              <p>
                Depending on your location, you hold statutory rights regarding your personal information, including:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-xs">
                <li><strong>Right of Access:</strong> Request a complete copy of the data we maintain regarding your account.</li>
                <li><strong>Right to Rectification:</strong> Correct inaccurate or out-of-date profile parameters.</li>
                <li><strong>Right to Erasure ("Right to be Forgotten"):</strong> Request complete purging of your personal records.</li>
                <li><strong>Right to Restrict Processing:</strong> Pause automated publishing jobs or background worker sync.</li>
                <li><strong>Right to Data Portability:</strong> Export your campaign metadata, scheduled calendar, and pin logs in standard JSON format.</li>
                <li><strong>Non-Discrimination:</strong> We will never discriminate against you for exercising any of your privacy rights.</li>
              </ul>
            </section>

            {/* Section 10 */}
            <section id="cookies" className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
              <div className="flex items-center gap-2 text-base font-bold text-slate-900 dark:text-white">
                <Server className="w-5 h-5 text-rose-500" />
                <h2>10. Cookies & Local Storage</h2>
              </div>
              <p>
                PinPilot uses minimal, privacy-first storage technologies:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-xs">
                <li>
                  <strong>Essential Authentication Tokens:</strong> A secure JWT (JSON Web Token) stored in your browser's local storage or
                  secure session headers to maintain your authenticated dashboard session.
                </li>
                <li>
                  <strong>User Preferences:</strong> Stored under <code className="px-1 py-0.5 rounded bg-slate-100 dark:bg-slate-800">pinpilot_theme</code> to
                  remember your preferred Dark or Light theme display mode.
                </li>
                <li>
                  <strong>No Invasive Advertising Trackers:</strong> We do not embed third-party behavioral ad trackers or cross-site fingerprinting scripts.
                </li>
              </ul>
            </section>

            {/* Section 11 */}
            <section id="contact" className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
              <div className="flex items-center gap-2 text-base font-bold text-slate-900 dark:text-white">
                <Mail className="w-5 h-5 text-rose-500" />
                <h2>11. Contact Us & Privacy Officer</h2>
              </div>
              <p>
                If you have questions, feedback, or requests regarding this Privacy Policy, your Pinterest API integration,
                or wish to exercise your data privacy rights, please reach out to our team:
              </p>
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1 text-xs">
                <p className="font-semibold text-slate-800 dark:text-slate-100">PinPilot AI Data Governance Team</p>
                <p>Email: <a href="mailto:privacy@pinpilot.ai" className="text-rose-600 dark:text-rose-400 font-semibold hover:underline">privacy@pinpilot.ai</a></p>
                <p>Developer Inquiries: <a href="mailto:support@pinpilot.ai" className="text-rose-600 dark:text-rose-400 font-semibold hover:underline">support@pinpilot.ai</a></p>
                <p className="text-slate-500">Official URL: <span className="font-mono text-slate-700 dark:text-slate-300">https://pinpilot.ai/privacy</span></p>
              </div>
            </section>

            {/* Footer Notice */}
            <div className="pt-6 border-t border-slate-200 dark:border-slate-800 text-center text-xs text-slate-400">
              <p>© {new Date().getFullYear()} PinPilot AI. All rights reserved. Pinterest is a registered trademark of Pinterest, Inc.</p>
              <p className="mt-1">PinPilot AI is an independent software application and is not directly affiliated with, sponsored by, or endorsed by Pinterest, Inc.</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PrivacyPolicy;
