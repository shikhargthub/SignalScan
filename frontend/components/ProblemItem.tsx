"use client";

import { useState } from "react";
import { type Problem, getSeverityStyle } from "@/lib/analyzer";
import styles from "./ProblemItem.module.css";

interface ProblemItemProps {
  problem: Problem;
}

export default function ProblemItem({ problem }: ProblemItemProps) {
  const [open, setOpen] = useState(false);
  const sev = getSeverityStyle(problem.sev);

  return (
    <div
      className={`${styles.item} ${open ? styles.itemOpen : ""}`}
      role="listitem"
    >
      {/* Header — always visible */}
      <button
        className={styles.head}
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls={`problem-body-${problem.id}`}
      >
        <div
          className={styles.sevDot}
          style={{ background: sev.dot }}
          aria-hidden="true"
        />
        <i
          className={`ti ${problem.icon} ${styles.icon}`}
          aria-hidden="true"
        />
        <span className={styles.name}>{problem.name}</span>
        <span
          className={styles.badge}
          style={{ background: sev.tagBg, color: sev.tagColor }}
        >
          {sev.label}
        </span>
        <i
          className={`ti ti-chevron-down ${styles.chevron} ${open ? styles.chevronOpen : ""}`}
          aria-hidden="true"
        />
      </button>

      {/* Body — expands */}
      {open && (
        <div
          className={styles.body}
          id={`problem-body-${problem.id}`}
        >
          {/* What is it */}
          <div className={styles.section}>
            <div className={styles.sectionLabel}>What is this?</div>
            <p className={styles.text}>{problem.what}</p>
          </div>

          {/* Why it matters */}
          <div className={styles.section}>
            <div className={styles.sectionLabel}>Why it matters for AI</div>
            <p className={styles.text}>{problem.why_matters}</p>
          </div>

          {/* Impact chips */}
          <div className={styles.section}>
            <div className={styles.sectionLabel}>Impact on your AI score</div>
            <div className={styles.impacts}>
              {problem.impacts.map((impact) => (
                <div key={impact} className={styles.impactChip}>
                  <i className="ti ti-alert-triangle" aria-hidden="true" />
                  {impact}
                </div>
              ))}
            </div>
          </div>

          {/* Fixes */}
          <div className={styles.fixBox}>
            <div className={styles.fixLabel}>
              <i className="ti ti-tool" aria-hidden="true" />
              How to fix it
            </div>
            <ol className={styles.fixList}>
              {problem.fixes.map((fix, i) => (
                <li key={i} className={styles.fixItem}>
                  <span className={styles.fixNum}>{i + 1}</span>
                  <span className={styles.fixText}>{fix}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      )}
    </div>
  );
}
