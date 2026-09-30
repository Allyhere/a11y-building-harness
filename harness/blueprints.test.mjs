import { test } from "node:test";
import assert from "node:assert/strict";
import { getBlueprints } from "./blueprints.mjs";

test("alias modal → dialog card", () => {
  const { found, missing } = getBlueprints(["modal"]);
  assert.equal(missing.length, 0);
  assert.equal(found[0].id, "dialog");
  assert.ok(found[0].must.length > 0);
});

test("unknown pattern is listed as missing", () => {
  const { found, missing } = getBlueprints(["treegrid"]);
  assert.equal(found.length, 0);
  assert.deepEqual(missing, ["treegrid"]);
});
