# PinPilot AI – Pinterest Affiliate Marketing Automation Platform

> **Production-Ready, 24/7 Autonomous Pinterest Affiliate Marketing SaaS Built Strictly on the MERN Stack (MongoDB, Express.js, React.js, Node.js).**

PinPilot AI automates the entire Pinterest affiliate marketing lifecycle from a **single affiliate product URL** to **10 automatically scheduled, SEO-optimized, commercial pins** published autonomously around the clock.

---

## 🚀 Key Highlights & Architecture

- **Strictly MERN Stack**: Built with MongoDB, Express.js, React.js (Vite, JavaScript), and Node.js. No Next.js, Django, Laravel, or Supabase.
- **Affiliate Link to 10 Pins Automation**: Paste any affiliate product URL (Amazon, Target, Shopify, custom brand) to automatically scrape metadata, features, pricing, and high-res references.
- **10 Unique Commercial Visual Concepts**: Generates 10 distinct vertical 1000×1500 (2:3) commercial Pinterest creatives per product (Showcase, Top Features, Value Prop, Lifestyle, Comparison, etc.).
- **AI SEO Copywriting & FTC Disclosures**: Generates 10 distinct titles (max 100 chars), SEO descriptions (max 800 chars), search keywords, hashtags, call-to-actions, and required FTC affiliate disclosures.
- **Official Pinterest API v5 Integration**: Direct OAuth 2.0 connection, board synchronization, and native pin creation attaching the exact original affiliate link as the pin's destination.
- **24/7 Persistent MongoDB Cloud Scheduler**: Uses Agenda and MongoDB-backed job persistence with exponential backoff retries and auto-recovery after server restarts. Continues publishing even when the user closes their browser or switches off their computer.
- **Cloudinary Storage**: Permanent cloud CDN hosting for generated high-resolution 1000×1500 pin graphics.
- **Modern Minimal SaaS Dashboard**: Overview analytics, multi-step generation progress, visual publishing calendar, pin editor, Pinterest account manager, and dark mode support.

---

## 📁 Repository Structure

```
PinPilot/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.js                 # MongoDB connection (Atlas / local / persistent embedded)
│   │   │   └── cloudinary.js         # Cloudinary configuration
│   │   ├── controllers/
│   │   │   ├── authController.js      # JWT registration, login, user API keys & settings
│   │   │   ├── campaignController.js  # URL scraping, campaign creation, pipeline triggers
│   │   │   ├── pinController.js       # Pin CRUD, regeneration (image & text), publish now
│   │   │   ├── pinterestController.js # Official Pinterest API v5 OAuth & boards
│   │   │   ├── analyticsController.js # Impressions, clicks, and performance aggregation
│   │   │   └── schedulerController.js # Persistent MongoDB job status & health
│   │   ├── middleware/
│   │   │   ├── auth.js                # JWT Bearer token authentication
│   │   │   └── errorHandler.js        # Centralized JSON error handling
│   │   ├── models/
│   │   │   ├── User.js                # User accounts & custom API credentials
│   │   │   ├── PinterestAccount.js    # Encrypted OAuth tokens (AES-256-GCM) & boards
│   │   │   ├── Campaign.js            # Affiliate campaigns & pipeline progress
│   │   │   ├── Pin.js                 # 10 unique pin assets & destination affiliate links
│   │   │   ├── ScheduledJob.js        # Persistent MongoDB scheduler jobs
│   │   │   └── ActivityLog.js         # Audit log & API event tracking
│   │   ├── routes/                    # Express REST endpoints
│   │   ├── services/
│   │   │   ├── scraperService.js      # Cheerio & JSON-LD affiliate product scraper
│   │   │   ├── aiService.js           # Gemini / OpenAI 10-concept SEO content generator
│   │   │   ├── imageService.js        # Vertical 1000x1500 commercial image generator
│   │   │   ├── cloudinaryService.js   # Cloudinary upload & asset management
│   │   │   ├── pinterestService.js    # Official Pinterest API v5 client & analytics
│   │   │   └── schedulerService.js    # Persistent Agenda & watchdog queue runner
│   │   ├── utils/
│   │   │   ├── crypto.js              # AES-256-GCM token encryption at rest
│   │   │   └── logger.js              # Structured logging utility
│   │   └── server.js                  # Express application entrypoint
│   ├── .env.example
│   └── package.json
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── Campaign/              # GenerationProgress, ManualProductModal
    │   │   ├── Common/                # Modal, Toast, Badge
    │   │   ├── Layout/                # Sidebar, Navbar, Layout
    │   │   └── Pin/                   # PinCard, PinEditModal, RescheduleModal
    │   ├── context/
    │   │   ├── AuthContext.jsx        # User state, JWT storage, Pinterest status
    │   │   └── ThemeContext.jsx       # Dark / Light theme persistence
    │   ├── pages/
    │   │   ├── Overview.jsx           # Dashboard overview, stat cards, pie chart
    │   │   ├── CreateCampaign.jsx     # Affiliate URL submission & generation pipeline
    │   │   ├── MyCampaigns.jsx        # Campaign management (Pause, Resume, Delete)
    │   │   ├── GeneratedPins.jsx      # 10-Pin preview grid & actions
    │   │   ├── PublishingCalendar.jsx # Interactive monthly visual calendar
    │   │   ├── PinterestAccounts.jsx  # OAuth connect, board selector, setup guide
    │   │   ├── Analytics.jsx          # Recharts traffic & outbound click trends
    │   │   ├── Settings.jsx           # Disclosures, CTA defaults, API key overrides
    │   │   ├── Login.jsx              # Auth sign in with demo credentials fill
    │   │   └── Register.jsx           # User registration
    │   ├── services/
    │   │   └── api.js                 # Axios client with interceptors
    │   ├── App.jsx                    # React Router configuration & guards
    │   ├── main.jsx                   # React entry point
    │   └── index.css                  # Tailwind styles
    ├── index.html
    ├── tailwind.config.js
    ├── vite.config.js
    └── package.json
```

---

## 🎨 The 10 Unique Creative Concepts

Each campaign generates 10 distinct, non-repetitive visual directions in 1000×1500 vertical format (2:3 aspect ratio):

1. **Product Showcase**: Clean studio lighting on neutral podium, high-end editorial focus.
2. **Top Product Features**: Technical infographic highlights, macro details, cutting-edge style.
3. **Why You Should Buy This Product**: Solution-oriented visual addressing buyer pain points.
4. **Product Benefits & Daily Value**: Aspirational lifestyle setting highlighting everyday utility.
5. **Comparison-Style Creative**: High contrast framing highlighting superiority over alternatives.
6. **Best Features Explained**: Annotated close-up shot emphasizing craftsmanship.
7. **Minimal Aesthetic Photography**: Scandinavian luxury, neutral tones, organic shadows.
8. **Realistic Lifestyle Environment**: Integrated into an authentic, aspirational modern room/desk.
9. **Reasons to Consider This Product**: Curated lookbook aesthetic with prominent spacing.
10. **Ultimate Recommendation Creative**: Bold award-winning review conclusion.

---

## ⚙️ Quick Start (Local Development)

### 1. Prerequisites
- Node.js v18+ (tested on Node v22)
- npm v9+

### 2. Backend Setup
```bash
cd backend
npm install
cp .env.example .env
npm start
```
> *Note:* If no `MONGODB_URI` is provided in `.env`, PinPilot automatically spins up a persistent local MongoDB instance in `.mongodata/` on port 27018.

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 📌 Pinterest API v5 Setup Guide

1. Log in to [Pinterest Developers](https://developers.pinterest.com/apps/) with your Pinterest Business account.
2. Click **Create app** and provide an App Name (e.g., `PinPilot Automation`).
3. In App Settings, set the **Redirect URI** to:
   - Local: `http://localhost:5000/api/pinterest/callback`
   - Production: `https://your-backend-domain.com/api/pinterest/callback`
4. Copy your **App ID** (Client ID) and **App Secret Key** (Client Secret).
5. Paste them into `backend/.env` or inside the **Settings** page in the dashboard:
   ```env
   PINTEREST_CLIENT_ID=your_pinterest_app_id
   PINTEREST_CLIENT_SECRET=your_pinterest_app_secret
   PINTEREST_REDIRECT_URI=http://localhost:5000/api/pinterest/callback
   ```
6. Navigate to **Pinterest Accounts** in the dashboard and click **Connect Pinterest Account**.
7. Grant the requested scopes: `boards:read`, `boards:write`, `pins:read`, `pins:write`, `user_accounts:read`.

---

## ☁️ Production Deployment

### Frontend (Vercel)
1. Push repository to GitHub.
2. Import repository in [Vercel](https://vercel.com).
3. Set **Root Directory** to `frontend`.
4. Add Environment Variable:
   ```env
   VITE_API_URL=https://your-pinpilot-backend.onrender.com/api
   ```
5. Deploy.

### Backend (Render / Railway / Always-On Cloud)
1. Deploy `backend` as a Node.js Web Service.
2. Build Command: `npm install`
3. Start Command: `npm start`
4. Set Environment Variables:
   ```env
   PORT=5000
   NODE_ENV=production
   CLIENT_URL=https://your-pinpilot-frontend.vercel.app
   JWT_SECRET=strong_random_jwt_secret_here
   ENCRYPTION_SECRET=32_character_aes_encryption_key_here!
   MONGODB_URI=mongodb+srv://user:pass@cluster0.mongodb.net/pinpilot?retryWrites=true&w=majority
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_cloudinary_key
   CLOUDINARY_API_SECRET=your_cloudinary_secret
   PINTEREST_CLIENT_ID=your_pinterest_app_id
   PINTEREST_CLIENT_SECRET=your_pinterest_app_secret
   PINTEREST_REDIRECT_URI=https://your-pinpilot-backend.onrender.com/api/pinterest/callback
   GEMINI_API_KEY=optional_gemini_api_key
   OPENAI_API_KEY=optional_openai_api_key
   ```
> *Important:* For 24/7 background scheduled jobs, use a paid or persistent instance on Render / Railway to ensure background timers and MongoDB queue workers continue executing when users are logged out.

---

## 🔒 Security & Data Integrity

- **OAuth Tokens Encrypted at Rest**: Pinterest access and refresh tokens are encrypted using **AES-256-GCM** with authenticated checksum tags before being stored in MongoDB.
- **Destination Link Authenticity**: The original affiliate URL provided by the user is directly attached to every published pin via official Pinterest API v5 `link` parameter.
- **FTC Affiliate Compliance**: Automated inclusion of FTC-compliant disclosure statements in every generated pin description.
- **Duplicate Prevention**: Concurrency locks prevent duplicate publishing during retries or worker restarts.
- **No Mock Functionality**: If Pinterest credentials or permissions are not yet configured, the system reports exact API requirements rather than fabricating mock published status.
