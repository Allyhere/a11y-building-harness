import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { test } from "node:test";
import assert from "node:assert/strict";

const cli = fileURLToPath(new URL("./cli.mjs", import.meta.url));

function run(args) {
  return new Promise((resolve) => {
    const child = spawn(process.execPath, [cli, ...args], {
      stdio: ["ignore", "pipe", "pipe"],
    });
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (c) => {
      stdout += c;
    });
    child.stderr.on("data", (c) => {
      stderr += c;
    });
    child.on("close", (code) => resolve({ code, stdout, stderr }));
  });
}

test("cli --help exits 0", async () => {
  const { code, stderr } = await run(["--help"]);
  assert.equal(code, 0);
  assert.match(stderr, /verify \[--allow-remote\] <url>/);
});

test("cli with no args exits 2", async () => {
  const { code } = await run([]);
  assert.equal(code, 2);
});

test("cli verify without url exits 2", async () => {
  const { code, stderr } = await run(["verify"]);
  assert.equal(code, 2);
  assert.match(stderr, /requires a URL/);
});

test("cli verify file URL exits 2 without scanning", async () => {
  const { code, stderr } = await run(["verify", "file:///etc/passwd"]);
  assert.equal(code, 2);
  assert.match(stderr, /not allowed|scheme/i);
});

test("cli verify public host without --allow-remote exits 2", async () => {
  const { code, stderr } = await run(["verify", "http://example.com/"]);
  assert.equal(code, 2);
  assert.match(stderr, /allow-remote/i);
});

test("cli verify --allow-remote without url exits 2", async () => {
  const { code } = await run(["verify", "--allow-remote"]);
  assert.equal(code, 2);
});

test("cli get-blueprints modal prints dialog card", async () => {
  const { code, stdout } = await run(["get-blueprints", "modal"]);
  assert.equal(code, 0);
  const body = JSON.parse(stdout);
  assert.equal(body.found[0].id, "dialog");
});
