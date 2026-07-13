const { readFileSync, existsSync } = require("node:fs");
const { exit } = require("node:process");

const html = readFileSync("index.html", "utf8");
const failures = [];

function assert(condition, message) {
  if (!condition) failures.push(message);
}

function idsFromHtml(source) {
  const ids = [];
  for (const match of source.matchAll(/\sid="([^"]+)"/g)) ids.push(match[1]);
  return ids;
}

const ids = idsFromHtml(html);
const duplicates = [...new Set(ids.filter((id, index) => ids.indexOf(id) !== index))];
assert(duplicates.length === 0, `Duplicate DOM IDs: ${duplicates.join(", ")}`);

const idSet = new Set(ids);
for (const file of ["script.js", "crafting.js", "farming.js", "debug.js", "explore.js", "tabs.js"]) {
  const source = readFileSync(file, "utf8");
  for (const match of source.matchAll(/getElementById\("([^"]+)"\)/g)) {
    const id = match[1];
    if (id === "combatDebugTrigger" || id === "combatDebugPanel") continue;
    assert(idSet.has(id), `${file} references missing DOM ID #${id}`);
  }
}

for (const match of html.matchAll(/(?:src|href)="(assets\/icons\/[^"]+)"/g)) {
  assert(existsSync(match[1]), `Missing icon asset ${match[1]}`);
}

const crafting = readFileSync("crafting.js", "utf8");
[
  "hideToLeather",
  "leatherBinding",
  "ironIngot",
  "ironPickaxe",
  "ironSword",
  "ironHoe"
].forEach((recipeKey) => assert(crafting.includes(recipeKey), `Missing recipe key ${recipeKey}`));

assert(crafting.includes('type: "resource"'), "Crafting does not include resource recipe support");
assert(crafting.includes('type: "equipment"'), "Crafting does not include equipment recipe support");
assert(crafting.includes("freeCraftingEnabled()"), "Free Crafting integration is missing from crafting");

if (failures.length) {
  console.error(failures.join("\n"));
  exit(1);
}

console.log("Static checks passed.");
