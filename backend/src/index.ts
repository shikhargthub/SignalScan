import express, { Request, Response } from "express";
import cors from "cors";
import { scrapeURL } from "./scraper";
import { scoreMetrics } from "./scorer";

const app = express();
const PORT = process.env.PORT || 4000;

// Allow all origins (safe for public tool)
app.use(cors());
app.use(express.json());

// Health check
app.get("/health", (_req: Request, res: Response) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Main analyze endpoint
app.get("/analyze", async (req: Request, res: Response) => {
  const { url } = req.query;

  if (!url || typeof url !== "string") {
    return res.status(400).json({ error: "url query param required" });
  }

  try {
    const normalized = url.startsWith("http") ? url : `https://${url}`;
    new URL(normalized);
  } catch {
    return res.status(400).json({ error: "Invalid URL format" });
  }

  console.log(`[${new Date().toISOString()}] Analyzing: ${url}`);

  try {
    const raw = await scrapeURL(url);

    if (raw.error) {
      return res.status(422).json({ error: `Could not fetch page: ${raw.error}` });
    }

    const result = scoreMetrics(raw);
    console.log(`[${new Date().toISOString()}] Done: ${url} → SNR ${result.snr}, Risk ${result.riskLabel}`);
    return res.json(result);
  } catch (err: unknown) {
    console.error(`[ERROR] ${url}:`, err);
    return res.status(500).json({ error: "Analysis failed. The page may be unreachable or block automated access." });
  }
});

app.listen(PORT, () => {
  console.log(`SignalScan backend running on port ${PORT}`);
});
