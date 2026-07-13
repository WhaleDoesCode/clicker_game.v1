const { readFileSync, existsSync } = require("node:fs");
const { exit } = require("node:process");

const html = readFileSync("index.html", "utf8");
const failures = [];
function assert(condition, message) { if (!condition) failures.push(message); }
function idsFromHtml(source) { return [...source.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]); }
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
for (const match of html.matchAll(/(?:src|href)="(assets\/icons\/[^"]+)"/g)) assert(existsSync(match[1]), `Missing icon asset ${match[1]}`);
const explore = readFileSync("explore.js", "utf8");
function tableTotal(name) {
  const re = new RegExp(`${name}: \\[([\\s\\S]*?)\\n  \\]`);
  const body = explore.match(re)?.[1] || "";
  return [...body.matchAll(/weight:\s*([0-9.]+)/g)].reduce((sum, m) => sum + Number(m[1]), 0);
}
assert(tableTotal("forest") === 100, `Forest loot weights total ${tableTotal("forest")}`);
assert(tableTotal("rockyTrail") === 100, `Rocky Trail loot weights total ${tableTotal("rockyTrail")}`);
const script = readFileSync("script.js", "utf8");
["coal", "locationClues", "forestTrips", "rockyTrailTrips", "unlockedLocations", "upgrades", "furnace", "goldMiners", "ironMiners", "trailFinder", "trailVeteran", "ironworker"].forEach((key) => assert(script.includes(key), `Default normalization missing ${key}`));
assert(script.includes("legacyIron") && script.includes("delete normalized.resources.iron"), "Old resources.iron migration is not centralized/idempotent");
assert(script.includes("normalized.workers.goldMiners = normalized.miners - normalized.workers.ironMiners"), "Worker assignments are not forced within total miners");
const crafting = readFileSync("crafting.js", "utf8");
[["capacity: 1", "timeMs: 12000"], ["capacity: 2", "timeMs: 9000"], ["capacity: 5", "timeMs: 6000"]].forEach(([cap, time]) => assert(crafting.includes(cap) && crafting.includes(time), `Missing furnace config ${cap}/${time}`));
["hideToLeather", "leatherBinding", "ironPickaxe", "ironSword", "ironHoe"].forEach((recipeKey) => assert(crafting.includes(recipeKey), `Missing recipe key ${recipeKey}`));
["ironOre", "coal", "ironIngot", "sticks", "stonePebbles", "hide", "leather", "leatherBinding", "locationClues"].forEach((key) => assert((script + crafting + explore).includes(key), `Referenced resource key ${key} missing`));
assert(!crafting.includes('ironIngot: { type: "resource"'), "Instant iron ingot recipe still active");
for (const file of ["script.js", "explore.js", "crafting.js", "debug.js", "style.css", "explore.css", "crafting.css", "debug.css"]) {
  assert(new RegExp(`${file.replace('.', '\\.')}(?:\\?v=20260713-2)`).test(html), `${file} cache-busting query not updated in index.html`);
}
if (failures.length) { console.error(failures.join("\n")); exit(1); }
console.log("Static checks passed.");
