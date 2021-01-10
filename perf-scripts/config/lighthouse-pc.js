/**
 * function: global lighthouse configuration
 * @param port
 * @returns {{output: string, onlyCategories: [string, string, string, string], throttling: {downloadThroughputKbps: number, rttMs: number, requestLatencyMs: number, cpuSlowdownMultiplier: number, uploadThroughputKbps: number, throughputKbps: number}, port}}
 */
module.exports = (port) => ({
  output: "html",
  preset: "desktop",
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
  port: port,
  throttling: {
    cpuSlowdownMultiplier: 0,
    rttMs: 0,
    throughputKbps: 0,
    requestLatencyMs: 0,
    downloadThroughputKbps: 0,
    uploadThroughputKbps: 0,
  },
});
