"use client";

import { useState, useEffect, useRef } from "react";
import styles from "./Landing.module.css";

interface LandingProps {
  onScan: (url: string) => void;
}

const PROBLEMS = [
  { icon: "ti-brand-javascript", title: "Heavy JS rendering",   desc: "Content locked inside JS bundles is invisible to static AI crawlers.", sev: "critical" as const },
  { icon: "ti-eye-off",          title: "Hidden DOM content",   desc: "display:none elements are parsed but treated as low-signal noise.",    sev: "critical" as const },
  { icon: "ti-ad",               title: "Ad script bloat",      desc: "Third-party ad networks inject megabytes of zero-content JavaScript.", sev: "high"     as const },
  { icon: "ti-navigation",       title: "Repetitive nav text",  desc: "Header/footer navbars repeated 3× dilute your content signal ratio.",  sev: "high"     as const },
  { icon: "ti-cookie",           title: "Cookie banner noise",  desc: "Consent modals inject DOM nodes before your actual content loads.",     sev: "medium"   as const },
  { icon: "ti-file-code",        title: "Minified CSS bloat",   desc: "300 KB of unused styles crush your signal-to-noise score.",            sev: "medium"   as const },
];

const TICKER_ITEMS = [
  "Signal-to-Noise Ratio",
  "Hallucination Risk",
  "Hidden DOM Detection",
  "AI Readability Score",
  "JS Render Blocking",
  "Ad Script Weight",
  "DOM Node Count",
  "Cookie Banner Noise",
  "Content Signal %",
  "Network Requests",
];

const WARNINGS = [
  {
    tag: "Before handing your site to AI agents",
    heading: "Does your page actually exist to AI?",
    body: "AI agents scraping your site for context, RAG pipelines indexing your content, or LLMs summarizing your product — they all see a radically different version of your page than your users do. Most see almost nothing.",
  },
  {
    tag: "Before publishing AI-generated content",
    heading: "Your markup is drowning your message.",
    body: "Every kilobyte of script, stylesheet, and hidden markup competes with your actual words. When the noise outweighs the signal, AI models fill in the gaps — with invented facts about your brand.",
  },
  {
    tag: "Before your competitors figure this out",
    heading: "AI-invisible pages rank nowhere in AI search.",
    body: "Perplexity, ChatGPT Browse, and AI Overviews pull from pages they can parse cleanly. If your site returns a blank DOM to a static crawler, it simply won't be cited — no matter how good your content is.",
  },
];

const SEV_LABEL: Record<string, string> = { critical: "Critical", high: "High", medium: "Medium" };

function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } }, { threshold });
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, visible };
}

function AnimSection({ children, className, delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const { ref, visible } = useInView();
  return (
    <div ref={ref} className={className} style={{ opacity: 0, animation: visible ? `fadeUp 0.8s cubic-bezier(0.16,1,0.3,1) ${delay}s both` : "none" }}>
      {children}
    </div>
  );
}

export default function Landing({ onScan }: LandingProps) {
  const [url, setUrl] = useState("https://example.com");
  const [focused, setFocused] = useState(false);

  const handleScan = () => { if (url.trim()) onScan(url.trim()); };

  return (
    <div className={styles.page}>

      {/* ── NAV ── */}
      <nav className={styles.nav}>
        <div className={styles.navInner}>
          <div className={styles.navLogo}>
            <div className={styles.logoMark} aria-hidden="true"><i className="ti ti-radar" /></div>
            <span>SignalScan</span>
          </div>
          <div className={styles.navRight}>
            <span className={styles.navTag}>AI Readability Analyzer</span>
            <div className={styles.navBadge}>v3</div>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <div className={styles.heroLeft}>
            <div className={`${styles.eyebrow} anim-slide-r`}>
              <span className={styles.eyebrowDash} aria-hidden="true" />
              For developers &amp; content teams
            </div>
            <h1 className={styles.heroTitle}>
              <span className={`${styles.heroLine1} anim-fade-up d1`}>Your website is</span>
              <span className={`${styles.heroLine2} anim-fade-up d2`}><em className={styles.heroItalic}>invisible</em></span>
              <span className={`${styles.heroLine3} anim-fade-up d3`}>to AI models.</span>
            </h1>
            <p className={`${styles.heroSub} anim-fade-up d4`}>
              Most websites are 97% markup noise. AI models hallucinate, skip, or
              misread pages bloated with scripts, hidden DOM, and ad clutter.
              SignalScan diagnoses exactly what's broken — and how to fix it.
            </p>
          </div>

          {/* Live metrics column */}
          <div className={`${styles.heroRight} anim-scale-in d3`} aria-hidden="true">
            <div className={styles.metricsCard}>
              <div className={styles.metricsCardHeader}>
                <div className={styles.mcDot} style={{ background: "#c94040" }} />
                <div className={styles.mcDot} style={{ background: "#b06a10" }} />
                <div className={styles.mcDot} style={{ background: "#3a6b10" }} />
                <span className={styles.mcTitle}>example.com · live scan</span>
              </div>
              <div className={styles.metricRow}>
                <span className={styles.mLabel}>SNR Ratio</span>
                <span className={styles.mVal} style={{ color: "#c94040" }}>0.04</span>
              </div>
              <div className={styles.metricRow}>
                <span className={styles.mLabel}>Hallucination Risk</span>
                <span className={styles.mVal} style={{ color: "#c94040" }}>91%</span>
              </div>
              <div className={styles.metricRow}>
                <span className={styles.mLabel}>AI Readability</span>
                <span className={styles.mVal} style={{ color: "#c94040" }}>6/100</span>
              </div>
              <div className={styles.metricRow}>
                <span className={styles.mLabel}>Page Weight</span>
                <span className={styles.mVal}>18.4 MB</span>
              </div>
              <div className={styles.metricRow}>
                <span className={styles.mLabel}>DOM Nodes</span>
                <span className={styles.mVal}>4,812</span>
              </div>
              <div className={styles.metricRow}>
                <span className={styles.mLabel}>Signal %</span>
                <span className={styles.mVal} style={{ color: "#c94040" }}>1.8%</span>
              </div>
              <div className={styles.riskPill}>HIGH RISK · 4 critical problems</div>
            </div>
          </div>
        </div>

        {/* Scroll ticker */}
        <div className={styles.ticker} aria-hidden="true">
          <div className={styles.tickerTrack}>
            {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
              <span key={i} className={styles.tickerItem}>
                <span className={styles.tickerDot}>·</span>{item}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── WARNING BLOCKS ── */}
      <section className={styles.warningsSection} aria-label="Why this matters">
        <div className={styles.warnGrid}>
          {WARNINGS.map((w, i) => (
            <AnimSection key={i} className={styles.warnCard} delay={i * 0.08}>
              <div className={styles.warnTag}>{w.tag}</div>
              <h2 className={styles.warnHeading}>{w.heading}</h2>
              <p className={styles.warnBody}>{w.body}</p>
            </AnimSection>
          ))}
        </div>
      </section>

      {/* ── BIG STAT BAND ── */}
      <AnimSection className={styles.statBand}>
        <div className={styles.statBandInner}>
          <div className={styles.statItem}>
            <div className={styles.statNum}>97<span className={styles.statUnit}>%</span></div>
            <div className={styles.statDesc}>of page bytes are<br/>invisible markup noise</div>
          </div>
          <div className={styles.statDivider} aria-hidden="true" />
          <div className={styles.statItem}>
            <div className={styles.statNum}>3<span className={styles.statUnit}>×</span></div>
            <div className={styles.statDesc}>more AI hallucinations<br/>on high-noise pages</div>
          </div>
          <div className={styles.statDivider} aria-hidden="true" />
          <div className={styles.statItem}>
            <div className={styles.statNum}>0.04</div>
            <div className={styles.statDesc}>average SNR ratio<br/>across Fortune 500 sites</div>
          </div>
        </div>
      </AnimSection>

      {/* ── PROBLEMS GRID ── */}
      <section className={styles.problemsSection} aria-labelledby="problems-heading">
        <div className={styles.problemsTop}>
          <AnimSection>
            <div className={styles.sectionEyebrow}>Problems we detect</div>
            <h2 className={styles.sectionHeading} id="problems-heading">
              Six ways your site<br/><em className={styles.heroItalic}>fails AI models.</em>
            </h2>
          </AnimSection>
        </div>
        <div className={styles.problemGrid} role="list">
          {PROBLEMS.map((p, i) => (
            <AnimSection key={p.title} className={`${styles.problemCard} ${styles[p.sev]}`} delay={i * 0.06}>
              <div className={styles.pcAccent} aria-hidden="true" />
              <div className={styles.pcTop}>
                <i className={`ti ${p.icon} ${styles.pcIcon}`} aria-hidden="true" />
                <span className={`${styles.pcBadge} ${styles[`badge_${p.sev}`]}`}>{SEV_LABEL[p.sev]}</span>
              </div>
              <div className={styles.pcTitle}>{p.title}</div>
              <div className={styles.pcDesc}>{p.desc}</div>
            </AnimSection>
          ))}
        </div>
      </section>

      {/* ── SCAN BOX ── */}
      <AnimSection className={styles.scanSection}>
        <div className={styles.scanBox}>
          <div className={styles.scanBoxLeft}>
            <div className={styles.scanEyebrow}>Run your free analysis</div>
            <h2 className={styles.scanHeading}>
              Find out what AI<br/>sees on your site.
            </h2>
            <p className={styles.scanSub}>
              Enter any URL. In seconds, you'll get a full breakdown of every
              problem with severity ratings and step-by-step fixes.
            </p>
            <div className={styles.scanMeta}>No login required · 2–3 seconds · Free</div>
          </div>
          <div className={styles.scanBoxRight}>
            <label className={styles.inputLabel} htmlFor="url-input">Website URL</label>
            <div className={`${styles.inputWrap} ${focused ? styles.inputFocused : ""}`}>
              <i className="ti ti-world" aria-hidden="true" />
              <input
                id="url-input"
                className={styles.input}
                type="text"
                value={url}
                placeholder="https://yourwebsite.com"
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleScan()}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                aria-label="Website URL to analyze"
              />
            </div>
            <button className={styles.btn} onClick={handleScan} aria-label="Start analysis">
              <i className="ti ti-scan" aria-hidden="true" />
              Analyze my website
            </button>
            <div className={styles.inputHint}>
              Analyzes signal-to-noise ratio, hallucination risk, DOM structure,<br/>and 6 AI confusion factors.
            </div>
          </div>
        </div>
      </AnimSection>

      {/* ── FOOTER ── */}
      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <div className={styles.footerLogo}>
            <i className="ti ti-radar" aria-hidden="true" />SignalScan
          </div>
          <div className={styles.footerMeta}>
            Rule-based AI readability engine · Built with Next.js
          </div>
        </div>
      </footer>
    </div>
  );
}
