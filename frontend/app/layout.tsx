import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SignalScan — AI Readability Analyzer",
  description:
    "Find out exactly why AI models misread, skip, or hallucinate about your website. Get a full breakdown of every problem with actionable fixes.",
  keywords: ["AI readability", "signal to noise ratio", "hallucination risk", "LLM scraping", "SEO for AI"],
  openGraph: {
    title: "SignalScan — AI Readability Analyzer",
    description: "Find out exactly why AI models misread your website.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
<head>
  <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
  <link
    rel="stylesheet"
    href="https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@3.5.0/dist/tabler-icons.min.css"
  />
</head>
      <body>{children}</body>
    </html>
  );
}
