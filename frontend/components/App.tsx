"use client";

import { useState, useCallback } from "react";
import { analyzeURL, type AnalysisResult } from "@/lib/analyzer";
import Landing from "./Landing";
import LoadingScreen from "./LoadingScreen";
import Results from "./Results";
import styles from "./App.module.css";

type Screen = "landing" | "loading" | "results" | "error";

const SCAN_MESSAGES = [
  "Launching headless browser...",
  "Visiting your page...",
  "Counting DOM nodes...",
  "Measuring JS and CSS weight...",
  "Detecting ad scripts and cookie banners...",
  "Calculating signal-to-noise ratio...",
  "Scoring confusion factors...",
  "Building your report...",
];

export default function App() {
  const [screen, setScreen]   = useState<Screen>("landing");
  const [result, setResult]   = useState<AnalysisResult | null>(null);
  const [error, setError]     = useState<string>("");
  const [msgIndex, setMsgIndex] = useState(0);

  const runScan = useCallback(async (rawUrl: string) => {
    setScreen("loading");
    setError("");
    setMsgIndex(0);

    // Cycle through messages while waiting
    let i = 0;
    const interval = setInterval(() => {
      i = Math.min(i + 1, SCAN_MESSAGES.length - 1);
      setMsgIndex(i);
    }, 1200);

    try {
      const data = await analyzeURL(rawUrl);
      clearInterval(interval);
      setResult(data);
      setScreen("results");
    } catch (err: unknown) {
      clearInterval(interval);
      setError(err instanceof Error ? err.message : "Analysis failed. Please try another URL.");
      setScreen("error");
    }
  }, []);

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        {screen === "landing" && <Landing onScan={runScan} />}

        {screen === "loading" && (
          <LoadingScreen messages={SCAN_MESSAGES} activeIndex={msgIndex} />
        )}

        {screen === "results" && result && (
          <Results data={result} onRescan={runScan} onBack={() => setScreen("landing")} />
        )}

        {screen === "error" && (
          <div className={styles.errorWrap}>
            <div className={styles.errorIcon}>⚠</div>
            <div className={styles.errorTitle}>Analysis failed</div>
            <div className={styles.errorMsg}>{error}</div>
            <button className={styles.errorBtn} onClick={() => setScreen("landing")}>
              Try another URL
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
