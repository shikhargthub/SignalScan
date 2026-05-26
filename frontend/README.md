# SignalScan v3

AI Readability Analyzer — tells you exactly why AI models misread your website, with per-problem definitions and fixes.

## Stack
- **Next.js 14** (App Router)
- **TypeScript**
- **CSS Modules** — zero external CSS libraries
- **Instrument Serif + Geist + Geist Mono** — Google Fonts

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## File Map (replace these in your existing project)

| File | Purpose |
|---|---|
| `lib/analyzer.ts` | All scoring logic + 6 full problem definitions |
| `app/globals.css` | CSS variables, base reset, fonts |
| `app/layout.tsx` | Root layout + metadata + Tabler Icons CDN |
| `app/page.tsx` | Entry point |
| `components/App.tsx` | Screen state orchestrator (landing → loading → results) |
| `components/App.module.css` | Page container + max-width |
| `components/Landing.tsx` | Hero + problem grid + scan bar |
| `components/Landing.module.css` | Landing styles |
| `components/LoadingScreen.tsx` | Animated dual-spinner + step progress |
| `components/LoadingScreen.module.css` | Loading styles |
| `components/Results.tsx` | Report header + KPI strip + problem list + rescan |
| `components/Results.module.css` | Results styles |
| `components/ProblemItem.tsx` | Expandable problem card with what/why/impacts/fixes |
| `components/ProblemItem.module.css` | Problem card styles |

## How It Works

1. User enters any URL on the landing page
2. `analyzeURL(url)` in `lib/analyzer.ts` runs a seeded rule-based engine
3. It detects which of 6 problems apply and builds a full `AnalysisResult`
4. Results page shows KPI strip + expandable per-problem cards
5. Each problem has: **What is it**, **Why it matters for AI**, **Impact chips**, **How to fix it**

## Upgrading to Real Analysis

Replace `analyzeURL()` with a call to `app/api/analyze/route.ts`:

```ts
// app/api/analyze/route.ts
import { chromium } from 'playwright';

export async function GET(req: Request) {
  const url = new URL(req.url).searchParams.get('url')!;
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: 'networkidle' });

  const domNodes = await page.evaluate(() => document.querySelectorAll('*').length);
  const textKb = await page.evaluate(() => document.body.innerText.length / 1024);
  const htmlKb = (await page.content()).length / 1024;
  // ... compute SNR, detect problems
  await browser.close();
  return Response.json({ domNodes, textKb, htmlKb });
}
```

## Design Decisions
- Light theme with warm off-white — avoids the generic "dark hacker tool" look
- Instrument Serif for editorial headings — creates contrast with monospace data
- Problem cards on landing educate users *before* they scan
- Expand-in-place problem items keep context — no page navigation required
- Fully responsive down to 320px
