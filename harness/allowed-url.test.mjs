import { test } from "node:test";
import assert from "node:assert/strict";
import { assertAllowedUrl } from "./allowed-url.mjs";

function throwsUrlError(fn) {
  assert.throws(fn, (err) => err.code === "ERR_A11Y_URL");
}

test("loopback http(s) is allowed by default", () => {
  assertAllowedUrl("http://127.0.0.1:5173/");
  assertAllowedUrl("http://127.0.0.1:4173/broken");
  assertAllowedUrl("https://127.0.0.1/");
  assertAllowedUrl("http://localhost:5173/");
  assertAllowedUrl("http://[::1]:4173/");
});

test("file URL is never allowed", () => {
  throwsUrlError(() => assertAllowedUrl("file:///etc/passwd"));
  throwsUrlError(() =>
    assertAllowedUrl("file:///etc/passwd", { allowRemote: true }),
  );
});

test("non-http(s) schemes are never allowed", () => {
  throwsUrlError(() => assertAllowedUrl("ftp://127.0.0.1/"));
  throwsUrlError(() => assertAllowedUrl("javascript:alert(1)"));
});

test("public hosts require allowRemote", () => {
  throwsUrlError(() => assertAllowedUrl("http://example.com/"));
  assertAllowedUrl("http://example.com/", { allowRemote: true });
  assertAllowedUrl("https://example.com/path", { allowRemote: true });
});

test("link-local metadata hosts are never allowed", () => {
  throwsUrlError(() => assertAllowedUrl("http://169.254.169.254/"));
  throwsUrlError(() =>
    assertAllowedUrl("http://169.254.169.254/", { allowRemote: true }),
  );
  throwsUrlError(() =>
    assertAllowedUrl("http://metadata.google.internal/", {
      allowRemote: true,
    }),
  );
});

test("invalid URL is not allowed", () => {
  throwsUrlError(() => assertAllowedUrl("not a url"));
});
