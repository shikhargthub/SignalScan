import { chromium } from "playwright";

export interface ScrapedMetrics {
  url: string;
  // Core metrics
  htmlKb: number;
  textKb: number;
  totalMb: string;
  domNodes: number;
  requests: number;
  textPct: number;
  snr: number;
  // Confusion factors
  jsHeavy: boolean;
  jsHeavyDetail: string;
  hiddenDOM: boolean;
  hiddenDOMDetail: string;
  adScripts: boolean;
  adScriptsDetail: string;
  repNav: boolean;
  repNavDetail: string;
  cookieBanner: boolean;
  cookieBannerDetail: string;
  cssBloat: boolean;
  cssBloatDetail: string;
  // Error
  error?: string;
}

const AD_DOMAINS = [
  "googlesyndication.com", "doubleclick.net", "adnxs.com",
  "taboola.com", "outbrain.com", "media.net", "amazon-adsystem.com",
  "moatads.com", "pubmatic.com", "rubiconproject.com", "openx.net",
  "criteo.com", "adsrvr.org", "sharethrough.com", "indexww.com",
];

const COOKIE_KEYWORDS = [
  "cookiebot", "onetrust", "osano", "cookiepro", "trustarc",
  "consent", "gdpr", "ccpa", "cookie-banner", "cookie-notice",
];

export async function scrapeURL(rawUrl: string): Promise<ScrapedMetrics> {
  const url = rawUrl.startsWith("http") ? rawUrl : `https://${rawUrl}`;
  const browser = await chromium.launch({ args: ["--no-sandbox", "--disable-setuid-sandbox"] });
  const context = await browser.newContext({
    userAgent: "Mozilla/5.0 (compatible; SignalScanBot/1.0; +https://signalscan.dev)",
  });

  let requestCount = 0;
  let totalRequestBytes = 0;
  const requestedUrls: string[] = [];

  const page = await context.newPage();

  // Track all network requests
  page.on("request", (req) => {
    requestCount++;
    requestedUrls.push(req.url());
  });

  page.on("response", async (res) => {
    try {
      const headers = res.headers();
      const len = headers["content-length"];
      if (len) totalRequestBytes += parseInt(len, 10);
    } catch {}
  });

  try {
    await page.goto(url, { waitUntil: "networkidle", timeout: 20000 });
  } catch {
    try {
      await page.goto(url, { waitUntil: "domcontentloaded", timeout: 15000 });
    } catch (err: unknown) {
      await browser.close();
      return { url, htmlKb: 0, textKb: 0, totalMb: "0", domNodes: 0, requests: 0, textPct: 0, snr: 0, jsHeavy: false, jsHeavyDetail: "", hiddenDOM: false, hiddenDOMDetail: "", adScripts: false, adScriptsDetail: "", repNav: false, repNavDetail: "", cookieBanner: false, cookieBannerDetail: "", cssBloat: false, cssBloatDetail: "", error: String(err) };
    }
  }

  // ── 1. Get raw HTML size
  const htmlContent = await page.content();
  const htmlKb = parseFloat((Buffer.byteLength(htmlContent, "utf8") / 1024).toFixed(1));

  // ── 2. Get visible text content
  const textContent = await page.evaluate(() => document.body?.innerText ?? "");
  const textKb = parseFloat((Buffer.byteLength(textContent, "utf8") / 1024).toFixed(1));

  // ── 3. DOM node count
  const domNodes = await page.evaluate(() => document.querySelectorAll("*").length);

  // ── 4. Total weight
  const totalBytes = Math.max(totalRequestBytes, htmlKb * 1024);
  const totalMb = (totalBytes / 1024 / 1024).toFixed(2);

  // ── 5. SNR
  const snr = htmlKb > 0 ? parseFloat((textKb / htmlKb).toFixed(2)) : 0;
  const textPct = htmlKb > 0 ? Math.round((textKb / htmlKb) * 100) : 0;

  // ── FACTOR 1: JS Heavy rendering
  // Compare text before and after JS by checking noscript vs real content
  const noscriptTextLen = await page.evaluate(() => {
    const noscripts = document.querySelectorAll("noscript");
    return Array.from(noscripts).reduce((a, el) => a + (el.textContent?.length ?? 0), 0);
  });
  const scriptCount = await page.evaluate(() => document.querySelectorAll("script[src]").length);
  const inlineScriptSize = await page.evaluate(() =>
    Array.from(document.querySelectorAll("script:not([src])")).reduce((a, s) => a + (s.textContent?.length ?? 0), 0)
  );
  const jsHeavy = scriptCount > 8 || inlineScriptSize > 50000;
  const jsHeavyDetail = `${scriptCount} external scripts, ${Math.round(inlineScriptSize / 1024)}KB inline JS`;

  // ── FACTOR 2: Hidden DOM
  const hiddenInfo = await page.evaluate(() => {
    const all = document.querySelectorAll("*");
    let hiddenCount = 0;
    let hiddenTextLen = 0;
    all.forEach((el) => {
      const style = window.getComputedStyle(el);
      if (style.display === "none" || style.visibility === "hidden" || style.opacity === "0") {
        hiddenCount++;
        hiddenTextLen += el.textContent?.length ?? 0;
      }
    });
    return { hiddenCount, hiddenTextLen };
  });
  const hiddenDOM = hiddenInfo.hiddenCount > 50 || hiddenInfo.hiddenTextLen > 2000;
  const hiddenDOMDetail = `${hiddenInfo.hiddenCount} hidden elements, ${Math.round(hiddenInfo.hiddenTextLen / 1024)}KB hidden text`;

  // ── FACTOR 3: Ad scripts
  const adDomains = requestedUrls.filter((u) =>
    AD_DOMAINS.some((d) => u.includes(d))
  );
  const adScripts = adDomains.length > 0;
  const adScriptsDetail = adDomains.length > 0
    ? `${adDomains.length} ad network requests: ${[...new Set(adDomains.map((u) => new URL(u).hostname))].slice(0, 3).join(", ")}`
    : "No ad scripts detected";

  // ── FACTOR 4: Repetitive nav
  const navInfo = await page.evaluate(() => {
    const navEls = document.querySelectorAll("nav, [role='navigation'], header, footer");
    const navTexts = Array.from(navEls).map((el) => el.textContent?.trim().slice(0, 200) ?? "");
    const allLinks = Array.from(document.querySelectorAll("a")).map((a) => a.textContent?.trim().toLowerCase() ?? "").filter(Boolean);
    const linkCounts: Record<string, number> = {};
    allLinks.forEach((l) => { linkCounts[l] = (linkCounts[l] ?? 0) + 1; });
    const repeated = Object.entries(linkCounts).filter(([, c]) => c > 2).length;
    return { navCount: navEls.length, repeated };
  });
  const repNav = navInfo.navCount > 3 || navInfo.repeated > 5;
  const repNavDetail = `${navInfo.navCount} nav elements, ${navInfo.repeated} repeated links`;

  // ── FACTOR 5: Cookie banner
  const cookieInfo = await page.evaluate((keywords) => {
    const scripts = Array.from(document.querySelectorAll("script[src]")).map((s) => (s as HTMLScriptElement).src.toLowerCase());
    const ids = Array.from(document.querySelectorAll("[id],[class]")).map((el) => `${el.id} ${el.className}`.toLowerCase());
    const matched = keywords.filter((k) => scripts.some((s) => s.includes(k)) || ids.some((i) => i.includes(k)));
    return { matched, count: matched.length };
  }, COOKIE_KEYWORDS);
  const cookieBanner = cookieInfo.count > 0;
  const cookieBannerDetail = cookieInfo.count > 0
    ? `Detected: ${cookieInfo.matched.slice(0, 3).join(", ")}`
    : "No cookie CMP detected";

  // ── FACTOR 6: CSS bloat
  const cssInfo = await page.evaluate(() => {
    const sheets = Array.from(document.querySelectorAll("link[rel='stylesheet']"));
    const inlineStyles = Array.from(document.querySelectorAll("style")).reduce((a, s) => a + (s.textContent?.length ?? 0), 0);
    return { sheetCount: sheets.length, inlineStyleKb: Math.round(inlineStyles / 1024) };
  });
  const cssBloat = cssInfo.sheetCount > 4 || cssInfo.inlineStyleKb > 50;
  const cssBloatDetail = `${cssInfo.sheetCount} stylesheets, ${cssInfo.inlineStyleKb}KB inline CSS`;

  await browser.close();

  return {
    url,
    htmlKb,
    textKb,
    totalMb,
    domNodes,
    requests: requestCount,
    textPct,
    snr,
    jsHeavy, jsHeavyDetail,
    hiddenDOM, hiddenDOMDetail,
    adScripts, adScriptsDetail,
    repNav, repNavDetail,
    cookieBanner, cookieBannerDetail,
    cssBloat, cssBloatDetail,
  };
}
