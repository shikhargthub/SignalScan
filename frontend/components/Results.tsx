"use client";

import { useState } from "react";
import {
  type AnalysisResult,
  getRiskStyle,
  getKpiColor,
  getSeverityStyle,
} from "@/lib/analyzer";
import ProblemItem from "./ProblemItem";
import styles from "./Results.module.css";

interface ResultsProps {
  data: AnalysisResult;
  onRescan: (url: string) => void;
  onBack: () => void;
}

export default function Results({ data, onRescan, onBack }: ResultsProps) {
  const [rescanUrl, setRescanUrl] = useState(data.url);
  const riskSt = getRiskStyle(data.riskLabel);

  const critCount = data.problems.filter((p) => p.sev === "critical").length;
  const highCount  = data.problems.filter((p) => p.sev === "high").length;

  const kpis = [
    {
      label: "SNR Ratio",
      value: String(data.snr),
      sub: data.snr >= 0.4 ? "Strong signal" : data.snr >= 0.15 ? "Moderate" : "Weak signal",
      color: getKpiColor(data.snr, "snr"),
    },
    {
      label: "Hallucination Risk",
      value: `${data.risk}%`,
      sub: data.riskLabel,
      color: getKpiColor(data.risk, "risk"),
    },
    {
      label: "AI Readability",
      value: `${data.readScore}/100`,
      sub: data.readScore >= 60 ? "Good" : "Needs work",
      color: getKpiColor(data.readScore, "score"),
    },
    {
      label: "Page Weight",
      value: `${data.totalMb} MB`,
      sub: `${data.requests} requests`,
      color: "var(--text)",
    },
    {
      label: "DOM Nodes",
      value: data.domNodes.toLocaleString(),
      sub: data.domNodes > 2000 ? "Complex" : "Moderate",
      color: "var(--text)",
    },
    {
      label: "Signal %",
      value: `${data.textPct}%`,
      sub: `${data.textKb} KB of text`,
      color: getKpiColor(data.snr, "snr"),
    },
  ];

  return (
    <div className={styles.wrap}>
      {/* Top bar */}
      <div className={styles.topBar}>
        <button className={styles.backBtn} onClick={onBack} aria-label="Back to home">
          <i className="ti ti-arrow-left" aria-hidden="true" />
          Back
        </button>
        <div className={styles.navLogo}>
          <i className="ti ti-radar" aria-hidden="true" />
          <span>SignalScan</span>
        </div>
      </div>

      {/* Report header */}
      <div className={styles.reportHeader}>
        <div className={styles.urlRow}>
          <i className="ti ti-world" style={{ fontSize: 12 }} aria-hidden="true" />
          <span className={styles.urlText}>{data.url}</span>
        </div>
        <div className={styles.titleRow}>
          <h1 className={styles.reportTitle}>Analysis report</h1>
          <div
            className={styles.riskBadge}
            style={{
              background: riskSt.bg,
              color: riskSt.color,
              borderColor: riskSt.border,
            }}
            aria-label={`Risk level: ${data.riskLabel}`}
          >
            {data.riskLabel} RISK
          </div>
        </div>
      </div>

      {/* KPI strip */}
      <div className={styles.kpiStrip} aria-label="Key metrics">
        {kpis.map((k) => (
          <div key={k.label} className={styles.kpi}>
            <div className={styles.kpiLabel}>{k.label}</div>
            <div className={styles.kpiValue} style={{ color: k.color }}>
              {k.value}
            </div>
            <div className={styles.kpiSub}>{k.sub}</div>
          </div>
        ))}
      </div>

      {/* Divider */}
      <div className={styles.divider} aria-hidden="true" />

      {/* Problems */}
      <div className={styles.problemsHeader}>
        <div className={styles.problemCount} aria-live="polite">
          <span className={styles.countMain}>{data.problems.length} problems detected</span>
          {critCount > 0 && (
            <span className={styles.critCount} style={{ color: "var(--critical-color)" }}>
              {critCount} critical
            </span>
          )}
          {highCount > 0 && (
            <span className={styles.highCount} style={{ color: "var(--high-color)" }}>
              {highCount} high
            </span>
          )}
        </div>
        <div className={styles.expandHint}>click any problem to expand</div>
      </div>

      <div role="list" aria-label="Detected problems">
        {data.problems.map((problem) => (
          <ProblemItem key={problem.id} problem={problem} />
        ))}
      </div>

      {/* Rescan bar */}
      <div className={styles.rescanBar}>
        <div className={styles.rescanLabel}>Scan another URL</div>
        <div className={styles.rescanRow}>
          <div className={styles.rescanInputWrap}>
            <i className="ti ti-world" aria-hidden="true" />
            <input
              className={styles.rescanInput}
              type="text"
              value={rescanUrl}
              placeholder="https://yourwebsite.com"
              onChange={(e) => setRescanUrl(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && onRescan(rescanUrl.trim())}
              aria-label="Enter URL to scan again"
            />
          </div>
          <button
            className={styles.rescanBtn}
            onClick={() => onRescan(rescanUrl.trim())}
            aria-label="Scan this URL"
          >
            <i className="ti ti-refresh" aria-hidden="true" />
            Scan
          </button>
        </div>
      </div>

      <footer className={styles.footer}>
        <span>SignalScan</span>
        <span aria-hidden="true">·</span>
        <span>Rule-based AI readability engine</span>
        <span aria-hidden="true">·</span>
        <span>Built with Next.js</span>
      </footer>
    </div>
  );
}
