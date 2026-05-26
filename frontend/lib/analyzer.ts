export type Severity = "critical" | "high" | "medium" | "low";

export interface Problem {
  id: string;
  name: string;
  sev: Severity;
  icon: string;
  detail: string;
  what: string;
  why_matters: string;
  impacts: string[];
  fixes: string[];
}

export interface AnalysisResult {
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
  problems: Problem[];
  scrapedAt?: string;
}

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:4000";

export async function analyzeURL(url: string): Promise<AnalysisResult> {
  const normalized = url.startsWith("http") ? url : `https://${url}`;
  const res = await fetch(`${BACKEND_URL}/analyze?url=${encodeURIComponent(normalized)}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Unknown error" }));
    throw new Error(err.error ?? `Server error ${res.status}`);
  }
  return res.json();
}

export function getSeverityStyle(sev: Severity) {
  const map = {
    critical: { dot: "#c94040", tagBg: "#fbeaea", tagColor: "#7a1f1f", label: "Critical" },
    high:     { dot: "#b06a10", tagBg: "#fdf0db", tagColor: "#6b3d05", label: "High" },
    medium:   { dot: "#7a7870", tagBg: "#f0ede8", tagColor: "#3e3d39", label: "Medium" },
    low:      { dot: "#3a6b10", tagBg: "#e8f2dc", tagColor: "#1a3a05", label: "Low" },
  };
  return map[sev];
}

export function getRiskStyle(label: "HIGH" | "MEDIUM" | "LOW") {
  const map = {
    HIGH:   { bg: "#fbeaea", color: "#7a1f1f", border: "#e8a0a0" },
    MEDIUM: { bg: "#fdf0db", color: "#6b3d05", border: "#f0c070" },
    LOW:    { bg: "#e8f2dc", color: "#1a3a05", border: "#b8d898" },
  };
  return map[label];
}

export function getKpiColor(value: number, type: "snr" | "score" | "risk"): string {
  if (type === "snr")   return value >= 0.4 ? "#3a6b10" : value >= 0.15 ? "#854F0B" : "#A32D2D";
  if (type === "score") return value >= 60  ? "#3a6b10" : value >= 30   ? "#854F0B" : "#A32D2D";
  if (type === "risk")  return value <= 30  ? "#3a6b10" : value <= 65   ? "#854F0B" : "#A32D2D";
  return "inherit";
}
