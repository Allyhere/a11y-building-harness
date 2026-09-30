#!/usr/bin/env node
/**
 * Run axe-core against a live URL in Chromium (Playwright).
 * Same engine as @axe-core/cli; not Deque's paid @axe-devtools/cli.
 *
 * Usage: node harness/verify.mjs <url>
 * Prefer: npx a11y-building-harness@0.1.0 verify [--allow-remote] <url>
 * Exit 0 = no violations; 1 = violations or error.
 */
import { createAxeRun, formatReport } from "./axe-run.mjs";

const url = process.argv[2];
if (!url) {
  console.error("Usage: a11y-building-harness verify <url>");
  process.exit(2);
}

const result = await createAxeRun(url);
process.stdout.write(formatReport(result));
process.exit(result.violations.length > 0 ? 1 : 0);
