/**
 * function: global lighthouse configuration
 * @param port
 * @returns {{output: string, onlyCategories: [string, string, string, string], throttling: {downloadThroughputKbps: number, rttMs: number, requestLatencyMs: number, cpuSlowdownMultiplier: number, uploadThroughputKbps: number, throughputKbps: number}, port}}
 */
module.exports = (port) => ({
  output: "html",
  onlyCategories: ["performance", "accessibility", "best-practices", "seo"],
  onlyAudits: [
    "first-contentful-paint",
    "largest-contentful-paint",
    "first-meaningful-paint",
    "speed-index",
    "total-blocking-time",
    "cumulative-layout-shift",
    "interactive",
  ],
  port: port
});
