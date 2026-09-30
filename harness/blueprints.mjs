import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const dir = dirname(fileURLToPath(import.meta.url));
const cards = JSON.parse(
  readFileSync(join(dir, "blueprints.json"), "utf8"),
);

const ALIASES = {
  button: "button",
  submit: "button",
  dialog: "dialog",
  modal: "dialog",
};

export function getBlueprints(names) {
  const ids = [...new Set(names.map((n) => ALIASES[n.toLowerCase()] ?? n.toLowerCase()))];
  const found = [];
  const missing = [];
  for (const id of ids) {
    if (cards[id]) found.push(cards[id]);
    else missing.push(id);
  }
  return { found, missing };
}
