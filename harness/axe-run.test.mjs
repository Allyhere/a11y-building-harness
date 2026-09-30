import { test } from "node:test";
import assert from "node:assert/strict";
import { createAxeRun } from "./axe-run.mjs";

test("rejected URL does not launch Chromium", async () => {
  let launched = false;
  await assert.rejects(
    () =>
      createAxeRun("file:///tmp", {
        launch: async () => {
          launched = true;
          return {};
        },
      }),
    (err) => err.code === "ERR_A11Y_URL",
  );
  assert.equal(launched, false);
});
