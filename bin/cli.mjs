#!/usr/bin/env node
import { assertAllowedUrl, UrlNotAllowedError } from "../harness/allowed-url.mjs";

const USAGE = `Usage:
  a11y-building-harness verify [--allow-remote] <url>
  a11y-building-harness mcp
  a11y-building-harness get-blueprints <name> [name...]

verify   Run axe-core in Chromium against a live URL.
         Default: loopback http(s) only. --allow-remote for other http(s) hosts.
mcp      Start the MCP server on stdio (for Cursor / other MCP clients).
`;

function help(code) {
  process.stderr.write(USAGE);
  process.exit(code);
}

function parseVerifyArgs(rest) {
  let allowRemote = false;
  const positional = [];
  for (const arg of rest) {
    if (arg === "--allow-remote") {
      allowRemote = true;
      continue;
    }
    if (arg.startsWith("-")) {
      process.stderr.write(`Unknown option: ${arg}\n\n`);
      help(2);
    }
    positional.push(arg);
  }
  if (positional.length !== 1) {
    process.stderr.write("verify requires a URL.\n\n");
    help(2);
  }
  return { url: positional[0], allowRemote };
}

const [cmd, ...rest] = process.argv.slice(2);
if (!cmd || cmd === "-h" || cmd === "--help") {
  help(cmd ? 0 : 2);
}

if (cmd === "verify") {
  const { url, allowRemote } = parseVerifyArgs(rest);
  try {
    assertAllowedUrl(url, { allowRemote });
  } catch (err) {
    process.stderr.write(`${err instanceof Error ? err.message : err}\n`);
    process.exit(err instanceof UrlNotAllowedError ? 2 : 1);
  }
  const { createAxeRun, formatReport } = await import("../harness/axe-run.mjs");
  try {
    const result = await createAxeRun(url, { allowRemote });
    process.stdout.write(formatReport(result));
    process.exit(result.violations.length > 0 ? 1 : 0);
  } catch (err) {
    process.stderr.write(`${err instanceof Error ? err.message : err}\n`);
    if (err instanceof UrlNotAllowedError) {
      process.exit(2);
    }
    process.stderr.write(
      "If Chromium is missing, run: npx playwright install chromium\n",
    );
    process.exit(1);
  }
} else if (cmd === "mcp") {
  await import("../mcp/server.mjs");
} else if (cmd === "get-blueprints") {
  if (rest.length === 0) {
    process.stderr.write("get-blueprints requires at least one pattern name.\n\n");
    help(2);
  }
  const { getBlueprints } = await import("../harness/blueprints.mjs");
  process.stdout.write(`${JSON.stringify(getBlueprints(rest), null, 2)}\n`);
  process.exit(0);
} else {
  process.stderr.write(`Unknown command: ${cmd}\n\n`);
  help(2);
}
