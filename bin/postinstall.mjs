#!/usr/bin/env node
/**
 * Runs on npm install of this package. Does not download Chromium
 * (that is ~180MB and often fails in CI). Print to stderr so MCP stdio stays clean.
 */
if (process.env.A11Y_HARNESS_SILENT_POSTINSTALL) {
  process.exit(0);
}

process.stderr.write(
  [
    "a11y-building-harness: axe scans need Playwright Chromium on this machine.",
    "  npx playwright install chromium",
    "Skip this note: A11Y_HARNESS_SILENT_POSTINSTALL=1",
    "",
  ].join("\n"),
);
