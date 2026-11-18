# PinPilot AI - Production Deployment Guide

This guide covers deploying PinPilot AI to production.

---

## 1. Architecture & Hosting Requirements

PinPilot AI consists of two components:
1. **Frontend**: Vite + React Single-Page Application (SPA)
2. **Backend**: Node.js + Express API with a **24/7 Persistent Agenda Scheduler** and watchdog that hourly publishes pins to Pinterest.

> **CRITICAL HOSTING NOTE:**
> Because the backend runs a 24/7 background scheduler (`Agenda` + 30s watchdog) that publishes pins autonomously even when no users are online, **the backend must be hosted on a persistent Node.js runtime** (e.g. **Render**, **Railway**, **Fly.io**, **Heroku**, **DigitalOcean**, or **VPS / Docker**).
> 
> **Do not host the backend on serverless functions (like Vercel/Netlify Functions)**, as serverless lambdas freeze when idle and will stop your scheduled pins from publishing. (However, hosting the *frontend* on Vercel/Netlify and the *backend* on Render/Railway is a great setup!).

---

## 2. Recommended Deployment Options

### Option A: All-In-One Deployment on Render or Railway (Easiest)

Both frontend and backend are built and served from a single unified domain.

1. **Connect GitHub Repo** to [Render.com](https://render.com) or [Railway.app](https://railway.app).
2. **Create a "Web Service"**:
   - **Environment**: `Node`
   - **Build Command**: `npm run build`
   - **Start Command**: `npm start`
3. **Configure Environment Variables** (see Section 3 below).
4. **Deploy**: Render/Railway will install all dependencies, build the React frontend into `frontend/dist`, and start the backend on port 5000 / `$PORT`, serving both the API and the React SPA.

---

### Option B: Decoupled Deployment (Vercel Frontend + Render Backend)

- **Frontend (Vercel)**:
  - Root directory: `frontend`
  - Framework: `Vite`
  - Build command: `npm run build`
  - Output directory: `dist`
  - Environment Variable:
    `VITE_API_URL=https://your-backend-service.onrender.com/api`

- **Backend (Render Web Service)**:
  - Root directory: `backend`
  - Build command: `npm install`
  - Start command: `npm start`
  - Environment Variables: see Section 3 below. Set `CLIENT_URL=https://your-frontend.vercel.app`.

---

## 3. Production Environment Variables Checklist

Add these in your hosting provider's **Environment Settings**:

| Variable | Description | Example / Note |
| :--- | :--- | :--- |
| `NODE_ENV` | Environment mode | `production` |
| `PORT` | Web server port | `5000` (or auto-assigned by host) |
| `MONGODB_URI` | MongoDB Atlas connection string | `mongodb+srv://user:pass@cluster.mongodb.net/pinpilot?retryWrites=true&w=majority` |
| `CLIENT_URL` | Frontend domain(s) allowed for CORS | `https://your-app.com` (or comma-separated) |
| `JWT_SECRET` | Secret key for JWT auth tokens | Any secure 32+ character random string |
| `JWT_EXPIRES_IN` | JWT token validity duration | `30d` |
| `ENCRYPTION_SECRET` | Key for AES-256 Pinterest token encryption | Exact 32-character string |
| `PINTEREST_CLIENT_ID` | Pinterest Developer App ID | From developers.pinterest.com |
| `PINTEREST_CLIENT_SECRET`| Pinterest App Secret Key | From developers.pinterest.com |
| `PINTEREST_REDIRECT_URI` | Live OAuth callback URL | `https://your-app.com/api/pinterest/callback` |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary account cloud name | For permanent Pinterest 1000x1500 image hosting |
| `CLOUDINARY_API_KEY` | Cloudinary API Key | From cloudinary.com console |
| `CLOUDINARY_API_SECRET` | Cloudinary API Secret | From cloudinary.com console |
| `GEMINI_API_KEY` | *(Optional)* Custom Gemini API Key | Built-in synthesis activates if omitted |
| `OPENAI_API_KEY` | *(Optional)* Custom OpenAI API Key | Optional secondary backup |

---

## 4. Pinterest App Production Configuration

In your [Pinterest Developer Portal](https://developers.pinterest.com/apps/):
1. In your App settings, add your live production Redirect URI:
   `https://<your-production-domain>/api/pinterest/callback`
2. Ensure the required scopes are enabled:
   `boards:read`, `boards:write`, `pins:read`, `pins:write`, `user_accounts:read`
3. Request standard API access or test with developer/sandbox accounts.

---

## 5. Pre-Flight Verification Commands

Run locally before pushing to git:

```bash
# 1. Test frontend build
cd frontend && npm run build

# 2. Test backend services & cryptography
cd ../backend && node src/testServices.js

# 3. Test unified server
node src/server.js
```

---

## 6. Troubleshooting: "404 Not Found" on `/api/auth/login` or `/api/auth/google` in Production

If you see `Failed to load resource: the server responded with a status of 404 (Not Found)` on `api/auth/login` in your production browser console, check which deployment model you used:

### Cause 1: Frontend Deployed to Vercel/Netlify without `VITE_API_URL`
- **What happened:** Vercel only hosts static HTML/JS files (`dist`). By default, Vite looks for `/api/...` on the same domain (`https://your-app.vercel.app/api/...`), where no backend is running.
- **Fix:**
  1. Deploy your backend to a persistent Node host like [Render](https://render.com) or [Railway](https://railway.app).
  2. In your Vercel/Netlify Dashboard, go to **Settings &rarr; Environment Variables**.
  3. Add:
     `VITE_API_URL` = `https://your-backend-app.onrender.com/api`
  4. In your backend environment variables, ensure `CLIENT_URL` is set to `https://your-app.vercel.app`.
  5. In Vercel, click **Redeploy** (environment variables in Vite are compiled during the build step).

### Cause 2: Deployed as a "Static Site" on Render instead of "Web Service"
- **What happened:** Render offers "Static Site" (free HTML only) and "Web Service" (runs Node.js). If you picked "Static Site", the Express backend was never executed.
- **Fix:** Create a new **Web Service** on Render with:
  - **Build Command:** `npm run build`
  - **Start Command:** `npm start`

### Cause 3: Missing `MONGODB_URI` Causing Backend Crash
- **What happened:** In production (`NODE_ENV=production`), the backend requires a real MongoDB Atlas URI. If `MONGODB_URI` was empty, the backend crashed on boot and could not respond to requests.
- **Fix:** Add your MongoDB Atlas connection string in your host's Environment Variables under `MONGODB_URI`. Check your host's **Logs** tab to confirm the server printed `🚀 PinPilot AI Backend running`.
