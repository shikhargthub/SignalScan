# SignalScan — Fullstack AI Readability Analyzer

Real website scraping with Playwright. Both frontend and backend deploy on Render.

## Architecture

```
Render Service 1 — Next.js Frontend (signalscan-frontend)
        ↓ NEXT_PUBLIC_BACKEND_URL
Render Service 2 — Express + Playwright Backend (signalscan-backend)
        ↓ headless Chromium
Real website gets scraped → Real scores returned
```

## Local Development

### 1. Start Backend
```bash
cd backend
npm install
npx playwright install chromium
npm run dev
# Runs on http://localhost:4000
```

### 2. Start Frontend
```bash
cd frontend
npm install
# .env.local already points to http://localhost:4000
npm run dev
# Runs on http://localhost:3000
```

---

## Deploy on Render

### Step 1 — Deploy Backend (Docker service)

1. Push this repo to GitHub
2. Go to [render.com](https://render.com) → New → **Web Service**
3. Connect your GitHub repo
4. Set **Root Directory** to `backend`
5. Set **Environment** to `Docker`
6. Set **Dockerfile Path** to `backend/Dockerfile`
7. Add environment variable:
   - `PORT` = `4000`
8. Click **Deploy**
9. Copy your backend URL e.g. `https://signalscan-backend.onrender.com`

### Step 2 — Deploy Frontend (Next.js service)

1. Go to Render → New → **Web Service**
2. Connect same GitHub repo
3. Set **Root Directory** to `frontend`
4. Set **Environment** to `Node`
5. Set **Build Command** to `npm install && npm run build`
6. Set **Start Command** to `npm start`
7. Add environment variable:
   - `NEXT_PUBLIC_BACKEND_URL` = `https://signalscan-backend.onrender.com`
8. Click **Deploy**

---

## What Gets Measured (Real Data)

| Metric | How it's measured |
|---|---|
| **SNR Ratio** | Visible text KB ÷ Raw HTML KB |
| **Hallucination Risk** | Formula: 100 - (SNR × 220) |
| **AI Readability** | Formula: SNR × 150, capped 0–100 |
| **DOM Nodes** | `document.querySelectorAll('*').length` |
| **Page Weight** | Sum of all network response Content-Length headers |
| **Requests** | Total Playwright network requests intercepted |

## Confusion Factors (Real Detection)

| Factor | Detection method |
|---|---|
| **Heavy JS** | script[src] count > 8 OR inline JS > 50KB |
| **Hidden DOM** | Elements with display:none/visibility:hidden count > 50 |
| **Ad Scripts** | Network requests matching 15 known ad domain patterns |
| **Repetitive Nav** | nav/header/footer count > 3 OR repeated links > 5 |
| **Cookie Banner** | Script src or class/id matching 10 CMP keyword patterns |
| **CSS Bloat** | stylesheet count > 4 OR inline CSS > 50KB |

## Tech Stack

**Frontend:** Next.js 14, TypeScript, CSS Modules
**Backend:** Express.js, Playwright, TypeScript
**Deploy:** Render (both services)
