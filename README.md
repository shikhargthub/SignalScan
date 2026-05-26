# SignalScan — Fullstack AI Readability Analyzer

Link-(https://signalscan.onrender.com/)

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
