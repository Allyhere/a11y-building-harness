import AxeBuilder from "@axe-core/playwright";
import { chromium } from "playwright";
import { assertAllowedUrl } from "./allowed-url.mjs";

/** WCAG 2 A/AA tags axe-core uses for 2.0–2.2. */
export const AXE_TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];

export async function createAxeRun(
  url,
  { allowRemote = false, launch } = {},
) {
  assertAllowedUrl(url, { allowRemote });
  const browser = await (launch ?? (() => chromium.launch({ headless: true })))();
  try {
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.goto(url, { waitUntil: "networkidle", timeout: 30_000 });
    const raw = await new AxeBuilder({ page }).withTags(AXE_TAGS).analyze();
    return {
      url,
      engine: raw.testEngine,
      violations: raw.violations.map((v) => ({
        id: v.id,
        impact: v.impact,
        help: v.help,
        helpUrl: v.helpUrl,
        nodes: v.nodes.length,
      })),
    };
  } finally {
    await browser.close();
  }
}

export function formatReport(result) {
  return `${JSON.stringify(result, null, 2)}\n`;
}
