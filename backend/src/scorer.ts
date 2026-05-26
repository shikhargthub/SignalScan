import { ScrapedMetrics } from "./scraper";

export interface ScoredResult {
  url: string;
  snr: number;
  risk: number;
  riskLabel: "HIGH" | "MEDIUM" | "LOW";
  readScore: number;
  domNodes: number;
  requests: number;
  totalMb: string;
  textKb: number;
  htmlKb: number;
  textPct: number;
  problems: ScoredProblem[];
  scrapedAt: string;
}

export interface ScoredProblem {
  id: string;
  name: string;
  sev: "critical" | "high" | "medium" | "low";
  icon: string;
  detail: string; // real data from scrape
  what: string;
  why_matters: string;
  impacts: string[];
  fixes: string[];
}

const PROBLEM_DEFS: Record<string, Omit<ScoredProblem, "id" | "detail">> = {
  js_render: {
    name: "Heavy JavaScript rendering",
    sev: "critical",
    icon: "ti-brand-javascript",
    what: "Your page loads a large number of external scripts and inline JS. AI crawlers receive the raw HTML shell and may see little to no readable content if it is injected by JavaScript.",
    why_matters: "When GPT, Gemini, or Claude scrapes your page for RAG or summarization, they see a near-empty document. This forces the model to hallucinate content or return an empty result for your page.",
    impacts: ["LLM returns empty or hallucinated summaries", "RAG pipelines skip or misindex your page", "AI search tools cannot cite your content", "High hallucination probability on AI queries"],
    fixes: [
      "Implement server-side rendering (SSR) with Next.js or Nuxt so HTML arrives pre-populated.",
      "Add <noscript> fallback content with your key information for non-JS crawlers.",
      "Generate static HTML exports for all important landing and content pages.",
      "Audit scripts with Chrome DevTools Coverage tab — remove unused JS bundles.",
    ],
  },
  hidden_dom: {
    name: "Hidden content in DOM",
    sev: "critical",
    icon: "ti-eye-off",
    what: "Your page contains a significant number of elements hidden via display:none, visibility:hidden, or opacity:0. AI parsers encounter this content but treat it as low-confidence noise.",
    why_matters: "Models parsing your full DOM get confused by the ratio of visible to invisible content. Accordion panels, modal text, and off-screen elements all appear as noise, reducing the overall quality score of your page.",
    impacts: ["Semantic noise inflates page size artificially", "Accordion and tab content gets deprioritized", "Models weight hidden text as low-signal", "Confuses AI content extraction algorithms"],
    fixes: [
      "Lazy-render accordion content on open rather than hiding it in DOM at load time.",
      "For tabs, only render the active tab content in initial HTML; fetch others on demand.",
      'Use aria-hidden="true" so parsers can explicitly skip decorative hidden elements.',
      "Consider separate URLs for major content sections instead of tab-hidden content.",
    ],
  },
  ad_scripts: {
    name: "Ad scripts dominating page structure",
    sev: "high",
    icon: "ti-ad",
    what: "Your page loads requests from known third-party ad networks. These inject JavaScript, DOM nodes, and network requests with zero semantic content value.",
    why_matters: "Ad scripts can push your SNR below 0.1, putting you in the HIGH hallucination risk category even if your actual content is excellent. Every byte of ad script is a byte of noise.",
    impacts: ["Crushes SNR ratio significantly", "Triggers HIGH hallucination risk classification", "Adds blocking load time before content is available", "Injects hundreds of extra DOM nodes"],
    fixes: [
      "Load all ad scripts with defer or async attributes to prevent blocking content rendering.",
      "Implement facade patterns — show a placeholder until the user interacts with the ad slot.",
      "Audit and remove ad networks contributing less than 5% of revenue per KB of script weight.",
      "Use server-side ad rendering where the ad network supports it.",
    ],
  },
  rep_nav: {
    name: "Repetitive navigation text",
    sev: "high",
    icon: "ti-navigation",
    what: "Your page contains multiple navigation elements with repeated link text. AI extractors see this repetition and lower their confidence in the page content focus.",
    why_matters: "When the first 2,000 characters of your DOM are repeated nav links across header, sidebar, and footer, models allocate less attention to your actual content.",
    impacts: ["Nav text dominates first-impression parsing", "Repetition reduces topical coherence score", "Increases document entropy for LLMs", "Content gets underweighted in AI summaries"],
    fixes: [
      'Use <nav aria-label="primary"> and <nav aria-label="footer"> so parsers weight nav separately.',
      "Implement a single navigation component rendered once, duplicated with CSS for mobile.",
      "Reduce footer nav to only essential legal and contact links.",
      'Add a <main> landmark element wrapping your primary content.',
    ],
  },
  cookie_banner: {
    name: "Cookie consent banner noise",
    sev: "medium",
    icon: "ti-cookie",
    what: "Your page uses a consent management platform (CMP) that injects modal UI, legal text in multiple languages, and tracking scripts before your actual content loads.",
    why_matters: "The consent framework adds DOM nodes and JavaScript that load before your page content. For AI crawlers capturing the initial DOM snapshot, the consent UI appears as dominant content.",
    impacts: ["CMP script may load synchronously", "Banner DOM appears before main content", "Multilingual legal text inflates page weight", "Delays first meaningful content availability"],
    fixes: [
      "Load your CMP script with the async attribute so it does not block content rendering.",
      "Use CSS to overlay the banner visually without inserting it into the DOM before content.",
      "Implement a lightweight custom consent solution under 5KB instead of a full CMP platform.",
      "Inject the consent banner client-side only, after the main page content has loaded.",
    ],
  },
  css_bloat: {
    name: "Minified CSS bloat",
    sev: "medium",
    icon: "ti-file-code",
    what: "Your page loads multiple stylesheets and large amounts of inline CSS, much of which contains styles for components not present on this specific page.",
    why_matters: "Every byte of CSS loaded is a byte of noise in your signal-to-noise calculation. Large CSS payloads suppress your SNR score even when your text content is well-structured.",
    impacts: ["SNR artificially suppressed by total byte weight", "Page weight significantly higher than necessary", "Slower parse time for AI crawlers", "Critical CSS should be inlined separately"],
    fixes: [
      "Implement PurgeCSS or Tailwind content purging to strip unused styles at build time.",
      "Extract and inline only the critical CSS needed for above-the-fold rendering (under 14KB).",
      "Split CSS by route and lazy-load page-specific styles using dynamic imports.",
      "Target a total CSS payload under 50KB per page for a healthy SNR score.",
    ],
  },
};

export function scoreMetrics(m: ScrapedMetrics): ScoredResult {
  const risk = Math.max(5, Math.min(98, Math.round(100 - m.snr * 220)));
  const readScore = Math.max(10, Math.min(99, Math.round(m.snr * 150)));
  const riskLabel: "HIGH" | "MEDIUM" | "LOW" = risk >= 70 ? "HIGH" : risk >= 40 ? "MEDIUM" : "LOW";

  const problems: ScoredProblem[] = [];

  if (m.jsHeavy)      problems.push({ id: "js_render",    detail: m.jsHeavyDetail,      ...PROBLEM_DEFS.js_render });
  if (m.hiddenDOM)    problems.push({ id: "hidden_dom",   detail: m.hiddenDOMDetail,    ...PROBLEM_DEFS.hidden_dom });
  if (m.adScripts)    problems.push({ id: "ad_scripts",   detail: m.adScriptsDetail,    ...PROBLEM_DEFS.ad_scripts });
  if (m.repNav)       problems.push({ id: "rep_nav",      detail: m.repNavDetail,       ...PROBLEM_DEFS.rep_nav });
  if (m.cookieBanner) problems.push({ id: "cookie_banner",detail: m.cookieBannerDetail, ...PROBLEM_DEFS.cookie_banner });
  if (m.cssBloat)     problems.push({ id: "css_bloat",    detail: m.cssBloatDetail,     ...PROBLEM_DEFS.css_bloat });

  return {
    url: m.url,
    snr: m.snr,
    risk,
    riskLabel,
    readScore,
    domNodes: m.domNodes,
    requests: m.requests,
    totalMb: m.totalMb,
    textKb: m.textKb,
    htmlKb: m.htmlKb,
    textPct: m.textPct,
    problems,
    scrapedAt: new Date().toISOString(),
  };
}
