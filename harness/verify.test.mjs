import { spawn } from "node:child_process";
import { Socket } from "node:net";
import { fileURLToPath } from "node:url";
import { test } from "node:test";
import assert from "node:assert/strict";
import { createAxeRun } from "./axe-run.mjs";

const root = fileURLToPath(new URL("..", import.meta.url));

function waitUntilAccepts(port) {
  return new Promise((resolve, reject) => {
    const started = Date.now();
    const ping = () => {
      const socket = new Socket();
      socket.setTimeout(500);
      socket.once("connect", () => {
        socket.destroy();
        resolve();
      });
      socket.once("timeout", () => {
        socket.destroy();
        retry();
      });
      socket.once("error", () => {
        retry();
      });
      socket.connect(port, "127.0.0.1");
      function retry() {
        if (Date.now() - started > 90_000) {
          reject(new Error(`Server never accepted connections on ${port}`));
          return;
        }
        setTimeout(ping, 250);
      }
    };
    ping();
  });
}

function run(cmd, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, { cwd: root, stdio: "inherit" });
    child.on("exit", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${cmd} ${args.join(" ")} exited ${code}`));
    });
  });
}

test("axe-core against a running localhost preview: good page clean, broken page dirty", async (t) => {
  await run("npm", ["run", "build"]);
  const preview = spawn(
    "npm",
    ["run", "preview", "--", "--strictPort"],
    { cwd: root, stdio: "inherit" },
  );
  t.after(() => {
    preview.kill("SIGTERM");
  });
  await waitUntilAccepts(4173);

  const good = await createAxeRun("http://127.0.0.1:4173/");
  assert.equal(
    good.violations.length,
    0,
    `good page violations: ${JSON.stringify(good.violations, null, 2)}`,
  );

  const broken = await createAxeRun("http://127.0.0.1:4173/broken");
  const ids = broken.violations.map((v) => v.id);
  assert.ok(
    ids.includes("image-alt"),
    `expected image-alt on /broken, got ${ids.join(", ") || "(none)"}`,
  );
  assert.ok(
    ids.includes("label"),
    `expected label on /broken, got ${ids.join(", ") || "(none)"}`,
  );
});
